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

  const resetBoard = () => {
    for (let i = 0; i < rows; i++) {
      board[i] = [];

      for (let j = 0; j < columns; j++) {
        board[i].push(Cell());
      }
    }
  };

  return {
    getBoard,
    claimCell,
    resetBoard,
  };
}

function GameController(playerOneName = 'Player', playerTwoName = 'Computer') {
  const board = Gameboard();

  const dialog = document.querySelector('#game-modal');
  // modal container

  const players = [
    {
      name: playerOneName,
      token: 'x',
      score: 0,
    },

    {
      name: playerTwoName,
      token: 'o',
      score: 0,
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

  const getActivePlayer = () => activePlayer;

  const getPlayers = () => players;

  const incrementScore = (index) => {
    players[index].score += 1;
  };

  const playRound = (row, column) => {
    const modal = dialog.querySelector('.modal');

    const modalText = modal.querySelector('p');

    // claim cell
    board.claimCell(row, column, activePlayer.token);

    // check for winner
    const winner = checkWinner();

    if (winner) {
      // end game

      dialog.showModal();

      const winnerIndex = players.findIndex(
        (player) => player.token === winner.token
      );
      incrementScore(winnerIndex);
      modalText.innerHTML = `${winner.name} Wins!!!!`;

      return true;
    }

    // check if board is full and call draw

    const isDraw = isBoardFull();

    if (isDraw) {
      //end game
      dialog.showModal();

      // increment both players score
      incrementScore(0);
      incrementScore(1);
      modalText.innerHTML = 'The game has been drawn';
      return true;
    }

    // switch players
    switchPlayerTurn();

    return false;
  };

  const gameBoard = board.getBoard();

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  const resetGame = () => {
    board.resetBoard();
    activePlayer = players[0];
  };

  const checkWinner = () => {
    const winningCombinations = ['xxx', 'ooo'];

    const [rows, columns] = Array(2).fill(3);
    let [rowSum, colSum, diag1Sum, diag2Sum] = Array(4).fill('');

    // check rows and colums
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < columns; j++) {
        rowSum += gameBoard[i][j].getValue();
        colSum += gameBoard[j][i].getValue();
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
      diag1Sum += gameBoard[i][i].getValue();
      diag2Sum += gameBoard[i][rows - 1 - i].getValue();
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
    for (let row of gameBoard) {
      if (row.some((cell) => cell.getValue() === '')) return false;
    }
    return true;
  };

  return {
    getActivePlayer,
    playRound,
    gameBoard,
    updatePlayerName,
    resetGame,
  };
}

function ScreenController() {
  const game = GameController();

  let bot = true;

  const board = game.gameBoard;

  const boardEl = document.querySelector('.board');

  const newGameBtn = document.querySelector('.new-game');

  const modalBtn = document.querySelector('#game-modal button');

  const updateScreen = (initial = false, gameData = null) => {
    const playerOne = document.querySelector('.player-one');

    const playerTwo = document.querySelector('.player-two');
    // on game start
    if (initial) {
      if (!gameData.bot && gameData) {
        bot = false;
        game.updatePlayerName(gameData.playerTwoName || 'Player2', 1);
        playerTwo.textContent = `${gameData.playerTwoName || 'Player2'}(o)`;
      }

      if (gameData.bot) {
        bot = true;
        game.updatePlayerName('Computer', 1);
        playerTwo.textContent = 'Computer(o)';
      }

      if (gameData.playerOneName) {
        game.updatePlayerName(gameData.playerOneName, 0);
        playerOne.textContent = `${gameData.playerOneName}(x)`;
      }
    }

    // clear the board
    boardEl.innerHTML = '';

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

        const cellContent = column.getValue();
        cellBtn.classList.add('cell');

        if (cellContent) {
          cellBtn.classList.add(cellContent);
        }
        cellBtn.dataset.column = index;
        cellBtn.dataset.row = rowIndex;

        cellBtn.textContent = cellContent;

        rowEl.appendChild(cellBtn);

        cellBtn.addEventListener('click', function () {
          if (column.getValue()) return;
          const gameEnd = game.playRound(rowIndex, index);

          updateScreen();

          // update active player variable
          activePlayer = game.getActivePlayer();
          if (bot && !gameEnd && activePlayer.name === 'Computer') {
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

  const initialModal = document.querySelector('.initial-modal');

  const form = initialModal.querySelector('form');

  const initialScreen = () => {
    initialModal.showModal();
  };

  const settingsBtn = document.querySelector('.settings-btn');

  settingsBtn.addEventListener('click', () => {
    initialModal.showModal();
  });

  newGameBtn.addEventListener('click', restartGame);

  modalBtn.addEventListener('click', restartGame);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    const playerOneName = formData.get('player-one-name');
    const playerTwoName = formData.get('player-two-name');

    const playerChoice = formData.get('player-choice');

    const gameData = {
      bot: playerChoice === 'bot' ? true : false,
      playerOneName,
      playerTwoName,
    };

    game.resetGame();
    updateScreen(true, gameData);
    initialModal.close();
  });

  initialScreen();
}

ScreenController();
