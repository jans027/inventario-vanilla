/**
 * Products module
 * Handles all product management: listing, searching, adding, editing and deleting
 */

// Products data (temporary - will be replaced with backend data later)
let products = [
    { id: 1, name: 'Clavo 2"', description: 'Clavo de acero galvanizado', price: 5000, stock: 45, category: 'Herrajes' },
    { id: 2, name: 'Pintura Azul', description: 'Pintura vinilica azul 1 galon', price: 25000, stock: 2, category: 'Pintura' },
    { id: 3, name: 'Martillo', description: 'Martillo de acero con mango', price: 15000, stock: 12, category: 'Herramientas' },
    { id: 4, name: 'Lija N80', description: 'Lija para madera grano 80', price: 3000, stock: 4, category: 'Lijas' },
    { id: 5, name: 'Sierra', description: 'Sierra manual para madera', price: 35000, stock: 8, category: 'Herramientas' }
];

// Minimum stock threshold for low stock alerts
const MIN_STOCK = 5;

// Current product id being deleted (for the delete modal)
let productIdToDelete = null;

/**
 * Initialize the products page when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only run if we are on the products page
    if (!document.getElementById('productTableBody')) {
        return;
    }

    // Render the initial list of products
    renderProducts(products);
});

/**
 * Render the product list in the table
 * @param {Array} productList - The list of products to display
 */
function renderProducts(productList) {
    const tableBody = document.getElementById('productTableBody');
    const emptyMessage = document.getElementById('emptyMessage');

    // Clear the table
    tableBody.innerHTML = '';

    // Show empty message if no products
    if (productList.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    // Build each row
    productList.forEach((product, index) => {
        // Check if stock is low
        const lowStockClass = product.stock < MIN_STOCK ? 'low-stock' : '';
        const warningText = product.stock < MIN_STOCK ? ' (!)' : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>$${product.price.toLocaleString()}</td>
            <td class="${lowStockClass}">${product.stock}${warningText}</td>
            <td>${product.category}</td>
            <td>
                <button class="btn-action edit" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn-action delete" onclick="openDeleteModal(${product.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Search products by name or category
 * Called when the user types in the search input
 */
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

    // Filter products
    const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm)
    );

    renderProducts(filtered);
}

/**
 * Open the modal to add a new product
 */
function openProductModal() {
    // Set the title for adding
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    
    // Clear the form
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';

    // Show the modal
    document.getElementById('productModal').style.display = 'flex';
}

/**
 * Open the modal to edit an existing product
 * @param {number} id - The id of the product to edit
 */
function editProduct(id) {
    // Find the product
    const product = products.find(p => p.id === id);

    if (!product) {
        return;
    }

    // Set the title for editing
    document.getElementById('modalTitle').textContent = 'Editar Producto';

    // Fill the form with product data
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.category;

    // Show the modal
    document.getElementById('productModal').style.display = 'flex';
}

/**
 * Close the product modal
 */
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
}

/**
 * Save a product (create new or update existing)
 * @param {Event} event - The form submit event
 */
function saveProduct(event) {
    event.preventDefault();

    // Get form values
    const id = document.getElementById('productId').value;
    const name = document.getElementById('productName').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);
    const category = document.getElementById('productCategory').value;

    // Check if we are editing (id exists) or creating (no id)
    if (id) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(id));

        if (index !== -1) {
            products[index] = {
                id: parseInt(id),
                name: name,
                description: description,
                price: price,
                stock: stock,
                category: category
            };
        }
    } else {
        // Create new product with a new id
        const newId = products.length > 0 
            ? Math.max(...products.map(p => p.id)) + 1 
            : 1;

        products.push({
            id: newId,
            name: name,
            description: description,
            price: price,
            stock: stock,
            category: category
        });
    }

    // Re-render the table and close the modal
    renderProducts(products);
    closeProductModal();
}

/**
 * Open the delete confirmation modal
 * @param {number} id - The id of the product to delete
 */
function openDeleteModal(id) {
    productIdToDelete = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

/**
 * Close the delete confirmation modal
 */
function closeDeleteModal() {
    productIdToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
}

/**
 * Confirm and perform the delete operation
 */
function confirmDelete() {
    if (productIdToDelete === null) {
        return;
    }

    // Remove the product from the list
    products = products.filter(p => p.id !== productIdToDelete);

    // Reset and re-render
    productIdToDelete = null;
    closeDeleteModal();
    renderProducts(products);
}