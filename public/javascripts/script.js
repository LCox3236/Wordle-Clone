const socket = io("192.168.0.25:8000", { withCredentials: true });
var deactivated = false;
var word = "";
var input = "";
var currentLine = 0;
var start = currentLine * word.length;
var end = currentLine * word.length + word.length;
const keyboard = document.querySelector("[data-keyboard]");
var data;

let players = [];
let currentPlayer;

class Player {
  constructor(id, name, guessNo, guesses) {
    this.id = id;
    this.name = name;
    this.guessNo = guessNo;
    this.guesses = guesses;
    this.inPlay = true;
    this.serverID = "";
  }
}

function startInteraction() {
  document.addEventListener("keydown", myKeyPress);
  document.addEventListener("click", handleMouseClick);
}

function endInteraction() {
  document.removeEventListener("keydown", myKeyPress);
  document.removeEventListener("click", handleMouseClick);
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    //pressKey(e.target.dataset.key)
    //console.log("letter pressed");

    processInput(e.target.dataset.key.charCodeAt(0));
    return;
  }

  if (e.target.matches("[data-enter]")) {
    //submitGuess()
    //console.log("enter pressed");

    processInput("13");
    return;
  }

  if (e.target.matches("[data-delete]")) {
    //deleteKey()
    //console.log("delete pressed");
    processInput("8");

    return;
  }
}

// function pickWord() {
//   var w = targetWords[Math.floor(Math.random() * targetWords.length)];
//   word = w;
// }

function playerJoins() {
  const username = window.prompt("enter username");
  currentPlayer = new Player(players.length, username, 0, []);
  socket.emit("join", currentPlayer);
  document.getElementById(
    "current-player"
  ).textContent = `Current user: ${username}`;
  setUp();
}

function addPlayer() {
  //console.log("addplayercalled");
  // if (!document.getElementById("playerNameInput").textContent) return;
  let name = document.getElementById("playerNameInput").value;
  document.getElementById("playerNameInput").hidden = true;
  document.getElementById("playerNameButton").hidden = true;
  currentPlayer = new Player(players.length, name, 0, []);
  socket.emit("join", currentPlayer);
  document.getElementById(
    "current-player"
  ).textContent = `Current user: ${name}`;
  setUp();
}

function nextRow() {
  input = "";
  currentLine++;
  start = currentLine * word.length;
  end = currentLine * word.length + word.length;
}

function generateBoxes() {
  for (let i = 0; i < word.length * 6; i++) {
    var ul = document.getElementById("lettersList");
    var li = document.createElement("li");
    document.getElementById("gameContainer").style.width =
      58 * word.length + "px";
    li.style.width = "58px";
    li.style.height = "58px";
    li.id = "letterBox" + i.toString();
    if (li.textContent == "undefined") {
      li.textContent = "";
    }
    ul.appendChild(li);
  }
}

function checkWord() {
  if (input.toLowerCase() == word.toLowerCase()) {
    //console.log("correct");
    correctInput(start, end);
  } else {
    //console.log("incorrect");
    incorrectInput(start, end);
  }
}

function correctInput(start, end) {
  for (i = start; i < end; i++) {
    document.getElementById("letterBox" + i).style.background = "green";

    keyboard
      .querySelector(
        `[data-key=${document.getElementById("letterBox" + i).textContent}]`
      )
      .classList.add("correct");
  }
  endInteraction();
  document.getElementById("answerOutput").style.display = "block";
  document.getElementById("answerOutput").textContent =
    "WELL DONE, ANSWER: " + word.toUpperCase();
  //document.getElementById("restartButton").style.display = "block";
  //document.getElementById("restartButton").disabled = false;
  socket.emit("correctAnswerGuessed");
}

