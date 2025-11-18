import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/i18n';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Check login status
    const loginStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loginStatus);
  }, []);

  const handleContinueTraining = () => {
    if (isLoggedIn) {
      navigate('/progress');
    } else {
      navigate('/login', { state: { from: { pathname: '/progress' } } });
    }
  };

  const handleLogin = () => {
    navigate('/login');
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
      setIsLoggedIn(false);
      navigate('/');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <i className="fas fa-heart"></i>
            <span>MayCare</span>
          </div>
          <ul className="nav-menu">
            <li><a href="#home" onClick={() => scrollToSection('home')}>{t('home')}</a></li>
            <li><a href="#ai-trust" onClick={() => scrollToSection('ai-trust')}>{t('ai')}</a></li>
            <li><a href="#services" onClick={() => scrollToSection('services')}>{t('services')}</a></li>
            <li><a href="#team" onClick={() => scrollToSection('team')}>{t('team')}</a></li>
            <li><a href="#resources" onClick={() => scrollToSection('resources')}>{t('resources')}</a></li>
            <li><a href="#support" onClick={() => scrollToSection('support')}>{t('support')}</a></li>
            <li><a href="#contact" onClick={() => scrollToSection('contact')}>{t('contact')}</a></li>
          </ul>
          <div className="nav-actions">
            <button 
              className="btn btn-outline language-switch" 
              onClick={toggleLanguage}
              title={language === 'en' ? 'Switch to Chinese' : 'Switch to English'}
            >
              <i className="fas fa-language"></i>
              {language === 'en' ? t('switchToChinese') : t('switchToEnglish')}
            </button>
            {isLoggedIn ? (
              <>
                <button className="btn btn-outline" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  {t('logout')}
                </button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={handleLogin}>
                <i className="fas fa-sign-in-alt"></i>
                {t('login')}
              </button>
            )}
            <button className="btn btn-primary" onClick={handleContinueTraining}>
              {isLoggedIn ? (
                <>
                  <i className="fas fa-play-circle"></i>
                  {t('continueTraining')}
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  {t('loginToStart')}
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className={`hero-section ${isLoaded ? 'fade-in-up' : ''}`}>
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              {t('heroTitleLine1')} 
              <span className="gradient-text"> {t('heroTitleLine2')}</span>
            </h1>
            <p className="hero-description">
              {t('heroDescription')}
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">500+</span>
                <span className="stat-label">{t('familiesSupported')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">{t('learningGuides')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">7-Day</span>
                <span className="stat-label">{t('improvementSnapshots')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">98%</span>
                <span className="stat-label">{t('positiveFeedback')}</span>
              </div>
            </div>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={handleContinueTraining}>
                <i className="fas fa-play-circle"></i>
                {isLoggedIn ? t('continueTraining') : t('startTraining')}
              </button>
              <button className="btn btn-secondary btn-large" onClick={() => scrollToSection('team')}>
                <i className="fas fa-users"></i>
                {t('meetOurTeam')}
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="support-network">
              <div className="network-center">
                <i className="fas fa-child"></i>
                <span>{t('child')}</span>
              </div>
              <div className="network-node teacher">
                <i className="fas fa-chalkboard-teacher"></i>
                <span>{t('teacher')}</span>
              </div>
              <div className="network-node therapist">
                <i className="fas fa-brain"></i>
                <span>{t('therapist')}</span>
              </div>
              <div className="network-node parent">
                <i className="fas fa-home"></i>
                <span>{t('parent')}</span>
              </div>
              <div className="network-node learner">
                <i className="fas fa-smile-beam"></i>
                <span>{t('learner')}</span>
              </div>
              <div className="connection-lines"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Insight Section */}
      <section className="insight-section" id="home">
        <div className="container">
          <div className="insight-grid">
            <div className="insight-card">
              <h3>Progress Focus 进步亮点</h3>
              <div className="mini-chart chart-attention">
                <span className="chart-label">Attention 注意力</span>
                <span className="chart-value">+18%</span>
              </div>
              <div className="mini-chart chart-cognition">
                <span className="chart-label">Cognition 认知力</span>
                <span className="chart-value">+22%</span>
              </div>
              <p>系统每七天自动生成改善图表，让家长一眼看见成长轨迹。</p>
            </div>
            <div className="insight-card">
              <h3>Daily Cheer 每日鼓励</h3>
              <p className="insight-quote">
                “今天的坚持真棒！我们已经一起完成了新的挑战，继续保持笑容。”
              </p>
              <div className="insight-badges">
                <span>AI Positive Feedback</span>
                <span>每日正向评语</span>
              </div>
            </div>
            <div className="insight-card">
              <h3>Goal Tracker 训练目标看得见</h3>
              <ul>
                <li>今日训练部位：注意力 · 视觉追踪</li>
                <li>训练预期：集中 5 分钟完成拼图</li>
                <li>家长期盼：两周内提升课堂专注力</li>
              </ul>
              <p>颜色标记一目了然，帮助家长一起制定可执行的下一步。</p>
            </div>
            <div className="insight-card">
              <h3>Family Rhythm 家庭节奏</h3>
              <p>记录每日陪伴时长，系统自动调整任务难度，让家庭节奏更轻松，所有训练游戏都能在网站直接开启，无需下载。</p>
              <div className="time-tracker">
                <span>今日陪伴 45 分钟</span>
                <span>独立练习 20 分钟</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Trust Section */}
      <section id="ai-trust" className="ai-trust-section">
        <div className="container">
          <div className="section-header">
            <h2>Why You Can Trust Our AI</h2>
            <p>Our AI system is designed with transparency, accuracy, and your child's best interests in mind</p>
          </div>
          <div className="ai-trust-grid">
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Data Privacy & Security</h3>
              <p>Your child's information is protected with enterprise-grade encryption. We never share personal data with third parties and comply with all privacy regulations.</p>
              <ul className="trust-features">
                <li>End-to-end encryption</li>
                <li>GDPR & COPPA compliant</li>
                <li>No data sharing with third parties</li>
                <li>Secure cloud infrastructure</li>
              </ul>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>Advanced AI Technology</h3>
              <p>Our AI is trained on extensive educational research and behavioral science data, ensuring accurate and evidence-based recommendations.</p>
              <ul className="trust-features">
                <li>Evidence-based algorithms</li>
                <li>Continuous learning & updates</li>
                <li>Multi-disciplinary approach</li>
                <li>Regular accuracy validation</li>
              </ul>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Human Oversight · 人工监督</h3>
              <p>While AI provides analysis, our team of developers and learning guides continuously monitor and validate all recommendations. · AI提供分析，开发团队和学习引导师持续监督并验证所有建议。</p>
              <ul className="trust-features">
                <li>Learner review process · 学习者审核流程</li>
                <li>Quality assurance checks · 质量保证检查</li>
                <li>Regular system audits · 定期系统审核</li>
                <li>User feedback integration · 用户反馈整合</li>
              </ul>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Proven Results</h3>
              <p>Our AI system has helped thousands of families with personalized recommendations that show measurable improvements in learning outcomes.</p>
              <ul className="trust-features">
                <li>95% accuracy rate</li>
                <li>Positive user feedback</li>
                <li>Measurable improvements</li>
                <li>Ongoing optimization</li>
              </ul>
            </div>
          </div>
          <div className="ai-transparency">
            <h3>Transparency Commitment</h3>
            <p>We believe in complete transparency about how our AI works. You can always understand why specific recommendations are made and have full control over your data.</p>
            <div className="transparency-features">
              <div className="transparency-feature">
                <i className="fas fa-eye"></i>
                <span>Clear explanations for all recommendations</span>
              </div>
              <div className="transparency-feature">
                <i className="fas fa-download"></i>
                <span>Download your data anytime</span>
              </div>
              <div className="transparency-feature">
                <i className="fas fa-edit"></i>
                <span>Modify or delete your information</span>
              </div>
              <div className="transparency-feature">
                <i className="fas fa-question-circle"></i>
                <span>Ask questions about our AI process</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>Comprehensive Support Services</h2>
            <p>We provide a complete network of care professionals to support your child's unique needs and development</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>Special Education Teachers</h3>
              <p>Certified special education professionals who create personalized learning plans and provide one-on-one instruction tailored to your child's learning style and abilities.</p>
              <ul className="service-features">
                <li>Individualized Education Plans (IEPs)</li>
                <li>Multi-sensory learning approaches</li>
                <li>Progress monitoring and assessment</li>
                <li>Parent-teacher collaboration</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>Occupational Therapists</h3>
              <p>Licensed therapists who help children develop essential life skills, motor coordination, and sensory processing abilities for daily activities and independence.</p>
              <ul className="service-features">
                <li>Sensory integration therapy</li>
                <li>Fine and gross motor development</li>
                <li>Daily living skills training</li>
                <li>Adaptive equipment recommendations</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Speech & Language Therapists</h3>
              <p>Specialized therapists who support communication development, language skills, and social interaction abilities for children with speech and language challenges.</p>
              <ul className="service-features">
                <li>Communication skill development</li>
                <li>Social interaction training</li>
                <li>Alternative communication methods</li>
                <li>Family communication strategies</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced artificial intelligence that provides personalized educational recommendations and behavioral insights based on comprehensive data analysis.</p>
              <ul className="service-features">
                <li>Intelligent behavioral assessment</li>
                <li>Personalized learning recommendations</li>
                <li>Data-driven insights and analysis</li>
                <li>Continuous learning and adaptation</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-home"></i>
              </div>
              <h3>Family Support Specialists</h3>
              <p>Dedicated professionals who provide guidance, resources, and emotional support to families navigating the challenges of raising a special child.</p>
              <ul className="service-features">
                <li>Parent education and training</li>
                <li>Resource coordination and advocacy</li>
                <li>Support group facilitation</li>
                <li>Crisis support and intervention</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>24/7 Care Coordination</h3>
              <p>Round-the-clock support system that ensures seamless communication between all care providers and immediate response to urgent needs.</p>
              <ul className="service-features">
                <li>24/7 emergency support line</li>
                <li>Care team coordination</li>
                <li>Progress tracking and reporting</li>
                <li>Family communication platform</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Learner Stories Section */}
      <section id="resources" className="learner-stories">
        <div className="container">
          <div className="section-header">
            <h2>孩子故事 Learner Journeys</h2>
            <p>我们同样关注普通孩子，只是想把成绩再提升一点点</p>
          </div>
          <div className="stories-grid">
            <div className="story-card">
              <h3>朵朵 · 2 岁</h3>
              <p>还看不懂数字与文字，我们把“花朵拼图”拆成大色块，搭配语音提示，让她像拼拼图一样轻松完成训练。</p>
            </div>
            <div className="story-card">
              <h3>明明 · 8 岁</h3>
              <p>普通孩子，数学成绩需要加油。我们结合课堂同步题与趣味小游戏，帮助他在 7 天内提高理解速度。· Normal child, math scores need improvement. We combine classroom sync exercises with fun games to help improve comprehension in 7 days.</p>
            </div>
            <div className="story-card">
              <h3>星星 · 6 岁</h3>
              <p>家长工作繁忙，每日陪伴 30 分钟。系统把亲子合作与独立完成部分清晰拆分，孩子自信心不断增强。</p>
            </div>
            <div className="story-card">
              <h3>新技能以后</h3>
              <p>无论成果如何，AI 每天送上鼓励话语，帮助孩子建立“我可以做到”的正向信念。</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="container">
            <div className="section-header">
            <h2>Meet Our Learning Guides 学习伙伴</h2>
            <p>四位引导师，以学习者的角度陪伴孩子成长 · Four guides supporting every child's learning journey</p>
          </div>
          <div className="team-grid team-grid-aligned">
            {[
              {
                name: '云美老师',
                role: 'Learning Coach 学习教练',
                description: '擅长把复杂技能拆成小游戏，引导孩子在快乐中掌握核心能力。· Expert at breaking complex skills into fun games.',
                image: 'https://via.placeholder.com/200x200'
              },
              {
                name: 'Duan Mentor',
                role: 'Progress Designer 进步设计师',
                description: '7 天生成改善图，每一步都给出积极反馈与下一步建议。· Creates improvement charts every 7 days with positive feedback.',
                image: 'https://via.placeholder.com/200x200'
              },
              {
                name: 'Family Ally',
                role: 'Parent Ally 家庭伙伴',
                description: '帮助家长排布时间，记录陪伴时长，设置家长期盼与时间节点。· Helps parents organize time and set expectations.',
                image: 'https://via.placeholder.com/200x200'
              },
              {
                name: 'Playful Learner',
                role: 'Joy Explorer 玩乐学习者',
                description: '与孩子一起体验拼拼图、颜色游戏，让两岁宝宝也能听懂提示。· Plays puzzle and color games with toddlers.',
                image: 'https://via.placeholder.com/200x200'
              }
            ].map((member, index) => (
              <div className="team-member" key={index}>
                <div className="member-photo">
                  <img src={member.image} alt={member.name} />
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <span className="member-role">{member.role}</span>
                  <p>{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="support-section">
        <div className="container">
          <div className="support-content">
            <div className="support-info">
              <h2>Ready to Get Started?</h2>
              <p>Take the first step toward comprehensive support for your child and family. Our team is here to help you navigate this journey with care, expertise, and compassion.</p>
              <div className="support-features">
                <div className="support-feature">
                  <i className="fas fa-clock"></i>
                  <span>24/7 Support Available</span>
                </div>
                <div className="support-feature">
                  <i className="fas fa-shield-alt"></i>
                  <span>Confidential & Secure</span>
                </div>
                <div className="support-feature">
                  <i className="fas fa-heart"></i>
                  <span>Compassionate Care</span>
                </div>
              </div>
              <button className="btn btn-primary btn-large" onClick={handleContinueTraining}>
                <i className="fas fa-hands-helping"></i>
                Begin Your Journey
              </button>
            </div>
            <div className="contact-info">
              <h3>Contact Us · 联系我们</h3>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <strong>24/7 Support Line · 24小时支持热线</strong>
                  <span>+86 400-8899-520</span>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <strong>Email Support 邮件支持</strong>
                  <span>hello@yunmeibaby.com</span>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <strong>{t('visitUs') || 'Visit Us'}</strong>
                  <span>{t('visitAddress') || 'Yunmei Baby Hub, Shenzhen'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* References Section */}
      <section className="references-section">
        <div className="container">
          <div className="references-content">
            <h2>Professional Standards & References</h2>
            <p className="references-intro">
              Our assessment questionnaires are developed based on internationally recognized professional standards and validated developmental screening tools to ensure accuracy and reliability.
            </p>
            
            <div className="references-grid">
              <div className="reference-item">
                <div className="reference-icon">
                  <i className="fas fa-clipboard-check"></i>
                </div>
                <div className="reference-content">
                  <h3>ASQ-SE</h3>
                  <p className="reference-publisher">Brookes Publishing</p>
                  <p className="reference-description">
                    Ages & Stages Questionnaires: Social-Emotional (ASQ-SE) - A validated screening tool for identifying social-emotional development concerns in young children.
                  </p>
                </div>
              </div>
              
              <div className="reference-item">
                <div className="reference-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="reference-content">
                  <h3>BASC-3</h3>
                  <p className="reference-publisher">Pearson Assessments</p>
                  <p className="reference-description">
                    Behavior Assessment System for Children, Third Edition - Comprehensive assessment of behavioral and emotional functioning in children and adolescents.
                  </p>
                </div>
              </div>
              
              <div className="reference-item">
                <div className="reference-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <div className="reference-content">
                  <h3>WHO Child Growth Standards</h3>
                  <p className="reference-publisher">World Health Organization</p>
                  <p className="reference-description">
                    International standards for child growth and development, providing evidence-based benchmarks for monitoring child development worldwide.
                  </p>
                  <a href="https://www.who.int/childgrowth/standards/" target="_blank" rel="noopener noreferrer" className="reference-link">
                    <i className="fas fa-external-link-alt"></i>
                    View Standards
                  </a>
                </div>
              </div>
              
              <div className="reference-item">
                <div className="reference-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="reference-content">
                  <h3>CDC Developmental Milestones</h3>
                  <p className="reference-publisher">Centers for Disease Control and Prevention</p>
                  <p className="reference-description">
                    Evidence-based developmental milestones and positive parenting strategies for monitoring child development and supporting healthy growth.
                  </p>
                  <a href="https://www.cdc.gov/ncbddd/childdevelopment/positiveparenting/" target="_blank" rel="noopener noreferrer" className="reference-link">
                    <i className="fas fa-external-link-alt"></i>
                    View Milestones
                  </a>
                </div>
              </div>
            </div>
            
            <div className="references-note">
              <i className="fas fa-info-circle"></i>
              <p>
                Our assessment tools incorporate elements from these validated instruments while being adapted for digital administration and enhanced with AI-powered analysis capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <i className="fas fa-heart"></i>
                <span>MayCare</span>
              </div>
              <p>Providing comprehensive support for special children and their families through qualified professionals, compassionate care, and coordinated services.</p>
              <div className="social-links">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i></a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter"></i></a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin"></i></a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
              </div>
            </div>
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="#services">Special Education</a></li>
                <li><a href="#services">Occupational Therapy</a></li>
                <li><a href="#services">Speech Therapy</a></li>
                <li><a href="#services">AI-Powered Analysis</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#resources">Educational Materials</a></li>
                <li><a href="#resources">Support Groups</a></li>
                <li><a href="#resources">Workshops</a></li>
                <li><a href="#resources">Family Resources</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#support">24/7 Helpline</a></li>
                <li><a href="#support">Emergency Support</a></li>
                <li><a href="#support">Crisis Intervention</a></li>
                <li><a href="#support">Family Guidance</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact 联系方式</h4>
              <p><i className="fas fa-envelope"></i> hello@yunmeibaby.com</p>
              <p><i className="fas fa-phone"></i> +86 400-8899-520</p>
              <p><i className="fas fa-map-marker-alt"></i> {t('visitAddress') || 'Yunmei Baby Hub, Shenzhen'}</p>
              <p><i className="fas fa-baby"></i> MayCare Learning Station</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 MayCare. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#accessibility">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 