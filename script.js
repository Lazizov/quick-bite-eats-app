
let cart = [];
let currentItem = null;
let currentQuantity = 1;

// Smooth scroll to menu
function scrollToMenu() {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// Category filtering
document.addEventListener('DOMContentLoaded', function() {
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
        menuItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.classList.remove('hidden');
                item.style.animation = 'fadeInUp 0.5s ease-out';
            } else {
                item.classList.add('hidden');
            }
        });
    }
});

// Modal functions
function openModal(name, price) {
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
    if (!currentItem) return;
    
    const existingItem = cart.find(item => item.name === currentItem.name);
    
    if (existingItem) {
        existingItem.quantity += currentQuantity;
    } else {
        cart.push({
            name: currentItem.name,
            price: currentItem.price,
            quantity: currentQuantity
        });
    }
    
    updateCartCount();
    closeModal();
    showNotification(`${currentItem.name} добавлен в корзину!`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
    
    // Save to localStorage
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function openCart() {
    // Save cart to localStorage before opening cart page
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
    // Open cart page
    window.open('cart.html', '_blank');
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Load cart from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
});

// Close modal when clicking outside
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
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
`;
document.head.appendChild(style);
