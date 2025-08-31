"""
Audit model for tracking user actions and system events
"""
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class AuditAction:
    """Audit action types"""
    LOGIN = 'login'
    LOGOUT = 'logout'
    UPLOAD = 'upload'
    FORECAST_RUN = 'forecast_run'
    RATE_OPTIMIZE = 'rate_optimize'
    USER_CREATE = 'user_create'
    USER_UPDATE = 'user_update'
    USER_DELETE = 'user_delete'
    DATA_EXPORT = 'data_export'
    SYSTEM_CONFIG = 'system_config'

class Audit(BaseModel):
    """Audit model for tracking user actions"""
    __tablename__ = 'audit'
    
    # Audit information
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=True)  # dataset, forecast, user, etc.
    resource_id = Column(String(100), nullable=True)  # ID of the affected resource
    description = Column(Text, nullable=True)
    
    # Additional data (stored as JSON)
    payload_json = Column(JSON, nullable=True)  # Additional context data
    
    # IP address and user agent
    ip_address = Column(String(45), nullable=True)  # IPv6 compatible
    user_agent = Column(String(500), nullable=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Null for system events
    
    # Relationships
    user = relationship('User', back_populates='audit_entries')
    
    def get_summary(self):
        """Get audit entry summary"""
        return {
            'action': self.action,
            'resource': f"{self.resource_type}:{self.resource_id}" if self.resource_type and self.resource_id else None,
            'user_email': self.user.email if self.user else 'System',
            'timestamp': self.created_at.isoformat(),
            'description': self.description
        }
    
    @classmethod
    def log_action(cls, db_session, action, user_id=None, resource_type=None, 
                   resource_id=None, description=None, payload=None, 
                   ip_address=None, user_agent=None):
        """Convenience method to log an audit action"""
        audit_entry = cls(
            action=action,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            description=description,
            payload_json=payload,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db_session.add(audit_entry)
        db_session.commit()
        return audit_entry 