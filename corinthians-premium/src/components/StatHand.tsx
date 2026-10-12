import { useEffect, useRef } from "react";
import gsap from "gsap";
import useReducedMotion from "../hooks/useReducedMotion";

interface StatHandProps {
  index: number;
  label: string;
  number: number;
  symbol: string;
  imgScale: number;
  textOffset: string;
  handOffset: string;
}

const StatHand = ({
  index,
  label,
  number,
  symbol,
  imgScale,
  textOffset,
  handOffset,
}: StatHandProps) => {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const numberRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const context = gsap.context(() => {
    // 1. Contador
    const statsValue = { val: 0 };
    gsap.to(statsValue, {
      val: number,
      duration: 2,
      scrollTrigger: { trigger: containerRef.current, start: "top 95%" },
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.innerText = Math.floor(statsValue.val).toString();
        }
      },
    });

    }, containerRef);
    return () => context.revert();
  }, [number, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className="stat-hand-inner relative flex flex-col items-center justify-end h-[28vh] md:h-[50vh] w-full origin-bottom"
    >
      <img
        src={`/hand${index}.webp`}
        alt=""
        decoding="async"
        className="absolute w-full h-full object-contain z-10 select-none"
        style={{
          bottom: handOffset,
          transform: `scale(${imgScale || 1})`,
          transformOrigin: "bottom center",
        }}
      />
      <div
        className="absolute z-20 w-[75%] text-center"
        style={{ bottom: textOffset }}
      >
        <p className="text-black font-bold text-[8px] md:text-[10px] tracking-[0.2em] mb-1 opacity-70">
          {label}
        </p>
        <h2 className="text-black font-black text-2xl md:text-5xl flex items-center justify-center leading-none">
          <span ref={numberRef}>{number}</span>
          {symbol}
        </h2>
      </div>
    </div>
  );
};

export default StatHand;
