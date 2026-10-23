/* ══════════════════════════════════════════════════════════════════════
   핸드쉐이크 와이어프레임 — 동작(흐름 보기)
   ⚠ 참고용 — 구현 코드로 재사용 금지. 아임웹 위젯은 로더·숨김 방식이 다르다(CLAUDE.md 1-1 · 1-2 · 3번)
   부품 번호는 기획/상세기획/00_인터랙션맵.md 의 I- 번호와 같다. 값은 프로젝트사양.md 6번
   이 파일이 없거나 GSAP 을 못 불러와도 와이어는 정적으로 다 보인다
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var root = document.documentElement;
  var RM = window.matchMedia("(prefers-reduced-motion: reduce)");
  var HAS_GSAP = !!(window.gsap && window.ScrollTrigger);
  var lastW = window.innerWidth;
  var io = null, mm = null, lenis = null, tick = null, header = null;

  if (HAS_GSAP){ gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

  /* ── I-03 제목을 줄마다 상자로 나눈다. 와이어에서는 폭을 재서 나누지만,
        실제 구현은 ⑦ 카피에서 확정한 줄바꿈(데스크톱·모바일 각각)대로 상자를 둔다(3-A) ── */
  function split(h){
    if (h.__src == null) h.__src = h.innerHTML; else h.innerHTML = h.__src;
    var nodes = [].slice.call(h.childNodes); h.textContent = "";
    nodes.forEach(function(n){
      if (n.nodeType !== 3){ h.appendChild(n); return; }
      n.textContent.split(/(\s+)/).forEach(function(t){
        if (!t) return;
        if (/^\s+$/.test(t)){ h.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span"); w.className = "w-word"; w.textContent = t; h.appendChild(w);
      });
    });
    var lines = [], top = null;
    [].forEach.call(h.querySelectorAll(".w-word"), function(w){
      if (top === null || Math.abs(w.offsetTop - top) > 4){ lines.push([]); top = w.offsetTop; }
      lines[lines.length - 1].push(w.textContent);
    });
    h.textContent = "";
    lines.forEach(function(l, i){
      var o = document.createElement("span"); o.className = "w-line";
      var n = document.createElement("span"); n.className = "w-line__in"; n.style.setProperty("--i", i); n.textContent = l.join(" ");
      o.appendChild(n); h.appendChild(o);
    });
  }
  function splitAll(){ [].forEach.call(document.querySelectorAll("[data-split]"), split); }

  /* ── 등장 순서 : [data-rv-group] 안의 [data-rv] 는 0.12초 간격, data-rv-d 는 추가 지연(버튼 +0.22초) ── */
  function indexReveals(){
    [].forEach.call(document.querySelectorAll("[data-rv-group]"), function(g){
      [].forEach.call(g.querySelectorAll("[data-rv]"), function(el, i){ el.style.setProperty("--rvd", (i * .12) + "s"); });
    });
    [].forEach.call(document.querySelectorAll("[data-rv-d]"), function(el){ el.style.setProperty("--rvd", el.getAttribute("data-rv-d") + "s"); });
    [].forEach.call(document.querySelectorAll(".hdsk-steps[data-i='I-08']"), function(ol){
      ol.classList.add("w-draw");
      [].forEach.call(ol.children, function(li, i){ li.style.setProperty("--i", i); });
    });
  }

  /* ── 스크롤 진입 : 섹션이 20% 보이면 한 번만(되감지 않는다 — 다시 읽을 때 글이 사라지지 않게) ── */
  function observe(){
    if (io) io.disconnect();
    io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in"); io.unobserve(e.target);
      });
    }, { threshold: .2 });
    [].forEach.call(document.querySelectorAll(".hdsk-sec:not(.m-hero), .w-draw"), function(el){
      if (!el.classList.contains("is-in")) io.observe(el);
    });
  }

  /* ── I-07 흐르는 띠 : 화면 밖이면 멈춘다(3번) ── */
  var mio = new IntersectionObserver(function(es){
    es.forEach(function(e){ e.target.classList.toggle("is-paused", !e.isIntersecting); });
  });
  [].forEach.call(document.querySelectorAll(".w-marquee"), function(m){ mio.observe(m); });

  /* ── I-06 목록 + 바뀌는 사진 : 마우스 올림·키보드 포커스 ── */
  [].forEach.call(document.querySelectorAll("[data-i='I-06']"), function(box){
    var items = box.querySelectorAll(".m-svc2__item"), pics = box.querySelectorAll(".m-svc2__media .hdsk-ph");
    [].forEach.call(items, function(it, i){
      function on(){
        [].forEach.call(items, function(x, j){ x.classList.toggle("is-on", i === j); });
        [].forEach.call(pics, function(x, j){ x.classList.toggle("is-on", i === j); });
      }
      it.addEventListener("mouseenter", on); it.addEventListener("focus", on);
    });
  });

  /* ── 헤더 : 첫 화면 위 투명 · 내리면 숨고 올리면 나타남 ── */
  var lastY = 0;
  function onScroll(){
    var y = window.scrollY;
    document.body.classList.toggle("is-top", y < 40);
    header = header || document.querySelector(".hdsk-header");
    if (header){
      var panel = document.getElementById("wPanel");
      var open = panel && panel.classList.contains("is-open");
      if (!open && root.classList.contains("w-motion")) header.classList.toggle("is-hidden", y > 160 && y > lastY);
      else header.classList.remove("is-hidden");
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── I-01 고정 무대 + I-02 덮기 + I-10 부드러운 스크롤 : 데스크톱 · 움직임 줄이기 아님 ── */
  function desktop(){
    /* I-10 Lenis — 데스크톱만(터치는 기본 스크롤) */
    if (window.Lenis){
      lenis = new Lenis({ lerp: .1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      tick = function(t){ lenis.raf(t * 1000); };
      gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
    }
    var sec = document.querySelector("[data-i='I-01']");
    if (!sec) return;
    var scenes = sec.querySelectorAll(".m-scene"), dots = sec.querySelectorAll(".m-dot");
    var next = sec.nextElementSibling;
    var N = scenes.length, cur = -1;
    sec.classList.add("is-stage");
    if (next && next.getAttribute("data-i") === "I-02") next.classList.add("w-cover");
    [].forEach.call(scenes, function(s){
      [].forEach.call(s.querySelectorAll(".m-scene__text > *"), function(el, k){ el.style.setProperty("--k", k); });
    });
    function show(i){
      if (i === cur) return; cur = i;
      [].forEach.call(scenes, function(s, j){ s.classList.toggle("is-on", i === j); });
      [].forEach.call(dots, function(d, j){ if (i === j) d.setAttribute("aria-current", "step"); else d.removeAttribute("aria-current"); });
    }
    show(0);
    var vh = function(){ return window.innerHeight; };
    var st = ScrollTrigger.create({
      trigger: sec, start: "top top",
      end: function(){ return "+=" + (vh() * N); },      /* 장면 전환 (N-1) 화면 + 덮기 1 화면 */
      pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
      onUpdate: function(self){
        var d = self.progress * (self.end - self.start), span = vh() * (N - 1);
        var p = Math.min(1, d / span);                       /* 장면 구간 진행 0~1 */
        show(Math.min(N - 1, Math.floor(p * N)));
        [].forEach.call(dots, function(dot, j){ dot.style.setProperty("--fill", Math.max(0, Math.min(1, p * N - j))); });
        sec.style.setProperty("--cover", Math.max(0, Math.min(1, (d - span) / vh())));
      }
    });
    [].forEach.call(dots, function(dot, j){
      dot.onclick = function(){
        var y = st.start + (vh() * (N - 1)) * (j / N) + 2;
        if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo(0, y);
      };
    });
    return function(){
      sec.classList.remove("is-stage"); sec.style.removeProperty("--cover");
      [].forEach.call(scenes, function(s){ s.classList.remove("is-on"); });
      if (next) next.classList.remove("w-cover");
      if (lenis){ gsap.ticker.remove(tick); lenis.destroy(); lenis = null; }
    };
  }

  /* 같은 페이지 안 링크(#) — 부드러운 스크롤이 켜져 있으면 그쪽으로 */
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !lenis) return;
    var t = document.querySelector(a.getAttribute("href"));
    if (t){ e.preventDefault(); lenis.scrollTo(t, { duration: 1.1 }); }
  });

  function start(){
    if (RM.matches || root.classList.contains("w-nomotion")) return stop();
    root.classList.add("w-motion");
    splitAll(); indexReveals(); observe();
    if (HAS_GSAP){
      mm = gsap.matchMedia();
      mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", desktop);
    }
  }
  function stop(){
    if (mm){ mm.revert(); mm = null; }
    if (io){ io.disconnect(); io = null; }
    root.classList.remove("w-motion");
    if (header) header.classList.remove("is-hidden");
  }

  document.addEventListener("w:motion", function(e){ if (e.detail.on) start(); else stop(); });
  document.addEventListener("w:layout", function(){ if (root.classList.contains("w-motion")) observe(); if (HAS_GSAP) ScrollTrigger.refresh(); });
  /* 폭이 바뀔 때만 다시 나눈다 — 세로만 바뀐 건 모바일 주소창(2번) */
  var rt;
  window.addEventListener("resize", function(){
    if (window.innerWidth === lastW) return; lastW = window.innerWidth;
    clearTimeout(rt); rt = setTimeout(function(){ if (root.classList.contains("w-motion")){ splitAll(); if (HAS_GSAP) ScrollTrigger.refresh(); } }, 200);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (root.classList.contains("w-motion")){ splitAll(); if (HAS_GSAP) ScrollTrigger.refresh(); } });
  RM.addEventListener && RM.addEventListener("change", function(){ stop(); start(); });
  start();
})();
