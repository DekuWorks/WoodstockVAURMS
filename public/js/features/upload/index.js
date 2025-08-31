/**
 * Upload functionality for VAURMS
 * Handles file selection, drag-and-drop, and upload
 */

'use strict';

import { upload } from '../../api/client.js';

// Upload state
let selectedFiles = [];
let uploadInProgress = false;

/**
 * Initialize upload functionality
 */
function init() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    
    // Setup drag and drop
    setupDragAndDrop(uploadArea);
    
    // Setup file input
    setupFileInput(fileInput);
    
    // Setup form submission
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
    
    // Setup upload area click
    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());
    }
}

/**
 * Setup drag and drop functionality
 * @param {HTMLElement} uploadArea - Upload area element
 */
function setupDragAndDrop(uploadArea) {
    if (!uploadArea) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
}

/**
 * Setup file input functionality
 * @param {HTMLInputElement} fileInput - File input element
 */
function setupFileInput(fileInput) {
    if (!fileInput) return;
    
    fileInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        handleFiles(files);
    });
}

/**
 * Prevent default drag behaviors
 * @param {Event} e - Event object
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Highlight drop area
 * @param {Event} e - Event object
 */
function highlight(e) {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.classList.add('dragover');
    }
}

/**
 * Unhighlight drop area
 * @param {Event} e - Event object
 */
function unhighlight(e) {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.classList.remove('dragover');
    }
}

/**
 * Handle dropped files
 * @param {Event} e - Event object
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);
    handleFiles(files);
}

/**
 * Handle selected files
 * @param {File[]} files - Array of files
 */
function handleFiles(files) {
    // Filter valid files
    const validFiles = files.filter(file => {
        const validTypes = ['.csv', '.xlsx', '.xls'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        return validTypes.includes(fileExtension);
    });
    
    if (validFiles.length === 0) {
        showError('Please select valid files (CSV, XLSX, or XLS)');
        return;
    }
    
    // Add files to selection
    selectedFiles = [...selectedFiles, ...validFiles];
    
    // Update UI
    updateFileList();
    showUploadForm();
    
    // Auto-fill dataset name if only one file
    if (selectedFiles.length === 1) {
        const datasetNameInput = document.getElementById('datasetName');
        if (datasetNameInput) {
            datasetNameInput.value = selectedFiles[0].name.replace(/\.[^/.]+$/, '');
        }
    }
}

/**
 * Update file list display
 */
function updateFileList() {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const fileItem = createFileItem(file, index);
        fileList.appendChild(fileItem);
    });
}

/**
 * Create file item element
 * @param {File} file - File object
 * @param {number} index - File index
 * @returns {HTMLElement} File item element
 */
function createFileItem(file, index) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    const fileIcon = getFileIcon(file.name);
    const fileSize = formatFileSize(file.size);
    
    fileItem.innerHTML = `
        <div class="file-info">
            <div class="file-icon">${fileIcon}</div>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${fileSize}</p>
            </div>
        </div>
        <div class="file-status">
            <button class="btn btn--error btn--small" onclick="removeFile(${index})">Remove</button>
        </div>
    `;
    
    return fileItem;
}

/**
 * Get file icon based on file type
 * @param {string} filename - File name
 * @returns {string} File icon
 */
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
        case 'csv':
            return '📊';
        case 'xlsx':
        case 'xls':
            return '📈';
        default:
            return '📁';
    }
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Show upload form
 */
function showUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.style.display = 'block';
    }
}

/**
 * Remove file from selection
 * @param {number} index - File index
 */
window.removeFile = function(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    
    if (selectedFiles.length === 0) {
        hideUploadForm();
    }
};

/**
 * Hide upload form
 */
function hideUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.style.display = 'none';
    }
}

/**
 * Handle upload form submission
 * @param {Event} event - Form submit event
 */
async function handleUpload(event) {
    event.preventDefault();
    
    if (uploadInProgress) return;
    
    const datasetName = document.getElementById('datasetName')?.value.trim();
    const datasetDescription = document.getElementById('datasetDescription')?.value.trim();
    
    if (!datasetName) {
        showError('Please enter a dataset name');
        return;
    }
    
    if (selectedFiles.length === 0) {
        showError('Please select files to upload');
        return;
    }
    
    uploadInProgress = true;
    const uploadBtn = document.getElementById('uploadBtn');
    const originalText = uploadBtn.textContent;
    
    try {
        // Show loading state
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<span class="loading"></span> Uploading...';
        
        // Upload each file
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('name', datasetName + (selectedFiles.length > 1 ? `_${i + 1}` : ''));
            if (datasetDescription) {
                formData.append('description', datasetDescription);
            }
            
            // Upload file
            await upload('/datasets/upload', formData);
            
            // Update progress
            updateUploadProgress(i + 1, selectedFiles.length);
        }
        
        // Show success message
        showSuccess('Files uploaded successfully!');
        
        // Reset form
        selectedFiles = [];
        updateFileList();
        hideUploadForm();
        document.getElementById('uploadForm').reset();
        
    } catch (error) {
        console.error('Upload failed:', error);
        showError(error.message || 'Upload failed. Please try again.');
    } finally {
        // Reset button
        uploadBtn.disabled = false;
        uploadBtn.textContent = originalText;
        uploadInProgress = false;
    }
}

/**
 * Update upload progress
 * @param {number} current - Current file number
 * @param {number} total - Total files
 */
function updateUploadProgress(current, total) {
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.innerHTML = `<span class="loading"></span> Uploading ${current}/${total}...`;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
} 