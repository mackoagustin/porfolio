let hamburgerMenu =  document.getElementById('hamburger-menu');
let navMenu = document.querySelector('.nav-menu')

hamburgerMenu.addEventListener('click', () => {
    navMenu.classList.toggle('show')
})