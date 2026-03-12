"use client";

import { useRef, useEffect, useState, useId } from "react";

/** Ripple Grid — как на https://reactbits.dev/backgrounds/ripple-grid (React Bits, WebGL) с fallback на CSS */
export interface RippleGridProps {
  /** Цвет сетки (hex с # или без), например "250995" или "#250995" */
  gridColor?: string;
  className?: string;
  enableRainbow?: boolean;
  rippleIntensity?: number;
  gridSize?: number;
  gridThickness?: number;
  fadeDistance?: number;
  vignetteStrength?: number;
  glowIntensity?: number;
  opacity?: number;
  gridRotation?: number;
  mouseInteraction?: boolean;
  mouseInteractionRadius?: number;
  /** Шаг сетки в px (только для CSS fallback) */
  step?: number;
  /** Смещение центра эффекта по Y (0 = центр, 0.1–0.2 = центр ниже, чтобы эффект не уходил вверх) */
  effectCenterYOffset?: number;
}

function ensureHex(color: string): string {
  return color.startsWith("#") ? color : `#${color}`;
}

/** CSS‑fallback: сетка без WebGL (если ogl/WebGL недоступны) */
function RippleGridCSSFallback({
  gridColor,
  className,
  step = 40,
}: {
  gridColor: string;
  className: string;
  step?: number;
}) {
  const id = useId().replace(/:/g, "");
  const color = ensureHex(gridColor);
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at center, ${color} 1px, transparent 1px)`,
          backgroundSize: `${step}px ${step}px`,
          backgroundPosition: "center center",
        }}
      />
      <div
        className={`absolute inset-0 opacity-[0.15] ripple-grid-pulse-${id}`}
        style={{
          backgroundImage: `radial-gradient(circle at center, ${color} 1.5px, transparent 1.5px)`,
          backgroundSize: `${step}px ${step}px`,
          backgroundPosition: "center center",
          animation: `ripple-grid-pulse 4s ease-in-out infinite`,
        }}
      />
      <style>{`
        @keyframes ripple-grid-pulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.22; }
        }
      `}</style>
    </div>
  );
}

export function RippleGrid({
  gridColor = "250995",
  className = "",
  enableRainbow = false,
  rippleIntensity = 0.05,
  gridSize = 10.0,
  gridThickness = 15.0,
  fadeDistance = 1.5,
  vignetteStrength = 2.0,
  glowIntensity = 0.1,
  opacity = 1.0,
  gridRotation = 0,
  mouseInteraction = true,
  mouseInteractionRadius = 1,
  step = 36,
  effectCenterYOffset = 0,
}: RippleGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);
  const mousePositionRef = useRef({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const mouseInfluenceRef = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const uniformsRef = useRef<{
    iTime: { value: number };
    enableRainbow: { value: boolean };
    gridColor: { value: [number, number, number] };
    rippleIntensity: { value: number };
    gridSize: { value: number };
    gridThickness: { value: number };
    fadeDistance: { value: number };
    vignetteStrength: { value: number };
    glowIntensity: { value: number };
    opacity: { value: number };
    gridRotation: { value: number };
    mouseInteraction: { value: boolean };
    mousePosition: { value: [number, number] };
    mouseInfluence: { value: number };
    mouseInteractionRadius: { value: number };
    effectCenterYOffset: { value: number };
    iResolution: { value: [number, number] };
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current || webGLFailed) return;

    let cancelled = false;

    const init = async () => {
      try {
        const { Renderer, Program, Triangle, Mesh } = await import("ogl");
        const container = containerRef.current;
        if (!container || cancelled) return;

        const hexToRgb = (hex: string): [number, number, number] => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result
            ? [
                parseInt(result[1], 16) / 255,
                parseInt(result[2], 16) / 255,
                parseInt(result[3], 16) / 255,
              ]
            : [1, 1, 1];
        };

        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio, 2),
          alpha: true,
        });
        const gl = renderer.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        const canvas = gl.canvas as HTMLCanvasElement;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        container.appendChild(canvas);

        const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

        const frag = `precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