function incorrectInput(start, end) {
  var wordIndex = 0;

  for (i = start; i < end; i++) {
    //console.log("word " + word[wordIndex] + " input " + input[wordIndex]);

    if (
      word[wordIndex].toLowerCase() != input[wordIndex].toLowerCase() &&
      word.includes(input[wordIndex].toLowerCase())
    ) {
      document.getElementById("letterBox" + i).style.background = "orange";
      keyboard
        .querySelector(
          `[data-key=${document.getElementById("letterBox" + i).textContent}]`
        )
        .classList.add("wrong-location");
    } else if (
      word[wordIndex].toLowerCase() === input[wordIndex].toLowerCase()
    ) {
      document.getElementById("letterBox" + i).style.background = "green";
      keyboard
        .querySelector(
          `[data-key=${document.getElementById("letterBox" + i).textContent}]`
        )
        .classList.add("correct");
    } else {
      document.getElementById("letterBox" + i).style.background = "grey";
      keyboard
        .querySelector(
          `[data-key=${document.getElementById("letterBox" + i).textContent}]`
        )
        .classList.add("wrong");
    }
    wordIndex++;
  }
  socket.emit("guessMade", input);
  if (currentLine < 5) {
    nextRow();
  } else {
    //console.log("too many rows");
    document.getElementById("answerOutput").style.display = "block";
    document.getElementById("answerOutput").textContent =
      "ANSWER: " + word.toUpperCase();
    endInteraction();
    //document.getElementById("restartButton").style.display = "block";
    //document.getElementById("restartButton").disabled = false;
  }
}

function updateDisplay(start, end) {
  var wordIndex = 0;
  for (i = start; i < end; i++) {
    if (wordIndex <= input.length) {
      document.getElementById("letterBox" + i).textContent = input[wordIndex];
    } else {
      document.getElementById("letterBox" + i).textContent = "";
    }
    wordIndex++;
  }
}

function processInput(letter) {
  if (letter >= 65 && letter <= 90 && input.length < word.length) {
    input += String.fromCharCode(letter);
  } else if (letter == 8) {
    input = input.substring(0, input.length - 1);
  } else if (letter == 13) {
    if (input.length == word.length) {
      checkWord();
    } else {
    }
  }
  updateDisplay(start, end);
}

function myKeyPress(e) {
  //console.log(e);

  let keynum;
  if (window.event) {
    // IE
    keynum = e.keyCode;
  } else if (e.which) {
    // Netscape/Firefox/Opera
    keynum = e.which;
  }
  processInput(keynum);
}

async function setUp() {
  //pickWord();
  start = currentLine * word.length;
  end = currentLine * word.length + word.length;
  generateBoxes();
  startInteraction();
  console.log(word);
}

function restart() {
  var ul = document.getElementById("lettersList");
  input = "";
  currentLine = 0;
  ul.innerHTML = "";
  document.getElementById("answerOutput").style.display = "none";
  document.getElementById("restartButton").style.display = "none";
  document.getElementById("restartButton").disabled = true;

  let keys = keyboard.querySelectorAll(`[data-key]`);
  keys.forEach((key) => {
    key.classList.remove("correct", "wrong", "wrong-location");
  });
  setUp();
}

socket.on("join", (data) => {
  console.log("join called");
  players.push(
    new Player(
      players.length,
      data.name,
      data.guessNo,
      data.guesses,
      data.inPlay
    )
  );
  document.getElementById(
    "players-table"
  ).innerHTML += `<div class="playerInTable">${data.name}: ${
    data.inPlay ? "Guesses made: " : "Guessed In: "
  }${data.guessNo}</div>`;
});

socket.on("joined", (data, receivedWord) => {
  console.log("joined called");
  data.forEach((player, index) => {
    players.push(
      new Player(
        players.length,
        data.name,
        data.guessNo,
        data.guesses,
        data.inPlay
      )
    );
    //console.log(player);
    document.getElementById(
      "players-table"
    ).innerHTML += `<div class="playerInTable">${player.name}: ${
      player.inPlay ? "Guesses made: " : "Guessed In: "
    }${player.guessNo}</div>`;
  });
  //console.log(data);
  word = receivedWord.replace(/(\r\n|\n|\r)/gm, "");
  console.log(`word from server = ${receivedWord}`);
  //playerJoins();
});

socket.on("update", (data) => {
  //console.log("update called");
  players = [];
  document.getElementById("players-table").innerHTML = "";
  data.forEach((player, index) => {
    players.push(
      new Player(
        players.length,
        data.name,
        data.guessNo,
        data.guesses,
        data.inPlay
      )
    );
    document.getElementById(
      "players-table"
    ).innerHTML += `<div class="playerInTable">${player.name}: ${
      player.inPlay ? "Guesses made: " : "Guessed In: "
    }${player.guessNo}</div>`;
  });
});

socket.on("showWaitMessage", () => {
  document.getElementById("NewWordText").style.display = "block";
  socket.emit("getNewWord");
});

socket.on("newWord", (newWord) => {
  document.getElementById("NewWordText").style.display = "none";
  word = newWord.replace(/(\r\n|\n|\r)/gm, "");
  console.log(`new word: ${newWord}`);
  restart();
});
