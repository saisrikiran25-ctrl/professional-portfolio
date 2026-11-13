/**
 * The hero corridor: an endless aisle of cards receding into a lit haze.
 * Raw WebGL2, no engine. The camera flies down +Z as you scroll; a band of
 * light sits ahead of the camera and takes on the colour of the active card.
 */

export type RGB = [number, number, number];

export interface Corridor {
  resize(cssW: number, cssH: number, quality?: number): void;
  render(camZ: number, time: number, tintA: RGB, tintB: RGB, mix: number, lookX?: number, lookY?: number): void;
  dispose(): void;
}

const ROW_Y = [-1.25, 0.85, 2.95];
const CARD_H = 1.8;
const CARD_LEN = 3.2; // 16:9 with CARD_H
const PITCH = 3.45;
const WALL = 4.6;
const FLOOR_Y = -2.3;
const CEIL_Y = 5.6;
const START_Z = 4;

/** how far the camera can travel before the geometry runs out */
export const CORRIDOR_TRAVEL = 96;
const COUNT = 74;

const COMMON = `
uniform vec3 u_cam;
uniform vec3 u_tintA;
uniform vec3 u_tintB;
uniform float u_mix;
vec3 tint() { return mix(u_tintA, u_tintB, u_mix); }
float bandAt(float d) { float x = (d - 26.0) / 20.0; return exp(-x * x); }
vec3 hazeAt(float d, float band) { return vec3(0.032, 0.04, 0.058) + tint() * 0.13 * band; }
`;

const CARD_VS = `#version 300 es
in vec3 a_pos; in vec2 a_uv; in vec2 a_loc;
uniform mat4 u_vp; uniform float u_mirror;
out vec2 v_uv; out vec2 v_loc; out vec3 v_pos;
void main() {
  vec3 p = a_pos;
  v_pos = a_pos;
  if (u_mirror > 0.5) p.y = ${(2 * FLOOR_Y).toFixed(2)} - p.y;
  v_uv = a_uv; v_loc = a_loc;
  gl_Position = u_vp * vec4(p, 1.0);
}`;

const CARD_FS = `#version 300 es
precision highp float;
${COMMON}
uniform sampler2D u_atlas;
uniform float u_mirror;
in vec2 v_uv; in vec2 v_loc; in vec3 v_pos;
out vec4 o;
void main() {
  float d = v_pos.z - u_cam.z;
  float band = bandAt(d);
  vec3 T = tint();
  vec3 tex = texture(u_atlas, v_uv).rgb;
  float edge = min(min(v_loc.x, 1.0 - v_loc.x), min(v_loc.y, 1.0 - v_loc.y));
  float rim = 1.0 - smoothstep(0.0, 0.022, edge);
  float lum = 0.05 + 0.78 * band + 0.16 * exp(-max(d, 0.0) * 0.09);
  vec3 col = tex * lum;
  col += mix(vec3(0.5), T, 0.5) * rim * (0.05 + 0.5 * band);
  float fog = 1.0 - exp(-max(d, 0.0) * 0.024);
  col = mix(col, hazeAt(d, band), fog * 0.82);
  col *= smoothstep(0.4, 3.2, d);
  float a = 1.0;
  if (u_mirror > 0.5) a = 0.22 * exp(-max(d, 0.0) * 0.03);
  o = vec4(col, a);
}`;

const PLANE_VS = `#version 300 es
in vec3 a_pos;
uniform mat4 u_vp;
out vec3 v_pos;
void main() { v_pos = a_pos; gl_Position = u_vp * vec4(a_pos, 1.0); }`;

const FLOOR_FS = `#version 300 es
precision highp float;
${COMMON}
in vec3 v_pos; out vec4 o;
void main() {
  float d = v_pos.z - u_cam.z;
  float band = bandAt(d);
  vec3 T = tint();
  float lane = exp(-pow(v_pos.x / 1.7, 2.0));
  float seam = 1.0 - smoothstep(0.0, 0.06, abs(fract(v_pos.z / ${PITCH.toFixed(2)}) - 0.5) * 2.0 - 0.0);
  vec3 col = vec3(0.016, 0.02, 0.03) + T * (0.05 + 0.2 * lane) * band + vec3(0.02) * seam * 0.4;
  float fog = 1.0 - exp(-max(d, 0.0) * 0.02);
  col = mix(col, hazeAt(d, band), fog * 0.8);
  col *= smoothstep(0.2, 2.0, d);
  o = vec4(col, 1.0);
}`;

const CEIL_FS = `#version 300 es
precision highp float;
${COMMON}
in vec3 v_pos; out vec4 o;
void main() {
  float d = v_pos.z - u_cam.z;
  float band = bandAt(d);
  vec3 T = tint();
  float rail = exp(-pow(v_pos.x / 0.16, 2.0));
  float dash = 0.55 + 0.45 * step(0.5, fract(v_pos.z / 6.0));
  vec3 col = vec3(0.014, 0.018, 0.026) + (T * 1.1 + vec3(0.25)) * rail * (0.3 + 0.9 * band) * dash;
  float fog = 1.0 - exp(-max(d, 0.0) * 0.02);
  col = mix(col, hazeAt(d, band), fog * 0.7);
  col *= smoothstep(0.2, 2.0, d);
  o = vec4(col, 1.0);
}`;

