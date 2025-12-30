from sqlalchemy import create_engine, Column, String, Integer, Text, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
import enum
import uuid
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./evaluation.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    EVALUATOR = "evaluator"


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255))
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.EVALUATOR, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    evaluations = relationship("Evaluation", back_populates="user")


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    image_s3_key = Column(String(255), nullable=False)
    mask_s3_key = Column(String(255), nullable=False)
    case_metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    evaluations = relationship("Evaluation", back_populates="case")


class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False)
    q1_acceptability = Column(Integer, nullable=False)  # 1-4
    q2_confidence = Column(Integer, nullable=False)     # 1-5
    comments = Column(Text)
    duration_ms = Column(Integer)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="evaluations")
    case = relationship("Case", back_populates="evaluations")


# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)
