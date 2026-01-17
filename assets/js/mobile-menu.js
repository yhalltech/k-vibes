document.addEventListener('DOMContentLoaded', function() {
    console.log('Mobile Menu Initializing...');
    
    // Initialize function
    function initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileClose = document.getElementById('mobileClose');
        const cartSidebar = document.getElementById('cartSidebar');
        
        console.log('Mobile menu elements:', { mobileMenuToggle, mobileMenu, mobileClose });
        
        if (!mobileMenuToggle || !mobileMenu) {
            console.error('Mobile menu elements not found!');
            return;
        }
        
        // Open mobile menu
        function openMobileMenu() {
            console.log('Opening mobile menu');
            
            // Close cart if open
            if (cartSidebar && cartSidebar.classList.contains('active')) {
                if (window.cart && typeof window.cart.closeCart === 'function') {
                    window.cart.closeCart();
                }
            }
            
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Close mobile menu
        function closeMobileMenu() {
            console.log('Closing mobile menu');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Event listeners
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openMobileMenu();
        });
        
        mobileClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
        
        // Close menu when clicking links
        const mobileLinks = document.querySelectorAll('.mobile-nav a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });
        
        // Close menu when clicking outside (on overlay)
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                e.target !== mobileMenuToggle) {
                closeMobileMenu();
            }
        });
        
        console.log('Mobile menu initialized successfully');
    }
    
    // Wait for header to be loaded
    let attempts = 0;
    const maxAttempts = 20;
    
    function checkAndInit() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuToggle && mobileMenu) {
            console.log('Mobile menu elements found, initializing...');
            initMobileMenu();
        } else if (attempts < maxAttempts) {
            attempts++;
            console.log(`Waiting for mobile menu elements... attempt ${attempts}`);
            setTimeout(checkAndInit, 100);
        } else {
            console.error('Mobile menu elements not found after waiting');
        }
    }
    
    // Start checking
    checkAndInit();
});