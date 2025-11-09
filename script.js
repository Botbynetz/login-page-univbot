// NEXUS 3D Gaming Login - Advanced JavaScript Controller
class Nexus3DController {
    constructor() {
        this.scene = document.getElementById('nexus3d');
        this.rocket = document.getElementById('rocket3d');
        this.astronaut = document.getElementById('astronaut3d');
        this.paper = document.getElementById('loginPaper3d');
        this.success = document.getElementById('launchSuccess3d');
        
        this.currentPhase = 'approach';
        this.paperSide = 'front'; // 'front' or 'back'
        this.isAnimating = false;
        
        this.audioContext = null;
        this.sounds = {};
        
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing NEXUS 3D System...');
        
        this.setupAudio();
        this.setupEventListeners();
        this.startIntroSequence();
        
        console.log('✅ NEXUS 3D System Online');
    }
    
    // Audio System
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create synthetic sounds for better performance
            this.sounds = {
                rocketEngine: this.createRocketEngineSound(),
                jetpack: this.createJetpackSound(),
                paperFlip: this.createPaperFlipSound(),
                success: this.createSuccessSound(),
                ambient: this.createAmbientSound()
            };
            
            console.log('🔊 Audio system initialized');
        } catch (error) {
            console.warn('Audio context initialization failed:', error);
        }
    }
    
    createRocketEngineSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode, filter };
    }
    
    createJetpackSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode };
    }
    
    createPaperFlipSound() {
        // Create paper flip sound using noise
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        return buffer;
    }
    
    createSuccessSound() {
        // Create success chime
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            const t = i / this.audioContext.sampleRate;
            output[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 2) +
                       Math.sin(2 * Math.PI * 660 * t) * Math.exp(-t * 1.5) +
                       Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 1);
        }
        
        return buffer;
    }
    
    createAmbientSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(40, this.audioContext.currentTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        return { oscillator, gainNode, filter };
    }
    
    playSound(soundType, duration = 1000) {
        if (!this.audioContext) return;
        
        try {
            switch (soundType) {
                case 'rocketEngine':
                    this.playRocketEngine(duration);
                    break;
                case 'jetpack':
                    this.playJetpack(duration);
                    break;
                case 'paperFlip':
                    this.playPaperFlip();
                    break;
                case 'success':
                    this.playSuccess();
                    break;
                case 'ambient':
                    this.playAmbient();
                    break;
            }
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    playRocketEngine(duration) {
        const sound = this.createRocketEngineSound();
        const now = this.audioContext.currentTime;
        
        sound.oscillator.start(now);
        sound.gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        sound.gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);
        sound.oscillator.stop(now + duration / 1000);
        
        // Add frequency modulation for realism
        sound.oscillator.frequency.linearRampToValueAtTime(100, now + 0.5);
        sound.oscillator.frequency.linearRampToValueAtTime(80, now + duration / 1000);
    }
    
    playJetpack(duration) {
        const sound = this.createJetpackSound();
        const now = this.audioContext.currentTime;
        
        sound.oscillator.start(now);
        sound.gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
        sound.gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);
        sound.oscillator.stop(now + duration / 1000);
    }
    
    playPaperFlip() {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds.paperFlip;
        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
    
    playSuccess() {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds.success;
        gainNode.gain.setValueAtTime(0.6, this.audioContext.currentTime);
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start();
    }
    
    playAmbient() {
        if (this.sounds.ambient && this.sounds.ambient.oscillator) {
            this.sounds.ambient.oscillator.start();
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Skip intro button
        const skipBtn = document.getElementById('skipIntroBtn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipIntro());
        }
        
        // Login form
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => this.handleLogin(e));
        }
        
        // Settings button
        const settingsBtn = document.getElementById('systemSettingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => this.handleSettings(e));
        }
        
        // Recovery form
        const recoveryBtn = document.getElementById('transmitRecoveryBtn');
        if (recoveryBtn) {
            recoveryBtn.addEventListener('click', (e) => this.handleRecovery(e));
        }
        
        // Back to login button
        const backBtn = document.getElementById('returnToAccessBtn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => this.handleBackToLogin(e));
        }
        
        // Register button
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => this.handleRegister(e));
        }
        
        // Forgot password button
        const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', (e) => this.handleForgotPassword(e));
        }
        
        // Input field enhancements
        this.enhanceInputFields();
        
        // Mouse tracking for astronaut helmet with throttling for performance
        let mouseTrackingFrame;
        document.addEventListener('mousemove', (e) => {
            if (mouseTrackingFrame) {
                cancelAnimationFrame(mouseTrackingFrame);
            }
            mouseTrackingFrame = requestAnimationFrame(() => this.handleMouseTracking(e));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Window resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Initialize speech synthesis voices
        this.initializeSpeechSynthesis();
        
        console.log('📝 Event listeners configured');
    }
    
    enhanceInputFields() {
        const inputs = document.querySelectorAll('.field-input-3d');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                this.playSound('ambient', 200);
                e.target.parentElement.classList.add('focused');
                
                // Privacy mode for password field
                if (e.target.type === 'password') {
                    this.activatePrivacyMode(true);
                }
            });
            
            input.addEventListener('blur', (e) => {
                e.target.parentElement.classList.remove('focused');
                
                // Deactivate privacy mode
                if (e.target.type === 'password') {
                    this.activatePrivacyMode(false);
                }
            });
            
            input.addEventListener('input', (e) => {
                this.validateInput(e.target);
                
                // Enhanced privacy mode while typing password
                if (e.target.type === 'password' && e.target.value.length > 0) {
                    this.activatePrivacyMode(true);
                }
            });
        });
    }
    
    validateInput(input) {
        const value = input.value.trim();
        const container = input.parentElement;
        
        // Remove previous validation classes
        container.classList.remove('valid', 'invalid');
        
        if (value.length > 0) {
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                container.classList.add(emailRegex.test(value) ? 'valid' : 'invalid');
            } else {
                container.classList.add(value.length >= 3 ? 'valid' : 'invalid');
            }
        }
    }
    
    // Main Animation Sequence - Skip to Ready State
    startIntroSequence() {
        console.log('🎬 NEXUS Login Ready - Skipping to interactive state...');
        
        // Set everything to final positions immediately
        this.setFinalPositions();
        
        // Enable interaction right away
        this.updatePhase('ready');
        this.enableInteraction();
        
        // Welcome message
        setTimeout(() => this.playWelcomeMessage(), 1500);
        
        // Optional subtle ambient sound
        setTimeout(() => this.playSound('ambient'), 100);
    }
    
    setFinalPositions() {
        // Show rocket in final position
        const rocketContainer = document.getElementById('rocket3dContainer');
        if (rocketContainer) {
            rocketContainer.style.transform = 'translateX(0) translateY(0) translateZ(0) rotateY(-20deg) rotateX(5deg)';
            rocketContainer.style.opacity = '1';
            rocketContainer.style.animation = 'none';
        }
        
        // Show astronaut in final position
        const astronautContainer = document.getElementById('astronaut3dContainer');
        if (astronautContainer) {
            astronautContainer.style.transform = 'translateX(0) translateY(0) translateZ(0) rotateY(0deg)';
            astronautContainer.style.opacity = '1';
            astronautContainer.style.animation = 'none';
        }
        
        // Show paper in center ready for interaction
        const paperContainer = document.getElementById('loginPaper3dContainer');
        if (paperContainer) {
            paperContainer.style.transform = 'translate(-50%, -50%) translateZ(0) rotateX(0deg) rotateY(0deg)';
            paperContainer.style.opacity = '1';
            paperContainer.style.animation = 'none';
        }
        
        // Open hatch immediately
        const hatch = document.getElementById('rocketHatch');
        if (hatch) {
            hatch.style.transform = 'rotateY(-120deg)';
            hatch.style.animation = 'none';
        }
        
        console.log('✅ All elements positioned for immediate interaction');
    }
    
    openRocketHatch() {
        const hatch = document.getElementById('rocketHatch');
        if (hatch) {
            hatch.style.animation = 'hatchOpening 2s ease-out forwards';
        }
        console.log('🚪 Rocket hatch opening...');
    }
    
    astronautEmerge() {
        const astronautContainer = document.getElementById('astronaut3dContainer');
        if (astronautContainer) {
            astronautContainer.style.animation = 'astronautEntrance 3s ease-out forwards';
            astronautContainer.style.opacity = '1';
        }
        console.log('👨‍🚀 Astronaut emerging...');
    }
    
    throwPaper() {
        console.log('📄 Astronaut throwing paper...');
        
        const throwingArm = document.getElementById('throwingArm');
        if (throwingArm) {
            throwingArm.classList.add('throwing-arm');
        }
        
        // Paper flies from astronaut to center
        const paperContainer = document.getElementById('loginPaper3dContainer');
        if (paperContainer) {
            paperContainer.style.animation = 'paperEntrance 2s ease-out forwards';
            paperContainer.style.opacity = '1';
        }
        
        this.playSound('paperFlip');
    }
    
    enableInteraction() {
        console.log('✅ Interface ready for interaction');
        this.updateHUD();
        
        // Add glow effect to indicate readiness
        const paperContainer = document.getElementById('loginPaper3dContainer');
        if (paperContainer) {
            paperContainer.style.boxShadow = '0 0 50px rgba(0, 255, 255, 0.6), 0 0 100px rgba(0, 255, 255, 0.3)';
            paperContainer.style.border = '2px solid rgba(0, 255, 255, 0.5)';
            paperContainer.style.borderRadius = '20px';
        }
        
        // Focus on first input
        const firstInput = document.getElementById('commanderId');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 500);
        }
    }
    
    // User Interactions
    handleLogin(e) {
        e.preventDefault();
        
        if (this.isAnimating) return;
        
        const username = document.getElementById('commanderId')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        
        if (!username || !password) {
            this.showValidationError('Please complete all fields');
            return;
        }
        
        console.log('🔐 Processing login...');
        this.processLogin(username, password);
    }
    
    async processLogin(username, password) {
        this.isAnimating = true;
        this.updateStatus('systemStatusValue', 'AUTHENTICATING');
        this.updateStatus('clearanceStatusValue', 'PROCESSING');
        
        // Simulate authentication delay
        await this.delay(2000);
        
        // Always succeed for demo (in real app, validate credentials)
        this.updateStatus('systemStatusValue', 'AUTHENTICATED');
        this.updateStatus('clearanceStatusValue', 'GRANTED');
        
        await this.delay(1000);
        
        // Paper returns to astronaut
        await this.returnPaperToAstronaut();
        
        // Launch success sequence
        this.launchSuccess();
    }
    
    async returnPaperToAstronaut() {
        console.log('📄 Returning paper to astronaut...');
        
        const paperContainer = document.getElementById('loginPaper3dContainer');
        if (paperContainer) {
            paperContainer.style.animation = 'paperReturn 2s ease-in forwards';
            await this.delay(2000);
            paperContainer.style.opacity = '0';
        }
        
        this.playSound('paperFlip');
    }
    
    launchSuccess() {
        console.log('🎉 Launch sequence initiated!');
        
        this.updatePhase('launch_success');
        this.playSound('success');
        
        if (this.success) {
            this.success.classList.add('active');
        }
        
        // Hide other elements
        if (this.rocket) {
            this.rocket.style.animation = 'rocketLaunch 3s ease-out forwards';
        }
        
        if (document.getElementById('astronaut3dContainer')) {
            document.getElementById('astronaut3dContainer').style.animation = 'astronautLaunch 3s ease-out forwards';
        }
        
        this.isAnimating = false;
    }
    
    handleSettings(e) {
        e.preventDefault();
        
        if (this.isAnimating) return;
        
        this.flipPaper('back');
    }
    
    handleBackToLogin(e) {
        e.preventDefault();
        
        if (this.isAnimating) return;
        
        this.flipPaper('front');
    }
    
    handleRecovery(e) {
        e.preventDefault();
        
        const email = document.getElementById('recoveryBeacon')?.value.trim();
        const code = document.getElementById('securityCipher')?.value.trim();
        
        if (!email || !code) {
            this.showValidationError('Please complete recovery information');
            return;
        }
        
        console.log('📡 Transmitting recovery signal...');
        this.processRecovery(email, code);
    }
    
    handleRegister(e) {
        e.preventDefault();
        
        console.log('📝 Navigating to registration...');
        
        // Add transition effect
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';
        
        // Navigate after transition
        setTimeout(() => {
            window.location.href = 'register.html';
        }, 500);
    }
    
    handleForgotPassword(e) {
        e.preventDefault();
        
        console.log('🔑 Navigating to password recovery...');
        
        // Add transition effect
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';
        
        // Navigate after transition
        setTimeout(() => {
            window.location.href = 'forgot-password.html';
        }, 500);
    }

    async processRecovery(email, code) {
        this.updateStatus('beaconStatusValue', 'TRANSMITTING');
        this.updateStatus('transmissionStatusValue', 'ACTIVE');
        
        await this.delay(3000);
        
        this.updateStatus('beaconStatusValue', 'SIGNAL_SENT');
        this.updateStatus('transmissionStatusValue', 'COMPLETE');
        
        this.showNotification('Recovery signal transmitted successfully!');
    }
    
    // Paper Flip Animation
    async flipPaper(side) {
        if (this.isAnimating || this.paperSide === side) return;
        
        this.isAnimating = true;
        console.log(`📄 Flipping paper to ${side} side...`);
        
        this.playSound('paperFlip');
        
        if (this.paper) {
            if (side === 'back') {
                this.paper.classList.add('flipping');
                await this.delay(500);
                this.paper.classList.remove('flipping');
            } else {
                this.paper.classList.add('flipping-back');
                await this.delay(500);
                this.paper.classList.remove('flipping-back');
            }
        }
        
        this.paperSide = side;
        this.isAnimating = false;
        
        console.log(`✅ Paper flipped to ${side} side`);
    }
    
    // Keyboard Shortcuts
    handleKeyboard(e) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        
        switch (e.key) {
            case 'Enter':
                if (this.paperSide === 'front') {
                    document.getElementById('loginBtn')?.click();
                } else {
                    document.getElementById('transmitRecoveryBtn')?.click();
                }
                break;
            case 'Escape':
                if (this.paperSide === 'back') {
                    this.handleBackToLogin({ preventDefault: () => {} });
                }
                break;
            case 's':
            case 'S':
                if (this.paperSide === 'front' && !this.isAnimating) {
                    this.handleSettings({ preventDefault: () => {} });
                }
                break;
            case ' ':
                e.preventDefault();
                this.skipIntro();
                break;
        }
    }
    
    // Window Resize Handler
    handleResize() {
        // Adjust 3D scene for different screen sizes
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        if (vw < 768) {
            // Mobile adjustments
            if (this.scene) {
                this.scene.style.transform = 'scale(0.8)';
            }
        } else {
            // Desktop
            if (this.scene) {
                this.scene.style.transform = '';
            }
        }
    }
    
    // Skip Intro
    skipIntro() {
        console.log('⏭️ Skipping intro sequence...');
        
        // Stop all running animations
        const animatedElements = document.querySelectorAll('[style*="animation"]');
        animatedElements.forEach(el => {
            el.style.animation = 'none';
        });
        
        // Show final state immediately
        const rocketContainer = document.getElementById('rocket3dContainer');
        const astronautContainer = document.getElementById('astronaut3dContainer');
        const paperContainer = document.getElementById('loginPaper3dContainer');
        
        if (rocketContainer) {
            rocketContainer.style.transform = 'translateX(0) translateY(0) translateZ(0) rotateY(-20deg) rotateX(5deg)';
            rocketContainer.style.opacity = '1';
        }
        
        if (astronautContainer) {
            astronautContainer.style.transform = 'translateX(0) translateY(0) translateZ(0) rotateY(0deg)';
            astronautContainer.style.opacity = '1';
        }
        
        if (paperContainer) {
            paperContainer.style.transform = 'translate(-50%, -50%) translateZ(0) rotateX(0deg) rotateY(0deg)';
            paperContainer.style.opacity = '1';
        }
        
        this.updatePhase('ready');
        this.enableInteraction();
    }
    
    // HUD Updates
    updateHUD() {
        const phaseMap = {
            'approach': 'APPROACH',
            'rocket_approach': 'ROCKET APPROACH',
            'hatch_opening': 'HATCH OPENING',
            'astronaut_emerge': 'ASTRONAUT DEPLOY',
            'paper_deploy': 'PAPER DEPLOY',
            'ready': 'READY',
            'launch_success': 'LAUNCH SUCCESS'
        };
        
        const astronautMap = {
            'approach': 'STANDBY',
            'rocket_approach': 'STANDBY',
            'hatch_opening': 'PREPARING',
            'astronaut_emerge': 'EMERGING',
            'paper_deploy': 'DEPLOYING',
            'ready': 'READY',
            'launch_success': 'LAUNCHED'
        };
        
        const paperMap = {
            'approach': 'STANDBY',
            'rocket_approach': 'STANDBY',
            'hatch_opening': 'STANDBY',
            'astronaut_emerge': 'PREPARING',
            'paper_deploy': 'DEPLOYING',
            'ready': 'DEPLOYED',
            'launch_success': 'RETURNED'
        };
        
        this.updateStatus('missionPhase', phaseMap[this.currentPhase]);
        this.updateStatus('astronautState', astronautMap[this.currentPhase]);
        this.updateStatus('paperState', paperMap[this.currentPhase]);
    }
    
    updatePhase(newPhase) {
        this.currentPhase = newPhase;
        this.updateHUD();
        console.log(`📊 Phase updated: ${newPhase}`);
    }
    
    updateStatus(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            
            // Add visual feedback
            element.style.animation = 'statusUpdate 0.5s ease-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 500);
        }
    }
    
    // Utility Functions
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showValidationError(message) {
        console.warn('⚠️ Validation error:', message);
        
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'validation-error';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(255, 0, 0, 0.9), rgba(200, 0, 0, 0.8));
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            border: 2px solid rgba(255, 100, 100, 0.6);
            font-family: 'Share Tech Mono', monospace;
            font-size: 14px;
            z-index: 10000;
            animation: errorPulse 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    showNotification(message) {
        console.log('📢 Notification:', message);
        
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 255, 0, 0.9), rgba(0, 200, 0, 0.8));
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            border: 2px solid rgba(100, 255, 100, 0.6);
            font-family: 'Share Tech Mono', monospace;
            font-size: 14px;
            z-index: 10000;
            animation: successPulse 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    handleMouseTracking(e) {
        const container = document.querySelector('.nexus-3d-scene');
        const leftEye = document.querySelector('#leftEye .eyeball');
        const rightEye = document.querySelector('#rightEye .eyeball');
        
        if (!container || !leftEye || !rightEye) return;
        
        const rect = container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculate mouse position untuk eye tracking
        const mouseX = (e.clientX - rect.left - centerX) / centerX;
        const mouseY = (e.clientY - rect.top - centerY) / centerY;
        
        // Eye movement range (lebih halus untuk mata)
        const eyeMoveX = mouseX * 8; // Horizontal eye movement
        const eyeMoveY = mouseY * 6; // Vertical eye movement
        
        // Apply eye movement
        if (leftEye) {
            leftEye.style.transform = `
                translate(${eyeMoveX}px, ${eyeMoveY}px)
            `;
        }
        
        if (rightEye) {
            rightEye.style.transform = `
                translate(${eyeMoveX}px, ${eyeMoveY}px)
            `;
        }
        
        // Subtle helmet movement (reduced dari sebelumnya)
        const helmet = document.querySelector('.astronaut-helmet');
        if (helmet) {
            const rotateX = mouseY * -5; // Reduced sensitivity
            const rotateY = mouseX * 8;  // Reduced sensitivity
            
            helmet.style.transform = `
                translateZ(120px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg)
                scale(1.1)
            `;
        }
    }
    
    activatePrivacyMode(active) {
        const leftTopEyelid = document.querySelector('#leftTopEyelid');
        const leftBottomEyelid = document.querySelector('#leftBottomEyelid');
        const rightTopEyelid = document.querySelector('#rightTopEyelid');
        const rightBottomEyelid = document.querySelector('#rightBottomEyelid');
        const speechBubble = document.querySelector('#speechBubble');
        
        if (active) {
            // Close eyes
            if (leftTopEyelid) leftTopEyelid.style.height = '60%';
            if (leftBottomEyelid) leftBottomEyelid.style.height = '50%';
            if (rightTopEyelid) rightTopEyelid.style.height = '60%';
            if (rightBottomEyelid) rightBottomEyelid.style.height = '50%';
            
            // Show speech bubble
            if (speechBubble) {
                speechBubble.classList.add('show');
            }
            
            // Play voice message
            this.playPasswordReminder();
            
        } else {
            // Open eyes
            if (leftTopEyelid) leftTopEyelid.style.height = '0%';
            if (leftBottomEyelid) leftBottomEyelid.style.height = '0%';
            if (rightTopEyelid) rightTopEyelid.style.height = '0%';
            if (rightBottomEyelid) rightBottomEyelid.style.height = '0%';
            
            // Hide speech bubble
            if (speechBubble) {
                speechBubble.classList.remove('show');
            }
        }
    }
    
    playPasswordReminder() {
        // Create speech synthesis if available
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(
                'Please create a strong password and remember your password'
            );
            utterance.rate = 0.8;
            utterance.pitch = 1.2;
            utterance.volume = 0.7;
            
            // Try to find a robotic or futuristic voice
            const voices = speechSynthesis.getVoices();
            const roboticVoice = voices.find(voice => 
                voice.name.includes('Microsoft') || 
                voice.name.includes('Google') ||
                voice.lang.startsWith('en')
            );
            
            if (roboticVoice) {
                utterance.voice = roboticVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
        
        // Also play a synthetic beep sound
        this.playSound('ambient', 300, 0.3);
    }
    
    initializeSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            // Load voices
            speechSynthesis.getVoices();
            
            // Some browsers need this event to load voices
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => {
                    console.log('🔊 Speech synthesis voices loaded');
                };
            }
        }
    }
    
    playWelcomeMessage() {
        // Show speech bubble first
        const speechBubble = document.querySelector('#speechBubble');
        if (speechBubble) {
            const bubbleContent = speechBubble.querySelector('p');
            if (bubbleContent) {
                bubbleContent.textContent = "Hi friend! Welcome back in here. I'm happy I can meet you again!";
            }
            speechBubble.classList.add('show');
            
            // Hide after 6 seconds
            setTimeout(() => {
                speechBubble.classList.remove('show');
                // Reset to password message after hiding
                setTimeout(() => {
                    if (bubbleContent) {
                        bubbleContent.textContent = "Please create a strong password and remember your password";
                    }
                }, 500);
            }, 6000);
        }
        
        // Play welcome voice
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(
                "Hi friend! Welcome back in here. I'm happy I can meet you again!"
            );
            utterance.rate = 0.8;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            
            // Try to find a friendly voice
            const voices = speechSynthesis.getVoices();
            const friendlyVoice = voices.find(voice => 
                voice.name.includes('Microsoft') || 
                voice.name.includes('Google') ||
                voice.lang.startsWith('en')
            );
            
            if (friendlyVoice) {
                utterance.voice = friendlyVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
        
        // Play a welcoming sound effect
        this.playSound('ambient', 400, 0.4);
    }
}

