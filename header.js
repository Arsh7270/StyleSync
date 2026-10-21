const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const closeBtn = document.querySelector('.close-btn i');

hamburger.addEventListener('click', () => {
  navMenu.classList.add('active');
});

closeBtn.addEventListener('click', () => {
  navMenu.classList.remove('active');
});


document.querySelectorAll('.nav-link').forEach(n =>
  n.addEventListener('click', () => {
    navMenu.classList.remove('active');
  })
);
