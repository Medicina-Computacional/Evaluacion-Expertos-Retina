
import os
import sys
from sqlalchemy.orm import Session
from database import SessionLocal, init_db, Case, engine, User, UserRole
from auth import get_password_hash

def populate_database():
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    
    try:
        # Define paths
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        database_dir = os.path.join(base_dir, "database")
        original_dir = os.path.join(database_dir, "original_imgs")
        overlay_dir = os.path.join(database_dir, "overlay_imgs")
        
        if not os.path.exists(original_dir) or not os.path.exists(overlay_dir):
            print(f"Error: Directories not found at {original_dir} or {overlay_dir}")
            return

        print("Clearing existing cases...")
        # Clear existing cases
        db.query(Case).delete()
        db.commit()
        
        # Create Admin User
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
            cases_created += 1  # Just to track activity
        else:
            print("Admin user already exists")

        # Create Sample Evaluator
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
        else:
            print("Evaluator user already exists")

        db.commit()

        print("Scanning for image pairs...")
        
        # Iterate through original images
        for filename in os.listdir(original_dir):
            if filename.startswith('.'):
                continue
                
            if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tif', '.tiff')):
                continue
            
            # Construct expected overlay filename
            # Assumption: overlay filename matches original but in overlay folder
            # The user requirement said: "images can be matched by using the same file name as found in 'original' with the _overlay added in the 'overlay' folder."
            # Example: image.jpg -> image_overlay.jpg
            
            name, ext = os.path.splitext(filename)
            overlay_filename = f"{name}_overlay{ext}"
            
            original_path = os.path.join(original_dir, filename)
            overlay_path = os.path.join(overlay_dir, overlay_filename)
            
            if os.path.exists(overlay_path):
                # Paths relative to the 'database' directory which is mounted as static
                # API will serve them as /static/original_imgs/file.jpg
                
                new_case = Case(
                    image_s3_key=f"original_imgs/{filename}",
                    mask_s3_key=f"overlay_imgs/{overlay_filename}",
                    case_metadata={"filename": filename}
                )
                db.add(new_case)
                cases_created += 1
            else:
                print(f"Warning: No overlay found for {filename} (expected {overlay_filename})")
        
        db.commit()
        print(f"Successfully created {cases_created} cases.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    populate_database()
