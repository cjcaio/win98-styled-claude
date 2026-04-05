import { useState, useEffect, useCallback, useRef } from 'react'
import styles from './Minesweeper.module.css'

type CellState = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighbors: number
}

type GameState = 'idle' | 'playing' | 'won' | 'lost'

const DIFFICULTIES = {
  beginner:     { rows: 9,  cols: 9,  mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert:       { rows: 16, cols: 30, mines: 99 },
}
type Difficulty = keyof typeof DIFFICULTIES

const NUM_COLORS = ['', '#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080']

function createEmptyBoard(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false, isRevealed: false, isFlagged: false, neighbors: 0
    }))
  )
}

function placeMines(board: CellState[][], rows: number, cols: number, mines: number, safeR: number, safeC: number): CellState[][] {
  const next = board.map(row => row.map(c => ({ ...c })))
  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (!next[r][c].isMine && !(r === safeR && c === safeC)) {
      next[r][c].isMine = true
      placed++
    }
  }
  // Count neighbors
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (next[r][c].isMine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && next[nr][nc].isMine) count++
        }
      next[r][c].neighbors = count
    }
  }
  return next
}

function revealFrom(board: CellState[][], rows: number, cols: number, r: number, c: number): CellState[][] {
  const next = board.map(row => row.map(cell => ({ ...cell })))
  const queue: [number, number][] = [[r, c]]
  while (queue.length) {
    const [cr, cc] = queue.shift()!
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols) continue
    const cell = next[cr][cc]
    if (cell.isRevealed || cell.isFlagged || cell.isMine) continue
    cell.isRevealed = true
    if (cell.neighbors === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) queue.push([cr + dr, cc + dc])
    }
  }
  return next
}

function checkWon(board: CellState[][]): boolean {
  return board.every(row => row.every(c => c.isRevealed || c.isMine))
}

// ── LCD display (7-segment style) ────────────────────────
function LCD({ value }: { value: number }) {
  const display = String(Math.max(-99, Math.min(999, value))).padStart(3, '0')
  return (
    <div className={styles.lcd}>
      {display.split('').map((d, i) => <span key={i} className={styles.lcdDigit}>{d}</span>)}
    </div>
  )
}

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const [board, setBoard] = useState<CellState[][]>(() => createEmptyBoard(9, 9))
  const [gameState, setGameState] = useState<GameState>('idle')
  const [minesLeft, setMinesLeft] = useState(10)
  const [time, setTime] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { rows, cols, mines } = DIFFICULTIES[difficulty]

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => setTime(t => Math.min(t + 1, 999)), 1000)
  }, [stopTimer])

  useEffect(() => () => stopTimer(), [stopTimer])

  const reset = useCallback((diff: Difficulty = difficulty) => {
    stopTimer()
    setDifficulty(diff)
    setBoard(createEmptyBoard(DIFFICULTIES[diff].rows, DIFFICULTIES[diff].cols))
    setGameState('idle')
    setMinesLeft(DIFFICULTIES[diff].mines)
    setTime(0)
  }, [difficulty, stopTimer])

  const handleCellClick = useCallback((r: number, c: number) => {
    if (gameState === 'won' || gameState === 'lost') return
    setBoard(prev => {
      const cell = prev[r][c]
      if (cell.isRevealed || cell.isFlagged) return prev

      let next = prev
      if (gameState === 'idle') {
        next = placeMines(prev, rows, cols, mines, r, c)
        startTimer()
        setGameState('playing')
      }

      if (next[r][c].isMine) {
        // Reveal all mines
        const exploded = next.map(row => row.map(cell =>
          cell.isMine ? { ...cell, isRevealed: true } : cell
        ))
        stopTimer()
        setGameState('lost')
        return exploded
      }

      const revealed = revealFrom(next, rows, cols, r, c)
      if (checkWon(revealed)) {
        stopTimer()
        setGameState('won')
      }
      return revealed
    })
  }, [gameState, rows, cols, mines, startTimer, stopTimer])

  const handleRightClick = useCallback((e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault()
    if (gameState === 'won' || gameState === 'lost') return
    setBoard(prev => {
      const cell = prev[r][c]
      if (cell.isRevealed) return prev
      const next = prev.map(row => row.map(c => ({ ...c })))
      next[r][c].isFlagged = !cell.isFlagged
      setMinesLeft(m => cell.isFlagged ? m + 1 : m - 1)
      return next
    })
  }, [gameState])

  const face = gameState === 'won' ? '😎' : gameState === 'lost' ? '😵' : '🙂'

  return (
    <div className={styles.wrap}>
      {/* Difficulty bar */}
      <div className={styles.diffBar}>
        {(Object.keys(DIFFICULTIES) as Difficulty[]).map(d => (
          <button
            key={d}
            className={`${styles.diffBtn} ${difficulty === d ? styles.diffBtnActive : ''}`}
            onClick={() => reset(d)}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* Game panel */}
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <LCD value={minesLeft} />
          <button className={styles.faceBtn} onClick={() => reset()} title="New Game">
            {face}
          </button>
          <LCD value={time} />
        </div>

        {/* Board */}
        <div
          className={styles.board}
          style={{ gridTemplateColumns: `repeat(${cols}, 18px)` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              let content: React.ReactNode = null
              let cellClass = styles.cell

              if (cell.isFlagged && !cell.isRevealed) {
                content = '🚩'
              } else if (!cell.isRevealed) {
                cellClass = `${styles.cell} ${styles.cellHidden}`
              } else if (cell.isMine) {
                content = '💣'
                cellClass = `${styles.cell} ${styles.cellMine}`
              } else {
                cellClass = `${styles.cell} ${styles.cellRevealed}`
                if (cell.neighbors > 0) {
                  content = (
                    <span style={{ color: NUM_COLORS[cell.neighbors], fontWeight: 'bold' }}>
                      {cell.neighbors}
                    </span>
                  )
                }
              }

              return (
                <div
                  key={`${r}-${c}`}
                  className={cellClass}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleRightClick(e, r, c)}
                >
                  {content}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Win/loss overlay message */}
      {(gameState === 'won' || gameState === 'lost') && (
        <div className={styles.result}>
          {gameState === 'won' ? `You win! 🎉 ${time}s` : 'Boom! 💥'}
          <button className="win98-button" onClick={() => reset()}>Play Again</button>
        </div>
      )}
    </div>
  )
}
