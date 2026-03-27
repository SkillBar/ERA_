import { useEffect, useRef } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

type CyberneticGridShaderProps = {
  className?: string
}

export function CyberneticGridShader({ className }: CyberneticGridShaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const clock = new THREE.Clock()

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
        vec2 mouse = (iMouse - 0.5 * iResolution.xy) / iResolution.y;

        float t = iTime * 0.2;
        float mouseDist = length(uv - mouse);

        float warp = sin(mouseDist * 20.0 - t * 4.0) * 0.1;
        warp *= smoothstep(0.4, 0.0, mouseDist);
        uv += warp;

        vec2 gridUv = abs(fract(uv * 10.0) - 0.5);
        float line = pow(1.0 - min(gridUv.x, gridUv.y), 50.0);

        vec3 gridColor = vec3(0.1, 0.5, 1.0);
        vec3 color = gridColor * line * (0.5 + sin(t * 2.0) * 0.2);

        float energy = sin(uv.x * 20.0 + t * 5.0) * sin(uv.y * 20.0 + t * 3.0);
        energy = smoothstep(0.8, 1.0, energy);
        color += vec3(1.0, 0.2, 0.8) * energy * line;

        float glow = smoothstep(0.1, 0.0, mouseDist);
        color += vec3(1.0) * glow * 0.5;

        color += random(uv + t * 0.1) * 0.05;

        gl_FragColor = vec4(color, 1.0);
      }
    `

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
    })

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const updateMouseFromClient = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect()
      const x = clientX - rect.left
      const y = rect.height - (clientY - rect.top)
      uniforms.iMouse.value.set(x, y)
    }

    const onResize = () => {
      const width = Math.max(1, container.clientWidth)
      const height = Math.max(1, container.clientHeight)
      renderer.setSize(width, height)
      uniforms.iResolution.value.set(width, height)
      uniforms.iMouse.value.set(width * 0.5, height * 0.5)
    }

    const onMouseMove = (e: MouseEvent) => {
      updateMouseFromClient(e.clientX, e.clientY)
    }

    onResize()
    window.addEventListener("resize", onResize)
    window.addEventListener("mousemove", onMouseMove, { passive: true })

    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime()
      renderer.render(scene, camera)
    })

    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMouseMove)
      renderer.setAnimationLoop(null)

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }

      material.dispose()
      geometry.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      aria-hidden
    />
  )
}

