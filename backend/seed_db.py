"""
Script to seed the database with an admin user and sample data for development.
Run with: python seed_db.py
"""
from database import SessionLocal, init_db, User, Case, UserRole
from auth import get_password_hash
import os

def seed_database():
    # Initialize database tables
    init_db()
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            print("Creating admin user...")
            admin = User(
                email="admin@example.com",
                name="Administrador",
                password_hash=get_password_hash("admin123"),
                role=UserRole.ADMIN
            )
            db.add(admin)
            db.commit()
            print("✓ Admin user created (admin@example.com / admin123)")
        else:
            print("Admin user already exists")
        
        # Create sample evaluator
        evaluator = db.query(User).filter(User.email == "evaluador@example.com").first()
        if not evaluator:
            print("Creating sample evaluator...")
            evaluator = User(
                email="evaluador@example.com",
                name="Dr. Juan Pérez",
                password_hash=get_password_hash("eval123"),
                role=UserRole.EVALUATOR
            )
            db.add(evaluator)
            db.commit()
            print("✓ Sample evaluator created (evaluador@example.com / eval123)")
        
        # Create sample cases (these would normally be real images in S3)
        existing_cases = db.query(Case).count()
        if existing_cases == 0:
            print("Creating sample cases...")
            sample_cases = [
                {"image_s3_key": "cases/case_001.png", "mask_s3_key": "cases/case_001_mask.png", "case_metadata": {"dr_grade": 2}},
                {"image_s3_key": "cases/case_002.png", "mask_s3_key": "cases/case_002_mask.png", "case_metadata": {"dr_grade": 1}},
                {"image_s3_key": "cases/case_003.png", "mask_s3_key": "cases/case_003_mask.png", "case_metadata": {"dr_grade": 3}},
                {"image_s3_key": "cases/case_004.png", "mask_s3_key": "cases/case_004_mask.png", "case_metadata": {"dr_grade": 2}},
                {"image_s3_key": "cases/case_005.png", "mask_s3_key": "cases/case_005_mask.png", "case_metadata": {"dr_grade": 1}},
            ]
            for case_data in sample_cases:
                case = Case(**case_data)
                db.add(case)
            db.commit()
            print(f"✓ Created {len(sample_cases)} sample cases")
        
        print("\n✓ Database seeding complete!")
        print("\nTest Credentials:")
        print("  Admin: admin@example.com / admin123")
        print("  Evaluator: evaluador@example.com / eval123")
        
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
