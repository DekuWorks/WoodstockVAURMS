/**
 * KPI Charts for VAURMS Dashboard
 * Handles dashboard visualizations using Chart.js
 */

'use strict';

import { api } from '../api/client.js';

// Chart instances
let revenueChart = null;
let consumptionChart = null;

/**
 * Initialize KPI charts
 */
async function init() {
    try {
        // Load KPI data
        const kpiData = await loadKPIData();
        
        // Update KPI cards
        updateKPICards(kpiData);
        
        // Initialize charts
        initRevenueChart(kpiData.revenue_trends);
        initConsumptionChart(kpiData.consumption_by_class);
        
    } catch (error) {
        console.error('Failed to load KPI data:', error);
        showError('Failed to load dashboard data');
    }
}

/**
 * Load KPI data from API
 * @returns {Promise<Object>} KPI data
 */
async function loadKPIData() {
    try {
        const [kpis, trends, cohorts] = await Promise.all([
            api('/analytics/kpis'),
            api('/analytics/trends?metric=revenue'),
            api('/analytics/cohorts?class=residential')
        ]);
        
        return {
            kpis,
            revenue_trends: trends,
            consumption_by_class: cohorts
        };
    } catch (error) {
        console.error('API call failed:', error);
        // Return mock data for demo purposes
        return getMockData();
    }
}

/**
 * Get mock data for demo purposes
 * @returns {Object} Mock KPI data
 */
function getMockData() {
    return {
        kpis: {
            total_revenue: 2450000,
            collection_rate: 94.2,
            customer_count: 12500,
            coverage_ratio: 1.15,
            revenue_change: 5.2,
            collection_change: 1.8,
            customer_change: 2.1,
            coverage_change: 0.0
        },
        revenue_trends: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [210000, 215000, 220000, 225000, 230000, 235000]
        },
        consumption_by_class: {
            labels: ['Residential', 'Commercial', 'Industrial'],
            data: [65, 25, 10]
        }
    };
}

/**
 * Update KPI cards with data
 * @param {Object} data - KPI data
 */
function updateKPICards(data) {
    const kpis = data.kpis;
    
    // Update revenue
    const revenueElement = document.getElementById('totalRevenue');
    if (revenueElement) {
        revenueElement.textContent = formatCurrency(kpis.total_revenue);
    }
    
    const revenueChangeElement = document.getElementById('revenueChange');
    if (revenueChangeElement) {
        const change = kpis.revenue_change;
        revenueChangeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
        revenueChangeElement.className = `kpi-card__change kpi-card__change--${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Update collection rate
    const collectionElement = document.getElementById('collectionRate');
    if (collectionElement) {
        collectionElement.textContent = `${kpis.collection_rate}%`;
    }
    
    const collectionChangeElement = document.getElementById('collectionChange');
    if (collectionChangeElement) {
        const change = kpis.collection_change;
        collectionChangeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
        collectionChangeElement.className = `kpi-card__change kpi-card__change--${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Update customer count
    const customerElement = document.getElementById('customerCount');
    if (customerElement) {
        customerElement.textContent = formatNumber(kpis.customer_count);
    }
    
    const customerChangeElement = document.getElementById('customerChange');
    if (customerChangeElement) {
        const change = kpis.customer_change;
        customerChangeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
        customerChangeElement.className = `kpi-card__change kpi-card__change--${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Update coverage ratio
    const coverageElement = document.getElementById('coverageRatio');
    if (coverageElement) {
        coverageElement.textContent = kpis.coverage_ratio.toFixed(2);
    }
    
    const coverageChangeElement = document.getElementById('coverageChange');
    if (coverageChangeElement) {
        const change = kpis.coverage_change;
        coverageChangeElement.textContent = `${change >= 0 ? '+' : ''}${change}%`;
        coverageChangeElement.className = `kpi-card__change kpi-card__change--${change >= 0 ? 'positive' : 'negative'}`;
    }
}

/**
 * Initialize revenue trend chart
 * @param {Object} data - Revenue trend data
 */
function initRevenueChart(data) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: data.data,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Revenue: ${formatCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Initialize consumption by class chart
 * @param {Object} data - Consumption data
 */
function initConsumptionChart(data) {
    const ctx = document.getElementById('consumptionChart');
    if (!ctx) return;
    
    consumptionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.data,
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${percentage}%`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

/**
 * Update charts with new data
 * @param {Object} data - New chart data
 */
function updateCharts(data) {
    if (revenueChart && data.revenue_trends) {
        revenueChart.data.labels = data.revenue_trends.labels;
        revenueChart.data.datasets[0].data = data.revenue_trends.data;
        revenueChart.update();
    }
    
    if (consumptionChart && data.consumption_by_class) {
        consumptionChart.data.labels = data.consumption_by_class.labels;
        consumptionChart.data.datasets[0].data = data.consumption_by_class.data;
        consumptionChart.update();
    }
}

/**
 * Destroy charts (cleanup)
 */
function destroyCharts() {
    if (revenueChart) {
        revenueChart.destroy();
        revenueChart = null;
    }
    
    if (consumptionChart) {
        consumptionChart.destroy();
        consumptionChart = null;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export functions for external use
window.updateCharts = updateCharts;
window.destroyCharts = destroyCharts; 