const BG_VS = `#version 300 es
in vec2 a_pos; out vec2 v_uv;
void main() { v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const BG_FS = `#version 300 es
precision highp float;
${COMMON}
uniform float u_aspect;
in vec2 v_uv; out vec4 o;
void main() {
  vec2 c = (v_uv - vec2(0.5, 0.53)) * vec2(u_aspect, 1.0);
  float r2 = dot(c, c);
  vec3 T = tint();
  vec3 core = mix(T, vec3(1.0), 0.5);
  vec3 col = vec3(0.028, 0.034, 0.05) + core * 0.85 * exp(-r2 * 26.0) + T * (0.4 * exp(-r2 * 6.0) + 0.1 * exp(-r2 * 1.2));
  o = vec4(col, 1.0);
}`;

function mul(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
}

function perspective(fovY: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovY / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

function view(cx: number, cy: number, cz: number) {
  // looking down +Z with x right, y up: view-space z = camZ - worldZ
  const m = new Float32Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = -1;
  m[12] = -cx;
  m[13] = -cy;
  m[14] = cz;
  m[15] = 1;
  return m;
}

export function createCorridor(
  canvas: HTMLCanvasElement,
  atlas: HTMLCanvasElement,
  cols: number,
  rows: number,
  tiles: number,
  maxDpr = 1.75
): Corridor | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    powerPreference: 'high-performance',
  }) as WebGL2RenderingContext | null;
  if (!gl) return null;

  let lost = false;
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
  });

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[corridor] shader error', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const program = (vs: string, fs: string) => {
    const v = compile(gl.VERTEX_SHADER, vs);
    const f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram()!;
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      console.warn('[corridor] link error', gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  };

  const pCard = program(CARD_VS, CARD_FS);
  const pFloor = program(PLANE_VS, FLOOR_FS);
  const pCeil = program(PLANE_VS, CEIL_FS);
  const pBg = program(BG_VS, BG_FS);
  if (!pCard || !pFloor || !pCeil || !pBg) return null;

  // ---- geometry: wall cards ------------------------------------------------
  const verts: number[] = [];
  const idx: number[] = [];
  const insetU = 3 / (cols * 768);
  const insetV = 3 / (rows * 432);
  let vi = 0;
  const hash = (a: number, b: number, c: number) => {
    let h = (a * 73856093) ^ (b * 19349663) ^ (c * 83492791);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return (h ^ (h >>> 16)) >>> 0;
  };
  for (const side of [-1, 1]) {
    const x = side * WALL;
    ROW_Y.forEach((y, r) => {
      for (let k = 0; k < COUNT; k++) {
        const z0 = START_Z + k * PITCH + (r === 1 ? PITCH * 0.5 : 0);
        const tile = hash(side + 2, r + 1, k + 1) % tiles;
        const tx = tile % cols;
        const ty = Math.floor(tile / cols);
        const u0 = tx / cols + insetU;
        const u1 = (tx + 1) / cols - insetU;
        const v0 = ty / rows + insetV;
        const v1 = (ty + 1) / rows - insetV;
        const uNear = side < 0 ? u0 : u1;
        const uFar = side < 0 ? u1 : u0;
        const yb = y - CARD_H / 2;
        const yt = y + CARD_H / 2;
        // x y z  u v  lu lv
        verts.push(x, yb, z0, uNear, v1, 0, 1);
        verts.push(x, yt, z0, uNear, v0, 0, 0);
        verts.push(x, yt, z0 + CARD_LEN, uFar, v0, 1, 0);
        verts.push(x, yb, z0 + CARD_LEN, uFar, v1, 1, 1);
        idx.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3);
        vi += 4;
      }
    });
  }
  const vbo = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  const ibo = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
  const cardCount = idx.length;

  const vaoCard = gl.createVertexArray()!;
  gl.bindVertexArray(vaoCard);
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  const stride = 7 * 4;
  const aPos = gl.getAttribLocation(pCard, 'a_pos');
  const aUv = gl.getAttribLocation(pCard, 'a_uv');
  const aLoc = gl.getAttribLocation(pCard, 'a_loc');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, stride, 12);
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, stride, 20);

  // ---- floor + ceiling -----------------------------------------------------
  const far = START_Z + COUNT * PITCH;
  const planeVerts = (y: number) =>
    new Float32Array([-WALL, y, -6, WALL, y, -6, WALL, y, far, -WALL, y, -6, WALL, y, far, -WALL, y, far]);
  const mkPlane = (prog: WebGLProgram, y: number) => {
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, planeVerts(y), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    return { vao, b };
  };
  const floor = mkPlane(pFloor, FLOOR_Y);
  const ceil = mkPlane(pCeil, CEIL_Y);

  // ---- full-screen glow ----------------------------------------------------
  const bgVao = gl.createVertexArray()!;
  gl.bindVertexArray(bgVao);
  const bgB = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, bgB);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const bgLoc = gl.getAttribLocation(pBg, 'a_pos');
  gl.enableVertexAttribArray(bgLoc);
  gl.vertexAttribPointer(bgLoc, 2, gl.FLOAT, false, 0, 0);

  // ---- atlas texture -------------------------------------------------------
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  if (aniso) {
    const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
    gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
  }

  // uniforms
  const U = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
  const uCard = {
    vp: U(pCard, 'u_vp'),
    mirror: U(pCard, 'u_mirror'),
    cam: U(pCard, 'u_cam'),
    a: U(pCard, 'u_tintA'),
    b: U(pCard, 'u_tintB'),
    mix: U(pCard, 'u_mix'),
    atlas: U(pCard, 'u_atlas'),
  };
  const uFloor = { vp: U(pFloor, 'u_vp'), cam: U(pFloor, 'u_cam'), a: U(pFloor, 'u_tintA'), b: U(pFloor, 'u_tintB'), mix: U(pFloor, 'u_mix') };
  const uCeil = { vp: U(pCeil, 'u_vp'), cam: U(pCeil, 'u_cam'), a: U(pCeil, 'u_tintA'), b: U(pCeil, 'u_tintB'), mix: U(pCeil, 'u_mix') };
  const uBg = { cam: U(pBg, 'u_cam'), a: U(pBg, 'u_tintA'), b: U(pBg, 'u_tintB'), mix: U(pBg, 'u_mix'), aspect: U(pBg, 'u_aspect') };

  let W = 1;
  let H = 1;
  let aspect = 1;

  const norm = (c: RGB): [number, number, number] => [c[0] / 255, c[1] / 255, c[2] / 255];

  return {
    resize(cssW, cssH, quality = 1) {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * quality;
      W = Math.max(2, Math.round(cssW * dpr));
      H = Math.max(2, Math.round(cssH * dpr));
      canvas.width = W;
      canvas.height = H;
      aspect = W / H;
    },
    render(camZ, time, tintA, tintB, mix, lookX = 0, lookY = 0) {
      if (lost) return;
      const cx = Math.sin(time * 0.31) * 0.18 + lookX * 1.1;
      const cy = 0.45 + Math.sin(time * 0.23) * 0.06 - lookY * 0.55;
      const fov = (aspect < 0.8 ? 74 : 62) * (Math.PI / 180);
      const vp = mul(perspective(fov, aspect, 0.1, 280), view(cx, cy, camZ));
      const a = norm(tintA);
      const b = norm(tintB);

      gl.viewport(0, 0, W, H);
      gl.clearColor(0.032, 0.04, 0.058, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.CULL_FACE);

      // 1. haze
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.useProgram(pBg);
      gl.uniform3f(uBg.cam, cx, cy, camZ);
      gl.uniform3fv(uBg.a, a);
      gl.uniform3fv(uBg.b, b);
      gl.uniform1f(uBg.mix, mix);
      gl.uniform1f(uBg.aspect, aspect);
      gl.bindVertexArray(bgVao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      // 2. floor + ceiling
      const plane = (prog: WebGLProgram, u: typeof uFloor, vao: WebGLVertexArrayObject) => {
        gl.useProgram(prog);
        gl.uniformMatrix4fv(u.vp, false, vp);
        gl.uniform3f(u.cam, cx, cy, camZ);
        gl.uniform3fv(u.a, a);
        gl.uniform3fv(u.b, b);
        gl.uniform1f(u.mix, mix);
        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };
      plane(pFloor, uFloor, floor.vao);
      plane(pCeil, uCeil, ceil.vao);

      // 3. cards (mirror first, then the real thing)
      gl.useProgram(pCard);
      gl.uniformMatrix4fv(uCard.vp, false, vp);
      gl.uniform3f(uCard.cam, cx, cy, camZ);
      gl.uniform3fv(uCard.a, a);
      gl.uniform3fv(uCard.b, b);
      gl.uniform1f(uCard.mix, mix);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uCard.atlas, 0);
      gl.bindVertexArray(vaoCard);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(uCard.mirror, 1);
      gl.drawElements(gl.TRIANGLES, cardCount, gl.UNSIGNED_SHORT, 0);

      gl.disable(gl.BLEND);
      gl.enable(gl.DEPTH_TEST);
      gl.uniform1f(uCard.mirror, 0);
      gl.drawElements(gl.TRIANGLES, cardCount, gl.UNSIGNED_SHORT, 0);
    },
    dispose() {
      try {
        gl.deleteTexture(tex);
        gl.deleteBuffer(vbo);
        gl.deleteBuffer(ibo);
        gl.deleteBuffer(floor.b);
        gl.deleteBuffer(ceil.b);
        gl.deleteBuffer(bgB);
        gl.deleteVertexArray(vaoCard);
        gl.deleteVertexArray(floor.vao);
        gl.deleteVertexArray(ceil.vao);
        gl.deleteVertexArray(bgVao);
        [pCard, pFloor, pCeil, pBg].forEach((p) => gl.deleteProgram(p));
        // (no loseContext(): React StrictMode remounts reuse the same canvas)
      } catch {
        /* context already gone */
      }
    },
  };
}
