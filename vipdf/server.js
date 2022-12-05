// Since we allow pdfs from any origin to be loaded we should
// ensure that scripting is at least disabled.
// Test with the PDF from this issue:
//
//
//  Local resource:
//    http://localhost:9449/vi?file=/Users/jonas/Documents/XeT/foe/Monster/main.pdf
//  Basic:
//    http://localhost:9449/vi?file=http://www.kinsellaresearch.com/new/faces.pdf
//  Redirect (& autoprint script):
//    http://localhost:9449/vi?file=https://github.com/stephanrauh/ngx-extended-pdf-viewer/files/6854160/call_print_action.pdf
//  Scripting:
//    http://localhost:9449/vi?file=https://github.com/mozilla/pdf.js/files/9622672/PDF.mit.Datum_edit.pdf

const fs = require("fs");
const path = require("path");
const process = require("node:process");
const DL_ROOT = require("./lib.js").DL_ROOT;

// Create download folder: /tmp/.pdfs
fs.mkdir(DL_ROOT, e => {
  if (e && e.code !== "EEXIST") {
    console.error(e);
    process.exit(-1);
  }
});
// Create a '.pdfs -> /tmp/.pdfs' symlink
fs.symlink(DL_ROOT, path.basename(DL_ROOT), e => {
  if (e && e.code !== "EEXIST") {
    console.error(e);
    process.exit(-1);
  }
});

const WebServer = require("../test/webserver.js").WebServer;

const server = new WebServer();
server.port = 9449;
server.start();
