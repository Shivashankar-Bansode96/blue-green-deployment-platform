const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

    if (req.url === "/health") {
        res.writeHead(500, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            status: "DOWN",
            version: "v3"
        }));

        return;
    }

    res.writeHead(200, {
        "Content-Type": "text/html"
    });

    res.end(`
        <html>
            <body>
                <h1>Blue-Green Deployment Platform</h1>
                <h2>Application Version: v3</h2>
                <p>WARNING: Broken Release</p>
            </body>
        </html>
    `);
});

server.listen(PORT, () => {
    console.log("Broken v3 application started");
});