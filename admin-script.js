

// Admin Panel JavaScript

// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = "https://uaaxqorizrzyoikqrkuo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYXhxb3JpenJ6eW9pa3Fya3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzM3MDksImV4cCI6MjA2NTkwOTcwOX0.piyGZBU6CPAeFQjOni71t169RJDHcJHIX-LlshXfvzY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Load data from Supabase
async function loadData() {
    try {
        // Load categories
        const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

        if (categoriesError) {
            console.error('Error loading categories:', categoriesError);
        } else {
            categories = categoriesData || [];
        }

        // Load menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: true });

        if (menuItemsError) {
            console.error('Error loading menu items:', menuItemsError);
        } else {
            menuItems = menuItemsData || [];
        }

        // Load orders
        const { data: ordersData, error: ordersError } = await supabase
            .from('restaurant_orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersError) {
            console.error('Error loading orders:', ordersError);
        } else {
            orders = ordersData || [];
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Save data is no longer needed as we save directly to Supabase
function saveData() {
    // This function is kept for compatibility but data is now saved directly to Supabase
    console.log('Data is now saved directly to Supabase');
}

// Update main website data is no longer needed as data comes from Supabase
function updateMainWebsiteData() {
    // This function is kept for compatibility but data now comes directly from Supabase
    console.log('Website data now comes directly from Supabase');
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

async function handleAddCategory(e) {
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
    reader.onload = async function(event) {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert({
                    name: name,
                    slug: slug,
                    image: event.target.result
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding category:', error);
                showNotification('Ошибка добавления категории!', 'error');
                return;
            }

            categories.push(data);
            loadCategories();
            updateCategorySelect();
            hideAddCategoryForm();
            
            showNotification('Категория успешно добавлена!');
        } catch (error) {
            console.error('Error adding category:', error);
            showNotification('Ошибка добавления категории!', 'error');
        }
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
                <p>Создано: ${new Date(category.created_at).toLocaleString('ru-RU')}</p>
            </div>
            <div class="item-actions">
                <button class="delete-btn" onclick="deleteCategory('${category.id}')">Удалить</button>
            </div>
        </div>
    `).join('');
}

async function deleteCategory(categoryId) {
    if (confirm('Вы уверены, что хотите удалить эту категорию? Все блюда этой категории также будут удалены.')) {
        try {
            // Delete menu items in this category first
            const { error: menuItemsError } = await supabase
                .from('menu_items')
                .delete()
                .eq('category_id', categoryId);

            if (menuItemsError) {
                console.error('Error deleting menu items:', menuItemsError);
                showNotification('Ошибка удаления блюд категории!', 'error');
                return;
            }

            // Delete the category
            const { error: categoryError } = await supabase
                .from('categories')
                .delete()
                .eq('id', categoryId);

            if (categoryError) {
                console.error('Error deleting category:', categoryError);
                showNotification('Ошибка удаления категории!', 'error');
                return;
            }

            // Update local data
            categories = categories.filter(cat => cat.id !== categoryId);
            menuItems = menuItems.filter(item => item.category_id !== categoryId);
            
            loadCategories();
            loadItems();
            updateCategorySelect();
            
            showNotification('Категория удалена!');
        } catch (error) {
            console.error('Error deleting category:', error);
            showNotification('Ошибка удаления категории!', 'error');
        }
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

async function handleAddItem(e) {
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
    reader.onload = async function(event) {
        try {
            const { data, error } = await supabase
                .from('menu_items')
                .insert({
                    name: name,
                    category_id: categoryId,
                    price: price,
                    description: description,
                    image: event.target.result
                })
                .select()
                .single();

            if (error) {
                console.error('Error adding menu item:', error);
                showNotification('Ошибка добавления блюда!', 'error');
                return;
            }

            menuItems.push(data);
            loadItems();
            hideAddItemForm();
            
            showNotification('Блюдо успешно добавлено!');
        } catch (error) {
            console.error('Error adding menu item:', error);
            showNotification('Ошибка добавления блюда!', 'error');
        }
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
        const category = categories.find(cat => cat.id === item.category_id);
        return `
            <div class="item-card">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p><strong>Категория:</strong> ${category ? category.name : 'Неизвестно'}</p>
                    <p><strong>Цена:</strong> ${item.price.toLocaleString()} ₸</p>
                    <p><strong>Описание:</strong> ${item.description}</p>
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin: 10px 0;">` : ''}
                    <p><strong>Создано:</strong> ${new Date(item.created_at).toLocaleString('ru-RU')}</p>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="deleteItem('${item.id}')">Удалить</button>
                </div>
            </div>
        `;
    }).join('');
}

async function deleteItem(itemId) {
    if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
        try {
            const { error } = await supabase
                .from('menu_items')
                .delete()
                .eq('id', itemId);

            if (error) {
                console.error('Error deleting menu item:', error);
                showNotification('Ошибка удаления блюда!', 'error');
                return;
            }

            menuItems = menuItems.filter(item => item.id !== itemId);
            loadItems();
            showNotification('Блюдо удалено!');
        } catch (error) {
            console.error('Error deleting menu item:', error);
            showNotification('Ошибка удаления блюда!', 'error');
        }
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
    const sortedOrders = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    container.innerHTML = sortedOrders.map(order => `
        <div class="item-card order-card">
            <div class="item-info">
                <h3>Заказ #${order.id.substring(0, 8)}</h3>
                <p><strong>Клиент:</strong> ${order.customer_name}</p>
                <p><strong>Телефон:</strong> ${order.customer_phone}</p>
                <p><strong>Дата:</strong> ${new Date(order.created_at).toLocaleString('ru-RU')}</p>
                <p><strong>Статус:</strong> <span class="order-status ${order.status}">${getOrderStatusText(order.status)}</span></p>
                <div class="order-items">
                    <strong>Заказ:</strong>
                    <ul>
                        ${Array.isArray(order.items) ? order.items.map(item => `
                            <li>${item.name} - ${item.quantity} шт. × ${item.price} ₸ = ${(item.quantity * item.price).toLocaleString()} ₸</li>
                        `).join('') : '<li>Ошибка загрузки данных заказа</li>'}
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

async function updateOrderStatus(orderId, newStatus) {
    try {
        const { error } = await supabase
            .from('restaurant_orders')
            .update({ 
                status: newStatus, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            showNotification('Ошибка обновления статуса заказа!', 'error');
            return;
        }

        // Update local data
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updated_at = new Date().toISOString();
        }

        showNotification('Статус заказа обновлен!');
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Ошибка обновления статуса заказа!', 'error');
    }
}

async function deleteOrder(orderId) {
    if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
        try {
            const { error } = await supabase
                .from('restaurant_orders')
                .delete()
                .eq('id', orderId);

            if (error) {
                console.error('Error deleting order:', error);
                showNotification('Ошибка удаления заказа!', 'error');
                return;
            }

            orders = orders.filter(order => order.id !== orderId);
            loadOrders();
            showNotification('Заказ удален!');
        } catch (error) {
            console.error('Error deleting order:', error);
            showNotification('Ошибка удаления заказа!', 'error');
        }
    }
}

// Add new order (no longer needed as orders come from Supabase)
function addNewOrder(orderData) {
    // This function is kept for compatibility but orders now come directly from Supabase
    console.log('Orders now come directly from Supabase');
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

// Listen for new orders from Supabase real-time (optional enhancement)
// You can implement real-time updates here if needed

// Call initialization when admin panel loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDefaultData, 1000);
});

