import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const moments = [
  {
    year: "1977",
    title: "A ETERNIDADE DE BASÍLIO",
    description:
      "Vinte e três anos de silêncio transformados no grito mais ensurdecedor da história. O gol que libertou uma nação.",
    img: "/basilio.png",
  },
  {
    year: "1982",
    title: "DEMOCRACIA CORINTIANA",
    description:
      "Mais que futebol, uma revolução. Sócrates e o punho cerrado provaram que o Corinthians é o povo no poder.",
    img: "/democracia.png",
  },
  {
    year: "2000",
    title: "DONOS DO PLANETA",
    description:
      "O mundo conheceu o Bando de Loucos no Maracanã. Derrubamos gigantes para cravar a bandeira no topo do mundo.",
    img: "/donos.png",
  },
  {
    year: "2012",
    title: "A LIBERTAÇÃO",
    description:
      "A América se curvou à invencibilidade fiel. O brilho de Sheik no Pacaembu transformou o continente em preto e branco.",
    img: "/libertação.png",
  },
  {
    year: "2012",
    title: "O JAPÃO FOI INVADIDO",
    description:
      "Trinta mil loucos cruzaram o globo. Cássio gigante, Guerrero rei, e o mundo, pela segunda vez, foi nosso.",
    img: "/campeão.png",
  },
];

const GloryMoments = () => {
  const sectionRef = useRef(null);
  const ballRef = useRef(null);
  const footRef = useRef(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1. TIMELINE PRINCIPAL (Pinning e Scroll)
      const mainTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=1200%", // Aumentado para um voo mais longo e épico
          scrub: 1.5, // Scrub um pouco mais suave para a bola não tremer
          pin: true,
          invalidateOnRefresh: true,
        },
      });

      // --- SETUP INICIAL ---
      gsap.set(ballRef.current, {
        xPercent: -50,
        yPercent: -50,
        left: "25%",
        top: "80%",
        scale: 0.6,
        opacity: 0,
      });
      

      // --- ATO 1: O IMPACTO (INTRO) ---
      mainTl
        .to(
          footRef.current,
          {
            x: 180,
            y: -80,
            rotation: 25,
            opacity: 1,
            duration: 0.5,
            ease: "power4.out",
          },
          0,
        )
        .to(ballRef.current, { opacity: 1, duration: 0.1 }, 0.2)
        .to(footRef.current, { x: -600, opacity: 0, duration: 0.5 }, 0.6)
        .to(
          sectionRef.current,
          { x: 10, yoyo: true, repeat: 5, duration: 0.05 },
          0.2,
        );

      // --- ATO 2: O VOO DA BOLA (DURAÇÃO TOTAL) ---
      // Criamos a curva da trivela que dura 80% de todo o scroll da seção
      // Rotação constante sem parar
      mainTl.to(
        ballRef.current,
        {
          rotation: "+=6000", // Gira muito para parecer veloz
          ease: "none",
          duration: 8,
        },
        0.2,
      );

      // A trajetória da curva (Trivela)
      mainTl.to(
        ballRef.current,
        {
          left: "80%", // Abre a curva para a direita
          top: "50%",
          duration: 4,
          ease: "sine.inOut",
        },
        0.2,
      );

      mainTl.to(
        ballRef.current,
        {
          left: "50%", // Volta fechando a curva para o gol
          top: "42%",
          scale: 0.15,
          duration: 4,
          ease: "sine.inOut",
        },
        4.2,
      );

      // --- ATO 3: OS CARDS (O TÚNEL DO TEMPO) ---
      // Eles aparecem em 'stagger' enquanto a bola voa no fundo
      moments.forEach((_, i) => {
        const card = `.glory-card-${i}`;
        // Distribuímos o início de cada card ao longo da timeline (ex: de 1 a 7)
        const startTime = 1 + i * 1.3;

        mainTl
          .fromTo(
            card,
            { scale: 0, opacity: 0, z: -2000 },
            { scale: 1, opacity: 1, z: 0, duration: 1, ease: "power2.out" },
            startTime,
          )
          .to(
            card,
            {
              scale: 8,
              opacity: 0,
              z: 2500,
              duration: 1,
              ease: "power2.in",
            },
            startTime + 0.8,
          );
      });

      // --- ATO 4: O GOL (FINAL) ---
      mainTl
        .to(
          ".goal-flash",
          {
            opacity: 1,
            duration: 0.1,
          },
          8.5,
        ) // Acontece logo após a curva da bola fechar
        .to(ballRef.current, { opacity: 0, duration: 0.2 }, 8.6);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full bg-black overflow-hidden perspective-[1500px]"
    >
      {/* Background Campo (Fundo Estático) */}
      <div className="absolute inset-0 z-0 opacity-20">
        <img
          src="/campo.png"
          className="w-full h-full object-cover grayscale brightness-50"
          alt="Arena"
        />
      </div>

      {/* Flash de Gol Laranja */}
      <div className="goal-flash absolute inset-0 bg-orange-600 z-[100] opacity-0 pointer-events-none flex justify-center items-center" >
        <h2 
    className="goal-text text-white font-black italic text-8xl md:text-[18rem] uppercase tracking-tighter select-none"
    style={{ 
      fontFamily: 'Impact, sans-serif',
      filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.5))' 
    }}
  >
    GOL!
  </h2>
      </div>

      {/* Container das Histórias (Layout Lateral) */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {moments.map((m, i) => (
          <div
            key={i}
            className={`glory-card-${i} absolute w-full h-full flex flex-col md:flex-row items-center justify-center px-10 md:px-32 gap-10 opacity-0 pointer-events-none`}
          >
            {/* Lado Esquerdo: Texto imponente */}
            <div className="w-full md:w-1/2 text-left space-y-4">
              <span
                className="text-orange-600 font-black text-6xl md:text-9xl block leading-none italic"
                style={{ fontFamily: "Impact, sans-serif" }}
              >
                {m.year}
              </span>
              <h3 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter border-l-4 border-orange-600 pl-4">
                {m.title}
              </h3>
              <p className="text-zinc-400 text-lg md:text-2xl max-w-xl leading-relaxed font-light">
                {m.description}
              </p>
            </div>

            {/* Lado Direito: A imagem do momento */}
            <div className="w-full md:w-1/2 relative group">
              <div className="relative overflow-hidden border-2 border-white/10 rounded-sm shadow-2xl">
                <img
                  src={m.img}
                  className="w-full aspect-video object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700"
                  alt={m.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* O Pé (Chute inicial) */}
      <img
        ref={footRef}
        src="/chuteira.png"
        className="absolute left-[-40%] md:left-[-5%] top-[55%] w-72 z-50 pointer-events-none opacity-0"
        alt="O Chute"
      />

      {/* A BOLA (Sempre visível navegando no túnel) */}
      <img
        ref={ballRef}
        src="/bola.png"
        className="absolute z-40 w-24 md:w-32 drop-shadow-[0_0_40px_rgba(255,94,0,0.6)]"
        alt="Bola do Jogo"
      />
    </section>
  );
};

export default GloryMoments;
