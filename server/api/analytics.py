"""
Analytics API endpoints
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, and_
from datetime import datetime, timedelta

from app import db
from models.user import User
from models.bill import Bill, CustomerClass
from models.dataset import Dataset, DatasetStatus

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/kpis', methods=['GET'])
@jwt_required()
def get_kpis():
    """Get key performance indicators"""
    try:
        # Get active dataset
        active_dataset = Dataset.query.filter_by(status=DatasetStatus.ACTIVE).first()
        if not active_dataset:
            return jsonify(get_mock_kpis()), 200
        
        # Calculate KPIs from bills
        bills = Bill.query.filter_by(dataset_id=active_dataset.id).all()
        
        if not bills:
            return jsonify(get_mock_kpis()), 200
        
        # Calculate totals
        total_revenue = sum(bill.amount for bill in bills)
        total_paid = sum(bill.amount for bill in bills if bill.paid_flag)
        customer_count = len(set(bill.account_id for bill in bills))
        collection_rate = (total_paid / total_revenue * 100) if total_revenue > 0 else 0
        
        # Mock coverage ratio (would be calculated from financial data)
        coverage_ratio = 1.15
        
        # Mock changes (would be calculated from historical data)
        revenue_change = 5.2
        collection_change = 1.8
        customer_change = 2.1
        coverage_change = 0.0
        
        return jsonify({
            'total_revenue': total_revenue,
            'collection_rate': round(collection_rate, 1),
            'customer_count': customer_count,
            'coverage_ratio': coverage_ratio,
            'revenue_change': revenue_change,
            'collection_change': collection_change,
            'customer_change': customer_change,
            'coverage_change': coverage_change
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/trends', methods=['GET'])
@jwt_required()
def get_trends():
    """Get trend data for specified metric"""
    try:
        metric = request.args.get('metric', 'revenue')
        
        if metric == 'revenue':
            # Mock revenue trend data
            return jsonify({
                'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'data': [210000, 215000, 220000, 225000, 230000, 235000]
            }), 200
        elif metric == 'consumption':
            # Mock consumption trend data
            return jsonify({
                'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'data': [45000, 48000, 52000, 49000, 55000, 58000]
            }), 200
        else:
            return jsonify({'error': 'Invalid metric'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analytics_bp.route('/cohorts', methods=['GET'])
@jwt_required()
def get_cohorts():
    """Get cohort analysis data"""
    try:
        customer_class = request.args.get('class', 'residential')
        
        if customer_class == 'residential':
            return jsonify({
                'labels': ['Residential', 'Commercial', 'Industrial'],
                'data': [65, 25, 10]
            }), 200
        elif customer_class == 'commercial':
            return jsonify({
                'labels': ['Small Business', 'Medium Business', 'Large Business'],
                'data': [40, 35, 25]
            }), 200
        else:
            return jsonify({'error': 'Invalid customer class'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_mock_kpis():
    """Return mock KPI data for demo purposes"""
    return {
        'total_revenue': 2450000,
        'collection_rate': 94.2,
        'customer_count': 12500,
        'coverage_ratio': 1.15,
        'revenue_change': 5.2,
        'collection_change': 1.8,
        'customer_change': 2.1,
        'coverage_change': 0.0
    } 