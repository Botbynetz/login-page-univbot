// NEXUS 3D Forgot Password JavaScript
class PasswordRecoveryManager {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.recoveryData = {};
        this.countdownTimer = null;
        this.countdownSeconds = 60;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initializeAnimations();
        console.log('PasswordRecoveryManager initialized');
    }

    bindEvents() {
        // Main action buttons
        document.getElementById('sendCodeBtn')?.addEventListener('click', () => this.sendRecoveryCode());
        document.getElementById('verifyCodeBtn')?.addEventListener('click', () => this.verifyCode());
        document.getElementById('resetPasswordBtn')?.addEventListener('click', () => this.resetPassword());
        document.getElementById('backBtn')?.addEventListener('click', () => this.goBack());
        document.getElementById('resendCodeBtn')?.addEventListener('click', () => this.resendCode());

        // Form inputs
        document.getElementById('recoveryEmail')?.addEventListener('input', (e) => this.validateEmail(e.target));
        document.getElementById('newPassword')?.addEventListener('input', () => {
            this.checkNewPasswordStrength();
            this.checkNewPasswordMatch();
        });
        document.getElementById('confirmNewPassword')?.addEventListener('input', () => this.checkNewPasswordMatch());
        document.getElementById('newPasswordToggle')?.addEventListener('click', () => this.togglePasswordVisibility());

        // Code input handling
        this.setupCodeInputs();

        // Recovery method selection
        document.querySelectorAll('input[name="recoveryMethod"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateRecoveryMethod());
        });
    }

    initializeAnimations() {
        // Add entrance animations
        setTimeout(() => {
            document.querySelector('.recovery-interface-3d')?.classList.add('animate-in');
        }, 500);
    }

    setupCodeInputs() {
        const codeInputs = document.querySelectorAll('.code-digit');
        
        codeInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                
                // Only allow numbers
                if (!/^\d$/.test(value)) {
                    e.target.value = '';
                    return;
                }

                // Auto-focus next input
                if (value && index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
                
                // Check if all inputs are filled
                this.checkCodeCompletion();
            });

            input.addEventListener('keydown', (e) => {
                // Handle backspace
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    codeInputs[index - 1].focus();
                }
            });

            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text');
                const digits = pastedData.replace(/\D/g, '').slice(0, 6);
                
                digits.split('').forEach((digit, i) => {
                    if (codeInputs[i]) {
                        codeInputs[i].value = digit;
                    }
                });
                
                this.checkCodeCompletion();
            });
        });
    }

    checkCodeCompletion() {
        const codeInputs = document.querySelectorAll('.code-digit');
        const code = Array.from(codeInputs).map(input => input.value).join('');
        
        const verifyBtn = document.getElementById('verifyCodeBtn');
        if (code.length === 6) {
            verifyBtn?.classList.remove('disabled');
        } else {
            verifyBtn?.classList.add('disabled');
        }
    }

    validateEmail(emailInput) {
        const email = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        this.clearFieldError(emailInput);
        
        if (email && !emailPattern.test(email)) {
            this.showFieldError(emailInput, 'Please enter a valid email address');
            return false;
        } else if (email) {
            this.showFieldSuccess(emailInput);
            return true;
        }
        
        return false;
    }

    updateRecoveryMethod() {
        const selectedMethod = document.querySelector('input[name="recoveryMethod"]:checked')?.value;
        const sendBtn = document.getElementById('sendCodeBtn');
        
        if (sendBtn) {
            const buttonText = sendBtn.querySelector('.button-text span');
            if (selectedMethod === 'sms') {
                buttonText.textContent = 'Send SMS Code';
            } else {
                buttonText.textContent = 'Send Recovery Code';
            }
        }
    }

    async sendRecoveryCode() {
        const emailInput = document.getElementById('recoveryEmail');
        const email = emailInput?.value.trim();
        
        if (!email || !this.validateEmail(emailInput)) {
            this.showFieldError(emailInput, 'Please enter a valid email address');
            return;
        }

        // Show loading state
        const sendBtn = document.getElementById('sendCodeBtn');
        this.setButtonLoading(sendBtn, 'Sending code...');

        try {
            // Simulate API call
            await this.simulateSendCode(email);
            
            this.recoveryData.email = email;
            this.moveToStep(2);
            
            // Start countdown timer
            this.startCountdownTimer();
            
            // Update email display
            document.getElementById('sentToEmail').textContent = this.maskEmail(email);
            
            // Robot assistant feedback
            if (window.robotAssistant) {
                window.robotAssistant.speak("Recovery code sent successfully. Check your email, commander.");
            }
            
        } catch (error) {
            console.error('Failed to send recovery code:', error);
            this.showFieldError(emailInput, 'Failed to send recovery code. Please try again.');
        } finally {
            this.setButtonLoading(sendBtn, 'Send Recovery Code', false);
        }
    }

    async verifyCode() {
        const codeInputs = document.querySelectorAll('.code-digit');
        const code = Array.from(codeInputs).map(input => input.value).join('');
        
        if (code.length !== 6) {
            this.showCodeError('Please enter the complete 6-digit code');
            return;
        }

        const verifyBtn = document.getElementById('verifyCodeBtn');
        this.setButtonLoading(verifyBtn, 'Verifying...');

        try {
            // Simulate API call
            await this.simulateVerifyCode(code);
            
            this.recoveryData.verificationCode = code;
            this.moveToStep(3);
            
            if (window.robotAssistant) {
                window.robotAssistant.speak("Code verified successfully. Please create your new password.");
            }
            
        } catch (error) {
            console.error('Code verification failed:', error);
            this.showCodeError('Invalid verification code. Please try again.');
            
            // Clear code inputs
            codeInputs.forEach(input => input.value = '');
            codeInputs[0]?.focus();
            
        } finally {
            this.setButtonLoading(verifyBtn, 'Verify Code', false);
        }
    }

    async resetPassword() {
        const newPassword = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmNewPassword')?.value;
        
        if (!this.validateNewPassword(newPassword, confirmPassword)) {
            return;
        }

        const resetBtn = document.getElementById('resetPasswordBtn');
        this.setButtonLoading(resetBtn, 'Resetting password...');

        try {
            // Simulate API call
            await this.simulateResetPassword(newPassword);
            
            this.recoveryData.newPassword = newPassword;
            this.moveToStep(4);
            
            if (window.robotAssistant) {
                window.robotAssistant.speak("Password reset complete! Welcome back to NEXUS, commander.");
            }
            
        } catch (error) {
            console.error('Password reset failed:', error);
            alert('Failed to reset password. Please try again.');
        } finally {
            this.setButtonLoading(resetBtn, 'Reset Password', false);
        }
    }

    validateNewPassword(password, confirmPassword) {
        const passwordInput = document.getElementById('newPassword');
        const confirmInput = document.getElementById('confirmNewPassword');
        
        let isValid = true;

        // Clear previous errors
        this.clearFieldError(passwordInput);
        this.clearFieldError(confirmInput);

        // Password strength validation
        if (!password || password.length < 8) {
            this.showFieldError(passwordInput, 'Password must be at least 8 characters long');
            isValid = false;
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            this.showFieldError(passwordInput, 'Password must contain uppercase, lowercase, number and special character');
            isValid = false;
        }

        // Confirm password validation
        if (password && confirmPassword && password !== confirmPassword) {
            this.showFieldError(confirmInput, 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    checkNewPasswordStrength() {
        const password = document.getElementById('newPassword')?.value || '';
        const strengthIndicator = document.getElementById('newPasswordStrength');
        const requirements = document.querySelectorAll('.req-item');
        
        if (!strengthIndicator) return;

        let strength = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };

        // Update requirements checklist
        requirements.forEach(req => {
            const reqType = req.getAttribute('data-req');
            const icon = req.querySelector('i');
            
            if (checks[reqType]) {
                req.classList.add('met');
                icon.className = 'fas fa-check';
                strength++;
            } else {
                req.classList.remove('met');
                icon.className = 'fas fa-times';
            }
        });

        // Update strength bar
        const strengthBar = strengthIndicator.querySelector('.strength-fill');
        const strengthText = strengthIndicator.querySelector('.strength-text span');
        
        const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const colors = ['#ff4444', '#ff8844', '#ffaa44', '#44aa44', '#44ff44'];
        
        if (strengthBar && strengthText) {
            const strengthLevel = Math.min(strength, 4);
            strengthBar.style.width = `${(strengthLevel / 4) * 100}%`;
            strengthBar.style.backgroundColor = colors[strengthLevel];
            strengthText.textContent = levels[strengthLevel];
        }
    }

    checkNewPasswordMatch() {
        const password = document.getElementById('newPassword')?.value;
        const confirmPassword = document.getElementById('confirmNewPassword')?.value;
        const matchIndicator = document.getElementById('newPasswordMatch');
        
        if (!matchIndicator) return;

        if (confirmPassword && password === confirmPassword) {
            matchIndicator.classList.remove('hidden');
        } else {
            matchIndicator.classList.add('hidden');
        }
    }

    togglePasswordVisibility() {
        const passwordField = document.getElementById('newPassword');
        const toggleButton = document.getElementById('newPasswordToggle');
        
        if (passwordField && toggleButton) {
            const isPassword = passwordField.type === 'password';
            passwordField.type = isPassword ? 'text' : 'password';
            toggleButton.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        }
    }

    startCountdownTimer() {
        this.countdownSeconds = 60;
        const countdownElement = document.getElementById('countdown');
        const resendBtn = document.getElementById('resendCodeBtn');
        const timerElement = document.querySelector('.code-timer');
        
        // Show timer, hide resend button
        timerElement?.classList.remove('hidden');
        resendBtn?.classList.add('hidden');
        
        this.countdownTimer = setInterval(() => {
            this.countdownSeconds--;
            
            if (countdownElement) {
                countdownElement.textContent = this.countdownSeconds;
            }
            
            if (this.countdownSeconds <= 0) {
                clearInterval(this.countdownTimer);
                timerElement?.classList.add('hidden');
                resendBtn?.classList.remove('hidden');
            }
        }, 1000);
    }

    async resendCode() {
        const resendBtn = document.getElementById('resendCodeBtn');
        this.setButtonLoading(resendBtn, 'Resending...');

        try {
            await this.simulateSendCode(this.recoveryData.email);
            this.startCountdownTimer();
            
            if (window.robotAssistant) {
                window.robotAssistant.speak("New verification code sent to your email.");
            }
            
        } catch (error) {
            console.error('Failed to resend code:', error);
        } finally {
            this.setButtonLoading(resendBtn, 'Resend verification code', false);
        }
    }

    moveToStep(step) {
        // Hide all steps
        document.querySelectorAll('.recovery-step').forEach(stepElement => {
            stepElement.classList.add('hidden');
        });

        // Show target step
        const targetStep = document.getElementById(['', 'emailStep', 'codeStep', 'passwordStep', 'successStep'][step]);
        if (targetStep) {
            targetStep.classList.remove('hidden');
            
            // Add animation
            targetStep.style.opacity = '0';
            targetStep.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                targetStep.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                targetStep.style.opacity = '1';
                targetStep.style.transform = 'translateY(0)';
            }, 50);
        }

        this.currentStep = step;
        this.updateNavigationButtons();

        // Special handling for success step
        if (step === 4) {
            this.triggerSuccessAnimation();
        }
    }

    updateNavigationButtons() {
        const backBtn = document.getElementById('backBtn');
        const sendBtn = document.getElementById('sendCodeBtn');
        const verifyBtn = document.getElementById('verifyCodeBtn');
        const resetBtn = document.getElementById('resetPasswordBtn');
        const loginBtn = document.getElementById('loginBtn');

        // Hide all buttons first
        [backBtn, sendBtn, verifyBtn, resetBtn, loginBtn].forEach(btn => {
            btn?.classList.add('hidden');
        });

        // Show appropriate buttons for current step
        switch (this.currentStep) {
            case 1:
                sendBtn?.classList.remove('hidden');
                break;
            case 2:
                backBtn?.classList.remove('hidden');
                verifyBtn?.classList.remove('hidden');
                break;
            case 3:
                backBtn?.classList.remove('hidden');
                resetBtn?.classList.remove('hidden');
                break;
            case 4:
                loginBtn?.classList.remove('hidden');
                break;
        }
    }

    goBack() {
        if (this.currentStep > 1) {
            this.moveToStep(this.currentStep - 1);
        }
    }

    triggerSuccessAnimation() {
        const successStep = document.getElementById('successStep');
        const successIcon = successStep?.querySelector('.step-icon');
        const particles = successStep?.querySelector('.success-particles');
        
        setTimeout(() => {
            successIcon?.classList.add('animate-success');
        }, 300);
        
        setTimeout(() => {
            particles?.classList.add('animate');
        }, 600);
    }

    maskEmail(email) {
        const [username, domain] = email.split('@');
        const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${maskedUsername}@${domain}`;
    }

    setButtonLoading(button, text, isLoading = true) {
        if (!button) return;
        
        button.disabled = isLoading;
        const buttonText = button.querySelector('.button-text span');
        
        if (buttonText) {
            if (isLoading) {
                button.setAttribute('data-original-text', buttonText.textContent);
                buttonText.textContent = text;
                button.classList.add('loading');
            } else {
                buttonText.textContent = button.getAttribute('data-original-text') || text;
                button.classList.remove('loading');
            }
        }
    }

    showFieldError(field, message) {
        const container = field.closest('.field-container') || field.closest('.form-field-3d');
        container?.classList.add('error');
        container?.classList.remove('success');
        
        // Remove existing error
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
        
        const existingError = container?.querySelector('.error-message');
        existingError?.remove();
    }

    clearFieldError(field) {
        const container = field.closest('.field-container') || field.closest('.form-field-3d');
        container?.classList.remove('error', 'success');
        
        const existingError = container?.querySelector('.error-message');
        existingError?.remove();
    }

    showCodeError(message) {
        const codeContainer = document.querySelector('.verification-code-input');
        
        // Remove existing error
        const existingError = document.querySelector('.code-error-message');
        existingError?.remove();
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'code-error-message error-message';
        errorDiv.textContent = message;
        
        codeContainer?.parentNode.appendChild(errorDiv);
    }

    // Simulation methods for demo purposes
    simulateSendCode(email) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true });
                } else {
                    reject(new Error('Failed to send code'));
                }
            }, 1500);
        });
    }

    simulateVerifyCode(code) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Accept "123456" as valid code for demo
                if (code === '123456' || Math.random() > 0.3) {
                    resolve({ success: true });
                } else {
                    reject(new Error('Invalid code'));
                }
            }, 1000);
        });
    }

    simulateResetPassword(password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.05) { // 95% success rate
                    resolve({ success: true });
                } else {
                    reject(new Error('Failed to reset password'));
                }
            }, 2000);
        });
    }
}

// Robot Assistant Extension for Forgot Password Page
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
            "Account recovery initiated, commander. Let's get you back online!",
            "Don't worry, we'll help you regain access to your NEXUS account.",
            "Preparing password recovery protocol for NEXUS operative.",
            "Recovery systems online. Let's restore your galactic access!"
        ];
    }

    initialize() {
        if (this.isInitialized) return;
        
        this.setupVoices();
        this.startEyeTracking();
        this.bindRecoveryEvents();
        this.playWelcomeMessage();
        
        this.isInitialized = true;
        console.log('Robot Assistant initialized for Password Recovery page');
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

    bindRecoveryEvents() {
        // Recovery step messages
        document.getElementById('sendCodeBtn')?.addEventListener('click', () => {
            setTimeout(() => this.speak("Sending recovery code to your email address."), 100);
        });

        // Field focus messages
        document.getElementById('recoveryEmail')?.addEventListener('focus', () => {
            this.speak("Enter the email address associated with your NEXUS account.");
        });

        document.getElementById('newPassword')?.addEventListener('focus', () => {
            this.speak("Create a strong new password for your account security.");
        });
    }

    playWelcomeMessage() {
        setTimeout(() => {
            const message = this.getRandomMessage(this.welcomeMessages);
            this.speak(message);
        }, 1500);
    }

    speak(text) {
        if (!this.speechSynthesis) return;

        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
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
    window.passwordRecoveryManager = new PasswordRecoveryManager();
    window.robotAssistant = new RobotAssistant();
    window.robotAssistant.initialize();
});

// Export for use in other scripts
window.PasswordRecoveryManager = PasswordRecoveryManager;
window.RobotAssistant = RobotAssistant;