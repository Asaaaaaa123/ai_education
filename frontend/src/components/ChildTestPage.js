import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import SchulteTest from './SchulteTest';
import AgeAdaptiveGame from './AgeAdaptiveGame';
import { api } from '../utils/apiClient';
import './ChildTestPage.css';

const ChildTestPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const childId = location.state?.childId || localStorage.getItem('currentChildId');
  const testType = location.state?.testType || localStorage.getItem('testType') || 'schulte';
  const age = parseInt(location.state?.age || localStorage.getItem('childAge') || 6);
  
  const [testResults, setTestResults] = useState([]);
  const [currentTest] = useState(testType);
  const [testCompleted, setTestCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!childId) {
      navigate('/child-registration');
    }
  }, [childId, navigate]);

  const handleTestComplete = async (result) => {
    try {
      setLoading(true);
      
      let score, performanceLevel, testType;
      
      if (currentTest === 'schulte') {
        // 舒尔特测试结果处理
        score = calculateSchulteScore(result);
        performanceLevel = result.performance;
        testType = 'schulte';
      } else {
        // 年龄适配游戏结果处理（颜色、形状等）
        score = calculateAgeAdaptiveScore(result);
        performanceLevel = getPerformanceLevel(result);
        testType = result.gameType || 'age_adaptive';
      }
      
      // 提交测试结果
      const testResultData = {
        child_id: childId,
        test_type: testType,
        test_data: result,
        score: score,
        performance_level: performanceLevel
      };
      
      await api.submitTestResult(testResultData);
      setTestResults(prev => [...prev, { ...result, score, performance: performanceLevel }]);
      setTestCompleted(true);
    } catch (error) {
      console.error('提交测试结果失败:', error);
      alert(t('submitTestFailed'));
    } finally {
      setLoading(false);
    }
  };

  const calculateSchulteScore = (result) => {
    // 舒尔特测试分数计算（根据平均时间）
    const averageTime = result.averageTime;
    if (averageTime < 30) return 90 + (30 - averageTime) * 0.5;
    if (averageTime < 45) return 75 + (45 - averageTime) * 0.5;
    if (averageTime < 60) return 60 + (60 - averageTime) * 0.5;
    return Math.max(30, 60 - (averageTime - 60) * 0.5);
  };

  const calculateAgeAdaptiveScore = (result) => {
    // 年龄适配游戏分数计算（综合考虑得分、准确率、时间）
    const score = result.score || 0;
    const accuracy = result.accuracy || 0;
    const totalTime = result.totalTime || 60;
    
    // 基础分数：得分 * 10
    let baseScore = Math.min(100, score * 10);
    
    // 准确率加成
    const accuracyBonus = accuracy * 0.3;
    
    // 速度加成（完成时间越短越好）
    const timeBonus = Math.max(0, (60 - totalTime) / 60 * 20);
    
    // 最终分数
    const finalScore = Math.min(100, baseScore + accuracyBonus + timeBonus);
    
    return Math.round(finalScore);
  };

  const getPerformanceLevel = (result) => {
    // 根据综合表现确定水平
    const score = calculateAgeAdaptiveScore(result);
    const accuracy = result.accuracy || 0;
    
    if (score >= 85 && accuracy >= 80) return 'excellent';
    if (score >= 70 && accuracy >= 65) return 'good';
    if (score >= 55 && accuracy >= 50) return 'average';
    return 'needs_improvement';
  };

  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      
      // 获取所有测试结果
      const testResultsResponse = await api.getTestResults(childId);
      const allTestResults = testResultsResponse.data.data.test_results;
      
      // 创建计划请求
      const planRequest = {
        child_id: childId,
        plan_type: 'weekly', // 可以先让用户选择
        test_results: allTestResults.map(tr => ({
          test_type: tr.test_type,
          test_data: {},
          score: tr.score,
          performance_level: tr.performance_level
        }))
      };
      
      const response = await api.createPlan(planRequest);
      
      if (response.data.success) {
        const planId = response.data.data.plan_id;
        navigate('/training-plan', { state: { planId, childId } });
      }
    } catch (error) {
      console.error('生成计划失败:', error);
      alert(t('generatePlanFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!childId) {
    return null;
  }

  return (
    <div className="child-test-page">
      <div className="test-container">
        <h1>{t('childAbilityTest')}</h1>
        <p className="test-description">
          {t('testDescription')}
        </p>

        {!testCompleted ? (
          <div className="test-section">
            <div className="test-header">
              {currentTest === 'schulte' ? (
                <>
                  <h2>{t('schulteTest')}</h2>
                  <p>{t('schulteDescription')}</p>
                  <p className="test-note">{t('testNote')}</p>
                </>
              ) : (
                <>
                  <h2>{t('ageAppropriateTest')}</h2>
                  <p>{t('ageAppropriateDescription')}</p>
                  <p className="test-note">{t('ageAppropriateNote')}</p>
                </>
              )}
            </div>
            {currentTest === 'schulte' ? (
              <SchulteTest onComplete={handleTestComplete} />
            ) : (
              <AgeAdaptiveGame childAge={age} onComplete={handleTestComplete} />
            )}
          </div>
        ) : (
          <div className="test-completed">
            <div className="success-icon">✓</div>
            <h2>{t('testCompletedTitle')}</h2>
            <div className="test-summary">
              {testResults.length > 0 && (
                <>
                  {currentTest === 'schulte' ? (
                    <div className="result-item">
                      <span>{t('averageTime')}：</span>
                      <strong>{testResults[testResults.length - 1].averageTime?.toFixed(2) || '0.00'}{t('seconds')}</strong>
                    </div>
                  ) : (
                    <>
                      <div className="result-item">
                        <span>{t('score')}：</span>
                        <strong>{testResults[testResults.length - 1].score || 0}</strong>
                      </div>
                      {testResults[testResults.length - 1].accuracy && (
                        <div className="result-item">
                          <span>{t('accuracy')}：</span>
                          <strong>{testResults[testResults.length - 1].accuracy.toFixed(1)}%</strong>
                        </div>
                      )}
                      <div className="result-item">
                        <span>{t('completionTime')}：</span>
                        <strong>{testResults[testResults.length - 1].totalTime?.toFixed(2) || '0.00'}{t('seconds')}</strong>
                      </div>
                    </>
                  )}
                  <div className="result-item">
                    <span>{t('totalScore')}：</span>
                    <strong>{testResults[testResults.length - 1].score || 0}/100</strong>
                  </div>
                  <div className="result-item">
                    <span>{t('performanceLevel')}：</span>
                    <strong className={`level-${testResults[testResults.length - 1]?.performance || 'average'}`}>
                      {testResults[testResults.length - 1]?.performance === 'excellent' && t('excellent')}
                      {testResults[testResults.length - 1]?.performance === 'good' && t('good')}
                      {testResults[testResults.length - 1]?.performance === 'average' && t('average')}
                      {testResults[testResults.length - 1]?.performance === 'needs_improvement' && t('needsImprovement')}
                    </strong>
                  </div>
                </>
              )}
            </div>
            <button 
              onClick={handleGeneratePlan}
              className="generate-plan-btn"
              disabled={loading}
            >
              {loading ? t('generatingPlan') : t('generatePlan')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildTestPage;

