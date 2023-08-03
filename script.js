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
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
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
    let winner = null

    console.log("Check Win: " + boardArray)

    winPatterns.forEach((combination) => {
      if (
        boardArray[combination[0]] &&
        boardArray[combination[0]] === boardArray[combination[1]] &&
        boardArray[combination[0]] === boardArray[combination[2]]
      ) {
        winner = boardArray[combination[0]]
        console.log({ winner })
        cells[combination[0]].classList.add('winner')
        cells[combination[1]].classList.add('winner')
        cells[combination[2]].classList.add('winner')
      }
    })
    return winner || (boardArray.includes('') ? null : 'Tie')
  }

  const hasWon = (mark) => {
    return winPatterns.some((pattern) => {
      return pattern.every((i) => {
        return boardArray[i] === mark
      })
    })
  }

  const isTie = () => {
    return !boardArray.includes('')
  }

  return { render, gameBoard, cells, boardArray, checkWin, hasWon, isTie, reset }
})()

//
// Two Player Game
//

const gamePlay = (() => {
  const playerOneName = document.querySelector('#player1')
  const playerTwoName = document.querySelector('#player2')
  const form = document.querySelector('.player-info')
  const gameStatus = document.querySelector('.game-status')
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
    if (currentPlayer.name !== '') {
      gameStatus.textContent = `${currentPlayer.name}'s Turn`
    } else {
      gameStatus.textContent = ''
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
          gameStatus.textContent = `${currentPlayer.name} Wins!`
          board.gameBoard.classList.add('game-over')
          // reset()
          // render()
        }
      }
    })
  }

  const gameInit = () => {
    form.classList.remove('hidden')
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

//
// Single Player Game
//

const gamePlayAI = (() => {
  const resetBtn = document.querySelector('#reset')
  let currentPlayer
  let player
  let computer

  const switchTurn = () => {
    currentPlayer = currentPlayer === player ? computer : player
    // setActiveStates()
  }

  // const setActiveStates = () => {
  //   document.querySelectorAll('[data-turn]').forEach((e, index) => {
  //     e.dataset.turn = currentPlayer.mark
  //   })
  // }

  const gameRound = () => {
    const board = boardModule
    const gameStatus = document.querySelector('.game-status')
    if (currentPlayer.name !== '') {
      gameStatus.textContent = `${currentPlayer.name}'s Turn`
    } else {
      gameStatus.textContent = ''
    }

    // const nextTurn = () => {
    //   let available = []
    //   board.boardArray.filter((cell, index) => {
    //     if (cell === '') {
    //       available.push(index)
    //     }
    //   })
    //   let move = available[0]
    //   board.boardArray[move] = 'O'
    //   board.render()
    //   switchTurn()
    // }

    const nextTurn = () => {
      let move = minimax(board, true).index
      board.boardArray[move] = 'O'
      board.render()
      updateStatus()
    }

    const minimax = (board, isMaximizing) => {
      if (board.hasWon('X')) {
        return { score: -10 }
      } else if (board.hasWon('O')) {
        return { score: 10 }
      } else if (board.isTie()) {
        return { score: 0 }
      }

      let cells = []

      board.boardArray.forEach((cell, index) => {
        if (cell === '') {
          cells.push(index)
        }
      })

      let moves = []
      cells.forEach((index) => {
        let move = {}
        move.index = index

        if (isMaximizing) {
          board.boardArray[index] = 'O'
          let g = minimax(board, false)
          move.score = g.score
        } else {
          board.boardArray[index] = 'X'
          let g = minimax(board, true)
          move.score = g.score
        }
        board.boardArray[index] = ''
        moves.push(move)
      })

      let bestMove

      if (isMaximizing) {
        var bestScore = -Infinity;
        for (var i = 0; i < moves.length; i++) {
          if (moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
      } else {
        var bestScore = Infinity;
        for (var i = 0; i < moves.length; i++) {
          if (moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMove = i;
          }
        }
    }
    return moves[bestMove];
  }

  const updateStatus = () => {
    const winStatus = board.checkWin()
    if (winStatus === 'Tie') {
      gameStatus.textContent = 'Tie'
    } else if (winStatus === null) {
      switchTurn()
      gameStatus.textContent = `Nice Move!`
    } else {
      gameStatus.textContent = `${currentPlayer.name} Wins!`
      board.gameBoard.classList.add('game-over')
    }
  }

    board.gameBoard.addEventListener('click', (e) => {
      e.preventDefault()
      const play = currentPlayer.playTurn(board, e.target)
      if (play !== null) {
        board.boardArray[play] = `${currentPlayer.mark}`
        board.render()
          updateStatus()
          nextTurn()
          // reset()
          // render()
        }
    })
  }

  const gameInit = () => {
    player = playerFactory('Player', 'X')
    computer = playerFactory('Computer', 'O')
    currentPlayer = player
    document.querySelector('.game-container').classList.remove('hidden')
    gameRound()
  }

  const fadeIn = () => {
    document.querySelector('.game-status').classList.remove('m-fadeOut')
    document.querySelector('.game-status').classList.add('m-fadeIn')
  }

  const fadeOut = () => {
    document.querySelector('.game-status').classList.remove('m-fadeIn')
    document.querySelector('.game-status').classList.add('m-fadeOut')
  }

  resetBtn.addEventListener('click', () => {
    document.querySelector('.game-status').textContent = 'Board: '
    document.querySelector('#player1').value = ''
    document.querySelector('#player2').value = ''
    window.location.reload()
  })
  return { gameInit }
})()

const start = () => {
  const btnGroup = document.getElementById('btn-group')
  const onePlayerBtn = document.querySelector('.one-player-btn')
  const twoPlayerBtn = document.querySelector('.two-player-btn')

  onePlayerBtn.addEventListener('click', () => {
    btnGroup.classList.add('hidden')
    gamePlayAI.gameInit()
  })

  twoPlayerBtn.addEventListener('click', () => {
    btnGroup.classList.add('hidden')
    gamePlay.gameInit()
  })
}

start()
