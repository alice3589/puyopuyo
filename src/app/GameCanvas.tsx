'use client';

import { useEffect, useState } from 'react';
import { GameState, PuyoColor, FIELD_WIDTH, FIELD_HEIGHT } from '@/types/game';
import GameField from '@/components/GameField';

const COLORS: PuyoColor[] = ['red', 'blue', 'green', 'yellow', 'purple'];

export default function GameCanvas() {
  const [gameState, setGameState] = useState<GameState>({
    field: Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill('empty')),
    currentPuyo: [],
    nextPuyo: [],
    score: 0,
    gameOver: false,
  });

  // 新しいぷよを生成する関数
  const generateNewPuyo = (): GameState['currentPuyo'] => {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return [
      { color, x: 2, y: 0 },
      { color, x: 2, y: 1 },
    ];
  };

  // 移動判定関数
  const canMoveLeft = (puyo: GameState['currentPuyo'], field: GameState['field']) => {
    return puyo.every(p => p.x > 0 && field[p.y][p.x - 1] === 'empty');
  };

  const canMoveRight = (puyo: GameState['currentPuyo'], field: GameState['field']) => {
    return puyo.every(p => p.x < FIELD_WIDTH - 1 && field[p.y][p.x + 1] === 'empty');
  };

  const canMoveDown = (puyo: GameState['currentPuyo'], field: GameState['field']) => {
    return puyo.every(p => p.y < FIELD_HEIGHT - 1 && field[p.y + 1][p.x] === 'empty');
  };

  const canRotate = (puyo: GameState['currentPuyo'], field: GameState['field']) => {
    return puyo.every(p => 
      p.x >= 0 && p.x < FIELD_WIDTH && 
      p.y >= 0 && p.y < FIELD_HEIGHT && 
      field[p.y][p.x] === 'empty'
    );
  };

  // ぷよの回転
  const rotatePuyo = (puyo: GameState['currentPuyo']) => {
    if (puyo.length !== 2) return puyo;
    
    const [p1, p2] = puyo;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return [
      { ...p1 },
      { ...p2, x: p1.x - dy, y: p1.y + dx },
    ];
  };

  // つながっているぷよを探す
  const findConnectedPuyos = (field: GameState['field'], x: number, y: number, color: PuyoColor, visited: boolean[][]): { x: number, y: number }[] => {
    if (y < 0 || y >= FIELD_HEIGHT || x < 0 || x >= FIELD_WIDTH || visited[y][x] || field[y][x] !== color) {
      return [];
    }

    visited[y][x] = true;
    const connected: { x: number, y: number }[] = [{ x, y }];

    // 上下左右をチェック
    const directions = [
      { dx: 0, dy: -1 }, // 上
      { dx: 0, dy: 1 },  // 下
      { dx: -1, dy: 0 }, // 左
      { dx: 1, dy: 0 },  // 右
    ];

    for (const { dx, dy } of directions) {
      const newX = x + dx;
      const newY = y + dy;
      connected.push(...findConnectedPuyos(field, newX, newY, color, visited));
    }

    return connected;
  };

  // ぷよを消す処理
  const clearPuyos = (field: GameState['field']): { newField: GameState['field'], clearedCount: number } => {
    const newField = field.map(row => [...row]);
    const visited = Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill(false));
    let clearedCount = 0;

    for (let y = 0; y < FIELD_HEIGHT; y++) {
      for (let x = 0; x < FIELD_WIDTH; x++) {
        if (field[y][x] !== 'empty' && !visited[y][x]) {
          const connected = findConnectedPuyos(field, x, y, field[y][x], visited);
          if (connected.length >= 4) {
            connected.forEach(({ x, y }) => {
              newField[y][x] = 'empty';
              clearedCount++;
            });
          }
        }
      }
    }

    return { newField, clearedCount };
  };

  // ぷよを落下させる処理
  const dropPuyos = (field: GameState['field']): GameState['field'] => {
    const newField = field.map(row => [...row]);
    
    for (let x = 0; x < FIELD_WIDTH; x++) {
      let emptyY = FIELD_HEIGHT - 1;
      for (let y = FIELD_HEIGHT - 1; y >= 0; y--) {
        if (newField[y][x] !== 'empty') {
          if (y !== emptyY) {
            newField[emptyY][x] = newField[y][x];
            newField[y][x] = 'empty';
          }
          emptyY--;
        }
      }
    }

    return newField;
  };

  useEffect(() => {
    // ゲームの初期化
    const initGame = () => {
      const newPuyo = generateNewPuyo();
      setGameState(prev => ({
        ...prev,
        currentPuyo: newPuyo,
        nextPuyo: generateNewPuyo(),
      }));
    };

    // ゲームループ
    const gameLoop = setInterval(() => {
      setGameState(prev => {
        if (prev.gameOver) {
          clearInterval(gameLoop);
          return prev;
        }

        const { currentPuyo, field } = prev;

        // 現在のぷよが存在しない場合は新しいぷよを生成
        if (currentPuyo.length === 0) {
          return {
            ...prev,
            currentPuyo: prev.nextPuyo,
            nextPuyo: generateNewPuyo(),
          };
        }

        // ぷよを下に移動できるかチェック
        if (canMoveDown(currentPuyo, field)) {
          return {
            ...prev,
            currentPuyo: currentPuyo.map(p => ({ ...p, y: p.y + 1 })),
          };
        } else {
          // ぷよを固定
          const newField = field.map(row => [...row]);
          currentPuyo.forEach(p => {
            newField[p.y][p.x] = p.color;
          });

          // ぷよを消す処理
          let { newField: clearedField, clearedCount } = clearPuyos(newField);
          let score = prev.score;

          // ぷよが消えた場合、スコアを加算してぷよを落下させる
          if (clearedCount > 0) {
            score += clearedCount * 10;
            clearedField = dropPuyos(clearedField);
          }

          // 新しいぷよを生成
          return {
            ...prev,
            field: clearedField,
            currentPuyo: [],
            nextPuyo: generateNewPuyo(),
            score,
          };
        }
      });
    }, 1000);

    initGame();

    return () => {
      clearInterval(gameLoop);
    };
  }, [gameState.gameOver]);

  return (
    <div 
      className="flex flex-col items-center gap-4"
      tabIndex={0}
      onKeyDown={(e) => {
        if (gameState.gameOver || gameState.currentPuyo.length === 0) return;

        const { currentPuyo, field } = gameState;
        const newPuyo = [...currentPuyo];

        switch (e.key) {
          case 'ArrowLeft':
            if (canMoveLeft(newPuyo, field)) {
              newPuyo.forEach(puyo => puyo.x--);
            }
            break;
          case 'ArrowRight':
            if (canMoveRight(newPuyo, field)) {
              newPuyo.forEach(puyo => puyo.x++);
            }
            break;
          case 'ArrowDown':
            if (canMoveDown(newPuyo, field)) {
              newPuyo.forEach(puyo => puyo.y++);
            }
            break;
          case 'ArrowUp':
            if (newPuyo.length === 2) {
              const rotated = rotatePuyo(newPuyo);
              if (canRotate(rotated, field)) {
                newPuyo.forEach((puyo, i) => {
                  puyo.x = rotated[i].x;
                  puyo.y = rotated[i].y;
                });
              }
            }
            break;
        }

        setGameState(prev => ({ ...prev, currentPuyo: newPuyo }));
      }}
    >
      <div className="text-white text-2xl">Score: {gameState.score}</div>
      <GameField field={gameState.field} currentPuyo={gameState.currentPuyo} />
      {gameState.gameOver && (
        <div className="text-white text-2xl mt-4">Game Over!</div>
      )}
    </div>
  );
}