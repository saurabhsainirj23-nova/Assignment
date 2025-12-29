const ROWS = 6;
const COLUMNS = 7;
let board = [];
let currentPlayer = "red";
let gameOver = false;

let round = 1;
let redWins = 0;
let yellowWins = 0;

const boardDiv = document.getElementById("board");
const message = document.getElementById("message");
const redScore = document.getElementById("red-score");
const yellowScore = document.getElementById("yellow-score");
const roundCount = document.getElementById("round-count");

function createBoard() {
  boardDiv.innerHTML = "";
  board = [];

  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLUMNS; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = r;
      cell.dataset.col = c;
      board[r][c] = "";
      cell.addEventListener("click", () => dropDisc(c));
      boardDiv.appendChild(cell);
    }
  }
}

function dropDisc(col) {
  if (gameOver) return;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row][col]) {
      board[row][col] = currentPlayer;
      const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
      cell.classList.add(currentPlayer);

      if (checkWin(row, col)) {
        message.innerText = `${capitalize(currentPlayer)} Wins Round ${round}!`;
        gameOver = true;
        highlightWinningDiscs(row, col);
        updateScore(currentPlayer);
        return;
      }

      currentPlayer = currentPlayer === "red" ? "yellow" : "red";
      message.innerText = `${capitalize(currentPlayer)}'s Turn`;
      return;
    }
  }
}

function updateScore(winner) {
  if (winner === "red") redWins++;
  else yellowWins++;

  redScore.textContent = redWins;
  yellowScore.textContent = yellowWins;
}

function checkWin(row, col) {
  return (
    checkDir(row, col, 1, 0) + checkDir(row, col, -1, 0) > 2 ||
    checkDir(row, col, 0, 1) + checkDir(row, col, 0, -1) > 2 ||
    checkDir(row, col, 1, 1) + checkDir(row, col, -1, -1) > 2 ||
    checkDir(row, col, 1, -1) + checkDir(row, col, -1, 1) > 2
  );
}

function checkDir(row, col, rowDir, colDir) {
  let r = row + rowDir;
  let c = col + colDir;
  let count = 0;

  while (r >= 0 && r < ROWS && c >= 0 && c < COLUMNS && board[r][c] === currentPlayer) {
    count++;
    r += rowDir;
    c += colDir;
  }

  return count;
}

function highlightWinningDiscs(row, col) {
  const directions = [
    [[1, 0], [-1, 0]],
    [[0, 1], [0, -1]],
    [[1, 1], [-1, -1]],
    [[1, -1], [-1, 1]]
  ];

  for (let dir of directions) {
    const connected = [[row, col]];

    for (let [dr, dc] of dir) {
      let r = row + dr;
      let c = col + dc;

      while (
        r >= 0 && r < ROWS &&
        c >= 0 && c < COLUMNS &&
        board[r][c] === currentPlayer
      ) {
        connected.push([r, c]);
        r += dr;
        c += dc;
      }
    }

    if (connected.length >= 4) {
      for (let [r, c] of connected) {
        const cell = document.querySelector(`.cell[data-row='${r}'][data-col='${c}']`);
        cell.classList.add("win");
      }
      break;
    }
  }
}

function nextGame() {
  if (round >= 4) {
    alert("All 4 rounds completed! Click 'Show Result' or 'Full Reset'.");
    return;
  }
  round++;
  roundCount.textContent = round;
  gameOver = false;
  currentPlayer = "red";
  message.innerText = "Red's Turn";
  createBoard();
}

function showResult() {
  let winner = "It's a Draw!";
  if (redWins > yellowWins) winner = "Red Wins Overall!";
  else if (yellowWins > redWins) winner = "Yellow Wins Overall!";
  alert(`Final Score:\nRed: ${redWins}\nYellow: ${yellowWins}\n${winner}`);
}

function resetAll() {
  redWins = yellowWins = round = 1;
  redScore.textContent = yellowScore.textContent = 0;
  roundCount.textContent = round;
  currentPlayer = "red";
  gameOver = false;
  message.innerText = "Red's Turn";
  createBoard();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize game
createBoard();
