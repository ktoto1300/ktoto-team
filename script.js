/* ============================================
   ktoto — Portfolio Script
   ============================================ */

// ── Page Preloader (Lumora Style) ──
const loader = document.getElementById('pageLoader');
const loaderBar = document.getElementById('loaderBar');
const loaderCounter = document.getElementById('loaderCounter');

let progress = 0;
let loaded = false;
let slowTimer;

// Skip preloader on page refresh/update by checking sessionStorage
if (sessionStorage.getItem('visited') && loader) {
  loader.style.display = 'none';
  document.body.style.overflow = '';
} else {
  // Lock scrolling for first-time loader
  document.body.style.overflow = 'hidden';
  if (loader) {
    sessionStorage.setItem('visited', 'true');
    
    // Gradually increment to 90% while loading page resources
    slowTimer = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 2 + 1;
        if (progress > 90) progress = 90;
        updateLoader(progress);
      }
    }, 60);
    
    // Window load trigger
    window.addEventListener('load', finishLoading);
    
    // Safety fallback
    setTimeout(() => {
      if (!loaded) finishLoading();
    }, 5000);
  }
}

function updateLoader(value) {
  const displayProgress = Math.floor(value);
  if (loaderBar) loaderBar.style.width = `${displayProgress}%`;
  if (loaderCounter) loaderCounter.textContent = displayProgress.toString().padStart(2, '0');
}

function finishLoading() {
  if (slowTimer) clearInterval(slowTimer);
  loaded = true;
  
  if (!loader) return;
  
  // Fast sweep to 100%
  const fastTimer = setInterval(() => {
    progress += 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(fastTimer);
      updateLoader(100);
      
      setTimeout(() => {
        loader.classList.add('exit');
        document.body.style.overflow = ''; // Enable scrolling
      }, 250);
    } else {
      updateLoader(progress);
    }
  }, 15);
}

// ── Language System ──
const translations = {
  en: 'en',
  ru: 'ru'
};

let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // Update all translatable elements
  document.querySelectorAll('[data-en]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) {
      // Preserve child elements (like icons inside buttons)
      const childNodes = Array.from(el.childNodes);
      const hasOnlyText = childNodes.every(n => n.nodeType === Node.TEXT_NODE);

      if (hasOnlyText || el.tagName === 'SPAN' || el.tagName === 'P' || el.tagName === 'H1' ||
          el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'A' && !el.querySelector('svg')) {
        el.textContent = text;
      } else {
        // For elements with mixed content (e.g., button with icon)
        const textNode = childNodes.find(n => n.nodeType === Node.TEXT_NODE);
        const spanChild = el.querySelector('span:not([class])');
        if (spanChild) {
          spanChild.textContent = text;
        } else if (textNode) {
          textNode.textContent = text;
        } else {
          el.textContent = text;
        }
      }
    }
  });

  // Update lang buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Save preference
  localStorage.setItem('portfolio-lang', lang);
}

// Init language from localStorage
function initLanguage() {
  const saved = localStorage.getItem('portfolio-lang');
  if (saved && (saved === 'en' || saved === 'ru')) {
    setLanguage(saved);
  } else {
    setLanguage('en');
  }
}

// Language button events
document.getElementById('langEn').addEventListener('click', () => setLanguage('en'));
document.getElementById('langRu').addEventListener('click', () => setLanguage('ru'));


// ── Navbar Scroll Effect ──
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle('scrolled', scrollY > 40);
  lastScroll = scrollY;
}, { passive: true });


// ── Mobile Nav Toggle ──
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});


// ── Scroll Reveal ──
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
    observer.observe(el);
  });
}


// ── Smooth Scroll for Anchor Links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const offset = 80;
      const pos = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: pos, behavior: 'smooth' });
    }
  });
});


