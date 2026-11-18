const REPORT_MIN_STOCK = 5;
let reportProducts = [];
let reportMovements = [];

async function loadReportData() {
    try {
        const [prodRes, movRes] = await Promise.all([
            fetch('api/productos.php'),
            fetch('api/movimientos.php')
        ]);

        const prodData = await prodRes.json();
        const movData = await movRes.json();

        if (prodData.success) reportProducts = prodData.products;
        if (movData.success) reportMovements = movData.movements;
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (!document.getElementById('reportTotalProducts')) return;

    await loadReportData();
    renderSummaryCards();
    renderLowStockList();
    renderMovementsSummary();
    renderCategoryChart();
    renderValueByCategory();
    renderRecentMovements();
});

function renderSummaryCards() {
    document.getElementById('reportTotalProducts').textContent = reportProducts.length;

    const totalStock = reportProducts.reduce((sum, p) => sum + p.stock, 0);
    document.getElementById('reportTotalStock').textContent = totalStock.toLocaleString();

    const totalValue = reportProducts.reduce((sum, p) => sum + (p.precio * p.stock), 0);
    document.getElementById('reportTotalValue').textContent = '$' + totalValue.toLocaleString();

    const lowStockCount = reportProducts.filter(p => p.stock < REPORT_MIN_STOCK).length;
    document.getElementById('reportLowStock').textContent = lowStockCount;
}

function renderLowStockList() {
    const list = document.getElementById('lowStockList');
    const emptyMessage = document.getElementById('noLowStock');

    list.innerHTML = '';

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
            <span>${product.nombre}</span>
            <strong class="low-stock">${product.stock} unidades</strong>
        `;
        list.appendChild(li);
    });
}

function renderMovementsSummary() {
    const sales = reportMovements.filter(m => m.tipo === 'venta');
    const purchases = reportMovements.filter(m => m.tipo === 'compra');

    document.getElementById('reportTotalSales').textContent = sales.length;
    document.getElementById('reportTotalPurchases').textContent = purchases.length;

    document.getElementById('reportUnitsSold').textContent = sales.reduce((s, m) => s + m.cantidad, 0);
    document.getElementById('reportUnitsPurchased').textContent = purchases.reduce((s, m) => s + m.cantidad, 0);
}

function renderCategoryChart() {
    const chart = document.getElementById('categoryChart');
    const emptyMessage = document.getElementById('noCategories');

    chart.innerHTML = '';

    if (reportProducts.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    const categories = {};
    reportProducts.forEach(p => {
        categories[p.categoria] = (categories[p.categoria] || 0) + p.stock;
    });

    const maxValue = Math.max(...Object.values(categories));
    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([category, quantity]) => {
        const percentage = maxValue > 0 ? (quantity / maxValue) * 100 : 0;
        const container = document.createElement('div');
        container.className = 'chart-bar-container';
        container.innerHTML = `
            <div class="chart-label">
                <span>${category}</span>
                <span>${quantity} unidades</span>
            </div>
            <div class="chart-bar">
                <div class="chart-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        chart.appendChild(container);
    });
}

function renderValueByCategory() {
    const list = document.getElementById('valueByCategory');
    const emptyMessage = document.getElementById('noValue');

    list.innerHTML = '';

    if (reportProducts.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    const categories = {};
    reportProducts.forEach(p => {
        categories[p.categoria] = (categories[p.categoria] || 0) + (p.precio * p.stock);
    });

    const sorted = Object.entries(categories).sort((a, b) => b[1] - a[1]);

    sorted.forEach(([category, value]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${category}</span><strong>$${value.toLocaleString()}</strong>`;
        list.appendChild(li);
    });
}

function renderRecentMovements() {
    const tableBody = document.getElementById('recentMovementsBody');
    const emptyMessage = document.getElementById('noMovements');

    tableBody.innerHTML = '';

    if (reportMovements.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    const recent = reportMovements.slice(0, 5);

    recent.forEach(m => {
        const typeBadge = m.tipo === 'venta'
            ? '<span class="badge-sale">Venta</span>'
            : '<span class="badge-purchase">Compra</span>';

        const quantityText = m.tipo === 'venta' ? `-${m.cantidad}` : `+${m.cantidad}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${m.fecha}</td>
            <td>${typeBadge}</td>
            <td>${m.producto_nombre}</td>
            <td>${quantityText}</td>
            <td>${m.usuario_nombre}</td>
        `;
        tableBody.appendChild(row);
    });
}