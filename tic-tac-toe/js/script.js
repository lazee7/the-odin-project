'use strict';

function Cell() {
  let value = '';

  // switch the current value of cell
  const changeValue = (symbol) => {
    value = symbol;
  };

  // retrieve current value of cell
  const getValue = () => value;

  return { getValue, changeValue };
}

function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  const winningCombinations = ['xxx', 'ooo'];

  const getBoard = () => board;

  /**
   * @param {Object} player - The player object
   * @param {string} player.name - The name of the player
   * @param {string} player.token - The players symbol
   * @param {number} row
   * @param {number} column
   *
   */
  const claimCell = (row, column, token) => {
    board[row][column].changeValue(token);

    // console.log(board);
  };

  const checkWinner = (players) => {
    let [rowSum, colSum, diag1Sum, diag2Sum] = Array(4).fill('');

    // check rows and colums
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        rowSum += board[i][j].getValue();
        colSum += board[j][i].getValue();
      }

      if (winningCombinations.includes(rowSum)) {
        const player = players.find((player) => player.token === rowSum[0]);
        return player;
      }

      if (winningCombinations.includes(colSum)) {
        const player = players.find((player) => player.token === colSum[0]);
        return player;
      }
      rowSum = '';
      colSum = '';
    }

    // check diagonals
    for (let i = 0; i < rows; i++) {
      diag1Sum += board[i][i].getValue();
      diag2Sum += board[i][rows - 1 - i].getValue();
    }

    if (winningCombinations.includes(diag1Sum)) {
      const player = players.find((player) => player.token === diag1Sum[0]);
      return player;
    }

    if (winningCombinations.includes(diag2Sum)) {
      const player = players.find((player) => player.token === diag2Sum[0]);
      return player;
    }

    return null;
  };

  const isBoardFull = () => {
    for (let row of board) {
      if (row.some((cell) => cell.getValue() === '')) return false;
    }
    return true;
  };

  const resetBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];

      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }
  };

  resetBoard();

  return {
    getBoard,
    claimCell,
    checkWinner,
    isBoardFull,
    resetBoard,
  };
}

function GameController(playerOneName = 'You', playerTwoName = 'Computer') {
  const board = Gameboard();

  const dialog = document.querySelector('#game-modal');
  // modal container

  const players = [
    {
      name: playerOneName,
      token: 'x',
    },

    {
      name: playerTwoName,
      token: 'o',
    },
  ];
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const updatePlayerName = (value, index) => {
    players[index].name = value;

    if (activePlayer.token === players[index].token) {
      activePlayer = players[index];
    }
  };
  const generateRandomIndex = (length) => {
    return Math.floor(Math.random() * length);
  };

  // reset player for new game
  const shufflePlayerTurn = (length) => {
    const randomIndex = generateRandomIndex(length);
    return players[randomIndex];
  };

  const getActivePlayer = () => activePlayer;

  const playRound = (row, column) => {
    const modal = dialog.querySelector('.modal');

    const modalText = modal.querySelector('p');

    // claim cell
    board.claimCell(row, column, activePlayer.token);

    // check for winner
    const winner = board.checkWinner(players);

    if (winner) {
      // end game

      dialog.showModal();

      modalText.innerHTML = `${winner.name} Win!!!!`;

      // board.resetBoard();

      activePlayer = shufflePlayerTurn(players.length);

      return true;
    }

    // check if board is full and call draw

    const isDraw = board.isBoardFull();

    if (isDraw) {
      //end game
      dialog.showModal();

      modalText.innerHTML = 'The game has been drawn';

      // board.resetBoard();
      activePlayer = shufflePlayerTurn(players.length);

      return true;
    }

    // switch players
    switchPlayerTurn();

    return false;
  };

  const getBoard = board.getBoard();

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  const resetGame = () => {
    board.resetBoard();
  };

  return { getActivePlayer, playRound, getBoard, updatePlayerName, resetGame };
}

function ScreenController() {
  const game = GameController();

  const board = game.getBoard;

  const boardEl = document.querySelector('.board');

  const newGameBtn = document.querySelector('.new-game');

  const modalBtn = document.querySelector('#game-modal button');

  const updateScreen = () => {
    // clear the board
    boardEl.innerHTML = '';

    const playerOne = document.querySelector('.player-one');

    const playerTwo = document.querySelector('.player-two');

    let activePlayer = game.getActivePlayer();

    // display current player

    if (activePlayer.token === 'x') {
      playerOne.dataset.active = true;
      playerTwo.dataset.active = false;
    } else {
      playerOne.dataset.active = false;
      playerTwo.dataset.active = true;
    }

    // render board squares

    board.forEach((row, rowIndex) => {
      const rowEl = document.createElement('div');
      rowEl.classList.add('row');

      row.forEach((column, index) => {
        const cellBtn = document.createElement('button');
        cellBtn.classList.add('cell');
        cellBtn.dataset.column = index;
        cellBtn.dataset.row = rowIndex;

        cellBtn.textContent = column.getValue();

        rowEl.appendChild(cellBtn);

        cellBtn.addEventListener('click', function () {
          if (column.getValue()) return;
          const gameEnd = game.playRound(rowIndex, index);

          updateScreen();

          // update active player variable
          activePlayer = game.getActivePlayer();
          if (!gameEnd && activePlayer.name === 'Computer') {
            computerPlayer();
          }
        });
      });

      boardEl.appendChild(rowEl);
    });
  };

  const computerPlayer = () => {
    document.body.classList.add('no-clicks');
    let availableCells = [];
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (!cell.getValue()) {
          availableCells.push([rowIdx, colIdx]);
        }
      });
    });

    const randomIndex = Math.floor(Math.random() * availableCells.length);

    const cell = availableCells[randomIndex];

    setTimeout(() => {
      game.playRound(cell[0], cell[1]);
      updateScreen();
      document.body.classList.remove('no-clicks');
    }, 700);
  };

  const restartGame = () => {
    game.resetGame();
    updateScreen();
  };

  newGameBtn.addEventListener('click', restartGame);

  modalBtn.addEventListener('click', restartGame);

  updateScreen();
}

ScreenController();
