/* ============================================================
   M. Iqram Anugrah — Personal Portfolio
   Vanilla JavaScript: loader, navbar, particles, parallax,
   carousel, gallery render, scroll reveal, contact form.
   ============================================================ */

// ---------- Content (edit titles & links here) ----------
const PORTFOLIO_ITEMS = [
  {
    src: "https://i.ibb.co/DPnDSY2Z/IMG-20260418-171643.jpg",
    title: "Warm Light, Quiet Street",
    category: "Street Photography",
  },
  {
    src: "https://i.ibb.co/S4pxKXGJ/IMG-20251220-165408.jpg",
    title: "Afternoon Frame",
    category: "Portrait",
  },
  {
    src: "https://i.ibb.co/JWSdGx3Z/IMG-20250812-163236.jpg",
    title: "Soft Focus, Long Afternoon",
    category: "Portrait",
  },
  {
    src: "https://i.ibb.co/20chH5xr/IMG-20260412-062330.jpg",
    title: "The Little Watcher",
    category: "Wildlife",
  },
  {
    src: "https://i.ibb.co/fVvL0x2y/IMG-20260322-103705-1.jpg",
    title: "Golden Hour Silhouette",
    category: "Golden Hour",
  },
];

const $ = (sel, root = document) => root.querySelector(sel);

// ---------- Loader: fade out shortly after first open ----------
window.addEventListener("load", () => {
  setTimeout(() => $("#loader").classList.add("done"), 1500);
});

// ---------- Icons ----------
if (window.lucide) lucide.createIcons();

// ---------- Navbar: blur when scrolled + mobile menu ----------
const navbar = $("#navbar");
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 12);
}, { passive: true });

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
  lucide.createIcons();
});

// Close the mobile menu after tapping a link
navLinks.addEventListener("click", (e) => {
  if (e.target.closest("a")) {
    navLinks.classList.remove("open");
    navToggle.innerHTML = '<i data-lucide="menu"></i>';
    lucide.createIcons();
  }
});

// ---------- Navbar scroll-spy: highlight the visible section ----------
const spyLinks = [...navLinks.querySelectorAll("a[href^='#']")];
const sections = spyLinks
  .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
  .filter(Boolean);

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      spyLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`),
      );
    });
  },
  { rootMargin: "-40% 0px -55% 0px" },
);
sections.forEach((s) => spy.observe(s));

// ---------- Hero particles (stable, seeded positions) ----------
const seeded = (i) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const particlesBox = $("#particles");
for (let i = 0; i < 18; i++) {
  const dot = document.createElement("span");
  dot.className = "particle";
  dot.style.left = `${(seeded(i) * 100).toFixed(2)}%`;
  dot.style.top = `${(20 + seeded(i + 50) * 75).toFixed(2)}%`;
  dot.style.width = dot.style.height = `${(2 + seeded(i + 100) * 4).toFixed(2)}px`;
  dot.style.opacity = (0.25 + seeded(i + 250) * 0.5).toFixed(2);
  dot.style.animationDuration = `${(6 + seeded(i + 150) * 8).toFixed(2)}s`;
  dot.style.animationDelay = `${(seeded(i + 200) * 8).toFixed(2)}s`;
  particlesBox.appendChild(dot);
}

// ---------- Light parallax on hero blobs & content ----------
let parallaxRaf = 0;
window.addEventListener("scroll", () => {
  cancelAnimationFrame(parallaxRaf);
  parallaxRaf = requestAnimationFrame(() => {
    const y = window.scrollY;
    document.querySelectorAll("[data-parallax]").forEach((el) => {
      el.style.transform = `translateY(${(y * parseFloat(el.dataset.parallax)).toFixed(1)}px)`;
    });
  });
}, { passive: true });

// ---------- Portfolio carousel ----------
const track = $("#carouselTrack");
const dotsBox = $("#carouselDots");
const prevBtn = $("#carouselPrev");
const nextBtn = $("#carouselNext");

// Render slides
PORTFOLIO_ITEMS.forEach((item) => {
  const slide = document.createElement("div");
  slide.className = "slide";
  slide.innerHTML = `
    <img src="${item.src}" alt="${item.title}" loading="lazy" draggable="false" />
    <figcaption class="slide-caption">
      <div>
        <p class="category">${item.category}</p>
        <p class="title">${item.title}</p>
      </div>
      <span class="icon-chip"><i data-lucide="camera"></i></span>
    </figcaption>`;
  track.appendChild(slide);
});

// Render dots
PORTFOLIO_ITEMS.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.type = "button";
  dot.setAttribute("aria-label", `Go to photo ${i + 1}`);
  dot.addEventListener("click", () => scrollToSlide(i));
  dotsBox.appendChild(dot);
});

const slides = [...track.children];
const dots = [...dotsBox.children];

function scrollToSlide(i) {
  slides[i].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

// Active dot follows the centered slide
const trackObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = slides.indexOf(entry.target);
      dots.forEach((d, i) => d.classList.toggle("active", i === index));
    });
  },
  { root: track, threshold: 0.6 },
);
slides.forEach((s) => trackObserver.observe(s));

prevBtn.addEventListener("click", () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: "smooth" }));
nextBtn.addEventListener("click", () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: "smooth" }));

// Drag to scroll (mouse; touch already scrolls natively)
let isDown = false;
let startX = 0;
let startScroll = 0;
let moved = false;

track.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse") return;
  isDown = true;
  moved = false;
  startX = e.clientX;
  startScroll = track.scrollLeft;
  track.classList.add("dragging");
});

track.addEventListener("pointermove", (e) => {
  if (!isDown) return;
  const dx = e.clientX - startX;
  if (Math.abs(dx) > 5) moved = true;
  track.scrollLeft = startScroll - dx;
});

const endDrag = () => {
  isDown = false;
  track.classList.remove("dragging");
};
track.addEventListener("pointerup", endDrag);
track.addEventListener("pointerleave", endDrag);

// Prevent accidental link/image interactions right after a drag
track.addEventListener("click", (e) => {
  if (moved) {
    e.preventDefault();
    moved = false;
  }
}, true);

// ---------- Gallery (masonry) ----------
const masonry = $("#masonry");
PORTFOLIO_ITEMS.forEach((item, i) => {
  const cell = document.createElement("div");
  cell.className = "masonry-item reveal";
  cell.style.setProperty("--reveal-delay", `${i * 90}ms`);
  cell.innerHTML = `
    <figure>
      <img src="${item.src}" alt="${item.title}" loading="lazy" />
      <figcaption>${item.title}</figcaption>
    </figure>`;
  masonry.appendChild(cell);
});

// ---------- Scroll reveal (fade-in / slide-up) ----------
const revealer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);
document.querySelectorAll(".reveal").forEach((el) => {
  if (el.dataset.delay) el.style.setProperty("--reveal-delay", `${el.dataset.delay}ms`);
  revealer.observe(el);
});

// ---------- Contact form: simple validation + demo success ----------
const form = $("#contactForm");
const formError = $("#formError");
const formSuccess = $("#formSuccess");
const sendBtn = $("#sendBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (!name || !email || !message) {
    formError.textContent = "Please fill in all fields.";
    formError.hidden = false;
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formError.textContent = "Please enter a valid email address.";
    formError.hidden = false;
    return;
  }

  formError.hidden = true;
  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";

  // Demo send — connect this to a real backend/email service later.
  setTimeout(() => {
    form.hidden = true;
    formSuccess.hidden = false;
    lucide.createIcons();
  }, 900);
});

// ---------- Footer year ----------
$("#year").textContent = new Date().getFullYear();
