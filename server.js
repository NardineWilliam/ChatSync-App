const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(__dirname + "/docs"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/docs/index.html");
});

const users = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.emit("request_username");

  socket.on("set_username", (username) => {
    users[socket.id] = username;
    io.emit("user_connected", username);
  });

  socket.on("chat_message", (msg) => {
    io.emit("chat_message", { username: users[socket.id], message: msg });
  });

  socket.on("disconnect", () => {
    if (users[socket.id]) {
      io.emit("user_disconnected", users[socket.id]);
      delete users[socket.id];
    }
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
