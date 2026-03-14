import React from "react";

const DecorationHand = ({ index, text, xPos, scale }) => {
  return (
    <div
      className="decoration-hand-wrapper absolute bottom-0 pointer-events-none select-none"
      style={{ left: xPos, transform: `scale(${scale})`, zIndex: 42 }}
    >
      {/* A div interna 'decoration-hand-inner' é que vai balançar com o mouse */}
      <div className="decoration-hand-inner origin-bottom" style={{ filter: "blur(1.5px) brightness(0.7)", opacity: 0.3 }}>
        <div className="relative w-32 md:w-48">
          <img src={`/hand${index}.png`} className="w-full h-auto" alt="" />
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[70%] text-center">
            <span className="text-black font-bold text-[8px] md:text-[11px] leading-tight uppercase font-impact">
              {text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DecorationHand);