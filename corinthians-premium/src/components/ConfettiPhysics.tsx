import React, { useRef, useEffect } from "react";

import Particle from "../lib/Particle";

const ConfettiPhysics: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrame = 0;
    let inView = false;
    let running = false;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reduzi a quantidade para 50, já que agora são maiores (menos é mais no minimalismo)
      particles.current = Array.from({ length: window.innerWidth < 768 ? 30 : 70 }, () => new Particle(canvas.width, canvas.height));
    };

    const animate = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current.forEach((p) => {
        p.update(canvas.width, canvas.height, mouse.current.x, mouse.current.y);
        p.draw(ctx);
      });
      animationFrame = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const updateActivity = () => {
      const shouldRun = inView && !document.hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) animationFrame = requestAnimationFrame(animate);
      else cancelAnimationFrame(animationFrame);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateActivity();
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    document.addEventListener("visibilitychange", updateActivity);
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();


    return () => {
      running = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateActivity);
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="confetti-canvas fixed inset-0 pointer-events-none z-45 opacity-0" 
      style={{ mixBlendMode: 'screen' }} 
    />
  );
};

export default ConfettiPhysics;