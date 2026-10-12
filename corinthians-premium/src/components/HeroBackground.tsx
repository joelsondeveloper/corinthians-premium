import { useRef, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const SmokeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uVelo: { value: 0.0 },
    uTime: { value: 0 },
    uProgress: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uReady;
    uniform vec2 uMouse;
    uniform float uVelo;
    uniform float uTime;
    uniform float uProgress;
    varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
    float noise(vec2 p){
      vec2 i = floor(p); vec2 f = fract(p);
      float a = hash(i); float b = hash(i + vec2(1.0,0.0));
      float c = hash(i + vec2(0.0,1.0)); float d = hash(i + vec2(1.0,1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
    }
    void main(){
      if (uReady < 0.5) { gl_FragColor = vec4(0.0); return; }
      vec2 uv = vUv;
      vec2 smokeUV = uv;
      smokeUV.y -= uTime * 0.1;
      float n = noise(smokeUV * 4.0);
      float n2 = noise(smokeUV * 8.0);
      float smoke = smoothstep(0.2, 0.8, n * 0.6 + n2 * 0.4);
      float edge = smoothstep(uProgress - 0.25, uProgress + smoke * 0.15, uv.y);
      float dist = distance(uv, uMouse);
      if(dist < 0.25){
        float strength = (0.25 - dist) * uVelo * 1.2;
        uv.x += sin(uv.y * 20.0 + uTime * 3.0) * strength;
        uv.y += cos(uv.x * 20.0 + uTime * 3.0) * strength;
      }
      vec4 video = texture2D(tDiffuse, uv);
      vec3 smokeColor = vec3(0.0);
      vec3 finalColor = mix(video.rgb, smokeColor, edge);
      gl_FragColor = vec4(finalColor,1.0);
    }
  `,
};


function BackgroundCanvas({ active }: { active: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastMousePos = useRef({ x: 0.5, y: 0.5 });
  const velocity = useRef(0);
  const uniforms = useMemo(() => ({
    tDiffuse: { value: null as THREE.VideoTexture | null },
    uReady: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uVelo: { value: 0 }, uTime: { value: 0 }, uProgress: { value: 0 },
  }), []);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const tween = gsap.to(material.uniforms.uProgress, { value: 1, duration: 4, ease: "power2.out" });
    return () => { tween.kill(); };
  }, []);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;
    const video = document.createElement("video");
    video.src = "/hero.mp4";
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    material.uniforms.tDiffuse.value = texture;
    videoRef.current = video;
    const ready = () => { material.uniforms.uReady.value = 1; };
    const failed = () => { material.uniforms.uReady.value = 0; video.pause(); };
    video.addEventListener("loadeddata", ready);
    video.addEventListener("error", failed);
    return () => {
      video.pause();
      video.removeEventListener("loadeddata", ready);
      video.removeEventListener("error", failed);
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      videoRef.current = null;
      material.uniforms.uReady.value = 0;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) void video.play().catch(() => { /* A blocked video keeps its first frame or poster. */ });
    else video.pause();
    return () => video.pause();
  }, [active]);

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    const x = (state.pointer.x + 1) / 2;
    const y = (state.pointer.y + 1) / 2;
    velocity.current += (Math.hypot(x - lastMousePos.current.x, y - lastMousePos.current.y) - velocity.current) * 0.1;
    material.uniforms.uMouse.value.set(x, y);
    material.uniforms.uVelo.value = velocity.current * 5;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    lastMousePos.current = { x, y };
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={materialRef} args={[SmokeShader]} uniforms={uniforms} transparent />
    </mesh>
  );
}

export default function HeroBackground({ active }: { active: boolean }) {
  return (
    <Canvas className="absolute inset-0 z-0" dpr={[1, 1.5]} frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: true }} camera={{ position: [0, 0, 1] }}
      fallback={<img src="/hero.webp" className="w-full h-full object-cover" alt="" />}>
      <Suspense fallback={null}><BackgroundCanvas active={active} /></Suspense>
    </Canvas>
  );
}
