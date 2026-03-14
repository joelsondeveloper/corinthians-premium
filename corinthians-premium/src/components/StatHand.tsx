import { useEffect, useRef } from "react";
import gsap from "gsap";

const StatHand = ({ index, label, number, symbol, imgScale, textOffset, handOffset }) => {
  const containerRef = useRef(null);
  const numberRef = useRef(null);

  useEffect(() => {
    // 1. Contador (mantido)
    const statsValue = { val: 0 };
    gsap.to(statsValue, {
      val: number,
      duration: 2,
      scrollTrigger: { trigger: containerRef.current, start: "top 95%" },
      onUpdate: () => { if (numberRef.current) numberRef.current.innerText = Math.floor(statsValue.val); }
    });

    // 2. Lógica de Repulsa do Mouse
    const handleMouse = (e) => {
      const bounds = containerRef.current.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const dist = e.clientX - centerX; // Distância horizontal do centro da mão
      
      // Se o mouse estiver perto (ex: 300px), aplica rotação
      if (Math.abs(dist) < 300) {
        const rotationAmount = (dist / 300) * -15; // Inverte o sinal para "fugir"
        gsap.to(containerRef.current, {
          rotation: rotationAmount,
          duration: 0.6,
          ease: "power2.out"
        });
      } else {
        gsap.to(containerRef.current, { rotation: 0, duration: 0.6 });
      }
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [number]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-end h-[50vh] w-full origin-bottom">
      <img
        src={`/hand${index}.png`}
        className="absolute w-full h-full object-contain z-10 select-none"
        style={{ bottom: handOffset, transform: `scale(${imgScale || 1})`, transformOrigin: 'bottom center' }}
      />
      <div className="absolute z-20 w-[75%] text-center" style={{ bottom: textOffset }}>
        <p className="text-black font-bold text-[8px] md:text-[10px] tracking-[0.2em] mb-1 opacity-70">{label}</p>
        <h2 className="text-black font-black text-2xl md:text-5xl flex items-center justify-center leading-none">
          <span ref={numberRef}>0</span>{symbol}
        </h2>
      </div>
    </div>
  );
};

export default StatHand;