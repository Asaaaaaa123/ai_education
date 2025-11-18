// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeResult();
    animateScores();
    generateReport();
});

// 初始化结果页面
function initializeResult() {
    // 检查是否有评估数据
    const assessmentData = sessionStorage.getItem('assessmentData');
    if (!assessmentData) {
        // 如果没有数据，重定向到首页
        window.location.href = 'index.html';
        return;
    }
    
    // 解析数据
    const data = JSON.parse(assessmentData);
    
    // 显示孩子信息
    displayChildInfo(data);
    
    // 分析数据并生成报告
    analyzeData(data);
}

// 显示孩子信息
function displayChildInfo(data) {
    const childInfo = document.getElementById('childInfo');
    
    // 检查是否有AI分析结果
    const hasAiAnalysis = data.aiAnalysis;
    const formData = hasAiAnalysis ? data.formData : data;
    
    const ageMap = {
        '0': '0岁 (婴儿期)',
        '1': '1岁 (婴儿期)',
        '2': '2岁 (婴儿期)',
        '3': '3岁 (幼儿园)',
        '4': '4岁 (幼儿园)',
        '5': '5岁 (幼儿园)',
        '6': '6岁 (幼儿园)',
        '7': '7岁 (小学)',
        '8': '8岁 (小学)',
        '9': '9岁 (小学)',
        '10': '10岁 (小学)',
        '11': '11岁 (小学)',
        '12': '12岁 (小学)'
    };
    
    const schoolTypeMap = {
        'public': '公立学校',
        'private': '私立学校',
        'international': '国际学校',
        'homeschool': '在家教育'
    };
    
    const childName = hasAiAnalysis ? data.aiAnalysis.child_name : formData.childName;
    const age = hasAiAnalysis ? data.aiAnalysis.age : formData.selectedAge;
    const schoolType = formData.schoolType;
    const grade = hasAiAnalysis ? data.aiAnalysis.grade : formData.grade;
    
    childInfo.innerHTML = `
        <h3>孩子信息</h3>
        <p><strong>姓名：</strong>${childName || '未填写'}</p>
        <p><strong>年龄：</strong>${ageMap[age] || age + '岁' || '未选择'}</p>
        <p><strong>学校类型：</strong>${schoolTypeMap[schoolType] || '未选择'}</p>
        <p><strong>年级：</strong>${grade || '未选择'}</p>
        ${hasAiAnalysis ? `<p><strong>AI分析置信度：</strong>${(data.aiAnalysis.confidence * 100).toFixed(1)}%</p>` : ''}
    `;
}

// 分析数据并生成报告
function analyzeData(data) {
    // 检查是否有AI分析结果
    const hasAiAnalysis = data.aiAnalysis;
    const formData = hasAiAnalysis ? data.formData : data;
    
    if (hasAiAnalysis) {
        // 使用AI分析结果
        generateAiAnalysis(data.aiAnalysis);
    } else {
        // 使用原始分析方法
        const learningHabits = formData.learningHabits || [];
        const classroomBehavior = formData.classroomBehavior || [];
        const socialBehavior = formData.socialBehavior || [];
        
        // 生成主要问题列表
        generateMainProblems(learningHabits, classroomBehavior, socialBehavior);
        
        // 生成问题成因分析
        generateCauseAnalysis(formData);
        
        // 生成个性化建议
        generateRecommendations(formData);
    }
}

// 生成AI分析结果
function generateAiAnalysis(aiAnalysis) {
    // 显示总体评分
    const overallScore = aiAnalysis.overall_score || 0;
    const scoreElement = document.getElementById('overallScore');
    if (scoreElement) {
        scoreElement.textContent = overallScore.toFixed(1);
    }
    
    // 生成主要问题列表
    const mainProblems = document.getElementById('mainProblems');
    if (mainProblems && aiAnalysis.problems) {
        let problemsHtml = '<h3>AI识别的主要问题</h3><ul>';
        aiAnalysis.problems.forEach(problem => {
            problemsHtml += `<li>${problem}</li>`;
        });
        problemsHtml += '</ul>';
        mainProblems.innerHTML = problemsHtml;
    }
    
    // 生成解决方案
    const solutions = document.getElementById('solutions');
    if (solutions && aiAnalysis.solutions) {
        let solutionsHtml = '<h3>AI推荐的解决方案</h3><ul>';
        aiAnalysis.solutions.forEach(solution => {
            solutionsHtml += `<li>${solution}</li>`;
        });
        solutionsHtml += '</ul>';
        solutions.innerHTML = solutionsHtml;
    }
    
    // 生成个性化建议
    const recommendations = document.getElementById('recommendations');
    if (recommendations && aiAnalysis.recommendations) {
        let recommendationsHtml = '<h3>AI个性化建议</h3><ul>';
        aiAnalysis.recommendations.forEach(recommendation => {
            recommendationsHtml += `<li>${recommendation}</li>`;
        });
        recommendationsHtml += '</ul>';
        recommendations.innerHTML = recommendationsHtml;
    }
    
    // 显示AI分析信息
    const aiInfo = document.getElementById('aiInfo');
    if (aiInfo) {
        aiInfo.innerHTML = `
            <div class="ai-analysis-info">
                <h3>🤖 AI智能分析</h3>
                <p><strong>分析时间：</strong>${aiAnalysis.analysis_timestamp || '未知'}</p>
                <p><strong>置信度：</strong>${(aiAnalysis.confidence * 100).toFixed(1)}%</p>
                <p><strong>模型类型：</strong>基于CNN的深度学习模型</p>
                <p><strong>分析特点：</strong>结合文本理解和数值分析，提供个性化教育建议</p>
            </div>
        `;
    }
}

