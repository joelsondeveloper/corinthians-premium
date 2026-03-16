import React, { useRef, useEffect } from "react";

class Particle {
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  width: number = 0;
  height: number = 0;
  rotation: number = 0;
  rVel: number = 0; // Velocidade de rotação
  color: string = "";

  constructor(w: number, h: number) {
    this.reset(w, h);
  }

  reset(w: number, h: number) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    
    // Velocidade de flutuação inicial (quase parado)
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    
    // --- TAMANHO MAIOR ---
    // Agora os confetes são placas bem visíveis
    this.width = Math.random() * 15 + 15; // Entre 15px e 30px
    this.height = Math.random() * 8 + 8;  // Entre 8px e 16px
    
    this.rotation = Math.random() * Math.PI * 2;
    // Velocidade de rotação inicial sutil
    this.rVel = (Math.random() - 0.5) * 0.02;
    
    this.color = Math.random() > 0.5 ? "#FF5E00" : "#FFFFFF";
  }

  update(w: number, h: number, mouseX: number, mouseY: number) {
    this.x += this.vx + Math.sin(this.rotation) * 0.1;
    this.y += this.vy;
    this.rotation += this.rVel;

    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const radius = 150; // Raio de influência do mouse
    
    if (dist < radius) {
      const force = (radius - dist) / radius;
      const power = 0.5; 
      
      this.vx += (dx / dist) * force * power;
      this.vy += (dy / dist) * force * power;
      
      // O mouse também "chuta" a rotação do confete
      this.rVel += (dx / dist) * 0.05 * force;
    }

    // --- O SEGREDO DO CONTROLE ---
    // Fricção linear: para o movimento não ser infinito
    this.vx *= 0.95;
    this.vy *= 0.95;
    
    // Fricção rotacional: faz o giro "cansar" e parar suavemente
    // Se não tiver isso, eles ficam parecendo hélices de ventilador
    this.rVel *= 0.93;

    // Reposicionamento infinito
    if (this.x < -50) this.x = w + 50;
    if (this.x > w + 50) this.x = -50;
    if (this.y < -50) this.y = h + 50;
    if (this.y > h + 50) this.y = -50;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    
    // Um leve brilho/sombra para dar volume ao confete maior
    ctx.shadowBlur = 4;
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.9;
    
    // Desenha o retângulo centralizado
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

const ConfettiPhysics: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrame: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Reduzi a quantidade para 50, já que agora são maiores (menos é mais no minimalismo)
      particles.current = Array.from({ length: 70 }, () => new Particle(canvas.width, canvas.height));
    };

    const animate = () => {
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

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    handleResize();
    animate();

    return () => {
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