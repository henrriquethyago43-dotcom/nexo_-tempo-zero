/**
 * Sound Manager for NEXO: TEMPO ZERO using the Web Audio API.
 * Synthesizes retro-futuristic sci-fi sound effects and ambient synth music.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private step: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.25;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.55;
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Laser shot (Plasma gun)
  public playShoot() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(950, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  // Chrono Sabre Slash
  public playSlash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // White noise burst + resonant sweep
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.15);
    filter.Q.value = 4.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // Dash Jet Thrust
  public playDash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  // Jump
  public playJump(isDouble: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const startFreq = isDouble ? 340 : 220;
    const endFreq = isDouble ? 680 : 440;

    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }

  // Echo Recording Started
  public playEchoRecordStart() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const notes = [329.63, 440.0, 587.33, 880.0]; // E4, A4, D5, A5
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.04);

      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.04 + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(this.ctx!.currentTime + idx * 0.04);
      osc.stop(this.ctx!.currentTime + idx * 0.04 + 0.18);
    });
  }

  // Echo Clone Materialized / Rewind replay
  public playEchoSpawn() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    // Resonant futuristic digital phase
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  }

  // Hit Impact / Damage Taken
  public playHit() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Enemy Destroyed / Explosion
  public playExplosion() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.1));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start();
  }

  // Item pickup
  public playPickup() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06); // E5
    osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.12); // G5
    osc.frequency.setValueAtTime(1046.50, this.ctx.currentTime + 0.18); // C6

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  // Pressure Plate Click
  public playClick() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Door Opening / Hydraulics
  public playDoorOpen() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(190, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  // Background Synth Music Loop
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.step = 0;

    // Dark synthwave cyberpunk sequence (120 BPM = 125ms per 16th note)
    const bpm = 118;
    const intervalMs = (60 / bpm / 4) * 1000;

    const bassLine = [55, 55, 0, 55, 65.41, 0, 55, 0, 49, 49, 0, 49, 58.27, 0, 49, 0]; // A1, C2, G1, A#1
    const leadArp = [220, 261.63, 329.63, 440, 392, 329.63, 261.63, 220]; // A3 minor arpeggio

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const step16 = this.step % 16;
      const bassNote = bassLine[step16];

      // Bass synth
      if (bassNote > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const bGain = this.ctx.createGain();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassNote, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(260, now);
        bassFilter.frequency.exponentialRampToValueAtTime(80, now + 0.12);

        bGain.gain.setValueAtTime(0.22, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bGain);
        bGain.connect(this.musicGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.14);
      }

      // Kick on 0, 4, 8, 12
      if (step16 % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();

        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

        kGain.gain.setValueAtTime(0.3, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        kickOsc.connect(kGain);
        kGain.connect(this.musicGain);

        kickOsc.start(now);
        kickOsc.stop(now + 0.1);
      }

      // Hi-hat on offbeat (2, 6, 10, 14)
      if (step16 % 2 === 1) {
        const hhOsc = this.ctx.createOscillator();
        const hhGain = this.ctx.createGain();

        hhOsc.type = 'highpass' as unknown as OscillatorType;
        // highpass filter with noise-like metallic chirp
        const hatOsc = this.ctx.createOscillator();
        hatOsc.type = 'square';
        hatOsc.frequency.setValueAtTime(8000, now);

        hhGain.gain.setValueAtTime(0.04, now);
        hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        hatOsc.connect(hhGain);
        hhGain.connect(this.musicGain);

        hatOsc.start(now);
        hatOsc.stop(now + 0.03);
      }

      // Atmospheric lead arp
      if (step16 % 2 === 0) {
        const arpNote = leadArp[(this.step / 2) % leadArp.length];
        const leadOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();

        leadOsc.type = 'triangle';
        leadOsc.frequency.setValueAtTime(arpNote, now);

        lGain.gain.setValueAtTime(0.08, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        leadOsc.connect(lGain);
        lGain.connect(this.musicGain);

        leadOsc.start(now);
        leadOsc.stop(now + 0.2);
      }

      this.step++;
    }, intervalMs);
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

export const soundManager = new SoundSystem();
