// Web Audio API Synthesizer for BePresent Clone
// Generates focus chimes, click sounds, and relaxing ambient work sounds procedurally.

class AudioSynth {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Beautiful clean focus start/completion chime
  public playChime(success = true) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = success ? [261.63, 329.63, 392.00, 523.25] : [392.00, 329.63, 261.63]; // C Major arpeggio or descending

      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.15, now + index * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 0.65);
      });
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  }

  // Futuristic defensive zap sound when a distraction notification is blocked
  public playBlockZap() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  }

  // Soft tactile tick for the timer
  public playTick() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  }

  // Negative sound when user cancels or gives up
  public playGiveUp() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.3);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      console.error('Web Audio error:', e);
    }
  }

  // Generates real-time ambient "Ocean Waves / Deep Focus" sounds
  public startAmbientWaves(type: 'rain' | 'forest' | 'waves') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Stop existing if running
      this.stopAmbient();

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      // White noise calculation
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Create resonant filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      
      if (type === 'rain') {
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.5, this.ctx.currentTime);
      } else if (type === 'waves') {
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.0, this.ctx.currentTime);
      } else { // forest / gentle breeze
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.Q.setValueAtTime(0.8, this.ctx.currentTime);
      }

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();

      // Store references
      this.noiseNode = whiteNoise;
      this.noiseFilter = filter;
      this.noiseGain = gain;

      // If waves, modulate filter frequency slowly with LFO to simulate wave swishing
      if (type === 'waves' || type === 'forest') {
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();

        lfo.frequency.setValueAtTime(type === 'waves' ? 0.12 : 0.25, this.ctx.currentTime); // very slow 0.12Hz
        lfoGain.gain.setValueAtTime(type === 'waves' ? 180 : 300, this.ctx.currentTime); // shift filter by up to 180Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();

        // Chain LFO to stop list by attaching it as a child of noiseNode or maintaining it
        (this.noiseNode as any).lfo = lfo;
      }

    } catch (e) {
      console.error('Web Audio ambient sound error:', e);
    }
  }

  public stopAmbient() {
    try {
      if (this.noiseNode) {
        (this.noiseNode as any).stop();
        if ((this.noiseNode as any).lfo) {
          (this.noiseNode as any).lfo.stop();
        }
        this.noiseNode = null;
      }
      this.noiseFilter = null;
      this.noiseGain = null;
    } catch (e) {
      console.error('Error stopping audio:', e);
    }
  }
}

export const synth = new AudioSynth();
