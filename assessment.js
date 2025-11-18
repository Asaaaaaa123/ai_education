// 全局变量
let currentStep = 1;
const totalSteps = 3;

// 年级配置
const gradeConfig = {
    '0': ['婴儿期'],
    '1': ['婴儿期'],
    '2': ['婴儿期'],
    '3': ['小班'],
    '4': ['中班'],
    '5': ['大班'],
    '6': ['大班'],
    '7': ['一年级'],
    '8': ['二年级'],
    '9': ['三年级'],
    '10': ['四年级'],
    '11': ['五年级'],
    '12': ['六年级']
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeAssessment();
    setupEventListeners();
    updateProgress();
});

// 初始化评估页面
function initializeAssessment() {
    // 检查是否从首页跳转过来
    const fromHomepage = sessionStorage.getItem('fromHomepage');
    if (!fromHomepage) {
        // 如果不是从首页来的，重定向到首页
        window.location.href = 'index.html';
        return;
    }
    
    // 清除标记
    sessionStorage.removeItem('fromHomepage');
    
    // 初始化年级选择器
    initializeGradeSelector();
}

// 设置事件监听器
function setupEventListeners() {
    // 年龄段选择
    const ageOptions = document.querySelectorAll('.age-option');
    ageOptions.forEach(option => {
        option.addEventListener('click', function() {
            selectAgeOption(this);
        });
    });

    // 星级评分
    setupStarRating();

    // 表单提交
    const form = document.getElementById('assessmentForm');
    form.addEventListener('submit', handleFormSubmit);
}

// 初始化年级选择器
function initializeGradeSelector() {
    const gradeSelect = document.getElementById('grade');
    const ageSelect = document.getElementById('selectedAge');
    
    // 监听年龄段变化
    ageSelect.addEventListener('change', function() {
        const selectedAge = this.value;
        updateGradeOptions(selectedAge);
    });
}

// 更新年级选项
function updateGradeOptions(ageRange) {
    const gradeSelect = document.getElementById('grade');
    const grades = gradeConfig[ageRange] || [];
    
    // 清空现有选项
    gradeSelect.innerHTML = '<option value="">请选择年级</option>';
    
    // 添加新选项
    grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade;
        option.textContent = grade;
        gradeSelect.appendChild(option);
    });
}

// 选择年龄段
function selectAgeOption(selectedOption) {
    // 移除其他选项的选中状态
    const ageOptions = document.querySelectorAll('.age-option');
    ageOptions.forEach(option => {
        option.classList.remove('selected');
    });
    
    // 添加选中状态
    selectedOption.classList.add('selected');
    
    // 更新隐藏输入字段
    const selectedAge = selectedOption.getAttribute('data-age');
    document.getElementById('selectedAge').value = selectedAge;
    
    // 更新年级选项
    updateGradeOptions(selectedAge);
}

// 设置星级评分
function setupStarRating() {
    const ratingContainers = document.querySelectorAll('.rating-stars');
    
    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('i');
        const hiddenInput = container.parentElement.querySelector('input[type="hidden"]');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', function() {
                const rating = index + 1;
                updateStarRating(container, rating);
                hiddenInput.value = rating;
            });
            
            star.addEventListener('mouseenter', function() {
                const rating = index + 1;
                highlightStars(container, rating);
            });
        });
        
        container.addEventListener('mouseleave', function() {
            const currentRating = parseInt(hiddenInput.value) || 0;
            highlightStars(container, currentRating);
        });
    });
}

// 更新星级评分
function updateStarRating(container, rating) {
    const stars = container.querySelectorAll('i');
    const hiddenInput = container.parentElement.querySelector('input[type="hidden"]');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    hiddenInput.value = rating;
}

// 高亮星星
function highlightStars(container, rating) {
    const stars = container.querySelectorAll('i');
    
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// 下一步
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            currentStep++;
            showStep(currentStep);
            updateProgress();
        }
    }
}

// 上一步
function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        updateProgress();
    }
}

// 显示指定步骤
function showStep(stepNumber) {
    // 隐藏所有步骤
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // 显示当前步骤
    const currentStepElement = document.getElementById(`step${stepNumber}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
}

// 更新进度条
function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.querySelector('.progress-text');
    
    const progress = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `步骤 ${currentStep} / ${totalSteps}`;
}

// 验证当前步骤
function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            showError(`请填写 ${field.previousElementSibling?.textContent || '必填项'}`);
            field.focus();
            return false;
        }
    }
    
    // 特殊验证
    if (currentStep === 1) {
        const selectedAge = document.getElementById('selectedAge').value;
        if (!selectedAge) {
            showError('请选择孩子的年龄');
            return false;
        }
    }
    
    return true;
}

// 显示错误信息
function showError(message) {
    // 创建错误提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        errorDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 3000);
}

// 返回首页
function goBack() {
    if (confirm('确定要返回首页吗？当前填写的信息将会丢失。')) {
        window.location.href = 'index.html';
    }
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    // 收集表单数据
    const formData = collectFormData();
    
    // 显示加载状态
    showLoading();
    
    try {
        // 调用AI API进行分析
        const response = await fetch('http://localhost:8001/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            // 保存原始数据和AI分析结果
            const fullData = {
                formData: formData,
                aiAnalysis: result.data
            };
            sessionStorage.setItem('assessmentData', JSON.stringify(fullData));
            
            // 跳转到结果页面
            window.location.href = 'result.html';
        } else {
            throw new Error(result.message || '分析失败');
        }
    } catch (error) {
        console.error('AI分析失败:', error);
        
        // 如果AI分析失败，使用原始方法
        alert('AI分析暂时不可用，将使用基础分析模式');
        sessionStorage.setItem('assessmentData', JSON.stringify(formData));
        window.location.href = 'result.html';
    } finally {
        hideLoading();
    }
}

// 收集表单数据
function collectFormData() {
    const form = document.getElementById('assessmentForm');
    const formData = new FormData(form);
    const data = {};
    
    // 收集基本字段
    for (let [key, value] of formData.entries()) {
        if (key.includes('[]')) {
            // 处理多选字段
            const baseKey = key.replace('[]', '');
            if (!data[baseKey]) {
                data[baseKey] = [];
            }
            data[baseKey].push(value);
        } else {
            data[key] = value;
        }
    }
    
    // 收集复选框数据
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        const name = checkbox.name;
        if (!data[name]) {
            data[name] = [];
        }
        data[name].push(checkbox.value);
    });
    
    return data;
}

// 显示加载状态
function showLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在分析...';
    submitBtn.disabled = true;
    
    // 添加加载遮罩
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    loadingOverlay.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; text-align: center;">
            <i class="fas fa-brain" style="font-size: 3rem; color: #6366f1; margin-bottom: 1rem;"></i>
            <h3>AI正在分析中...</h3>
            <p>请稍候，我们正在为您生成个性化的教育建议</p>
        </div>
    `;
    
    document.body.appendChild(loadingOverlay);
}

// 隐藏加载状态
function hideLoading() {
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-magic"></i> 生成智能报告';
    submitBtn.disabled = false;
    
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
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
`;
document.head.appendChild(style); 