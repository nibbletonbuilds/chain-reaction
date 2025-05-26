import React, { useState } from 'react';

const NUM_PLAYERS = 2;
const PLAYER_COLORS = ['red', 'blue'];
const BOARD_ROWS = 5;
const BOARD_COLS = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getCriticalMass(row, col) {
  let neighbors = 0;
  if (row > 0) neighbors++;
  if (row < BOARD_ROWS - 1) neighbors++;
  if (col > 0) neighbors++;
  if (col < BOARD_COLS - 1) neighbors++;
  return neighbors;
}

function App() {
  const [board, setBoard] = useState(
    Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => ({ count: 0, owner: null }))
    )
  );

  const [currentPlayer, setCurrentPlayer] = useState(0);

  const nextPlayer = () => setCurrentPlayer((prev) => (prev + 1) % NUM_PLAYERS);

  const handleClick = async (r, c) => {
    const cell = board[r][c];
    if (cell.owner !== null && cell.owner !== currentPlayer) return;

    const newBoard = board.map((row) =>
      row.map((cell) => ({ ...cell }))
    );

    newBoard[r][c].count += 1;
    newBoard[r][c].owner = currentPlayer;
    setBoard(newBoard);

    await handleExplosions(newBoard, r, c, currentPlayer);
    nextPlayer();
  };

  const handleExplosions = async (board, r, c, player) => {
    const queue = [[r, c]];

    while (queue.length > 0) {
      const [row, col] = queue.shift();
      const cell = board[row][col];
      const criticalMass = getCriticalMass(row, col);

      if (cell.count < criticalMass) continue;

      board[row][col] = { count: 0, owner: null };
      setBoard([...board]);
      await sleep(300);

      const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
      ];

      for (let [dr, dc] of directions) {
        const nr = row + dr;
        const nc = col + dc;

        if (nr < 0 || nr >= BOARD_ROWS || nc < 0 || nc >= BOARD_COLS) continue;

        board[nr][nc].count += 1;
        board[nr][nc].owner = player;
        setBoard([...board]);
        await sleep(200);

        if (board[nr][nc].count >= getCriticalMass(nr, nc)) {
          queue.push([nr, nc]);
        }
      }
    }
  };

  const checkWinner = () => {
    const owners = board.flat().map((cell) => cell.owner).filter((o) => o !== null);
    const uniqueOwners = new Set(owners);
    if (uniqueOwners.size === 1 && owners.length > 0) {
      return uniqueOwners.values().next().value;
    }
    return null;
  };

  const winner = checkWinner();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chain Reaction</h1>
      {winner !== null ? (
        <h2 style={{ color: PLAYER_COLORS[winner] }}>Player {winner + 1} wins!</h2>
      ) : (
        <h2 style={{ color: PLAYER_COLORS[currentPlayer] }}>Player {currentPlayer + 1}'s Turn</h2>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${BOARD_COLS}, 60px)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => !winner && handleClick(r, c)}
              style={{
                width: 60,
                height: 60,
                border: '1px solid #999',
                backgroundColor: '#fff',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              {Array.from({ length: cell.count }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: cell.owner !== null ? PLAYER_COLORS[cell.owner] : 'gray',
                    position: 'absolute',
                    top: `${20 + (i % 2) * 15}px`,
                    left: `${20 + Math.floor(i / 2) * 15}px`,
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;