// CSS Animation Keyframes (added dynamically)
const additionalStyles = `
    @keyframes statusUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); color: #ffffff; }
        100% { transform: scale(1); }
    }
    
    @keyframes errorPulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    @keyframes successPulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    
    @keyframes paperReturn {
        0% {
            transform: translate(-50%, -50%) translateZ(0) rotateX(0deg) rotateY(0deg) scale(1);
            opacity: 1;
        }
        50% {
            transform: translate(-80%, -30%) translateZ(-100px) rotateX(-20deg) rotateY(-30deg) scale(0.7);
            opacity: 0.7;
        }
        100% {
            transform: translate(-150%, -20%) translateZ(-200px) rotateX(-45deg) rotateY(-60deg) scale(0.3);
            opacity: 0;
        }
    }
    
    @keyframes rocketLaunch {
        0% {
            transform: translateX(0) translateY(0) translateZ(0) rotateY(-20deg) rotateX(5deg);
            opacity: 1;
        }
        100% {
            transform: translateX(-200vw) translateY(-100vh) translateZ(-1000px) rotateY(-60deg) rotateX(-30deg);
            opacity: 0;
        }
    }
    
    @keyframes astronautLaunch {
        0% {
            transform: translateX(0) translateY(0) translateZ(0) rotateY(0deg);
            opacity: 1;
        }
        100% {
            transform: translateX(-200vw) translateY(-100vh) translateZ(-800px) rotateY(-45deg);
            opacity: 0;
        }
    }
`;

