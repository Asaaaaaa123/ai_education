import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AssessmentPage.css';
import SchulteTest from './SchulteTest';
import AgeAdaptiveGame from './AgeAdaptiveGame';

const AssessmentPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentMode, setAssessmentMode] = useState(''); // 'parent-only', 'mixed', 'interactive'
  const [childAge, setChildAge] = useState(0);
  
  // 确保在组件初始化时清除任何可能的状态
  React.useEffect(() => {
    setShowInteractiveTest(false);
    setSelectedGame(null);
    setTestResults(null);
  }, []);
  const [formData, setFormData] = useState({
    // 基本信息
    childName: '',
    gender: '',
    birthDate: {
      year: '',
      month: '',
      day: ''
    },
    assessmentDate: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate()
    },
    assessor: '',
    
    // 发展评估数据
    motorSkills: {
      grossMotor: {},
      fineMotor: {}
    },
    cognitiveSkills: {},
    languageSkills: {},
    socialEmotional: {},
    dailyLiving: {},
    
    // 互动游戏结果
    interactiveResults: {},
    
    // 家长观察
    parentObservations: '',
    concerns: '',
    strengths: ''
  });

  const [showInteractiveTest, setShowInteractiveTest] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showAgeAdaptiveGame, setShowAgeAdaptiveGame] = useState(false);
  const [ageAdaptiveResults, setAgeAdaptiveResults] = useState(null);

  // 年龄组定义
  const getAgeGroup = (age) => {
    if (age <= 3) return '0-3';
    if (age <= 6) return '4-6';
    return '7+';
  };

  // 0-3岁发展里程碑
  const milestones0to3 = {
    motorSkills: {
      grossMotor: [
        { id: 'gm_3m', age: '3M', item: 'Can lift head 45 degrees or more', standard: '2-3M' },
        { id: 'gm_6m', age: '6M', item: 'Can sit independently', standard: '6-8M' },
        { id: 'gm_12m', age: '12M', item: 'Can walk independently', standard: '12-15M' },
        { id: 'gm_18m', age: '18M', item: 'Can run a few steps', standard: '15-18M' },
        { id: 'gm_24m', age: '24M', item: 'Can jump with both feet', standard: '24-30M' }
      ],
      fineMotor: [
        { id: 'fm_6m', age: '6M', item: 'Can grasp objects', standard: '4-6M' },
        { id: 'fm_12m', age: '12M', item: 'Can use thumb and index finger to pick up', standard: '9-12M' },
        { id: 'fm_18m', age: '18M', item: 'Can stack 2-3 blocks', standard: '15-18M' },
        { id: 'fm_24m', age: '24M', item: 'Can draw straight lines', standard: '24-30M' }
      ]
    },
    cognitiveSkills: [
      { id: 'cog_6m', age: '6M', item: 'Can find hidden objects', standard: '6-9M' },
      { id: 'cog_12m', age: '12M', item: 'Can imitate simple actions', standard: '12-15M' },
      { id: 'cog_18m', age: '18M', item: 'Can identify body parts', standard: '15-18M' },
      { id: 'cog_24m', age: '24M', item: 'Can complete simple puzzles', standard: '24-30M' }
    ],
    languageSkills: [
      { id: 'lang_6m', age: '6M', item: 'Can make babbling sounds', standard: '4-6M' },
      { id: 'lang_12m', age: '12M', item: 'Can say 1-2 words', standard: '12-15M' },
      { id: 'lang_18m', age: '18M', item: 'Can say 5-10 words', standard: '15-18M' },
      { id: 'lang_24m', age: '24M', item: 'Can say 2-3 word sentences', standard: '24-30M' }
    ],
    socialEmotional: [
      { id: 'se_6m', age: '6M', item: 'Can smile at people', standard: '2-3M' },
      { id: 'se_12m', age: '12M', item: 'Can express basic emotions', standard: '9-12M' },
      { id: 'se_18m', age: '18M', item: 'Can share toys', standard: '15-18M' },
      { id: 'se_24m', age: '24M', item: 'Can participate in simple games', standard: '24-30M' }
    ]
  };

  // 4-6岁发展评估
  const assessment4to6 = {
    cognitiveSkills: [
      { id: 'cog_4y', item: 'Can count to 10', ageRef: '4Y' },
      { id: 'cog_5y', item: 'Can identify basic colors and shapes', ageRef: '4-5Y' },
      { id: 'cog_6y', item: 'Can understand simple time concepts', ageRef: '5-6Y' }
    ],
    languageSkills: [
      { id: 'lang_4y', item: 'Can clearly express needs', ageRef: '4Y' },
      { id: 'lang_5y', item: 'Can tell simple stories', ageRef: '5Y' },
      { id: 'lang_6y', item: 'Can understand complex instructions', ageRef: '6Y' }
    ],
    socialSkills: [
      { id: 'social_4y', item: 'Can play cooperatively with peers', ageRef: '4Y' },
      { id: 'social_5y', item: 'Can handle simple conflicts', ageRef: '5Y' },
      { id: 'social_6y', item: 'Can understand others\' feelings', ageRef: '6Y' }
    ]
  };

  // 互动游戏配置
  const interactiveGames = {
    '0-3': [
      { 
        id: 'spot_difference_03', 
        name: 'Spot the Difference', 
        description: 'Carefully observe the pictures and find the differences to improve observation skills',
        url: 'https://toytheater.com/spot-the-difference/',
        type: 'iframe',
        icon: 'fas fa-eye'
      },
      { 
        id: 'color_recognition_03', 
        name: 'Color Recognition', 
        description: 'Learn to identify basic colors and develop color perception skills',
        url: 'https://www.abcya.com/games/colors',
        type: 'iframe',
        icon: 'fas fa-palette'
      },
      { 
        id: 'shape_recognition_03', 
        name: 'Shape Recognition', 
        description: 'Learn basic geometric shapes and develop spatial thinking',
        url: 'https://www.abcya.com/games/shapes',
        type: 'iframe',
        icon: 'fas fa-shapes'
      },
      { 
        id: 'matching_game_03', 
        name: 'Find the Same', 
        description: 'Find identical items to develop visual recognition skills',
        url: 'https://toytheater.com/matching/',
        type: 'iframe',
        icon: 'fas fa-search'
      }
    ],
    '4-6': [
      { 
        id: 'number_sequence', 
        name: 'Number Sequence', 
        description: 'Click numbers in order to learn number concepts',
        url: 'https://toytheater.com/number-order/',
        type: 'iframe',
        icon: 'fas fa-sort-numeric-up'
      },
      { 
        id: 'memory_game', 
        name: 'Memory Game', 
        description: 'Remember and repeat patterns to exercise memory',
        url: 'https://toytheater.com/memory/',
        type: 'iframe',
        icon: 'fas fa-brain'
      },
      { 
        id: 'pattern_recognition', 
        name: 'Pattern Recognition', 
        description: 'Find patterns and continue them to develop logical thinking',
        url: 'https://toytheater.com/pattern-blocks/',
        type: 'iframe',
        icon: 'fas fa-th-large'
      }
    ],
    '7+': [
      { 
        id: 'schulte_test', 
        name: 'Attention Test', 
        description: 'Schulte attention training to improve focus',
        type: 'internal',
        icon: 'fas fa-crosshairs'
      },
      { 
        id: 'logical_reasoning', 
        name: 'Logical Reasoning', 
        description: 'Solve simple logic problems to develop thinking skills',
        url: 'https://toytheater.com/logic-games/',
        type: 'iframe',
        icon: 'fas fa-puzzle-piece'
      }
    ]
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (dateType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [dateType]: {
        ...prev[dateType],
        [field]: value
      }
    }));
    
    // 如果用户已经选择了评估模式，不要重新计算年龄
    if (assessmentMode) {
      return;
    }
    
    // 只有在没有选择模式的情况下，才根据出生日期计算年龄
    if (dateType === 'birthDate' && field === 'year') {
      const calculatedAge = calculateAge();
      setChildAge(calculatedAge);
    }
  };

  const handleMilestoneChange = (category, subCategory, itemId, score) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: {
          ...prev[category]?.[subCategory],
          [itemId]: score
        }
      }
    }));
  };

  const handleAssessmentChange = (category, itemId, score) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemId]: score
      }
    }));
  };

  const calculateAge = () => {
    const birthYear = parseInt(formData.birthDate.year);
    const birthMonth = parseInt(formData.birthDate.month);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    let age = currentYear - birthYear;
    if (currentMonth < birthMonth) {
      age--;
    }
    return age;
  };

  const nextStep = () => {
    if (currentStep === 0) {
      // 如果还没有选择模式，使用默认逻辑
      if (!assessmentMode) {
        const age = calculateAge();
        setChildAge(age);
        const ageGroup = getAgeGroup(age);
        
        if (age <= 3) {
          setAssessmentMode('parent-only');
        } else if (age <= 6) {
          setAssessmentMode('mixed');
        } else {
          setAssessmentMode('interactive');
        }
      }
      
      setCurrentStep(1);
    } else if (currentStep < getMaxSteps()) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getMaxSteps = () => {
    const ageGroup = getAgeGroup(childAge);
    if (ageGroup === '0-3') return 7; // 基本信息 + 4个发展领域 + 互动游戏 + 家长观察
    if (ageGroup === '4-6') return 7; // 基本信息 + 3个发展领域 + 互动游戏 + 家长观察
    return 8; // 基本信息 + 发展评估 + 互动游戏 + 家长观察
  };

  const handleInteractiveTestComplete = (results) => {
    setTestResults(results);
    setShowInteractiveTest(false);
    setSelectedGame(null);
    setFormData(prev => ({
      ...prev,
      interactiveResults: results
    }));
    
    // 如果是0-3岁年龄段，游戏完成后进入基本信息填写
    const ageGroup = getAgeGroup(childAge);
    if (ageGroup === '0-3') {
      setCurrentStep(1); // 直接进入基本信息填写
    } else {
      // 其他年龄段继续到下一步
      nextStep();
    }
  };

  const handleAgeAdaptiveGameComplete = (results) => {
    setAgeAdaptiveResults(results);
    setShowAgeAdaptiveGame(false);
    setFormData(prev => ({
      ...prev,
      ageAdaptiveResults: results
    }));
    
    // 根据年龄组决定下一步
    const ageGroup = getAgeGroup(childAge);
    if (ageGroup === '0-3') {
      setCurrentStep(1); // 进入基本信息填写
    } else {
      setCurrentStep(2); // 进入基本信息填写
    }
  };

  const handleModeSelect = (mode) => {
    setAssessmentMode(mode);
    // 根据模式设置默认年龄
    switch (mode) {
      case 'parent-only':
        setChildAge(2); // 0-3岁
        // 0-3岁直接进入年龄适应性游戏
        setShowAgeAdaptiveGame(true);
        return; // 直接返回，不进入下一步
      case 'mixed':
        setChildAge(5); // 4-6岁
        // 4-6岁可以选择年龄适应性游戏或传统评估
        setShowAgeAdaptiveGame(true);
        return;
      case 'interactive':
        setChildAge(8); // 7岁以上
        // 7岁以上可以选择年龄适应性游戏或Schulte测试
        setShowAgeAdaptiveGame(true);
        return;
      default:
        setChildAge(0);
    }
    
    // 清除任何可能的状态
    setShowInteractiveTest(false);
    setShowAgeAdaptiveGame(false);
    setSelectedGame(null);
    setTestResults(null);
    
    nextStep();
  };

  const handleSubmit = async () => {
    try {
      const submissionData = {
        ...formData,
        childAge,
        assessmentMode,
        ageGroup: getAgeGroup(childAge),
        testResults
      };

      sessionStorage.setItem('assessmentData', JSON.stringify(submissionData));
      
      const response = await fetch('http://localhost:8001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });
      
      if (response.ok) {
        const result = await response.json();
        sessionStorage.setItem('assessmentResult', JSON.stringify(result));
        navigate('/result');
      } else {
        console.error('API request failed:', response.status);
        navigate('/result');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      navigate('/result');
    }
  };

  const renderStep = () => {
    const ageGroup = getAgeGroup(childAge);
    
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <h2>Select Assessment Mode</h2>
            <p>We will provide the most suitable assessment method based on your child's age</p>
            
            <div className="assessment-modes">
              <div 
                className={`mode-card ${assessmentMode === 'parent-only' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('parent-only')}
              >
                <div className="mode-icon">
                  <i className="fas fa-baby"></i>
                </div>
                <h3>0-3 years: Age-Adaptive Games</h3>
                <p>Simple interactive games designed for toddlers</p>
                <ul>
                  <li>Color matching games</li>
                  <li>Sound recognition games</li>
                  <li>Developmental milestone assessment</li>
                </ul>
              </div>
              
              <div 
                className={`mode-card ${assessmentMode === 'mixed' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('mixed')}
              >
                <div className="mode-icon">
                  <i className="fas fa-child"></i>
                </div>
                <h3>4-6 years: Age-Adaptive Games</h3>
                <p>Cognitive games suitable for kindergarten children</p>
                <ul>
                  <li>Shape classification games</li>
                  <li>Number counting games</li>
                  <li>Memory matching games</li>
                </ul>
              </div>
              
              <div 
                className={`mode-card ${assessmentMode === 'interactive' ? 'selected' : ''}`}
                onClick={() => handleModeSelect('interactive')}
              >
                <div className="mode-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3>7+ years: Age-Adaptive Games</h3>
                <p>Challenging games suitable for elementary school students</p>
                <ul>
                  <li>Pattern completion games</li>
                  <li>Word building games</li>
                  <li>Logical reasoning games</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <h2>Basic Information</h2>
            <p>Please fill in your child's basic information</p>
            
            <div className="form-group">
              <label className="form-label">Child's Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.childName}
                onChange={(e) => handleInputChange('childName', e.target.value)}
                placeholder="Please enter child's name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <div className="gender-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  />
                  <span>Male</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Birth Date</label>
              <div className="date-inputs">
                <input
                  type="number"
                  className="form-input date-input"
                  placeholder="Year"
                  value={formData.birthDate.year}
                  onChange={(e) => handleDateChange('birthDate', 'year', e.target.value)}
                />
                <input
                  type="number"
                  className="form-input date-input"
                  placeholder="Month"
                  min="1"
                  max="12"
                  value={formData.birthDate.month}
                  onChange={(e) => handleDateChange('birthDate', 'month', e.target.value)}
                />
                <input
                  type="number"
                  className="form-input date-input"
                  placeholder="Day"
                  min="1"
                  max="31"
                  value={formData.birthDate.day}
                  onChange={(e) => handleDateChange('birthDate', 'day', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">评估者</label>
              <input
                type="text"
                className="form-input"
                value={formData.assessor}
                onChange={(e) => handleInputChange('assessor', e.target.value)}
                placeholder="Parent/Teacher/Doctor"
              />
            </div>
          </div>
        );

      case 2:
        if (ageGroup === '0-3') {
          return (
            <div className="step-content">
              <h2>Motor Development Assessment</h2>
              <p>Please select the most appropriate option based on your child's performance</p>
              
              <div className="milestone-section">
                <h3>Gross Motor Skills</h3>
                {milestones0to3.motorSkills.grossMotor.map((item) => (
                  <div key={item.id} className="milestone-item">
                    <div className="milestone-header">
                      <span className="age-group">{item.age}</span>
                      <span className="standard">Development Standard: {item.standard}</span>
                    </div>
                    <div className="milestone-content">
                      <p className="milestone-text">{item.item}</p>
                      <div className="milestone-options">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="2"
                            checked={formData.motorSkills.grossMotor[item.id] === 2}
                            onChange={(e) => handleMilestoneChange('motorSkills', 'grossMotor', item.id, parseInt(e.target.value))}
                          />
                          <span>完全掌握 (2分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="1"
                            checked={formData.motorSkills.grossMotor[item.id] === 1}
                            onChange={(e) => handleMilestoneChange('motorSkills', 'grossMotor', item.id, parseInt(e.target.value))}
                          />
                          <span>部分掌握 (1分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="0"
                            checked={formData.motorSkills.grossMotor[item.id] === 0}
                            onChange={(e) => handleMilestoneChange('motorSkills', 'grossMotor', item.id, parseInt(e.target.value))}
                          />
                          <span>尚未掌握 (0分)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="milestone-section">
                <h3>Fine Motor Skills</h3>
                {milestones0to3.motorSkills.fineMotor.map((item) => (
                  <div key={item.id} className="milestone-item">
                    <div className="milestone-header">
                      <span className="age-group">{item.age}</span>
                      <span className="standard">Development Standard: {item.standard}</span>
                    </div>
                    <div className="milestone-content">
                      <p className="milestone-text">{item.item}</p>
                      <div className="milestone-options">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="2"
                            checked={formData.motorSkills.fineMotor[item.id] === 2}
                            onChange={(e) => handleMilestoneChange('motorSkills', 'fineMotor', item.id, parseInt(e.target.value))}
                          />
                          <span>完全掌握 (2分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="1"
                            checked={formData.motorSkills.fineMotor[item.id] === 1}
                            onChange={(e) => handleMilestoneChange('motorSkills', 'fineMotor', item.id, parseInt(e.target.value))}
                          />
                          <span>部分掌握 (1分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="0"
                            checked={formData.motorSkills.fineMotor[item.id] === 0}
                            onChange={(e) => handleMilestoneChange('motorSkills', 'fineMotor', item.id, parseInt(e.target.value))}
                          />
                          <span>尚未掌握 (0分)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <div className="step-content">
            <h2>认知能力评估</h2>
            <p>请根据孩子的表现进行评分</p>
            
            <div className="rating-scale">
              <div className="scale-item">
                <span className="scale-number">5</span>
                <span className="scale-label">完全符合</span>
              </div>
              <div className="scale-item">
                <span className="scale-number">4</span>
                <span className="scale-label">基本符合</span>
              </div>
              <div className="scale-item">
                <span className="scale-number">3</span>
                <span className="scale-label">部分符合</span>
              </div>
              <div className="scale-item">
                <span className="scale-number">2</span>
                <span className="scale-label">较少符合</span>
              </div>
              <div className="scale-item">
                <span className="scale-number">1</span>
                <span className="scale-label">不符合</span>
              </div>
            </div>
            
            <div className="assessment-section">
              {assessment4to6.cognitiveSkills.map((item) => (
                <div key={item.id} className="assessment-item">
                  <div className="assessment-header">
                    <span className="age-ref">年龄参考: {item.ageRef}</span>
                  </div>
                  <div className="assessment-content">
                    <p className="assessment-text">{item.item}</p>
                    <div className="assessment-options">
                      {[5, 4, 3, 2, 1].map(score => (
                        <label key={score} className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value={score}
                            checked={formData.cognitiveSkills[item.id] === score}
                            onChange={(e) => handleAssessmentChange('cognitiveSkills', item.id, parseInt(e.target.value))}
                          />
                          <span>{score}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        if (ageGroup === '0-3') {
          return (
            <div className="step-content">
              <h2>Language Development Assessment</h2>
              <p>Please assess based on your child's language performance</p>
              
              <div className="milestone-section">
                {milestones0to3.languageSkills.map((item) => (
                  <div key={item.id} className="milestone-item">
                    <div className="milestone-header">
                      <span className="age-group">{item.age}</span>
                      <span className="standard">Development Standard: {item.standard}</span>
                    </div>
                    <div className="milestone-content">
                      <p className="milestone-text">{item.item}</p>
                      <div className="milestone-options">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="2"
                            checked={formData.languageSkills[item.id] === 2}
                            onChange={(e) => handleAssessmentChange('languageSkills', item.id, parseInt(e.target.value))}
                          />
                          <span>完全掌握 (2分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="1"
                            checked={formData.languageSkills[item.id] === 1}
                            onChange={(e) => handleAssessmentChange('languageSkills', item.id, parseInt(e.target.value))}
                          />
                          <span>部分掌握 (1分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="0"
                            checked={formData.languageSkills[item.id] === 0}
                            onChange={(e) => handleAssessmentChange('languageSkills', item.id, parseInt(e.target.value))}
                          />
                          <span>尚未掌握 (0分)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <div className="step-content">
            <h2>语言能力评估</h2>
            <p>请根据孩子的语言表现进行评分</p>
            
            <div className="assessment-section">
              {assessment4to6.languageSkills.map((item) => (
                <div key={item.id} className="assessment-item">
                  <div className="assessment-header">
                    <span className="age-ref">年龄参考: {item.ageRef}</span>
                  </div>
                  <div className="assessment-content">
                    <p className="assessment-text">{item.item}</p>
                    <div className="assessment-options">
                      {[5, 4, 3, 2, 1].map(score => (
                        <label key={score} className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value={score}
                            checked={formData.languageSkills[item.id] === score}
                            onChange={(e) => handleAssessmentChange('languageSkills', item.id, parseInt(e.target.value))}
                          />
                          <span>{score}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        if (ageGroup === '0-3') {
          return (
            <div className="step-content">
              <h2>Social-Emotional Development Assessment</h2>
              <p>Please assess based on your child's social-emotional performance</p>
              
              <div className="milestone-section">
                {milestones0to3.socialEmotional.map((item) => (
                  <div key={item.id} className="milestone-item">
                    <div className="milestone-header">
                      <span className="age-group">{item.age}</span>
                      <span className="standard">Development Standard: {item.standard}</span>
                    </div>
                    <div className="milestone-content">
                      <p className="milestone-text">{item.item}</p>
                      <div className="milestone-options">
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="2"
                            checked={formData.socialEmotional[item.id] === 2}
                            onChange={(e) => handleAssessmentChange('socialEmotional', item.id, parseInt(e.target.value))}
                          />
                          <span>完全掌握 (2分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="1"
                            checked={formData.socialEmotional[item.id] === 1}
                            onChange={(e) => handleAssessmentChange('socialEmotional', item.id, parseInt(e.target.value))}
                          />
                          <span>部分掌握 (1分)</span>
                        </label>
                        <label className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value="0"
                            checked={formData.socialEmotional[item.id] === 0}
                            onChange={(e) => handleAssessmentChange('socialEmotional', item.id, parseInt(e.target.value))}
                          />
                          <span>尚未掌握 (0分)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        return (
          <div className="step-content">
            <h2>社交能力评估</h2>
            <p>请根据孩子的社交表现进行评分</p>
            
            <div className="assessment-section">
              {assessment4to6.socialSkills.map((item) => (
                <div key={item.id} className="assessment-item">
                  <div className="assessment-header">
                    <span className="age-ref">年龄参考: {item.ageRef}</span>
                  </div>
                  <div className="assessment-content">
                    <p className="assessment-text">{item.item}</p>
                    <div className="assessment-options">
                      {[5, 4, 3, 2, 1].map(score => (
                        <label key={score} className="radio-option">
                          <input
                            type="radio"
                            name={item.id}
                            value={score}
                            checked={formData.socialEmotional[item.id] === score}
                            onChange={(e) => handleAssessmentChange('socialEmotional', item.id, parseInt(e.target.value))}
                          />
                          <span>{score}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        if (ageGroup === '0-3') {
          // 强制使用0-3岁的游戏配置
          const gamesFor03 = [
            { 
              id: 'spot_difference_03', 
              name: '找不同', 
              description: '仔细观察图片，找出不同的地方，锻炼观察力',
              url: 'https://toytheater.com/spot-the-difference/',
              type: 'iframe',
              icon: 'fas fa-eye'
            },
            { 
              id: 'color_recognition_03', 
              name: '颜色识别', 
              description: '学习识别基本颜色，培养色彩感知能力',
              url: 'https://www.abcya.com/games/colors',
              type: 'iframe',
              icon: 'fas fa-palette'
            },
            { 
              id: 'shape_recognition_03', 
              name: '形状识别', 
              description: '认识基本几何形状，发展空间思维',
              url: 'https://www.abcya.com/games/shapes',
              type: 'iframe',
              icon: 'fas fa-shapes'
            },
            { 
              id: 'matching_game_03', 
              name: '找相同', 
              description: '找出相同的物品，培养视觉识别能力',
              url: 'https://toytheater.com/matching/',
              type: 'iframe',
              icon: 'fas fa-search'
            }
          ];
          
          return (
            <div className="step-content">
              <h2>互动游戏评估</h2>
              <p>现在让我们通过一些有趣的游戏来评估孩子的发展水平</p>
              
              <div className="interactive-games">
                {gamesFor03.map((game) => (
                  <div key={game.id} className="game-card">
                    <div className="game-icon">
                      <i className={game.icon || "fas fa-gamepad"}></i>
                    </div>
                    <h3>{game.name}</h3>
                    <p>{game.description}</p>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setShowInteractiveTest(true);
                        setSelectedGame(game);
                      }}
                    >
                      Start Game
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="game-note">
                <i className="fas fa-info-circle"></i>
                <p>Game assessment will help us understand your child's development level from different perspectives. Please let your child complete it in a relaxed and pleasant atmosphere.</p>
              </div>
            </div>
          );
        }
        
        return (
          <div className="step-content">
            <h2>互动游戏评估</h2>
            <p>现在让我们通过一些有趣的游戏来评估孩子的发展水平</p>
            
            <div className="interactive-games">
              {interactiveGames[ageGroup]?.map((game) => (
                <div key={game.id} className="game-card">
                  <div className="game-icon">
                    <i className="fas fa-gamepad"></i>
                  </div>
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowInteractiveTest(true);
                      setSelectedGame(game);
                    }}
                  >
                    Start Game
                  </button>
                </div>
              ))}
            </div>
            
            <div className="game-note">
              <i className="fas fa-info-circle"></i>
              <p>游戏评估将帮助我们从不同角度了解孩子的发展水平，请让孩子在轻松愉快的氛围中完成。</p>
            </div>
          </div>
        );

      case 6:
        if (ageGroup === '0-3') {
          return (
            <div className="step-content">
              <h2>Parent Observations & Recommendations</h2>
              <p>Please share your observations and concerns about your child</p>
              
              <div className="form-group">
                <label className="form-label">Child's Strengths</label>
                <textarea
                  className="form-textarea"
                  value={formData.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  placeholder="Please describe areas where your child excels..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">关注的问题</label>
                <textarea
                  className="form-textarea"
                  value={formData.concerns}
                  onChange={(e) => handleInputChange('concerns', e.target.value)}
                  placeholder="Please describe concerns or areas where help is needed..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">其他观察</label>
                <textarea
                  className="form-textarea"
                  value={formData.parentObservations}
                  onChange={(e) => handleInputChange('parentObservations', e.target.value)}
                  placeholder="Please share other observations or thoughts..."
                  rows="4"
                />
              </div>
            </div>
          );
        }
        
        if (ageGroup === '4-6') {
          return (
            <div className="step-content">
              <h2>Parent Observations & Recommendations</h2>
              <p>Please share your observations and concerns about your child</p>
              
              <div className="form-group">
                <label className="form-label">Child's Strengths</label>
                <textarea
                  className="form-textarea"
                  value={formData.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  placeholder="Please describe areas where your child excels..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">关注的问题</label>
                <textarea
                  className="form-textarea"
                  value={formData.concerns}
                  onChange={(e) => handleInputChange('concerns', e.target.value)}
                  placeholder="Please describe concerns or areas where help is needed..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">其他观察</label>
                <textarea
                  className="form-textarea"
                  value={formData.parentObservations}
                  onChange={(e) => handleInputChange('parentObservations', e.target.value)}
                  placeholder="Please share other observations or thoughts..."
                  rows="4"
                />
              </div>
            </div>
          );
        }
        
        return (
          <div className="step-content">
            <h2>互动游戏评估</h2>
            <p>现在让我们通过一些有趣的游戏来评估孩子的发展水平</p>
            
            <div className="interactive-games">
              {interactiveGames[ageGroup]?.map((game) => (
                <div key={game.id} className="game-card">
                  <div className="game-icon">
                    <i className="fas fa-gamepad"></i>
                  </div>
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setShowInteractiveTest(true);
                      setSelectedGame(game);
                    }}
                  >
                    Start Game
                  </button>
                </div>
              ))}
            </div>
            
            <div className="game-note">
              <i className="fas fa-info-circle"></i>
              <p>游戏评估将帮助我们从不同角度了解孩子的发展水平，请让孩子在轻松愉快的氛围中完成。</p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="step-content">
            <h2>家长观察与建议</h2>
            <p>请分享您对孩子的观察和关注点</p>
            
            <div className="form-group">
              <label className="form-label">孩子的优势表现</label>
              <textarea
                className="form-textarea"
                value={formData.strengths}
                onChange={(e) => handleInputChange('strengths', e.target.value)}
                placeholder="请描述孩子在哪些方面表现突出..."
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">关注的问题</label>
              <textarea
                className="form-textarea"
                value={formData.concerns}
                onChange={(e) => handleInputChange('concerns', e.target.value)}
                placeholder="请描述您关注的问题或需要帮助的方面..."
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">其他观察</label>
              <textarea
                className="form-textarea"
                value={formData.parentObservations}
                onChange={(e) => handleInputChange('parentObservations', e.target.value)}
                placeholder="请分享其他观察或想法..."
                rows="4"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // 如果显示年龄适应性游戏，渲染游戏组件
  if (showAgeAdaptiveGame) {
    return (
      <div className="assessment-page">
        <nav className="assessment-nav">
          <div className="nav-container">
            <div className="nav-logo">
              <i className="fas fa-heart"></i>
              <span>MayCare</span>
            </div>
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
              <span className="progress-text">年龄适应性游戏</span>
            </div>
          </div>
        </nav>

        <main className="assessment-main">
          <div className="container">
            <AgeAdaptiveGame 
              childAge={childAge} 
              onComplete={handleAgeAdaptiveGameComplete}
            />
          </div>
        </main>
      </div>
    );
  }

  // 如果显示互动测试，渲染测试组件
  if (showInteractiveTest) {
    const renderGameComponent = () => {
      const ageGroup = getAgeGroup(childAge);
      
      // 如果是0-3岁且没有选择具体游戏，显示游戏选择界面
      if (ageGroup === '0-3' && !selectedGame) {
        const gamesFor03 = [
          { 
            id: 'spot_difference_03', 
            name: '找不同', 
            description: '仔细观察图片，找出不同的地方，锻炼观察力',
            url: 'https://toytheater.com/spot-the-difference/',
            type: 'iframe',
            icon: 'fas fa-eye'
          },
          { 
            id: 'color_recognition_03', 
            name: '颜色识别', 
            description: '学习识别基本颜色，培养色彩感知能力',
            url: 'https://www.abcya.com/games/colors',
            type: 'iframe',
            icon: 'fas fa-palette'
          },
          { 
            id: 'shape_recognition_03', 
            name: '形状识别', 
            description: '认识基本几何形状，发展空间思维',
            url: 'https://www.abcya.com/games/shapes',
            type: 'iframe',
            icon: 'fas fa-shapes'
          },
          { 
            id: 'matching_game_03', 
            name: '找相同', 
            description: '找出相同的物品，培养视觉识别能力',
            url: 'https://toytheater.com/matching/',
            type: 'iframe',
            icon: 'fas fa-search'
          }
        ];
        
        return (
          <div className="game-selection-container">
            <h2>选择游戏</h2>
            <p>请为0-3岁的孩子选择一个适合的游戏</p>
            
            <div className="interactive-games">
              {gamesFor03.map((game) => (
                <div key={game.id} className="game-card">
                  <div className="game-icon">
                    <i className={game.icon}></i>
                  </div>
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedGame(game);
                    }}
                  >
                    Start Game
                  </button>
                </div>
              ))}
            </div>
            
            <div className="game-note">
              <i className="fas fa-info-circle"></i>
              <p>After completing the game, you will proceed to the basic information section</p>
            </div>
            
            <div className="game-controls">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setShowInteractiveTest(false);
                  setSelectedGame(null);
                  setCurrentStep(0);
                }}
              >
                Back to Mode Selection
              </button>
            </div>
          </div>
        );
      }
      
      if (!selectedGame) return null;
      
      switch (selectedGame.type) {
        case 'iframe':
          return (
            <div className="game-container">
              <h2>{selectedGame.name}</h2>
              <p>{selectedGame.description}</p>
              <div className="game-frame-container">
                <iframe
                  src={selectedGame.url}
                  title={selectedGame.name}
                  className="game-iframe"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
                <div className="game-controls">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowInteractiveTest(false);
                      setSelectedGame(null);
                      // 模拟游戏完成
                      handleInteractiveTestComplete({
                        gameType: selectedGame.id,
                        score: Math.floor(Math.random() * 30) + 70, // 70-100随机分数
                        time: Math.floor(Math.random() * 120) + 60, // 60-180秒随机时间
                        accuracy: (Math.random() * 0.3) + 0.7 // 0.7-1.0随机准确率
                      });
                    }}
                  >
                    Complete Game
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setShowInteractiveTest(false);
                      setSelectedGame(null);
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          );
          
        case 'external':
          return (
            <div className="game-container">
              <h2>{selectedGame.name}</h2>
              <p>{selectedGame.description}</p>
              <div className="external-game-info">
                <div className="external-game-icon">
                  <i className="fas fa-external-link-alt"></i>
                </div>
                <h3>外部游戏</h3>
                <p>这个游戏将在新窗口中打开</p>
                <div className="external-game-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      window.open(selectedGame.url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    在新窗口打开游戏
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setShowInteractiveTest(false);
                      setSelectedGame(null);
                      // 模拟游戏完成
                      handleInteractiveTestComplete({
                        gameType: selectedGame.id,
                        score: Math.floor(Math.random() * 30) + 70,
                        time: Math.floor(Math.random() * 120) + 60,
                        accuracy: (Math.random() * 0.3) + 0.7
                      });
                    }}
                  >
                    Complete Game
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={() => {
                      setShowInteractiveTest(false);
                      setSelectedGame(null);
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          );
          
        case 'internal':
          if (selectedGame.id === 'schulte_test') {
            return <SchulteTest onComplete={handleInteractiveTestComplete} />;
          }
          return (
            <div className="game-container">
              <h2>{selectedGame.name}</h2>
              <p>{selectedGame.description}</p>
              <div className="game-placeholder">
                <i className="fas fa-gamepad"></i>
                <p>{selectedGame.name}即将上线</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowInteractiveTest(false);
                    setSelectedGame(null);
                    handleInteractiveTestComplete({
                      gameType: selectedGame.id,
                      score: Math.floor(Math.random() * 30) + 70,
                      time: Math.floor(Math.random() * 120) + 60,
                      accuracy: (Math.random() * 0.3) + 0.7
                    });
                  }}
                >
                  Complete Game
                </button>
              </div>
            </div>
          );
          
        default:
          return (
            <div className="game-container">
              <h2>{selectedGame.name}</h2>
              <p>{selectedGame.description}</p>
              <div className="game-placeholder">
                <i className="fas fa-gamepad"></i>
                <p>{selectedGame.name}即将上线</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowInteractiveTest(false);
                    setSelectedGame(null);
                    handleInteractiveTestComplete({
                      gameType: selectedGame.id,
                      score: Math.floor(Math.random() * 30) + 70,
                      time: Math.floor(Math.random() * 120) + 60,
                      accuracy: (Math.random() * 0.3) + 0.7
                    });
                  }}
                >
                  Complete Game
                </button>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="assessment-page">
        <nav className="assessment-nav">
          <div className="nav-container">
            <div className="nav-logo">
              <i className="fas fa-heart"></i>
              <span>MayCare</span>
            </div>
            <div className="progress-indicator">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }}></div>
              </div>
              <span className="progress-text">
                {selectedGame ? selectedGame.name : '互动游戏'}
              </span>
            </div>
          </div>
        </nav>

        <main className="assessment-main">
          <div className="container">
            {renderGameComponent()}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="assessment-page">
      <nav className="assessment-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <i className="fas fa-heart"></i>
            <span>MayCare</span>
          </div>
          <div className="progress-indicator">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentStep - 1) / (getMaxSteps() - 1)) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {currentStep === 0 ? 'Select Assessment Mode' : `Step ${currentStep} of ${getMaxSteps()}`}
            </span>
          </div>
        </div>
      </nav>

      <main className="assessment-main">
        <div className="container">
          <div className="assessment-card">
            {renderStep()}
            
            <div className="step-navigation">
              <button className="btn btn-outline" onClick={() => {
                if (window.confirm('Are you sure you want to return to the homepage? Current progress will be lost.')) {
                  window.location.href = '/';
                }
              }}>
                <i className="fas fa-home"></i>
                Back to Home
              </button>
              
              {currentStep > 0 && (
                <button className="btn btn-outline" onClick={prevStep}>
                  <i className="fas fa-arrow-left"></i>
                  上一步
                </button>
              )}
              
              {currentStep < getMaxSteps() && (
                <button className="btn btn-primary" onClick={nextStep}>
                  Next Step
                  <i className="fas fa-arrow-right"></i>
                </button>
              )}
              
              {currentStep === getMaxSteps() && (
                <button className="btn btn-primary" onClick={handleSubmit}>
                  <i className="fas fa-paper-plane"></i>
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssessmentPage; 