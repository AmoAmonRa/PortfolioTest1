// Utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Theme toggle with localStorage
(function initTheme() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    root.setAttribute('data-theme', saved);
  } else {
    // Respect system preference
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  }
  $('#themeToggle').addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', current);
    localStorage.setItem('theme', current);
  });
})();

// Mobile nav
const hamburger = $('#hamburger');
const mobileNav = $('#mobileNav');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('.mobile-nav .nav-link').forEach(a => a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }));
}

// Smooth active link highlighting
const navLinks = $$('.nav-link');
const sections = ['about','skills','projects','experience','contact'].map(id => document.getElementById(id));
const obs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
sections.forEach(s => s && obs.observe(s));

// Scroll progress
const progress = $('#progress');
const updateProgress = () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop || document.body.scrollTop;
  const height = doc.scrollHeight - doc.clientHeight;
  const pct = height > 0 ? (scrollTop / height) * 100 : 0;
  progress.style.width = pct + '%';
};
document.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Back to top
const toTop = $('#toTop');
const toggleToTop = () => {
  const show = (window.scrollY || window.pageYOffset) > 600;
  toTop.classList.toggle('show', show);
};
document.addEventListener('scroll', toggleToTop, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Reveal on scroll
const revealObs = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
$$('.reveal').forEach(el => revealObs.observe(el));

// Counters
const counters = $$('[data-counter]');
const counterObs = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.getAttribute('data-counter'), 10);
    const dur = 1200;
    const start = performance.now();
    const from = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const val = Math.floor(from + (target - from) * p);
      el.textContent = val.toString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    counterObs.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach(c => counterObs.observe(c));

// Animate skill bars when visible
const bars = $$('.bar span');
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar = entry.target;
      const level = bar.getAttribute('data-level') || '0%';
      bar.style.width = level;
      barObs.unobserve(bar);
    }
  });
}, { threshold: 0.5 });
bars.forEach(b => barObs.observe(b));

// Tilt effect for project cards
const tiltEls = $$('[data-tilt]');
tiltEls.forEach(el => {
  let rect;
  const reset = () => el.style.transform = '';
  el.addEventListener('mousemove', (e) => {
    rect = rect || el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -6; // rotateX
    const ry = ((x / rect.width) - 0.5) * 6;   // rotateY
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  });
  el.addEventListener('mouseleave', reset);
  window.addEventListener('scroll', () => { rect = null; }, { passive: true });
  window.addEventListener('resize', () => { rect = null; });
});

// Contact form (mailto fallback)
const form = $('#contactForm');
const status = $('#formStatus');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  status.textContent = '';
  const data = new FormData(form);
  const name = data.get('name')?.toString().trim();
  const email = data.get('email')?.toString().trim();
  const message = data.get('message')?.toString().trim();
  if (!name || !email || !message) {
    status.textContent = 'Please fill in all fields.';
    status.style.color = 'var(--accent3)';
    return;
  }
  // Simple email format check
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!ok) {
    status.textContent = 'Please provide a valid email.';
    status.style.color = 'var(--accent3)';
    return;
  }
  const subject = encodeURIComponent('Portfolio Contact — ' + name);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  window.location.href = `mailto:your@email.com?subject=${subject}&body=${body}`;
  status.textContent = 'Opening your email client...';
  status.style.color = 'var(--muted)';
  form.reset();
});

// Download CV (generates a lightweight PDF via jsPDF CDN is external; instead generate a simple TXT)
const downloadBtn = $('#downloadCV');
downloadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const content = `Your Name
Full-Stack Developer
Email: your@email.com | Phone: +1 (555) 123-4567

Summary
Developer focused on performant, accessible web apps and scalable systems.

Skills
TypeScript, React, Next.js, Node.js, Express, PostgreSQL, AWS, Docker

Experience
Senior Frontend Engineer — Acme Corp (2023—Present)
Full-stack Developer — Studio XYZ (2021—2023)
Frontend Developer — Startup ABC (2019—2021)

Projects
- Analytics Dashboard (React, TS)
- Headless Storefront (Next.js)
- Habit Tracker (React Native)

Education
B.S. in Computer Science, University Name
`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'Your-Name-CV.txt';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

// Year
$('#year').textContent = new Date().getFullYear();