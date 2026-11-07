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

// Floating homepage controls move to the adjacent section.
const scrollControls = document.querySelector('.scroll-controls');
if (scrollControls) {
  const upButton = scrollControls.querySelector('[data-scroll="up"]');
  const downButton = scrollControls.querySelector('[data-scroll="down"]');
  const sections = [...document.querySelectorAll('main > section, .footer')];
  const updateScrollControls = () => {
    upButton.disabled = window.scrollY <= 4;
    downButton.disabled = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  };
  scrollControls.addEventListener('click', (event) => {
    const button = event.target.closest('[data-scroll]');
    if (!button || button.disabled) return;
    const offset = document.querySelector('.nav').getBoundingClientRect().height + 12;
    const positions = sections.map(section => Math.max(0, section.getBoundingClientRect().top + window.scrollY - offset));
    const goingDown = button.dataset.scroll === 'down';
    const target = goingDown
      ? positions.find(position => position > window.scrollY + 8)
      : positions.reverse().find(position => position < window.scrollY - 8);
    window.scrollTo({
      top: target ?? (goingDown ? document.documentElement.scrollHeight : 0),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  });
  window.addEventListener('scroll', updateScrollControls, { passive: true });
  window.addEventListener('resize', updateScrollControls);
  updateScrollControls();
}

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

// Project gallery viewer
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const img = lightbox.querySelector('.lightbox__img');
  const title = lightbox.querySelector('.lightbox__title');
  const pos = lightbox.querySelector('.lightbox__pos');
  let images = [];
  let index = 0;

  const show = (i) => {
    index = (i + images.length) % images.length;
    img.src = images[index];
    img.alt = `${title.textContent} diagram ${index + 1} of ${images.length}`;
    pos.textContent = `${index + 1} / ${images.length}`;
  };

  document.querySelectorAll('.shot__thumb').forEach((thumb) =>
    thumb.addEventListener('click', () => {
      images = JSON.parse(thumb.dataset.images);
      title.textContent = thumb.dataset.title;
      lightbox.toggleAttribute('data-single', images.length < 2);
      show(0);
      lightbox.showModal();
    })
  );

  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1));
  lightbox.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
}