// Add additional styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the NEXUS 3D system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nexus3D = new Nexus3DController();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (window.nexus3D && window.nexus3D.audioContext) {
        if (document.hidden) {
            // Pause audio when tab is hidden
            window.nexus3D.audioContext.suspend();
        } else {
            // Resume audio when tab is visible
            window.nexus3D.audioContext.resume();
        }
    }
});

// ================================
// ROBOT ASSISTANT SYSTEM
// ================================

class RobotAssistant {
    constructor() {
        this.robot = document.getElementById('logoRobotHead');
        this.speechBubble = document.getElementById('logoSpeechBubble');
        this.speechContent = document.getElementById('logoSpeechContent');
        this.soundWaves = document.getElementById('logoSoundWaves');
        this.leftPupil = document.getElementById('logoLeftPupil');
        this.rightPupil = document.getElementById('logoRightPupil');
        
        this.speechSynthesis = window.speechSynthesis;
        this.currentVoice = null;
        this.isSpeaking = false;
        this.speechQueue = [];
        
        this.messages = {
            welcome: "Hello! Welcome to NEXUS Creation! Please fill in your username and password completely and correctly.",
            forgotPassword: "Don't worry! If you forgot your password, press the forgot password button below.",
            loginHelp: "I'm your digital assistant. Click me anytime for help with login.",
            idle: "NEXUS System online. Ready to assist.",
            error: "Please check your input and try again."
        };
        
        this.init();
    }
    
