import React, { useState, useEffect } from 'react';
import './AgeAppropriateTest.css';

/**
 * 适合低龄儿童的测试游戏
 * 用于替代舒尔特测试，适合2-5岁儿童
 */
const AgeAppropriateTest = ({ childAge, onComplete }) => {
  const [testType, setTestType] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    // 根据年龄选择测试类型
    if (childAge < 3) {
      setTestType('observation'); // 观察力测试：找相同（2岁以下）
    } else if (childAge < 6) {
      setTestType('color_shape'); // 颜色形状匹配测试（3-5岁）
    } else if (childAge < 8) {
      setTestType('simple_pattern'); // 简单模式测试（6-7岁）
    } else {
      // 8岁以上应该使用舒尔特测试，不应该调用这个组件
      setTestType('simple_pattern');
    }
  }, [childAge]);

  const handleTestComplete = (testResults) => {
    setResults(testResults);
    setGameCompleted(true);
    onComplete(testResults);
  };

  // 根据测试类型渲染不同的测试游戏
  if (!testType) {
    return <div className="loading">加载中...</div>;
  }

  switch (testType) {
    case 'observation':
      return <ObservationTest onComplete={handleTestComplete} />;
    case 'color_shape':
      return <ColorShapeTest onComplete={handleTestComplete} />;
    case 'simple_pattern':
      return <SimplePatternTest onComplete={handleTestComplete} />;
    default:
      return <ObservationTest onComplete={handleTestComplete} />;
  }
};

/**
 * 观察力测试：找相同（适合2-3岁）
 */
