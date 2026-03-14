import { useEffect, useRef } from "react";
import gsap from "gsap";

const Cursor = () => {

  const isHovering = useRef(false);

  useEffect(() => {
    const dotX = gsap.quickTo(".cursor-dot", "x", {
      duration: 0.1,
      ease: "power3",
    });

    const dotY = gsap.quickTo(".cursor-dot", "y", {
      duration: 0.1,
      ease: "power3",
    });

    const logoX = gsap.quickTo(".cursor-logo", "x", {
      duration: 0.45,
      ease: "power3",
    });

    const logoY = gsap.quickTo(".cursor-logo", "y", {
      duration: 0.45,
      ease: "power3",
    });

    const moveCursor = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);

      logoX(e.clientX);
      logoY(e.clientY - 35);

      const target = e.target as HTMLElement;
      const isInteractable = target.closest("a, button, .banner, .cursor-pointer");

      if (isInteractable && !isHovering.current) {
        isHovering.current = true;
        enterHover();
      } else if (!isInteractable && isHovering.current) {
        isHovering.current = false;
        leaveHover();
      }
    };

    const orangeColor = "#FF5E00"; 

     const enterHover = () => {
      gsap.to(".cursor-logo", {
        rotation: "360", // Giro 360 (relativo para poder girar de novo no próximo link)
        scale: 1.5,
        duration: 0.6,
        ease: "power2.out",
        overwrite: "auto",
      });

      gsap.to(".cursor-dot", {
        backgroundColor: orangeColor,
        scale: 2.5, // Dot cresce e muda de cor
        duration: 0.3,
        ease: "back.out(1.7)",
        overwrite: "auto",
      });
    };

     const leaveHover = () => {
      gsap.to(".cursor-logo", {
        rotation: 0,
        scale: 1,
        duration: 0.5,
        ease: "power2.inOut",
        overwrite: "auto",
      });

      gsap.to(".cursor-dot", {
        backgroundColor: "#ffffff",
        scale: 1.4, // Volta ao scale do pulso original
        duration: 0.3,
        overwrite: "auto",
      });
    };

    window.addEventListener("mousemove", moveCursor);

    const pulse = gsap.to(".cursor-dot", {
      scale: 1.4,
      repeat: -1,
      yoyo: true,
      duration: 0.6,
      ease: "power1.inOut",
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      pulse.kill();
    };
  }, []);

  return (
    <>
      <div className="cursor-dot fixed w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" />

      <img
        src="/cursor.png"
        alt="Cursor Corinthians"
        className="cursor-logo fixed w-10 pointer-events-none z-[9998] -translate-x-1/2"
      />
    </>
  );
};

export default Cursor;