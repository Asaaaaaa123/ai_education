import React, { useState, useEffect, useCallback } from 'react';
import './AgeAdaptiveGame.css';

const AgeAdaptiveGame = ({ childAge, onComplete, defaultGame = null }) => {
  const [currentGame, setCurrentGame] = useState(defaultGame ? { id: defaultGame } : null);
  // Removed unused state variables

  // Determine game type based on age
  const getAgeGroup = (age) => {
    if (age <= 3) return 'toddler';
    if (age <= 6) return 'preschool';
    return 'school';
  };

  const ageGroup = getAgeGroup(childAge);

  // Game configurations for different age groups
  const gameConfigs = {
    toddler: {
      title: "Toddler Game Time · 小宝宝游戏时间",
      description: "Simple interactive games for 0-3 year old toddlers · 适合0-3岁宝宝的简单互动游戏",
      games: [
        {
          id: 'color_match',
          name: 'Color Matching · 颜色匹配',
          description: 'Click items with the same color · 点击相同颜色的方块',
          icon: '🎨',
          difficulty: 'easy',
          duration: 60
        },
        {
          id: 'sound_play',
          name: 'Sound Game · 声音游戏',
          description: 'Listen to sounds and find matching pictures · 听声音找到匹配的图片',
          icon: '🔊',
          difficulty: 'easy',
          duration: 45
        },
        {
          id: 'flower_puzzle',
          name: 'Flower Puzzle · 花朵拼图',
          description: 'Drag flower pieces together · 把花朵碎片拼在一起，像拼拼图一样',
          icon: '🌺',
          difficulty: 'easy',
          duration: 120
        }
      ]
    },
    preschool: {
      title: "Preschool Game Time",
      description: "Cognitive games for 4-6 year old children",
      games: [
        {
          id: 'shape_sort',
          name: 'Shape Sorting',
          description: 'Sort items by different shapes',
          icon: '🔷',
          difficulty: 'medium',
          duration: 90
        },
        {
          id: 'number_count',
          name: 'Number Game',
          description: 'Count how many items there are',
          icon: '🔢',
          difficulty: 'medium',
          duration: 75
        },
        {
          id: 'memory_match',
          name: 'Memory Matching',
          description: 'Remember and find matching pictures',
          icon: '🧠',
          difficulty: 'medium',
          duration: 120
        }
      ]
    },
    school: {
      title: "Elementary Game Time",
      description: "Challenging games for children 7+ years old",
      games: [
        {
          id: 'pattern_complete',
          name: 'Pattern Completion',
          description: 'Complete number or pattern sequences',
          icon: '📊',
          difficulty: 'hard',
          duration: 120
        },
        {
          id: 'word_build',
          name: 'Word Building',
          description: 'Spell correct words with letters',
          icon: '📝',
          difficulty: 'hard',
          duration: 150
        },
        {
          id: 'logic_puzzle',
          name: 'Logic Puzzle',
          description: 'Solve simple logic problems',
          icon: '🧩',
          difficulty: 'hard',
          duration: 180
        }
      ]
    }
  };

  const config = gameConfigs[ageGroup];

  // Color matching game component
  const ColorMatchGame = ({ onGameComplete }) => {
    const [colors, setColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [startTime] = useState(Date.now());
    const [clickedColor, setClickedColor] = useState(null); // 记录点击的颜色
    const [showFeedback, setShowFeedback] = useState(false); // 是否显示反馈

    // 颜色映射：确保颜色名称和实际颜色值匹配
    const colorMap = {
      'red': '#ff0000',
      'blue': '#0000ff',
      'green': '#00ff00',
      'yellow': '#ffff00',
      'purple': '#800080',
      'orange': '#ffa500'
    };
    const colorOptions = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

    const handleTimeUp = useCallback(() => {
      if (!gameCompleted) {
        setGameCompleted(true);
        setIsActive(false);
        const accuracy = score > 0 ? Math.min(100, (score / 10) * 100) : 0;
        onGameComplete({ 
          score, 
          totalTime: 60,
          accuracy: accuracy,
          gameType: 'color_match',
          roundsCompleted: score
        });
      }
    }, [gameCompleted, score, onGameComplete]);

    useEffect(() => {
      generateNewRound();
      setIsActive(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      let interval = null;
      if (isActive && timeLeft > 0 && !gameCompleted) {
        interval = setInterval(() => {
          setTimeLeft(timeLeft => {
            if (timeLeft <= 1) {
              handleTimeUp();
              return 0;
            }
            return timeLeft - 1;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isActive, timeLeft, gameCompleted, handleTimeUp]);

    const generateNewRound = () => {
      // 正确打乱颜色数组：先复制，再打乱，然后取前4个
      const shuffled = [...colorOptions].sort(() => Math.random() - 0.5);
      const shuffledColors = shuffled.slice(0, 4);
      const targetColor = shuffledColors[Math.floor(Math.random() * shuffledColors.length)];
      
      // 确保颜色和映射一致
      setColors([...shuffledColors]); // 创建新数组确保引用正确
      setSelectedColor(targetColor);
      setIsActive(true);
      // 重置反馈状态
      setShowFeedback(false);
      setClickedColor(null);
    };

    const handleColorClick = (color) => {
      if (gameCompleted || !isActive) return;
      
      setClickedColor(color);
      setShowFeedback(true);
      
      if (color === selectedColor) {
        // 答对了
        const newScore = score + 1;
        setScore(newScore);
        
        // 每完成10个就结束游戏
        if (newScore >= 10) {
          // 完成足够的题目，结束游戏
          setTimeout(() => {
            setGameCompleted(true);
            setIsActive(false);
            const totalTime = (Date.now() - startTime) / 1000;
            const accuracy = Math.min(100, (newScore / 10) * 100);
            onGameComplete({ 
              score: newScore, 
              totalTime: totalTime,
              accuracy: accuracy,
              gameType: 'color_match',
              roundsCompleted: newScore
            });
          }, 800); // 延迟以显示反馈
        } else {
          // 继续下一轮
          setTimeout(() => {
            setShowFeedback(false);
            setClickedColor(null);
        generateNewRound();
          }, 800); // 延迟以显示反馈
        }
      } else {
        // 答错了
        setTimeout(() => {
          setShowFeedback(false);
          setClickedColor(null);
        }, 800); // 延迟以显示错误反馈
      }
    };

    return (
      <div className="game-container color-match">
        <div className="game-header">
          <h3>🎨 颜色匹配游戏</h3>
          <div className="game-stats">
            <span>得分: {score}</span>
            <span>剩余时间: {timeLeft}秒</span>
            {gameCompleted && <span className="game-completed">游戏完成！</span>}
          </div>
        </div>
        
        {!gameCompleted ? (
          <>
        <div className="game-instructions">
              <p>点击与目标颜色相同的方块</p>
              <div className="target-color-box">
                <div className="target-color" style={{ backgroundColor: selectedColor ? (colorMap[selectedColor] || selectedColor) : '#ffffff' }}>
                  <span>目标颜色</span>
                </div>
          </div>
        </div>

        <div className="color-grid">
          {colors.map((color, index) => {
            // 确保颜色值正确映射
            const colorValue = colorMap[color] || color;
            // 只在使用反馈时才添加correct或incorrect类
            const isCorrect = showFeedback && clickedColor === color && color === selectedColor;
            const isIncorrect = showFeedback && clickedColor === color && color !== selectedColor;
            
            return (
              <div
                key={`${color}-${index}`}
                className={`color-item ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
                style={{ backgroundColor: colorValue }}
              onClick={() => handleColorClick(color)}
            >
              <span className="color-name">{color}</span>
            </div>
            );
          })}
        </div>
          </>
        ) : (
          <div className="game-result">
            <h4>游戏完成！</h4>
            <p>总得分：{score}</p>
            <p>正在分析结果...</p>
        </div>
        )}
      </div>
    );
  };

  // Shape sorting game component
  const ShapeSortGame = ({ onGameComplete }) => {
    const [shapes, setShapes] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(90);
    const [isActive, setIsActive] = useState(false);

    const shapeTypes = ['circle', 'square', 'triangle', 'star'];

    useEffect(() => {
      generateShapes();
      setIsActive(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      let interval = null;
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft(timeLeft => timeLeft - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        onGameComplete({ score, totalTime: 90 - timeLeft });
      }
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, timeLeft, onGameComplete, score]);

    const generateShapes = () => {
      const newShapes = [];
      for (let i = 0; i < 12; i++) {
        newShapes.push({
          id: i,
          type: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
          x: Math.random() * 80,
          y: Math.random() * 60
        });
      }
      setShapes(newShapes);
    };

    const handleShapeDrop = (shapeId, targetType) => {
      const shape = shapes.find(s => s.id === shapeId);
      if (shape && shape.type === targetType) {
        setScore(score + 1);
        setShapes(shapes.filter(s => s.id !== shapeId));
      }
    };

    return (
      <div className="game-container shape-sort">
        <div className="game-header">
          <h3>🔷 Shape Sorting Game</h3>
          <div className="game-stats">
            <span>Score: {score}</span>
            <span>Time: {timeLeft}s</span>
          </div>
        </div>

        <div className="game-area">
          <div className="shapes-container">
            {shapes.map(shape => (
              <div
                key={shape.id}
                className={`shape-item ${shape.type}`}
                style={{ left: `${shape.x}%`, top: `${shape.y}%` }}
                draggable
                onDragEnd={(e) => {
                  // Simplified drag logic
                  const target = document.elementFromPoint(e.clientX, e.clientY);
                  if (target && target.dataset.shapeType === shape.type) {
                    handleShapeDrop(shape.id, shape.type);
                  }
                }}
              >
                {shape.type === 'circle' && '⭕'}
                {shape.type === 'square' && '⬜'}
                {shape.type === 'triangle' && '🔺'}
                {shape.type === 'star' && '⭐'}
              </div>
            ))}
          </div>

          <div className="sorting-areas">
            {shapeTypes.map(type => (
              <div
                key={type}
                className="sorting-area"
                data-shape-type={type}
                onDrop={(e) => {
                  e.preventDefault();
                  const shapeId = parseInt(e.dataTransfer.getData('text'));
                  handleShapeDrop(shapeId, type);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <h4>{type}</h4>
                <div className="area-icon">
                  {type === 'circle' && '⭕'}
                  {type === 'square' && '⬜'}
                  {type === 'triangle' && '🔺'}
                  {type === 'star' && '⭐'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Pattern completion game component
  const PatternCompleteGame = ({ onGameComplete }) => {
    const [pattern, setPattern] = useState([]);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
      generatePattern();
      setIsActive(true);
    }, []);

    useEffect(() => {
      let interval = null;
      if (isActive && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft(timeLeft => timeLeft - 1);
        }, 1000);
      } else if (timeLeft === 0) {
        onGameComplete({ score, totalTime: 120 - timeLeft });
      }
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, timeLeft, onGameComplete, score]);

    const generatePattern = () => {
      const patternLength = 4;
      const newPattern = [];
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      
      for (let i = 0; i < patternLength; i++) {
        newPattern.push(numbers[Math.floor(Math.random() * numbers.length)]);
      }
      
      setPattern(newPattern);
      
      // Generate options (including correct answer)
      const correctAnswer = newPattern[patternLength - 1] + 1;
      const wrongOptions = numbers.filter(n => n !== correctAnswer);
      const shuffledWrong = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 3);
      setOptions([...shuffledWrong, correctAnswer].sort(() => Math.random() - 0.5));
    };

    const handleOptionClick = (option) => {
      const expectedNext = pattern[pattern.length - 1] + 1;
      if (option === expectedNext) {
        setScore(score + 1);
        generatePattern();
      }
    };

    return (
      <div className="game-container pattern-complete">
        <div className="game-header">
          <h3>📊 Pattern Completion Game</h3>
          <div className="game-stats">
            <span>Score: {score}</span>
            <span>Time: {timeLeft}s</span>
          </div>
        </div>

        <div className="pattern-display">
          <h4>Find the next number in the pattern:</h4>
          <div className="pattern-sequence">
            {pattern.map((num, index) => (
              <div key={index} className="pattern-number">
                {num}
              </div>
            ))}
            <div className="pattern-blank">?</div>
          </div>
        </div>

        <div className="options-grid">
          {options.map((option, index) => (
            <button
              key={index}
              className="option-button"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Game selection interface
  const GameSelection = () => (
    <div className="game-selection">
      <div className="selection-header">
        <h2>{config.title}</h2>
        <p>{config.description}</p>
        <div className="age-info">
          <span>Age: {childAge} years old</span>
          <span>Game Group: {ageGroup === 'toddler' ? 'Toddler' : ageGroup === 'preschool' ? 'Preschool' : 'Elementary'}</span>
        </div>
      </div>

      <div className="games-grid">
        {config.games.map(game => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => setCurrentGame(game)}
          >
            <div className="game-icon">{game.icon}</div>
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <div className="game-meta">
              <span className="difficulty">{game.difficulty}</span>
              <span className="duration">{game.duration}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Game completion handling - 单个游戏完成即调用onComplete
  const handleGameComplete = (results) => {
    // 单个游戏完成就立即分析并提交结果，不再返回选择界面
    const gameResult = {
      ...results,
      gameId: currentGame.id,
      gameName: currentGame.name,
      ageGroup: ageGroup
    };
    
    // 立即调用完成回调，进行AI分析
    onComplete(gameResult);
  };

  // Sound game component - 音频游戏
  const SoundGame = ({ onGameComplete }) => {
    const [currentSound, setCurrentSound] = useState(null);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(45);
    const [isActive, setIsActive] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [startTime] = useState(Date.now());
    
    // Sound and picture mapping
    const soundOptions = [
      { sound: 'cat', emoji: '🐱', name: 'Cat' },
      { sound: 'dog', emoji: '🐶', name: 'Dog' },
      { sound: 'cow', emoji: '🐄', name: 'Cow' },
      { sound: 'duck', emoji: '🦆', name: 'Duck' },
      { sound: 'bird', emoji: '🐦', name: 'Bird' },
      { sound: 'sheep', emoji: '🐑', name: 'Sheep' }
    ];

    useEffect(() => {
      generateNewRound();
      setIsActive(true);
      return () => {
        // 停止语音合成
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTimeUp = useCallback(() => {
      if (!gameCompleted) {
        setGameCompleted(true);
        setIsActive(false);
        const accuracy = score > 0 ? Math.min(100, (score / 8) * 100) : 0;
        onGameComplete({ 
          score, 
          totalTime: 45,
          accuracy: accuracy,
          gameType: 'sound_play',
          roundsCompleted: score
        });
      }
    }, [gameCompleted, score, onGameComplete]);

    useEffect(() => {
      let interval = null;
      if (isActive && timeLeft > 0 && !gameCompleted) {
        interval = setInterval(() => {
          setTimeLeft(timeLeft => {
            if (timeLeft <= 1) {
              handleTimeUp();
              return 0;
            }
            return timeLeft - 1;
          });
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isActive, timeLeft, gameCompleted, handleTimeUp]);

    const playSound = (soundType) => {
      // 创建音频对象（使用Web Audio API或HTML5 Audio）
      try {
        // 尝试使用合成的音效（因为无法直接播放真实动物声音）
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // 根据动物类型设置不同的音调
        const frequencies = {
          cat: 400,
          dog: 300,
          cow: 200,
          duck: 500,
          bird: 600,
          sheep: 350
        };
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequencies[soundType] || 400;
        oscillator.type = 'sine';
        
        // Increase sound duration to 2 seconds
        const soundDuration = 2.0;
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + soundDuration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + soundDuration);
        
        // Also use text-to-speech as an alternative with slower rate
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(soundOptions.find(s => s.sound === soundType)?.name || soundType);
          utterance.lang = 'en-US';
          utterance.rate = 0.7; // Slow down speech rate (0.7 means 70% of normal speed)
          utterance.pitch = 1.0;
          speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.log('Audio playback failed, using text prompt');
      }
    };

    const generateNewRound = () => {
      const shuffled = soundOptions.sort(() => Math.random() - 0.5).slice(0, 4);
      const correctAnswer = shuffled[Math.floor(Math.random() * shuffled.length)];
      setCurrentSound(correctAnswer);
      setOptions(shuffled);
      
      // 播放声音
      setTimeout(() => playSound(correctAnswer.sound), 500);
    };

    const handleOptionClick = (option) => {
      if (gameCompleted || !isActive) return;
      
      if (option.sound === currentSound.sound) {
        const newScore = score + 1;
        setScore(newScore);
        
        if (newScore >= 8) {
          // 完成足够的题目
          setGameCompleted(true);
          setIsActive(false);
          const totalTime = (Date.now() - startTime) / 1000;
          const accuracy = Math.min(100, (newScore / 8) * 100);
          onGameComplete({ 
            score: newScore, 
            totalTime: totalTime,
            accuracy: accuracy,
            gameType: 'sound_play',
            roundsCompleted: newScore
      });
    } else {
          setTimeout(() => generateNewRound(), 1000);
        }
      } else {
        // 错误选择，重新播放声音提示
        setTimeout(() => playSound(currentSound.sound), 300);
      }
    };


    const handlePlaySound = () => {
      if (currentSound) {
        playSound(currentSound.sound);
      }
    };

    return (
      <div className="game-container sound-game">
        <div className="game-header">
          <h3>🔊 Sound Recognition Game</h3>
          <div className="game-stats">
            <span>Score: {score}</span>
            <span>Time Left: {timeLeft}s</span>
            {gameCompleted && <span className="game-completed">Game Complete!</span>}
          </div>
        </div>
        
        {!gameCompleted ? (
          <>
            <div className="game-instructions">
              <p>Listen to the sound and select the matching animal</p>
              <button className="play-sound-btn" onClick={handlePlaySound}>
                <i className="fas fa-volume-up"></i>
                Replay Sound
              </button>
            </div>

            <div className="sound-options-grid">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="sound-option"
                  onClick={() => handleOptionClick(option)}
                >
                  <div className="option-emoji">{option.emoji}</div>
                  <div className="option-name">{option.name}</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="game-result">
            <h4>Game Complete!</h4>
            <p>Total Score: {score}</p>
            <p>Analyzing results...</p>
          </div>
        )}
      </div>
    );
  };

  // Flower Puzzle Game for toddlers (2岁花朵拼图)
  const FlowerPuzzleGame = ({ onGameComplete }) => {
    const [pieces, setPieces] = useState([]);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [placedPieces, setPlacedPieces] = useState({});
    const [score, setScore] = useState(0);
    const [gameCompleted, setGameCompleted] = useState(false);
    const [startTime] = useState(Date.now());
    const [, setDraggedPiece] = useState(null);

    // 创建花朵拼图片段（简单版本：4片拼图）
    useEffect(() => {
      const flowerPieces = [
        { id: 0, correctPosition: 0, emoji: '🌺', position: 'top-left' },
        { id: 1, correctPosition: 1, emoji: '🌸', position: 'top-right' },
        { id: 2, correctPosition: 2, emoji: '🌼', position: 'bottom-left' },
        { id: 3, correctPosition: 3, emoji: '🌷', position: 'bottom-right' }
      ];
      // 打乱顺序
      setPieces(flowerPieces.sort(() => Math.random() - 0.5));
    }, []);

    const handlePieceDragStart = (piece) => {
      if (gameCompleted || placedPieces[piece.correctPosition]) return;
      setDraggedPiece(piece);
      setSelectedPiece(piece);
    };

    const handleSlotDrop = (position) => {
      if (!selectedPiece || placedPieces[position]) return;
      
      if (selectedPiece.correctPosition === position) {
        setPlacedPieces({ ...placedPieces, [position]: selectedPiece });
        setSelectedPiece(null);
        setDraggedPiece(null);
        const newScore = score + 1;
        setScore(newScore);
        
        if (newScore >= 4) {
          setGameCompleted(true);
          const totalTime = (Date.now() - startTime) / 1000;
          const accuracy = 100;
          onGameComplete({ 
            score: newScore, 
            totalTime: totalTime,
            accuracy: accuracy,
            gameType: 'flower_puzzle',
            roundsCompleted: newScore
          });
        }
      } else {
        // 错误位置，给予提示但不扣分
        setSelectedPiece(null);
        setDraggedPiece(null);
      }
    };

    const handleSlotClick = (position) => {
      if (selectedPiece && !placedPieces[position]) {
        handleSlotDrop(position);
      }
    };

    return (
      <div className="game-container flower-puzzle">
        <div className="game-header">
          <h3>🌺 花朵拼图游戏 · Flower Puzzle</h3>
          <div className="game-stats">
            <span>已完成: {score}/4 · Completed</span>
            {gameCompleted && <span className="game-completed">拼图完成！Great Job! 🌟</span>}
          </div>
        </div>
        
        {!gameCompleted ? (
          <>
            <div className="game-instructions">
              <p>拖动花朵碎片到正确位置，像拼拼图一样！· Drag flower pieces to the correct position!</p>
              <p className="instruction-hint">不需要认识数字，只需要看花朵的颜色和形状 · No numbers needed, just colors and shapes</p>
            </div>

            <div className="puzzle-board">
              <div className="puzzle-grid flower-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={`puzzle-slot flower-slot ${placedPieces[index] ? 'filled' : 'empty'}`}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (selectedPiece) handleSlotDrop(index);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => handleSlotClick(index)}
                  >
                    {placedPieces[index] ? (
                      <div className="placed-piece">{placedPieces[index].emoji}</div>
                    ) : (
                      <div className="slot-placeholder">?</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pieces-area flower-pieces">
              <p>拖动这些花朵碎片 · Drag these flower pieces:</p>
              <div className="pieces-grid flower-pieces-grid">
                {pieces
                  .filter(p => !Object.values(placedPieces).includes(p))
                  .map(piece => (
                    <div
                      key={piece.id}
                      className={`puzzle-piece flower-piece ${selectedPiece?.id === piece.id ? 'selected' : ''}`}
                      draggable
                      onDragStart={() => handlePieceDragStart(piece)}
                      onClick={() => setSelectedPiece(piece)}
                    >
                      {piece.emoji}
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="game-result">
            <h4>拼图完成！Flower Puzzle Complete! 🌺</h4>
            <p>总得分 · Score: {score}</p>
            <p className="encouragement">太棒了！你完成了花朵拼图！Great job completing the flower puzzle! 🌟</p>
          </div>
        )}
      </div>
    );
  };

  // Render game component
  const renderGame = () => {
    if (!currentGame) return <GameSelection />;

    switch (currentGame.id) {
      case 'color_match':
        return <ColorMatchGame onGameComplete={handleGameComplete} />;
      case 'sound_play':
        return <SoundGame onGameComplete={handleGameComplete} />;
      case 'flower_puzzle':
        return <FlowerPuzzleGame onGameComplete={handleGameComplete} />;
      case 'shape_sort':
        return <ShapeSortGame onGameComplete={handleGameComplete} />;
      case 'pattern_complete':
        return <PatternCompleteGame onGameComplete={handleGameComplete} />;
      default:
        return <GameSelection />;
    }
  };

  return (
    <div className="age-adaptive-game">
      {renderGame()}
    </div>
  );
};

export default AgeAdaptiveGame; 