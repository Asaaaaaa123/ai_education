import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SchulteTest from './SchulteTest';
import AgeAdaptiveGame from './AgeAdaptiveGame';
import { api } from '../utils/apiClient';
import './ChildTestPage.css';

const ChildTestPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const childId = location.state?.childId || localStorage.getItem('currentChildId');
  const testType = location.state?.testType || localStorage.getItem('testType') || 'schulte';
  const age = parseInt(location.state?.age || localStorage.getItem('childAge') || 6);
  
  const [testResults, setTestResults] = useState([]);
  const [currentTest, setCurrentTest] = useState(testType);
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
      alert('提交测试结果失败，请重试');
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
    const roundsCompleted = result.roundsCompleted || 0;
    
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
      alert('生成计划失败，请重试');
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
        <h1>孩子能力测试</h1>
        <p className="test-description">
          请让孩子完成以下测试，我们将根据测试结果生成个性化的训练计划
        </p>

        {!testCompleted ? (
          <div className="test-section">
            <div className="test-header">
              {currentTest === 'schulte' ? (
                <>
                  <h2>舒尔特方格测试</h2>
                  <p>这是一个注意力测试游戏，请让孩子按照1-25的顺序点击数字</p>
                  <p className="test-note">适合6岁以上儿童</p>
                </>
              ) : (
                <>
                  <h2>适合低龄儿童的认知测试</h2>
                  <p>我们将通过适合您孩子年龄的游戏来评估认知能力</p>
                  <p className="test-note">适合6岁以下儿童</p>
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
            <h2>测试完成！</h2>
            <div className="test-summary">
              {testResults.length > 0 && (
                <>
                  {currentTest === 'schulte' ? (
                    <div className="result-item">
                      <span>平均用时：</span>
                      <strong>{testResults[testResults.length - 1].averageTime?.toFixed(2) || '0.00'}秒</strong>
                    </div>
                  ) : (
                    <>
                      <div className="result-item">
                        <span>得分：</span>
                        <strong>{testResults[testResults.length - 1].score || 0}</strong>
                      </div>
                      {testResults[testResults.length - 1].accuracy && (
                        <div className="result-item">
                          <span>准确率：</span>
                          <strong>{testResults[testResults.length - 1].accuracy.toFixed(1)}%</strong>
                        </div>
                      )}
                      <div className="result-item">
                        <span>完成时间：</span>
                        <strong>{testResults[testResults.length - 1].totalTime?.toFixed(2) || '0.00'}秒</strong>
                      </div>
                    </>
                  )}
                  <div className="result-item">
                    <span>综合得分：</span>
                    <strong>{testResults[testResults.length - 1].score || 0}/100</strong>
                  </div>
                  <div className="result-item">
                    <span>表现水平：</span>
                    <strong className={`level-${testResults[testResults.length - 1]?.performance || 'average'}`}>
                      {testResults[testResults.length - 1]?.performance === 'excellent' && '优秀'}
                      {testResults[testResults.length - 1]?.performance === 'good' && '良好'}
                      {testResults[testResults.length - 1]?.performance === 'average' && '一般'}
                      {testResults[testResults.length - 1]?.performance === 'needs_improvement' && '需要改进'}
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
              {loading ? '正在生成计划...' : '生成训练计划'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildTestPage;

