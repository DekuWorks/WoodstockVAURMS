"""
Dataset model for storing uploaded data files
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Enum, JSON, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class DatasetStatus:
    """Dataset processing status"""
    UPLOADED = 'uploaded'
    PROCESSING = 'processing'
    VALIDATED = 'validated'
    ERROR = 'error'
    ACTIVE = 'active'

class Dataset(BaseModel):
    """Dataset model for uploaded data files"""
    __tablename__ = 'datasets'
    
    name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)
    file_type = Column(String(50), nullable=False)  # csv, xlsx, xls
    status = Column(Enum(DatasetStatus.UPLOADED, DatasetStatus.PROCESSING, 
                        DatasetStatus.VALIDATED, DatasetStatus.ERROR, DatasetStatus.ACTIVE),
                   default=DatasetStatus.UPLOADED, nullable=False)
    
    # Schema and validation info
    schema_info = Column(JSON, nullable=True)  # Column names, types, validation rules
    validation_errors = Column(JSON, nullable=True)  # Any validation issues found
    row_count = Column(Integer, nullable=True)
    
    # Metadata
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Foreign keys
    uploaded_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    uploaded_by_user = relationship('User', back_populates='datasets')
    bills = relationship('Bill', back_populates='dataset')
    forecasts = relationship('Forecast', back_populates='dataset')
    
    def is_active(self):
        """Check if dataset is active baseline"""
        return self.status == DatasetStatus.ACTIVE
    
    def get_schema_summary(self):
        """Get summary of dataset schema"""
        if not self.schema_info:
            return None
        
        return {
            'columns': len(self.schema_info.get('columns', [])),
            'row_count': self.row_count,
            'file_size_mb': round(self.file_size / (1024 * 1024), 2) if self.file_size else None
        } 