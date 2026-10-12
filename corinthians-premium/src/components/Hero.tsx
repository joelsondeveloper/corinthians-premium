import { lazy, Suspense, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import useReducedMotion from "../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);
const HeroBackground = lazy(() => import("./HeroBackground"));

interface HeroProps {
  setShowMenuBtn: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Hero = ({ setShowMenuBtn, setIsMenuOpen }: HeroProps) => {
  const reducedMotion = useReducedMotion();
  const [backgroundActive, setBackgroundActive] = useState(true);

  useEffect(() => {
    const update = () => {
      const glory = document.querySelector("#glory");
      setBackgroundActive(!document.hidden && (!glory || glory.getBoundingClientRect().top > 0));
    };
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("visibilitychange", update);
    return () => {
      window.removeEventListener("scroll", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
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
              setIsMenuOpen(false);
            },
            onEnterBack: () => {
              setShowMenuBtn(false);
              setIsMenuOpen(false);
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
              top: (isMobile ? 80 : 100) + i * 55 + "px",
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
      if (window.scrollY > 200 || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      banners.forEach((b, i) =>
        gsap.to(b, {
          x: x * (i + 1) * 0.15,
          y: y * (i + 1) * 0.15,
          duration: 1,
          overwrite: "auto",
        }),
      );
      players.forEach(
        (p, i) =>
          p &&
          gsap.to(p, {
            x: x * (i + 1) * 0.25,
            y: y * (i + 1) * 0.25,
            duration: 1,
            overwrite: "auto",
          }),
      );
      gsap.to(shield, { x: x * 0.1, duration: 1.2 });
    };

    const ripple = gsap.to("#turbulence", {
      attr: { baseFrequency: "0.02 0.05" },
      duration: 3,
      repeat: -1,
      yoyo: true,
    });

    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      ripple.kill();
      gsap.killTweensOf([...banners, ...players, shield]);
      mm.revert(); // Reverte as alterações do matchMedia
    };
  }, [setIsMenuOpen, setShowMenuBtn, reducedMotion]);

  return (
    <section aria-label="Corinthians" className={`hero ${reducedMotion ? "h-screen" : "h-[180vh]"} w-full relative bg-black font-sans`}>
      <h1 className="sr-only">Corinthians: a história de uma nação</h1>
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
        <img src="/hero.webp" alt="" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
        {!reducedMotion && <Suspense fallback={null}><HeroBackground active={backgroundActive} /></Suspense>}
        <div className="overlay absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_90%)]" />
      </div>
    </section>
  );
};

export default Hero;