// 生成主要问题列表
function generateMainProblems(learningHabits, classroomBehavior, socialBehavior) {
    const mainProblems = document.getElementById('mainProblems');
    const problems = [];
    
    // 学习习惯问题
    if (learningHabits.includes('attention')) {
        problems.push('上课注意力不集中，容易走神');
    }
    if (learningHabits.includes('homework')) {
        problems.push('作业完成困难，拖延严重');
    }
    if (learningHabits.includes('memory')) {
        problems.push('记忆力较差，知识点容易遗忘');
    }
    if (learningHabits.includes('motivation')) {
        problems.push('学习动力不足，缺乏兴趣');
    }
    
    // 课堂行为问题
    if (classroomBehavior.includes('talking')) {
        problems.push('上课爱说话，影响课堂秩序');
    }
    if (classroomBehavior.includes('movement')) {
        problems.push('坐不住，经常离开座位');
    }
    if (classroomBehavior.includes('participation')) {
        problems.push('不愿意参与课堂互动');
    }
    
    // 社交行为问题
    if (socialBehavior.includes('friends')) {
        problems.push('朋友较少，社交能力有待提升');
    }
    if (socialBehavior.includes('communication')) {
        problems.push('沟通表达能力不足');
    }
    if (socialBehavior.includes('confidence')) {
        problems.push('在群体中缺乏自信');
    }
    
    // 如果没有检测到问题，显示默认问题
    if (problems.length === 0) {
        problems.push('学习效率有待提升');
        problems.push('需要更好的学习方法指导');
    }
    
    // 渲染问题列表
    mainProblems.innerHTML = problems.map(problem => 
        `<li>${problem}</li>`
    ).join('');
}

// 生成问题成因分析
function generateCauseAnalysis(data) {
    const causeAnalysis = document.getElementById('causeAnalysis');
    const causes = [];
    
    const learningHabits = data.learningHabits || [];
    const classroomBehavior = data.classroomBehavior || [];
    const socialBehavior = data.socialBehavior || [];
    
    // 根据问题分析成因
    if (learningHabits.includes('attention')) {
        causes.push('注意力不集中可能是由于学习环境干扰、缺乏兴趣或学习方法不当导致的。');
    }
    if (learningHabits.includes('homework')) {
        causes.push('作业拖延通常与时间管理能力差、缺乏学习计划或对任务感到困难有关。');
    }
    if (learningHabits.includes('motivation')) {
        causes.push('学习动力不足可能是由于缺乏成就感、学习内容过于困难或缺乏明确的学习目标。');
    }
    if (socialBehavior.includes('confidence')) {
        causes.push('缺乏自信可能是由于过去的失败经历、缺乏正面反馈或社交经验不足造成的。');
    }
    
    // 如果没有特定成因，提供一般性分析
    if (causes.length === 0) {
        causes.push('孩子的学习问题通常与学习方法、学习环境和心理状态密切相关。');
        causes.push('通过适当的指导和训练，这些问题是可以得到改善的。');
    }
    
    causeAnalysis.innerHTML = causes.map(cause => 
        `<p>${cause}</p>`
    ).join('');
}

