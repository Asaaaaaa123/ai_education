import React, { useState } from 'react';
import AgeAdaptiveGame from './AgeAdaptiveGame';
import './TestAgeAdaptive.css';

const TestAgeAdaptive = () => {
  const [selectedAge, setSelectedAge] = useState(5);
  const [showGame, setShowGame] = useState(false);
  const [gameResults, setGameResults] = useState(null);

  const handleGameComplete = (results) => {
    setGameResults(results);
    setShowGame(false);
    console.log('Game completion results:', results);
  };

  const handleStartGame = () => {
    setShowGame(true);
    setGameResults(null);
  };

  const handleBackToSelection = () => {
    setShowGame(false);
    setGameResults(null);
  };

  if (showGame) {
    return (
      <div className="test-age-adaptive">
        <div className="test-header">
          <button className="btn btn-outline" onClick={handleBackToSelection}>
            <i className="fas fa-arrow-left"></i>
            Back to Age Selection
          </button>
          <h2>Age-Adaptive Game Test</h2>
          <span className="age-display">Current Age: {selectedAge} years old</span>
        </div>
        
        <AgeAdaptiveGame 
          childAge={selectedAge} 
          onComplete={handleGameComplete}
        />
      </div>
    );
  }

  return (
    <div className="test-age-adaptive">
      <div className="test-header">
        <h1>Age-Adaptive Game Test</h1>
        <p>Select different ages to test game adaptation effects</p>
      </div>

      <div className="age-selection">
        <h3>Select Test Age</h3>
        <div className="age-options">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(age => (
            <button
              key={age}
              className={`age-option ${selectedAge === age ? 'selected' : ''}`}
              onClick={() => setSelectedAge(age)}
            >
              {age} years old
            </button>
          ))}
        </div>

        <div className="age-info">
          <h4>Age Group Information</h4>
          <div className="age-group-info">
            <div className="age-group">
              <span className="age-range">0-3 years</span>
              <span className="group-name">Toddler Group</span>
              <span className="game-types">Color matching, sound games</span>
            </div>
            <div className="age-group">
              <span className="age-range">4-6 years</span>
              <span className="group-name">Kindergarten Group</span>
              <span className="game-types">Shape classification, number games, memory matching</span>
            </div>
            <div className="age-group">
              <span className="age-range">7+ years</span>
              <span className="group-name">Elementary Group</span>
              <span className="game-types">Pattern completion, word building, logical reasoning</span>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-large" onClick={handleStartGame}>
          <i className="fas fa-play"></i>
          Start Game Test
        </button>
      </div>

      {gameResults && (
        <div className="results-display">
          <h3>Test Results</h3>
          <div className="results-content">
            <pre>{JSON.stringify(gameResults, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAgeAdaptive; 