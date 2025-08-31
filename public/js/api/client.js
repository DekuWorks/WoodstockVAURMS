/**
 * API Client for VAURMS
 * Handles all HTTP requests with JWT authentication and error handling
 */

'use strict';

const API_BASE = '/api';
let token = localStorage.getItem('jwt') || null;

/**
 * Set authentication token
 * @param {string} t - JWT token
 */
export function setToken(t) {
    token = t;
    if (t) {
        localStorage.setItem('jwt', t);
    } else {
        localStorage.removeItem('jwt');
    }
}

/**
 * Get current authentication token
 * @returns {string|null} JWT token
 */
export function getToken() {
    return token;
}

/**
 * Make API request
 * @param {string} path - API endpoint path
 * @param {Object} options - Request options
 * @returns {Promise} API response
 */
export async function api(path, { method = 'GET', body, headers = {} } = {}) {
    const url = `${API_BASE}${path}`;
    
    // Prepare headers
    const requestHeaders = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers
    };
    
    // Prepare request options
    const requestOptions = {
        method,
        headers: requestHeaders,
        credentials: 'include'
    };
    
    // Add body for non-GET requests
    if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(url, requestOptions);
        
        // Handle authentication errors
        if (response.status === 401) {
            setToken(null);
            window.location.href = '/login.html';
            throw new Error('Authentication required');
        }
        
        // Handle other HTTP errors
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || response.statusText;
            } catch {
                errorMessage = errorText || response.statusText;
            }
            
            throw new Error(errorMessage);
        }
        
        // Parse response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
        
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error - please check your connection');
        }
        
        // Re-throw other errors
        throw error;
    }
}

/**
 * GET request helper
 * @param {string} path - API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise} API response
 */
export async function get(path, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;
    return api(fullPath, { method: 'GET' });
}

/**
 * POST request helper
 * @param {string} path - API endpoint path
 * @param {Object} body - Request body
 * @returns {Promise} API response
 */
export async function post(path, body = {}) {
    return api(path, { method: 'POST', body });
}

/**
 * PUT request helper
 * @param {string} path - API endpoint path
 * @param {Object} body - Request body
 * @returns {Promise} API response
 */
export async function put(path, body = {}) {
    return api(path, { method: 'PUT', body });
}

/**
 * PATCH request helper
 * @param {string} path - API endpoint path
 * @param {Object} body - Request body
 * @returns {Promise} API response
 */
export async function patch(path, body = {}) {
    return api(path, { method: 'PATCH', body });
}

/**
 * DELETE request helper
 * @param {string} path - API endpoint path
 * @returns {Promise} API response
 */
export async function del(path) {
    return api(path, { method: 'DELETE' });
}

/**
 * Upload file helper
 * @param {string} path - API endpoint path
 * @param {FormData} formData - Form data with file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} API response
 */
export async function upload(path, formData, onProgress = null) {
    const url = `${API_BASE}${path}`;
    
    // Prepare headers (don't set Content-Type for FormData)
    const requestHeaders = {
        ...(token && { Authorization: `Bearer ${token}` })
    };
    
    // Prepare request options
    const requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: formData,
        credentials: 'include'
    };
    
    try {
        const response = await fetch(url, requestOptions);
        
        // Handle authentication errors
        if (response.status === 401) {
            setToken(null);
            window.location.href = '/login.html';
            throw new Error('Authentication required');
        }
        
        // Handle other HTTP errors
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || response.statusText;
            } catch {
                errorMessage = errorText || response.statusText;
            }
            
            throw new Error(errorMessage);
        }
        
        // Parse response
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            return await response.text();
        }
        
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error - please check your connection');
        }
        
        // Re-throw other errors
        throw error;
    }
}

/**
 * Download file helper
 * @param {string} path - API endpoint path
 * @param {string} filename - Suggested filename
 * @returns {Promise} Download response
 */
export async function download(path, filename = 'download') {
    const url = `${API_BASE}${path}`;
    
    // Prepare headers
    const requestHeaders = {
        ...(token && { Authorization: `Bearer ${token}` })
    };
    
    // Prepare request options
    const requestOptions = {
        method: 'GET',
        headers: requestHeaders,
        credentials: 'include'
    };
    
    try {
        const response = await fetch(url, requestOptions);
        
        // Handle authentication errors
        if (response.status === 401) {
            setToken(null);
            window.location.href = '/login.html';
            throw new Error('Authentication required');
        }
        
        // Handle other HTTP errors
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.error || errorData.message || response.statusText;
            } catch {
                errorMessage = errorText || response.statusText;
            }
            
            throw new Error(errorMessage);
        }
        
        // Create download link
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        
        return { success: true };
        
    } catch (error) {
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error - please check your connection');
        }
        
        // Re-throw other errors
        throw error;
    }
} 