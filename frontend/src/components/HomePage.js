import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser, useClerk } from '@clerk/clerk-react';
import { useLanguage } from '../utils/i18n';
import { api } from '../utils/apiClient';
import { resolveTrainingTarget, goToTrainingTarget } from '../utils/trainingNav';
import { toast } from '../utils/toast';
import EducationalDisclaimer from './EducationalDisclaimer';
import MvpOnboarding from './MvpOnboarding';
import './HomePage.css';

const MVP_ONBOARD_KEY = 'mvp_onboarding_done';

const HomePage = () => {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded: authLoaded, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { t, toggleLanguage, language } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [trainingNavLoading, setTrainingNavLoading] = useState(false);
  const demoLogoTapsRef = useRef(0);
  const demoLogoTapTimerRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isSignedIn && !localStorage.getItem(MVP_ONBOARD_KEY)) {
      setShowOnboarding(true);
    }
    if (!isSignedIn) {
      setShowOnboarding(false);
    }
  }, [isSignedIn]);

  useEffect(
    () => () => {
      if (demoLogoTapTimerRef.current) window.clearTimeout(demoLogoTapTimerRef.current);
    },
    []
  );

  const loadDemoChildAndAssessment = async () => {
    if (!isSignedIn) {
      window.alert('Please log in first — the demo report opens on a protected page.');
      navigate('/sign-in', { state: { from: { pathname: '/result' } } });
      return;
    }
    const userId = user?.id;
    const submissionData = {
      childName: 'Demo Child',
      gender: '',
      birthDate: { year: 2020, month: 3, day: 15 },
      assessmentDate: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
      },
      assessor: 'Demo',
      childAge: 5,
      assessmentMode: 'mixed',
      ageGroup: '4-6',
      motorSkills: { grossMotor: {}, fineMotor: {} },
      cognitiveSkills: { cog_4y: 3, cog_5y: 3, cog_6y: 2 },
      languageSkills: { lang_4y: 3, lang_5y: 3, lang_6y: 2 },
      socialEmotional: { social_4y: 3, social_5y: 2, social_6y: 3 },
      dailyLiving: {},
      interactiveResults: {},
      parentObservations:
        'Teachers note attention drifts during circle time. 在圆圈活动时容易分心，但一对一指令完成度较好。',
      concerns: 'Homework takes longer than peers; sometimes avoids writing. 作业耗时偏长，偶尔会逃避书写任务。',
      strengths:
        'Curious about science topics; two close friends at school. 对科学话题很好奇，在校有两位要好的同伴。',
      childTestResults: {
        performance: 'good',
        comprehensiveAssessment: { totalScore: 72 },
      },
      userId: userId || undefined,
    };
    try {
      setDemoLoading(true);
      const response = await api.analyzeAssessment(submissionData);
      if (response.data?.success) {
        sessionStorage.setItem('assessmentData', JSON.stringify(submissionData));
        sessionStorage.setItem('assessmentResult', JSON.stringify(response.data));
        navigate('/result');
      } else {
        window.alert('Demo analysis failed — try again when the API is reachable.');
      }
    } catch (e) {
      console.error(e);
      window.alert('Demo analysis failed — check that the backend is running on port 8080.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleNavLogoSecretDemo = () => {
    if (demoLogoTapTimerRef.current) window.clearTimeout(demoLogoTapTimerRef.current);
    demoLogoTapsRef.current += 1;
    demoLogoTapTimerRef.current = window.setTimeout(() => {
      demoLogoTapsRef.current = 0;
    }, 900);
    if (demoLogoTapsRef.current >= 3) {
      demoLogoTapsRef.current = 0;
      window.clearTimeout(demoLogoTapTimerRef.current);
      loadDemoChildAndAssessment();
    }
  };

  const handleContinueTraining = async () => {
    if (!authLoaded) return;
    if (!isSignedIn) {
      navigate('/sign-in', { state: { from: { pathname: '/onboard-child' } } });
      return;
    }
    setTrainingNavLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        toast.error(
          language === 'zh'
            ? '登录尚未就绪，请稍后再试。'
            : 'Session not ready yet — please try again in a moment.'
        );
        return;
      }
      const target = await resolveTrainingTarget(api);
      goToTrainingTarget(navigate, target);
    } catch (e) {
      console.error(e);
      toast.error(
        language === 'zh'
          ? '无法加载训练数据，进入孩子档案设置。'
          : 'Could not load training data — opening child setup.'
      );
      navigate('/onboard-child');
    } finally {
      setTrainingNavLoading(false);
    }
  };

  const handleLogin = () => {
    navigate('/sign-in');
  };

  const handleLogout = async () => {
    if (!window.confirm(t('logoutConfirm'))) return;
    sessionStorage.removeItem('assessmentData');
    sessionStorage.removeItem('assessmentResult');
    await signOut({ redirectUrl: '/' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="homepage">
      {showOnboarding && <MvpOnboarding onDone={() => setShowOnboarding(false)} />}
      {demoLoading && (
        <div className="home-demo-loading-overlay" role="status" aria-live="polite">
          <p>Loading demo assessment…</p>
        </div>
      )}
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <button
            type="button"
            className="nav-logo nav-logo--demo-trigger"
            onClick={handleNavLogoSecretDemo}
            title="Nature Journal"
            aria-label="Home"
          >
            <i className="fas fa-heart"></i>
            <span>Nature Journal</span>
          </button>
          <ul className="nav-menu">
            <li><a href="#home" onClick={() => scrollToSection('home')}>{t('home')}</a></li>
            <li><a href="#ai-trust" onClick={() => scrollToSection('ai-trust')}>{t('ai')}</a></li>
            <li><a href="#services" onClick={() => scrollToSection('services')}>{t('services')}</a></li>
            <li><a href="#team" onClick={() => scrollToSection('team')}>{t('team')}</a></li>
            <li><a href="#resources" onClick={() => scrollToSection('resources')}>{t('resources')}</a></li>
            <li><a href="#support" onClick={() => scrollToSection('support')}>{t('support')}</a></li>
          </ul>
          <div className="nav-actions">
            <button 
              className="btn btn-outline language-switch" 
              onClick={toggleLanguage}
              title={language === 'en' ? t('switchToChineseTitle') : t('switchToEnglishTitle')}
            >
              <i className="fas fa-language"></i>
              {language === 'en' ? t('switchToChinese') : t('switchToEnglish')}
            </button>
            {isSignedIn ? (
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleContinueTraining}
              disabled={trainingNavLoading || (isSignedIn && !authLoaded)}
            >
              {isSignedIn ? (
                <>
                  <i className="fas fa-play-circle"></i>
                  {trainingNavLoading ? t('loading') : t('continueTraining')}
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
            <EducationalDisclaimer compact />
            <h1 className="hero-title">
              {t('heroTitleLine1')} 
              <span className="gradient-text"> {t('heroTitleLine2')}</span>
            </h1>
            <p className="hero-description">
              {t('heroDescription')}
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">{t('learningGuides')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">7-Day</span>
                <span className="stat-label">{t('improvementSnapshots')}</span>
              </div>
            </div>
            <div className="hero-buttons">
              <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={handleContinueTraining}
                disabled={trainingNavLoading || (isSignedIn && !authLoaded)}
              >
                <i className="fas fa-play-circle"></i>
                {trainingNavLoading
                  ? t('loading')
                  : isSignedIn
                    ? t('continueTraining')
                    : t('startTraining')}
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
              <h3>{t('progressFocus')}</h3>
              <div className="mini-chart chart-attention">
                <span className="chart-label">{t('attentionLabel')}</span>
                <span className="chart-value">+18%</span>
              </div>
              <div className="mini-chart chart-cognition">
                <span className="chart-label">{t('cognitionLabel')}</span>
                <span className="chart-value">+22%</span>
              </div>
              <p>{t('progressFocusDescription')}</p>
            </div>
            <div className="insight-card">
              <h3>{t('dailyCheer')}</h3>
              <p className="insight-quote">
                "{t('dailyCheerQuote')}"
              </p>
              <div className="insight-badges">
                <span>{t('aiPositiveFeedback')}</span>
                <span>{t('dailyPositiveComment')}</span>
              </div>
            </div>
            <div className="insight-card">
              <h3>{t('goalTracker')}</h3>
              <ul>
                <li>{t('todayTrainingArea')}</li>
                <li>{t('trainingExpectationExample')}</li>
                <li>{t('parentWishExample')}</li>
              </ul>
              <p>{t('goalTrackerDescription')}</p>
            </div>
            <div className="insight-card">
              <h3>{t('familyRhythm')}</h3>
              <p>{t('familyRhythmDescription')}</p>
              <div className="time-tracker">
                <span>{t('todayCompanionship')}</span>
                <span>{t('independentPractice')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Trust Section */}
      <section id="ai-trust" className="ai-trust-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('whyTrustAI')}</h2>
            <p>{t('whyTrustAIDescription')}</p>
          </div>
          <div className="ai-trust-grid">
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>{t('dataPrivacy')}</h3>
              <p>{t('dataPrivacyDescription')}</p>
              <ul className="trust-features">
                <li>{t('endToEndEncryption')}</li>
                <li>{t('gdprCompliant')}</li>
                <li>{t('noDataSharing')}</li>
                <li>{t('secureCloud')}</li>
              </ul>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>{t('advancedAI')}</h3>
              <p>{t('advancedAIDescription')}</p>
              <ul className="trust-features">
                <li>{t('evidenceBased')}</li>
                <li>{t('continuousLearning')}</li>
                <li>{t('multiDisciplinary')}</li>
                <li>{t('regularValidation')}</li>
              </ul>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>{t('humanOversight')}</h3>
              <p>{t('humanOversightDescription')}</p>
              <ul className="trust-features">
                <li>{t('learnerReview')}</li>
                <li>{t('qualityAssurance')}</li>
                <li>{t('regularAudits')}</li>
                <li>{t('userFeedback')}</li>
              </ul>
            </div>
            <div className="trust-card">
              <div className="trust-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>{t('provenResults')}</h3>
              <p>{t('provenResultsDescription')}</p>
              <ul className="trust-features">
                <li>{t('accuracyRate')}</li>
                <li>{t('positiveFeedback')}</li>
                <li>{t('measurableImprovements')}</li>
                <li>{t('ongoingOptimization')}</li>
              </ul>
            </div>
          </div>
          <div className="ai-transparency">
            <h3>{t('transparencyCommitment')}</h3>
            <p>{t('transparencyDescription')}</p>
            <div className="transparency-features">
              <div className="transparency-feature">
                <i className="fas fa-eye"></i>
                <span>{t('clearExplanations')}</span>
              </div>
              <div className="transparency-feature">
                <i className="fas fa-download"></i>
                <span>{t('downloadData')}</span>
              </div>
              <div className="transparency-feature">
                <i className="fas fa-edit"></i>
                <span>{t('modifyInfo')}</span>
              </div>
              <div className="transparency-feature">
                <i className="fas fa-question-circle"></i>
                <span>{t('askQuestions')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('comprehensiveSupport')}</h2>
            <p>{t('comprehensiveSupportDescription')}</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h3>{t('specialEducationTeachers')}</h3>
              <p>{t('specialEducationDescription')}</p>
              <ul className="service-features">
                <li>{t('individualizedPlans')}</li>
                <li>{t('multiSensory')}</li>
                <li>{t('progressMonitoring')}</li>
                <li>{t('parentTeacherCollab')}</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>{t('occupationalTherapists')}</h3>
              <p>{t('occupationalDescription')}</p>
              <ul className="service-features">
                <li>{t('sensoryIntegration')}</li>
                <li>{t('motorDevelopment')}</li>
                <li>{t('dailyLivingSkills')}</li>
                <li>{t('adaptiveEquipment')}</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>{t('speechTherapists')}</h3>
              <p>{t('speechDescription')}</p>
              <ul className="service-features">
                <li>{t('communicationSkills')}</li>
                <li>{t('socialInteraction')}</li>
                <li>{t('alternativeCommunication')}</li>
                <li>{t('familyCommunication')}</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-robot"></i>
              </div>
              <h3>{t('aiPoweredAnalysis')}</h3>
              <p>{t('aiAnalysisDescription')}</p>
              <ul className="service-features">
                <li>{t('behavioralAssessment')}</li>
                <li>{t('personalizedRecommendations')}</li>
                <li>{t('dataDrivenInsights')}</li>
                <li>{t('continuousAdaptation')}</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-home"></i>
              </div>
              <h3>{t('familySupport')}</h3>
              <p>{t('familySupportDescription')}</p>
              <ul className="service-features">
                <li>{t('parentEducation')}</li>
                <li>{t('resourceCoordination')}</li>
                <li>{t('supportGroups')}</li>
                <li>{t('crisisSupport')}</li>
              </ul>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>{t('careCoordination')}</h3>
              <p>{t('careCoordinationDescription')}</p>
              <ul className="service-features">
                <li>{t('emergencySupport')}</li>
                <li>{t('careTeamCoordination')}</li>
                <li>{t('progressTracking')}</li>
                <li>{t('familyPlatform')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team-section">
        <div className="container">
            <div className="section-header">
            <h2>{t('meetOurTeam')}</h2>
            <p>{language === 'zh' ? '以学习者的角度陪伴孩子成长' : 'Supporting every child\'s learning journey'}</p>
          </div>
          <div className="team-grid team-grid-single">
            <div className="team-member">
              <div className="member-info">
                <h3>{language === 'zh' ? '云美老师' : 'May'}</h3>
                <span className="member-role">{language === 'zh' ? '学习教练' : 'Learning Coach'}</span>
                <p>{language === 'zh' ? '擅长把复杂技能拆成小游戏，引导孩子在快乐中掌握核心能力。' : 'Expert at breaking complex skills into fun games, guiding children to master core abilities through joy.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="support-section">
        <div className="container">
          <div className="support-content">
            <div className="support-info">
              <h2>{t('readyToStart')}</h2>
              <p>{t('readyToStartDescription')}</p>
              <div className="support-features">
                <div className="support-feature">
                  <i className="fas fa-clock"></i>
                  <span>{t('supportAvailable')}</span>
                </div>
                <div className="support-feature">
                  <i className="fas fa-shield-alt"></i>
                  <span>{t('confidentialSecure')}</span>
                </div>
                <div className="support-feature">
                  <i className="fas fa-heart"></i>
                  <span>{t('compassionateCare')}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-large"
                onClick={handleContinueTraining}
                disabled={trainingNavLoading || (isSignedIn && !authLoaded)}
              >
                <i className="fas fa-hands-helping"></i>
                {trainingNavLoading ? t('loading') : t('beginJourney')}
              </button>
            </div>
            <div className="contact-info">
              <h3>{t('contactUs')}</h3>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <div>
                  <strong>{t('supportLine')}</strong>
                  <span>+13142976225</span>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <strong>{t('emailSupport')}</strong>
                  <span>yunmei52222@gmail.com</span>
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
            <h2>{t('professionalStandards')}</h2>
            <p className="references-intro">
              {t('standardsIntro')}
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
                    {t('viewStandards')}
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
                    {t('viewMilestones')}
                  </a>
                </div>
              </div>
            </div>
            
            <div className="references-note">
              <i className="fas fa-info-circle"></i>
              <p>
                {t('assessmentNote')}
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
                <span>Nature Journal</span>
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
              <h4>{t('services')}</h4>
              <ul>
                <li><a href="#services">{t('specialEducation')}</a></li>
                <li><a href="#services">{t('occupationalTherapy')}</a></li>
                <li><a href="#services">{t('speechTherapy')}</a></li>
                <li><a href="#services">{t('aiAnalysis')}</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t('resources')}</h4>
              <ul>
                <li><a href="#resources">{t('educationalMaterials')}</a></li>
                <li><a href="#resources">{t('supportGroupsTitle')}</a></li>
                <li><a href="#resources">{t('workshops')}</a></li>
                <li><a href="#resources">{t('familyResources')}</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t('supportTitle')}</h4>
              <ul>
                <li><a href="#support">{t('helpline')}</a></li>
                <li><a href="#support">{t('emergencySupportTitle')}</a></li>
                <li><a href="#support">{t('crisisIntervention')}</a></li>
                <li><a href="#support">{t('familyGuidance')}</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>{t('contactInfo')}</h4>
              <p><i className="fas fa-envelope"></i> hello@yunmeibaby.com</p>
              <p><i className="fas fa-phone"></i> +86 400-8899-520</p>
              <p><i className="fas fa-map-marker-alt"></i> {t('visitAddress')}</p>
              <p><i className="fas fa-baby"></i> {t('natureJournal')}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Nature Journal. {t('allRightsReserved')}</p>
            <div className="footer-links">
              <a href="#privacy">{t('privacyPolicy')}</a>
              <a href="#terms">{t('termsOfService')}</a>
              <a href="#accessibility">{t('accessibility')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 