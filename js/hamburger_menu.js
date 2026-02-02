let hamburgerMenu = document.getElementById('hamburger-menu');
let navMenu = document.querySelector('.nav-menu');

if (hamburgerMenu && navMenu) {
    hamburgerMenu.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });
}