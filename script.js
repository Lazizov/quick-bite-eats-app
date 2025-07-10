

let cart = [];
let currentItem = null;
let currentQuantity = 1;

// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = "https://uaaxqorizrzyoikqrkuo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhYXhxb3JpenJ6eW9pa3Fya3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMzM3MDksImV4cCI6MjA2NTkwOTcwOX0.piyGZBU6CPAeFQjOni71t169RJDHcJHIX-LlshXfvzY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Smooth scroll to menu
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// Category filtering
document.addEventListener('DOMContentLoaded', function() {
    initializeFiltering();
    loadDynamicContent();
    loadCartFromStorage();
});

function initializeFiltering() {
    const categoryItems = document.querySelectorAll('.category-item');
    const menuItems = document.querySelectorAll('.menu-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all categories
            categoryItems.forEach(cat => cat.classList.remove('active'));
            // Add active to clicked category
            this.classList.add('active');
            
            const category = this.dataset.category;
            filterItems(category);
        });
    });
    
    function filterItems(category) {
        const allMenuItems = document.querySelectorAll('.menu-item');
        allMenuItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeInUp 0.5s ease-out';
            } else {
                item.classList.add('hidden');
            }
        });
    }
}

// Load dynamic content from Supabase
function loadDynamicContent() {
    loadDynamicCategories();
    loadDynamicMenuItems();
}

async function loadDynamicCategories() {
    try {
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading categories:', error);
            return;
        }

        if (!categories || categories.length === 0) return;

        const categoriesContainer = document.querySelector('.categories');
        if (!categoriesContainer) return;
        
        // Keep the "All" category and add dynamic ones
        const allCategory = categoriesContainer.querySelector('[data-category="all"]');
        if (!allCategory) return;
        
        // Remove existing dynamic categories
        const existingCategories = categoriesContainer.querySelectorAll('.category-item:not([data-category="all"])');
        existingCategories.forEach(cat => cat.remove());
        
        // Add new categories
        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';
            categoryElement.setAttribute('data-category', category.slug);
            
            categoryElement.innerHTML = `
                <div class="category-image">
                    ${category.image ? 
                        `<img src="${category.image}" alt="${category.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;">` :
                        `<span style="font-size: 2rem;">📂</span>`
                    }
                </div>
                <span>${category.name}</span>
            `;
            
            // Add click event listener
            categoryElement.addEventListener('click', function() {
                // Remove active class from all categories
                document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('active'));
                // Add active to clicked category
                this.classList.add('active');
                
                const categorySlug = this.dataset.category;
                filterItems(categorySlug);
            });
            
            categoriesContainer.appendChild(categoryElement);
        });
        
        console.log(`Загружено ${categories.length} динамических категорий`);
    } catch (error) {
        console.error('Error loading dynamic categories:', error);
    }
}

async function loadDynamicMenuItems() {
    try {
        const { data: menuItems, error: itemsError } = await supabase
            .from('menu_items')
            .select(`
                *,
                categories (
                    id,
                    name,
                    slug
                )
            `)
            .order('created_at', { ascending: true });

        if (itemsError) {
            console.error('Error loading menu items:', itemsError);
            return;
        }

        if (!menuItems || menuItems.length === 0) return;
        
        const menuContainer = document.getElementById('menuItems');
        if (!menuContainer) return;
        
        // Remove existing dynamic items
        const existingDynamicItems = menuContainer.querySelectorAll('.menu-item[data-dynamic="true"]');
        existingDynamicItems.forEach(item => item.remove());
        
        // Add new dynamic items
        menuItems.forEach(item => {
            const category = item.categories;
            if (!category) return;
            
            const menuElement = document.createElement('div');
            menuElement.className = 'menu-item';
            menuElement.setAttribute('data-category', category.slug);
            menuElement.setAttribute('data-dynamic', 'true');
            
            const imageContent = item.image ? 
                `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` :
                `<div style="background: linear-gradient(45deg, #ff6b6b, #ff8e8e); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 4rem; color: white;">🍽️</div>`;
            
            menuElement.innerHTML = `
                <div class="item-image">
                    ${imageContent}
                </div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="item-price">${item.price.toLocaleString()} ₸</div>
                    <button class="add-btn" onclick="openModal('${item.name}', ${item.price})">В корзину</button>
                </div>
            `;
            
            menuContainer.appendChild(menuElement);
        });
        
        console.log(`Загружено ${menuItems.length} динамических блюд`);
        
        // Re-initialize filtering for new items
        initializeFiltering();
    } catch (error) {
        console.error('Error loading dynamic menu items:', error);
    }
}

// Modal functions
function openModal(name, price) {
    console.log('Opening modal for:', name, price);
    currentItem = { name, price };
    currentQuantity = 1;
    
    document.getElementById('modalTitle').textContent = name;
    document.getElementById('quantity').textContent = currentQuantity;
    
    const modal = document.getElementById('modal');
    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
    currentItem = null;
    currentQuantity = 1;
}

function changeQuantity(delta) {
    currentQuantity = Math.max(1, currentQuantity + delta);
    document.getElementById('quantity').textContent = currentQuantity;
}

function addToCart() {
    if (!currentItem) {
        console.error('No current item to add to cart');
        return;
    }
    
    console.log('Adding to cart:', currentItem, 'quantity:', currentQuantity);
    
    const existingItem = cart.find(item => item.name === currentItem.name);
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
        console.log('Updated existing item:', existingItem);
    } else {
        const newItem = {
            name: currentItem.name,
            price: currentItem.price,
            quantity: currentQuantity
        };
        cart.push(newItem);
        console.log('Added new item:', newItem);
    }
    
    console.log('Cart after addition:', cart);
    updateCartCount();
    closeModal();
    showNotification(`${currentItem.name} добавлен в корзину!`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
    
    console.log('Cart count updated:', totalItems);
    console.log('Current cart:', cart);
    
    // Save to localStorage
    try {
        localStorage.setItem('restaurantCart', JSON.stringify(cart));
        console.log('Cart saved to localStorage');
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
}

function openCart() {
    console.log('Opening cart with items:', cart);
    // Save cart to localStorage before opening cart page
    try {
        localStorage.setItem('restaurantCart', JSON.stringify(cart));
        // Open cart page
        window.open('cart.html', '_blank');
    } catch (error) {
        console.error('Error opening cart:', error);
    }
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f39c12;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Load cart from localStorage on page load
function loadCartFromStorage() {
    console.log('Loading cart from localStorage');
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('Cart loaded from localStorage:', cart);
            
            // Validate cart data
            if (!Array.isArray(cart)) {
                console.error('Invalid cart data, resetting');
                cart = [];
            } else {
                // Filter out invalid items
                cart = cart.filter(item => 
                    item && 
                    typeof item === 'object' && 
                    item.name && 
                    typeof item.price === 'number' && 
                    typeof item.quantity === 'number'
                );
            }
            
            updateCartCount();
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            cart = [];
        }
    } else {
        console.log('No saved cart found');
        cart = [];
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Listen for storage changes (cart updates)
    window.addEventListener('storage', function(e) {
        if (e.key === 'restaurantCart') {
            loadCartFromStorage();
        }
    });
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .hidden {
        display: none !important;
    }
`;
document.head.appendChild(style);

