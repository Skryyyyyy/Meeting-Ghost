export interface RendererOptions {
  canvas: HTMLCanvasElement;
}

export interface BlackHoleRenderer {
  ready: Promise<void>;
  dispose: () => void;
}

export function createRenderer({ canvas }: RendererOptions): BlackHoleRenderer {
  let isDisposed = false;
  let animationFrameId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let positionBuffer: WebGLBuffer | null = null;

  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetMouseX = 0.5;
  let targetMouseY = 0.5;

  const handlePointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      targetMouseX = (e.clientX - rect.left) / rect.width;
      targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height;
    }
  };

  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    varying vec2 v_uv;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    #define PI 3.14159265359

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = rot * p * 2.0 + vec2(100.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      
      vec2 mouseOffset = (u_mouse - 0.5) * 0.35;
      vec2 center = vec2(0.0, 0.0) + mouseOffset;
      vec2 p = uv - center;

      float dist = length(p);

      float rs = 0.18;
      float photonSphere = rs * 1.5;

      float deflection = 0.0;
      if (dist > 0.001) {
        deflection = (rs * 1.35) / (dist + 0.06);
      }

      vec2 deflectedP = p * (1.0 - deflection * 0.45);

      vec2 starUV = deflectedP * 8.0;
      float stars = pow(hash(floor(starUV)), 25.0) * 1.8;
      vec3 starColor = vec3(stars) * vec3(0.85, 0.9, 1.0);

      vec2 diskCoord = p;
      diskCoord.y /= 0.38;
      float diskDist = length(diskCoord);
      float diskAngle = atan(diskCoord.y, diskCoord.x);

      float time = u_time * 0.6;
      float rotation = diskAngle - time * (1.8 / (diskDist + 0.2));
      vec2 swirlUV = vec2(diskDist * 4.0, rotation * 2.5);
      float turbulence = fbm(swirlUV + vec2(time * 0.2, 0.0));

      float innerRim = rs * 1.3;
      float outerRim = rs * 5.2;
      float diskMask = smoothstep(innerRim, innerRim + 0.08, diskDist) * (1.0 - smoothstep(outerRim - 0.4, outerRim, diskDist));
      
      float doppler = clamp(cos(diskAngle + 0.4) * 0.65 + 0.6, 0.2, 1.6);
      float diskIntensity = diskMask * turbulence * doppler * 2.2;

      vec3 colInner = vec3(1.0, 0.95, 0.85);
      vec3 colMid   = vec3(0.95, 0.55, 0.15);
      vec3 colOuter = vec3(0.75, 0.18, 0.05);
      
      float colorT = clamp((diskDist - innerRim) / (outerRim - innerRim), 0.0, 1.0);
      vec3 diskColor = mix(colInner, colMid, smoothstep(0.0, 0.4, colorT));
      diskColor = mix(diskColor, colOuter, smoothstep(0.4, 1.0, colorT));
      diskColor *= diskIntensity;

      float photonRing = exp(-pow(dist - photonSphere, 2.0) / 0.0004) * 1.4;
      vec3 photonRingColor = vec3(1.0, 0.92, 0.8) * photonRing;

      float secondaryArc = exp(-pow(dist - (rs * 1.15), 2.0) / 0.0008) * 0.8 * turbulence;
      vec3 secondaryColor = vec3(1.0, 0.6, 0.2) * secondaryArc;

      float shadowMask = smoothstep(rs, rs + 0.015, dist);

      vec3 finalColor = starColor;
      finalColor += diskColor;
      finalColor += photonRingColor;
      finalColor += secondaryColor;
      finalColor *= shadowMask;

      float ambientGlow = exp(-dist * 2.2) * 0.35;
      finalColor += vec3(0.9, 0.45, 0.15) * ambientGlow * shadowMask;

      float vignette = 1.0 - smoothstep(0.5, 1.2, length(uv));
      finalColor *= vignette;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const init = async () => {
    try {
      gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext);
      if (!gl) {
        console.warn("WebGL not supported for BlackHole component, falling back to 2D canvas.");
        init2DFallback();
        return;
      }

      const compileShader = (type: number, source: string): WebGLShader | null => {
        if (!gl) return null;
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vertShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
      const fragShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

      if (!vertShader || !fragShader) return;

      program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program link failed:", gl.getProgramInfoLog(program));
        return;
      }

      gl.useProgram(program);

      const positions = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]);

      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const posAttrLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(posAttrLocation);
      gl.vertexAttribPointer(posAttrLocation, 2, gl.FLOAT, false, 0, 0);

      const uResolution = gl.getUniformLocation(program, "u_resolution");
      const uTime = gl.getUniformLocation(program, "u_time");
      const uMouse = gl.getUniformLocation(program, "u_mouse");

      const handleResize = () => {
        if (!canvas || isDisposed) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const displayWidth = Math.floor(canvas.clientWidth * dpr);
        const displayHeight = Math.floor(canvas.clientHeight * dpr);

        if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
          canvas.width = displayWidth || 300;
          canvas.height = displayHeight || 150;
        }
        if (gl) {
          gl.viewport(0, 0, canvas.width, canvas.height);
        }
      };

      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(canvas);
      handleResize();

      canvas.addEventListener("pointermove", handlePointerMove);

      const startTime = performance.now();

      const render = (now: number) => {
        if (isDisposed || !gl || !program) return;

        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        const elapsedTime = (now - startTime) * 0.001;

        gl.useProgram(program);
        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uTime, elapsedTime);
        gl.uniform2f(uMouse, mouseX, mouseY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameId = requestAnimationFrame(render);
      };

      animationFrameId = requestAnimationFrame(render);
    } catch (err) {
      console.warn("BlackHole WebGL init error:", err);
      init2DFallback();
    }
  };

  const init2DFallback = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    const render2D = () => {
      if (isDisposed) return;
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#030303";
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5;
      const cy = h * 0.5;
      const r = Math.min(w, h) * 0.22;

      const grad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 2.2);
      grad.addColorStop(0, "rgba(255, 180, 50, 0.8)");
      grad.addColorStop(0.4, "rgba(230, 90, 20, 0.4)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 230, 180, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 1.4, r * 0.4, time * 0.2, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render2D);
    };

    animationFrameId = requestAnimationFrame(render2D);
  };

  const readyPromise = init();

  return {
    ready: readyPromise,
    dispose: () => {
      isDisposed = true;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      canvas.removeEventListener("pointermove", handlePointerMove);
      if (gl) {
        if (positionBuffer) gl.deleteBuffer(positionBuffer);
        if (program) gl.deleteProgram(program);
      }
    },
  };
}
