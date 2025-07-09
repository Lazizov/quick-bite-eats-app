
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    renderCart();
});

function loadCart() {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCart() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const emptyCartContainer = document.getElementById('emptyCart');
    const orderSection = document.getElementById('orderSection');
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        cartTotalContainer.style.display = 'none';
        orderSection.style.display = 'none';
        emptyCartContainer.style.display = 'block';
        return;
    }
    
    cartItemsContainer.style.display = 'block';
    cartTotalContainer.style.display = 'block';
    orderSection.style.display = 'block';
    emptyCartContainer.style.display = 'none';
    
    // Render cart items
    cartItemsContainer.innerHTML = '';
    cart.forEach((item, index) => {
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
    });
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalContainer.innerHTML = `<h2>Итого: ${total.toLocaleString()} ₸</h2>`;
}

function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

function showOrderForm() {
    if (cart.length === 0) return;
    
    const modal = document.getElementById('orderModal');
    modal.classList.add('show');
}

function closeOrderForm() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('show');
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    
    // Clear cart and close window
    cart = [];
    saveCart();
    setTimeout(() => {
        window.close();
    }, 500);
}

// Handle order form submission
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
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
        cart.map(item => `• ${item.name}: ${item.quantity} шт. × ${item.price} ₸ = ${item.quantity * item.price} ₸`).join('\n') +
        `\n\n💰 Итого: ${total.toLocaleString()} ₸\n\n` +
        `📅 Время заказа: ${new Date().toLocaleString('ru-RU')}`;
    
    // Send to Telegram (simulated)
    sendToTelegram(orderText);
    
    // Close order form and show success
    closeOrderForm();
    document.getElementById('successModal').classList.add('show');
});

function sendToTelegram(orderText) {
    // This is a simulation of sending to Telegram
    // In a real application, you would send this to your Telegram bot API
    console.log('Заказ отправлен в Telegram:');
    console.log(orderText);
    
    // You can implement actual Telegram integration here
    // For example, using fetch to send to your bot's webhook
    /*
    fetch('YOUR_TELEGRAM_BOT_WEBHOOK_URL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: orderText
        })
    });
    */
}

// Phone number formatting
document.getElementById('customerPhone').addEventListener('input', function(e) {
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

// Close modals when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('show');
        }
    });
});
