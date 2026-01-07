from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
import csv
import io
import os

from database import get_db, User, Case, Evaluation, UserRole
from schemas import UserCreate, UserWithProgress, StatsOut, CaseCreate, UserUpdate, UserOut
from auth import get_admin_user, get_password_hash

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats", response_model=StatsOut)
def get_stats(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get platform statistics"""
    total_cases = db.query(func.count(Case.id)).scalar()
    total_evaluators = db.query(func.count(User.id)).filter(
        User.role == UserRole.EVALUATOR
    ).scalar()
    completed_evaluations = db.query(func.count(Evaluation.id)).scalar()
    
    # Pending = (total_cases * total_evaluators) - completed_evaluations
    pending = (total_cases * total_evaluators) - completed_evaluations
    
    return StatsOut(
        totalCases=total_cases,
        totalEvaluators=total_evaluators,
        completedEvaluations=completed_evaluations,
        pendingEvaluations=max(0, pending)
    )


@router.get("/evaluators", response_model=list[UserWithProgress])
def get_evaluators(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Get all evaluators with their progress"""
    evaluators = db.query(User).filter(User.role == UserRole.EVALUATOR).all()
    total_cases = db.query(func.count(Case.id)).scalar()
    
    result = []
    for evaluator in evaluators:
        completed = db.query(func.count(Evaluation.id)).filter(
            Evaluation.user_id == evaluator.id
        ).scalar()
        result.append(UserWithProgress(
            id=evaluator.id,
            email=evaluator.email,
            name=evaluator.name,
            role=evaluator.role.value,
            completed=completed,
            total=total_cases
        ))
    
    return result


@router.post("/evaluators", response_model=UserWithProgress, status_code=status.HTTP_201_CREATED)
def create_evaluator(
    user_data: UserCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new evaluator account"""
    # Check if email exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        role=UserRole.EVALUATOR
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    total_cases = db.query(func.count(Case.id)).scalar()
    
    return UserWithProgress(
        id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role.value,
        completed=0,
        total=total_cases
    )


@router.delete("/evaluators/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_evaluator(
    user_id: str,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an evaluator and their progress"""
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting admins
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot delete admin accounts")
    
    # Delete associated evaluations first
    db.query(Evaluation).filter(Evaluation.user_id == user_id).delete()
    
    # Delete the user
    db.delete(user)
    db.commit()
    return None


@router.put("/evaluators/{user_id}", response_model=UserOut)
def update_evaluator(
    user_id: str,
    user_update: UserUpdate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Update an evaluator's details"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent editing admins via this endpoint (for safety)
    if user.role == UserRole.ADMIN:
        raise HTTPException(status_code=400, detail="Cannot edit admin accounts via this endpoint")

    # If email is being changed, check uniqueness
    if user_update.email and user_update.email != user.email:
        existing = db.query(User).filter(User.email == user_update.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        user.email = user_update.email

    if user_update.name:
        user.name = user_update.name
    
    db.commit()
    db.refresh(user)
    return user


@router.post("/cases", status_code=status.HTTP_201_CREATED)
def create_case(
    case_data: CaseCreate,
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new case"""
    new_case = Case(
        image_s3_key=case_data.image_s3_key,
        mask_s3_key=case_data.mask_s3_key,
        case_metadata=case_data.metadata
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return {"id": new_case.id, "message": "Case created successfully"}


@router.get("/export")
def export_evaluations(
    admin: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """Export all evaluations as CSV"""
    evaluations = db.query(Evaluation).join(User).join(Case).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "evaluation_id",
        "user_id",
        "user_email",
        "user_name",
        "case_id",
        "q1_acceptability",
        "q2_confidence",
        "comments",
        "duration_ms",
        "submitted_at"
    ])
    
    # Data
    for eval in evaluations:
        # Determine case identifier
        case_id_display = eval.case_id
        if eval.case.case_metadata and "filename" in eval.case.case_metadata:
            # Use filename without extension
            filename = eval.case.case_metadata["filename"]
            case_id_display = os.path.splitext(filename)[0]

        writer.writerow([
            eval.id,
            eval.user_id,
            eval.user.email,
            eval.user.name,
            case_id_display,
            eval.q1_acceptability,
            eval.q2_confidence,
            eval.comments or "",
            eval.duration_ms or "",
            eval.submitted_at.isoformat() if eval.submitted_at else ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=evaluaciones.csv"}
    )
