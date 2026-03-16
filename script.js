const root = document.body;
const themeToggle = document.getElementById("themeToggle");
const yearEl = document.getElementById("year");
const reveals = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll(".tilt-card");
const magneticItems = document.querySelectorAll(".magnetic");
const cursorGlow = document.getElementById("cursorGlow");
const canvas = document.getElementById("nebula");

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  root.classList.add("light");
  themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
  root.classList.toggle("light");
  const isLight = root.classList.contains("light");
  themeToggle.textContent = isLight ? "☀️" : "🌙";
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

yearEl.textContent = new Date().getFullYear();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((item) => observer.observe(item));

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = (0.5 - y / rect.height) * 10;
    card.style.transform = `perspective(850px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(850px) rotateX(0) rotateY(0)";
  });
});

magneticItems.forEach((item) => {
  item.addEventListener("mousemove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  });
  item.addEventListener("mouseleave", () => {
    item.style.transform = "translate(0, 0)";
  });
});

window.addEventListener("pointermove", (event) => {
  cursorGlow.style.left = `${event.clientX}px`;
  cursorGlow.style.top = `${event.clientY}px`;
});

const ctx = canvas.getContext("2d");
const points = [];
let w = 0;
let h = 0;
const pointer = { x: -2000, y: -2000 };

window.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
});

function resizeCanvas() {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas.width = w * window.devicePixelRatio;
  canvas.height = h * window.devicePixelRatio;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  initPoints();
}

function initPoints() {
  points.length = 0;
  const count = Math.max(34, Math.floor((w * h) / 36000));
  for (let i = 0; i < count; i += 1) {
    points.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 1.7 + 0.6
    });
  }
}

function drawNebula() {
  ctx.clearRect(0, 0, w, h);
  const grad = ctx.createRadialGradient(pointer.x, pointer.y, 20, pointer.x, pointer.y, 280);
  grad.addColorStop(0, "rgba(65, 185, 255, 0.20)");
  grad.addColorStop(1, "rgba(65, 185, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;

    const dist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
    const alpha = dist < 180 ? 0.9 - dist / 200 : 0.18;
    ctx.beginPath();
    ctx.fillStyle = `rgba(173, 229, 255, ${Math.max(alpha, 0.18)})`;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < points.length; j += 1) {
      const q = points[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(118, 168, 255, ${0.12 - d / 1000})`;
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawNebula);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawNebula();
