// Cart Component - Fixed to work with header.html

class CartComponent {
    constructor() {
        // Use in-memory storage instead of localStorage
        this.cart = [];
        this.init();
    }

    init() {
        // Don't create cart structure - use existing from header.html
        this.bindEvents();
        this.updateCartBadge();
        this.renderCart();
    }

    bindEvents() {
        // Cart elements from header.html
        const cartIconBtn = document.getElementById('kvCartIconBtn');
        const cartClose = document.getElementById('kvCartClose');
        const cartOverlay = document.getElementById('kvCartOverlay');

        // Toggle cart
        if (cartIconBtn) {
            cartIconBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCart();
            });
        }

        // Close cart
        if (cartClose) {
            cartClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCart();
            });
        }

        if (cartOverlay) {
            cartOverlay.addEventListener('click', () => this.closeCart());
        }

        // Close cart with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    openCart() {
        const cartSidebar = document.getElementById('kvCartSidebar');
        const cartOverlay = document.getElementById('kvCartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.renderCart(); // Refresh cart view
        }
    }

    closeCart() {
        const cartSidebar = document.getElementById('kvCartSidebar');
        const cartOverlay = document.getElementById('kvCartOverlay');
        
        if (cartSidebar && cartOverlay) {
            cartSidebar.classList.remove('active');
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('kvCartBadge');
        
        if (badge) {
            badge.textContent = totalItems;
            if (totalItems > 0) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    renderCart() {
        const cartBody = document.getElementById('kvCartBody');
        const cartFooter = document.getElementById('kvCartFooter');
        const cartTotal = document.getElementById('kvCartTotal');
        
        if (!cartBody) return;
        
        if (this.cart.length === 0) {
            cartBody.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="shop.html" class="vs-btn style4 mt-3">Browse Shop</a>
                </div>
            `;
            if (cartFooter) cartFooter.style.display = 'none';
            return;
        }
        
        if (cartFooter) cartFooter.style.display = 'block';
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
        
        if (cartTotal) {
            cartTotal.textContent = `Ksh ${total.toLocaleString()}`;
        }
    }

    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        
        if (this.cart[index].quantity <= 0) {
            this.cart.splice(index, 1);
        }
        
        this.updateCartBadge();
        this.renderCart();
        
        if (change > 0) {
            this.showNotification('Item quantity updated');
        } else if (this.cart[index]) {
            this.showNotification('Item quantity updated');
        }
    }

    removeFromCart(index) {
        const itemName = this.cart[index].name;
        this.cart.splice(index, 1);
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
            const badge = document.getElementById('kvCartBadge');
            if (badge) {
                badge.classList.add('bounce');
                setTimeout(() => badge.classList.remove('bounce'), 300);
            }
        }
        
        this.updateCartBadge();
        this.renderCart();
        
        // Auto-open cart on mobile
        if (window.innerWidth < 768) {
            setTimeout(() => this.openCart(), 300);
        }
    }

    clearCart() {
        this.cart = [];
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
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
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
        if (!document.getElementById('cart-notification-styles')) {
            style.id = 'cart-notification-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.cart = new CartComponent();
    });
} else {
    window.cart = new CartComponent();
}

// Make cart functions available globally
window.addToCart = (item) => window.cart && window.cart.addToCart(item);
window.clearCart = () => window.cart && window.cart.clearCart();
window.openCart = () => window.cart && window.cart.openCart();
window.closeCart = () => window.cart && window.cart.closeCart();