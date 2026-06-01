import { createIcons, Server, Layout, Database, Cloud, Cpu, Terminal, CheckCircle2, Github, ExternalLink, Mail, Phone, Linkedin } from 'lucide';
import { initBackgroundParticles, initHeroHologram } from './three-scene.js';

// Initialize Lucide Icons
createIcons({
  icons: {
    Server,
    Layout,
    Database,
    Cloud,
    Cpu,
    Terminal,
    CheckCircle2,
    Github,
    ExternalLink,
    Mail,
    Phone,
    Linkedin
  }
});

// Initialize 3D Scenes
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundParticles();
  // initHeroHologram();
  initTerminalLoader();
  initMouseGlow();
  initCardEffects();
  initScrollAnimations();
  initContactForm();
  initMobileMenu();
  initAvatarTransparency();
});

/* ==========================================================================
   1. Terminal Loading Sequence
   ========================================================================== */
function initTerminalLoader() {
  const loader = document.getElementById('loader');
  const terminalBody = document.getElementById('loader-terminal-body');
  const progressBar = document.getElementById('loader-fill');
  const percentText = document.getElementById('loader-percent');

  if (!loader || !terminalBody) return;

  const logs = [
    'Initializing Antigravity Neural OS...',
    'Loading core WebGL graphics kernels...',
    'Establishing secure sockets handshake...',
    'Allocating database buffers: PostgreSQL, MongoDB, Redis...',
    'Loading AI models: GPT-4, Stable Diffusion v2.1...',
    'Mounting cloud nodes EC2, S3, RDS...',
    'Verifying sandbox routing configuration...',
    'Loading Full-Stack portfolio workspace...',
    'System ready. Access granted.'
  ];

  let logIndex = 0;
  let progress = 0;

  // Add lines step-by-step
  function addLogLine() {
    if (logIndex < logs.length) {
      const line = document.createElement('div');
      line.className = 'terminal-line';
      line.textContent = `> ${logs[logIndex]}`;
      terminalBody.appendChild(line);
      terminalBody.scrollTop = terminalBody.scrollHeight;
      logIndex++;

      // Schedule next log
      setTimeout(addLogLine, 200 + Math.random() * 200);
    }
  }

  // Update progress bar
  function updateProgress() {
    if (progress < 100) {
      progress += Math.floor(Math.random() * 8) + 1;
      if (progress > 100) progress = 100;

      progressBar.style.width = `${progress}%`;
      percentText.textContent = `${String(progress).padStart(3, '0')}%`;

      if (progress < 100) {
        setTimeout(updateProgress, 80);
      } else {
        // Finished loading, slide loader out of view
        setTimeout(() => {
          loader.classList.add('fade-out');
          setTimeout(() => {
            loader.remove();
          }, 800);
        }, 500);
      }
    }
  }

  // Run both processes
  addLogLine();
  updateProgress();
}

/* ==========================================================================
   2. Interactive Pointer Light Glow
   ========================================================================== */
function initMouseGlow() {
  const glow = document.getElementById('glow-cursor');
  if (!glow) return;

  window.addEventListener('mousemove', (e) => {
    // Position the radial gradient at the cursor coordinates
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
  });
}

/* ==========================================================================
   3. 3D Card Tilt & Glassmorphism Glow Border
   ========================================================================== */
function initCardEffects() {
  const targets = document.querySelectorAll('.tilt-target');

  targets.forEach(card => {
    // 1. Mouse coordinate tracking inside the card for glassmorphism borders
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 2. 3D Tilt calculation
      const width = rect.width;
      const height = rect.height;
      
      // Normalized coordinates: center of card is (0, 0), corners are [-0.5, 0.5]
      const mouseX = (x / width) - 0.5;
      const mouseY = (y / height) - 0.5;
      
      // Calculate rotation angles (degrees)
      const maxTilt = 8; // Maximum tilt angle
      const rotateX = -mouseY * maxTilt;
      const rotateY = mouseX * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    // Reset layout on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    });
  });
}

