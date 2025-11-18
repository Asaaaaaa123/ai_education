import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SchulteTest from './SchulteTest';
import AgeAdaptiveGame from './AgeAdaptiveGame';
import './OnlineGame.css';

const OnlineGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { gameName, fromDailyTask, taskDay, gameType } = location.state || {};
  const childAge = location.state?.childAge || 6;

  const [gameCompleted, setGameCompleted] = useState(false);
  const [gameResult, setGameResult] = useState(null);

  const handleGameComplete = (result) => {
    setGameResult(result);
    setGameCompleted(true);
    console.log('游戏完成:', result);
  };

  const handleBack = () => {
    if (fromDailyTask) {
      navigate('/daily-task', { state: { planId: location.state.planId, day: taskDay } });
    } else {
      navigate(-1);
    }
  };

  const renderGame = () => {
    // 根据游戏类型和年龄直接渲染游戏，不需要ID
    if (gameType === 'schulte' || (childAge >= 6 && !gameType)) {
      return (
        <div className="online-game-container">
          <SchulteTest onComplete={handleGameComplete} />
        </div>
      );
    }
    
    if (gameType === 'color_match' || (childAge < 6 && gameType === 'color')) {
      return (
        <div className="online-game-container">
          <AgeAdaptiveGame childAge={childAge} onComplete={handleGameComplete} defaultGame="color_match" />
        </div>
      );
    }
    
    if (gameType === 'sound_play' || (childAge < 6 && gameType === 'sound')) {
      return (
        <div className="online-game-container">
          <AgeAdaptiveGame childAge={childAge} onComplete={handleGameComplete} defaultGame="sound_play" />
        </div>
      );
    }
    
    if (gameType === 'puzzle' || gameType === 'flower_puzzle') {
      return (
        <div className="online-game-container">
          <PuzzleGame onComplete={handleGameComplete} />
        </div>
      );
    }
    
    if (gameType === 'memory') {
      return (
        <div className="online-game-container">
          <MemoryCardsGame onComplete={handleGameComplete} />
        </div>
      );
    }
    
    // 默认根据年龄显示合适的游戏
    if (childAge < 6) {
      return (
        <div className="online-game-container">
          <AgeAdaptiveGame childAge={childAge} onComplete={handleGameComplete} />
        </div>
      );
    } else {
      return (
        <div className="online-game-container">
          <SchulteTest onComplete={handleGameComplete} />
        </div>
      );
    }
  };

  return (
    <div className="online-game-page">
      <div className="game-header">
        <button className="back-btn" onClick={handleBack}>← 返回 · Back</button>
        <h1>{gameName || '在线游戏 · Play & Learn'}</h1>
        <p className="game-tagline">Ready to play directly on this site · 在这里直接开始游戏练习，轻松又安全 · No download needed</p>
      </div>
      
      {!gameCompleted ? (
        renderGame()
      ) : (
        <div className="game-result">
          <h2>游戏完成！Great Job! · 太棒了！</h2>
          <p className="game-cheer">AI 评语 · AI Comment：今天的表现超棒，坚持就能看到更多进步哦！Keep shining! You're doing amazing! 🌟</p>
          {gameResult && (
            <div className="result-details">
              <p>得分 · Score: {gameResult.score || 0}</p>
              {gameResult.totalTime && <p>完成时间 · Time: {gameResult.totalTime.toFixed(2)}秒</p>}
              {gameResult.accuracy && <p>准确率 · Accuracy: {gameResult.accuracy.toFixed(1)}%</p>}
            </div>
          )}
          <button className="back-btn" onClick={handleBack}>返回任务 · Back to Tasks</button>
        </div>
      )}
    </div>
  );
};

