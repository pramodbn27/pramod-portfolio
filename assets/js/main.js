// Theme toggle (initial theme is set inline in <head> to avoid a flash)
const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');

themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  themeToggle.setAttribute('aria-label', next === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  try { localStorage.setItem('theme', next); } catch (e) { /* storage unavailable */ }
});

// Mobile menu
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('nav-menu');

toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
});

menu.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Fade sections in as they scroll into view
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section .container').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}
