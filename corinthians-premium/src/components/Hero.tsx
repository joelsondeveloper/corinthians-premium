import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useVideoTexture } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- SHADER DE FUMAÇA (MANTIDO) ---
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

const BackgroundCanvas = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();
  const texture = useVideoTexture("/hero.mp4");
  const lastMousePos = useRef({ x: 0.5, y: 0.5 });
  const velocity = useRef(0);
  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelo: { value: 0 },
      uTime: { value: 0 },
      uProgress: { value: 0 },
    }),
    [texture],
  );

  useEffect(() => {
    gsap.to(uniforms.uProgress, { value: 1, duration: 4, ease: "power2.out" });
  }, [uniforms]);

  useFrame((state) => {
    const targetX = (state.mouse.x + 1) / 2;
    const targetY = (state.mouse.y + 1) / 2;
    velocity.current +=
      (Math.sqrt(
        Math.pow(targetX - lastMousePos.current.x, 2) +
          Math.pow(targetY - lastMousePos.current.y, 2),
      ) -
        velocity.current) *
      0.1;
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uMouse.value.set(targetX, targetY);
      material.uniforms.uVelo.value = velocity.current * 5.0;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    lastMousePos.current = { x: targetX, y: targetY };
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial args={[SmokeShader]} uniforms={uniforms} transparent />
    </mesh>
  );
};

interface HeroProps {
  setShowMenuBtn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Hero = ({ setShowMenuBtn, setIsMenuOpen }: HeroProps) => {
  useEffect(() => {
    const mm = gsap.matchMedia();
    const banners = gsap.utils.toArray<HTMLElement>(".banner");
    const players = gsap.utils.toArray<HTMLElement>(".player");
    const shield = document.querySelector(".shield");

    // matchMedia permite configurar animações específicas por tamanho de tela
    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
      },
      (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };

        // 1. POSIÇÕES INICIAIS ADAPTATIVAS
        const positions = isMobile
          ? [
              { top: "10%", left: "7%" }, // Arena
              { top: "17%", left: "60%" }, // Glory (Ajustado para não cortar)
              { top: "65%", left: "15%" }, // Idols
              { top: "75%", left: "65%" }, // Nation
            ]
          : [
              { top: "10%", left: "7%" },
              { top: "17%", left: "70%" },
              { top: "65%", left: "15%" },
              { top: "75%", left: "75%" },
            ];

        banners.forEach((banner, i) => {
          gsap.set(banner, {
            ...positions[i],
            x: 0,
            y: 0,
            xPercent: isMobile && positions[i].left === "50%" ? -50 : 0, // Centraliza se estiver no meio
          });
        });

        gsap.set(shield, {
          left: "50%",
          xPercent: -50,
          bottom: isMobile ? "-15vh" : "-20vh", // Começa na base da tela
          top: "auto",
          scale: isMobile ? .6 : .9,
        });

        gsap.set([".yuri"], { xPercent: -50 });
        gsap.set([".depay", ".hugo"], { xPercent: 0 });

        // 2. TIMELINE DE SCROLL
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1,
            invalidateOnRefresh: true,
            onLeave: () => {
              setShowMenuBtn(true);
              setIsMenuOpen(true);
            },
            onEnterBack: () => {
              setShowMenuBtn(false);
              setIsMenuOpen(true);
              gsap.to(".banner", { opacity: 1, x: 0, duration: 0.3 });
            },
          },
        });

        // FIX DO ESCUDO: Usamos pixels fixos no top para o header
        // Isso impede que ele "desça" em telas menores
        tl.to(
          shield,
          {
            bottom: "auto",
            top: "-270px", // Posição segura no topo
            scale: 0.2,
            duration: 1,
            ease: "power2.inOut",
          },
          0,
        );

        tl.to("#displacementMap", { attr: { scale: 0 }, duration: 1 }, 0);

        // Links voando para o header (calc de top fixo para evitar bug de altura)
        banners.forEach((banner, i) => {
          tl.to(
            banner,
            {
              top: (isMobile ? 20 : 40) + i * 55 + "px",
              left: "calc(100% - 40px)", // Garante que fique colado na direita
              xPercent: -100, // Força o alinhamento pela ponta direita do botão
              scale: 0.75,
              duration: 1,
              ease: "power2.inOut",
            },
            0,
          );
        });

        players.forEach((p) => {
          tl.to(p, { opacity: 0, y: -100, scale: 0.8, duration: 0.5 }, 0);
        });

        return () => tl.kill(); // Cleanup
      },
    );

    const handleMove = (e: MouseEvent) => {
      if (window.scrollY > 200) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      banners.forEach((b, i) =>
        gsap.to(b, {
          x: x * (i + 1) * 0.15,
          y: y * (i + 1) * 0.15,
          duration: 1,
        }),
      );
      players.forEach(
        (p, i) =>
          p &&
          gsap.to(p, {
            x: x * (i + 1) * 0.25,
            y: y * (i + 1) * 0.25,
            duration: 1,
          }),
      );
      gsap.to(shield, { x: x * 0.1, duration: 1.2 });
    };

    gsap.to("#turbulence", {
      attr: { baseFrequency: "0.02 0.05" },
      duration: 3,
      repeat: -1,
      yoyo: true,
    });

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      mm.revert(); // Reverte as alterações do matchMedia
    };
  }, [setIsMenuOpen, setShowMenuBtn]);

  return (
    <section className="hero h-[180vh] w-full relative bg-black font-sans">
      <svg className="hidden">
        <filter id="flag-ripple">
          <feTurbulence
            id="turbulence"
            type="turbulence"
            baseFrequency="0.01 0.02"
            numOctaves="2"
            result="turbulence"
          />
          <feDisplacementMap
            id="displacementMap"
            in="SourceGraphic"
            in2="turbulence"
            scale="10"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <Canvas
          className="absolute inset-0 z-0"
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 1] }}
        >
          <BackgroundCanvas />
        </Canvas>
        <div className="overlay absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_90%)]" />
      </div>
    </section>
  );
};

export default Hero;
