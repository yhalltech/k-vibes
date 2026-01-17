// cart.js - SIMPLE WORKING VERSION
class ShoppingCart {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        console.log('🛒 Cart initializing...');
        
        // Load cart from localStorage
        this.loadFromStorage();
        
        // Bind events
        this.bindEvents();
        
        // Update display
        this.updateCartDisplay();
        
        // Make available globally
        window.cart = this;
        
        console.log('🛒 Cart ready!');
    }

    bindEvents() {
        console.log('Binding cart events...');
        
        // Cart icon click
        const cartIcon = document.getElementById('cartIconBtn');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCart();
            });
        }

        // Close button
        const cartClose = document.getElementById('cartClose');
        if (cartClose) {
            cartClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCart();
            });
        }

        // Overlay click
        const overlay = document.getElementById('cartOverlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeCart();
            });
        }

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCart();
            }
        });
    }

    openCart() {
        console.log('Opening cart...');
        
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeCart() {
        console.log('Closing cart...');
        
        const sidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    addItem(item) {
        console.log('Adding item:', item);
        
        // Validate item
        if (!item || !item.id || !item.name || !item.price) {
            console.error('Invalid item:', item);
            return false;
        }

        // Check if item already exists
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                ...item,
                quantity: 1,
                image: item.image || 'https://via.placeholder.com/80'
            });
        }

        // Update display and storage
        this.updateCartDisplay();
        this.saveToStorage();
        
        // Show notification
        this.showNotification(`Added ${item.name} to cart!`);
        
        // Auto-open cart on mobile
        if (window.innerWidth < 768) {
            setTimeout(() => this.openCart(), 300);
        }
        
        return true;
    }

    removeItem(index) {
        if (this.items[index]) {
            const itemName = this.items[index].name;
            this.items.splice(index, 1);
            
            this.updateCartDisplay();
            this.saveToStorage();
            
            this.showNotification(`Removed ${itemName} from cart`);
        }
    }

    updateQuantity(index, change) {
        if (this.items[index]) {
            const newQuantity = this.items[index].quantity + change;
            
            if (newQuantity < 1) {
                this.removeItem(index);
            } else {
                this.items[index].quantity = newQuantity;
                this.updateCartDisplay();
                this.saveToStorage();
            }
        }
    }

    updateCartDisplay() {
        const body = document.getElementById('cartBody');
        const footer = document.getElementById('cartFooter');
        const totalEl = document.getElementById('cartTotal');
        const badge = document.getElementById('cartBadge');

        if (!body || !footer || !totalEl || !badge) {
            console.error('Cart elements not found!');
            return;
        }

        // Update badge
        const totalItems = this.getTotalItems();
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';

        // Update body
        if (this.items.length === 0) {
            body.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <p class="text-muted">Add items from the shop to get started</p>
                    <a href="shop.html" class="btn-browse">Browse Shop</a>
                </div>
            `;
            footer.style.display = 'none';
            return;
        }

        // Show footer
        footer.style.display = 'block';

        // Calculate total
        let total = 0;
        let itemsHTML = '';

        this.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            itemsHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">Ksh ${item.price.toLocaleString()}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" onclick="cart.updateQuantity(${index}, -1)">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn increase" onclick="cart.updateQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="cart.removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        body.innerHTML = itemsHTML;
        totalEl.textContent = `Ksh ${total.toLocaleString()}`;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    clearCart() {
        this.items = [];
        this.updateCartDisplay();
        this.saveToStorage();
        this.showNotification('Cart cleared!');
    }

    showNotification(message) {
        // Remove existing notification
        const existing = document.querySelector('.cart-notification');
        if (existing) existing.remove();

        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    saveToStorage() {
        try {
            localStorage.setItem('kalenjinCart', JSON.stringify(this.items));
        } catch (e) {
            console.error('Failed to save cart:', e);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('kalenjinCart');
            if (saved) {
                this.items = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load cart:', e);
            this.items = [];
        }
    }
}

// Initialize cart when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing cart...');
    
    // Wait for cart elements to be loaded
    function initCart() {
        const cartIcon = document.getElementById('cartIconBtn');
        const cartSidebar = document.getElementById('cartSidebar');
        
        if (cartIcon && cartSidebar) {
            console.log('Cart elements found, creating cart...');
            window.cartInstance = new ShoppingCart();
            console.log('Cart created successfully:', window.cartInstance);
            
            // Add global function to add items
            window.addToCart = function(item) {
                if (window.cartInstance) {
                    return window.cartInstance.addItem(item);
                }
                return false;
            };
            
        } else {
            console.log('Waiting for cart elements...');
            setTimeout(initCart, 100);
        }
    }
    
    initCart();
});

// Add this to your shop page to test:
// <button onclick="addToCart({id: 1, name: 'Test Product', price: 1000, image: 'https://via.placeholder.com/80'})">
//     Add to Cart
// </button>