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

    // 新しいぷよの生成
    const generateNewPuyo = () => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return [
        { color, x: 2, y: 0 },
        { color, x: 2, y: 1 },
      ];
    };

    // キー入力の処理
    const handleKeyDown = (e: KeyboardEvent) => {
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

          // 新しいぷよを生成
          return {
            ...prev,
            field: newField,
            currentPuyo: [],
            nextPuyo: generateNewPuyo(),
          };
        }
      });
    }, 1000);

    initGame();
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(gameLoop);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState.gameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-white text-2xl">Score: {gameState.score}</div>
      <GameField field={gameState.field} currentPuyo={gameState.currentPuyo} />
      {gameState.gameOver && (
        <div className="text-white text-2xl mt-4">Game Over!</div>
      )}
    </div>
  );
}