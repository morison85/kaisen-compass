// 回線コンパス 2年総額の計算(sougaku / shindan 共用、2026-09-24 に sougaku.html から切り出し)
// 数字は hikaku / hikari-osusume / home-router と同じ(2026-09-17 確認)。料金を直したらここと hikaku を直す。
// セット割は各社公表の1回線あたり最大額。キャッシュバックと端末代は含めない。
(function (w) {
  "use strict";
  var S = [
    { id: "docomo", name: "ドコモ光(GMOとくとくBB)", cat: "hikari", home: 5720, mansion: 4400, set: { docomo: 1100 }, shibari: "2年", href: "https://px.a8.net/svt/ejp?a8mat=4BAI1I+3UQ1I2+50+54KL8Y", aff: true, beacon: "https://www12.a8.net/0.gif?a8mat=4BAI1I+3UQ1I2+50+54KL8Y", note: "ドコモ光セット割。家族のドコモ回線にも適用" },
    { id: "au", name: "auひかり(代理店NEXT)", cat: "hikari", home: 5610, mansion: 4180, set: { au: 1100, uq: 1100 }, shibari: "あり", href: "https://px.a8.net/svt/ejp?a8mat=4BAH9H+2PN4RE+348K+3H18R6", aff: true, beacon: "https://www19.a8.net/0.gif?a8mat=4BAH9H+2PN4RE+348K+3H18R6", note: "独自回線。工事費は光コラボと異なるため公式で確認" },
    { id: "sb", name: "ソフトバンク光(代理店NEXT)", cat: "hikari", home: 5720, mansion: 4180, set: { sb: 1100, ymobile: 1650 }, shibari: "あり", href: "https://px.a8.net/svt/ejp?a8mat=4BAH9H+2RFFKQ+348K+1BP8ZM", aff: true, beacon: "https://www15.a8.net/0.gif?a8mat=4BAH9H+2RFFKQ+348K+1BP8ZM", note: "おうち割 光セット(ワイモバイルは最大1,650円)。2026年12月に+330円" },
    { id: "biglobe", name: "ビッグローブ光", cat: "hikari", home: 5478, mansion: 4378, set: { au: 1100, uq: 1100 }, shibari: "あり", href: "https://px.a8.net/svt/ejp?a8mat=4BAH9H+1824BE+3HKU+1BMW42", aff: true, beacon: "https://www10.a8.net/0.gif?a8mat=4BAH9H+1824BE+3HKU+1BMW42", note: "au・UQのセット割が全国のフレッツ網で使える" },
    { id: "gmo", name: "GMOとくとくBB光", cat: "hikari", home: 5390, mansion: 4290, set: {}, shibari: "なし", href: "https://px.a8.net/svt/ejp?a8mat=4BAH9H+2OG9JU+50+6M7QUQ", aff: true, beacon: "https://www16.a8.net/0.gif?a8mat=4BAH9H+2OG9JU+50+6M7QUQ", note: "セット割なし。契約期間の縛り・違約金なし" },
    { id: "nuro", name: "NURO光(2ギガ)", cat: "hikari", home: 5720, mansion: 4730, set: { sb: 1100 }, shibari: "あり", href: "https://px.a8.net/svt/ejp?a8mat=4BAH9H+2N9ECA+2VMU+63WO2", aff: true, beacon: "https://www10.a8.net/0.gif?a8mat=4BAH9H+2N9ECA+2VMU+63WO2", note: "2年割で開通月〜24か月は戸建て4,530円・マンション3,530円。HGW料550円/月・事務手数料6,050円は別。独自回線で提供エリアは限定的" },
    { id: "rakuten", name: "楽天ひかり", cat: "hikari", home: 5280, mansion: 4180, set: {}, shibari: "あり", href: "https://network.mobile.rakuten.co.jp/hikari/", aff: false, note: "割引ではなく楽天ポイントの優遇(総額には含めていません)" },
    { id: "sbair", name: "SoftBank Air(代理店NEXT)", cat: "router", price: 4950, set: { sb: 1100, ymobile: 1650 }, shibari: "あり", href: "https://px.a8.net/svt/ejp?a8mat=4BAH9H+2YKMU2+348K+2N9KIA", aff: true, beacon: "https://www12.a8.net/0.gif?a8mat=4BAH9H+2YKMU2+348K+2N9KIA", note: "24ヶ月目まで4,950円(以後5,368円)。端末代は含めていません" },
    { id: "biglobewimax", name: "BIGLOBE WiMAX +5G", cat: "router", price: 3278, set: { au: 1100, uq: 1100 }, shibari: "なし", href: "https://px.a8.net/svt/ejp?a8mat=4BAH9H+198ZIY+B4+2BD44I", aff: true, beacon: "https://www16.a8.net/0.gif?a8mat=4BAH9H+198ZIY+B4+2BD44I", note: "4,928円から24ヶ月目まで1,650円引き(3,278円)で計算" },
    { id: "5gconnect", name: "5G CONNECT", cat: "router", price: 4800, set: {}, shibari: "なし", href: "//af.moshimo.com/af/c/click?a_id=5781568&p_id=4143&pc_id=10502&pl_id=5664", aff: true, beacon: "//i.moshimo.com/af/i/impression?a_id=5781568&p_id=4143&pc_id=10502&pl_id=5664", note: "端末購入プランの月額。レンタルは5,250円" },
    { id: "home5g", name: "ドコモ home 5G", cat: "router", price: 4950, set: { docomo: 1100 }, shibari: "なし", href: "https://www.docomo.ne.jp/home_5g/", aff: false, note: "端末代(実質無料の条件あり)は含めていません" }
  ];
  var FEE = 3300;                              // 契約事務手数料(各社ほぼ共通)
  var KOUJI = { home: 22000, mansion: 16500 }; // 光コラボの標準工事費の目安

  function monthly(s, sumai) { return s.cat === "hikari" ? (sumai === "home" ? s.home : s.mansion) : s.price; }
  function byId(id) { for (var i = 0; i < S.length; i++) if (S[i].id === id) return S[i]; return null; }
  function yen(n) { return n.toLocaleString("ja-JP") + "円"; }
  // o: { sumai: "home"|"mansion", carrier: "docomo"|"au"|"uq"|"sb"|"ymobile"|"rakuten"|"other",
  //      lines: 回線数, months: 24|36, koujiMode: "meyasu"|"free"|"input", koujiInput: 円 }
  function calc(s, o) {
    o = o || {};
    var months = parseInt(o.months, 10) || 24;
    var lines = o.lines == null ? 1 : Math.max(0, Math.min(10, parseInt(o.lines, 10) || 0));
    var sumai = o.sumai === "home" ? "home" : "mansion";
    var m = monthly(s, sumai);
    var kouji = 0;
    if (s.cat === "hikari") {
      kouji = o.koujiMode === "free" ? 0 : o.koujiMode === "input" ? Math.max(0, parseInt(o.koujiInput, 10) || 0) : KOUJI[sumai];
    }
    var per = s.set[o.carrier] || 0;
    var disc = per * lines * months;
    return { s: s, monthly: m, kouji: kouji, per: per, disc: disc, total: m * months + FEE + kouji - disc, months: months, lines: lines };
  }
  w.KC_TOTAL = { S: S, FEE: FEE, KOUJI: KOUJI, monthly: monthly, byId: byId, calc: calc, yen: yen };
})(window);
