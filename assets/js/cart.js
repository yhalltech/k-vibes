
// Cart Component - Modular Cart System for Kalenjin Vibes

class CartComponent {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('kalenjinvibes_cart')) || [];
        this.init();
    }

    init() {
        this.createCartStructure();
        this.bindEvents();
        this.updateCartBadge();
        this.renderCart();
    }

    createCartStructure() {
        // Create cart overlay
        const cartOverlay = document.createElement('div');
        cartOverlay.className = 'cart-overlay';
        cartOverlay.id = 'cartOverlay';

        // Create cart sidebar
        const cartSidebar = document.createElement('div');
        cartSidebar.className = 'cart-sidebar';
        cartSidebar.id = 'cartSidebar';
        cartSidebar.innerHTML = `
            <div class="cart-header">
                <h3><i class="fas fa-shopping-bag me-2"></i>Shopping Cart</h3>
                <button class="cart-close" id="cartClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="cart-body" id="cartBody">
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="vs-btn style4 mt-3">Browse Shop</a>
                </div>
            </div>
            <div class="cart-footer" id="cartFooter" style="display: none;">
                <div class="cart-total">
                    <span>Total Amount:</span>
                    <span id="cartTotal">Ksh 0</span>
                </div>
                <a href="checkout.html" class="cart-checkout-btn">
                    <i class="fas fa-lock me-2"></i>Proceed to Checkout
                </a>
            </div>
        `;

        // Append to body
        document.body.appendChild(cartOverlay);
        document.body.appendChild(cartSidebar);
    }

    bindEvents() {
        // Toggle cart
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-icon-wrapper') || e.target.closest('.cart-icon')) {
                this.openCart();
            }
        });

        // Close cart
        document.getElementById('cartClose').addEventListener('click', () => this.closeCart());
        document.getElementById('cartOverlay').addEventListener('click', () => this.closeCart());

        // Close cart with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    openCart() {
        document.getElementById('cartSidebar').classList.add('active');
        document.getElementById('cartOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        this.renderCart(); // Refresh cart view
    }

    closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
        document.getElementById('cartOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const badges = document.querySelectorAll('.cart-badge');
        
        badges.forEach(badge => {
            badge.textContent = totalItems;
            if (totalItems > 0) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    renderCart() {
        const cartBody = document.getElementById('cartBody');
        const cartFooter = document.getElementById('cartFooter');
        const cartTotal = document.getElementById('cartTotal');
        
        if (this.cart.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="vs-btn style4 mt-3">Browse Shop</a>
                </div>
            `;
            cartFooter.style.display = 'none';
            return;
        }
        
        cartFooter.style.display = 'block';
        let total = 0;
        
        cartBody.innerHTML = this.cart.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            return `
                <div class="cart-item">
                    <img src="${item.image || 'assets/img/placeholder.jpg'}" 
                         alt="${item.name}" 
                         class="cart-item-image"
                         onerror="this.src='assets/img/placeholder.jpg'">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">Ksh ${item.price.toLocaleString()}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="cart.removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        }).join('');
        
        cartTotal.textContent = `Ksh ${total.toLocaleString()}`;
    }

    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        
        if (this.cart[index].quantity <= 0) {
            this.cart.splice(index, 1);
        }
        
        this.saveCart();
        this.updateCartBadge();
        this.renderCart();
        
        // Show notification
        if (change > 0) {
            this.showNotification('Item quantity updated');
        } else if (this.cart[index]) {
            this.showNotification('Item quantity updated');
        }
    }

    removeFromCart(index) {
        const itemName = this.cart[index].name;
        this.cart.splice(index, 1);
        this.saveCart();
        this.updateCartBadge();
        this.renderCart();
        this.showNotification(`${itemName} removed from cart`);
    }

    addToCart(item) {
        const existingItem = this.cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
            this.showNotification(`${item.name} quantity updated`);
        } else {
            this.cart.push({
                ...item,
                quantity: item.quantity || 1
            });
            this.showNotification(`${item.name} added to cart`);
            
            // Bounce animation for badge
            const badge = document.querySelector('.cart-badge');
            if (badge) {
                badge.classList.add('bounce');
                setTimeout(() => badge.classList.remove('bounce'), 300);
            }
        }
        
        this.saveCart();
        this.updateCartBadge();
        this.renderCart();
        
        // Auto-open cart on mobile
        if (window.innerWidth < 768) {
            setTimeout(() => this.openCart(), 300);
        }
    }

    saveCart() {
        localStorage.setItem('kalenjinvibes_cart', JSON.stringify(this.cart));
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartBadge();
        this.renderCart();
        this.showNotification('Cart cleared');
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #25D366;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart globally
window.cart = new CartComponent();

// Make cart functions available globally
window.addToCart = (item) => cart.addToCart(item);
window.clearCart = () => cart.clearCart();
window.openCart = () => cart.openCart();
window.closeCart = () => cart.closeCart();

// Add cart icon to any element with class 'cart-icon-placeholder'
document.addEventListener('DOMContentLoaded', function() {
    const cartPlaceholders = document.querySelectorAll('.cart-icon-placeholder');
    
    cartPlaceholders.forEach(placeholder => {
        placeholder.innerHTML = `
            <div class="cart-icon-wrapper">
                <i class="fas fa-shopping-bag"></i>
                <span class="cart-badge" style="display: none;">0</span>
            </div>
        `;
    });
    
    // Update initial badge count
    if (window.cart) {
        window.cart.updateCartBadge();
    }
});