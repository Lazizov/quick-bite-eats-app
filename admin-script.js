
// Admin Panel JavaScript

let categories = [];
let menuItems = [];
let orders = [];
let isLoggedIn = false;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    loadData();
    setupEventListeners();
});

// Check if user is already logged in
function checkLoginStatus() {
    const loginStatus = sessionStorage.getItem('adminLoggedIn');
    if (loginStatus === 'true') {
        isLoggedIn = true;
        showAdminPanel();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Category form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleAddCategory);
    }

    // Item form
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.addEventListener('submit', handleAddItem);
    }

    // File input handlers
    const categoryImageInput = document.getElementById('categoryImageInput');
    if (categoryImageInput) {
        categoryImageInput.addEventListener('change', handleCategoryImageUpload);
    }

    const itemImageInput = document.getElementById('itemImageInput');
    if (itemImageInput) {
        itemImageInput.addEventListener('change', handleItemImageUpload);
    }
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin') {
        isLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminPanel();
        showNotification('Добро пожаловать в админ панель!');
    } else {
        showNotification('Неверный логин или пароль!', 'error');
    }
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadCategories();
    loadItems();
    loadOrders();
}

// Logout
function logout() {
    isLoggedIn = false;
    sessionStorage.removeItem('adminLoggedIn');
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    
    // Clear forms
    document.getElementById('loginForm').reset();
}

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // Remove active class from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + 'Section').style.display = 'block';
    document.getElementById(section + 'NavBtn').classList.add('active');
}

