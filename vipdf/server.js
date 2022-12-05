const WebServer = require("../test/webserver.js").WebServer;

const server = new WebServer();
server.port = 9449;
server.start();
