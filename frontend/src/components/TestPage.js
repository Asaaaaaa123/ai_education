import React, { useState } from 'react';
import './TestPage.css';

const TestPage = () => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGame, setShowGame] = useState(false);

  // Game configurations organized by age group
  const ageGroupGames = {
    "1-2 years": {
      title: "1-2 years Early Development",
      description: "Focus on visual matching and basic cognitive abilities",
      games: [
        { 
          id: 'matching_same', 
          name: 'Find the Same', 
          description: 'Find identical items to develop visual recognition',
          type: 'internal',
          icon: 'fas fa-search',
          component: 'MatchingGame'
        },
        { 
          id: 'spot_difference', 
          name: 'Spot the Difference', 
          description: 'Discover differences between items to exercise observation',
          type: 'internal',
          icon: 'fas fa-eye',
          component: 'SpotDifferenceGame'
        }
      ]
    },
    "2-3 years": {
      title: "2-3 years Color Shape Recognition",
      description: "Learn to identify colors and shapes, build basic concepts",
      games: [
        { 
          id: 'color_recognition', 
          name: 'Color Recognition', 
          description: 'Learn to identify basic colors, develop color perception',
          type: 'internal',
          icon: 'fas fa-palette',
          component: 'ColorRecognitionGame'
        },
        { 
          id: 'shape_recognition', 
          name: 'Shape Recognition', 
          description: 'Learn basic geometric shapes, develop spatial thinking',
          type: 'internal',
          icon: 'fas fa-shapes',
          component: 'ShapeRecognitionGame'
        }
      ]
    },
    "3-4 years": {
      title: "3-4 years Number Recognition",
      description: "Learn number sequences and basic math concepts",
      games: [
        { 
          id: 'number_order', 
          name: 'Number Sequence', 
          description: 'Learn correct number order, develop number sense',
          type: 'internal',
          icon: 'fas fa-sort-numeric-up',
          component: 'NumberOrderGame'
        },
        { 
          id: 'number_recognition', 
          name: 'Number Recognition', 
          description: 'Learn number symbols, build number concepts',
          type: 'internal',
          icon: 'fas fa-hashtag',
          component: 'NumberRecognitionGame'
        }
      ]
    },
    "4-5 years": {
      title: "4-5 years Memory Development",
      description: "Improve cognitive abilities through memory games",
      games: [
        { 
          id: 'memory_game', 
          name: 'Memory Cards', 
          description: 'Classic memory game, exercise short-term memory',
          type: 'internal',
          icon: 'fas fa-brain',
          component: 'MemoryGame'
        },
        { 
          id: 'sequence_memory', 
          name: 'Sequence Memory', 
          description: 'Remember the order of items appearing',
          type: 'internal',
          icon: 'fas fa-list-ol',
          component: 'SequenceMemoryGame'
        }
      ]
    },
    "5-6 years": {
      title: "5-6 years Emotion Recognition",
      description: "Learn to identify and express emotions, develop social skills",
      games: [
        { 
          id: 'emotion_recognition', 
          name: 'Emotion Recognition', 
          description: 'Identify different emotional expressions',
          type: 'internal',
          icon: 'fas fa-smile',
          component: 'EmotionRecognitionGame'
        },
        { 
          id: 'emotion_matching', 
          name: 'Emotion Matching', 
          description: 'Match emotions with corresponding expressions',
          type: 'internal',
          icon: 'fas fa-heart',
          component: 'EmotionMatchingGame'
        }
      ]
    }
  };

  const handleAgeGroupCardClick = (ageGroup) => {
    setSelectedAgeGroup(ageGroup);
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setShowGame(true);
  };

  const handleGameComplete = (results) => {
    console.log('Game completed:', results);
    alert(`Game completed!\nScore: ${results.score}\nTime: ${results.time} seconds\nAccuracy: ${(results.accuracy * 100).toFixed(1)}%`);
    setShowGame(false);
    setSelectedGame(null);
  };

  // Find the same game component
  const MatchingGame = () => {
    const [currentLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const items = [
      { id: 1, name: 'Apple', emoji: '🍎' },
      { id: 2, name: 'Banana', emoji: '🍌' },
      { id: 3, name: 'Orange', emoji: '🍊' },
      { id: 4, name: 'Strawberry', emoji: '🍓' },
      { id: 5, name: 'Grape', emoji: '🍇' },
      { id: 6, name: 'Watermelon', emoji: '🍉' }
    ];

    const [gameItems, setGameItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);

    const startGame = () => {
      setIsPlaying(true);
      setGameTime(0);
      setScore(0);
      setMatchedPairs([]);
      setSelectedItems([]);
      
      // Create game cards (each item appears twice)
      const gameCards = [];
      const selectedItems = items.slice(0, 3); // Select 3 pairs of items
      
      selectedItems.forEach(item => {
        gameCards.push({ ...item, id: `${item.id}_1` });
        gameCards.push({ ...item, id: `${item.id}_2` });
      });
      
      // Randomly shuffle order
      const shuffled = gameCards.sort(() => Math.random() - 0.5);
      setGameItems(shuffled);
    };

    const handleCardClick = (card) => {
      if (!isPlaying || selectedItems.length >= 2 || matchedPairs.includes(card.id.split('_')[0])) {
        return;
      }

      const newSelectedItems = [...selectedItems, card];
      setSelectedItems(newSelectedItems);

      if (newSelectedItems.length === 2) {
        setTimeout(() => {
          const [first, second] = newSelectedItems;
          if (first.name === second.name) {
            // Match successful
            setMatchedPairs([...matchedPairs, first.id.split('_')[0]]);
            setScore(score + 10);
            
            if (matchedPairs.length + 1 === 3) {
              // Game completed
              setIsPlaying(false);
              handleGameComplete({
                gameType: 'matching_same',
                ageGroup: selectedAgeGroup,
                score: score + 10,
                time: gameTime,
                accuracy: 1.0
              });
            }
          }
          setSelectedItems([]);
        }, 1000);
      }
    };

    React.useEffect(() => {
      let timer;
      if (isPlaying) {
        timer = setInterval(() => {
          setGameTime(prev => prev + 1);
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [isPlaying]);

    return (
      <div className="game-component">
        <div className="game-header">
          <h2>Find the Same Game</h2>
          <div className="game-stats">
            <span>Score: {score}</span>
            <span>Time: {gameTime}s</span>
            <span>Level: {currentLevel}</span>
          </div>
        </div>
        
        {!isPlaying ? (
          <div className="game-start">
            <h3>Game Instructions</h3>
            <p>Click identical items to match them. Find all matching pairs to complete the game!</p>
            <button className="btn btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        ) : (
          <div className="game-board">
            <div className="cards-grid">
              {gameItems.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id);
                const isMatched = matchedPairs.includes(item.id.split('_')[0]);
                const isVisible = isSelected || isMatched;
                
                return (
                  <div
                    key={item.id}
                    className={`matching-game-card ${isVisible ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="card-inner">
                      <div className="card-front">❓</div>
                      <div className="card-back">{item.emoji}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <div className="game-controls">
          <button 
            className="btn btn-outline"
            onClick={() => {
              setShowGame(false);
              setSelectedGame(null);
            }}
          >
            Back to Game List
          </button>
        </div>
      </div>
    );
  };

  // Spot the difference game component
  const SpotDifferenceGame = () => {
    const [score, setScore] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [foundDifferences, setFoundDifferences] = useState([]);

    const differences = [
      { id: 1, x: 20, y: 30, radius: 30 },
      { id: 2, x: 70, y: 60, radius: 25 },
      { id: 3, x: 40, y: 80, radius: 35 }
    ];

    const startGame = () => {
      setIsPlaying(true);
      setGameTime(0);
      setScore(0);
      setFoundDifferences([]);
    };


    React.useEffect(() => {
      let timer;
      if (isPlaying) {
        timer = setInterval(() => {
          setGameTime(prev => prev + 1);
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [isPlaying]);

    return (
      <div className="game-component">
        <div className="game-header">
          <h2>Spot the Difference Game</h2>
          <div className="game-stats">
            <span>Score: {score}</span>
            <span>Time: {gameTime}s</span>
            <span>Found: {foundDifferences.length}/{differences.length}</span>
          </div>
        </div>
        
        {!isPlaying ? (
          <div className="game-start">
            <h3>Game Instructions</h3>
            <p>Carefully observe the two images and click on the differences. Find all differences to complete the game!</p>
            <button className="btn btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        ) : (
          <div className="game-board">
            <div className="spot-difference-container">
              <div className="image-container">
                <div className="image-placeholder">
                  <div className="placeholder-text">Image A</div>
                  <div className="placeholder-content">🎨</div>
                </div>
                <div className="image-placeholder">
                  <div className="placeholder-text">Image B</div>
                  <div className="placeholder-content">🎨</div>
                </div>
              </div>
              <div className="difference-hints">
                <p>Hint: Click on the different parts in the two images</p>
                <p>Found {foundDifferences.length} differences</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="game-controls">
          <button 
            className="btn btn-outline"
            onClick={() => {
              setShowGame(false);
              setSelectedGame(null);
            }}
          >
            Back to Game List
          </button>
        </div>
      </div>
    );
  };

  // Color recognition game component
  const ColorRecognitionGame = () => {
    const [currentLevel] = useState(1);
    const [score, setScore] = useState(0);
    const [gameTime, setGameTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [targetColor, setTargetColor] = useState('');
    const [colorOptions, setColorOptions] = useState([]);

    const colors = [
      { name: 'Red', value: '#ff0000', emoji: '🔴' },
      { name: 'Blue', value: '#0000ff', emoji: '🔵' },
      { name: 'Green', value: '#00ff00', emoji: '🟢' },
      { name: 'Yellow', value: '#ffff00', emoji: '🟡' },
      { name: 'Purple', value: '#800080', emoji: '🟣' },
      { name: 'Orange', value: '#ffa500', emoji: '🟠' }
    ];

    const startGame = () => {
      setIsPlaying(true);
      setGameTime(0);
      setScore(0);
      generateNewQuestion();
    };

    const generateNewQuestion = () => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setTargetColor(randomColor);
      
      // Generate options (including correct answer and 3 wrong answers)
      const options = [randomColor];
      const availableColors = colors.filter(c => c.name !== randomColor.name);
      
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        options.push(availableColors[randomIndex]);
        availableColors.splice(randomIndex, 1);
      }
      
      // Shuffle option order
      setColorOptions(options.sort(() => Math.random() - 0.5));
    };

    const handleColorSelect = (selectedColor) => {
      if (!isPlaying) return;
      
      if (selectedColor.name === targetColor.name) {
        setScore(score + 10);
        if (score + 10 >= 50) {
          // Game completed
          setIsPlaying(false);
          handleGameComplete({
            gameType: 'color_recognition',
            ageGroup: selectedAgeGroup,
            score: score + 10,
            time: gameTime,
            accuracy: 1.0
          });
        } else {
          generateNewQuestion();
        }
      } else {
        setScore(Math.max(0, score - 5));
      }
    };

    React.useEffect(() => {
      let timer;
      if (isPlaying) {
        timer = setInterval(() => {
          setGameTime(prev => prev + 1);
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [isPlaying]);

    return (
      <div className="game-component">
        <div className="game-header">
          <h2>Color Recognition Game</h2>
          <div className="game-stats">
            <span>Score: {score}</span>
            <span>Time: {gameTime}s</span>
            <span>Level: {currentLevel}</span>
          </div>
        </div>
        
        {!isPlaying ? (
          <div className="game-start">
            <h3>Game Instructions</h3>
            <p>Select the correct color based on the color name hint. Correct answers get 10 points, wrong answers lose 5 points!</p>
            <button className="btn btn-primary" onClick={startGame}>
              Start Game
            </button>
          </div>
        ) : (
          <div className="game-board">
            <div className="color-game-container">
              <div className="target-color">
                <h3>Please select: {targetColor.name}</h3>
                <div className="color-display" style={{ backgroundColor: targetColor.value }}>
                  {targetColor.emoji}
                </div>
              </div>
              
              <div className="color-options">
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    className="color-option"
                    style={{ backgroundColor: color.value }}
                    onClick={() => handleColorSelect(color)}
                  >
                    {color.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="game-controls">
          <button 
            className="btn btn-outline"
            onClick={() => {
              setShowGame(false);
              setSelectedGame(null);
            }}
          >
            Back to Game List
          </button>
        </div>
      </div>
    );
  };

  const renderGameComponent = () => {
    if (!selectedGame) return null;
    
    switch (selectedGame.component) {
      case 'MatchingGame':
        return <MatchingGame />;
      case 'SpotDifferenceGame':
        return <SpotDifferenceGame />;
      case 'ColorRecognitionGame':
        return <ColorRecognitionGame />;
      default:
        return (
          <div className="game-container">
            <h2>{selectedGame.name}</h2>
            <p>{selectedGame.description}</p>
            <div className="game-placeholder">
              <div className="placeholder-icon">
                <i className="fas fa-gamepad"></i>
              </div>
              <h3>Game Under Development</h3>
              <p>This game is under development, stay tuned!</p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  handleGameComplete({
                    gameType: selectedGame.id,
                    ageGroup: selectedAgeGroup,
                    score: Math.floor(Math.random() * 30) + 70,
                    time: Math.floor(Math.random() * 120) + 60,
                    accuracy: (Math.random() * 0.3) + 0.7
                  });
                }}
              >
                Simulate Completion
              </button>
            </div>
          </div>
        );
    }
  };

  if (showGame) {
    return (
      <div className="test-page">
        <header className="test-header">
          <h1>Game Test - {selectedAgeGroup} - {selectedGame?.name}</h1>
        </header>
        <main className="test-main">
          {renderGameComponent()}
        </main>
      </div>
    );
  }

  if (selectedAgeGroup) {
    const ageGroup = ageGroupGames[selectedAgeGroup];
    return (
      <div className="test-page">
        <header className="test-header">
          <h1>{ageGroup.title}</h1>
          <p>{ageGroup.description}</p>
          <button 
            className="btn btn-outline"
            onClick={() => setSelectedAgeGroup(null)}
          >
            Back to Age Group Selection
          </button>
        </header>
        
        <main className="test-main">
          <div className="games-grid">
            {ageGroup.games.map((game) => (
              <div key={game.id} className="game-card">
                <div className="game-icon">
                  <i className={game.icon}></i>
                </div>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                <div className="game-meta">
                  <span className="game-type">Built-in Game</span>
                  <span className="game-source">MayCare</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleGameSelect(game)}
                >
                  Start Game
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="test-page">
      <header className="test-header">
        <h1>儿童发展游戏测试</h1>
        <p>根据年龄段选择适合的游戏，促进儿童全面发展</p>
      </header>
      
      <main className="test-main">
        <div className="age-groups-grid">
          {Object.entries(ageGroupGames).map(([ageGroup, config]) => (
            <div 
              key={ageGroup} 
              className="age-group-card clickable"
              onClick={() => handleAgeGroupCardClick(ageGroup)}
            >
              <div className="age-group-header">
                <h2>{ageGroup}</h2>
                <div className="age-group-icon">
                  <i className="fas fa-child"></i>
                </div>
              </div>
              <h3>{config.title}</h3>
              <p>{config.description}</p>
              <div className="age-group-stats">
                <span className="game-count">{config.games.length} 个游戏</span>
                <span className="focus-area">{getFocusArea(ageGroup)}</span>
              </div>
              <div className="age-group-action">
                <span className="click-hint">点击进入</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>
        
        <div className="test-info">
          <h3>游戏说明</h3>
          <ul>
            <li><strong>1-2岁</strong>: 专注于视觉匹配，培养基础认知能力</li>
            <li><strong>2-3岁</strong>: 学习颜色和形状识别，建立基础概念</li>
            <li><strong>3-4岁</strong>: 发展数字认知，培养数学思维</li>
            <li><strong>4-5岁</strong>: 通过记忆游戏提升认知能力</li>
            <li><strong>5-6岁</strong>: 学习情绪识别，发展社交技能</li>
            <li>所有游戏都经过精心设计，适合相应年龄段的发展特点</li>
            <li>游戏结果将用于评估儿童的发展水平和学习进度</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

// 获取每个年龄段的重点发展领域
const getFocusArea = (ageGroup) => {
  const focusAreas = {
    "1-2岁": "视觉认知",
    "2-3岁": "颜色形状",
    "3-4岁": "数字认知",
    "4-5岁": "记忆力",
    "5-6岁": "情绪社交"
  };
  return focusAreas[ageGroup] || "综合发展";
};

export default TestPage; 