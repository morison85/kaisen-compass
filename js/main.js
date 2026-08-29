// 回線コンパス 共通スクリプト
(function () {
  "use strict";

  // モバイルナビ開閉
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".gnav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ページトップボタン
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("visible", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 読了プログレスバー(記事ページのみ)
  var article = document.querySelector(".article-body");
  if (article) {
    var bar = document.createElement("div");
    bar.style.cssText = "position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#1558d6,#4b8bf5);z-index:300;width:0;transition:width .1s linear";
    document.body.appendChild(bar);
    window.addEventListener("scroll", function () {
      var rect = article.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var done = Math.min(Math.max(-rect.top, 0), total);
      bar.style.width = (total > 0 ? (done / total) * 100 : 0) + "%";
    }, { passive: true });
  }

  // アフィリエイトリンク未設定(href="#")のボタンはクリック無効
  // ※ ASP発行のリンクに差し替えれば自動的に有効になります
  document.querySelectorAll("a.btn[href='#']").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); });
  });

  // ヒーロー背景の視差(スクロール + カーソル追従)
  // ※ 動きを減らす設定・タッチ端末では動かさない
  var hero = document.querySelector(".hero");
  var heroBg = hero && hero.querySelector(".hero__bg");
  var canMove = window.matchMedia && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (heroBg && canMove) {
    var sy = 0, mx = 0, my = 0, queued = false;
    var apply = function () {
      queued = false;
      hero.style.setProperty("--sy", sy + "px");
      hero.style.setProperty("--mx", mx.toFixed(3));
      hero.style.setProperty("--my", my.toFixed(3));
    };
    var request = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", function () {
      if (window.scrollY > hero.offsetHeight + 200) return; // 画面外では計算しない
      sy = window.scrollY;
      request();
    }, { passive: true });

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        mx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 〜 0.5
        my = (e.clientY - r.top) / r.height - 0.5;
        request();
      });
      hero.addEventListener("pointerleave", function () {
        mx = my = 0;
        request();
      });
    }
  }

  // スクロールに合わせて順に現れる演出
  // ※ .reveal はJSから付ける。JS無効・非対応時は何も起きず通常表示のまま
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    var groups = [
      { sel: ".finder__item", step: 60 },
      { sel: ".card", step: 80 },
      { sel: ".sec-head", step: 0 }
    ];
    // 初期表示で画面内にある要素には .reveal を付けない(常に見えるまま)。
    // 画面外のものだけ隠して、スクロールで現れるようにする。
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var targets = [];
    groups.forEach(function (g) {
      var shown = 0;
      document.querySelectorAll(g.sel).forEach(function (el) {
        if (el.getBoundingClientRect().top < vh * 0.92) return; // すでに見えている
        el.classList.add("reveal");
        el.style.transitionDelay = (shown % 6) * g.step + "ms";
        shown++;
        targets.push(el);
      });
    });
    if (!targets.length) return;

    var show = function (el) {
      el.classList.add("is-in");
      if (io) io.unobserve(el);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) show(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    targets.forEach(function (el) { io.observe(el); });

    // 保険: 何らかの理由で監視が働かなくても、6秒後には必ず表示する
    setTimeout(function () {
      targets.forEach(function (el) { el.classList.add("is-in"); });
    }, 6000);
  }
})();
