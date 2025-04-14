/**
 * Audio Manager Class
 * Manages all audio effects in the application
 */
class AudioManager {
    /**
     * Constructor - private, use getInstance() instead
     */
    constructor() {
        // Initialize audio context
        this.audioContext = null;
        this.initAudio();
        
        // Define sound presets
        this.soundPresets = {
            planetCreation: {
                frequency: 880, // note
                duration: 150,  // milliseconds
                volume: 0.1
            },
            sunCollision: {
                frequency: 50,  // Very low frequency for explosion sound
                duration: 800,  // milliseconds
                volume: 1.0     // Maximum volume
            }
        };
    }
    
    /**
     * Get singleton instance
     * @returns {AudioManager} Singleton instance
     */
    static getInstance() {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }
    
    /**
     * Initialize Web Audio API
     */
    initAudio() {
        // Create audio context if it doesn't exist
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    /**
     * Play a sound with specified parameters or using a preset
     * @param {string|Object} preset - Preset name or custom sound parameters
     */
    playSound(preset) {
        // Initialize audio context if needed (for browsers that require user interaction)
        this.initAudio();
        
        // Get sound parameters
        let soundParams;
        
        if (typeof preset === 'string') {
            // Use a predefined preset
            soundParams = this.soundPresets[preset];
            if (!soundParams) {
                console.error(`Sound preset "${preset}" not found`);
                return;
            }
        } else {
            // Use custom parameters
            soundParams = preset;
        }
        
        const { frequency, duration, volume } = soundParams;
        
        // Check if this is a sun collision sound (low frequency explosion)
        if (frequency === this.soundPresets.sunCollision.frequency) {
            // Create explosion sound for sun collision
            this.createExplosionSound(duration, volume);
        } else {
            // Create simple tone for other sounds
            this.createSimpleTone(frequency, duration, volume);
        }
    }
    
    /**
     * Create a pop sound for planet creation
     * @param {number} frequency - Sound frequency in Hz
     * @param {number} duration - Sound duration in milliseconds
     * @param {number} volume - Sound volume (0-1)
     */
    createSimpleTone(frequency, duration, volume) {
        const currentTime = this.audioContext.currentTime;
        const durationSec = duration / 1000;
        
        // Create oscillator for the main tone
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'triangle'; // Triangle wave for softer sound
        oscillator.frequency.value = frequency;
        
        // Create noise for the "pop" effect
        const bufferSize = this.audioContext.sampleRate * durationSec;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Fill the buffer with noise that fades out quickly
        for (let i = 0; i < bufferSize; i++) {
            // Exponential decay for quick fade out
            const decay = Math.exp(-10 * i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * decay;
        }
        
        // Create noise source
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        // Create gain nodes for volume control with envelope
        const mainGain = this.audioContext.createGain();
        const noiseGain = this.audioContext.createGain();
        
        // Set initial volume
        mainGain.gain.setValueAtTime(0, currentTime);
        noiseGain.gain.setValueAtTime(0, currentTime);
        
        // Create quick attack
        mainGain.gain.linearRampToValueAtTime(volume, currentTime + 0.01);
        noiseGain.gain.linearRampToValueAtTime(volume * 0.5, currentTime + 0.01);
        
        // Create quick decay for "pop" sound
        mainGain.gain.exponentialRampToValueAtTime(0.001, currentTime + durationSec);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + durationSec * 0.5);
        
        // Create bandpass filter for the noise to shape the "pop" sound
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = frequency * 1.5;
        filter.Q.value = 1;
        
        // Connect nodes
        oscillator.connect(mainGain);
        noise.connect(filter);
        filter.connect(noiseGain);
        
        mainGain.connect(this.audioContext.destination);
        noiseGain.connect(this.audioContext.destination);
        
        // Start and stop the sounds
        oscillator.start(currentTime);
        noise.start(currentTime);
        
        oscillator.stop(currentTime + durationSec);
        noise.stop(currentTime + durationSec);
    }
    
    /**
     * Create an explosion sound for sun collision
     * @param {number} duration - Sound duration in milliseconds
     * @param {number} volume - Sound volume (0-1)
     */
    createExplosionSound(duration, volume) {
        const currentTime = this.audioContext.currentTime;
        const durationSec = duration / 1000;
        
        // Create noise buffer for explosion base
        const bufferSize = this.audioContext.sampleRate * durationSec;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        
        // Fill buffer with noise
        for (let i = 0; i < bufferSize; i++) {
            // Random noise with decay
            const decay = Math.exp(-3 * i / bufferSize);
            data[i] = (Math.random() * 2 - 1) * decay;
        }
        
        // Create noise source
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        // Create low frequency oscillators for rumble effect
        const lfo1 = this.audioContext.createOscillator();
        lfo1.type = 'sine';
        lfo1.frequency.value = 5; // Extremely low frequency for deep rumble
        
        const lfo2 = this.audioContext.createOscillator();
        lfo2.type = 'square';
        lfo2.frequency.value = 15; // Very low frequency for bass effect
        
        // Create gain nodes
        const noiseGain = this.audioContext.createGain();
        const lfo1Gain = this.audioContext.createGain();
        const lfo2Gain = this.audioContext.createGain();
        const masterGain = this.audioContext.createGain();
        
        // Set gain values
        noiseGain.gain.value = volume * 0.6;
        lfo1Gain.gain.value = volume * 0.3;
        lfo2Gain.gain.value = volume * 0.2;
        masterGain.gain.value = volume;
        
        // Create envelope for explosion
        masterGain.gain.setValueAtTime(0, currentTime);
        masterGain.gain.linearRampToValueAtTime(volume, currentTime + 0.02); // Quick attack
        masterGain.gain.exponentialRampToValueAtTime(volume * 0.8, currentTime + 0.1); // Initial decay
        masterGain.gain.exponentialRampToValueAtTime(volume * 0.4, currentTime + 0.3); // Mid decay
        masterGain.gain.exponentialRampToValueAtTime(0.001, currentTime + durationSec); // Long tail
        
        // Create filters
        const lowpass = this.audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 200; // Lower cutoff frequency to reduce high frequencies
        lowpass.Q.value = 0.8; // Smoother filter response
        
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 30;
        highpass.Q.value = 1;
        
        // Create distortion for more aggressive sound
        const distortion = this.audioContext.createWaveShaper();
        distortion.curve = this.makeDistortionCurve(50); // High distortion
        
        // Connect nodes
        noise.connect(noiseGain);
        lfo1.connect(lfo1Gain);
        lfo2.connect(lfo2Gain);
        
        noiseGain.connect(lowpass);
        lfo1Gain.connect(lowpass);
        lfo2Gain.connect(lowpass);
        
        lowpass.connect(highpass);
        highpass.connect(distortion);
        distortion.connect(masterGain);
        masterGain.connect(this.audioContext.destination);
        
        // Start and stop the sounds
        noise.start(currentTime);
        lfo1.start(currentTime);
        lfo2.start(currentTime);
        
        noise.stop(currentTime + durationSec);
        lfo1.stop(currentTime + durationSec);
        lfo2.stop(currentTime + durationSec);
    }
    
    /**
     * Create distortion curve for explosion sound
     * @param {number} amount - Amount of distortion
     * @returns {Float32Array} Distortion curve
     */
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; ++i) {
            const x = i * 2 / samples - 1;
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }
}

// Initialize singleton instance
AudioManager.instance = null;
