/**
 * Procedural sound — no audio files.
 *
 *  - A soft ambient pad (Am add9, pure sine/triangle voices) breathing through a
 *    slow low-pass. It never changes pitch, so scrolling can't "whine".
 *  - Scrolling is felt as quiet, quantised mechanical ticks (like a dial detent),
 *    not as a continuous tone.
 *  - Interactions are glassy FM bells on a pentatonic scale, so anything you
 *    touch stays consonant. Hover sounds are softer and shorter than clicks.
 *  - Everything runs through a generated reverb and a limiter.
 *
 * Always opt-in: nothing plays until `enable()` is called from a user gesture.
 */

// A minor pentatonic across three octaves (A C E G + 9th colour)
const SCALE = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84];
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

type Listener = () => void;

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private comp!: DynamicsCompressorNode;
  private send!: GainNode;
  private analyser!: AnalyserNode;
  private freq = new Uint8Array(64);
  private padGain!: GainNode;
  private padFilter!: BiquadFilterNode;
  private noise!: AudioBuffer;
  private listeners = new Set<Listener>();
  private _on = false;
  private lastBlip = 0;
  private lastTick = 0;
  private acc = 0;
  private tickStep = 0;

  get on() {
    return this._on;
  }

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  getSnapshot = () => this._on;

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private build() {
    const AC: typeof AudioContext | undefined = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return false;
    try {
      this.ctx = new AC();
    } catch {
      this.ctx = null;
      return false;
    }
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.comp = ctx.createDynamicsCompressor();
    this.comp.threshold.value = -16;
    this.comp.knee.value = 12;
    this.comp.ratio.value = 6;
    this.comp.attack.value = 0.005;
    this.comp.release.value = 0.3;
    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.82;
    this.master.connect(this.comp).connect(ctx.destination);
    this.master.connect(this.analyser);

    // generated reverb: a long, dark, smoothed noise tail
    const len = Math.floor(ctx.sampleRate * 3.2);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len;
        lp += (0.32 - 0.26 * t) * (Math.random() * 2 - 1 - lp);
        d[i] = lp * Math.pow(1 - t, 2.8) * Math.min(1, i / (ctx.sampleRate * 0.02));
      }
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    this.send = ctx.createGain();
    const wet = ctx.createGain();
    wet.gain.value = 0.5;
    this.send.connect(conv).connect(wet).connect(this.master);

    // short white-noise buffer used for the scroll ticks
    this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
    const nd = this.noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

    // ambient pad: pure voices through a slowly moving low-pass
    this.padFilter = ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.value = 520;
    this.padFilter.Q.value = 0.4;
    this.padGain = ctx.createGain();
    this.padGain.gain.value = 0;
    this.padFilter.connect(this.padGain);
    this.padGain.connect(this.master);
    this.padGain.connect(this.send);
    const voices: [number, OscillatorType, number, number][] = [
      [45, 'sine', 0.55, -4], // A1 sub
      [57, 'sine', 0.42, 3], // A2
      [64, 'triangle', 0.22, -3], // E3
      [72, 'sine', 0.2, 4], // C4
      [76, 'sine', 0.13, -2], // E4
      [83, 'sine', 0.08, 5], // B4  (the "add9" shimmer)
    ];
    for (const [n, type, g, detune] of voices) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = midi(n);
      o.detune.value = detune;
      const vg = ctx.createGain();
      vg.gain.value = g;
      o.connect(vg).connect(this.padFilter);
      o.start();
    }
    // slow breathing of the filter and level
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 180;
    lfo.connect(lfoDepth).connect(this.padFilter.frequency);
    lfo.start();

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx || !this._on) return;
      if (document.hidden) this.ctx.suspend().catch(() => {});
      else this.ctx.resume().catch(() => {});
    });
    return true;
  }

  /** Must be called from a user gesture (click / key). */
  enable() {
    if (!this.ctx && !this.build()) return false;
    const ctx = this.ctx!;
    ctx.resume().catch(() => {});
    const t = ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0.5, t, 0.3);
    this.padGain.gain.cancelScheduledValues(t);
    this.padGain.gain.setTargetAtTime(0.085, t + 0.1, 1.4);
    this._on = true;
    this.emit();
    // a small rising "power-on" figure
    this.bell(5, 0.7, -0.2, 1.4);
    setTimeout(() => this.bell(7, 0.6, 0, 1.4), 150);
    setTimeout(() => this.bell(9, 0.5, 0.25, 1.8), 300);
    return true;
  }

  disable() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0, t, 0.14);
    this._on = false;
    this.emit();
    const ctx = this.ctx;
    setTimeout(() => {
      if (!this._on) ctx.suspend().catch(() => {});
    }, 600);
  }

  toggle() {
    if (this._on) this.disable();
    else this.enable();
  }

  /** Glassy FM bell: a sine carrier whose modulation decays fast. */
  private bell(step: number, vel = 0.5, pan = 0, dur = 0.9) {
    if (!this.ctx || !this._on) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const n = SCALE[((step % SCALE.length) + SCALE.length) % SCALE.length];
    const f = midi(n + 12 * Math.floor(step / SCALE.length));

    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = f;
    const mod = ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.value = f * 2;
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(f * 1.1, now);
    modGain.gain.exponentialRampToValueAtTime(f * 0.02, now + 0.35);
    mod.connect(modGain).connect(carrier.frequency);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(0.13 * vel, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 4200;

    // a faint octave "sparkle" so it reads as tech rather than a toy
    const spark = ctx.createOscillator();
    spark.type = 'sine';
    spark.frequency.value = f * 4;
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.0001, now);
    sg.gain.exponentialRampToValueAtTime(0.025 * vel, now + 0.004);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    carrier.connect(env);
    spark.connect(sg).connect(env);
    env.connect(lp);
    let out: AudioNode = lp;
    if (ctx.createStereoPanner) {
      const p = ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      lp.connect(p);
      out = p;
    }
    out.connect(this.master);
    out.connect(this.send);
    for (const o of [carrier, mod, spark]) {
      o.start(now);
      o.stop(now + dur + 0.05);
    }
  }

  /** Hover / selection tone — soft and short. */
  blip(step: number, vel = 0.5, pan = 0) {
    if (!this.ctx || !this._on) return;
    const now = this.ctx.currentTime;
    if (now - this.lastBlip < 0.045) return; // fast hovers shouldn't stack
    this.lastBlip = now;
    this.bell(step + 3, vel * 0.7, pan, 0.55);
  }

  /** Press / open — a low, rounded tap with a hint of click. */
  thock(vel = 0.6) {
    if (!this.ctx || !this._on) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, now);
    o.frequency.exponentialRampToValueAtTime(58, now + 0.14);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16 * vel, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    o.connect(g).connect(this.master);
    g.connect(this.send);
    o.start(now);
    o.stop(now + 0.26);
    this.click(0.5 * vel, 2400);
    this.bell(2, 0.35 * vel, 0, 0.7);
  }

  /** A very short filtered noise tick. */
  private click(vel: number, hz: number) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = hz;
    bp.Q.value = 5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.06 * vel, now + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    src.connect(bp).connect(g).connect(this.master);
    src.start(now);
    src.stop(now + 0.05);
  }

  /** Scroll detent: one soft tick roughly every ~110px travelled. */
  private tick(speed: number) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastTick < 0.07) return;
    this.lastTick = now;
    const k = Math.min(1, speed / 3);
    this.click(0.35 + 0.5 * k, 2800 + 1400 * k);
    // an occasional pitched pip, walking up and down the scale
    if (this.tickStep++ % 3 === 0) {
      const n = SCALE[(this.tickStep / 3) % SCALE.length | 0];
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = midi(n + 24);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.012 + 0.014 * k, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      o.connect(g).connect(this.master);
      g.connect(this.send);
      o.start(now);
      o.stop(now + 0.22);
    }
  }

  /** Feed scroll velocity (px per frame). The pad only brightens; pitch never moves. */
  scroll(velocity: number) {
    if (!this.ctx || !this._on) return;
    const v = Math.abs(velocity);
    const k = Math.min(1, v / 3.2);
    const t = this.ctx.currentTime;
    this.padFilter.frequency.setTargetAtTime(520 + 360 * k, t, 0.25);
    this.padGain.gain.setTargetAtTime(0.085 + 0.025 * k, t, 0.3);
    this.acc += v;
    if (this.acc > 110) {
      this.acc = 0;
      this.tick(v);
    }
  }

  /** 0..1 loudness for visuals. */
  level() {
    if (!this.ctx || !this._on) return 0;
    this.analyser.getByteFrequencyData(this.freq);
    let s = 0;
    for (let i = 0; i < 24; i++) s += this.freq[i];
    return Math.min(1, s / (24 * 140));
  }
}

export const sound = new SoundEngine();
