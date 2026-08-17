// ============================================
// AutoPredictPro - Main Application Script
// ============================================

// --- Tab Switching ---
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');
  document.getElementById(`tab-${tabName}`)?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function () {
  // Tab click handlers
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function () {
      switchTab(this.dataset.tab);
    });
  });

  // Initialize particles.js
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#00d4ff' },
        shape: { type: 'circle' },
        opacity: { value: 0.3, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: '#00d4ff', opacity: 0.1, width: 1 },
        move: { enable: true, speed: 2, direction: 'none', random: true, straight: false, out_mode: 'out' }
      },
      interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
        modes: { grab: { distance: 140, line_linked: { opacity: 0.3 } }, push: { particles_nb: 4 } }
      },
      retina_detect: true
    });
  }

  // Set current date in result
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Scroll-triggered animations
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  animateElements.forEach(el => observer.observe(el));
});

// --- Form Elements ---
const form = document.getElementById('predictionForm');
const priceEl = document.getElementById('price');
const predictBtn = document.getElementById('predictBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');
const resultSection = document.getElementById('result-section');

// --- Form Submit ---
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  predictBtn.disabled = true;
  btnText.textContent = 'Predicting...';
  btnSpinner.classList.remove('d-none');

  const data = {
    wheelbase: parseFloat(document.getElementById('wheelbase').value) || 98.0,
    carlength: parseFloat(document.getElementById('carlength').value) || 170.0,
    carwidth: parseFloat(document.getElementById('carwidth').value) || 65.0,
    carheight: parseFloat(document.getElementById('carheight').value) || 54.0,
    curbweight: parseFloat(document.getElementById('curbweight').value) || 2500,
    engine: parseFloat(document.getElementById('engine').value) || 130,
    boreratio: parseFloat(document.getElementById('boreratio').value) || 3.3,
    horsepower: parseFloat(document.getElementById('hp').value) || 100,
    citympg: parseFloat(document.getElementById('citympg').value) || 25,
    highwaympg: parseFloat(document.getElementById('highwaympg').value) || 30,
    fuel: document.getElementById('fuel').value,
    aspiration: document.getElementById('aspiration').value,
    doornumber: document.getElementById('doornumber').value,
    carbody: document.getElementById('carbody').value,
    drivewheel: document.getElementById('drivewheel').value,
    enginelocation: document.getElementById('enginelocation').value,
    enginetype: document.getElementById('enginetype').value,
    cylindernumber: document.getElementById('cylindernumber').value,
    fuelsystem: document.getElementById('fuelsystem').value
  };

  try {
    const response = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    resultSection.classList.remove('d-none');

    if (result.predicted_price) {
      priceEl.textContent = Number(result.predicted_price).toLocaleString('en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
      });
    } else if (result.error) {
      priceEl.textContent = 'Error: ' + result.error;
    } else {
      priceEl.textContent = 'N/A';
    }

    setTimeout(() => {
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 200);

  } catch (error) {
    console.error(error);
    resultSection.classList.remove('d-none');
    priceEl.textContent = 'Server Error';
  }

  predictBtn.disabled = false;
  btnText.textContent = 'Predict Price';
  btnSpinner.classList.add('d-none');
});

// --- Reset ---
form.addEventListener('reset', function () {
  setTimeout(() => {
    priceEl.textContent = '--';
    resultSection.classList.add('d-none');
  }, 100);
});
