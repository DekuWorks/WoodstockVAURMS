#!/usr/bin/env python3
"""
Development server for VAURMS
"""
import os
import sys
from pathlib import Path

# Add the server directory to Python path
server_path = Path(__file__).parent / 'server'
sys.path.insert(0, str(server_path))

from app import app, db
from models.user import User, UserRole
from models.dataset import Dataset, DatasetStatus
from models.bill import Bill, CustomerClass
from models.forecast import Forecast, Assumption
from models.rate import RateStructure
from models.audit import Audit, AuditAction

def create_sample_data():
    """Create sample data for development"""
    try:
        # Create admin user if it doesn't exist
        admin_user = User.query.filter_by(email='admin@vaurms.com').first()
        if not admin_user:
            admin_user = User(
                email='admin@vaurms.com',
                role=UserRole.ADMIN,
                first_name='Admin',
                last_name='User'
            )
            admin_user.set_password('admin123')
            db.session.add(admin_user)
        
        # Create analyst user
        analyst_user = User.query.filter_by(email='analyst@vaurms.com').first()
        if not analyst_user:
            analyst_user = User(
                email='analyst@vaurms.com',
                role=UserRole.ANALYST,
                first_name='Analyst',
                last_name='User'
            )
            analyst_user.set_password('analyst123')
            db.session.add(analyst_user)
        
        # Create viewer user
        viewer_user = User.query.filter_by(email='viewer@vaurms.com').first()
        if not viewer_user:
            viewer_user = User(
                email='viewer@vaurms.com',
                role=UserRole.VIEWER,
                first_name='Viewer',
                last_name='User'
            )
            viewer_user.set_password('viewer123')
            db.session.add(viewer_user)
        
        db.session.commit()
        print("Sample users created successfully!")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
        db.session.rollback()

if __name__ == '__main__':
    with app.app_context():
        # Create database tables
        db.create_all()
        
        # Create sample data
        create_sample_data()
    
    # Run the development server
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=True,
        use_reloader=True
    ) 