// Load data from localStorage
function loadData() {
    const savedCategories = localStorage.getItem('adminCategories');
    const savedItems = localStorage.getItem('adminMenuItems');
    const savedOrders = localStorage.getItem('adminOrders');
    
    if (savedCategories) {
        try {
            categories = JSON.parse(savedCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
            categories = [];
        }
    }
    
    if (savedItems) {
        try {
            menuItems = JSON.parse(savedItems);
        } catch (error) {
            console.error('Error loading menu items:', error);
            menuItems = [];
        }
    }

    if (savedOrders) {
        try {
            orders = JSON.parse(savedOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
            orders = [];
        }
    }
}

// Save data to localStorage
function saveData() {
    try {
        localStorage.setItem('adminCategories', JSON.stringify(categories));
        localStorage.setItem('adminMenuItems', JSON.stringify(menuItems));
        localStorage.setItem('adminOrders', JSON.stringify(orders));
        
        // Update main website data
        updateMainWebsiteData();
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Ошибка сохранения данных!', 'error');
    }
}

// Update main website data
function updateMainWebsiteData() {
    try {
        localStorage.setItem('websiteCategories', JSON.stringify(categories));
        localStorage.setItem('websiteMenuItems', JSON.stringify(menuItems));
    } catch (error) {
        console.error('Error updating website data:', error);
    }
}

// File upload handlers
function handleCategoryImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imagePreview = document.getElementById('categoryImagePreview');
            if (imagePreview) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

function handleItemImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imagePreview = document.getElementById('itemImagePreview');
            if (imagePreview) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Category Management
function showAddCategoryForm() {
    document.getElementById('addCategoryForm').style.display = 'block';
}

function hideAddCategoryForm() {
    document.getElementById('addCategoryForm').style.display = 'none';
    document.getElementById('categoryForm').reset();
    const imagePreview = document.getElementById('categoryImagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
    }
}

function handleAddCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const imageInput = document.getElementById('categoryImageInput');
    
    if (!name) {
        showNotification('Введите название категории!', 'error');
        return;
    }

    if (!imageInput.files[0]) {
        showNotification('Выберите изображение для категории!', 'error');
        return;
    }
    
    // Check if category already exists
    if (categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Категория с таким названием уже существует!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const newCategory = {
            id: Date.now().toString(),
            name: name,
            image: event.target.result,
            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
            createdAt: new Date().toISOString()
        };
        
        categories.push(newCategory);
        saveData();
        loadCategories();
        updateCategorySelect();
        hideAddCategoryForm();
        
        showNotification('Категория успешно добавлена!');
    };
    reader.readAsDataURL(imageInput.files[0]);
}

function loadCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    if (categories.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Категории не найдены. Добавьте первую категорию.</p>';
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="item-card">
            <div class="item-info">
                <h3>${category.name}</h3>
                ${category.image ? `<img src="${category.image}" alt="${category.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin: 10px 0;">` : ''}
                <p>ID: ${category.id}</p>
                <p>Создано: ${new Date(category.createdAt).toLocaleString('ru-RU')}</p>
            </div>
            <div class="item-actions">
                <button class="delete-btn" onclick="deleteCategory('${category.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

function deleteCategory(categoryId) {
    if (confirm('Вы уверены, что хотите удалить эту категорию? Все блюда этой категории также будут удалены.')) {
        categories = categories.filter(cat => cat.id !== categoryId);
        menuItems = menuItems.filter(item => item.categoryId !== categoryId);
        
        saveData();
        loadCategories();
        loadItems();
        updateCategorySelect();
        
        showNotification('Категория удалена!');
    }
}

// Item Management
function showAddItemForm() {
    if (categories.length === 0) {
        showNotification('Сначала добавьте хотя бы одну категорию!', 'error');
        return;
    }
    
    updateCategorySelect();
    document.getElementById('addItemForm').style.display = 'block';
}

function hideAddItemForm() {
    document.getElementById('addItemForm').style.display = 'none';
    document.getElementById('itemForm').reset();
    const imagePreview = document.getElementById('itemImagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
    }
}

function updateCategorySelect() {
    const select = document.getElementById('itemCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите категорию</option>' + 
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

function handleAddItem(e) {
    e.preventDefault();
    
    const name = document.getElementById('itemName').value.trim();
    const categoryId = document.getElementById('itemCategory').value;
    const price = parseInt(document.getElementById('itemPrice').value);
    const description = document.getElementById('itemDescription').value.trim();
    const imageInput = document.getElementById('itemImageInput');
    
    if (!name || !categoryId || !price || !description) {
        showNotification('Заполните все обязательные поля!', 'error');
        return;
    }

    if (!imageInput.files[0]) {
        showNotification('Выберите изображение для блюда!', 'error');
        return;
    }
    
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
        showNotification('Выбранная категория не найдена!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const newItem = {
            id: Date.now().toString(),
            name: name,
            categoryId: categoryId,
            categorySlug: category.slug,
            price: price,
            image: event.target.result,
            description: description,
            createdAt: new Date().toISOString()
        };
        
        menuItems.push(newItem);
        saveData();
        loadItems();
        hideAddItemForm();
        
        showNotification('Блюдо успешно добавлено!');
    };
    reader.readAsDataURL(imageInput.files[0]);
}

function loadItems() {
    const container = document.getElementById('itemsList');
    if (!container) return;
    
    if (menuItems.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Блюда не найдены. Добавьте первое блюдо.</p>';
        return;
    }
    
    container.innerHTML = menuItems.map(item => {
        const category = categories.find(cat => cat.id === item.categoryId);
        return `
            <div class="item-card">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p><strong>Категория:</strong> ${category ? category.name : 'Неизвестно'}</p>
                    <p><strong>Цена:</strong> ${item.price.toLocaleString()} ₸</p>
                    <p><strong>Описание:</strong> ${item.description}</p>
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin: 10px 0;">` : ''}
                    <p><strong>Создано:</strong> ${new Date(item.createdAt).toLocaleString('ru-RU')}</p>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="deleteItem('${item.id}')">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteItem(itemId) {
    if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
        menuItems = menuItems.filter(item => item.id !== itemId);
        saveData();
        loadItems();
        showNotification('Блюдо удалено!');
    }
}

// Orders Management
function loadOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Заказы не найдены.</p>';
        return;
    }
    
    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = sortedOrders.map(order => `
        <div class="item-card order-card">
            <div class="item-info">
                <h3>Заказ #${order.id}</h3>
                <p><strong>Клиент:</strong> ${order.customerName}</p>
                <p><strong>Телефон:</strong> ${order.customerPhone}</p>
                <p><strong>Дата:</strong> ${new Date(order.createdAt).toLocaleString('ru-RU')}</p>
                <p><strong>Статус:</strong> <span class="order-status ${order.status}">${getOrderStatusText(order.status)}</span></p>
                <div class="order-items">
                    <strong>Заказ:</strong>
                    <ul>
                        ${order.items.map(item => `
                            <li>${item.name} - ${item.quantity} шт. × ${item.price} ₸ = ${(item.quantity * item.price).toLocaleString()} ₸</li>
                        `).join('')}
                    </ul>
                </div>
                <p><strong>Итого:</strong> ${order.total.toLocaleString()} ₸</p>
            </div>
            <div class="item-actions">
                <select onchange="updateOrderStatus('${order.id}', this.value)" class="status-select">
                    <option value="new" ${order.status === 'new' ? 'selected' : ''}>Новый</option>
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Готовится</option>
                    <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Готов</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                </select>
                <button class="delete-btn" onclick="deleteOrder('${order.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

function getOrderStatusText(status) {
    const statusTexts = {
        'new': 'Новый',
        'preparing': 'Готовится',
        'ready': 'Готов',
        'delivered': 'Доставлен'
    };
    return statusTexts[status] || 'Неизвестно';
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        saveData();
        showNotification('Статус заказа обновлен!');
    }
}

function deleteOrder(orderId) {
    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        orders = orders.filter(order => order.id !== orderId);
        saveData();
        loadOrders();
        showNotification('Заказ удален!');
    }
}

// Add new order (called from cart)
function addNewOrder(orderData) {
    const newOrder = {
        id: Date.now().toString(),
        customerName: orderData.customerName,
        customerPhone: orderData.customerPhone,
        items: orderData.items,
        total: orderData.total,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    saveData();
    
    if (document.getElementById('ordersList')) {
        loadOrders();
    }
}

// Make function available globally
window.addNewOrder = addNewOrder;

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#e74c3c' : '#27ae60',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
        zIndex: '2000',
        animation: 'slideInRight 0.3s ease-out'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize with default categories if none exist
function initializeDefaultData() {
    if (categories.length === 0) {
        console.log('Initializing with default data...');
        // We'll let users add their own categories with images
    }
}

// Listen for new orders from other pages
window.addEventListener('storage', function(e) {
    if (e.key === 'newOrder') {
        const orderData = JSON.parse(e.newValue);
        if (orderData) {
            addNewOrder(orderData);
            localStorage.removeItem('newOrder'); // Clean up
        }
    }
});

// Call initialization when admin panel loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDefaultData, 1000);
});
