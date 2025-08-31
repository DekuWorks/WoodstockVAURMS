/**
 * Main JavaScript file for VAURMS
 * Handles authentication, navigation, and application initialization
 */

'use strict';

import { api, setToken, getToken } from './api/client.js';
import { checkAuth, redirectToLogin } from './auth/guard.js';

// Application state
const app = {
    user: null,
    isAuthenticated: false,
    currentPage: window.location.pathname
};

/**
 * Initialize the application
 */
async function init() {
    try {
        // Check authentication status
        const token = getToken();
        if (token) {
            await checkAuthStatus();
        } else {
            // Redirect to login if no token and not on login page
            if (app.currentPage !== '/login.html' && app.currentPage !== '/') {
                redirectToLogin();
                return;
            }
        }

        // Setup event listeners
        setupEventListeners();
        
        // Load page-specific functionality
        loadPageScripts();
        
    } catch (error) {
        console.error('Application initialization failed:', error);
        showError('Failed to initialize application');
    }
}

/**
 * Check authentication status with the server
 */
async function checkAuthStatus() {
    try {
        const response = await api('/auth/me');
        app.user = response;
        app.isAuthenticated = true;
        
        // Update UI with user information
        updateUserInterface();
        
    } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear invalid token
        setToken(null);
        redirectToLogin();
    }
}

/**
 * Update the user interface with current user information
 */
function updateUserInterface() {
    const userNameElement = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userNameElement && app.user) {
        const displayName = app.user.first_name && app.user.last_name 
            ? `${app.user.first_name} ${app.user.last_name}`
            : app.user.email;
        userNameElement.textContent = displayName;
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Handle navigation
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Handle form submissions
    document.addEventListener('submit', handleFormSubmit);
    
    // Handle window resize for responsive design
    window.addEventListener('resize', debounce(handleResize, 250));
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await api('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        // Clear local storage and redirect
        setToken(null);
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

/**
 * Handle navigation
 */
function handleNavigation(event) {
    const link = event.currentTarget;
    const href = link.getAttribute('href');
    
    // Update active state
    document.querySelectorAll('.nav__link').forEach(navLink => {
        navLink.classList.remove('nav__link--active');
    });
    link.classList.add('nav__link--active');
}

/**
 * Handle form submissions
 */
function handleFormSubmit(event) {
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (submitBtn) {
        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Processing...';
        
        // Re-enable after a delay (forms should handle their own submission)
        setTimeout(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }, 5000);
    }
}

/**
 * Load page-specific scripts
 */
function loadPageScripts() {
    const page = app.currentPage;
    
    // Load scripts based on current page
    switch (page) {
        case '/':
        case '/index.html':
            import('./charts/kpisChart.js');
            break;
        case '/upload.html':
            import('./features/upload/index.js');
            break;
        case '/analytics.html':
            import('./features/analytics/kpis.js');
            import('./features/analytics/cohorts.js');
            break;
        case '/forecast.html':
            import('./features/forecast/scenarios.js');
            import('./features/forecast/results.js');
            break;
        case '/rates.html':
            import('./features/rates/model.js');
            import('./features/rates/optimise.js');
            break;
        case '/admin.html':
            import('./admin/users.js');
            import('./admin/roles.js');
            import('./admin/audit.js');
            break;
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    // Trigger custom event for responsive components
    window.dispatchEvent(new CustomEvent('resize'));
}

/**
 * Show error message
 */
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert--error';
    alert.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alert, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert--success';
    alert.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alert, container.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * Format percentage
 */
function formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
}

/**
 * Format number with commas
 */
function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

// Export utility functions
window.app = app;
window.showError = showError;
window.showSuccess = showSuccess;
window.formatCurrency = formatCurrency;
window.formatPercentage = formatPercentage;
window.formatNumber = formatNumber;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 