uniform float effectCenterYOffset;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;

  if (gridRotation != 0.0) {
    uv = rotate(gridRotation * pi / 180.0) * uv;
  }

  vec2 uvCenter = vec2(0.0, effectCenterYOffset * 2.0);
  float dist = length(uv - uvCenter);
  float func = sin(pi * (iTime - dist));
  vec2 rippleUv = uv + uv * func * rippleIntensity;

  if (mouseInteraction && mouseInfluence > 0.0) {
    vec2 mouseUv = (mousePosition * 2.0 - 1.0);
    mouseUv.x *= iResolution.x / iResolution.y;
    float mouseDist = length(uv - mouseUv);

    float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));

    float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
    rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
  }

  vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
  vec2 b = abs(a);

  float aaWidth = 0.5;
  vec2 smoothB = vec2(
    smoothstep(0.0, aaWidth, b.x),
    smoothstep(0.0, aaWidth, b.y)
  );

  vec3 color = vec3(0.0);
  color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
  color += exp(-gridThickness * smoothB.y);
  color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
  color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

  if (glowIntensity > 0.0) {
    color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
    color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
  }

  float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));

  vec2 vignetteCoords = vUv - vec2(0.5, 0.5 - effectCenterYOffset);
  float vignetteDistance = length(vignetteCoords);
  float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
  vignette = clamp(vignette, 0.0, 1.0);

  vec3 t;
  if (enableRainbow) {
    t = vec3(
      uv.x * 0.5 + 0.5 * sin(iTime),
      uv.y * 0.5 + 0.5 * cos(iTime),
      pow(cos(iTime), 4.0)
    ) + 0.5;
  } else {
    t = gridColor;
  }

  float finalFade = ddd * vignette;
  float alpha = length(color) * finalFade * opacity;
  gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}`;

        const hex = ensureHex(gridColor);
        const uniforms = {
          iTime: { value: 0 },
          iResolution: { value: [1, 1] as [number, number] },
          enableRainbow: { value: enableRainbow },
          gridColor: { value: hexToRgb(hex) },
          rippleIntensity: { value: rippleIntensity },
          gridSize: { value: gridSize },
          gridThickness: { value: gridThickness },
          fadeDistance: { value: fadeDistance },
          vignetteStrength: { value: vignetteStrength },
          glowIntensity: { value: glowIntensity },
          opacity: { value: opacity },
          gridRotation: { value: gridRotation },
          mouseInteraction: { value: mouseInteraction },
          mousePosition: { value: [0.5, 0.5] as [number, number] },
          mouseInfluence: { value: 0 },
          mouseInteractionRadius: { value: mouseInteractionRadius },
          effectCenterYOffset: { value: effectCenterYOffset },
        };

        uniformsRef.current = uniforms;

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
          vertex: vert,
          fragment: frag,
          uniforms,
        });
        const mesh = new Mesh(gl, { geometry, program });

        const resize = () => {
          const el = containerRef.current;
          if (!el) return;
          const w = el.clientWidth;
          const h = el.clientHeight;
          renderer.setSize(w, h);
          uniforms.iResolution.value = [w, h];
        };

        const handleMouseMove = (e: MouseEvent) => {
          if (!mouseInteraction || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = 1.0 - (e.clientY - rect.top) / rect.height;
          targetMouseRef.current = { x, y };
        };

        const handleMouseEnter = () => {
          if (!mouseInteraction) return;
          mouseInfluenceRef.current = 1.0;
        };

        const handleMouseLeave = () => {
          if (!mouseInteraction) return;
          mouseInfluenceRef.current = 0.0;
        };

        window.addEventListener("resize", resize);
        if (mouseInteraction) {
          container.addEventListener("mousemove", handleMouseMove);
          container.addEventListener("mouseenter", handleMouseEnter);
          container.addEventListener("mouseleave", handleMouseLeave);
        }
        resize();

        const render = (t: number) => {
          if (cancelled) return;
          uniforms.iTime.value = t * 0.001;

          const lerpFactor = 0.1;
          mousePositionRef.current.x +=
            (targetMouseRef.current.x - mousePositionRef.current.x) * lerpFactor;
          mousePositionRef.current.y +=
            (targetMouseRef.current.y - mousePositionRef.current.y) * lerpFactor;

          const currentInfluence = uniforms.mouseInfluence.value;
          const targetInfluence = mouseInfluenceRef.current;
          uniforms.mouseInfluence.value +=
            (targetInfluence - currentInfluence) * 0.05;

          uniforms.mousePosition.value = [
            mousePositionRef.current.x,
            mousePositionRef.current.y,
          ];

          renderer.render({ scene: mesh });
          requestAnimationFrame(render);
        };

        requestAnimationFrame(render);

        const cleanup = () => {
          window.removeEventListener("resize", resize);
          if (mouseInteraction && containerRef.current) {
            containerRef.current.removeEventListener(
              "mousemove",
              handleMouseMove
            );
            containerRef.current.removeEventListener(
              "mouseenter",
              handleMouseEnter
            );
            containerRef.current.removeEventListener(
              "mouseleave",
              handleMouseLeave
            );
          }
          renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
          if (containerRef.current?.contains(canvas)) {
            containerRef.current.removeChild(canvas);
          }
        };
        return cleanup;
      } catch {
        if (!cancelled) setWebGLFailed(true);
        return () => {};
      }
    };

    init().then((fn) => {
      if (fn) cleanupRef.current = fn;
    });
    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [webGLFailed]);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;

    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
          ]
        : [1, 1, 1];
    };

    const hex = ensureHex(gridColor);
    uniforms.enableRainbow.value = enableRainbow;
    uniforms.gridColor.value = hexToRgb(hex);
    uniforms.rippleIntensity.value = rippleIntensity;
    uniforms.gridSize.value = gridSize;
    uniforms.gridThickness.value = gridThickness;
    uniforms.fadeDistance.value = fadeDistance;
    uniforms.vignetteStrength.value = vignetteStrength;
    uniforms.glowIntensity.value = glowIntensity;
    uniforms.opacity.value = opacity;
    uniforms.gridRotation.value = gridRotation;
    uniforms.mouseInteraction.value = mouseInteraction;
    uniforms.mouseInteractionRadius.value = mouseInteractionRadius;
    uniforms.effectCenterYOffset.value = effectCenterYOffset;
  }, [
    gridColor,
    enableRainbow,
    rippleIntensity,
    gridSize,
    gridThickness,
    fadeDistance,
    vignetteStrength,
    glowIntensity,
    opacity,
    gridRotation,
    mouseInteraction,
    mouseInteractionRadius,
    effectCenterYOffset,
  ]);

  if (webGLFailed) {
    return (
      <RippleGridCSSFallback
        gridColor={gridColor}
        className={className}
        step={step}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden
    />
  );
}
