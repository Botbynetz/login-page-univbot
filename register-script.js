// NEXUS 3D Register Page JavaScript
class RegisterManager {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 3;
        this.formData = {};
        this.validationRules = {
            firstName: { required: true, minLength: 2 },
            lastName: { required: true, minLength: 2 },
            email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
            username: { required: true, minLength: 3, maxLength: 20 },
            password: { 
                required: true, 
                minLength: 8,
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
            },
            confirmPassword: { required: true, match: 'password' },
            birthdate: { required: true },
            agreeTerms: { required: true }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeValidation();
        this.initializeAnimations();
        console.log('RegisterManager initialized');
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('nextStepBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevStepBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('registerSubmitBtn')?.addEventListener('click', () => this.submitRegistration());

        // Form inputs validation
        const inputs = document.querySelectorAll('.nexus-input-3d');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.validateField(e.target));
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('focus', (e) => this.addFocusEffect(e.target));
        });

        // Password specific events
        document.getElementById('registerPassword')?.addEventListener('input', () => this.checkPasswordStrength());
        document.getElementById('registerConfirmPassword')?.addEventListener('input', () => this.checkPasswordMatch());
        document.getElementById('registerPasswordToggle')?.addEventListener('click', () => this.togglePasswordVisibility('registerPassword', 'registerPasswordToggle'));

        // Username availability check
        document.getElementById('registerUsername')?.addEventListener('input', () => this.checkUsernameAvailability());

        // Checkbox events
        document.getElementById('agreeTerms')?.addEventListener('change', () => this.validateStep(2));
    }

    initializeValidation() {
        // Real-time validation setup
        this.validators = {
            email: (value) => this.validationRules.email.pattern.test(value),
            username: (value) => value.length >= 3 && value.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(value),
            password: (value) => this.validationRules.password.pattern.test(value) && value.length >= 8,
            firstName: (value) => value.length >= 2 && /^[a-zA-Z\s]+$/.test(value),
            lastName: (value) => value.length >= 2 && /^[a-zA-Z\s]+$/.test(value)
        };
    }

    initializeAnimations() {
        // Add entrance animations
        setTimeout(() => {
            document.querySelector('.register-interface-3d')?.classList.add('animate-in');
        }, 500);
    }

    nextStep() {
        if (this.validateStep(this.currentStep)) {
            this.saveCurrentStepData();
            
            if (this.currentStep < this.maxSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                this.updateProgressIndicator();
                this.updateNavigationButtons();
                
                // Special handling for final step
                if (this.currentStep === 3) {
                    this.showCompletionSummary();
                }
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateProgressIndicator();
            this.updateNavigationButtons();
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.register-step').forEach(step => {
            step.classList.add('hidden');
        });
        
        // Show current step
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        if (currentStepElement) {
            currentStepElement.classList.remove('hidden');
            
            // Add slide animation
            currentStepElement.style.opacity = '0';
            currentStepElement.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                currentStepElement.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                currentStepElement.style.opacity = '1';
                currentStepElement.style.transform = 'translateX(0)';
            }, 50);
        }
    }

    updateProgressIndicator() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevStepBtn');
        const nextBtn = document.getElementById('nextStepBtn');
        const submitBtn = document.getElementById('registerSubmitBtn');
        const loginBtn = document.getElementById('loginRedirectBtn');

        // Show/hide previous button
        if (this.currentStep === 1) {
            prevBtn?.classList.add('hidden');
        } else {
            prevBtn?.classList.remove('hidden');
        }

        // Update action buttons based on step
        if (this.currentStep === 2) {
            nextBtn?.classList.add('hidden');
            submitBtn?.classList.remove('hidden');
            loginBtn?.classList.add('hidden');
        } else if (this.currentStep === 3) {
            nextBtn?.classList.add('hidden');
            submitBtn?.classList.add('hidden');
            loginBtn?.classList.remove('hidden');
            prevBtn?.classList.add('hidden');
        } else {
            nextBtn?.classList.remove('hidden');
            submitBtn?.classList.add('hidden');
            loginBtn?.classList.add('hidden');
        }
    }

    validateStep(step) {
        let isValid = true;
        
        if (step === 1) {
            // Validate profile information
            const fieldsToValidate = ['registerFirstName', 'registerLastName', 'registerEmail', 'registerUsername'];
            fieldsToValidate.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && !this.validateField(field)) {
                    isValid = false;
                }
            });
        } else if (step === 2) {
            // Validate security information
            const password = document.getElementById('registerPassword');
            const confirmPassword = document.getElementById('registerConfirmPassword');
            const agreeTerms = document.getElementById('agreeTerms');
            const birthdate = document.getElementById('registerBirthdate');

            if (password && !this.validateField(password)) isValid = false;
            if (confirmPassword && !this.validateField(confirmPassword)) isValid = false;
            if (birthdate && !birthdate.value) isValid = false;
            if (agreeTerms && !agreeTerms.checked) {
                isValid = false;
                this.showFieldError(agreeTerms.parentElement, 'You must agree to the terms and conditions');
            }
        }

        return isValid;
    }

    validateField(field) {
        const fieldName = field.name || field.id.replace('register', '').toLowerCase();
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required field check
        if (this.validationRules[fieldName]?.required && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (value && this.validators[fieldName] && !this.validators[fieldName](value)) {
            isValid = false;
            errorMessage = this.getFieldErrorMessage(fieldName);
        }

        // Special validation for confirm password
        if (fieldName === 'confirmpassword') {
            const originalPassword = document.getElementById('registerPassword')?.value;
            if (value && value !== originalPassword) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }
        }

        // Show error or success state
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else if (value) {
            this.showFieldSuccess(field);
        }

        return isValid;
    }

    getFieldErrorMessage(fieldName) {
        const messages = {
            email: 'Please enter a valid email address',
            username: 'Username must be 3-20 characters, letters, numbers, hyphens and underscores only',
            password: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
            firstName: 'First name must be at least 2 characters, letters only',
            lastName: 'Last name must be at least 2 characters, letters only'
        };
        return messages[fieldName] || 'Invalid input';
    }

    showFieldError(field, message) {
        const container = field.closest('.field-container') || field.closest('.form-field-3d');
        container?.classList.add('error');
        container?.classList.remove('success');
        
        // Remove existing error message
        const existingError = container?.querySelector('.error-message');
        existingError?.remove();
        
        // Add error message
        if (message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            container?.appendChild(errorDiv);
        }
    }

    showFieldSuccess(field) {
        const container = field.closest('.field-container') || field.closest('.form-field-3d');
        container?.classList.add('success');
        container?.classList.remove('error');
        
        // Remove error message
        const existingError = container?.querySelector('.error-message');
        existingError?.remove();
    }

    clearFieldError(field) {
        const container = field.closest('.field-container') || field.closest('.form-field-3d');
        container?.classList.remove('error', 'success');
        
        const existingError = container?.querySelector('.error-message');
        existingError?.remove();
    }

    checkPasswordStrength() {
        const password = document.getElementById('registerPassword')?.value || '';
        const strengthIndicator = document.getElementById('passwordStrength');
        
        if (!strengthIndicator) return;

        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /\d/.test(password),
            /[@$!%*?&]/.test(password),
            password.length >= 12
        ];

        strength = checks.filter(Boolean).length;

        const strengthBar = strengthIndicator.querySelector('.strength-fill');
        const strengthText = strengthIndicator.querySelector('.strength-text span');
        
        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const colors = ['#ff4444', '#ff8844', '#ffaa44', '#44aa44', '#44ff44', '#00ff88'];
        
        if (strengthBar && strengthText) {
            strengthBar.style.width = `${(strength / 6) * 100}%`;
            strengthBar.style.backgroundColor = colors[strength] || colors[0];
            strengthText.textContent = levels[strength] || levels[0];
        }
    }

    checkPasswordMatch() {
        const password = document.getElementById('registerPassword')?.value;
        const confirmPassword = document.getElementById('registerConfirmPassword')?.value;
        const matchIndicator = document.getElementById('passwordMatch');
        
        if (!matchIndicator) return;

        if (confirmPassword && password === confirmPassword) {
            matchIndicator.classList.remove('hidden');
            matchIndicator.classList.add('success');
        } else {
            matchIndicator.classList.add('hidden');
        }
    }

    checkUsernameAvailability() {
        const username = document.getElementById('registerUsername')?.value;
        const checker = document.getElementById('usernameChecker');
        
        if (!checker || !username || username.length < 3) {
            checker?.classList.add('hidden');
            return;
        }

        // Simulate username availability check
        setTimeout(() => {
            const isAvailable = Math.random() > 0.3; // 70% chance available
            
            if (isAvailable) {
                checker.classList.remove('hidden', 'unavailable');
                checker.classList.add('available');
                checker.innerHTML = '<i class="fas fa-check-circle"></i><span>Username available!</span>';
            } else {
                checker.classList.remove('hidden', 'available');
                checker.classList.add('unavailable');
                checker.innerHTML = '<i class="fas fa-times-circle"></i><span>Username not available</span>';
            }
        }, 800);
    }

    togglePasswordVisibility(passwordId, toggleId) {
        const passwordField = document.getElementById(passwordId);
        const toggleButton = document.getElementById(toggleId);
        
        if (passwordField && toggleButton) {
            const isPassword = passwordField.type === 'password';
            passwordField.type = isPassword ? 'text' : 'password';
            toggleButton.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        }
    }

    addFocusEffect(field) {
        const container = field.closest('.field-container');
        container?.classList.add('focused');
        
        field.addEventListener('blur', () => {
            container?.classList.remove('focused');
        }, { once: true });
    }

    saveCurrentStepData() {
        if (this.currentStep === 1) {
            this.formData.firstName = document.getElementById('registerFirstName')?.value;
            this.formData.lastName = document.getElementById('registerLastName')?.value;
            this.formData.email = document.getElementById('registerEmail')?.value;
            this.formData.username = document.getElementById('registerUsername')?.value;
        } else if (this.currentStep === 2) {
            this.formData.password = document.getElementById('registerPassword')?.value;
            this.formData.birthdate = document.getElementById('registerBirthdate')?.value;
            this.formData.agreeTerms = document.getElementById('agreeTerms')?.checked;
            this.formData.newsletter = document.getElementById('newsletter')?.checked;
        }
    }

    showCompletionSummary() {
        document.getElementById('summaryName').textContent = `${this.formData.firstName} ${this.formData.lastName}`;
        document.getElementById('summaryEmail').textContent = this.formData.email;
        document.getElementById('summaryUsername').textContent = this.formData.username;
        
        // Add completion animation
        setTimeout(() => {
            const successIcon = document.querySelector('.success-icon');
            successIcon?.classList.add('animate-success');
        }, 300);
    }

    async submitRegistration() {
        if (!this.validateStep(2)) return;

        this.saveCurrentStepData();
        
        // Show loading state
        const submitBtn = document.getElementById('registerSubmitBtn');
        const originalText = submitBtn?.querySelector('.button-text span').textContent;
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.querySelector('.button-text span').textContent = 'Creating Account...';
            submitBtn.classList.add('loading');
        }

        try {
            // Simulate API call
            await this.simulateRegistration();
            
            // Move to success step
            this.nextStep();
            
            // Show success message via robot assistant
            if (window.robotAssistant) {
                setTimeout(() => {
                    window.robotAssistant.speak("Registration successful! Welcome to the NEXUS gaming universe, commander!");
                }, 1000);
            }
            
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try again.');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.querySelector('.button-text span').textContent = originalText;
                submitBtn.classList.remove('loading');
            }
        }
    }

    simulateRegistration() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve({ success: true, userId: Math.random().toString(36).substr(2, 9) });
                } else {
                    reject(new Error('Registration failed'));
                }
            }, 2000);
        });
    }
}

