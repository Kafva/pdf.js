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

const WebServer = require("../test/webserver.js").WebServer;

const server = new WebServer();
server.port = 9449;
server.start();
