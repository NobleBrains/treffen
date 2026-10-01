import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

import setupSocket from "./socket";

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", setupSocket);

const clientDist = path.resolve(process.cwd(), "client/dist");
app.use(express.static(clientDist));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const port = process.env.PORT || 8085;

http.listen(port, () => {
  console.log("SunoS Server listening on port " + port);
});

