const cors = require("cors");
const express = require("express");
const path = require("path");
const http = require("http");
const PORT = process.env.PORT || 3000;
const socket = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Access-Control-Allow-Origin"],
    credentials: true,
  },
});
const fs = require("fs");

let users = [];
let currentWord = "";

function newRandomWord() {
  fs.readFile("public/utils/listOfWords.txt", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    let words = data.split(",");
    currentWord = words[Math.floor(Math.random() * words.length)];
  });
}

function checkNewWordNeeded() {
  if (users.length < 1) return;
  let playersDone = 0;
  for (i = 0; i < users.length; i++) {
    if (users[i].inPlay == false) {
      playersDone++;
    }
  }
  //console.log(`players done`, playersDone);
  //console.log(`no of users`, users.length);
  if (playersDone == users.length) {
    return true;
  } else {
    //console.log("no new word needed");
  }
}

function generateNewWord() {}

app.use(cors());
app.use(express.static(path.join(__dirname, "/public/")));

newRandomWord();

io.on("connection", (socket) => {
  socket.emit("joined", users, currentWord);
  console.log(currentWord);
  console.log("connection established");
  socket.on("join", (data) => {
    data.serverID = socket.id;
    users.push(data);
    io.sockets.emit("join", data);
    console.log(`Player ${data.name} joined`);
    //console.log(users);
  });

  socket.on("joined", () => {
    socket.emit("joined", users, currentWord);
  });

  socket.on("guessMade", (input) => {
    for (i = 0; i < users.length; i++) {
      if (users[i].serverID === socket.id) {
        users[i].guesses.push(input);
        users[i].guessNo++;
        if (users[i].guessNo == 6) {
          users[i].inPlay = false;
          if (checkNewWordNeeded()) {
            io.emit("showWaitMessage");
          }
          io.emit("update", users);
        }
      }
    }
    //console.log(users);
    io.emit("update", users);
  });

  socket.on("correctAnswerGuessed", () => {
    for (i = 0; i < users.length; i++) {
      if (users[i].serverID === socket.id) {
        users[i].inPlay = false;
        users[i].guessNo++;
      }
    }
    //console.log(users);
    if (checkNewWordNeeded()) {
      io.emit("showWaitMessage");
    }
    io.emit("update", users);
  });

  socket.on("getNewWord", () => {
    setTimeout(() => {
      console.log(`generated new word: ${currentWord}`);
      for (i = 0; i < users.length; i++) {
        users[i].inPlay = true;
        users[i].guessNo = 0;
      }
      io.emit("newWord", currentWord);
      io.emit("update", users);
    }, 5000);
    newRandomWord();
  });

  socket.on("disconnect", () => {
    for (i = 0; i < users.length; i++) {
      if (users[i].serverID == socket.id) {
        console.log(`player ${users[i].name} disconnected`);
        users.splice(i, 1);
      }
    }
    //console.log(users);
    io.emit("update", users);
    checkNewWordNeeded();
  });
});

server.listen(8000, () =>
  console.log("Server Started, listening on http://192.168.0.25:8000")
);
