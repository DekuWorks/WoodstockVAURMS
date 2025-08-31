"""
Forecast API endpoints
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

forecast_bp = Blueprint('forecast', __name__)

@forecast_bp.route('/run', methods=['POST'])
@jwt_required()
def run_forecast():
    """Run financial forecast"""
    try:
        data = request.get_json()
        
        # Mock forecast results
        forecast_results = [
            {'year': 2024, 'revenue': 2500000, 'opex': 1800000, 'capex': 500000, 'ending_fund': 200000},
            {'year': 2025, 'revenue': 2625000, 'opex': 1890000, 'capex': 525000, 'ending_fund': 210000},
            {'year': 2026, 'revenue': 2756250, 'opex': 1984500, 'capex': 551250, 'ending_fund': 220500}
        ]
        
        return jsonify({
            'forecast_id': 1,
            'results': forecast_results
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 