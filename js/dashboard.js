/**
 * Dashboard module
 * Handles the logic for the dashboard page
 * Currently uses static data, later will fetch from the backend
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we are on the dashboard page
    if (!document.querySelector('.cards-container')) {
        return;
    }

    // Initialize dashboard
    loadDashboardData();
});

/**
 * Load dashboard data
 * In a real application, this would make a fetch request to the backend
 */
function loadDashboardData() {
    // Simulated data (will be replaced with API calls later)
    const dashboardData = {
        totalProducts: 45,
        totalStock: 1280,
        totalValue: 156800,
        alerts: 3
    };

    // Update the summary cards with the data
    updateSummaryCards(dashboardData);
}

/**
 * Update the summary cards with the received data
 * @param {Object} data - The dashboard data
 */
function updateSummaryCards(data) {
    const numbers = document.querySelectorAll('.card .number');

    if (numbers.length >= 4) {
        numbers[0].textContent = data.totalProducts;
        numbers[1].textContent = data.totalStock.toLocaleString();
        numbers[2].textContent = '$' + data.totalValue.toLocaleString();
        numbers[3].textContent = data.alerts;
    }
}