"""
Forecast and Assumption models for financial forecasting
"""
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class Forecast(BaseModel):
    """Forecast model for financial projections"""
    __tablename__ = 'forecasts'
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Forecast parameters and results
    assumptions_id = Column(Integer, ForeignKey('assumptions.id'), nullable=False)
    results_json = Column(JSON, nullable=True)  # Forecast results by year
    
    # Metadata
    forecast_period = Column(String(50), nullable=False)  # e.g., "FY2024-FY2028"
    status = Column(String(50), default='completed', nullable=False)  # running, completed, error
    
    # Foreign keys
    dataset_id = Column(Integer, ForeignKey('datasets.id'), nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    dataset = relationship('Dataset', back_populates='forecasts')
    created_by_user = relationship('User', back_populates='forecasts')
    assumptions = relationship('Assumption')
    
    def get_results_summary(self):
        """Get summary of forecast results"""
        if not self.results_json:
            return None
        
        results = self.results_json
        return {
            'total_revenue': sum(r.get('revenue', 0) for r in results),
            'total_opex': sum(r.get('opex', 0) for r in results),
            'total_capex': sum(r.get('capex', 0) for r in results),
            'ending_fund_balance': results[-1].get('ending_fund', 0) if results else 0,
            'years_forecasted': len(results)
        }

class Assumption(BaseModel):
    """Assumption model for forecast parameters"""
    __tablename__ = 'assumptions'
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Assumption parameters (stored as JSON for flexibility)
    parameters_json = Column(JSON, nullable=False)  # Growth rates, inflation, etc.
    
    # Foreign keys
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    created_by_user = relationship('User')
    forecasts = relationship('Forecast', back_populates='assumptions')
    
    def get_parameter(self, key, default=None):
        """Get a specific parameter value"""
        return self.parameters_json.get(key, default)
    
    def set_parameter(self, key, value):
        """Set a parameter value"""
        if not self.parameters_json:
            self.parameters_json = {}
        self.parameters_json[key] = value 