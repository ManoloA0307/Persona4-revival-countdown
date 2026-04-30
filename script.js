// =============================================
//  PERSONA 4 REVIVAL — script.js  (v2 Enhanced)
//  TV Intro · Flip Countdown · Fog · Scroll FX
// =============================================

// -----------------------------------------------
// 1. TV STATIC INTRO
// -----------------------------------------------
(function initTVIntro() {
  const intro    = document.getElementById("tv-intro");
  const canvas   = document.getElementById("static-canvas");
  if (!intro || !canvas) return;

  const ctx    = canvas.getContext("2d");
  let rafId    = null;
  let startTime = null;
  const DURATION = 2200; // ms before fading out

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function drawStatic(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    const w = canvas.width, h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() > 0.5 ? Math.random() * 180 + 40 : Math.random() * 40;
      data[i]     = v;       // R
      data[i + 1] = v;       // G
      data[i + 2] = v;       // B
      data[i + 3] = 255;     // A
    }
    ctx.putImageData(imageData, 0, 0);

    if (elapsed < DURATION) {
      rafId = requestAnimationFrame(drawStatic);
    } else {
      cancelAnimationFrame(rafId);
      intro.classList.add("hidden");
      document.body.classList.remove("loading");
      setTimeout(() => { intro.remove(); }, 700);
    }
  }

  requestAnimationFrame(drawStatic);
})();


// -----------------------------------------------
// 2. COUNTDOWN TIMER (with flip digit animation)
// -----------------------------------------------
const COUNTDOWN_TARGET = new Date("2025-09-25T10:00:00+09:00");

const prevValues = { days: null, hours: null, minutes: null, seconds: null };

function padZero(n) {
  return String(Math.floor(n)).padStart(2, "0");
}

function triggerFlip(el) {
  if (!el) return;
  el.classList.remove("flip-anim");
  void el.offsetWidth; // reflow trick to restart animation
  el.classList.add("flip-anim");
}

function updateCountdown() {
  const now  = new Date();
  const diff = COUNTDOWN_TARGET - now;

  const daysEl    = document.getElementById("cd-days");
  const hoursEl   = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");
  const targetMsg = document.getElementById("countdown-target-msg");

  if (!daysEl) return;

  if (diff <= 0) {
    ["cd-days","cd-hours","cd-minutes","cd-seconds"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "00";
    });
    if (targetMsg) {
      targetMsg.innerHTML = '<span class="target-icon">🎉</span> The announcement has arrived! The fog has lifted.';
      targetMsg.style.color = "var(--gold)";
    }
    return;
  }

  const totalSeconds = diff / 1000;
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const vals = { days, hours, minutes, seconds };
  const els  = { days: daysEl, hours: hoursEl, minutes: minutesEl, seconds: secondsEl };

  for (const key of Object.keys(vals)) {
    const strVal = padZero(vals[key]);
    if (strVal !== prevValues[key]) {
      els[key].textContent = strVal;
      if (prevValues[key] !== null) triggerFlip(els[key]);
      prevValues[key] = strVal;
    }
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);


// -----------------------------------------------
// 3. FAN THEORY SUBMISSION
// -----------------------------------------------
const STORAGE_KEY = "p4revival_theories_v2";

const CATEGORY_LABELS = {
  gameplay:  "🎮 Gameplay",
  story:     "📖 Story",
  character: "👥 Characters",
  mechanic:  "⚙ Mechanics",
  secret:    "🔍 Secrets",
};

function loadTheories() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTheories(theories) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(theories)); } catch {}
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

function renderTheories() {
  const list  = document.getElementById("theories-list");
  const badge = document.getElementById("theory-count");
  if (!list) return;

  const theories = loadTheories();
  if (badge) badge.textContent = theories.length;

  if (theories.length === 0) {
    list.innerHTML = `
      <div class="theories-empty-state">
        <div class="empty-icon">🌫</div>
        <p class="theories-empty">The board is silent… for now.</p>
        <p class="theories-empty-sub">Be the first to pierce the fog.</p>
      </div>`;
    return;
  }

  list.innerHTML = theories
    .slice().reverse()
    .map((t, i) => `
      <div class="theory-item" style="animation-delay:${i * 0.06}s">
        <div class="theory-item-header">
          <span class="theory-item-name">${escapeHtml(t.name || "Anonymous")}</span>
          <span class="theory-item-cat">${CATEGORY_LABELS[t.category] || t.category}</span>
        </div>
        <p class="theory-item-text">${escapeHtml(t.text)}</p>
      </div>`)
    .join("");
}

function showFeedback(msg, type) {
  const el = document.getElementById("form-feedback");
  if (!el) return;
  el.textContent = msg;
  el.className = "form-feedback " + type;
  el.style.opacity = "1";
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => { el.textContent = ""; el.className = "form-feedback"; el.style.opacity = "1"; }, 300);
  }, 3200);
}

function popBadge() {
  const badge = document.getElementById("theory-count");
  if (!badge) return;
  badge.classList.remove("pop");
  void badge.offsetWidth;
  badge.classList.add("pop");
}

