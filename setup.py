#!/usr/bin/env python3
"""
Setup script for VAURMS
"""
import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def create_env_file():
    """Create .env file from template"""
    env_file = Path('.env')
    if not env_file.exists():
        print("Creating .env file...")
        env_content = """# VAURMS Environment Configuration

# Flask Configuration
FLASK_ENV=development
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-key-change-in-production

# Database Configuration
DATABASE_URL=sqlite:///vaurms.db

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=104857600

# Logging
LOG_LEVEL=INFO
"""
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✓ .env file created")
    else:
        print("✓ .env file already exists")

def main():
    """Main setup function"""
    print("VAURMS Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("✗ Python 3.8 or higher is required")
        sys.exit(1)
    
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Create virtual environment
    venv_path = Path('venv')
    if not venv_path.exists():
        print("Creating virtual environment...")
        if not run_command('python -m venv venv', 'Creating virtual environment'):
            sys.exit(1)
    else:
        print("✓ Virtual environment already exists")
    
    # Determine activation command
    if os.name == 'nt':  # Windows
        activate_cmd = 'venv\\Scripts\\activate'
        pip_cmd = 'venv\\Scripts\\pip'
        python_cmd = 'venv\\Scripts\\python'
    else:  # Unix/Linux/macOS
        activate_cmd = 'source venv/bin/activate'
        pip_cmd = 'venv/bin/pip'
        python_cmd = 'venv/bin/python'
    
    # Install dependencies
    print("Installing dependencies...")
    if not run_command(f'{pip_cmd} install -r requirements.txt', 'Installing Python dependencies'):
        sys.exit(1)
    
    # Create .env file
    create_env_file()
    
    # Create uploads directory
    uploads_dir = Path('uploads')
    uploads_dir.mkdir(exist_ok=True)
    print("✓ Uploads directory created")
    
    # Initialize database
    print("Initializing database...")
    if not run_command(f'{python_cmd} run.py --init-db', 'Initializing database'):
        print("Note: Database will be initialized when you first run the application")
    
    print("\n" + "=" * 50)
    print("Setup completed successfully!")
    print("\nTo start the application:")
    print("1. Activate the virtual environment:")
    if os.name == 'nt':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    print("2. Run the application:")
    print("   python run.py")
    print("\nThe application will be available at: http://localhost:5000")
    print("\nDemo credentials:")
    print("- Admin: admin@vaurms.com / admin123")
    print("- Analyst: analyst@vaurms.com / analyst123")
    print("- Viewer: viewer@vaurms.com / viewer123")

if __name__ == '__main__':
    main() 