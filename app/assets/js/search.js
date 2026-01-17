// Shop details page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Image thumbnail click functionality
    const thumbnails = document.querySelectorAll('.product-thumb-slide .thumb');
    const mainImage = document.getElementById('mainProductImage');
    
    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const imgSrc = this.getAttribute('data-image');
                if (imgSrc) {
                    mainImage.src = imgSrc;
                    
                    // Update active thumbnail
                    thumbnails.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
    }
    
    // Add to cart form
    const addToCartForm = document.getElementById('addToCartForm');
    
    if (addToCartForm) {
        addToCartForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const productId = formData.get('id');
            const productName = formData.get('product_name');
            const productImage = formData.get('product_image');
            const price = parseFloat(formData.get('price'));
            const quantity = parseInt(formData.get('quantity') || 1);
            const color = document.getElementById('colorSelect').value;
            const size = document.getElementById('sizeSelect').value;
            
            // Create product object
            const product = {
                id: productId,
                name: productName,
                image: productImage,
                price: price,
                quantity: quantity,
                color: color,
                size: size,
                dateAdded: new Date().toISOString()
            };
            
            // Add to cart
            if (typeof addToCart === 'function') {
                addToCart(product);
            } else {
                // Fallback if cart.js not loaded
                addToCartLocal(product);
            }
        });
    }
    
    // Quantity buttons
    const quantityMinus = document.querySelector('.quantity-minus');
    const quantityPlus = document.querySelector('.quantity-plus');
    const quantityInput = document.getElementById('quantity');
    
    if (quantityMinus && quantityInput) {
        quantityMinus.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value) || 1;
            if (currentValue > 1) {
                quantityInput.value = currentValue - 1;
            }
        });
    }
    
    if (quantityPlus && quantityInput) {
        quantityPlus.addEventListener('click', function() {
            let currentValue = parseInt(quantityInput.value) || 1;
            const maxValue = parseInt(quantityInput.getAttribute('max')) || 10;
            if (currentValue < maxValue) {
                quantityInput.value = currentValue + 1;
            }
        });
    }
    
    // Fallback add to cart function
    function addToCartLocal(product) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Check if product already exists in cart
        const existingItemIndex = cart.findIndex(item => 
            item.id === product.id && item.color === product.color && item.size === product.size
        );
        
        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart[existingItemIndex].quantity += product.quantity;
        } else {
            // Add new item to cart
            cart.push(product);
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart badge
        updateCartBadgeLocal();
        
        // Show success message
        showSuccessMessage(product.name);
    }
    
    function updateCartBadgeLocal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const badge = document.getElementById('cartBadge');
        if (badge) {
            badge.textContent = totalItems;
        }
    }
    
    function showSuccessMessage(productName) {
        // Use SweetAlert2 if available, otherwise use alert
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Added to Cart!',
                text: productName + ' has been added to your cart',
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            alert(productName + ' has been added to your cart');
        }
    }
});