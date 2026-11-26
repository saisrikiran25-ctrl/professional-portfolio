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
  private noiseLong!: AudioBuffer;
  private mx: { lfo?: OscillatorNode; o1: OscillatorNode; o2: OscillatorNode; lp: BiquadFilterNode; g: GainNode; src: AudioBufferSourceNode; hg: GainNode } | null = null;
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

    // a longer noise bed for the intro's wind
    this.noiseLong = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 3), ctx.sampleRate);
    const nl = this.noiseLong.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < nl.length; i++) {
      brown = (brown + 0.04 * (Math.random() * 2 - 1)) / 1.04;
      nl[i] = brown * 3.2;
    }

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

  /** Pull the whole mix down while a demo video plays its own audio, and restore it after. */
  duck(on: boolean) {
    if (!this.ctx || !this._on) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? 0 : 0.5, t, on ? 0.15 : 0.5);
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

  /** Section warp: a filtered-noise sweep that rises, then two bells as you arrive. */
  whoosh() {
    if (!this.ctx || !this._on) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 2.2;
    bp.frequency.setValueAtTime(260, now);
    bp.frequency.exponentialRampToValueAtTime(3200, now + 0.6);
    bp.frequency.exponentialRampToValueAtTime(700, now + 1.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.07, now + 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
    src.connect(bp).connect(g).connect(this.master);
    g.connect(this.send);
    src.start(now);
    src.stop(now + 1.3);
    setTimeout(() => this.bell(7, 0.5, -0.1, 1.2), 620);
    setTimeout(() => this.bell(11, 0.45, 0.2, 1.5), 760);
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

  /** The fall: a rising rush of wind, then one deep boom as the screen goes black. */
  introFall() {
    if (!this.ctx || !this._on) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseLong;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.3;
    bp.frequency.setValueAtTime(150, now);
    bp.frequency.exponentialRampToValueAtTime(4800, now + 1.15);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.95);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
    src.connect(bp).connect(g);
    g.connect(this.master);
    g.connect(this.send);
    src.start(now);
    src.stop(now + 1.6);
    // the boom
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(78, now + 1.0);
    o.frequency.exponentialRampToValueAtTime(26, now + 1.75);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, now + 1.0);
    bg.gain.exponentialRampToValueAtTime(0.4, now + 1.04);
    bg.gain.exponentialRampToValueAtTime(0.0001, now + 2.1);
    o.connect(bg);
    bg.connect(this.master);
    bg.connect(this.send);
    o.start(now + 1.0);
    o.stop(now + 2.2);
    // the drone falls away
    this.matrixStop(1.1);
  }

  /** Digital rain intro: a low data hum and a faint hiss that swell with the load. */
  matrixStart() {
    if (!this.ctx || !this._on || this.mx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 260;
    lp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.03, now + 1.0);
    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = 55;
    const o2 = ctx.createOscillator();
    o2.type = 'square';
    o2.frequency.value = 110;
    o2.detune.value = 6;
    const o2g = ctx.createGain();
    o2g.gain.value = 0.12;
    o1.connect(lp);
    o2.connect(o2g).connect(lp);
    lp.connect(g);
    g.connect(this.master);
    g.connect(this.send);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseLong;
    src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3800;
    const hg = ctx.createGain();
    hg.gain.value = 0.0001;
    src.connect(hp).connect(hg);
    hg.connect(this.master);
    o1.start(now);
    o2.start(now);
    src.start(now);
    this.mx = { o1, o2, lp, g, src, hg };
  }

  matrixProgress(p: number) {
    if (!this.ctx || !this._on || !this.mx) return;
    const t = this.ctx.currentTime;
    const m = this.mx;
    m.o1.frequency.setTargetAtTime(55 + 28 * p, t, 0.2);
    m.o2.frequency.setTargetAtTime(110 + 56 * p, t, 0.2);
    m.lp.frequency.setTargetAtTime(260 + 950 * p, t, 0.2);
    m.g.gain.setTargetAtTime(0.03 + 0.08 * p, t, 0.25);
    m.hg.gain.setTargetAtTime(0.002 + 0.02 * p, t, 0.25);
  }

  /** A tiny digital chirp, like a line of code printing. */
  matrixPip() {
    if (!this.ctx || !this._on) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = Math.random() < 0.5 ? 'sine' : 'triangle';
    o.frequency.value = 1400 + Math.random() * 2800;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.016, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    o.connect(g).connect(this.master);
    g.connect(this.send);
    o.start(now);
    o.stop(now + 0.06);
  }

  /** The name locks on: a low stab and two bright bells. */
  matrixLock() {
    if (!this.ctx || !this._on) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    for (const [f, v] of [[110, 0.2], [220, 0.12], [330, 0.07]] as [number, number][]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(v, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);
      o.connect(g).connect(this.master);
      g.connect(this.send);
      o.start(now);
      o.stop(now + 1.4);
    }
    this.bell(7, 0.5, -0.15, 1.6);
    setTimeout(() => this.bell(11, 0.45, 0.2, 2.0), 140);
  }

  matrixStop(fade = 0.5) {
    const m = this.mx;
    if (!this.ctx || !m) return;
    this.mx = null;
    const t = this.ctx.currentTime;
    m.g.gain.cancelScheduledValues(t);
    m.g.gain.setTargetAtTime(0.0001, t, fade / 3);
    m.hg.gain.cancelScheduledValues(t);
    m.hg.gain.setTargetAtTime(0.0001, t, fade / 3);
    const end = t + fade + 0.4;
    m.o1.stop(end);
    m.o2.stop(end);
    m.src.stop(end);
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
