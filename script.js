// Smooth scrolling navigation
document.addEventListener('DOMContentLoaded', function() {
    // Navigation links smooth scrolling
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
    });

    // Add page load animations
    const heroContent = document.querySelector('.hero-content');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 300);
    }

    if (heroVisual) {
        heroVisual.style.opacity = '0';
        heroVisual.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            heroVisual.style.transition = 'all 0.8s ease';
            heroVisual.style.opacity = '1';
            heroVisual.style.transform = 'translateX(0)';
        }, 600);
    }

    // Animate statistics
    animateStats();
    
    // Initialize support network animation
    initializeSupportNetwork();
    
    // Animate services on scroll
    animateServicesOnScroll();
    
    // Animate team members on scroll
    animateTeamMembers();
    
    // Animate process steps on scroll
    animateProcessSteps();
    
    // Animate resources on scroll
    animateResourcesOnScroll();
});

// Animate statistics
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    statNumbers.forEach(stat => {
        const finalValue = stat.textContent;
        const isPercentage = finalValue.includes('%');
        const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        let currentValue = 0;
        const increment = numericValue / 50;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(timer);
            }
            
            if (isPercentage) {
                stat.textContent = Math.floor(currentValue) + '%';
            } else {
                stat.textContent = Math.floor(currentValue).toLocaleString() + '+';
            }
        }, 30);
    });
}

// Initialize support network animation
function initializeSupportNetwork() {
    const networkNodes = document.querySelectorAll('.network-node');
    
    networkNodes.forEach((node, index) => {
        // Add hover effects
        node.addEventListener('mouseenter', function() {
            this.style.transform = this.style.transform.replace('translateY(0px)', 'translateY(-15px)');
            this.style.boxShadow = '0 10px 25px rgba(229, 62, 62, 0.3)';
        });
        
        node.addEventListener('mouseleave', function() {
            this.style.transform = this.style.transform.replace('translateY(-15px)', 'translateY(0px)');
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
        
        // Add click effects
        node.addEventListener('click', function() {
            showNodeInfo(this);
        });
    });
}

// Show node information
function showNodeInfo(node) {
    const nodeType = node.classList.contains('teacher') ? 'Special Education Teacher' :
                    node.classList.contains('therapist') ? 'Occupational Therapist' :
                    node.classList.contains('parent') ? 'Family Support' :
                    'Child Psychologist';
    
    const descriptions = {
        'Special Education Teacher': 'Certified professionals who create personalized learning plans and provide one-on-one instruction.',
        'Occupational Therapist': 'Licensed therapists who help develop essential life skills and motor coordination.',
        'Family Support': 'Dedicated professionals who provide guidance and emotional support to families.',
        'Child Psychologist': 'Licensed psychologists who provide emotional support and behavioral intervention.'
    };
    
    // Create a simple tooltip or modal
    const tooltip = document.createElement('div');
    tooltip.className = 'node-tooltip';
    tooltip.innerHTML = `
        <h4>${nodeType}</h4>
        <p>${descriptions[nodeType]}</p>
    `;
    
    // Position tooltip
    const rect = node.getBoundingClientRect();
    tooltip.style.position = 'absolute';
    tooltip.style.top = rect.top - 80 + 'px';
    tooltip.style.left = rect.left + 'px';
    tooltip.style.zIndex = '1000';
    
    document.body.appendChild(tooltip);
    
    // Remove tooltip after 3 seconds
    setTimeout(() => {
        if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
    }, 3000);
}

// Animate services on scroll
function animateServicesOnScroll() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    serviceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// Animate team members on scroll
function animateTeamMembers() {
    const teamMembers = document.querySelectorAll('.team-member');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, { threshold: 0.1 });

    teamMembers.forEach(member => {
        member.style.opacity = '0';
        member.style.transform = 'translateY(30px)';
        member.style.transition = 'all 0.6s ease';
        observer.observe(member);
    });
}

// Animate process steps on scroll
function animateProcessSteps() {
    const processSteps = document.querySelectorAll('.process-step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.1 });

    processSteps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateX(-30px)';
        step.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(step);
    });
}

// Animate resources on scroll
function animateResourcesOnScroll() {
    const resourceCards = document.querySelectorAll('.resource-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 150);
            }
        });
    }, { threshold: 0.1 });

    resourceCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease';
        observer.observe(card);
    });
}

// Start assessment function
function startAssessment() {
    // Save current page state
    sessionStorage.setItem('fromHomepage', 'true');
    
    // Redirect to assessment page
    window.location.href = 'assessment.html';
}

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth'
        });
    }
}

// Button click effects
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn')) {
        // Add click ripple effect
        const ripple = document.createElement('span');
        const rect = e.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        e.target.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});

