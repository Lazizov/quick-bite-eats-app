
// Admin Panel JavaScript

let categories = [];
let menuItems = [];
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
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }
    
    if (savedItems) {
        menuItems = JSON.parse(savedItems);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('adminCategories', JSON.stringify(categories));
    localStorage.setItem('adminMenuItems', JSON.stringify(menuItems));
    
    // Update main website data
    updateMainWebsiteData();
}

// Update main website data
function updateMainWebsiteData() {
    // Save to localStorage for main website to read
    localStorage.setItem('websiteCategories', JSON.stringify(categories));
    localStorage.setItem('websiteMenuItems', JSON.stringify(menuItems));
}

// Category Management
function showAddCategoryForm() {
    document.getElementById('addCategoryForm').style.display = 'block';
}

function hideAddCategoryForm() {
    document.getElementById('addCategoryForm').style.display = 'none';
    document.getElementById('categoryForm').reset();
}

function handleAddCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const emoji = document.getElementById('categoryEmoji').value.trim();
    
    if (!name || !emoji) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    
    // Check if category already exists
    if (categories.find(cat => cat.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Категория с таким названием уже существует!', 'error');
        return;
    }
    
    const newCategory = {
        id: Date.now().toString(),
        name: name,
        emoji: emoji,
        slug: name.toLowerCase().replace(/\s+/g, '-')
    };
    
    categories.push(newCategory);
    saveData();
    loadCategories();
    updateCategorySelect();
    hideAddCategoryForm();
    
    showNotification('Категория успешно добавлена!');
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
                <h3>${category.emoji} ${category.name}</h3>
                <p>ID: ${category.id}</p>
            </div>
            <div class="item-actions">
                <button class="delete-btn" onclick="deleteCategory('${category.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

function deleteCategory(categoryId) {
    if (confirm('Вы уверены, что хотите удалить эту категорию? Все блюда этой категории также будут удалены.')) {
        // Remove category
        categories = categories.filter(cat => cat.id !== categoryId);
        
        // Remove items of this category
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
}

function updateCategorySelect() {
    const select = document.getElementById('itemCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Выберите категорию</option>' + 
        categories.map(cat => `<option value="${cat.id}">${cat.emoji} ${cat.name}</option>`).join('');
}

function handleAddItem(e) {
    e.preventDefault();
    
    const name = document.getElementById('itemName').value.trim();
    const categoryId = document.getElementById('itemCategory').value;
    const price = parseInt(document.getElementById('itemPrice').value);
    const image = document.getElementById('itemImage').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    
    if (!name || !categoryId || !price || !description) {
        showNotification('Заполните все обязательные поля!', 'error');
        return;
    }
    
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) {
        showNotification('Выбранная категория не найдена!', 'error');
        return;
    }
    
    const newItem = {
        id: Date.now().toString(),
        name: name,
        categoryId: categoryId,
        categorySlug: category.slug,
        price: price,
        image: image || null,
        description: description,
        createdAt: new Date().toISOString()
    };
    
    menuItems.push(newItem);
    saveData();
    loadItems();
    hideAddItemForm();
    
    showNotification('Блюдо успешно добавлено!');
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
                    <p><strong>Категория:</strong> ${category ? category.emoji + ' ' + category.name : 'Неизвестно'}</p>
                    <p><strong>Цена:</strong> ${item.price.toLocaleString()} ₸</p>
                    <p><strong>Описание:</strong> ${item.description}</p>
                    ${item.image ? `<p><strong>Изображение:</strong> <a href="${item.image}" target="_blank">Ссылка</a></p>` : ''}
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

// Notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Initialize with default categories if none exist
function initializeDefaultData() {
    if (categories.length === 0) {
        const defaultCategories = [
            { id: '1', name: 'Пицца', emoji: '🍕', slug: 'pizza' },
            { id: '2', name: 'Бургеры', emoji: '🍔', slug: 'burgers' },
            { id: '3', name: 'Паста', emoji: '🍝', slug: 'pasta' },
            { id: '4', name: 'Салаты', emoji: '🥗', slug: 'salads' },
            { id: '5', name: 'Напитки', emoji: '🥤', slug: 'drinks' },
            { id: '6', name: 'Десерты', emoji: '🍰', slug: 'desserts' }
        ];
        
        categories = defaultCategories;
        saveData();
    }
}

// Call initialization when admin panel loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDefaultData, 1000);
});
