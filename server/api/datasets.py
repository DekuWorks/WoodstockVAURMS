"""
Datasets API endpoints
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename

from app import db
from models.user import User
from models.dataset import Dataset, DatasetStatus

datasets_bp = Blueprint('datasets', __name__)

@datasets_bp.route('/', methods=['GET'])
@jwt_required()
def get_datasets():
    """Get list of datasets"""
    try:
        datasets = Dataset.query.order_by(Dataset.created_at.desc()).all()
        return jsonify([{
            'id': dataset.id,
            'name': dataset.name,
            'status': dataset.status,
            'file_size': dataset.file_size,
            'file_type': dataset.file_type,
            'row_count': dataset.row_count,
            'created_at': dataset.created_at.isoformat(),
            'uploaded_by': dataset.uploaded_by_user.email if dataset.uploaded_by_user else None
        } for dataset in datasets]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@datasets_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_dataset():
    """Upload new dataset"""
    try:
        current_user_id = get_jwt_identity()
        
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'csv', 'xlsx', 'xls'}
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        file_path = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(file_path)
        
        # Create dataset record
        dataset = Dataset(
            name=filename,
            file_path=file_path,
            file_size=os.path.getsize(file_path),
            file_type=file_ext,
            status=DatasetStatus.UPLOADED,
            uploaded_by=current_user_id
        )
        
        db.session.add(dataset)
        db.session.commit()
        
        return jsonify({
            'id': dataset.id,
            'name': dataset.name,
            'status': dataset.status,
            'message': 'File uploaded successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@datasets_bp.route('/<int:dataset_id>/profile', methods=['GET'])
@jwt_required()
def get_dataset_profile(dataset_id):
    """Get dataset profile information"""
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        
        return jsonify({
            'id': dataset.id,
            'name': dataset.name,
            'status': dataset.status,
            'file_size': dataset.file_size,
            'file_type': dataset.file_type,
            'row_count': dataset.row_count,
            'schema_info': dataset.schema_info,
            'validation_errors': dataset.validation_errors,
            'created_at': dataset.created_at.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@datasets_bp.route('/<int:dataset_id>/commit', methods=['POST'])
@jwt_required()
def commit_dataset(dataset_id):
    """Mark dataset as active baseline"""
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        
        # Deactivate other datasets
        Dataset.query.filter_by(status=DatasetStatus.ACTIVE).update({
            'status': DatasetStatus.VALIDATED
        })
        
        # Activate this dataset
        dataset.status = DatasetStatus.ACTIVE
        db.session.commit()
        
        return jsonify({
            'message': 'Dataset activated successfully',
            'dataset_id': dataset.id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 