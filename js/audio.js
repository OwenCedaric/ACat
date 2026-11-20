/**
 * Web Audio API based Sound Synthesizer for Ink Wash Cat Game
 * Synthesizes traditional Chinese instruments (Guqin, Bamboo, Water, Chimes)
 * Zero external asset dependencies - instant loading and low latency.
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.ambientGain = null;
        this.masterGain = null;
        this.isMuted = false;
        
        // Pentatonic scale frequencies in Hz (Gong, Shang, Jiao, Zhi, Yu)
        // Key of D / A
        this.pentatonicScale = [
            220.00, // A3
            246.94, // B3
            277.18, // C#4
            329.63, // E4
            369.99, // F#4
            440.00, // A4
            493.88, // B4
            554.37, // C#5
            659.25, // E5
            739.99  // F#5
        ];
        
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            
            this.initialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported", e);
        }
    }

    resume() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    // Play a plucked Guqin (Chinese Zither) string tone
    playPluck(freq = 330, duration = 1.2, intensity = 0.5) {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Guqin timbre: triangle with lowpass warmth
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        // Subtle pitch bend down (traditional Guqin finger slide)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.99, t + duration);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 3.5, t);
        filter.frequency.exponentialRampToValueAtTime(150, t + duration * 0.8);
        filter.Q.setValueAtTime(2, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(intensity * 0.5, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + duration);
    }

    // Jump sound: graceful brush stroke whoosh
    playJump(power = 1.0) {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        
        // Pluck tone
        const note = this.pentatonicScale[Math.floor(Math.random() * 4) + 2];
        this.playPluck(note * (0.8 + power * 0.3), 0.4, 0.3);

        // Brush noise whoosh
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(1200 + power * 600, t + 0.18);
        filter.Q.setValueAtTime(1.5, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15 * power, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(t);
        noise.stop(t + 0.2);
    }

    // Landing sound: tile, wood, or stone
    playLand(surfaceType = 'tile') {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        let baseFreq = 120;
        let duration = 0.15;
        if (surfaceType === 'wood') baseFreq = 160;
        if (surfaceType === 'water') {
            this.playWaterSplash();
            return;
        }
        if (surfaceType === 'bamboo') {
            this.playBambooSnap();
            return;
        }

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + duration);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + duration);
    }

    // Water ripple / splash sound
    playWaterSplash() {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        // Water drip frequency sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.25);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.25);
    }

    // Bamboo spring sound
    playBambooSnap() {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(540, t + 0.08);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.3);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.3);
    }

    // Collect dried fish or ink droplet
    playCollect() {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const f1 = this.pentatonicScale[5];
        const f2 = this.pentatonicScale[7];

        this.playPluck(f1, 0.5, 0.4);
        setTimeout(() => {
            this.playPluck(f2, 0.6, 0.5);
        }, 80);
    }

    // Cat Meow (water ink kitten purr/meow)
    playMeow() {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        // Pitch contour of a soft cat meow: ~450 -> 680 -> 400
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(700, t + 0.15);
        osc.frequency.exponentialRampToValueAtTime(420, t + 0.45);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(1400, t + 0.2);
        filter.frequency.exponentialRampToValueAtTime(700, t + 0.45);
        filter.Q.setValueAtTime(3.0, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.45);
    }

    // Level Victory Fanfare (Zen Pentatonic Arpeggio)
    playVictory() {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const notes = [
            this.pentatonicScale[2],
            this.pentatonicScale[4],
            this.pentatonicScale[5],
            this.pentatonicScale[7],
            this.pentatonicScale[9]
        ];

        notes.forEach((freq, idx) => {
            setTimeout(() => {
                this.playPluck(freq, 1.2, 0.5);
            }, idx * 160);
        });
    }

    // Game Over / Plunge in water
    playDefeat() {
        if (!this.ctx || this.isMuted) return;
        this.resume();

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, t);
        osc.frequency.exponentialRampToValueAtTime(75, t + 0.6);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.6);
    }
}

window.soundManager = new SoundManager();