    init() {
        console.log('🤖 Initializing Robot Assistant...');
        
        this.setupVoice();
        this.setupEventListeners();
        this.setupEyeTracking();
        this.startIdleSequence();
        
        // Start welcome sequence after 2 seconds
        setTimeout(() => {
            this.speak('welcome');
        }, 2000);
        
        console.log('✅ Robot Assistant Online');
    }
    
    setupVoice() {
        // Wait for voices to be loaded
        if (this.speechSynthesis.getVoices().length === 0) {
            this.speechSynthesis.addEventListener('voiceschanged', () => {
                this.selectVoice();
            });
        } else {
            this.selectVoice();
        }
    }
    
    selectVoice() {
        const voices = this.speechSynthesis.getVoices();
        
        // Prefer English voices with robotic characteristics
        const preferredVoices = [
            'Google UK English Male',
            'Microsoft Mark - English (United States)',
            'Alex',
            'Google US English'
        ];
        
        for (let voiceName of preferredVoices) {
            const voice = voices.find(v => v.name.includes(voiceName));
            if (voice) {
                this.currentVoice = voice;
                break;
            }
        }
        
        // Fallback to first English voice
        if (!this.currentVoice) {
            this.currentVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
        }
        
        console.log('🗣️ Robot voice selected:', this.currentVoice?.name);
    }
    
