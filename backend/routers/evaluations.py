from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import os

from database import get_db, User, Case, Evaluation
from schemas import EvaluationCreate, EvaluationOut, CaseOut, ProgressOut
from auth import get_current_user

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

# S3 base URL (or local static URL for dev)
# In production, Nginx serves /static; in dev with backend on :8000, use full URL
S3_BASE_URL = os.getenv("S3_BASE_URL", "/static")


@router.get("/next-case", response_model=Optional[CaseOut])
def get_next_case(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the next unevaluated case for the current user"""
    # Get IDs of cases already evaluated by this user
    evaluated_case_ids = db.query(Evaluation.case_id).filter(
        Evaluation.user_id == current_user.id
    ).subquery()
    
    # Find a case not yet evaluated
    next_case = db.query(Case).filter(
        ~Case.id.in_(evaluated_case_ids)
    ).order_by(func.random()).first()
    
    if not next_case:
        return None
    
    return CaseOut(
        id=next_case.id,
        imageUrl=f"{S3_BASE_URL}/{next_case.image_s3_key}",
        maskUrl=f"{S3_BASE_URL}/{next_case.mask_s3_key}",
        metadata=next_case.case_metadata
    )


@router.get("/progress", response_model=ProgressOut)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get evaluation progress for current user"""
    completed = db.query(func.count(Evaluation.id)).filter(
        Evaluation.user_id == current_user.id
    ).scalar()
    
    total = db.query(func.count(Case.id)).scalar()
    
    return ProgressOut(completed=completed, total=total)


@router.post("", response_model=EvaluationOut, status_code=status.HTTP_201_CREATED)
def submit_evaluation(
    evaluation: EvaluationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit an evaluation for a case"""
    # Validate case exists
    case = db.query(Case).filter(Case.id == evaluation.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check if already evaluated
    existing = db.query(Evaluation).filter(
        Evaluation.user_id == current_user.id,
        Evaluation.case_id == evaluation.case_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Case already evaluated")
    
    # Validate scores
    if not (1 <= evaluation.q1_acceptability <= 4):
        raise HTTPException(status_code=400, detail="Q1 must be between 1 and 4")
    if not (1 <= evaluation.q2_confidence <= 5):
        raise HTTPException(status_code=400, detail="Q2 must be between 1 and 5")
    
    # Create evaluation
    new_eval = Evaluation(
        user_id=current_user.id,
        case_id=evaluation.case_id,
        q1_acceptability=evaluation.q1_acceptability,
        q2_confidence=evaluation.q2_confidence,
        comments=evaluation.comments,
        duration_ms=evaluation.duration_ms
    )
    db.add(new_eval)
    db.commit()
    db.refresh(new_eval)
    
    return new_eval