/* ==========================================================================
   4. Viewport Scroll Reveals & Progress Bars
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');

  // Handle skill progress bar triggers
  const skillCards = document.querySelectorAll('.skill-category-card');
  
  // Set initial width to 0% for all progress bars
  const skillFills = [];
  skillCards.forEach(card => {
    const fills = card.querySelectorAll('.fill');
    fills.forEach(fill => {
      // Store reference and original target width
      const classes = Array.from(fill.classList);
      const targetClass = classes.find(c => c.startsWith('filled-'));
      if (targetClass) {
        const percentage = parseInt(targetClass.split('-')[1], 10);
        // Temporarily reset inline width to 0
        fill.style.width = '0%';
        skillFills.push({
          element: fill,
          card: card,
          percentage: percentage
        });
      }
    });
  });

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        
        // If entry is a skill card, trigger its progress meters
        if (entry.target.classList.contains('skill-category-card')) {
          skillFills.forEach(item => {
            if (item.card === entry.target) {
              setTimeout(() => {
                item.element.style.width = `${item.percentage}%`;
              }, 150);
            }
          });
        }
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
  skillCards.forEach(card => observer.observe(card));

  // Sync scroll positioning with navigation highlighters
  window.addEventListener('scroll', () => {
    let currentSectionId = 'hero';
    const scrollPosition = window.scrollY + 200;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   5. Cyberpunk Contact Form Submission
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('cyberpunk-contact-form');
  const consoleLog = document.getElementById('form-terminal-console');
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !consoleLog) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset error messages and styles
    const inputs = form.querySelectorAll('.form-input');
    const errors = form.querySelectorAll('.error-msg');
    
    inputs.forEach(input => input.classList.remove('error-active'));
    errors.forEach(err => err.style.display = 'none');

    // Fetch values
    const nameVal = document.getElementById('client-name').value.trim();
    const emailVal = document.getElementById('client-email').value.trim();
    const msgVal = document.getElementById('client-msg').value.trim();

    let hasErrors = false;

    // Validate name
    if (!nameVal) {
      document.getElementById('client-name').classList.add('error-active');
      document.getElementById('name-error-msg').style.display = 'block';
      hasErrors = true;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      document.getElementById('client-email').classList.add('error-active');
      document.getElementById('email-error-msg').style.display = 'block';
      hasErrors = true;
    }

    // Validate message
    if (!msgVal) {
      document.getElementById('client-msg').classList.add('error-active');
      document.getElementById('msg-error-msg').style.display = 'block';
      hasErrors = true;
    }

    if (hasErrors) {
      updateConsole('> SUBMISSION ABORTED: CREDENTIALS FALSIFIED OR HOLLOW.', 'text-pink');
      return;
    }

    // Form is valid: trigger simulation sequence
    submitBtn.disabled = true;
    updateConsole('> COMPILING DATA PAYLOAD...', 'text-cyan');

    const steps = [
      { text: '> INITIALIZING ENCRYPTED PACKET HANDSHAKE...', color: 'text-cyan', delay: 800 },
      { text: '> RESOLVING HOST: ap-south-1.aws.ses...', color: 'text-cyan', delay: 1500 },
      { text: '> CONNECTED. SECURING SHIFT KEY EXCHANGES...', color: 'text-purple', delay: 2200 },
      { text: '> BROADCASTING TRANSMISSION BLOCK #78A0...', color: 'text-purple', delay: 3000 },
      { text: '> TRANSMISSION ACCEPTED. RESPONSE 202 ACCEPTED.', color: 'text-green', delay: 3800 },
      { text: `> SYSTEMS NOTIFIED: MESSAGE SENT BY ${nameVal.toUpperCase()}`, color: 'text-green', delay: 4500 }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        updateConsole(step.text, step.color);
        if (step.text.includes('202 ACCEPTED')) {
          // Clear inputs and enable submit button again
          form.reset();
          submitBtn.disabled = false;
        }
      }, step.delay);
    });
  });

  function updateConsole(text, colorClass) {
    const line = document.createElement('div');
    line.className = `console-line ${colorClass || ''}`;
    line.textContent = text;
    consoleLog.appendChild(line);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }
}



/* ==========================================================================
   7. Mobile Navigation Drawer
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const panel = document.getElementById('mobile-nav-panel');
  const links = document.querySelectorAll('.mobile-nav-item');

  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  function openMenu() {
    panel.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    // Animate burger bars
    toggle.children[0].style.transform = 'translateY(7px) rotate(45deg)';
    toggle.children[1].style.opacity = '0';
    toggle.children[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }

  function closeMenu() {
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    // Reset burger bars
    toggle.children[0].style.transform = 'none';
    toggle.children[1].style.opacity = '1';
    toggle.children[2].style.transform = 'none';
  }
}

/* ==========================================================================
   8. Client-Side Image Background Keying (Transparency)
   ========================================================================== */
function initAvatarTransparency() {
  const img = document.getElementById('hero-avatar');
  if (!img) return;

  function makeTransparent() {
    if (img.dataset.processed) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Loop through pixels to convert solid white background to transparent
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Key out only pure white or extremely bright near-white background pixels
        if (r > 245 && g > 245 && b > 245) {
          data[i + 3] = 0; // Alpha = 0 (Transparent)
        }
      }

      ctx.putImageData(imgData, 0, 0);
      img.dataset.processed = "true";
      img.src = canvas.toDataURL();
    } catch (e) {
      console.warn("Chroma-key transparency canvas operation failed:", e);
    }
  }

  if (img.complete) {
    makeTransparent();
  } else {
    img.addEventListener('load', makeTransparent);
  }
}
