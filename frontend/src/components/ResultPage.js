import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get assessment data from sessionStorage
    const data = sessionStorage.getItem('assessmentData');
    const resultData = sessionStorage.getItem('assessmentResult');
    
    if (data) {
      const parsedData = JSON.parse(data);
      setAssessmentData(parsedData);
      
      // If there is API result, merge data
      if (resultData) {
        const parsedResult = JSON.parse(resultData);
        setAssessmentData({
          ...parsedData,
          apiResult: parsedResult
        });
      }
    }
    setLoading(false);
  }, []);

  const handleNewAssessment = () => {
    sessionStorage.removeItem('assessmentData');
    navigate('/assessment');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Your session will be cleared.')) {
      // Clear all authentication and user data
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('userChildren');
      localStorage.removeItem('userPlans');
      localStorage.removeItem('userTestResults');
      localStorage.removeItem('currentChildId');
      localStorage.removeItem('testType');
      localStorage.removeItem('childAge');
      sessionStorage.removeItem('assessmentData');
      sessionStorage.removeItem('assessmentResult');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="result-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating your personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="result-page">
        <div className="error-container">
          <h2>No Assessment Data Found</h2>
          <p>Please complete an assessment first.</p>
          <button className="btn btn-primary" onClick={() => navigate('/assessment')}>
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  const getGameDisplayName = (gameType) => {
    switch (gameType) {
      case 'schulte_test':
        return 'Schulte Attention Training';
      case 'spot_difference':
        return 'Spot the Difference Game';
      case 'color_shape':
        return 'Color Shape Recognition Game';
      case 'emotion_recognition':
        return 'Emotion Recognition Game';
      case 'object_sorting':
        return 'Object Sorting Game';
      case 'number_sequence':
        return 'Number Sequence Game';
      case 'memory_game':
        return 'Memory Game';
      case 'pattern_recognition':
        return 'Pattern Recognition Game';
      case 'logical_reasoning':
        return 'Logical Reasoning Game';
      default:
        return 'Interactive Game';
    }
  };

  const getGameAnalysis = (gameResults) => {
    const score = gameResults.score;
    let performance = '';
    let analysis = '';
    
    if (score >= 90) performance = 'Excellent';
    else if (score >= 80) performance = 'Good';
    else if (score >= 70) performance = 'Average';
    else performance = 'Needs Improvement';
    
    switch (gameResults.gameType) {
      case 'schulte_test':
        analysis = `Your child performed ${performance} in the Schulte Attention Training. This test measures the child's ability to quickly locate numbers, with high scores indicating good concentration.`;
        break;
      case 'spot_difference':
        analysis = `Your child performed ${performance} in the Spot the Difference Game. This game tests the child's observation skills and attention to detail, with high scores indicating strong observation abilities.`;
        break;
      case 'color_shape':
        analysis = `Your child performed ${performance} in the Color Shape Recognition Game. This game tests the child's ability to identify colors and shapes, with high scores indicating good visual cognitive abilities.`;
        break;
      case 'emotion_recognition':
        analysis = `Your child performed ${performance} in the Emotion Recognition Game. This game tests the child's ability to identify and understand emotions, with high scores indicating good emotional cognitive abilities.`;
        break;
      case 'object_sorting':
        analysis = `Your child performed ${performance} in the Object Sorting Game. This game tests the child's classification thinking and logical abilities, with high scores indicating strong classification skills.`;
        break;
      case 'number_sequence':
        analysis = `Your child performed ${performance} in the Number Sequence Game. This game tests the child's number recognition and sequential thinking, with high scores indicating good mathematical thinking abilities.`;
        break;
      case 'memory_game':
        analysis = `Your child performed ${performance} in the Memory Game. This game tests the child's memory and attention, with high scores indicating strong memory abilities.`;
        break;
      case 'pattern_recognition':
        analysis = `Your child performed ${performance} in the Pattern Recognition Game. This game tests the child's logical thinking and pattern recognition abilities, with high scores indicating good logical thinking skills.`;
        break;
      case 'logical_reasoning':
        analysis = `Your child performed ${performance} in the Logical Reasoning Game. This game tests the child's reasoning and problem-solving abilities, with high scores indicating strong logical reasoning skills.`;
        break;
      default:
        analysis = 'No detailed analysis available for this game type.';
    }
    
    return analysis;
  };

  return (
    <div className="result-page">
      <nav className="result-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <i className="fas fa-heart"></i>
            <span>MayCare</span>
          </div>
          <div className="nav-actions">
            <button className="btn btn-outline" onClick={handleNewAssessment}>
              <i className="fas fa-plus"></i>
              New Assessment
            </button>
            <button className="btn btn-outline" onClick={handleBackToHome}>
              <i className="fas fa-home"></i>
              Back to Home
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="result-main">
        <div className="container">
          <div className="result-header">
            <h1>Personalized Support Plan for {assessmentData.childName}</h1>
            <p>Based on your assessment, we've created a comprehensive support plan tailored to your child's unique needs.</p>
          </div>

          <div className="result-content">
            {/* Child Information */}
            <div className="result-section">
              <h2>Child Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name:</strong> {assessmentData.childName}
                </div>
                <div className="info-item">
                  <strong>Age Group:</strong> {assessmentData.age}
                </div>
                <div className="info-item">
                  <strong>School Type:</strong> {assessmentData.schoolType}
                </div>
                <div className="info-item">
                  <strong>Grade:</strong> {assessmentData.grade}
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="result-section">
              <h2>Academic Performance Analysis</h2>
              <div className="subjects-analysis">
                <div className="subject-score">
                  <label>Mathematics</label>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${assessmentData.subjects.math * 20}%` }}>
                      {assessmentData.subjects.math}/5
                    </div>
                  </div>
                </div>
                <div className="subject-score">
                  <label>English/Language Arts</label>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${assessmentData.subjects.english * 20}%` }}>
                      {assessmentData.subjects.english}/5
                    </div>
                  </div>
                </div>
                <div className="subject-score">
                  <label>Science</label>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${assessmentData.subjects.science * 20}%` }}>
                      {assessmentData.subjects.science}/5
                    </div>
                  </div>
                </div>
                <div className="subject-score">
                  <label>Social Studies</label>
                  <div className="score-bar">
                    <div className="score-fill" style={{ width: `${assessmentData.subjects.socialStudies * 20}%` }}>
                      {assessmentData.subjects.socialStudies}/5
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Identified Challenges */}
            <div className="result-section">
              <h2>Identified Challenges</h2>
              <div className="challenges-grid">
                {assessmentData.learningHabits.length > 0 && (
                  <div className="challenge-category">
                    <h3>Learning Habits</h3>
                    <ul>
                      {assessmentData.learningHabits.map((habit, index) => (
                        <li key={index}>{habit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {assessmentData.classroomBehavior.length > 0 && (
                  <div className="challenge-category">
                    <h3>Classroom Behavior</h3>
                    <ul>
                      {assessmentData.classroomBehavior.map((behavior, index) => (
                        <li key={index}>{behavior}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {assessmentData.socialBehavior.length > 0 && (
                  <div className="challenge-category">
                    <h3>Social Behavior</h3>
                    <ul>
                      {assessmentData.socialBehavior.map((behavior, index) => (
                        <li key={index}>{behavior}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Game Results */}
            {assessmentData.interactiveResults && (
              <div className="result-section">
                <h2>Interactive Game Results</h2>
                <div className="interactive-game-results">
                  <div className="game-summary">
                    <h3>{getGameDisplayName(assessmentData.interactiveResults.gameType)}</h3>
                    <div className="game-stats">
                      <div className="stat-item">
                        <span className="stat-label">Game Type:</span>
                        <span className="stat-value">{getGameDisplayName(assessmentData.interactiveResults.gameType)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Score:</span>
                        <span className="stat-value">{assessmentData.interactiveResults.score}/100</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Time:</span>
                        <span className="stat-value">{assessmentData.interactiveResults.time} seconds</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Accuracy:</span>
                        <span className="stat-value">{(assessmentData.interactiveResults.accuracy * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="game-analysis">
                    <h3>Performance Analysis</h3>
                    <div className="analysis-content">
                      <p>{getGameAnalysis(assessmentData.interactiveResults)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Child Test Results */}
            {assessmentData.childTestResults && (
              <div className="result-section">
                <h2>Child Attention Test Results</h2>
                <div className="child-test-results">
                  <div className="test-summary">
                    <h3>Schulte Attention Training Test</h3>
                    <div className="test-stats">
                      <div className="stat-item">
                        <span className="stat-label">Total Time:</span>
                        <span className="stat-value">{assessmentData.childTestResults.totalTime?.toFixed(2)} seconds</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Average Time:</span>
                        <span className="stat-value">{assessmentData.childTestResults.averageTime?.toFixed(2)} seconds</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Performance Level:</span>
                        <span className={`stat-value performance-${assessmentData.childTestResults.performance}`}>
                          {assessmentData.childTestResults.performance === 'excellent' ? 'Excellent' :
                           assessmentData.childTestResults.performance === 'good' ? 'Good' :
                           assessmentData.childTestResults.performance === 'average' ? 'Average' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {assessmentData.childTestResults.comprehensiveAssessment && (
                    <div className="comprehensive-assessment">
                      <h3>Comprehensive Assessment</h3>
                      <div className="assessment-summary">
                        <p>{assessmentData.childTestResults.comprehensiveAssessment.summary}</p>
                      </div>
                      <div className="assessment-scores">
                        <div className="score-item">
                          <span className="score-label">Attention Score:</span>
                          <span className="score-value">{assessmentData.childTestResults.comprehensiveAssessment.attentionScore}/40</span>
                        </div>
                        <div className="score-item">
                          <span className="score-label">Consistency Score:</span>
                          <span className="score-value">{assessmentData.childTestResults.comprehensiveAssessment.consistencyScore}/30</span>
                        </div>
                        <div className="score-item">
                          <span className="score-label">Improvement Score:</span>
                          <span className="score-value">{assessmentData.childTestResults.comprehensiveAssessment.improvementScore}/30</span>
                        </div>
                        <div className="score-item total-score">
                          <span className="score-label">Total Score:</span>
                          <span className="score-value">{assessmentData.childTestResults.comprehensiveAssessment.totalScore}/100</span>
                        </div>
                      </div>
                      <div className="assessment-recommendations">
                        <h4>Training Recommendations:</h4>
                        <ul>
                          {assessmentData.childTestResults.comprehensiveAssessment.recommendations?.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="test-details">
                    <h3>Round-by-Round Results</h3>
                    <div className="rounds-table">
                      <div className="table-header">
                        <span>Round</span>
                        <span>Time</span>
                        <span>Performance</span>
                      </div>
                      {assessmentData.childTestResults.results?.map((result, index) => (
                        <div key={index} className="table-row">
                          <span>Round {result.grid}</span>
                          <span>{result.time.toFixed(2)} seconds</span>
                          <span className={`performance-${result.performance || 'average'}`}>
                            {result.performance === 'excellent' ? 'Excellent' :
                             result.performance === 'good' ? 'Good' :
                             result.performance === 'average' ? 'Average' : 'Needs Improvement'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="result-section">
              <h2>Personalized Recommendations</h2>
              <div className="recommendations-grid">
                <div className="recommendation-card">
                  <div className="recommendation-icon">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <h3>Educational Support</h3>
                  <ul>
                    <li>Implement structured learning routines</li>
                    <li>Use visual aids and hands-on materials</li>
                    <li>Create a dedicated homework space</li>
                    <li>Break tasks into smaller, manageable parts</li>
                  </ul>
                </div>
                <div className="recommendation-card">
                  <div className="recommendation-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <h3>Social Development</h3>
                  <ul>
                    <li>Encourage participation in group activities</li>
                    <li>Practice social skills through role-playing</li>
                    <li>Celebrate small achievements</li>
                    <li>Provide opportunities for success</li>
                  </ul>
                </div>
                <div className="recommendation-card">
                  <div className="recommendation-icon">
                    <i className="fas fa-home"></i>
                  </div>
                  <h3>Family Support</h3>
                  <ul>
                    <li>Maintain open communication with teachers</li>
                    <li>Create a supportive home environment</li>
                    <li>Establish consistent daily routines</li>
                    <li>Consider professional support when needed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="result-section">
              <h2>Next Steps</h2>
              <div className="next-steps">
                <div className="step-item">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Contact Our Team</h3>
                    <p>Schedule a consultation with our qualified professionals to discuss your child's specific needs.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Create Care Plan</h3>
                    <p>Work with our team to develop a personalized care plan tailored to your child's unique requirements.</p>
                  </div>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Begin Implementation</h3>
                    <p>Start implementing the recommended strategies with ongoing support and monitoring from our team.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-primary btn-large" onClick={handleNewAssessment}>
              <i className="fas fa-redo"></i>
              Start New Assessment
            </button>
            <button className="btn btn-secondary btn-large" onClick={handleBackToHome}>
              <i className="fas fa-home"></i>
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResultPage; 