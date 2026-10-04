/**
 * Movements module
 * Handles all sales and purchases: registering, history, filtering
 * Also updates product stock when a movement is registered
 */

// Movements array (stored in localStorage)
let movements = [];

// Products array (loaded from localStorage, shared with products page)
let products = [];

/**
 * Load movements and products from localStorage
 */
function loadData() {
    // Load movements
    const storedMovements = localStorage.getItem('movements');
    movements = storedMovements ? JSON.parse(storedMovements) : [];

    // Load products
    const storedProducts = localStorage.getItem('products');
    products = storedProducts ? JSON.parse(storedProducts) : [];
}

/**
 * Save movements to localStorage
 */
function saveMovements() {
    localStorage.setItem('movements', JSON.stringify(movements));
}

/**
 * Save products to localStorage (after stock changes)
 */
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

/**
 * Initialize the movements page when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we are on the movements page
    if (!document.getElementById('movementTableBody')) {
        return;
    }

    loadData();
    renderMovements(movements);
});

/**
 * Render the movements table
 * @param {Array} movementList - The list of movements to display
 */
function renderMovements(movementList) {
    const tableBody = document.getElementById('movementTableBody');
    const emptyMessage = document.getElementById('emptyMovements');

    tableBody.innerHTML = '';

    if (movementList.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    // Sort by date (most recent first)
    const sorted = [...movementList].reverse();

    sorted.forEach(movement => {
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
            <td>Completado</td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Filter movements by search term and type
 */
function filterMovements() {
    const searchTerm = document.getElementById('searchMovement').value.toLowerCase().trim();
    const typeFilter = document.getElementById('filterType').value;

    const filtered = movements.filter(movement => {
        const matchesSearch = movement.productName.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || movement.type === typeFilter;
        return matchesSearch && matchesType;
    });

    renderMovements(filtered);
}

/**
 * Get the current date formatted
 * @returns {string} Formatted date string
 */
function getCurrentDate() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * ========== SELL OPERATIONS ==========
 */

/**
 * Open the sell modal
 */
function openSellModal() {
    loadData();
    document.getElementById('sellForm').reset();
    document.getElementById('sellProductInfo').style.display = 'none';
    document.getElementById('sellTotal').textContent = '$0';
    document.getElementById('sellError').textContent = '';
    populateProductSelect('sellProduct');
    document.getElementById('sellModal').style.display = 'flex';
}

/**
 * Close the sell modal
 */
function closeSellModal() {
    document.getElementById('sellModal').style.display = 'none';
}

/**
 * Populate a select element with the products
 * @param {string} selectId - The id of the select element
 */
function populateProductSelect(selectId) {
    const select = document.getElementById(selectId);

    // Clear existing options (keep the first placeholder)
    select.innerHTML = '<option value="">Seleccione un producto</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - $${product.price.toLocaleString()} (Stock: ${product.stock})`;
        select.appendChild(option);
    });
}

/**
 * Update sell modal info when a product is selected
 */
function updateSellInfo() {
    const productId = parseInt(document.getElementById('sellProduct').value);
    const infoBox = document.getElementById('sellProductInfo');

    if (!productId) {
        infoBox.style.display = 'none';
        return;
    }

    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('sellPrice').textContent = '$' + product.price.toLocaleString();
        document.getElementById('sellStock').textContent = product.stock;
        infoBox.style.display = 'block';
    }
}

/**
 * Update the total price in the sell modal
 */
function updateSellTotal() {
    const productId = parseInt(document.getElementById('sellProduct').value);
    const quantity = parseInt(document.getElementById('sellQuantity').value) || 0;

    if (!productId || quantity <= 0) {
        document.getElementById('sellTotal').textContent = '$0';
        return;
    }

    const product = products.find(p => p.id === productId);

    if (product) {
        const total = product.price * quantity;
        document.getElementById('sellTotal').textContent = '$' + total.toLocaleString();
    }
}

/**
 * Register a sell operation
 * @param {Event} event - The form submit event
 */
function registerSell(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('sellProduct').value);
    const quantity = parseInt(document.getElementById('sellQuantity').value);
    const errorElement = document.getElementById('sellError');

    errorElement.textContent = '';

    // Validations
    if (!productId) {
        errorElement.textContent = 'Debe seleccionar un producto';
        return;
    }

    if (!quantity || quantity <= 0) {
        errorElement.textContent = 'La cantidad debe ser mayor a cero';
        return;
    }

    const product = products.find(p => p.id === productId);

    if (!product) {
        errorElement.textContent = 'Producto no encontrado';
        return;
    }

    // Check stock availability
    if (quantity > product.stock) {
        errorElement.textContent = `No hay suficiente stock. Disponible: ${product.stock}`;
        return;
    }

    // Update product stock
    product.stock -= quantity;
    saveProducts();

    // Register movement
    const user = getCurrentUser();
    movements.push({
        id: movements.length + 1,
        type: 'venta',
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        total: product.price * quantity,
        user: user ? user.name : 'Desconocido',
        date: getCurrentDate()
    });
    saveMovements();

    // Close modal and refresh table
    closeSellModal();
    loadData();
    renderMovements(movements);
}

/**
 * ========== PURCHASE OPERATIONS ==========
 */

/**
 * Open the purchase modal
 */
function openPurchaseModal() {
    loadData();
    document.getElementById('purchaseForm').reset();
    document.getElementById('purchaseProductInfo').style.display = 'none';
    document.getElementById('purchaseError').textContent = '';
    populateProductSelect('purchaseProduct');
    document.getElementById('purchaseModal').style.display = 'flex';
}

/**
 * Close the purchase modal
 */
function closePurchaseModal() {
    document.getElementById('purchaseModal').style.display = 'none';
}

/**
 * Update purchase modal info when a product is selected
 */
function updatePurchaseInfo() {
    const productId = parseInt(document.getElementById('purchaseProduct').value);
    const infoBox = document.getElementById('purchaseProductInfo');

    if (!productId) {
        infoBox.style.display = 'none';
        return;
    }

    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('purchaseStock').textContent = product.stock;
        infoBox.style.display = 'block';
    }
}

/**
 * Register a purchase operation
 * @param {Event} event - The form submit event
 */
function registerPurchase(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('purchaseProduct').value);
    const quantity = parseInt(document.getElementById('purchaseQuantity').value);
    const errorElement = document.getElementById('purchaseError');

    errorElement.textContent = '';

    // Validations
    if (!productId) {
        errorElement.textContent = 'Debe seleccionar un producto';
        return;
    }

    if (!quantity || quantity <= 0) {
        errorElement.textContent = 'La cantidad debe ser mayor a cero';
        return;
    }

    const product = products.find(p => p.id === productId);

    if (!product) {
        errorElement.textContent = 'Producto no encontrado';
        return;
    }

    // Update product stock
    product.stock += quantity;
    saveProducts();

    // Register movement
    const user = getCurrentUser();
    movements.push({
        id: movements.length + 1,
        type: 'compra',
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
        total: product.price * quantity,
        user: user ? user.name : 'Desconocido',
        date: getCurrentDate()
    });
    saveMovements();

    // Close modal and refresh table
    closePurchaseModal();
    loadData();
    renderMovements(movements);
}