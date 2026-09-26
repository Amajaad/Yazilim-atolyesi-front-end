// Production entry point for hosts such as Plesk that require a startup file.
const { createServer } = require("node:http");
const next = require("next");

const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();
const listenTarget = process.env.PORT || "3000";
const port = /^\d+$/.test(listenTarget) ? Number(listenTarget) : listenTarget;

app.prepare()
  .then(() => {
    const server = createServer((req, res) => {
      Promise.resolve(handle(req, res)).catch((error) => {
        console.error("Request failed:", error);
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
    });
    server.on("error", (error) => {
      console.error("Server failed:", error);
      process.exit(1);
    });
    server.listen(port);
  })
  .catch((error) => {
    console.error("Next.js startup failed:", error);
    process.exit(1);
  });
