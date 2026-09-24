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

  // CTA クリックの計測(2026-09-24)。[data-cta] 付きリンクのクリックを GA4 の gtag があるときだけ送る。
  // ※ 測定IDは未取得なので gtag タグ自体は入れていない(head の <!-- analytics --> が置き場所)。無いときは何もしない
  document.addEventListener("click", function (e) {
    var t = e.target;
    var a = t && t.closest ? t.closest("[data-cta]") : null;
    if (!a || typeof window.gtag !== "function") return;
    try {
      window.gtag("event", "cta_click", {
        cta_type: a.getAttribute("data-cta") || "",
        href: a.getAttribute("href") || "",
        page_path: location.pathname
      });
    } catch (err) {}
  }, true);

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

  // 結論直下CTAのキャリア切替(光回線記事、2026-09-24)
  // <p class="answer-cta answer-cta--pick" data-default="other" data-picks='[{k,t,label,href,beacon,pr,sub,head},…]'>
  //   チップを押すとボタンの文言/リンク/PR文を差し替え、選んだキャリアを localStorage(kc-carrier)に保存して
  //   次の記事でも既定にする。final-pick と固定バーも同じ窓口に追従する。既定チップでは記事の元の内容を使う。
  //   A8 の表示計測(0.gif)は、そのページにまだ無い案件を表示したときだけ1回付ける
  var pickBox = document.querySelector(".answer-cta--pick[data-picks]");
  var picks = null;
  var pickListeners = [];
  if (pickBox) {
    try { picks = JSON.parse(pickBox.getAttribute("data-picks")); } catch (e) { picks = null; }
    if (!picks || !picks.length) picks = null;
  }
  var getCarrier = function () { try { return localStorage.getItem("kc-carrier") || ""; } catch (e) { return ""; } };
  var setCarrier = function (k) { try { localStorage.setItem("kc-carrier", k); } catch (e) {} };
  if (picks) {
    var findPick = function (k) { for (var i = 0; i < picks.length; i++) if (picks[i].k === k) return picks[i]; return null; };
    var pBtn = pickBox.querySelector(".answer-cta__btn");
    var pLabel = pBtn && pBtn.querySelector("span");
    var pPr = pickBox.querySelector(".answer-cta__pr");
    var chips = pickBox.querySelectorAll(".answer-cta__chip");
    var fp = document.querySelector(".final-pick");
    var fpBtn = fp && fp.querySelector("a.btn--cv");
    var fpT = fp && fp.querySelector(".final-pick__t");
    var orig = {
      label: pLabel ? pLabel.textContent : "", href: pBtn ? pBtn.getAttribute("href") : "", pr: pPr ? pPr.textContent : "",
      fpHtml: fpBtn ? fpBtn.innerHTML : "", fpHref: fpBtn ? fpBtn.getAttribute("href") : "", fpT: fpT ? fpT.textContent : ""
    };
    var defK = pickBox.getAttribute("data-default") || picks[0].k;
    var fired = {};
    var applyPick = function (k, save) {
      var p = findPick(k) || findPick(defK);
      if (!p) return;
      var isDef = p.k === defK;
      for (var i = 0; i < chips.length; i++) {
        var on = chips[i].getAttribute("data-k") === p.k;
        chips[i].classList.toggle("is-on", on);
        chips[i].setAttribute("aria-pressed", on ? "true" : "false");
      }
      if (pBtn) pBtn.setAttribute("href", isDef ? orig.href : p.href);
      if (pLabel) pLabel.textContent = isDef ? orig.label : p.label;
      if (pBtn) pBtn.setAttribute("data-sticky", p.short || p.label);
      if (pPr) pPr.textContent = isDef ? orig.pr : p.pr;
      if (fpBtn) {
        if (isDef) {
          fpBtn.setAttribute("href", orig.fpHref);
          fpBtn.innerHTML = orig.fpHtml;
          if (fpT) fpT.textContent = orig.fpT;
        } else {
          fpBtn.setAttribute("href", p.href);
          fpBtn.textContent = p.label;
          if (p.sub) { var sm = document.createElement("small"); sm.textContent = p.sub; fpBtn.appendChild(sm); }
          if (fpT && p.head) fpT.textContent = p.head;
        }
      }
      if (p.beacon && !fired[p.k]) {
        fired[p.k] = true;
        var key = p.beacon.split("a8mat=")[1] || "";
        var exists = key && document.querySelector('img[src*="' + key + '"], img[data-src*="' + key + '"]');
        if (!exists) {
          var im = document.createElement("img");
          im.className = "answer-cta__imp"; im.width = 1; im.height = 1; im.alt = ""; im.src = p.beacon;
          pickBox.appendChild(im);
        }
      }
      if (save) setCarrier(p.k);
      for (var j = 0; j < pickListeners.length; j++) pickListeners[j](p);
    };
    for (var c = 0; c < chips.length; c++) {
      chips[c].addEventListener("click", function () { applyPick(this.getAttribute("data-k"), true); });
    }
    pickBox.classList.add("is-js");
    applyPick(getCarrier() || defK, false);
  }

  // モバイル固定CTAバー。記事では結論直下CTA(または本文の最初の広告ボタン)を再掲し、
  // 診断・総額ページは結果を出した後に window.kcSticky({anchor, href, label, pr}) で1位の窓口を載せる。
  // ※ PCでは表示しない(CSS)。閉じたらそのセッション中は出さない。anchor が画面内のときは隠す
  var sticky = (function () {
    var closedKey = "stickycta-closed";
    var closed = false, bar = null, link = null, prTag = null, anchor = null, footer = null;
    try { closed = sessionStorage.getItem(closedKey) === "1"; } catch (e) {}
    var update = function () {
      if (!bar || !anchor) return;
      var y = window.scrollY;
      var r = anchor.getBoundingClientRect();
      var vh = window.innerHeight;
      var inView = r.top < vh && r.bottom > 0;
      var nearEnd = footer && footer.getBoundingClientRect().top < vh + 80;
      bar.classList.toggle("is-on", y > 480 && !inView && !nearEnd);
    };
    return function (opt) {
      if (closed || !opt) return;
      if (opt.anchor === null) {
        // 結果を消したとき(診断のやり直しなど)。anchor を外して、次の結果が来るまで出さない
        anchor = null;
        if (bar) { bar.classList.remove("is-on"); document.body.classList.remove("has-stickycta"); }
        return;
      }
      if (!opt.anchor || !opt.href) return;
      if (!bar) {
        bar = document.createElement("div");
        bar.className = "stickycta";
        bar.setAttribute("role", "complementary");
        bar.setAttribute("aria-label", "このページのおすすめ");
        bar.innerHTML = '<span class="stickycta__pr">PR</span>' +
          '<a class="stickycta__btn" data-cta="sticky" rel="nofollow sponsored noopener" target="_blank"></a>' +
          '<button type="button" class="stickycta__close" aria-label="閉じる">×</button>';
        link = bar.querySelector(".stickycta__btn");
        prTag = bar.querySelector(".stickycta__pr");
        document.body.appendChild(bar);
        document.body.classList.add("has-stickycta");
        footer = document.querySelector("footer");
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        bar.querySelector(".stickycta__close").addEventListener("click", function () {
          closed = true;
          bar.classList.remove("is-on");
          document.body.classList.remove("has-stickycta");
          try { sessionStorage.setItem(closedKey, "1"); } catch (e) {}
          var old = bar; bar = null;
          setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 350);
        });
      }
      anchor = opt.anchor;
      document.body.classList.add("has-stickycta");
      var label = String(opt.label || "").replace(/\s+/g, " ").trim();
      if (label.length > 24) label = label.slice(0, 23) + "…";
      link.setAttribute("href", opt.href);
      link.textContent = label;
      var isAd = opt.pr !== false;
      link.setAttribute("rel", isAd ? "nofollow sponsored noopener" : "nofollow noopener");
      prTag.hidden = !isAd;
      update();
    };
  })();
  window.kcSticky = sticky;
  (function () {
    var q = window.kcStickyQueue;
    if (q && q.length) for (var i = 0; i < q.length; i++) sticky(q[i]);
    window.kcStickyQueue = { push: function (o) { sticky(o); } };
  })();

  (function stickyCtaArticle() {
    var artBody = document.querySelector(".article-body");
    if (!artBody) return;
    var primary = null;
    if (picks && pickBox) primary = pickBox.querySelector(".answer-cta__btn");
    if (!primary) {
      var cands = artBody.querySelectorAll('a.btn--cv[rel~="sponsored"]');
      for (var ci = 0; ci < cands.length; ci++) {
        if (/a8\.net|moshimo\.com|valuecommerce\.com/.test(cands[ci].getAttribute("href") || "")) { primary = cands[ci]; break; }
      }
    }
    if (!primary) return;
    var labelOf = function (a) {
      var clone = a.cloneNode(true);
      var rm = clone.querySelectorAll("small, img, .answer-cta__go");
      for (var i = 0; i < rm.length; i++) rm[i].parentNode.removeChild(rm[i]);
      return a.getAttribute("data-sticky") || clone.textContent || "";
    };
    var push = function () { sticky({ anchor: primary, href: primary.getAttribute("href"), label: labelOf(primary) }); };
    push();
    pickListeners.push(push);
  })();

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
