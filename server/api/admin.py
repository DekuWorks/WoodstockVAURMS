"""
Admin API endpoints
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app import db
from models.user import User, UserRole
from models.audit import Audit

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/audit', methods=['GET'])
@jwt_required()
def get_audit_log():
    """Get audit log (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Get audit entries
        audit_entries = Audit.query.order_by(Audit.created_at.desc()).limit(100).all()
        
        return jsonify([{
            'id': entry.id,
            'action': entry.action,
            'user_email': entry.user.email if entry.user else 'System',
            'timestamp': entry.created_at.isoformat(),
            'description': entry.description,
            'ip_address': entry.ip_address
        } for entry in audit_entries]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    """Get job statuses (admin only)"""
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            return jsonify({'error': 'Admin access required'}), 403
        
        # Mock job statuses
        jobs = [
            {'id': 1, 'type': 'data_import', 'status': 'completed', 'created_at': '2024-01-15T10:30:00Z'},
            {'id': 2, 'type': 'forecast_run', 'status': 'running', 'created_at': '2024-01-15T11:00:00Z'},
            {'id': 3, 'type': 'rate_optimization', 'status': 'pending', 'created_at': '2024-01-15T11:15:00Z'}
        ]
        
        return jsonify(jobs), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 