let movements = [];
let products = [];

async function loadData() {
    try {
        const [movRes, prodRes] = await Promise.all([
            fetch('api/movimientos.php'),
            fetch('api/productos.php')
        ]);

        const movData = await movRes.json();
        const prodData = await prodRes.json();

        if (movData.success) movements = movData.movements;
        if (prodData.success) products = prodData.products;
    } catch (error) {
        showToast('Error de conexion', 'error');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    if (document.getElementById('movementTableBody')) {
        await loadData();
        renderMovements(movements);
    }
});

function renderMovements(movementList) {
    const tableBody = document.getElementById('movementTableBody');
    const emptyMessage = document.getElementById('emptyMovements');

    tableBody.innerHTML = '';

    if (movementList.length === 0) {
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';

    movementList.forEach(movement => {
        const typeBadge = movement.tipo === 'venta'
            ? '<span class="badge-sale">Venta</span>'
            : '<span class="badge-purchase">Compra</span>';

        const quantityText = movement.tipo === 'venta'
            ? `-${movement.cantidad}`
            : `+${movement.cantidad}`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${movement.fecha}</td>
            <td>${typeBadge}</td>
            <td>${movement.producto_nombre}</td>
            <td>${quantityText}</td>
            <td>${movement.usuario_nombre}</td>
            <td>Completado</td>
        `;
        tableBody.appendChild(row);
    });
}

function filterMovements() {
    const searchTerm = document.getElementById('searchMovement').value.toLowerCase().trim();
    const typeFilter = document.getElementById('filterType').value;

    const filtered = movements.filter(m => {
        const matchesSearch = m.producto_nombre.toLowerCase().includes(searchTerm);
        const matchesType = typeFilter === 'all' || m.tipo === typeFilter;
        return matchesSearch && matchesType;
    });

    renderMovements(filtered);
}

async function openSellModal() {
    await loadData();
    document.getElementById('sellForm').reset();
    document.getElementById('sellProductInfo').style.display = 'none';
    document.getElementById('sellTotal').textContent = '$0';
    document.getElementById('sellError').textContent = '';
    populateProductSelect('sellProduct');
    document.getElementById('sellModal').style.display = 'flex';
}

function closeSellModal() {
    document.getElementById('sellModal').style.display = 'none';
}

function populateProductSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Seleccione un producto</option>';

    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.nombre} - $${product.precio.toLocaleString()} (Stock: ${product.stock})`;
        select.appendChild(option);
    });
}

function updateSellInfo() {
    const productId = parseInt(document.getElementById('sellProduct').value);
    const infoBox = document.getElementById('sellProductInfo');

    if (!productId) {
        infoBox.style.display = 'none';
        return;
    }

    const product = products.find(p => p.id === productId);

    if (product) {
        document.getElementById('sellPrice').textContent = '$' + product.precio.toLocaleString();
        document.getElementById('sellStock').textContent = product.stock;
        infoBox.style.display = 'block';
    }
}

function updateSellTotal() {
    const productId = parseInt(document.getElementById('sellProduct').value);
    const quantity = parseInt(document.getElementById('sellQuantity').value) || 0;

    if (!productId || quantity <= 0) {
        document.getElementById('sellTotal').textContent = '$0';
        return;
    }

    const product = products.find(p => p.id === productId);
    if (product) {
        document.getElementById('sellTotal').textContent = '$' + (product.precio * quantity).toLocaleString();
    }
}

async function registerSell(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('sellProduct').value);
    const quantity = parseInt(document.getElementById('sellQuantity').value);
    const errorElement = document.getElementById('sellError');
    const currentUser = getCurrentUser();

    errorElement.textContent = '';

    if (!productId || !quantity || quantity <= 0) {
        errorElement.textContent = 'Complete todos los campos correctamente';
        return;
    }

    try {
        const response = await fetch('api/movimientos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'venta',
                producto_id: productId,
                cantidad: quantity,
                usuario_id: currentUser.id
            })
        });

        const data = await response.json();

        if (data.success) {
            closeSellModal();
            await loadData();
            renderMovements(movements);
        } else {
            errorElement.textContent = data.message;
        }
    } catch (error) {
        errorElement.textContent = 'Error de conexion';
        console.error(error);
    }
}

async function openPurchaseModal() {
    await loadData();
    document.getElementById('purchaseForm').reset();
    document.getElementById('purchaseProductInfo').style.display = 'none';
    document.getElementById('purchaseError').textContent = '';
    populateProductSelect('purchaseProduct');
    document.getElementById('purchaseModal').style.display = 'flex';
}

function closePurchaseModal() {
    document.getElementById('purchaseModal').style.display = 'none';
}

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

async function registerPurchase(event) {
    event.preventDefault();

    const productId = parseInt(document.getElementById('purchaseProduct').value);
    const quantity = parseInt(document.getElementById('purchaseQuantity').value);
    const errorElement = document.getElementById('purchaseError');
    const currentUser = getCurrentUser();

    errorElement.textContent = '';

    if (!productId || !quantity || quantity <= 0) {
        errorElement.textContent = 'Complete todos los campos correctamente';
        return;
    }

    try {
        const response = await fetch('api/movimientos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tipo: 'compra',
                producto_id: productId,
                cantidad: quantity,
                usuario_id: currentUser.id
            })
        });

        const data = await response.json();

        if (data.success) {
            closePurchaseModal();
            await loadData();
            renderMovements(movements);
        } else {
            errorElement.textContent = data.message;
        }
    } catch (error) {
        errorElement.textContent = 'Error de conexion';
        console.error(error);
    }
}