// 简单注意力游戏组件 (unused but kept for potential future use)
// eslint-disable-next-line no-unused-vars
const SimpleAttentionGame = ({ onComplete, gameId = 'simple_attention' }) => {
  const [score, setScore] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  // 颜色映射：确保颜色名称和实际颜色值匹配
  const colorMap = {
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#00ff00',
    'yellow': '#ffff00',
    'purple': '#800080',
    'orange': '#ffa500'
  };
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  const shapes = ['circle', 'square', 'triangle', 'star'];

  const generateRound = useCallback(() => {
    const isColor = Math.random() > 0.5;
    if (isColor) {
      const shuffled = colors.sort(() => Math.random() - 0.5).slice(0, 4);
      const targetColor = shuffled[Math.floor(Math.random() * shuffled.length)];
      setTarget({ type: 'color', value: targetColor });
      setOptions(shuffled);
    } else {
      const shuffled = shapes.sort(() => Math.random() - 0.5).slice(0, 4);
      const targetShape = shuffled[Math.floor(Math.random() * shuffled.length)];
      setTarget({ type: 'shape', value: targetShape });
      setOptions(shuffled);
    }
  }, []);

  React.useEffect(() => {
    generateRound();
  }, [generateRound]);

  const handleOptionClick = (option) => {
    if (gameCompleted) return;
    
    if (option === target.value) {
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore >= 5) {
        setGameCompleted(true);
        const totalTime = (Date.now() - startTime) / 1000;
        onComplete({
          score: newScore,
          totalTime: totalTime,
          accuracy: 100,
          gameType: gameId
        });
      } else {
        setCurrentRound(newScore + 1);
        setTimeout(() => generateRound(), 500);
      }
    } else {
      // 错误选择，提示重新选择
      alert('不对，再试一次！');
    }
  };

  if (gameCompleted) {
    return <div className="game-completed">游戏完成！</div>;
  }

  return (
    <div className="simple-attention-game">
      <div className="game-stats">
        <span>得分: {score}/5</span>
        <span>第 {currentRound} 轮</span>
      </div>
      <div className="target-display">
        {target && (
          <>
            <p>找到 {target.type === 'color' ? '颜色' : '形状'}：</p>
            <div className={`target-item ${target.type}`}>
              {target.type === 'color' ? (
                <div className="color-block" style={{ backgroundColor: colorMap[target.value] || target.value }}></div>
              ) : (
                <div className={`shape-block ${target.value}`}>{target.value}</div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="options-grid">
        {options.map((option, index) => (
          <div
            key={index}
            className="option-item"
            onClick={() => handleOptionClick(option)}
          >
            {target && target.type === 'color' ? (
              <div className="color-block" style={{ backgroundColor: colorMap[option] || option }}></div>
            ) : (
              <div className={`shape-block ${option}`}>{option}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 注意力追踪游戏 (unused but kept for potential future use)
// eslint-disable-next-line no-unused-vars
const AttentionTrackingGame = ({ onComplete }) => {
  const [sequence, setSequence] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState([]);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  // 颜色映射：确保颜色名称和实际颜色值匹配
  const colorMap = {
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#00ff00',
    'yellow': '#ffff00'
  };
  const colors = ['red', 'blue', 'green', 'yellow'];

  const generateSequence = useCallback(() => {
    const newSequence = [];
    for (let i = 0; i < 4; i++) {
      newSequence.push(colors[Math.floor(Math.random() * colors.length)]);
    }
    setSequence(newSequence);
    setCurrentStep(0);
    setUserInput([]);
  }, []);

  React.useEffect(() => {
    generateSequence();
  }, [generateSequence]);

  const showSequence = () => {
    let step = 0;
    const interval = setInterval(() => {
      if (step < sequence.length) {
        // 高亮显示当前颜色
        setCurrentStep(step + 1);
        step++;
      } else {
        clearInterval(interval);
        setCurrentStep(0);
      }
    }, 1000);
  };

  const handleColorClick = (color) => {
    if (gameCompleted || currentStep > 0) return;
    
    const newInput = [...userInput, color];
    setUserInput(newInput);
    
    if (newInput.length === sequence.length) {
      // 检查答案
      const isCorrect = newInput.every((c, i) => c === sequence[i]);
      if (isCorrect) {
        const newScore = score + 1;
        setScore(newScore);
        if (newScore >= 3) {
          setGameCompleted(true);
          const totalTime = (Date.now() - startTime) / 1000;
          onComplete({
            score: newScore,
            totalTime: totalTime,
            accuracy: 100,
            gameType: 'attention_tracking'
          });
        } else {
          setTimeout(() => generateSequence(), 1000);
        }
      } else {
        alert('顺序不对，再试一次！');
        generateSequence();
      }
    }
  };

  if (gameCompleted) {
    return <div className="game-completed">游戏完成！</div>;
  }

  return (
    <div className="attention-tracking-game">
      <div className="game-stats">
        <span>得分: {score}/3</span>
      </div>
      <button onClick={showSequence} className="show-sequence-btn">
        查看序列
      </button>
      {currentStep > 0 && (
        <div className="sequence-display">
          <div
            className="highlight-color"
            style={{ backgroundColor: colorMap[sequence[currentStep - 1]] || sequence[currentStep - 1] }}
          >
            {sequence[currentStep - 1]}
          </div>
        </div>
      )}
      <p>按照刚才的顺序点击颜色：</p>
      <div className="colors-grid">
        {colors.map((color, index) => (
          <div
            key={index}
            className="color-btn"
            style={{ backgroundColor: colorMap[color] || color }}
            onClick={() => handleColorClick(color)}
          >
            {color}
          </div>
        ))}
      </div>
      <div className="input-sequence">
        <p>已输入: {userInput.length}/{sequence.length}</p>
      </div>
    </div>
  );
};

// 拼图游戏组件
const PuzzleGame = ({ onComplete }) => {
  const [pieces, setPieces] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [placedPieces, setPlacedPieces] = useState({});
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  React.useEffect(() => {
    initializePuzzle();
  }, []);

  const initializePuzzle = () => {
    // 创建简单的3x3拼图
    const totalPieces = 9;
    const newPieces = [];
    for (let i = 0; i < totalPieces; i++) {
      newPieces.push({
        id: i,
        correctPosition: i,
        number: i + 1
      });
    }
    // 打乱顺序
    setPieces(newPieces.sort(() => Math.random() - 0.5));
  };

  const handlePieceClick = (piece) => {
    if (gameCompleted) return;
    setSelectedPiece(piece);
  };

  const handleSlotClick = (position) => {
    if (!selectedPiece || placedPieces[position]) return;
    
    if (selectedPiece.correctPosition === position) {
      setPlacedPieces({ ...placedPieces, [position]: selectedPiece });
      setSelectedPiece(null);
      const newScore = score + 1;
      setScore(newScore);
      
      if (newScore >= 9) {
        setGameCompleted(true);
        const totalTime = (Date.now() - startTime) / 1000;
        onComplete({
          score: newScore,
          totalTime: totalTime,
          accuracy: 100,
          gameType: 'online_puzzle'
        });
      }
    } else {
      alert('位置不对，再试一次！');
    }
  };

  if (gameCompleted) {
    return <div className="game-completed">拼图完成！</div>;
  }

  return (
    <div className="puzzle-game">
      <div className="game-stats">
        <span>已放置: {score}/9</span>
      </div>
      <div className="puzzle-area">
        <div className="puzzle-grid">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className={`puzzle-slot ${placedPieces[index] ? 'filled' : ''}`}
              onClick={() => handleSlotClick(index)}
            >
              {placedPieces[index] ? placedPieces[index].number : index + 1}
            </div>
          ))}
        </div>
      </div>
      <div className="pieces-area">
        <p>选择拼图片：</p>
        <div className="pieces-grid">
          {pieces.filter(p => !Object.values(placedPieces).includes(p)).map(piece => (
            <div
              key={piece.id}
              className={`puzzle-piece ${selectedPiece?.id === piece.id ? 'selected' : ''}`}
              onClick={() => handlePieceClick(piece)}
            >
              {piece.number}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 记忆卡片游戏组件
const MemoryCardsGame = ({ onComplete }) => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const symbols = ['🌟', '🎈', '🎁', '🎂', '🎉', '🎊'];

  const initializeCards = useCallback(() => {
    const cardPairs = [];
    symbols.forEach((symbol, index) => {
      cardPairs.push({ id: index * 2, symbol, pairId: index });
      cardPairs.push({ id: index * 2 + 1, symbol, pairId: index });
    });
    setCards(cardPairs.sort(() => Math.random() - 0.5));
  }, []);

  React.useEffect(() => {
    initializeCards();
  }, [initializeCards]);

  const handleCardClick = (card) => {
    if (gameCompleted || flippedCards.length >= 2 || matchedPairs.includes(card.pairId)) return;
    
    if (flippedCards.length === 0) {
      setFlippedCards([card.id]);
    } else if (flippedCards.length === 1) {
      const firstCard = cards.find(c => c.id === flippedCards[0]);
      setFlippedCards([...flippedCards, card.id]);
      
      setTimeout(() => {
        if (firstCard.pairId === card.pairId) {
          setMatchedPairs([...matchedPairs, card.pairId]);
          const newScore = score + 1;
          setScore(newScore);
          
          if (newScore >= symbols.length) {
            setGameCompleted(true);
            const totalTime = (Date.now() - startTime) / 1000;
            onComplete({
              score: newScore,
              totalTime: totalTime,
              accuracy: 100,
              gameType: 'memory_cards'
            });
          }
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  if (gameCompleted) {
    return <div className="game-completed">记忆游戏完成！</div>;
  }

  return (
    <div className="memory-cards-game">
      <div className="game-stats">
        <span>已匹配: {score}/{symbols.length}</span>
      </div>
      <div className="cards-grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`memory-card ${
              flippedCards.includes(card.id) || matchedPairs.includes(card.pairId)
                ? 'flipped'
                : ''
            }`}
            onClick={() => handleCardClick(card)}
          >
            {flippedCards.includes(card.id) || matchedPairs.includes(card.pairId) ? (
              <div className="card-symbol">{card.symbol}</div>
            ) : (
              <div className="card-back">?</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineGame;

