(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll progress + cursor glow ---------- */
  const bar = $(".progress"), glow = $(".glow");
  addEventListener("scroll", () => {
    const h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
  }, { passive: true });
  addEventListener("pointermove", e => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });

  /* ---------- mobile menu ---------- */
  const burger = $(".burger"), nav = $(".nav nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });
  $$("nav a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open"); burger.setAttribute("aria-expanded", false);
  }));

  /* ---------- hero embers: drift, follow cursor, burst on click ---------- */
  const cv = $("#sparks"), ctx = cv.getContext("2d");
  let W, H, parts = [], mouse = { x: -999, y: -999 };
  const resize = () => {
    const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    W = cv.width = r.width * dpr; H = cv.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); W = r.width; H = r.height;
  };
  const spawn = (x, y, burst) => ({
    x, y, r: Math.random() * 2.2 + .6,
    vx: (Math.random() - .5) * (burst ? 7 : .6),
    vy: burst ? (Math.random() - .5) * 7 : -Math.random() * .8 - .2,
    life: burst ? 60 + Math.random() * 40 : 200 + Math.random() * 200, age: 0
  });
  resize(); addEventListener("resize", resize);
  const n = () => Math.min(90, Math.floor(W / 14));
  for (let i = 0; i < n(); i++) parts.push(spawn(Math.random() * W, Math.random() * H, false));
  cv.parentElement.addEventListener("pointermove", e => {
    const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  cv.parentElement.addEventListener("click", e => {
    if (e.target.closest("a,button")) return;
    const r = cv.getBoundingClientRect();
    for (let i = 0; i < 40; i++) parts.push(spawn(e.clientX - r.left, e.clientY - r.top, true));
  });
  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter(p => p.age < p.life);
    while (parts.length < n()) parts.push(spawn(Math.random() * W, H + 10, false));
    for (const p of parts) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
      if (d < 180) { p.vx += dx / d * .04; p.vy += dy / d * .04; }
      p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.age++;
      const a = Math.max(0, 1 - p.age / p.life);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fillStyle = `rgba(230,43,30,${a})`; ctx.shadowColor = "#e62b1e"; ctx.shadowBlur = 12; ctx.fill();
    }
    requestAnimationFrame(tick);
  };
  if (!reduce) tick();

  /* ---------- countdown ---------- */
  const target = new Date($("#clock").dataset.date).getTime();
  const pad = v => String(v).padStart(2, "0");
  const count = () => {
    const t = Math.max(0, target - Date.now());
    $("#d").textContent = pad(Math.floor(t / 864e5));
    $("#h").textContent = pad(Math.floor(t / 36e5) % 24);
    $("#m").textContent = pad(Math.floor(t / 6e4) % 60);
    $("#s").textContent = pad(Math.floor(t / 1e3) % 60);
  };
  count(); setInterval(count, 1000);

  /* ---------- reveal on scroll + number counters ---------- */
  $$(".big,.lead,.card,.flip,form").forEach(el => el.classList.add("rv"));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in"); io.unobserve(e.target);
    const num = $(".num[data-to]", e.target) || (e.target.matches(".num[data-to]") ? e.target : null);
    if (num) countUp(num);
  }), { threshold: .25 });
  $$(".rv").forEach(el => io.observe(el));
  function countUp(el) {
    const to = +el.dataset.to, plus = el.dataset.plus ? "+" : "", t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = v + (k === 1 ? plus : ""); if (k < 1) requestAnimationFrame(step);
    };
    reduce ? (el.textContent = to + plus) : requestAnimationFrame(step);
  }

  /* ---------- 3D tilt cards ---------- */
  $$(".tilt").forEach(c => {
    c.addEventListener("pointermove", e => {
      if (reduce) return;
      const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      c.style.transform = `perspective(700px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`;
    });
    c.addEventListener("pointerleave", () => (c.style.transform = ""));
  });

  /* ---------- speaker flip cards ---------- */
  $$(".flip").forEach(f => f.addEventListener("click", () => f.classList.toggle("on")));

  /* ---------- registration form ---------- */
  const form = $("#form"), sel = $("#nitk"), msg = $("#msg");
  sel.addEventListener("change", () => {
    $$(".yes").forEach(e => e.classList.toggle("hide", sel.value !== "Yes"));
    $$(".no").forEach(e => e.classList.toggle("hide", sel.value !== "No"));
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    $$("input,select,textarea", form).forEach(f => {
      const visible = !f.closest(".hide");
      const need = f.required || (visible && f.closest(".yes,.no"));
      const bad = visible && ((need && !f.value.trim()) || (f.value && !f.checkValidity()));
      f.classList.toggle("bad", bad); if (bad) ok = false;
    });
    msg.style.color = ok ? "#fff" : "#e62b1e";
    msg.textContent = ok ? "You're on the list. See you at the event!" : "Please fix the highlighted fields.";
    if (ok) form.reset();
  });
})();
