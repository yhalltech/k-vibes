// File: mobile-menu-enhanced.js (Updated)
[file content begin]
// Enhanced Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Social Dropdown
    const mobileSocialToggle = document.getElementById('mobileSocialToggle');
    const mobileSocialMenu = document.getElementById('mobileSocialMenu');
    
    if (mobileSocialToggle && mobileSocialMenu) {
        mobileSocialToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mobileSocialMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileSocialToggle.contains(e.target) && !mobileSocialMenu.contains(e.target)) {
                mobileSocialMenu.classList.remove('show');
            }
        });
    }
    
    // Mobile Menu Elements
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    
    // Search Elements
    const searchToggle = document.getElementById('searchToggle');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');
    const searchToggleMobile = document.querySelector('.search-toggle-mobile');
    
    // Mobile Menu Functionality
    function openMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Search Modal Functionality
    function openSearchModal() {
        if (searchModal) {
            searchModal.classList.add('active');
            document.getElementById('searchInput')?.focus();
        }
    }
    
    function closeSearchModal() {
        if (searchModal) {
            searchModal.classList.remove('active');
        }
    }
    
    // Event Listeners
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            openMobileMenu();
        });
    }
    
    if (mobileClose) {
        mobileClose.addEventListener('click', closeMobileMenu);
    }
    
    if (searchToggle) {
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            openSearchModal();
        });
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', closeSearchModal);
    }
    
    if (searchToggleMobile) {
        searchToggleMobile.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
            setTimeout(openSearchModal, 300);
        });
    }
    
    // Close mobile menu when clicking links
    mobileLinks.forEach(link => {
        if (!link.classList.contains('search-toggle-mobile')) {
            link.addEventListener('click', closeMobileMenu);
        }
    });
    
    // Close modals when clicking outside
    if (searchModal) {
        searchModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeSearchModal();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeSearchModal();
            if (mobileSocialMenu) {
                mobileSocialMenu.classList.remove('show');
            }
        }
        
        // Ctrl/Cmd + K opens search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
    });
    
    // Set active navigation item
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.main-menu a, .mobile-nav a');
    navItems.forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.parentElement.classList.add('active');
        }
    });
});
[file content end]