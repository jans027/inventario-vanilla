/**
 * Layout module
 * Injects the header and sidebar into every page
 * Also handles the active menu item and user info
 */

/**
 * Get the current page filename from the URL
 * @returns {string} The current page name (e.g., 'dashboard.html')
 */
function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);
    return page || 'index.html';
}

/**
 * Build the header HTML
 * @returns {string} The header HTML string
 */
function buildHeader() {
    const user = getCurrentUser();
    const userName = user ? user.name : 'Invitado';

    return `
        <header class="header">
            <div class="header-left">
                <h1>Ferreteria Caldas</h1>
            </div>
            <div class="header-right">
                <span class="user-name">${userName}</span>
                <button class="btn-logout" onclick="logout()">Cerrar Sesion</button>
            </div>
        </header>
    `;
}

/**
 * Build the sidebar HTML with active item highlighted
 * @returns {string} The sidebar HTML string
 */
function buildSidebar() {
    const currentPage = getCurrentPage();

    // Menu items configuration
    const menuItems = [
        { page: 'dashboard.html', text: 'Dashboard', short: 'D' },
        { page: 'productos.html', text: 'Productos', short: 'P' },
        { page: 'movimientos.html', text: 'Movimientos', short: 'M' },
        { page: 'usuarios.html', text: 'Usuarios', short: 'U' },
        { page: 'reportes.html', text: 'Reportes', short: 'R' }
    ];

    // Build each menu item
    const itemsHtml = menuItems.map(item => {
        const activeClass = currentPage === item.page ? 'active' : '';
        return `
            <li class="${activeClass}">
                <a href="${item.page}">
                    <span class="nav-text">${item.text}</span>
                    <span class="nav-short">${item.short}</span>
                </a>
            </li>
        `;
    }).join('');

    return `
        <nav class="sidebar">
            <ul>
                ${itemsHtml}
            </ul>
        </nav>
    `;
}

/**
 * Inject header and sidebar into the page
 * Runs automatically when the DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only inject on protected pages (those with containers)
    const headerContainer = document.getElementById('headerContainer');
    const sidebarContainer = document.getElementById('sidebarContainer');

    // Check authentication on protected pages
    if (headerContainer && sidebarContainer) {
        requireAuth();
        headerContainer.innerHTML = buildHeader();
        sidebarContainer.innerHTML = buildSidebar();
    }
});