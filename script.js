const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');
const buttonsContainer = document.querySelector('.buttons');
const successOverlay = document.getElementById('success-overlay');
const canvas = document.getElementById('fireworks-canvas');
const ctx = canvas.getContext('2d');

// Carousel: add your photo filenames here (same folder as the page)
const carouselImages = ['mal (1).jpg', 'mal (2).jpg', 'mal (3).jpg', 'mal (4).jpg', 'mal (5).jpg', 'mal (6).jpg'];

const carouselTrack = document.querySelector('.carousel-track');
const carouselPrev = document.querySelector('.carousel-prev');
const carouselNext = document.querySelector('.carousel-next');
const carouselDotsEl = document.querySelector('.carousel-dots');

let carouselIndex = 0;

function buildCarousel() {
  if (!carouselTrack || carouselImages.length === 0) return;
  carouselTrack.innerHTML = '';
  carouselImages.forEach((src, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Photo ${i + 1}`;
    slide.appendChild(img);
    carouselTrack.appendChild(slide);
  });
  // Dots
  if (carouselDotsEl) {
    carouselDotsEl.innerHTML = '';
    carouselImages.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      carouselDotsEl.appendChild(dot);
    });
  }
  updateCarousel();
}

function updateCarousel() {
  if (!carouselTrack || carouselImages.length === 0) return;
  const maxIndex = carouselImages.length - 1;
  carouselIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
  carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
  if (carouselPrev) carouselPrev.style.visibility = carouselImages.length <= 1 ? 'hidden' : 'visible';
  if (carouselNext) carouselNext.style.visibility = carouselImages.length <= 1 ? 'hidden' : 'visible';
}

function goToSlide(index) {
  carouselIndex = index;
  updateCarousel();
}

if (carouselTrack && carouselImages.length > 0) {
  buildCarousel();
  if (carouselPrev) carouselPrev.addEventListener('click', () => { carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length; updateCarousel(); });
  if (carouselNext) carouselNext.addEventListener('click', () => { carouselIndex = (carouselIndex + 1) % carouselImages.length; updateCarousel(); });
}

// Size canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Runaway No button: move when mouse gets close (fixed position so it can escape anywhere)
const runPadding = 90;
let noButtonPosition = { x: 0, y: 0 };

function updateNoButtonPosition() {
  const rect = buttonsContainer.getBoundingClientRect();
  noButtonPosition.x = rect.left + rect.width / 2 + 75;
  noButtonPosition.y = rect.top + rect.height / 2 - btnNo.offsetHeight / 2;
  btnNo.style.left = noButtonPosition.x + 'px';
  btnNo.style.top = noButtonPosition.y + 'px';
}

updateNoButtonPosition();

document.addEventListener('mousemove', (e) => {
  const nx = noButtonPosition.x + btnNo.offsetWidth / 2;
  const ny = noButtonPosition.y + btnNo.offsetHeight / 2;
  const dx = e.clientX - nx;
  const dy = e.clientY - ny;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < runPadding) {
    const angle = Math.atan2(dy, dx);
    const moveDist = runPadding - dist + 50;
    const newX = noButtonPosition.x + Math.cos(angle) * moveDist;
    const newY = noButtonPosition.y + Math.sin(angle) * moveDist;
    const margin = 50;
    noButtonPosition.x = Math.max(margin, Math.min(window.innerWidth - btnNo.offsetWidth - margin, newX));
    noButtonPosition.y = Math.max(margin, Math.min(window.innerHeight - btnNo.offsetHeight - margin, newY));
    btnNo.style.left = noButtonPosition.x + 'px';
    btnNo.style.top = noButtonPosition.y + 'px';
  }
});

window.addEventListener('resize', () => {
  const margin = 50;
  noButtonPosition.x = Math.max(margin, Math.min(window.innerWidth - btnNo.offsetWidth - margin, noButtonPosition.x));
  noButtonPosition.y = Math.max(margin, Math.min(window.innerHeight - btnNo.offsetHeight - margin, noButtonPosition.y));
  btnNo.style.left = noButtonPosition.x + 'px';
  btnNo.style.top = noButtonPosition.y + 'px';
});

// Fireworks
const particles = [];
let animationId;

function createFirework(x, y, color) {
  const count = 60 + Math.floor(Math.random() * 40);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random();
    const speed = 3 + Math.random() * 6;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.01,
      color,
      size: 1.5 + Math.random() * 1.5
    });
  }
}

function drawFireworks() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= p.decay;
    if (p.life <= 0) {
      particles.splice(i, 1);
      continue;
    }
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (particles.length > 0) {
    animationId = requestAnimationFrame(drawFireworks);
  }
}

function launchFireworks() {
  const colors = ['#ff6b9d', '#c94d6a', '#ffb6c1', '#ff9ebb', '#ff85a2', '#fff'];
  const w = canvas.width;
  const h = canvas.height;
  // From left
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createFirework(80 + Math.random() * 100, h * (0.3 + Math.random() * 0.4), colors[Math.floor(Math.random() * colors.length)]);
    }, i * 200);
  }
  // From right
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createFirework(w - 80 - Math.random() * 100, h * (0.3 + Math.random() * 0.4), colors[Math.floor(Math.random() * colors.length)]);
    }, i * 200);
  }
  setTimeout(() => {
    if (particles.length > 0 && !animationId) animationId = requestAnimationFrame(drawFireworks);
  }, 100);
}

// Yes clicked
btnYes.addEventListener('click', () => {
  launchFireworks();
  successOverlay.classList.add('show');
});
