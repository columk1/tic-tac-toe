// let grid = [];
// for (let i = 0; i < 9; i++) {
//     grid.push('')
// }

// let board = document.querySelector('.game-board')

// grid.forEach((elem, index) => {
//     const cell = document.createElement('div')
//     cell.className  = 'cell'
//     board.appendChild(cell)
// })

const playerFactory = (name, mark) => {
  const playTurn = (board, cell) => {
    const index = board.cells.findIndex((position) => position === cell)
    if (board.boardArray[index] === '') {
      board.render()
      return index
    }
    return null
  }
  return { name, mark, playTurn }
}

const boardModule = (() => {
  let boardArray = ['', '', '', '', '', '', '', '', '']
  const gameBoard = document.querySelector('.board')
  const cells = Array.from(document.querySelectorAll('.cell'))
  let winner = null
  const render = () => {
    boardArray.forEach((mark, index) => {
      cells[index].dataset.state = boardArray[index]
    })
    // Remove dataset from any cells with values to prevent hover effect triggered by 'turn' data
    cells.forEach((cell, index) => {
      if (boardArray[index] !== '') {
        delete cells[index].dataset.turn
      }
    })
  }

  const reset = () => {
    boardArray = ['', '', '', '', '', '', '', '', '']
  }

  const checkWin = () => {
    const winArrays = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    winArrays.forEach((combination) => {
      if (
        boardArray[combination[0]] &&
        boardArray[combination[0]] === boardArray[combination[1]] &&
        boardArray[combination[0]] === boardArray[combination[2]]
      ) {
        winner = 'current'
        console.log({ winner })
        cells[combination[0]].classList.add('winner')
        cells[combination[1]].classList.add('winner')
        cells[combination[2]].classList.add('winner')
      }
    })
    return winner || (boardArray.includes('') ? null : 'Tie')
  }

  return { render, gameBoard, cells, boardArray, checkWin, reset }
})()

const gamePlay = (() => {
  const playerOneName = document.querySelector('#player1')
  const playerTwoName = document.querySelector('#player2')
  const form = document.querySelector('.player-info')
  const resetBtn = document.querySelector('#reset')
  let currentPlayer
  let playerOne
  let playerTwo

  const switchTurn = () => {
    currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne
    setActiveStates()
  }

  const setActiveStates = () => {
    document.querySelectorAll('[data-turn]').forEach((e, index) => {
      e.dataset.turn = currentPlayer.mark
    })
  }

  const gameRound = () => {
    const board = boardModule
    const gameStatus = document.querySelector('.game-status')
    if (currentPlayer.name !== '') {
      gameStatus.textContent = `${currentPlayer.name}'s Turn`
    } else {
      gameStatus.textContent = 'Board: '
    }

    board.gameBoard.addEventListener('click', (e) => {
      e.preventDefault()
      const play = currentPlayer.playTurn(board, e.target)
      if (play !== null) {
        board.boardArray[play] = `${currentPlayer.mark}`
        board.render()
        const winStatus = board.checkWin()
        if (winStatus === 'Tie') {
          gameStatus.textContent = 'Tie'
        } else if (winStatus === null) {
          switchTurn()
          fadeOut();
          setTimeout(fadeIn, 100);
          gameStatus.textContent = `${currentPlayer.name}'s Turn`
        } else {
          gameStatus.textContent = `Winner is ${currentPlayer.name}`
          board.gameBoard.classList.add('game-over')
          // reset()
          // render()
        }
      }
    })
  }

  const gameInit = () => {
    if (playerOneName.value !== '' && playerTwoName.value !== '') {
      playerOne = playerFactory(playerOneName.value, 'X')
      playerTwo = playerFactory(playerTwoName.value, 'O')
      currentPlayer = playerOne
      gameRound()
    }
  }

  const fadeIn = () => {
    document.querySelector('.game-status').classList.remove('m-fadeOut')
    document.querySelector('.game-status').classList.add('m-fadeIn')
  }

  const fadeOut = () => {
    document.querySelector('.game-status').classList.remove('m-fadeIn')
    document.querySelector('.game-status').classList.add('m-fadeOut')
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (playerOneName.value !== '' && playerTwoName.value !== '') {
      gameInit()
      form.classList.add('hidden')
      document.querySelector('.game-container').classList.remove('hidden')
      setTimeout(fadeIn, 300);
    } else {
      window.location.reload()
    }
  })

  resetBtn.addEventListener('click', () => {
    document.querySelector('.game-status').textContent = 'Board: '
    document.querySelector('#player1').value = ''
    document.querySelector('#player2').value = ''
    window.location.reload()
  })
  return { gameInit }
})()

gamePlay.gameInit()