// ── Project Card Tilt Effect (subtle & optimized with rAF) ──
document.querySelectorAll('.project-card').forEach(card => {
  let ticking = false;
  let mouseX = 0;
  let mouseY = 0;

  card.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / centerY * -3;
        const rotateY = (x - centerX) / centerX * 3;

        card.style.transform = `translateY(-8px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        ticking = false;
      });

      ticking = true;
    }
  });

  card.addEventListener('mouseleave', () => {
    window.requestAnimationFrame(() => {
      card.style.transform = '';
      ticking = false;
    });
  });
});


// ── Projects Carousel (Slider) ──
function initProjectsCarousel() {
  const track = document.getElementById('projectsTrack');
  const slides = Array.from(track ? track.children : []);
  const prevBtn = document.querySelector('.prev-arrow');
  const nextBtn = document.querySelector('.next-arrow');
  const dots = document.querySelectorAll('.indicator-dot');
  const viewport = document.querySelector('.projects-carousel-viewport');

  if (!track || slides.length === 0 || !viewport) return;

  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let isMovingHorizontal = false;

  function updateCarousel(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;

    currentIndex = index;

    const amountToMove = slides[currentIndex].offsetLeft;
    
    // Soft, premium glide transition curve
    track.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
    track.offsetHeight; // Force reflow to prevent snappy dragEnd transitions
    track.style.transform = `translateX(-${amountToMove}px)`;

    // Toggle active classes on slides
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Toggle active classes on dot indicators
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
  }

  function getPositionY(event) {
    return event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
  }

  function dragStart(event) {
    isDragging = true;
    startX = getPositionX(event);
    startY = getPositionY(event);
    isMovingHorizontal = false;
    track.style.transition = 'none'; // instantaneous tracking
    if (event.type.includes('mouse')) {
      viewport.style.cursor = 'grabbing';
    }
  }

  function dragMove(event) {
    if (!isDragging) return;
    
    const currentX = getPositionX(event);
    const currentY = getPositionY(event);
    
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    // Detect horizontal swipes early (threshold 10px) to lock vertical scroll
    if (!isMovingHorizontal) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        isMovingHorizontal = true;
      }
    }

    if (isMovingHorizontal) {
      if (event.cancelable) event.preventDefault(); // Stop page scrolling
      const currentTranslate = -slides[currentIndex].offsetLeft + diffX;
      track.style.transform = `translateX(${currentTranslate}px)`;
    }
  }

  function dragEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = 'grab';
    
    const endX = event.type.includes('mouse') 
      ? event.clientX 
      : (event.changedTouches && event.changedTouches[0] ? event.changedTouches[0].clientX : startX);
      
    const diff = endX - startX;

    if (isMovingHorizontal) {
      // 60px swipe threshold
      if (diff < -60) {
        updateCarousel(currentIndex + 1);
      } else if (diff > 60) {
        updateCarousel(currentIndex - 1);
      } else {
        updateCarousel(currentIndex);
      }
    } else {
      updateCarousel(currentIndex); // Snap back if vertical or tiny swipe
    }
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCarousel(currentIndex - 1);
    });
    prevBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      updateCarousel(currentIndex - 1);
    }, { passive: false });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      updateCarousel(currentIndex + 1);
    });
    nextBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      updateCarousel(currentIndex + 1);
    }, { passive: false });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      updateCarousel(idx);
    });
  });

  // Touch Events (passive: false on move to allow preventDefault)
  viewport.addEventListener('touchstart', dragStart, { passive: true });
  viewport.addEventListener('touchmove', dragMove, { passive: false });
  viewport.addEventListener('touchend', dragEnd);

  // Mouse Events
  viewport.addEventListener('mousedown', dragStart);
  viewport.addEventListener('mousemove', dragMove);
  viewport.addEventListener('mouseup', dragEnd);
  viewport.addEventListener('mouseleave', dragEnd);

  // Window Resize
  window.addEventListener('resize', () => {
    updateCarousel(currentIndex);
  });

  updateCarousel(1);
}


// ── Ambient Mouse Light Leak (Spotlight) ──
function initAmbientLight() {
  const ambientBg = document.querySelector('.bg-ambient');
  if (!ambientBg) return;

  let ticking = false;

  window.addEventListener('mousemove', (e) => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        ambientBg.style.setProperty('--mouse-x', `${e.clientX}px`);
        ambientBg.style.setProperty('--mouse-y', `${e.clientY}px`);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}


// ── 3D WebGL Three.js Particle Field ──
function initWebGLParticles() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create 3D particles
  const count = 1200;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 12;
    positions[i + 1] = (Math.random() - 0.5) * 12;
    positions[i + 2] = (Math.random() - 0.5) * 12;
    scales[i / 3] = Math.random() * 0.02 + 0.01;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.025,
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  let mouseX = 0;
  let mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.0005;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.0005;
  }, { passive: true });

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0008;
    particles.rotation.x += 0.0004;

    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (-mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initScrollReveal();
  initProjectsCarousel();
  initAmbientLight();
  initWebGLParticles();
});
