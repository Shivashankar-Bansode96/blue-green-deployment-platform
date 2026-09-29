const http = require("http");

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "v1";

const server = http.createServer((req, res) => {

    if (req.url === "/health") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            status: "UP",
            version: VERSION
        }));

        return;
    }

    res.writeHead(200, {
        "Content-Type": "text/html"
    });

    res.end(`
        <html>
            <head>
                <title>Blue-Green Deployment Platform</title>
            </head>
            <body>
                <h1>Blue-Green Deployment Platform</h1>
                <h2>Application Version: ${VERSION}</h2>
                <p>Pod: ${process.env.HOSTNAME}</p>
                <p>Status: Running</p>
            </body>
        </html>
    `);
});

server.listen(PORT, () => {
    console.log(`Application ${VERSION} running on port ${PORT}`);
});