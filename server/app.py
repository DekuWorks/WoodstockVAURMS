"""
Main Flask application for VAURMS
"""
import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Import configuration
from config.settings import Config

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__, static_folder='../public', static_url_path='')
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from api.auth import auth_bp
    from api.users import users_bp
    from api.datasets import datasets_bp
    from api.analytics import analytics_bp
    from api.forecast import forecast_bp
    from api.rates import rates_bp
    from api.reports import reports_bp
    from api.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(datasets_bp, url_prefix='/api/datasets')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(forecast_bp, url_prefix='/api/forecast')
    app.register_blueprint(rates_bp, url_prefix='/api/rates')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Serve static files
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')
    
    @app.route('/<path:path>')
    def static_files(path):
        return send_from_directory(app.static_folder, path)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {'error': 'Internal server error'}, 500
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    app.run(debug=True) 