// Service card hover effects
document.addEventListener('DOMContentLoaded', function() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Resource card interactions
function initializeResourceCards() {
    const resourceCards = document.querySelectorAll('.resource-card');
    
    resourceCards.forEach(card => {
        const button = card.querySelector('.btn');
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const resourceType = card.querySelector('h3').textContent;
                showResourceModal(resourceType);
            });
        }
    });
}

// Show resource modal
function showResourceModal(resourceType) {
    const modal = document.createElement('div');
    modal.className = 'resource-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${resourceType}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <p>Thank you for your interest in our ${resourceType.toLowerCase()}. Our team will contact you soon to provide access to these valuable resources.</p>
                <div class="modal-actions">
                    <button class="btn btn-primary">Contact Us</button>
                    <button class="btn btn-outline modal-close">Close</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeButtons = modal.querySelectorAll('.modal-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Testimonial carousel
function initializeTestimonialCarousel() {
    const testimonials = document.querySelectorAll('.testimonial-card');
    let currentIndex = 0;
    
    function showTestimonial(index) {
        testimonials.forEach((testimonial, i) => {
            testimonial.style.opacity = i === index ? '1' : '0.7';
            testimonial.style.transform = i === index ? 'scale(1)' : 'scale(0.95)';
        });
    }
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        showTestimonial(currentIndex);
    }, 6000);
}

// Add CSS styles for animations and modals
const style = document.createElement('style');
style.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .service-card,
    .team-member,
    .process-step,
    .resource-card {
        transition: all 0.3s ease;
    }
    
    .network-node {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .testimonial-card {
        transition: all 0.5s ease;
    }
    
    /* Node tooltip styles */
    .node-tooltip {
        background: white;
        border: 2px solid #e53e3e;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        max-width: 250px;
        animation: tooltip-fade-in 0.3s ease;
    }
    
    .node-tooltip h4 {
        color: #e53e3e;
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }
    
    .node-tooltip p {
        color: #4a5568;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    @keyframes tooltip-fade-in {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Resource modal styles */
    .resource-modal {
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
        animation: modal-fade-in 0.3s ease;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: modal-slide-in 0.3s ease;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .modal-header h3 {
        color: #2d3748;
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
    }
    
    @keyframes modal-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes modal-slide-in {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Hover effects for interactive elements */
    .nav-menu a:hover,
    .footer-section a:hover {
        transform: translateY(-1px);
    }
    
    /* Smooth transitions for all interactive elements */
    * {
        transition: color 0.3s ease, background-color 0.3s ease, transform 0.3s ease, opacity 0.3s ease;
    }
    
    /* Support network connection animation */
    .connection-lines::before {
        animation: connection-pulse 3s ease-in-out infinite;
    }
    
    @keyframes connection-pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.6; }
    }
`;
document.head.appendChild(style);

// Initialize resource cards when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeResourceCards();
});

// Initialize testimonial carousel when page loads
window.addEventListener('load', function() {
    // Only initialize if there are multiple testimonials
    const testimonials = document.querySelectorAll('.testimonial-card');
    if (testimonials.length > 1) {
        initializeTestimonialCarousel();
    }
});

// Add scroll-based animations for support section
function animateSupportSection() {
    const supportSection = document.querySelector('.support-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    if (supportSection) {
        supportSection.style.opacity = '0';
        supportSection.style.transform = 'translateY(30px)';
        supportSection.style.transition = 'all 0.8s ease';
        observer.observe(supportSection);
    }
}

// Initialize support section animations
document.addEventListener('DOMContentLoaded', function() {
    animateSupportSection();
});

// Emergency contact functionality
function initializeEmergencyContact() {
    const emergencyButtons = document.querySelectorAll('[data-emergency]');
    
    emergencyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showEmergencyContact();
        });
    });
}

function showEmergencyContact() {
    const modal = document.createElement('div');
    modal.className = 'emergency-modal';
    modal.innerHTML = `
        <div class="emergency-content">
            <div class="emergency-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>24/7 Emergency Support</h3>
            </div>
            <div class="emergency-body">
                <p>Our emergency support team is available 24/7 to help you and your family.</p>
                <div class="emergency-contacts">
                    <div class="emergency-contact">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>Emergency Hotline</strong>
                            <span>+1 (555) 123-4567</span>
                        </div>
                    </div>
                    <div class="emergency-contact">
                        <i class="fas fa-comments"></i>
                        <div>
                            <strong>Crisis Chat</strong>
                            <span>Available 24/7</span>
                        </div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="window.location.href='tel:+15551234567'">
                    <i class="fas fa-phone"></i>
                    Call Now
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Initialize emergency contact functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeEmergencyContact();
}); 