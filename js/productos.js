// Minimum stock threshold
const MIN_STOCK = 5;

let products = [];
let productIdToDelete = null;

/**
 * Load products from the backend
 */
async function loadProducts() {
    try {
        const response = await fetch('api/productos.php');
        const data = await response.json();

        if (data.success) {
            products = data.products;
            renderProducts(products);
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Error de conexion:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('productTableBody')) {
        loadProducts();
    }
});

function renderProducts(productList) {
    const tableBody = document.getElementById('productTableBody');
    const emptyMessage = document.getElementById('emptyMessage');

    tableBody.innerHTML = '';

    if (productList.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    productList.forEach((product, index) => {
        const lowStockClass = product.stock < MIN_STOCK ? 'low-stock' : '';
        const warningText = product.stock < MIN_STOCK ? ' (!)' : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${product.nombre}</td>
            <td>$${product.precio.toLocaleString()}</td>
            <td class="${lowStockClass}">${product.stock}${warningText}</td>
            <td>${product.categoria}</td>
            <td>
                <button class="btn-action edit" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn-action delete" onclick="openDeleteModal(${product.id})">Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const filtered = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm) ||
        p.categoria.toLowerCase().includes(searchTerm)
    );
    renderProducts(filtered);
}

function openProductModal() {
    document.getElementById('modalTitle').textContent = 'Agregar Producto';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.nombre;
    document.getElementById('productDescription').value = product.descripcion || '';
    document.getElementById('productPrice').value = product.precio;
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productCategory').value = product.categoria;
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
}

async function saveProduct(event) {
    event.preventDefault();

    const id = document.getElementById('productId').value;
    const productData = {
        nombre: document.getElementById('productName').value.trim(),
        descripcion: document.getElementById('productDescription').value.trim(),
        precio: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        categoria: document.getElementById('productCategory').value
    };

    const isEdit = id !== '';
    if (isEdit) productData.id = parseInt(id);

    try {
        const response = await fetch('api/productos.php', {
            method: isEdit ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const data = await response.json();

        if (data.success) {
            closeProductModal();
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error de conexion');
        console.error(error);
    }
}

function openDeleteModal(id) {
    productIdToDelete = id;
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    productIdToDelete = null;
    document.getElementById('deleteModal').style.display = 'none';
}

async function confirmDelete() {
    if (productIdToDelete === null) return;

    try {
        const response = await fetch('api/productos.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: productIdToDelete })
        });

        const data = await response.json();

        if (data.success) {
            productIdToDelete = null;
            closeDeleteModal();
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error de conexion');
        console.error(error);
    }
}