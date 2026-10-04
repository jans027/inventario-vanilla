/**
 * Reports module
 * Handles statistics and analysis of the inventory
 * Reads data from localStorage (products and movements)
 */

// Minimum stock threshold for low stock alerts
const REPORT_MIN_STOCK = 5;

// Data loaded from localStorage
let reportProducts = [];
let reportMovements = [];

/**
 * Load data from localStorage
 */
function loadReportData() {
    // Load products
    const storedProducts = localStorage.getItem('products');
    reportProducts = storedProducts ? JSON.parse(storedProducts) : [];

    // Load movements
    const storedMovements = localStorage.getItem('movements');
    reportMovements = storedMovements ? JSON.parse(storedMovements) : [];
}

/**
 * Initialize the reports page when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we are on the reports page
    if (!document.getElementById('reportTotalProducts')) {
        return;
    }

    loadReportData();
    renderSummaryCards();
    renderLowStockList();
    renderMovementsSummary();
    renderCategoryChart();
    renderValueByCategory();
    renderRecentMovements();
});

/**
 * Render the summary cards with totals
 */
function renderSummaryCards() {
    // Total products
    const totalProducts = reportProducts.length;
    document.getElementById('reportTotalProducts').textContent = totalProducts;

    // Total stock (sum of all quantities)
    const totalStock = reportProducts.reduce((sum, p) => sum + p.stock, 0);
    document.getElementById('reportTotalStock').textContent = totalStock.toLocaleString();

    // Total value (sum of price * stock)
    const totalValue = reportProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    document.getElementById('reportTotalValue').textContent = '$' + totalValue.toLocaleString();

    // Low stock count
    const lowStockCount = reportProducts.filter(p => p.stock < REPORT_MIN_STOCK).length;
    document.getElementById('reportLowStock').textContent = lowStockCount;
}

/**
 * Render the list of products with low stock
 */
function renderLowStockList() {
    const list = document.getElementById('lowStockList');
    const emptyMessage = document.getElementById('noLowStock');

    list.innerHTML = '';

    // Filter low stock products
    const lowStockProducts = reportProducts
        .filter(p => p.stock < REPORT_MIN_STOCK)
        .sort((a, b) => a.stock - b.stock);

    if (lowStockProducts.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    lowStockProducts.forEach(product => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${product.name}</span>
            <strong class="low-stock">${product.stock} unidades</strong>
        `;
        list.appendChild(li);
    });
}

/**
 * Render the movements summary
 */
function renderMovementsSummary() {
    // Filter by type
    const sales = reportMovements.filter(m => m.type === 'venta');
    const purchases = reportMovements.filter(m => m.type === 'compra');

    // Count
    document.getElementById('reportTotalSales').textContent = sales.length;
    document.getElementById('reportTotalPurchases').textContent = purchases.length;

    // Units sold
    const unitsSold = sales.reduce((sum, m) => sum + m.quantity, 0);
    document.getElementById('reportUnitsSold').textContent = unitsSold;

    // Units purchased
    const unitsPurchased = purchases.reduce((sum, m) => sum + m.quantity, 0);
    document.getElementById('reportUnitsPurchased').textContent = unitsPurchased;
}

/**
 * Render the category chart (bar chart with CSS)
 */
function renderCategoryChart() {
    const chart = document.getElementById('categoryChart');
    const emptyMessage = document.getElementById('noCategories');

    chart.innerHTML = '';

    if (reportProducts.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    // Group products by category
    const categories = {};
    reportProducts.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = 0;
        }
        categories[product.category] += product.stock;
    });

    // Find the maximum value for scaling the bars
    const maxValue = Math.max(...Object.values(categories));

    // Sort categories by quantity (descending)
    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1]);

    // Build the bars
    sortedCategories.forEach(([category, quantity]) => {
        const percentage = maxValue > 0 ? (quantity / maxValue) * 100 : 0;

        const barContainer = document.createElement('div');
        barContainer.className = 'chart-bar-container';
        barContainer.innerHTML = `
            <div class="chart-label">
                <span>${category}</span>
                <span>${quantity} unidades</span>
            </div>
            <div class="chart-bar">
                <div class="chart-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        chart.appendChild(barContainer);
    });
}

/**
 * Render the value by category list
 */
function renderValueByCategory() {
    const list = document.getElementById('valueByCategory');
    const emptyMessage = document.getElementById('noValue');

    list.innerHTML = '';

    if (reportProducts.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    // Group value by category
    const categories = {};
    reportProducts.forEach(product => {
        if (!categories[product.category]) {
            categories[product.category] = 0;
        }
        categories[product.category] += product.price * product.stock;
    });

    // Sort by value (descending)
    const sortedCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1]);

    // Build the list items
    sortedCategories.forEach(([category, value]) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${category}</span>
            <strong>$${value.toLocaleString()}</strong>
        `;
        list.appendChild(li);
    });
}

/**
 * Render the last 5 movements
 */
function renderRecentMovements() {
    const tableBody = document.getElementById('recentMovementsBody');
    const emptyMessage = document.getElementById('noMovements');

    tableBody.innerHTML = '';

    if (reportMovements.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    // Get the last 5 movements
    const recent = [...reportMovements].reverse().slice(0, 5);

    recent.forEach(movement => {
        const typeBadge = movement.type === 'venta'
            ? '<span class="badge-sale">Venta</span>'
            : '<span class="badge-purchase">Compra</span>';

        const quantityText = movement.type === 'venta'
            ? `-${movement.quantity}`
            : `+${movement.quantity}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movement.date}</td>
            <td>${typeBadge}</td>
            <td>${movement.productName}</td>
            <td>${quantityText}</td>
            <td>${movement.user}</td>
        `;
        tableBody.appendChild(row);
    });
}