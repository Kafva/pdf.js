// ==UserScript==
// @name         vipdf
// @version      0.1
// @description  Use ViPDF for all PDF links.
// @author       Kafva
// @namespace    https://raw.githubusercontent.com/Kafva/
// @downloadUrl  https://raw.githubusercontent.com/Kafva/vipdf/master/vipdf.user.js
// @updateUrl    https://raw.githubusercontent.com/Kafva/vipdf/master/vipdf.user.js
// @icon         https://i.imgur.com/XZGB4nK.png
// @include      https://*/*
// ==/UserScript==
document.querySelectorAll("[href]").forEach(link => {
  if (link.href.replace(/#|\?.*$/, "").endsWith(".pdf") || 
      link.type === "application/pdf") {
    const url = new URL(link.href);
    link.href = `http://localhost:9449/vi?file=${url.origin + url.pathname}`;
    link.setAttribute("style", "color: #de463e;");
  }
});
