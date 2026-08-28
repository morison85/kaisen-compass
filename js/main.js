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
})();
