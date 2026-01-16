// Checkout System - Kalenjin Vibes
class CheckoutSystem {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('kalenjinvibes_cart')) || [];
        this.init();
    }

    init() {
        this.loadCartData();
        this.bindEvents();
        this.updateCheckoutButton();
    }

    loadCartData() {
        const cartBody = document.querySelector('.cart_table tbody');
        const subtotalEl = document.querySelector('.cart-subtotal .woocommerce-Price-amount');
        const totalEl = document.querySelector('.order-total .woocommerce-Price-amount');
        
        if (this.cart.length === 0) {
            cartBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="empty-cart">
                            <i class="fas fa-shopping-cart"></i>
                            <h3>Your cart is empty</h3>
                            <a href="shop.html" class="shop-link">Browse Shop</a>
                        </div>
                    </td>
                </tr>
            `;
            this.updateTotals(0, 0);
            return;
        }
        
        let cartHTML = '';
        let subtotal = 0;
        
        this.cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            cartHTML += `
                <tr class="cart_item fade-in">
                    <td class="cart-col-image">
                        <img src="${item.image || 'assets/img/placeholder.jpg'}" 
                             alt="${item.name}"
                             onerror="this.src='assets/img/placeholder.jpg'">
                    </td>
                    <td class="cart-col-productname">
                        <strong>${item.name}</strong>
                    </td>
                    <td class="cart-col-productname">
                        ${item.size || 'N/A'}
                    </td>
                    <td class="cart-col-productname">
                        ${item.color || 'N/A'}
                    </td>
                    <td class="cart-col-price">
                        Ksh ${item.price.toLocaleString()}
                    </td>
                    <td class="cart-col-quantity">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="checkout.updateQuantity(${index}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="checkout.updateQuantity(${index}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </td>
                    <td class="cart-col-total">
                        Ksh ${itemTotal.toLocaleString()}
                        <button class="remove-item" onclick="checkout.removeItem(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        cartBody.innerHTML = cartHTML;
        this.updateTotals(subtotal, subtotal);
    }

    updateQuantity(index, change) {
        this.cart[index].quantity += change;
        
        if (this.cart[index].quantity <= 0) {
            this.cart.splice(index, 1);
            this.showNotification('Item removed from cart');
        } else {
            this.showNotification('Quantity updated');
        }
        
        this.saveCart();
        this.loadCartData();
        this.updateCheckoutButton();
    }

    removeItem(index) {
        const itemName = this.cart[index].name;
        this.cart.splice(index, 1);
        this.saveCart();
        this.loadCartData();
        this.updateCheckoutButton();
        this.showNotification(`${itemName} removed from cart`);
    }

    saveCart() {
        localStorage.setItem('kalenjinvibes_cart', JSON.stringify(this.cart));
    }

    updateTotals(subtotal, total) {
        const subtotalEl = document.querySelector('.cart-subtotal .woocommerce-Price-amount bdi');
        const totalEl = document.querySelector('.order-total .woocommerce-Price-amount bdi');
        
        if (subtotalEl) {
            subtotalEl.innerHTML = `<span class="woocommerce-Price-currencySymbol">Ksh </span>${subtotal.toFixed(2)}`;
        }
        
        if (totalEl) {
            totalEl.innerHTML = `<span class="woocommerce-Price-currencySymbol">Ksh </span>${total.toFixed(2)}`;
        }
    }

    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            if (this.cart.length === 0) {
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'Cart is Empty';
            } else {
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'PROCEED TO PAYMENT';
            }
        }
    }

    proceedToPayment() {
        if (this.cart.length === 0) {
            this.showNotification('Your cart is empty', 'error');
            return;
        }
        
        // Calculate total amount
        const total = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Redirect to payments page with cart data
        window.location.href = `payments.html?type=cart&total=${total}`;
    }

    showNotification(message, type = 'success') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: type,
                title: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            alert(message);
        }
    }

    bindEvents() {
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.proceedToPayment();
            });
        }
    }
}

// Initialize checkout system
const checkout = new CheckoutSystem();

// Make checkout functions available globally
window.checkout = checkout;
window.updateQuantity = (index, change) => checkout.updateQuantity(index, change);
window.removeItem = (index) => checkout.removeItem(index);