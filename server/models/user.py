"""
User model for authentication and authorization
"""
from sqlalchemy import Column, String, Enum, Boolean
from sqlalchemy.orm import relationship
import bcrypt
from .base import BaseModel

class UserRole:
    """User roles enumeration"""
    ADMIN = 'admin'
    ANALYST = 'analyst'
    VIEWER = 'viewer'

class User(BaseModel):
    """User model with role-based access control"""
    __tablename__ = 'users'
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER), 
                  default=UserRole.VIEWER, nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Relationships
    datasets = relationship('Dataset', back_populates='uploaded_by_user')
    forecasts = relationship('Forecast', back_populates='created_by_user')
    rate_structures = relationship('RateStructure', back_populates='created_by_user')
    audit_entries = relationship('Audit', back_populates='user')
    
    def set_password(self, password):
        """Hash and set password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Check if password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def has_permission(self, required_role):
        """Check if user has required role permission"""
        role_hierarchy = {
            UserRole.VIEWER: 1,
            UserRole.ANALYST: 2,
            UserRole.ADMIN: 3
        }
        return role_hierarchy.get(self.role, 0) >= role_hierarchy.get(required_role, 0)
    
    def to_dict(self):
        """Convert to dictionary excluding sensitive data"""
        data = super().to_dict()
        data.pop('password_hash', None)
        return data 