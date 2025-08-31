/**
 * Login functionality for VAURMS
 * Handles form submission, validation, and authentication
 */

'use strict';

import { api, setToken } from '../api/client.js';
import { getRedirectUrl } from './guard.js';

/**
 * Initialize login functionality
 */
function init() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add demo credential fillers
    setupDemoCredentials();
    
    // Check if user is already logged in
    checkExistingAuth();
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const remember = form.remember.checked;
    
    const loginBtn = document.getElementById('loginBtn');
    const originalText = loginBtn.textContent;
    
    try {
        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="loading"></span> Signing in...';
        
        // Clear previous errors
        clearErrors();
        
        // Validate inputs
        if (!validateForm(email, password)) {
            return;
        }
        
        // Attempt login
        const response = await api('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        
        // Store token
        setToken(response.token);
        
        // Store user info if remember is checked
        if (remember) {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Show success message
        showSuccess('Login successful! Redirecting...');
        
        // Redirect to intended page or dashboard
        setTimeout(() => {
            const redirectUrl = getRedirectUrl();
            window.location.href = redirectUrl;
        }, 1000);
        
    } catch (error) {
        console.error('Login failed:', error);
        
        // Show error message
        showError(error.message || 'Login failed. Please check your credentials.');
        
        // Reset button
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
}

/**
 * Validate login form
 * @param {string} email - Email address
 * @param {string} password - Password
 * @returns {boolean} Validation result
 */
function validateForm(email, password) {
    let isValid = true;
    
    // Validate email
    if (!email) {
        showFieldError('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showFieldError('password', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Check if email is valid
 * @param {string} email - Email to validate
 * @returns {boolean} Email validity
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Show field-specific error
 * @param {string} fieldName - Field name
 * @param {string} message - Error message
 */
function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorDiv = document.createElement('div');
    
    errorDiv.className = 'form__error';
    errorDiv.textContent = message;
    
    field.classList.add('form__input--error');
    field.parentNode.appendChild(errorDiv);
}

/**
 * Clear all form errors
 */
function clearErrors() {
    // Remove error classes
    document.querySelectorAll('.form__input--error').forEach(field => {
        field.classList.remove('form__input--error');
    });
    
    // Remove error messages
    document.querySelectorAll('.form__error').forEach(error => {
        error.remove();
    });
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert--success';
    alert.textContent = message;
    
    const container = document.querySelector('.login-container');
    container.insertBefore(alert, container.firstChild);
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert--error';
    alert.textContent = message;
    
    const container = document.querySelector('.login-container');
    container.insertBefore(alert, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

/**
 * Setup demo credential fillers
 */
function setupDemoCredentials() {
    const demoItems = document.querySelectorAll('.demo-credentials__item');
    
    demoItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            const text = item.textContent;
            const [email, password] = text.split('/').map(s => s.trim());
            
            document.getElementById('email').value = email;
            document.getElementById('password').value = password;
            
            // Show feedback
            item.style.backgroundColor = 'var(--color-success)';
            item.style.color = 'white';
            item.style.padding = 'var(--spacing-2)';
            item.style.borderRadius = 'var(--radius-sm)';
            
            setTimeout(() => {
                item.style.backgroundColor = '';
                item.style.color = '';
                item.style.padding = '';
                item.style.borderRadius = '';
            }, 2000);
        });
    });
}

/**
 * Check if user is already authenticated
 */
function checkExistingAuth() {
    const token = localStorage.getItem('jwt');
    if (token) {
        // User is already logged in, redirect to dashboard
        const redirectUrl = getRedirectUrl();
        window.location.href = redirectUrl;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 