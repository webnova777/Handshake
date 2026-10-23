/* ══════════════════════════════════════════════════════════════════════
   핸드쉐이크 와이어프레임 — 공통 머리·꼬리(헤더 G-H · 푸터 G-F · 모바일 하단 바 G-08)
   ⚠ 참고용 — 구현 코드로 재사용 금지
   공통 요소를 한 곳에서만 정의하려고 JS 로 끼워 넣는다(페이지마다 복사하지 않기 — CLAUDE.md 6번)
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var PAGES = [
    { id:"main",      file:"main.html",      name:"메인" },
    { id:"about",     file:"about.html",     name:"회사 소개" },
    { id:"service",   file:"service.html",   name:"서비스" },
    { id:"portfolio", file:"portfolio.html", name:"포트폴리오" },
    { id:"as",        file:"as.html",        name:"A/S 접수" },
    { id:"contact",   file:"contact.html",   name:"상담 신청" }
  ];
  var page = document.body.getAttribute("data-page");
  var href = window.W_HREF || function(f){ return f; };   /* 묶음 미리보기에서 다른 페이지 주소를 바꿔 끼우는 자리 */
  function cur(id){ return id === page ? ' aria-current="page"' : ""; }

  /* 와이어 도구 막대 — 실제 사이트에는 없다 */
  var label = document.body.getAttribute("data-wire") || "저충실도 와이어 v0.1";
  /* 배치 비교 스위치 — [data-variant="그룹"][data-v="값"] 중 하나만 보인다. 확정되면 HTML 에서 한쪽을 지운다(6번) */
  var groups = {};
  [].forEach.call(document.querySelectorAll("[data-variant]"), function(el){
    var g = el.getAttribute("data-variant");
    (groups[g] = groups[g] || []).push({ v: el.getAttribute("data-v"), label: el.getAttribute("data-vlabel") || el.getAttribute("data-v") });
  });
  var sw = Object.keys(groups).map(function(g){
    return '<label class="w-sw">' + g + ' <select data-group="' + g + '">' +
      groups[g].map(function(o){ return '<option value="' + o.v + '">' + o.label + '</option>'; }).join("") + '</select></label>';
  }).join("");
  var hasMotion = document.body.hasAttribute("data-motion");   /* motion.js 를 붙인 페이지만 [동작 끄기] */
  var bar = '<div class="w-bar"><div class="w-bar__in"><strong>' + label + ' · 참고용 — 구현 코드로 재사용 금지</strong>' +
    PAGES.map(function(p){ return '<a href="' + href(p.file) + '"' + cur(p.id) + '>' + p.name + '</a>'; }).join("") +
    sw + (hasMotion ? '<button type="button" id="wMotion">동작 끄기</button>' : '') +
    '<button type="button" id="wToggle">기획 메모 끄기</button></div></div>';

  /* G-H 헤더 */
  var gnb = PAGES.slice(1,5).map(function(p){ return '<a href="' + href(p.file) + '"' + cur(p.id) + '>' + p.name + '</a>'; }).join("");
  var header =
    '<header class="hdsk-header"><div class="hdsk-header__in">' +
      '<a class="hdsk-header__logo" href="' + href("main.html") + '"><div class="hdsk-ph"><span>로고</span></div></a>' +
      '<nav class="hdsk-gnb">' + gnb + '</nav>' +
      '<div class="hdsk-header__util"><a class="hdsk-header__login" href="#">로그인</a>' +
      '<a class="hdsk-btn hdsk-btn--primary" href="' + href("contact.html") + '">상담 신청</a></div>' +
      '<button class="hdsk-burger" type="button" id="wBurger" aria-label="메뉴">☰</button>' +
    '</div></header>' +
    '<div class="hdsk-mpanel" id="wPanel">' +
      PAGES.slice(1,5).map(function(p){ return '<a class="hdsk-mnav" href="' + href(p.file) + '">' + p.name + '</a>'; }).join("") +
      '<a class="hdsk-btn hdsk-btn--primary" href="' + href("contact.html") + '">상담 신청</a>' +
      '<a class="hdsk-btn hdsk-btn--secondary" href="#">전화하기</a>' +
      '<p class="hdsk-body"><a href="#">로그인</a></p>' +
    '</div>';

  /* G-F 푸터 — 값은 G-02 회사 정보표 [대기] */
  var footer =
    '<footer class="hdsk-footer"><div class="hdsk-wrap">' +
      '<div class="hdsk-ph hdsk-logo-ph"><span>로고</span></div>' +
      '<p>HAND SHAKE · 병원 진료지킴이 · 대표 안강훈 · 사업자등록번호 <b data-st="대기">000-00-00000</b></p>' +
      '<p>주소 <b data-st="대기">(G-02)</b> · 전화 <b>(G-02)</b> · 팩스 <b>(G-02)</b> · 메일 <b>(G-02)</b></p>' +
      '<p>영업시간 <b data-st="대기">(G-02)</b></p>' +
      '<div class="hdsk-footer__links"><a href="#">네이버 블로그</a><a href="#">네이버 지도</a><a href="#">개인정보처리방침</a><a href="#">이용약관</a></div>' +
      '<p style="margin-top:16px">© HAND SHAKE</p>' +
    '</div></footer>';

  /* G-08 모바일 하단 고정 바 — 상담 신청 페이지에서는 [전화하기] 만 */
  var mbar = '<nav class="hdsk-mbar"><a href="#">전화하기</a>' +
    (page === "contact" ? "" : '<a href="' + href("contact.html") + '">상담 신청</a>') + '</nav>';

  document.body.insertAdjacentHTML("afterbegin", bar + header);
  document.body.insertAdjacentHTML("beforeend", footer + mbar);

  document.getElementById("wBurger").addEventListener("click", function(){
    document.getElementById("wPanel").classList.toggle("is-open");
  });
  [].forEach.call(document.querySelectorAll(".w-sw select"), function(sel){
    sel.addEventListener("change", function(){
      var g = sel.getAttribute("data-group");
      [].forEach.call(document.querySelectorAll('[data-variant="' + g + '"]'), function(el){ el.hidden = el.getAttribute("data-v") !== sel.value; });
      document.dispatchEvent(new CustomEvent("w:layout"));
    });
  });
  var mb = document.getElementById("wMotion");
  if (mb) mb.addEventListener("click", function(){
    var off = document.documentElement.classList.toggle("w-nomotion");
    mb.textContent = off ? "동작 켜기" : "동작 끄기";
    document.dispatchEvent(new CustomEvent("w:motion", { detail: { on: !off } }));
  });
  var t = document.getElementById("wToggle");
  t.addEventListener("click", function(){
    var off = document.body.classList.toggle("notes-off");
    t.textContent = off ? "기획 메모 켜기" : "기획 메모 끄기";
  });
})();
