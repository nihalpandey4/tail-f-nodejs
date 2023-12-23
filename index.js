const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const app = express();
const server = createServer(app);
const { Server } = require("socket.io");
app.use(express.json());
const io = new Server(server);
let fileWatcherEnabled = false;
let activeUsers = 0;

const fileWatcher = require("./fileWatcher");

io.on("connection", (socket) => {
    activeUsers++;
    if (!fileWatcherEnabled) {
        fileWatcherEnabled = true;
        fileWatcher.watch("randomLog.txt", (line) => {
            io.emit("chat message", line);
        });
    }

    console.log("a user connected");
    socket.on("disconnect", () => {
        activeUsers--;
        if (activeUsers == 0)
            fileWatcher.unwatch("randomLog.txt")
        console.log("user disconnected");
    })
})

app.get("/log", (req, res) => {
    res.sendFile(join(__dirname, "static/index.html"));
})

app.get("/tail", async (req, res) => {
    try {
        const tailFile = require("./tailFile");
        const n = +req.query.lines || 10;
        const tailData = await tailFile("randomLog.txt", n);
        res.status(200).json({
            data: tailData
        });
    }
    catch (err) {
        res.status(400).json({
            message: err.message
        })
    }
})

server.listen(3000, () => {
    console.info("server started at 3000");
})