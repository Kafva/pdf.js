// == Tests ==
//  Basic:
//    http://localhost:9449/vi?file=http://www.kinsellaresearch.com/new/faces.pdf
//  Redirect (& autoprint script):
//    http://localhost:9449/vi?file=https://github.com/stephanrauh/ngx-extended-pdf-viewer/files/6854160/call_print_action.pdf
//  Scripting:
//    http://localhost:9449/vi?file=https://github.com/mozilla/pdf.js/files/9622672/PDF.mit.Datum_edit.pdf

const fs = require("fs");
const path = require("path");
const process = require("node:process");
const vipdf = require("./lib.js");

// Create download folder: /tmp/.pdfs
fs.mkdir(vipdf.DL_ROOT, e => {
  if (e && e.code !== "EEXIST") {
    console.error(e);
    process.exit(-1);
  }
});
// Create a '.pdfs -> /tmp/.pdfs' symlink
fs.symlink(vipdf.DL_ROOT, path.basename(vipdf.DL_ROOT), e => {
  if (e && e.code !== "EEXIST") {
    console.error(e);
    process.exit(-1);
  }
});

const WebServer = require("../test/webserver.js").WebServer;

const server = new WebServer();
server.port = vipdf.PORT;
server.start();