    setupEventListeners() {
        // Robot interaction events
        if (this.robot) {
            this.robot.addEventListener('mouseenter', () => {
                this.showSpeechBubble();
                if (!this.isSpeaking) {
                    this.speak('loginHelp');
                }
            });
            
            this.robot.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!this.isSpeaking) {
                        this.hideSpeechBubble();
                    }
                }, 2000);
            });
            
            this.robot.addEventListener('click', () => {
                if (this.isSpeaking) {
                    this.stopSpeaking();
                } else {
                    this.speak('welcome');
                }
            });
        }
        
        // Forgot password button
        const forgotBtn = document.getElementById('forgotPasswordBtn');
        if (forgotBtn) {
            forgotBtn.addEventListener('click', () => {
                this.speak('forgotPassword');
                this.showForgotPasswordHelp();
            });
        }
        
        // Login form events
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) {
            usernameInput.addEventListener('focus', () => {
                this.speak('idle');
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('focus', () => {
                this.speak('idle');
            });
        }
    }
    
    setupEyeTracking() {
        document.addEventListener('mousemove', (e) => {
            this.updateEyePosition(e.clientX, e.clientY);
        });
    }
    
    updateEyePosition(mouseX, mouseY) {
        if (!this.leftPupil || !this.rightPupil) return;
        
        const robotRect = this.robot.getBoundingClientRect();
        const robotCenterX = robotRect.left + robotRect.width / 2;
        const robotCenterY = robotRect.top + robotRect.height / 2;
        
        const deltaX = mouseX - robotCenterX;
        const deltaY = mouseY - robotCenterY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 60; // Smaller for logo
        
        const normalizedX = Math.max(-2, Math.min(2, (deltaX / maxDistance) * 2));
        const normalizedY = Math.max(-2, Math.min(2, (deltaY / maxDistance) * 2));
        
        this.leftPupil.style.transform = `translate(calc(-50% + ${normalizedX}px), calc(-50% + ${normalizedY}px))`;
        this.rightPupil.style.transform = `translate(calc(-50% + ${normalizedX}px), calc(-50% + ${normalizedY}px))`;
    }
    
    speak(messageKey, customMessage = null) {
        if (!this.speechSynthesis || this.isSpeaking) return;
        
        const message = customMessage || this.messages[messageKey] || messageKey;
        
        const utterance = new SpeechSynthesisUtterance(message);
        
        if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }
        
        // Robot-like voice settings
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 0.7;
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            this.showSpeechBubble();
            this.updateSpeechContent(message);
            this.startSpeakingAnimation();
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.stopSpeakingAnimation();
            setTimeout(() => {
                if (!this.isSpeaking) {
                    this.hideSpeechBubble();
                }
            }, 3000);
        };
        
        utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            this.isSpeaking = false;
            this.stopSpeakingAnimation();
        };
        
        this.speechSynthesis.speak(utterance);
    }
    
    stopSpeaking() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.stopSpeakingAnimation();
        }
    }
    
    showSpeechBubble() {
        if (this.speechBubble) {
            this.speechBubble.classList.add('show');
        }
    }
    
    hideSpeechBubble() {
        if (this.speechBubble) {
            this.speechBubble.classList.remove('show');
        }
    }
    
    updateSpeechContent(message) {
        if (this.speechContent) {
            this.speechContent.textContent = message;
        }
    }
    
    startSpeakingAnimation() {
        if (this.soundWaves) {
            this.soundWaves.classList.add('speaking');
        }
    }
    
    stopSpeakingAnimation() {
        if (this.soundWaves) {
            this.soundWaves.classList.remove('speaking');
        }
    }
    
    startIdleSequence() {
        setInterval(() => {
            if (!this.isSpeaking && Math.random() < 0.1) {
                const idleMessages = [
                    "Ready to assist with login.",
                    "System status: Online.",
                    "Authentication ready.",
                    "Waiting for user input."
                ];
                const randomMessage = idleMessages[Math.floor(Math.random() * idleMessages.length)];
                this.speak('idle', randomMessage);
            }
        }, 30000); // Every 30 seconds
    }
    
    showForgotPasswordHelp() {
        // Animate robot pointing gesture
        if (this.robot) {
            this.robot.classList.add('pointing-gesture');
            setTimeout(() => {
                this.robot.classList.remove('pointing-gesture');
            }, 3000);
        }
        
        // Show additional help message
        setTimeout(() => {
            this.speak('forgotPassword', "Don't worry! The forgot password feature will help you recover your account access.");
        }, 2000);
    }
}

// Initialize Robot Assistant
document.addEventListener('DOMContentLoaded', () => {
    window.robotAssistant = new RobotAssistant();
});

console.log('🎮 NEXUS 3D Gaming Login System Loaded');