const ObservationTest = ({ onComplete }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [currentItems, setCurrentItems] = useState([]);
  const [targetItem, setTargetItem] = useState(null);
  const [rounds, setRounds] = useState(0);
  const [clickedItem, setClickedItem] = useState(null); // 记录点击的选项
  const [showFeedback, setShowFeedback] = useState(false); // 是否显示反馈

  // 图片选项（使用emoji代替）
  const items = ['🐱', '🐶', '🐼', '🐰', '🐻', '🦁', '🐯', '🐨'];

  useEffect(() => {
    generateRound();
  }, []);

  const generateRound = () => {
    // 随机选择4个不同的物品
    const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, 4);
    // 目标物品是从这4个中随机选一个
    const target = shuffled[Math.floor(Math.random() * shuffled.length)];
    setCurrentItems(shuffled);
    setTargetItem(target);
    // 重置反馈状态
    setShowFeedback(false);
    setClickedItem(null);
  };

  const handleItemClick = (item) => {
    if (gameCompleted || showFeedback) return;

    setClickedItem(item);
    setShowFeedback(true);

    if (item === targetItem) {
      // 答对了
      const newScore = score + 1;
      setScore(newScore);
      const newRounds = rounds + 1;
      setRounds(newRounds);

      if (newRounds >= 5) {
        // 完成5个题目
        setTimeout(() => {
          setGameCompleted(true);
          const totalTime = (Date.now() - startTime) / 1000;
          const performance = getPerformanceLevel(totalTime, newScore);
          onComplete({
            score: newScore,
            totalRounds: newRounds,
            totalTime: totalTime,
            accuracy: 100,
            testType: 'observation_test',
            performance: performance,
            performance_level: performance,
            averageTime: totalTime / newScore
          });
        }, 800);
      } else {
        // 继续下一轮
        setTimeout(() => {
          setShowFeedback(false);
          setClickedItem(null);
          setCurrentRound(newRounds + 1);
          generateRound();
        }, 800);
      }
    } else {
      // 答错了，提示后重新生成
      setTimeout(() => {
        alert('再找一找，看看哪个是一样的？');
        setShowFeedback(false);
        setClickedItem(null);
        setTimeout(() => generateRound(), 200);
      }, 800);
    }
  };

  const getPerformanceLevel = (time, score) => {
    const avgTime = time / score;
    if (avgTime < 3) return 'excellent';
    if (avgTime < 5) return 'good';
    if (avgTime < 8) return 'average';
    return 'needs_improvement';
  };

  if (gameCompleted) {
    return (
      <div className="test-completed">
        <div className="success-icon">✓</div>
        <h3>测试完成！</h3>
        <p>你找到了 {score} 个相同的！</p>
      </div>
    );
  }

  return (
    <div className="observation-test">
      <div className="test-header">
        <h3>🔍 找相同测试</h3>
        <div className="test-stats">
          <span>第 {currentRound} 题 / 共 5 题</span>
          <span>得分: {score}</span>
        </div>
      </div>

      <div className="test-instructions">
        <p>找到和目标一样的图片</p>
        <div className="target-display">
          <div className="target-item">
            <div className="item-display">{targetItem}</div>
            <p className="target-label">目标</p>
          </div>
        </div>
      </div>

      <div className="items-grid">
        {currentItems.map((item, index) => {
          // 只在显示反馈时才添加correct或incorrect类
          const isCorrect = showFeedback && clickedItem === item && item === targetItem;
          const isIncorrect = showFeedback && clickedItem === item && item !== targetItem;
          
          return (
            <div
              key={index}
              className={`item-option ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="item-display">{item}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 颜色形状匹配测试（适合3-5岁）
 */
const ColorShapeTest = ({ onComplete }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [target, setTarget] = useState(null);
  const [options, setOptions] = useState([]);
  const [rounds, setRounds] = useState(0);
  const [clickedOption, setClickedOption] = useState(null); // 记录点击的选项
  const [showFeedback, setShowFeedback] = useState(false); // 是否显示反馈

  // 颜色映射
  const colorMap = {
    'red': '#ff0000',
    'blue': '#0000ff',
    'green': '#00ff00',
    'yellow': '#ffff00',
    'purple': '#800080',
    'orange': '#ffa500'
  };

  // 形状定义
  const shapes = [
    { type: 'circle', emoji: '⭕', name: '圆形' },
    { type: 'square', emoji: '⬜', name: '方形' },
    { type: 'triangle', emoji: '🔺', name: '三角形' },
    { type: 'star', emoji: '⭐', name: '星形' }
  ];

  // 颜色列表
  const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  useEffect(() => {
    generateRound();
  }, []);

  const generateRound = () => {
    // 随机选择是颜色还是形状
    const isColor = Math.random() > 0.5;
    
    if (isColor) {
      // 颜色测试
      const shuffled = [...colors].sort(() => Math.random() - 0.5).slice(0, 4);
      const targetColor = shuffled[Math.floor(Math.random() * shuffled.length)];
      setTarget({ type: 'color', value: targetColor });
      setOptions(shuffled);
    } else {
      // 形状测试
      const shuffled = [...shapes].sort(() => Math.random() - 0.5).slice(0, 4);
      const targetShape = shuffled[Math.floor(Math.random() * shuffled.length)];
      setTarget({ type: 'shape', value: targetShape });
      setOptions(shuffled);
    }
    // 重置反馈状态
    setShowFeedback(false);
    setClickedOption(null);
  };

  const handleOptionClick = (option) => {
    if (gameCompleted || showFeedback) return;

    setClickedOption(option);
    setShowFeedback(true);

    let isCorrect = false;
    if (target.type === 'color') {
      isCorrect = option === target.value;
    } else {
      isCorrect = option.type === target.value.type;
    }

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      const newRounds = rounds + 1;
      setRounds(newRounds);

      if (newRounds >= 6) {
        setTimeout(() => {
          setGameCompleted(true);
          const totalTime = (Date.now() - startTime) / 1000;
          const performance = getPerformanceLevel(totalTime, newScore);
          onComplete({
            score: newScore,
            totalRounds: newRounds,
            totalTime: totalTime,
            accuracy: 100,
            testType: 'color_shape_test',
            performance: performance,
            performance_level: performance,
            averageTime: totalTime / newScore
          });
        }, 800);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
          setClickedOption(null);
          setCurrentRound(newRounds + 1);
          generateRound();
        }, 800);
      }
    } else {
      setTimeout(() => {
        alert('再想想，哪个是正确的？');
        setShowFeedback(false);
        setClickedOption(null);
        setTimeout(() => generateRound(), 200);
      }, 800);
    }
  };

  const getPerformanceLevel = (time, score) => {
    const avgTime = time / score;
    if (avgTime < 4) return 'excellent';
    if (avgTime < 6) return 'good';
    if (avgTime < 10) return 'average';
    return 'needs_improvement';
  };

  if (gameCompleted) {
    return (
      <div className="test-completed">
        <div className="success-icon">✓</div>
        <h3>测试完成！</h3>
        <p>你答对了 {score} 题！</p>
      </div>
    );
  }

  return (
    <div className="color-shape-test">
      <div className="test-header">
        <h3>🎨 颜色形状测试</h3>
        <div className="test-stats">
          <span>第 {currentRound} 题 / 共 6 题</span>
          <span>得分: {score}</span>
        </div>
      </div>

      <div className="test-instructions">
        <p>找到和{target && target.type === 'color' ? '目标颜色' : '目标形状'}一样的</p>
        <div className="target-display">
          <div className="target-item">
            {target && target.type === 'color' ? (
              <div 
                className="color-display"
                style={{ backgroundColor: colorMap[target.value] || target.value }}
              >
                {target.value}
              </div>
            ) : target && (
              <div className="shape-display">
                <div className="shape-emoji">{target.value.emoji}</div>
                <p className="shape-name">{target.value.name}</p>
              </div>
            )}
            <p className="target-label">目标</p>
          </div>
        </div>
      </div>

      <div className="options-grid">
        {options.map((option, index) => {
          // 只在显示反馈时才判断是否正确
          let isCorrect = false;
          let isIncorrect = false;
          if (showFeedback && clickedOption === option) {
            if (target.type === 'color') {
              isCorrect = option === target.value;
            } else {
              isCorrect = option.type === target.value.type;
            }
            isIncorrect = !isCorrect;
          }
          
          return (
            <div
              key={index}
              className={`option-item ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {target && target.type === 'color' ? (
                <div 
                  className="color-display"
                  style={{ backgroundColor: colorMap[option] || option }}
                >
                  {option}
                </div>
              ) : (
                <div className="shape-display">
                  <div className="shape-emoji">{option.emoji}</div>
                  <p className="shape-name">{option.name}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 简单模式测试（适合5-6岁）
 */
const SimplePatternTest = ({ onComplete }) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [pattern, setPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [rounds, setRounds] = useState(0);
  const [clickedOption, setClickedOption] = useState(null); // 记录点击的选项
  const [showFeedback, setShowFeedback] = useState(false); // 是否显示反馈

  const items = ['🔴', '🟢', '🔵', '🟡', '🟣', '🟠'];

  useEffect(() => {
    generateRound();
  }, []);

  const generateRound = () => {
    // 生成一个3个物品的模式，最后一个需要选择
    const patternLength = 2;
    const newPattern = [];
    for (let i = 0; i < patternLength; i++) {
      newPattern.push(items[Math.floor(Math.random() * items.length)]);
    }
    
    // 正确答案是模式的延续（相同或不同的逻辑）
    const correctAnswer = newPattern[newPattern.length - 1]; // 简单模式：重复最后一个
    const wrongOptions = items.filter(item => item !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    
    setPattern(newPattern);
    setOptions([...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5));
    // 重置反馈状态
    setShowFeedback(false);
    setClickedOption(null);
  };

  const handleOptionClick = (option) => {
    if (gameCompleted || showFeedback) return;

    setClickedOption(option);
    setShowFeedback(true);

    const correctAnswer = pattern[pattern.length - 1];
    if (option === correctAnswer) {
      const newScore = score + 1;
      setScore(newScore);
      const newRounds = rounds + 1;
      setRounds(newRounds);

      if (newRounds >= 5) {
        setTimeout(() => {
          setGameCompleted(true);
          const totalTime = (Date.now() - startTime) / 1000;
          const performance = getPerformanceLevel(totalTime, newScore);
          onComplete({
            score: newScore,
            totalRounds: newRounds,
            totalTime: totalTime,
            accuracy: 100,
            testType: 'simple_pattern_test',
            performance: performance,
            performance_level: performance,
            averageTime: totalTime / newScore
          });
        }, 800);
      } else {
        setTimeout(() => {
          setShowFeedback(false);
          setClickedOption(null);
          setCurrentRound(newRounds + 1);
          generateRound();
        }, 800);
      }
    } else {
      setTimeout(() => {
        alert('再想想，哪个是下一个？');
        setShowFeedback(false);
        setClickedOption(null);
        setTimeout(() => generateRound(), 200);
      }, 800);
    }
  };

  const getPerformanceLevel = (time, score) => {
    const avgTime = time / score;
    if (avgTime < 5) return 'excellent';
    if (avgTime < 8) return 'good';
    if (avgTime < 12) return 'average';
    return 'needs_improvement';
  };

  if (gameCompleted) {
    return (
      <div className="test-completed">
        <div className="success-icon">✓</div>
        <h3>测试完成！</h3>
        <p>你完成了 {score} 个模式！</p>
      </div>
    );
  }

  return (
    <div className="simple-pattern-test">
      <div className="test-header">
        <h3>📊 模式测试</h3>
        <div className="test-stats">
          <span>第 {currentRound} 题 / 共 5 题</span>
          <span>得分: {score}</span>
        </div>
      </div>

      <div className="test-instructions">
        <p>看看这个模式，下一个应该是什么？</p>
        <div className="pattern-display">
          {pattern.map((item, index) => (
            <div key={index} className="pattern-item">{item}</div>
          ))}
          <div className="pattern-blank">?</div>
        </div>
      </div>

      <div className="options-grid">
        {options.map((option, index) => {
          // 只在显示反馈时才判断是否正确
          const correctAnswer = pattern[pattern.length - 1];
          const isCorrect = showFeedback && clickedOption === option && option === correctAnswer;
          const isIncorrect = showFeedback && clickedOption === option && option !== correctAnswer;
          
          return (
            <div
              key={index}
              className={`option-item ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              <div className="pattern-option">{option}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AgeAppropriateTest;

