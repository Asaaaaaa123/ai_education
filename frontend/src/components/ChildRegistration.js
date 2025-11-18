import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import { api } from '../utils/apiClient';
import './ChildRegistration.css';

const ChildRegistration = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    birth_date: '',
    parent_name: '',
    child_condition: '',
    main_problems: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Common problems mapped to translation keys
  const commonProblems = [
    'attentionDeficit',
    'hyperactivity',
    'moodSwings',
    'socialDifficulty',
    'learningDifficulty',
    'languageDelay',
    'behaviorIssues',
    'poorCoordination',
    'poorMemory',
    'mathImprovement',
    'chineseImprovement',
    'englishImprovement',
    'lowEfficiency',
    'lackMotivation',
    'slowHomework',
    'weakUnderstanding',
    'other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProblemToggle = (problem) => {
    setFormData(prev => {
      const problems = [...prev.main_problems];
      const index = problems.indexOf(problem);
      if (index > -1) {
        problems.splice(index, 1);
      } else {
        problems.push(problem);
      }
      return { ...prev, main_problems: problems };
    });
  };

  const canProceedToStep2 = () => {
    return formData.name && formData.age && formData.gender && 
           formData.birth_date && formData.parent_name;
  };

  const canSubmit = () => {
    return formData.child_condition || formData.main_problems.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('提交数据:', formData);
      console.log('API调用: /api/plans/children');
      
      // 根据年龄选择测试类型
      const age = parseInt(formData.age);
      const testType = age < 6 ? 'age_adaptive' : 'schulte';
      
      const childData = {
        ...formData,
        test_type: testType,
        main_problems: formData.main_problems
      };
      
      const response = await api.createChild(childData);
      console.log('API响应:', response);
      
      if (response.data && response.data.success) {
        const childId = response.data.data.child_id;
        // 保存childId和测试类型到localStorage
        localStorage.setItem('currentChildId', childId);
        localStorage.setItem('testType', testType);
        localStorage.setItem('childAge', formData.age);
        
        // 更新localStorage中的用户孩子列表
        const children = JSON.parse(localStorage.getItem('userChildren') || '[]');
        const newChild = {
          child_id: childId,
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          birth_date: formData.birth_date,
          parent_name: formData.parent_name,
          created_at: new Date().toISOString(),
          child_condition: formData.child_condition,
          main_problems: formData.main_problems || []
        };
        children.push(newChild);
        localStorage.setItem('userChildren', JSON.stringify(children));
        
        // 跳转到测试页面
        navigate('/child-test', { 
          state: { 
            childId,
            testType,
            age: age,
            mainProblems: formData.main_problems,
            condition: formData.child_condition
          } 
        });
      } else {
        setError('创建失败，请重试');
        console.error('创建失败:', response);
      }
    } catch (err) {
      console.error('API错误:', err);
      console.error('错误详情:', err.response);
      setError(err.response?.data?.detail || err.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="child-registration">
      <div className="registration-container">
        <div className="progress-bar">
          <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">{t('step1Label')}</span>
          </div>
          <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">{t('step2Label')}</span>
          </div>
        </div>

        <h1>{t('childInfoEntry')}</h1>
        <p className="subtitle">
          {currentStep === 1 
            ? t('step1Subtitle')
            : t('step2Subtitle')}
        </p>
        
        <form onSubmit={handleSubmit} className="registration-form">
          {/* 步骤1：基本信息 */}
          {currentStep === 1 && (
            <>
          <div className="form-group">
            <label htmlFor="name">{t('childName')} *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={t('childNamePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">{t('age')} *</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
              min="1"
              max="18"
              placeholder={t('agePlaceholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="gender">{t('gender')} *</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">{t('selectGender')}</option>
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="birth_date">{t('birthDate')} *</label>
            <input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="parent_name">{t('parentName')} *</label>
            <input
              type="text"
              id="parent_name"
              name="parent_name"
              value={formData.parent_name}
              onChange={handleChange}
              required
              placeholder={t('parentNamePlaceholder')}
            />
          </div>

          {formData.age && (
            <div className="age-info">
              {parseInt(formData.age) < 6 ? (
                <div className="info-box">
                  <i className="fas fa-info-circle"></i>
                  <p>{t('under6Info')}</p>
                </div>
              ) : (
                <div className="info-box">
                  <i className="fas fa-check-circle"></i>
                  <p>{t('over6Info')}</p>
                </div>
              )}
            </div>
          )}

          <button 
            type="button" 
            className="submit-btn"
            onClick={() => setCurrentStep(2)}
            disabled={!canProceedToStep2()}
          >
            {t('nextStep')}
          </button>
            </>
          )}

          {/* 步骤2：状况说明 */}
          {currentStep === 2 && (
            <>
          <div className="form-group">
            <label>{t('mainProblems')} *</label>
            <p className="form-hint">{t('mainProblemsHint')}</p>
            <div className="problem-checkboxes">
              {commonProblems.map((problemKey, index) => (
                <label key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={formData.main_problems.includes(problemKey)}
                    onChange={() => handleProblemToggle(problemKey)}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">{t(problemKey)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="child_condition">
              {t('childCondition')} *
              <span className="label-hint"> {t('conditionHint')}</span>
            </label>
            <textarea
              id="child_condition"
              name="child_condition"
              value={formData.child_condition}
              onChange={handleChange}
              required
              rows="5"
              placeholder={t('conditionPlaceholder')}
              className="form-textarea"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => setCurrentStep(1)}
            >
              {t('previous')}
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || !canSubmit()}
            >
              {loading ? t('loading') : t('submitAndStart')}
            </button>
          </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChildRegistration;

