/**
 * Authentication Guard for VAURMS
 * Handles route protection and authentication checks
 */

'use strict';

import { getToken } from '../api/client.js';

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export function isAuthenticated() {
    const token = getToken();
    return !!token;
}

/**
 * Check authentication and redirect if needed
 * @param {string} requiredRole - Minimum required role
 * @returns {Promise<boolean>} Authentication status
 */
export async function checkAuth(requiredRole = null) {
    if (!isAuthenticated()) {
        redirectToLogin();
        return false;
    }
    
    // Additional role-based checks can be added here
    if (requiredRole) {
        // This would check against the user's role from the app state
        const user = window.app?.user;
        if (!user || !hasRole(user.role, requiredRole)) {
            redirectToLogin();
            return false;
        }
    }
    
    return true;
}

/**
 * Redirect to login page
 */
export function redirectToLogin() {
    const currentPath = window.location.pathname;
    if (currentPath !== '/login.html') {
        window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
    }
}

/**
 * Check if user has required role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean} Role check result
 */
function hasRole(userRole, requiredRole) {
    const roleHierarchy = {
        'viewer': 1,
        'analyst': 2,
        'admin': 3
    };
    
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
}

/**
 * Require authentication for a function
 * @param {Function} fn - Function to protect
 * @param {string} requiredRole - Minimum required role
 * @returns {Function} Protected function
 */
export function requireAuth(fn, requiredRole = null) {
    return async function(...args) {
        const isAuth = await checkAuth(requiredRole);
        if (!isAuth) {
            return;
        }
        return fn.apply(this, args);
    };
}

/**
 * Get redirect URL from query parameters
 * @returns {string} Redirect URL
 */
export function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || '/';
} 