// Robot Assistant Extension for Register Page
class RobotAssistant {
    constructor() {
        this.eyeElements = {
            left: document.getElementById('leftPupil'),
            right: document.getElementById('rightPupil')
        };
        this.isInitialized = false;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        
        this.welcomeMessages = [
            "Welcome to NEXUS registration, future space commander!",
            "Ready to create your galactic gaming account?",
            "Let's set up your profile for the ultimate space adventure!",
            "Prepare for account creation in the NEXUS universe!"
        ];
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.setupVoices();
        this.startEyeTracking();
        this.bindRegisterEvents();
        this.playWelcomeMessage();
        
        this.isInitialized = true;
        console.log('Robot Assistant initialized for Register page');
    }

    setupVoices() {
        const loadVoices = () => {
            this.voices = this.speechSynthesis.getVoices();
        };
        
        loadVoices();
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    startEyeTracking() {
        document.addEventListener('mousemove', (e) => this.trackMouse(e));
        
        // Blink animation
        setInterval(() => this.blink(), 3000 + Math.random() * 4000);
    }

    trackMouse(event) {
        if (!this.eyeElements.left || !this.eyeElements.right) return;

        const eyes = [this.eyeElements.left, this.eyeElements.right];
        
        eyes.forEach(eye => {
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;
            
            const deltaX = event.clientX - eyeCenterX;
            const deltaY = event.clientY - eyeCenterY;
            
            const angle = Math.atan2(deltaY, deltaX);
            const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY) / 10, 8);
            
            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;
            
            eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    blink() {
        const eyes = document.querySelectorAll('.robot-eyes .eye');
        eyes.forEach(eye => {
            eye.style.transform = 'scaleY(0.1)';
            setTimeout(() => {
                eye.style.transform = 'scaleY(1)';
            }, 150);
        });
    }

    bindRegisterEvents() {
        // Step completion messages
        document.getElementById('nextStepBtn')?.addEventListener('click', () => {
            setTimeout(() => this.onStepComplete(), 500);
        });

        // Field focus messages
        const inputs = document.querySelectorAll('.nexus-input-3d');
        inputs.forEach(input => {
            input.addEventListener('focus', () => this.onFieldFocus(input));
        });
    }

    onStepComplete() {
        const messages = [
            "Great progress! Let's continue to the next step.",
            "Excellent! Moving forward in the registration process.",
            "Well done, commander! Next phase initiating.",
            "Registration proceeding smoothly. Next step loading."
        ];
        
        this.speak(this.getRandomMessage(messages));
    }

    onFieldFocus(input) {
        const fieldMessages = {
            registerEmail: "Enter your communication frequency, commander.",
            registerUsername: "Choose your galactic call sign wisely.",
            registerPassword: "Create a secure access code for your account.",
            registerFirstName: "State your first designation, pilot.",
            registerLastName: "And your family designation, please."
        };
        
        const message = fieldMessages[input.id];
        if (message) {
            setTimeout(() => this.speak(message), 200);
        }
    }

    playWelcomeMessage() {
        setTimeout(() => {
            const message = this.getRandomMessage(this.welcomeMessages);
            this.speak(message);
        }, 1500);
    }

    speak(text) {
        if (!this.speechSynthesis) return;

        // Cancel any ongoing speech
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find a suitable voice (prefer robotic/tech sounding ones)
        const preferredVoices = this.voices.filter(voice => 
            voice.name.toLowerCase().includes('robot') || 
            voice.name.toLowerCase().includes('tech') ||
            voice.name.toLowerCase().includes('male')
        );
        
        if (preferredVoices.length > 0) {
            utterance.voice = preferredVoices[0];
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 0.7;
        
        this.speechSynthesis.speak(utterance);
        
        // Visual feedback
        this.addSpeakingAnimation();
    }

    addSpeakingAnimation() {
        const speaker = document.querySelector('.mouth-speaker');
        if (speaker) {
            speaker.classList.add('speaking');
            setTimeout(() => {
                speaker.classList.remove('speaking');
            }, 2000);
        }
    }

    getRandomMessage(messages) {
        return messages[Math.floor(Math.random() * messages.length)];
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Register Manager
    window.registerManager = new RegisterManager();
    
    // Initialize Robot Assistant
    window.robotAssistant = new RobotAssistant();
    window.robotAssistant.initialize();
});

// Export for use in other scripts
window.RegisterManager = RegisterManager;
window.RobotAssistant = RobotAssistant;