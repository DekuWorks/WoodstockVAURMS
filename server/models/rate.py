"""
Rate structure models for rate modeling and optimization
"""
from sqlalchemy import Column, String, Integer, ForeignKey, JSON, Text, Float
from sqlalchemy.orm import relationship
from .base import BaseModel

class RateStructure(BaseModel):
    """Rate structure model for rate modeling and optimization"""
    __tablename__ = 'rate_structures'
    
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Rate structure definition
    structure_json = Column(JSON, nullable=False)  # Rate tiers, fixed charges, etc.
    
    # Optimization results
    optimization_results = Column(JSON, nullable=True)  # Optimization outcomes
    bill_impacts = Column(JSON, nullable=True)  # Impact on customer bills
    
    # Metadata
    is_active = Column(String(50), default='draft', nullable=False)  # draft, active, archived
    effective_date = Column(String(50), nullable=True)  # When this structure takes effect
    
    # Foreign keys
    created_by = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Relationships
    created_by_user = relationship('User', back_populates='rate_structures')
    
    def get_structure_summary(self):
        """Get summary of rate structure"""
        if not self.structure_json:
            return None
        
        structure = self.structure_json
        return {
            'fixed_charge': structure.get('fixed_charge', 0),
            'tier_count': len(structure.get('tiers', [])),
            'base_rate': structure.get('base_rate', 0),
            'structure_type': structure.get('type', 'unknown')
        }
    
    def calculate_bill(self, consumption):
        """Calculate bill for given consumption"""
        if not self.structure_json:
            return 0
        
        structure = self.structure_json
        fixed_charge = structure.get('fixed_charge', 0)
        tiers = structure.get('tiers', [])
        
        total_charge = fixed_charge
        remaining_consumption = consumption
        
        for tier in tiers:
            tier_limit = tier.get('up_to', float('inf'))
            tier_rate = tier.get('price', 0)
            
            if remaining_consumption <= 0:
                break
            
            tier_consumption = min(remaining_consumption, tier_limit)
            total_charge += tier_consumption * tier_rate
            remaining_consumption -= tier_consumption
        
        return total_charge
    
    def get_optimization_summary(self):
        """Get summary of optimization results"""
        if not self.optimization_results:
            return None
        
        results = self.optimization_results
        return {
            'coverage_ratio': results.get('coverage_ratio', 0),
            'reserve_balance': results.get('reserve_balance', 0),
            'affordability_score': results.get('affordability_score', 0),
            'constraints_satisfied': results.get('constraints_satisfied', False)
        } 