const qs = require("node:querystring");
const https = require("https");
const http = require("http");
const path = require("path");
const fs = require("fs");
const process = require("node:process");

const DL_ROOT = (exports.DL_ROOT = "/tmp/.pdfs");
exports.PORT = 9449;

exports.HandleViRequest = (res, url) => {
  const params = qs.parse(url.replace("/vi?", ""));

  // If no `?file` is given, open a fallback page
  if (url === "/vi") {
    fs.readFile("vipdf/index.html", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end();
      } else {
        res.writeHead(200);
        res.end(data, "utf8");
      }
    });
    return;
  }

  if (!Object.keys(params).includes("file") || !params.file.endsWith(".pdf")) {
    res.writeHead(400);
    res.end("Bad request", "utf8");
    return;
  }
  const fileUrl = params.file;

  if (fileUrl.startsWith("file:///") || fileUrl.startsWith("/")) {
    // For local resources we create symlinks
    // (this allows for LaTeX documents that are rebuilt
    // to be updated on page refresh without a new request to /vi)
    const fsPath = fileUrl.replace(/^file:\/\//, "");
    if (!fs.existsSync(fsPath)) {
      res.writeHead(400);
      res.end("Local resource does not exist: " + fsPath);
    } else if (fs.lstatSync(fsPath).isSymbolicLink()) {
      res.writeHead(400);
      res.end("Local resource is a symlink: " + fsPath);
    } else {
      const linkPath = `${DL_ROOT}/${path.basename(fsPath)}`;
      try {
        fs.unlinkSync(linkPath);
      } catch (e) {
        if (e.code !== "ENOENT") {
          console.error(e);
          res.writeHead(500);
          res.end();
          return;
        }
      }

      // Create a '.pdfs/<name> -> file:///.../<name>' symlink
      fs.symlink(fsPath, linkPath, e => {
        if (e) {
          console.error(e);
          process.exit(-1);
        } else {
          res.writeHead(302, {
            Location: "/web/viewer.html?file=" + linkPath.replace("/tmp", ""),
          });
          res.end();
        }
      });
    }
  } else if (fileUrl.match(/^https?|ftp/) !== null) {
    // For remote resources, fetch the PDF to /tmp
    getFollow(fileUrl, 0, data => {
      const outfile = getOutputFile();
      console.log(`fetched ${fileUrl} -> ${outfile} (${data.length} bytes)`);
      if (data.length === 0 || data.toString("ascii", 0, 4) !== "%PDF") {
        res.writeHead(400);
        const err = data.toString("utf8", 0, 256);
        console.error("error response", err);
        res.end("Non PDF response: " + fileUrl);
      } else {
        fs.writeFile(outfile, data, err => {
          if (err) {
            console.error(err);
            res.writeHead(500);
            res.end("Error saving local copy of document");
          } else {
            res.writeHead(302, {
              // XXX Assumes: `dlRoot == /tmp/.pdfs`
              Location: "/web/viewer.html?file=" + outfile.replace("/tmp", ""),
            });
            res.end();
          }
        });
      }
    });
  } else {
    res.writeHead(400);
    res.end("Unsupported URI scheme");
  }
};

// Make a GET request and follow redirects
const getFollow = (url, redirectCount, cb) => {
  const fetcher = url.startsWith("https") ? https : http;

  fetcher.get(url, res => {
    console.log(`${res.statusCode} Fetching data from ${url}`);

    if (300 <= res.statusCode && res.statusCode < 400) {
      if (redirectCount >= 5) {
        cb("Too many redirects");
      } else {
        getFollow(res.headers.location, ++redirectCount, cb);
      }
    } else {
      const body = [];

      res
        .on("data", chunk => {
          body.push(chunk);
        })
        .on("end", () => {
          // eslint-disable-next-line no-undef
          cb(Buffer.concat(body));
        });
    }
  });
};

const getOutputFile = () => {
  let i = 0;
  while (fs.existsSync(`${DL_ROOT}/${i}.pdf`)) {
    i++;
  }
  return `${DL_ROOT}/${i}.pdf`;
};