// 生成个性化建议
function generateRecommendations(data) {
    const learningRecommendations = document.getElementById('learningRecommendations');
    const timeRecommendations = document.getElementById('timeRecommendations');
    const psychologyRecommendations = document.getElementById('psychologyRecommendations');
    
    const learningHabits = data.learningHabits || [];
    const classroomBehavior = data.classroomBehavior || [];
    const socialBehavior = data.socialBehavior || [];
    
    // 学习方法建议
    const learningTips = [];
    if (learningHabits.includes('attention')) {
        learningTips.push('使用番茄工作法，25分钟专注学习，5分钟休息');
        learningTips.push('创造安静的学习环境，减少干扰因素');
        learningTips.push('使用思维导图等可视化工具帮助理解');
    }
    if (learningHabits.includes('memory')) {
        learningTips.push('采用间隔重复法，定期复习学过的内容');
        learningTips.push('使用联想记忆法，将新知识与已有知识联系');
        learningTips.push('通过实践和讨论加深理解');
    }
    if (learningTips.length === 0) {
        learningTips.push('制定明确的学习目标，分步骤完成');
        learningTips.push('采用多种学习方法，找到最适合的方式');
        learningTips.push('定期总结和反思学习效果');
    }
    
    // 时间管理建议
    const timeTips = [];
    if (learningHabits.includes('homework')) {
        timeTips.push('制定详细的每日学习计划表');
        timeTips.push('使用时间管理工具，如番茄钟应用');
        timeTips.push('将大任务分解为小任务，逐步完成');
    }
    timeTips.push('建立固定的学习时间，培养习惯');
    timeTips.push('合理安排休息时间，避免过度疲劳');
    
    // 心理支持建议
    const psychologyTips = [];
    if (socialBehavior.includes('confidence')) {
        psychologyTips.push('多给予正面鼓励和肯定');
        psychologyTips.push('帮助孩子发现自己的优点和特长');
        psychologyTips.push('鼓励参与集体活动，培养社交能力');
    }
    if (learningHabits.includes('motivation')) {
        psychologyTips.push('设定可实现的小目标，逐步建立成就感');
        psychologyTips.push('将学习与兴趣结合，提高学习兴趣');
        psychologyTips.push('关注孩子的情绪变化，及时给予支持');
    }
    psychologyTips.push('保持耐心，避免过度批评');
    psychologyTips.push('与孩子建立良好的沟通渠道');
    
    // 渲染建议
    learningRecommendations.innerHTML = learningTips.map(tip => 
        `<p>• ${tip}</p>`
    ).join('');
    
    timeRecommendations.innerHTML = timeTips.map(tip => 
        `<p>• ${tip}</p>`
    ).join('');
    
    psychologyRecommendations.innerHTML = psychologyTips.map(tip => 
        `<p>• ${tip}</p>`
    ).join('');
}

// 动画显示评分
function animateScores() {
    setTimeout(() => {
        const potentialScore = document.getElementById('potentialScore');
        const habitScore = document.getElementById('habitScore');
        const socialScore = document.getElementById('socialScore');
        
        // 根据数据计算评分（这里使用模拟数据）
        const scores = {
            potential: 85,
            habit: 70,
            social: 60
        };
        
        // 动画显示评分
        animateScore(potentialScore, scores.potential);
        animateScore(habitScore, scores.habit);
        animateScore(socialScore, scores.social);
        
        // 更新评分文本
        updateScoreText(scores);
    }, 500);
}

// 动画单个评分
function animateScore(element, score) {
    let currentScore = 0;
    const increment = score / 50; // 50步完成动画
    
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= score) {
            currentScore = score;
            clearInterval(timer);
        }
        element.style.width = currentScore + '%';
    }, 20);
}

// 更新评分文本
function updateScoreText(scores) {
    const scoreTexts = document.querySelectorAll('.score-text');
    
    const getScoreLevel = (score) => {
        if (score >= 80) return '优秀';
        if (score >= 70) return '良好';
        if (score >= 60) return '一般';
        return '需要提升';
    };
    
    scoreTexts[0].textContent = getScoreLevel(scores.potential);
    scoreTexts[1].textContent = getScoreLevel(scores.habit);
    scoreTexts[2].textContent = getScoreLevel(scores.social);
}

// 生成报告
function generateReport() {
    // 这里可以添加更复杂的报告生成逻辑
    console.log('报告生成完成');
}

// 打印报告
function printReport() {
    window.print();
}

// 下载PDF报告
function downloadReport() {
    // 显示提示信息
    showMessage('PDF下载功能正在开发中，请使用打印功能保存报告。', 'info');
}

// 重新评估
function startNewAssessment() {
    if (confirm('确定要开始新的评估吗？当前报告数据将会丢失。')) {
        // 清除数据
        sessionStorage.removeItem('assessmentData');
        // 跳转到评估页面
        window.location.href = 'assessment.html';
    }
}

// 分享报告
function shareReport() {
    // 检查是否支持Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'AI EduGuide - 个性化教育报告',
            text: '查看我为孩子生成的个性化教育建议',
            url: window.location.href
        }).catch(console.error);
    } else {
        // 复制链接到剪贴板
        navigator.clipboard.writeText(window.location.href).then(() => {
            showMessage('报告链接已复制到剪贴板', 'success');
        }).catch(() => {
            showMessage('无法复制链接，请手动分享页面地址', 'error');
        });
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.textContent = message;
    
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#6366f1'
    };
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @media print {
        .navbar,
        .action-buttons {
            display: none !important;
        }
        
        .result-container {
            max-width: none;
            padding: 0;
        }
        
        .report-section {
            break-inside: avoid;
            margin-bottom: 1rem;
        }
    }
`;
document.head.appendChild(style); 