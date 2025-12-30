from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum
from datetime import datetime


class UserRole(str, Enum):
    admin = "admin"
    evaluator = "evaluator"


# === Auth Schemas ===
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"


class TokenData(BaseModel):
    user_id: Optional[str] = None


# === User Schemas ===
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None


class UserOut(UserBase):
    id: str
    role: UserRole

    class Config:
        from_attributes = True


class UserWithProgress(UserOut):
    completed: int
    total: int


# === Case Schemas ===
class CaseBase(BaseModel):
    metadata: Optional[dict] = None


class CaseCreate(CaseBase):
    image_s3_key: str
    mask_s3_key: str


class CaseOut(BaseModel):
    id: str
    imageUrl: str
    maskUrl: str
    metadata: Optional[dict] = None

    class Config:
        from_attributes = True


# === Evaluation Schemas ===
class EvaluationCreate(BaseModel):
    case_id: str
    q1_acceptability: int  # 1-4
    q2_confidence: int     # 1-5
    comments: Optional[str] = None
    duration_ms: Optional[int] = None


class EvaluationOut(BaseModel):
    id: str
    user_id: str
    case_id: str
    q1_acceptability: int
    q2_confidence: int
    comments: Optional[str]
    duration_ms: Optional[int]
    submitted_at: datetime

    class Config:
        from_attributes = True


# === Progress Schema ===
class ProgressOut(BaseModel):
    completed: int
    total: int


# === Admin Schemas ===
class StatsOut(BaseModel):
    totalCases: int
    totalEvaluators: int
    completedEvaluations: int
    pendingEvaluations: int
