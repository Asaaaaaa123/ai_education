import React, { useState } from 'react';
import { useLanguage } from '../utils/i18n';
import AgeAdaptiveGame from './AgeAdaptiveGame';
import './TestAgeAdaptive.css';

const TestAgeAdaptive = () => {
  const { t } = useLanguage();
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
            {t('backToAgeSelection')}
          </button>
          <h2>{t('ageAdaptiveGameTest')}</h2>
          <span className="age-display">{t('currentAge')}: {selectedAge} {t('yearsOld')}</span>
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
        <h1>{t('ageAdaptiveGameTest')}</h1>
        <p>{t('selectDifferentAges')}</p>
      </div>

      <div className="age-selection">
        <h3>{t('selectTestAge')}</h3>
        <div className="age-options">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(age => (
            <button
              key={age}
              className={`age-option ${selectedAge === age ? 'selected' : ''}`}
              onClick={() => setSelectedAge(age)}
            >
              {age} {t('yearsOld')}
            </button>
          ))}
        </div>

        <div className="age-info">
          <h4>{t('ageGroupInformation')}</h4>
          <div className="age-group-info">
            <div className="age-group">
              <span className="age-range">0-3 {t('yearsOld')}</span>
              <span className="group-name">{t('toddlerGroup')}</span>
              <span className="game-types">{t('colorMatchingSoundGames')}</span>
            </div>
            <div className="age-group">
              <span className="age-range">4-6 {t('yearsOld')}</span>
              <span className="group-name">{t('kindergartenGroup')}</span>
              <span className="game-types">{t('shapeClassificationNumberGames')}</span>
            </div>
            <div className="age-group">
              <span className="age-range">7+ {t('yearsOld')}</span>
              <span className="group-name">{t('elementaryGroup')}</span>
              <span className="game-types">{t('patternCompletionWordBuilding')}</span>
            </div>
          </div>
        </div>

        <button className="btn btn-primary btn-large" onClick={handleStartGame}>
          <i className="fas fa-play"></i>
          {t('startGameTest')}
        </button>
      </div>

      {gameResults && (
        <div className="results-display">
          <h3>{t('testResults')}</h3>
          <div className="results-content">
            <pre>{JSON.stringify(gameResults, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAgeAdaptive; 