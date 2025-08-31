"""
Bill model for storing individual bill records
"""
from sqlalchemy import Column, String, Integer, ForeignKey, Float, Date, Boolean, Enum
from sqlalchemy.orm import relationship
from .base import BaseModel

class CustomerClass:
    """Customer classification"""
    RESIDENTIAL = 'residential'
    COMMERCIAL = 'commercial'
    INDUSTRIAL = 'industrial'

class Bill(BaseModel):
    """Bill model for individual bill records"""
    __tablename__ = 'bills'
    
    # Bill identification
    account_id = Column(String(100), nullable=False, index=True)
    bill_period = Column(String(50), nullable=False)  # e.g., "2024-01", "FY2024"
    
    # Customer information
    customer_class = Column(Enum(CustomerClass.RESIDENTIAL, CustomerClass.COMMERCIAL, CustomerClass.INDUSTRIAL),
                          nullable=False)
    
    # Consumption and billing data
    consumption = Column(Float, nullable=True)  # Usage in units (gallons, kWh, etc.)
    amount = Column(Float, nullable=False)  # Bill amount in dollars
    paid_flag = Column(Boolean, default=False, nullable=False)
    
    # Additional fields (stored as JSON for flexibility)
    additional_data = Column(String(1000), nullable=True)  # JSON string for extra fields
    
    # Foreign keys
    dataset_id = Column(Integer, ForeignKey('datasets.id'), nullable=False)
    
    # Relationships
    dataset = relationship('Dataset', back_populates='bills')
    
    def get_consumption_period(self):
        """Get consumption period as date range"""
        # This would be implemented based on your specific period format
        return self.bill_period
    
    def is_paid(self):
        """Check if bill is paid"""
        return self.paid_flag
    
    def get_payment_rate(self):
        """Calculate payment rate (paid amount / total amount)"""
        return 1.0 if self.paid_flag else 0.0 