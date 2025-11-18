import React, { useState, useRef } from 'react';
import './SchulteTest.css';

const SchulteTest = ({ onComplete }) => {
  const [currentGrid, setCurrentGrid] = useState(1);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [currentRoundResult, setCurrentRoundResult] = useState(null);
  const [results, setResults] = useState([]);
  const [gridSize] = useState(5); // 5x5 grid
  const [totalGrids] = useState(3); // 3 grids total
  
  const gridRef = useRef(null);

  // Generate a random 5x5 grid with numbers 1-25
  const generateGrid = () => {
    const numbers = Array.from({ length: gridSize * gridSize }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    
    const grid = [];
    for (let i = 0; i < gridSize; i++) {
      grid.push(shuffled.slice(i * gridSize, (i + 1) * gridSize));
    }
    return grid;
  };

  const [grid, setGrid] = useState(generateGrid());

  const startTest = () => {
    setIsStarted(true);
    // Do not set start time here, wait for first click
  };

  const handleNumberClick = (number) => {
    if (!isStarted || isCompleted) return;

    // Start timing on first click
    if (currentNumber === 1 && number === 1) {
      setStartTime(Date.now());
    }

    if (number === currentNumber) {
      if (currentNumber === gridSize * gridSize) {
        // Grid completed
        const gridEndTime = Date.now();
        const gridTime = (gridEndTime - startTime) / 1000;
        
        const roundResult = {
          grid: currentGrid,
          time: gridTime,
          numbers: gridSize * gridSize
        };
        
        setResults(prev => [...prev, roundResult]);
        setCurrentRoundResult(roundResult);
        setShowRoundResult(true);

        if (currentGrid < totalGrids) {
          // Pause test, show current round results
          setIsStarted(false);
        } else {
          // All grids completed
          const totalEndTime = Date.now();
          const totalTime = (totalEndTime - startTime) / 1000;
          
          setEndTime(totalEndTime);
          setIsCompleted(true);
          
          const finalResults = [...results, roundResult];

          const averageTime = finalResults.reduce((sum, result) => sum + result.time, 0) / finalResults.length;
          
          onComplete({
            totalTime,
            averageTime,
            results: finalResults,
            performance: getPerformanceLevel(averageTime)
          });
        }
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    }
  };

  const getPerformanceLevel = (time) => {
    if (time < 30) return 'excellent';
    if (time < 45) return 'good';
    if (time < 60) return 'average';
    return 'needs_improvement';
  };

  const getPerformanceAnalysis = (time, roundNumber) => {
    const performance = getPerformanceLevel(time);
    let analysis = {
      level: performance,
      message: '',
      suggestion: '',
      emoji: ''
    };

    if (performance === 'excellent') {
      analysis.message = '太棒了！注意力非常集中，反应速度很快！· Excellent! Very focused attention and fast reaction speed! 🌟';
      analysis.suggestion = '继续保持这个水平，你可以尝试更有挑战性的练习。· Keep up this level of concentration, you can try more complex challenges!';
      analysis.emoji = '🌟';
    } else if (performance === 'good') {
      analysis.message = '表现很棒！注意力集中度很好，反应速度也不错。· Great performance! Good attention focus and reaction speed! 👍';
      analysis.suggestion = '再练习几次，你会变得更快！· Practice a few more times and you\'ll get even faster!';
      analysis.emoji = '👍';
    } else if (performance === 'average') {
      analysis.message = '表现不错，继续努力会越来越好！· Good effort! Keep practicing and you\'ll improve! 💪';
      analysis.suggestion = '每天练习几次，专注力和反应速度都会提升。· Daily practice will help improve focus and reaction speed.';
      analysis.emoji = '📝';
    } else {
      analysis.message = '你已经在努力了，每一次尝试都是进步！· You\'re trying your best, every attempt is progress! 💙';
      analysis.suggestion = '坚持练习，专注力会越来越好的。记住：进步需要时间，你已经很棒了！· Keep practicing, focus improves over time. Remember: progress takes time, and you\'re doing great!';
      analysis.emoji = '💪';
    }

    // Add special analysis based on round (正面鼓励)
    if (roundNumber === 1) {
      analysis.message += ' 这是第一轮，热身很重要！你已经开始了，真棒！· This is the first round, warm-up is important! You\'ve started, great job!';
    } else if (roundNumber === 2) {
      if (time < results[0]?.time) {
        analysis.message += ' 比第一轮更好了，继续加油！· Better than the first round, keep it up! 🎉';
      } else if (time > results[0]?.time) {
        analysis.message += ' 可能有点累了，休息一下再做会更好。你已经很努力了！· Maybe getting tired, rest and try again. You\'re working hard! 💙';
      }
    } else if (roundNumber === 3) {
      const avgTime = results.reduce((sum, result) => sum + result.time, 0) / results.length;
      if (time < avgTime) {
        analysis.message += ' 最后一轮表现最好，你一直在进步！· Best performance in the final round, you\'re improving! 🌟';
      } else if (time > avgTime) {
        analysis.message += ' 可能有点累了，但你完成了所有测试，真了不起！· May be tired, but you completed all tests! Amazing! 💪';
      }
    }

    return analysis;
  };

  const getComprehensiveAssessment = (results) => {
    const averageTime = results.reduce((sum, result) => sum + result.time, 0) / results.length;
    const times = results.map(r => r.time);
    const improvement = times[2] < times[0]; // Last round better than first
    const consistency = Math.max(...times) - Math.min(...times) < 10; // Within 10 seconds
    
    let assessment = {
      overallLevel: getPerformanceLevel(averageTime),
      attentionScore: 0,
      consistencyScore: 0,
      improvementScore: 0,
      totalScore: 0,
      summary: '',
      recommendations: [],
      emoji: ''
    };

    // Calculate attention score (0-40 points)
    if (averageTime < 30) assessment.attentionScore = 40;
    else if (averageTime < 45) assessment.attentionScore = 30;
    else if (averageTime < 60) assessment.attentionScore = 20;
    else assessment.attentionScore = 10;

    // Calculate consistency score (0-30 points)
    if (consistency) {
      if (Math.max(...times) - Math.min(...times) < 5) assessment.consistencyScore = 30;
      else assessment.consistencyScore = 20;
    } else {
      assessment.consistencyScore = 10;
    }

    // Calculate improvement score (0-30 points)
    if (improvement) {
      const improvementPercent = ((times[0] - times[2]) / times[0]) * 100;
      if (improvementPercent > 20) assessment.improvementScore = 30;
      else if (improvementPercent > 10) assessment.improvementScore = 25;
      else assessment.improvementScore = 20;
    } else {
      assessment.improvementScore = 10;
    }

    assessment.totalScore = assessment.attentionScore + assessment.consistencyScore + assessment.improvementScore;

    // Generate summary and recommendations
    if (assessment.totalScore >= 80) {
      assessment.summary = 'Outstanding attention performance! The child shows excellent focus, consistency, and learning ability.';
      assessment.recommendations = [
        'Continue with advanced attention training exercises',
        'Introduce more complex cognitive challenges',
        'Maintain regular practice to sustain high performance'
      ];
      assessment.emoji = '🏆';
    } else if (assessment.totalScore >= 60) {
      assessment.summary = 'Good attention performance with room for improvement. The child demonstrates solid focus skills.';
      assessment.recommendations = [
        'Regular practice with current difficulty level',
        'Gradual introduction to more challenging exercises',
        'Focus on consistency improvement'
      ];
      assessment.emoji = '🎯';
    } else if (assessment.totalScore >= 40) {
      assessment.summary = 'Average attention performance. The child needs more structured training and practice.';
      assessment.recommendations = [
        'Daily attention training exercises',
        'Shorter, more frequent practice sessions',
        'Consider professional attention training programs'
      ];
      assessment.emoji = '📚';
    } else {
      assessment.summary = 'Attention performance needs significant improvement. Professional guidance is recommended.';
      assessment.recommendations = [
        'Consult with educational specialists',
        'Implement structured attention training program',
        'Regular monitoring and assessment'
      ];
      assessment.emoji = '💡';
    }

    return assessment;
  };

  const continueToNextRound = () => {
    setShowRoundResult(false);
    setCurrentRoundResult(null);
    setCurrentGrid(prev => prev + 1);
    setCurrentNumber(1);
    setGrid(generateGrid());
    setStartTime(null);
    setIsStarted(true);
  };

  const resetTest = () => {
    setCurrentGrid(1);
    setCurrentNumber(1);
    setStartTime(null);
    setEndTime(null);
    setIsStarted(false);
    setIsCompleted(false);
    setShowRoundResult(false);
    setCurrentRoundResult(null);
    setResults([]);
    setGrid(generateGrid());
  };

  const renderGrid = () => {
    return (
      <div className="schulte-grid" ref={gridRef}>
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((number, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${
                  number < currentNumber ? 'completed' : ''
                }`}
                onClick={() => handleNumberClick(number)}
                disabled={!isStarted || isCompleted}
              >
                {number}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderInstructions = () => (
    <div className="test-instructions">
      <h2>Schulte Attention Training</h2>
      <div className="instruction-content">
        <div className="instruction-step">
          <div className="step-number">1</div>
          <div className="step-text">
            <h3>Test Description</h3>
            <p>Schulte training is a classic attention training method that can test and improve attention concentration ability.</p>
          </div>
        </div>
        
        <div className="instruction-step">
          <div className="step-number">2</div>
          <div className="step-text">
            <h3>Operation Rules</h3>
            <p>Click numbers in order: start from 1, then 2, 3, 4... until 25</p>
            <p><strong>Important:</strong> The child needs to find the correct numbers independently, no red hints</p>
          </div>
        </div>
        
        <div className="instruction-step">
          <div className="step-number">3</div>
          <div className="step-text">
            <h3>Test Process</h3>
            <p>3 rounds will be conducted, after each round completion time and performance analysis will be shown</p>
          </div>
        </div>
        
        <div className="instruction-step">
          <div className="step-number">4</div>
          <div className="step-text">
            <h3>Timing Rules</h3>
            <p>• Timer starts when clicking number 1<br/>
               • Timer ends when clicking the last number 25<br/>
               • Each round is timed independently</p>
          </div>
        </div>
        
        <div className="instruction-step">
          <div className="step-number">5</div>
          <div className="step-text">
            <h3>Important Notes</h3>
            <p>• Stay focused, avoid distractions<br/>
               • Click accurately, avoid mistakes<br/>
               • Do not interrupt during the test</p>
          </div>
        </div>
      </div>
      
      <button className="btn btn-primary btn-large" onClick={startTest}>
        <i className="fas fa-play"></i>
        Start Test
      </button>
    </div>
  );

  const renderTestProgress = () => (
    <div className="test-progress">
      <div className="progress-header">
        <h2>Schulte Attention Training</h2>
        <div className="progress-info">
          <span className="grid-counter">Round {currentGrid} / {totalGrids}</span>
          <span className="number-counter">Completed: {currentNumber - 1} / 25</span>
        </div>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentNumber - 1) / (gridSize * gridSize)) * 100}%` }}
        ></div>
      </div>
      
      {renderGrid()}
      
      <div className="test-tips">
        <p><i className="fas fa-lightbulb"></i> Tip: Click numbers in order, from 1, then 2, 3, 4... until 25</p>
        <p><i className="fas fa-info-circle"></i> Timer has started, please focus on finding the correct numbers</p>
      </div>
    </div>
  );

  const renderRoundResult = () => {
    const analysis = getPerformanceAnalysis(currentRoundResult.time, currentRoundResult.grid);
    
    return (
      <div className="round-result">
        <h2>Round {currentRoundResult.grid} Complete!</h2>
        
        <div className="round-result-card">
          <div className="result-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="result-content">
            <h3>Round Time</h3>
            <p className="result-value">{currentRoundResult.time.toFixed(2)} seconds</p>
            <p className="result-note">Timed from first click</p>
          </div>
        </div>
        
        <div className="round-analysis">
          <div className="analysis-header">
            <span className="analysis-emoji">{analysis.emoji}</span>
            <h3>Performance Analysis</h3>
          </div>
          <div className="analysis-content">
            <p className="analysis-message">{analysis.message}</p>
            <p className="analysis-suggestion">{analysis.suggestion}</p>
          </div>
          <div className={`performance-badge performance-${analysis.level}`}>
            {analysis.level === 'excellent' ? 'Excellent' :
             analysis.level === 'good' ? 'Good' :
             analysis.level === 'average' ? 'Average' : 'Needs Improvement'}
          </div>
        </div>
        
        <div className="round-progress">
          <h3>Test Progress</h3>
          <div className="progress-summary">
            {results.map((result, index) => (
              <div key={index} className="progress-item">
                <span className="round-number">Round {result.grid}</span>
                <span className="round-time">{result.time.toFixed(2)} seconds</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="round-actions">
          {currentGrid < totalGrids ? (
            <button className="btn btn-primary btn-large" onClick={continueToNextRound}>
              <i className="fas fa-arrow-right"></i>
              Continue Round {currentGrid + 1}
            </button>
          ) : (
            <button className="btn btn-primary btn-large" onClick={() => {
              const totalEndTime = Date.now();
              const totalTime = (totalEndTime - startTime) / 1000;
              const finalResults = [...results, currentRoundResult];
              const averageTime = finalResults.reduce((sum, result) => sum + result.time, 0) / finalResults.length;
              
              onComplete({
                totalTime,
                averageTime,
                results: finalResults,
                performance: getPerformanceLevel(averageTime)
              });
            }}>
              <i className="fas fa-check"></i>
              Complete Test
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    const finalResults = [...results, currentRoundResult];
    const averageTime = finalResults.reduce((sum, result) => sum + result.time, 0) / finalResults.length;
    const finalAnalysis = getPerformanceAnalysis(averageTime, 0);
    const comprehensiveAssessment = getComprehensiveAssessment(finalResults);
    
    return (
      <div className="test-results">
        <h2>Test Complete!</h2>
      
      <div className="results-summary">
        <div className="result-card">
          <div className="result-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="result-content">
            <h3>Total Time</h3>
            <p className="result-value">{((endTime - startTime) / 1000).toFixed(2)} seconds</p>
            <p className="result-note">Timed from first click</p>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="result-content">
            <h3>Average Time</h3>
            <p className="result-value">
              {(results.reduce((sum, result) => sum + result.time, 0) / results.length).toFixed(2)} seconds
            </p>
            <p className="result-note">Average time per round</p>
          </div>
        </div>
        
        <div className="result-card">
          <div className="result-icon">
            <i className="fas fa-star"></i>
          </div>
          <div className="result-content">
            <h3>Performance Rating</h3>
            <p className={`result-value performance-${getPerformanceLevel(averageTime)}`}>
              {getPerformanceLevel(averageTime) === 'excellent' ? 'Excellent' :
               getPerformanceLevel(averageTime) === 'good' ? 'Good' :
               getPerformanceLevel(averageTime) === 'average' ? 'Average' : 'Needs Improvement'}
            </p>
            <p className="result-note">Based on average time</p>
          </div>
        </div>
      </div>
      
      <div className="comprehensive-assessment">
        <div className="assessment-header">
          <span className="assessment-emoji">{comprehensiveAssessment.emoji}</span>
          <h3>Comprehensive Assessment</h3>
        </div>
        <div className="assessment-content">
          <p className="assessment-summary">{comprehensiveAssessment.summary}</p>
          <div className="assessment-scores">
            <div className="score-item">
              <span className="score-label">Attention Score:</span>
              <span className="score-value">{comprehensiveAssessment.attentionScore}/40</span>
            </div>
            <div className="score-item">
              <span className="score-label">Consistency Score:</span>
              <span className="score-value">{comprehensiveAssessment.consistencyScore}/30</span>
            </div>
            <div className="score-item">
              <span className="score-label">Improvement Score:</span>
              <span className="score-value">{comprehensiveAssessment.improvementScore}/30</span>
            </div>
            <div className="score-item total-score">
              <span className="score-label">Total Score:</span>
              <span className="score-value">{comprehensiveAssessment.totalScore}/100</span>
            </div>
          </div>
          <div className="assessment-recommendations">
            <h4>Recommendations:</h4>
            <ul>
              {comprehensiveAssessment.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="final-analysis">
        <div className="analysis-header">
          <span className="analysis-emoji">{finalAnalysis.emoji}</span>
          <h3>Overall Performance Analysis</h3>
        </div>
        <div className="analysis-content">
          <p className="analysis-message">{finalAnalysis.message}</p>
          <p className="analysis-suggestion">{finalAnalysis.suggestion}</p>
        </div>
        <div className={`performance-badge performance-${finalAnalysis.level}`}>
          {finalAnalysis.level === 'excellent' ? 'Excellent' :
           finalAnalysis.level === 'good' ? 'Good' :
           finalAnalysis.level === 'average' ? 'Average' : 'Needs Improvement'}
        </div>
      </div>
      
      <div className="detailed-results">
        <h3>Three Round Results</h3>
        <div className="results-table">
          <div className="table-header">
            <span>Round</span>
            <span>Time</span>
            <span>Performance</span>
          </div>
          {results.map((result, index) => (
            <div key={index} className="table-row">
              <span>Round {result.grid}</span>
              <span>{result.time.toFixed(2)} seconds</span>
              <span className={`performance-${getPerformanceLevel(result.time)}`}>
                {getPerformanceLevel(result.time) === 'excellent' ? 'Excellent' :
                 getPerformanceLevel(result.time) === 'good' ? 'Good' :
                 getPerformanceLevel(result.time) === 'average' ? 'Average' : 'Needs Improvement'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="result-actions">
        <button className="btn btn-outline" onClick={resetTest}>
          <i className="fas fa-redo"></i>
          Retake Test
        </button>
        <button className="btn btn-primary" onClick={() => onComplete({
          totalTime: (endTime - startTime) / 1000,
          averageTime: results.reduce((sum, result) => sum + result.time, 0) / results.length,
          results: results,
          performance: getPerformanceLevel(results.reduce((sum, result) => sum + result.time, 0) / results.length),
          comprehensiveAssessment: getComprehensiveAssessment([...results, currentRoundResult])
        })}>
          <i className="fas fa-check"></i>
          Complete Test
        </button>
      </div>
    </div>
  );
};

  return (
    <div className="schulte-test">
      {!isStarted && !isCompleted && !showRoundResult && renderInstructions()}
      {isStarted && !isCompleted && !showRoundResult && renderTestProgress()}
      {showRoundResult && renderRoundResult()}
      {isCompleted && renderResults()}
    </div>
  );
};

export default SchulteTest; 