
const header = document.querySelector('.site-header');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  navToggle.textContent = open ? '✕' : '☰';
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = '☰';
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('[data-modal-open]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
});

document.querySelectorAll('[data-modal-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(closeModal);
});

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const name = new FormData(contactForm).get('name');
  formStatus.textContent = `Gràcies, ${name}. La consulta s'ha registrat correctament (demo).`;
  contactForm.reset();
});

document.querySelectorAll('.demo-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.querySelector('.mini-status').textContent = 'Funcionalitat de demostració: formulari validat correctament.';
    form.reset();
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