function handleTheorySubmit(e) {
  e.preventDefault();

  const nameEl = document.getElementById("theory-name");
  const catEl  = document.getElementById("theory-category");
  const textEl = document.getElementById("theory-text");
  const btn    = document.getElementById("theory-submit");

  const name     = nameEl ? nameEl.value.trim() : "";
  const category = catEl  ? catEl.value : "gameplay";
  const text     = textEl ? textEl.value.trim() : "";

  if (!text) {
    showFeedback("⚠ Please write your theory before submitting.", "error");
    if (textEl) { textEl.focus(); textEl.style.borderColor = "rgba(200,60,50,0.6)"; }
    return;
  }
  if (text.length < 10) {
    showFeedback("⚠ Theory is too short — give us more detail!", "error");
    if (textEl) textEl.focus();
    return;
  }

  if (textEl) textEl.style.borderColor = "";

  // Button loading state
  if (btn) { btn.disabled = true; btn.querySelector(".btn-inner").textContent = "Submitting…"; }

  setTimeout(() => {
    const theories = loadTheories();
    theories.push({ name: name || "Anonymous Detective", category, text, timestamp: Date.now() });
    saveTheories(theories);

    if (nameEl) nameEl.value = "";
    if (textEl) { textEl.value = ""; updateCharCount(0); }

    renderTheories();
    popBadge();
    showFeedback("✓ Theory filed! The Investigation Team takes note.", "success");

    if (btn) { btn.disabled = false; btn.querySelector(".btn-inner").textContent = "⬡ Submit Theory"; }

    const listWrap = document.querySelector(".theories-list-wrap");
    if (listWrap && window.innerWidth < 900) listWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 400);
}

const theoryForm = document.getElementById("theory-form");
if (theoryForm) theoryForm.addEventListener("submit", handleTheorySubmit);

// Character counter for textarea
function updateCharCount(val) {
  const el = document.getElementById("char-count");
  if (el) el.textContent = val;
}

const theoryText = document.getElementById("theory-text");
if (theoryText) {
  theoryText.addEventListener("input", () => updateCharCount(theoryText.value.length));
}

// Error border clear on input
["theory-name","theory-text"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => { el.style.borderColor = ""; });
});

renderTheories();


// -----------------------------------------------
// 4. NAVBAR SCROLL EFFECT
// -----------------------------------------------
const navbar = document.getElementById("navbar");

function handleNavbarScroll() {
  if (!navbar) return;
  if (window.scrollY > 60) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
}
window.addEventListener("scroll", handleNavbarScroll, { passive: true });


// -----------------------------------------------
// 5. SCROLL REVEAL — Section elements
// -----------------------------------------------
function initScrollReveal() {
  // Add class to all reveal targets
  const revealTargets = document.querySelectorAll(
    ".char-card, .countdown-block, .section-header, .theory-form, .theories-list-wrap, .prompt-entry, .prompts-intro"
  );

  revealTargets.forEach((el, i) => {
    el.classList.add("scroll-reveal");
    // Stagger cards within grids
    if (el.classList.contains("char-card")) {
      const idx = parseInt(el.dataset.index || 0);
      el.style.transitionDelay = `${idx * 0.08}s`;
    }
    if (el.classList.contains("countdown-block")) {
      el.style.transitionDelay = `${i * 0.07}s`;
    }
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

  revealTargets.forEach(el => revealObserver.observe(el));
}

// Wait until TV intro ends (or immediate if no intro)
const tvIntro = document.getElementById("tv-intro");
if (tvIntro) {
  const observer = new MutationObserver(() => {
    if (tvIntro.classList.contains("hidden")) {
      initScrollReveal();
      observer.disconnect();
    }
  });
  observer.observe(tvIntro, { attributes: true, attributeFilter: ["class"] });
  // Fallback: init after 3 seconds no matter what
  setTimeout(initScrollReveal, 3000);
} else {
  initScrollReveal();
}


// -----------------------------------------------
// 6. CHARACTER CARD — 3D TILT ON HOVER
// -----------------------------------------------
document.querySelectorAll(".char-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const tiltX = (-dy * 5).toFixed(2);
    const tiltY = (dx  * 5).toFixed(2);
    card.style.transform = `translateY(-8px) scale(1.01) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    card.style.transition = "transform 0.1s ease";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.transition = "transform 0.4s cubic-bezier(0.19,1,0.22,1), border-color 0.35s ease, box-shadow 0.4s ease";
  });
});


// -----------------------------------------------
// 7. HERO PARALLAX on mouse move
// -----------------------------------------------
const hero = document.getElementById("hero");
const heroContent = hero ? hero.querySelector(".hero-content") : null;
const heroCard    = hero ? hero.querySelector(".hero-card") : null;

if (hero) {
  hero.addEventListener("mousemove", e => {
    const rect = hero.getBoundingClientRect();
    const mx = (e.clientX - rect.width  / 2) / rect.width;
    const my = (e.clientY - rect.height / 2) / rect.height;

    if (heroContent) {
      heroContent.style.transform = `translate(${mx * -10}px, ${my * -10}px)`;
      heroContent.style.transition = "transform 0.3s ease";
    }
    if (heroCard) {
      // Card floats in opposite direction + preserves rotate
      heroCard.style.transform = `translate(${mx * 14}px, ${my * 14}px)`;
      heroCard.style.transition = "transform 0.3s ease";
    }

    // Move sigils
    const sigils = hero.querySelectorAll(".sigil");
    sigils.forEach((s, i) => {
      const speed = 0.5 + i * 0.3;
      s.style.transform = `translate(${mx * speed * 20}px, ${my * speed * 20}px)`;
      s.style.transition = "transform 0.4s ease";
    });
  });

  hero.addEventListener("mouseleave", () => {
    if (heroContent) { heroContent.style.transform = ""; heroContent.style.transition = "transform 0.8s ease"; }
    if (heroCard)    { heroCard.style.transform    = ""; heroCard.style.transition    = "transform 0.8s ease"; }
    hero.querySelectorAll(".sigil").forEach(s => { s.style.transform = ""; s.style.transition = "transform 0.8s ease"; });
  });
}


// -----------------------------------------------
// 8. ACTIVE NAV LINK
// -----------------------------------------------
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach(link => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "" && href === "index.html")) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});
