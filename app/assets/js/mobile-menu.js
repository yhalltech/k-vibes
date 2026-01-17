// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.vs-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const closeBtn = document.querySelector('.menu-close');
    const overlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');

    function openMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (menuToggle) menuToggle.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    if (overlay) overlay.addEventListener('click', closeMenu);
    
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });
});