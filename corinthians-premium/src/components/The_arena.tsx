import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import StatHand from "./StatHand";
import ConfettiPhysics from "./ConfettiPhysics";
import DecorationHand from "./DecorationHand";

gsap.registerPlugin(ScrollTrigger);

const The_arena = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  const stats = [
    { 
      index: 1, label: "Fiel Torcida", number: 30, symbol: "M+", 
      textOffset: "55%", imgScale: 1.1, handOffset: "0px" 
    },
    { 
      index: 2, label: "Anos de Glória", number: 114, symbol: "", 
      textOffset: "35%", imgScale: 1, handOffset: "-20px" 
    },
    { 
      index: 3, label: "Títulos", number: 50, symbol: "+", 
      textOffset: "40%", imgScale: 1.3, handOffset: "-75px" 
    },
    { 
      index: 4, label: "Mundiais", number: 2, symbol: "x", 
      textOffset: "50%", imgScale: .8, handOffset: "0px" 
    },
  ];

  const easterEggs = [
    { index: 1, text: "7.7.77", xPos: "5%", scale: 0.8, rot: 0.5 },
    { index: 2, text: "Favela Venceu", xPos: "25%", scale: 0.7, rot: 0.3 },
    { index: 3, text: "1910", xPos: "45%", scale: 0.9, rot: 0.6 },
    { index: 4, text: "Cássio 12", xPos: "65%", scale: 0.75, rot: 0.4 },
    { index: 2, text: "Mundial 2012", xPos: "85%", scale: 0.85, rot: 0.5 },
    { index: 1, text: "Respeita as Minas", xPos: "15%", scale: 0.6, rot: 0.2 },
  ];

 useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. TIMELINE DE SCROLL (Controla apenas a SUBIDA e DESCIDA)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=350%",
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      tl.fromTo(textRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 }, 0)
        // Animamos o WRAPPER (Pai) no scroll
        .fromTo(".stat-hand-wrapper, .decoration-hand-wrapper", 
          { y: "110%" }, 
          { y: "0%", duration: 0.3, stagger: 0.02, ease: "power2.out" }, 0.05
        )
        .to(".confetti-canvas", { opacity: 1, duration: 0.3 }, 0.1)
        .to(textRef.current, { scale: 1.2, duration: 0.4 }, 0.3)
        .to(textRef.current, { scale: 80, duration: 0.3, ease: "power2.in" }, 0.7)
        .to(".stat-hand-wrapper, .decoration-hand-wrapper", { y: "110%", duration: 0.2, stagger: 0.01 }, 0.7)
        .to(".confetti-canvas", { opacity: 0, duration: 0.2 }, 0.7);

      // 2. LÓGICA DE MOUSE (Controla apenas o BALANÇO LATERAL / x e rotation)
      const handleMouseMove = (e : MouseEvent) => {
        const { clientX } = e;
        const centerX = window.innerWidth / 2;
        const mouseXPercent = (clientX - centerX) / centerX; // -1 a 1

        // Movemos o INNER (Filho) para não conflitar com o Wrapper
        gsap.to(".stat-hand-inner, .decoration-hand-inner", {
          x: (i) => mouseXPercent * (15 + i * 2), // Cada mão move um pouco diferente
          rotation: () => mouseXPercent * -10,   // Balanço de repulsão
          duration: 0.8,
          ease: "power2.out",
          overwrite: "auto" // Garante que um movimento de mouse anule o anterior suavemente
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full z-40 bg-transparent overflow-hidden">
      
      {/* 1. MÁSCARA TEXTO (z-40) */}
      <div className="absolute inset-0 h-screen w-full pointer-events-none z-40">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
          <defs>
            <mask id="textMask">
              <rect width="100%" height="100%" fill="white" />
              <text ref={textRef} x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="black"
                style={{ fontWeight: 900, fontSize: "120px", fontFamily: "Impact, sans-serif" }}>
                CORINTHIANS
              </text>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="black" mask="url(#textMask)" />
        </svg>
      </div>

      {/* 2. CONFETES (z-45) */}
      <ConfettiPhysics />

       <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        {easterEggs.map((egg, i) => (
          <DecorationHand key={i} {...egg} />
        ))}
      </div>

      {/* 4. MÃOS PRINCIPAIS (Stats) (z-50 - Na frente de tudo) */}
      <div className="absolute bottom-0 left-0 w-full px-4 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 items-end pointer-events-none z-50 h-full overflow-hidden">
        {stats.map((stat, i) => (
          <div 
            key={stat.index} 
            className={`stat-hand-wrapper w-full h-full flex items-end ${i > 1 ? "hidden md:flex" : "flex"}`}
          >
            <StatHand {...stat} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default The_arena;