
let cart = [];

// Telegram bot settings - добавьте ваши настройки здесь
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';

document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart page loaded');
    loadCart();
    renderCart();
});

function loadCart() {
    const savedCart = localStorage.getItem('restaurantCart');
    console.log('Raw localStorage data:', savedCart);
    
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log('Parsed cart data:', cart);
            console.log('Cart length:', cart.length);
            console.log('Cart is array:', Array.isArray(cart));
        } catch (error) {
            console.error('Error parsing cart data:', error);
            cart = [];
        }
    } else {
        console.log('No cart data found in localStorage');
        cart = [];
    }
    
    // Дополнительная проверка структуры данных
    if (!Array.isArray(cart)) {
        console.error('Cart is not an array, resetting to empty array');
        cart = [];
    }
    
    console.log('Final cart after loading:', cart);
}

function saveCart() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart);
}

function renderCart() {
    console.log('=== RENDER CART START ===');
    console.log('Current cart:', cart);
    console.log('Cart length:', cart.length);
    
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const emptyCartContainer = document.getElementById('emptyCart');
    const orderSection = document.getElementById('orderSection');
    
    console.log('Cart elements found:', {
        cartItems: !!cartItemsContainer,
        cartTotal: !!cartTotalContainer,
        emptyCart: !!emptyCartContainer,
        orderSection: !!orderSection
    });
    
    if (!cartItemsContainer || !cartTotalContainer || !emptyCartContainer || !orderSection) {
        console.error('Required cart elements not found in DOM');
        return;
    }
    
    if (!cart || cart.length === 0) {
        console.log('Cart is empty, showing empty state');
        cartItemsContainer.style.display = 'none';
        cartTotalContainer.style.display = 'none';
        orderSection.style.display = 'none';
        emptyCartContainer.style.display = 'block';
        return;
    }
    
    console.log('Cart has items, showing cart content');
    cartItemsContainer.style.display = 'block';
    cartTotalContainer.style.display = 'block';
    orderSection.style.display = 'block';
    emptyCartContainer.style.display = 'none';
    
    // Render cart items
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        console.log(`Rendering item ${index}:`, item);
        
        // Проверка валидности элемента
        if (!item || typeof item !== 'object') {
            console.error(`Invalid item at index ${index}:`, item);
            return;
        }
        
        if (!item.name || !item.price || !item.quantity) {
            console.error(`Item missing required properties at index ${index}:`, item);
            return;
        }
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price} ₸ за штуку</div>
            </div>
            <div class="item-controls">
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="changeQuantity(${index}, -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">Удалить</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
        console.log(`Item ${index} rendered successfully`);
    });
    
    // Update total
    const total = cart.reduce((sum, item) => {
        if (item && typeof item.price === 'number' && typeof item.quantity === 'number') {
            return sum + (item.price * item.quantity);
        }
        console.error('Invalid item for total calculation:', item);
        return sum;
    }, 0);
    
    console.log('Total calculated:', total);
    cartTotalContainer.innerHTML = `<h2>Итого: ${total.toLocaleString()} ₸</h2>`;
    
    console.log('=== RENDER CART END ===');
}

function changeQuantity(index, delta) {
    console.log('Changing quantity for item', index, 'by', delta);
    if (cart[index]) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        renderCart();
    }
}

function removeItem(index) {
    console.log('Removing item at index', index);
    if (cart[index]) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }
}

function showOrderForm() {
    if (cart.length === 0) {
        console.log('Cannot show order form - cart is empty');
        return;
    }
    
    console.log('Showing order form');
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeOrderForm() {
    console.log('Closing order form');
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function closeSuccessModal() {
    console.log('Closing success modal');
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Clear cart and close window
    cart = [];
    saveCart();
    setTimeout(() => {
        window.close();
    }, 500);
}

// Handle order form submission
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Order form submitted');
            
            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            
            if (!name || !phone) {
                alert('Пожалуйста, заполните все поля');
                return;
            }
            
            // Prepare order data
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const orderText = `🍽️ Новый заказ из ресторана "Каусар"!\n\n` +
                `👤 Клиент: ${name}\n` +
                `📞 Телефон: ${phone}\n\n` +
                `📋 Заказ:\n` +
                cart.map(item => `• ${item.name}: ${item.quantity} шт. × ${item.price} ₸ = ${(item.quantity * item.price).toLocaleString()} ₸`).join('\n') +
                `\n\n💰 Итого: ${total.toLocaleString()} ₸\n\n` +
                `📅 Время заказа: ${new Date().toLocaleString('ru-RU')}`;
            
            console.log('Sending order to Telegram:', orderText);
            
            // Send to Telegram
            sendToTelegram(orderText);
            
            // Close order form and show success
            closeOrderForm();
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.classList.add('show');
            }
        });
    }
});

async function sendToTelegram(orderText) {
    console.log('Attempting to send to Telegram...');
    
    // Проверяем, настроены ли параметры Telegram
    if (TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE' || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.log('Telegram not configured, showing message in console only');
        console.log('=== ЗАКАЗ ДЛЯ TELEGRAM ===');
        console.log(orderText);
        console.log('=== КОНЕЦ ЗАКАЗА ===');
        
        // Показываем пользователю что заказ готов, но не отправлен
        alert('Заказ сформирован! Telegram бот не настроен. Проверьте консоль для деталей заказа.');
        return;
    }
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: orderText,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();
        
        if (result.ok) {
            console.log('Order sent to Telegram successfully');
        } else {
            console.error('Failed to send to Telegram:', result);
            console.log('Order details (fallback):', orderText);
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        console.log('Order details (fallback):', orderText);
    }
}

// Phone number formatting
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('customerPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0 && value[0] !== '7') {
                value = '7' + value;
            }
            
            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = '+7';
                if (value.length > 1) {
                    formattedValue += ' (' + value.substring(1, 4);
                }
                if (value.length > 4) {
                    formattedValue += ') ' + value.substring(4, 7);
                }
                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
            }
            
            e.target.value = formattedValue;
        });
    }
});

// Close modals when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    });
});

// Дополнительная функция для отладки - вызывать из консоли
window.debugCart = function() {
    console.log('=== DEBUG CART INFO ===');
    console.log('localStorage data:', localStorage.getItem('restaurantCart'));
    console.log('Current cart variable:', cart);
    console.log('Cart length:', cart ? cart.length : 'undefined');
    console.log('=======================');
};
