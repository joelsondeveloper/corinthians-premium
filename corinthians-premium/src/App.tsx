import Cursor from "./components/Cursor";
import Hero from "./components/Hero";
import The_arena from "./components/The_arena";
import Lenis from "@studio-freight/lenis";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

declare global {
  interface Window {
    lenis: Lenis
  }
}

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const menuBtnRef = useRef(null);

  useEffect(() => {
    // 1. Desativa a restauração nativa do browser
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // 2. Inicializa o Lenis
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    window.lenis = lenis;

    function raf(time: number = 0) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 3. Reseta para o topo no carregamento
    window.scrollTo(0, 0);

    // 4. Lógica de Auto-Resume
    const savedScrollPos = sessionStorage.getItem("scrollPos");

    // Definimos a função de refresh para poder remover depois
    const handleResize = () => {
      ScrollTrigger.refresh();
      handleUnload()
    };

    setTimeout(() => {
      if (savedScrollPos && Number(savedScrollPos) > 0) {
        // Scroll suave de volta
        lenis.scrollTo(parseInt(savedScrollPos), {
          immediate: false,
          duration: 2,
          force: true,
        });
      }
      // Força o GSAP a ler as posições agora que tudo carregou
      ScrollTrigger.refresh();
    }, 600); // 600ms é o tempo ideal para o Three.js e as imagens estabilizarem

    // 5. Salva a posição antes de sair/recarregar
    const handleUnload = () => {
      sessionStorage.setItem("scrollPos", window.scrollY.toString());
      window.scrollTo(0, 0); // Garante que se ele der F5, o browser não tente pular pro meio
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("beforeunload", handleUnload);

    // 6. LIMPEZA (Essencial para não travar o PC do usuário)
    return () => {
      lenis.destroy();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  useEffect(() => {
    if (showMenu) {
      gsap.to(".banner", {
        opacity: isMenuOpen ? 1 : 0,
        pointerEvents: isMenuOpen ? "auto" : "none",
        x: isMenuOpen ? 0 : 50,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });
    }
  }, [isMenuOpen, showMenu]);

  return (
    <main className="bg-black">
      <Cursor />

      {/* --- CAMADA DIVINA (UI FIXA) --- */}
      {/* z-[999] garante que nada, nem o rect do SVG, cubra esses elementos */}
      <div className="fixed inset-0 pointer-events-none z-[999]">
        {/* Escudo/Logo */}
          <div className="hero-stage">
          <img src="/logo.png" className="shield" alt="Logo" />
          
          <img src="/yuri_alberto.png" className="player yuri" alt="Yuri" />
          <img src="/memphis_depay.png" className="player depay" alt="Memphis" />
          <img src="/hugo_souza.png" className="player hugo" alt="Hugo" />
        </div>

        

        <button
          ref={menuBtnRef}
          className="fixed top-10 right-10 w-12 h-12 bg-white border-2 border-black flex flex-col items-center justify-center gap-1.5 cursor-pointer pointer-events-auto opacity-0 translate-x-10 transition-all duration-500"
          style={{
            opacity: showMenu ? 1 : 0,
            transform: showMenu ? "translateX(0)" : "translateX(40px)",
            pointerEvents: showMenu ? "auto" : "none",
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span
            className={`w-6 h-0.5 bg-black transition-all ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`w-6 h-0.5 bg-black transition-all ${isMenuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`w-6 h-0.5 bg-black transition-all ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>

        {/* Links do Menu */}
        <div className="hero-links fixed inset-0 pointer-events-none">
          {[
            { text: "THE ARENA", id: "#arena" },
            { text: "GLORY MOMENTS", id: "#glory" },
            { text: "THE IDOLS", id: "#idols" },
            { text: "THE NATION", id: "#nation" },
          ].map((item) => (
            <a
              key={item.text}
              className="banner fixed cursor-pointer pointer-events-auto"
              style={{ filter: "url(#flag-ripple)" }}
              // Navegação suave via Lenis
              onClick={() => window.lenis.scrollTo(item.id)}
            >
              {item.text}
            </a>
          ))}
        </div>
      </div>

      {/* --- CONTEÚDO SCROLLÁVEL --- */}
      {/* Hero (z-0) e The_arena (z-50) passam por baixo da UI acima */}
      <div className="sticky top-0">
        <Hero setShowMenuBtn={setShowMenu} setIsMenuOpen={setIsMenuOpen} />
      </div>
      <div id="arena">
        <The_arena />
      </div>
    </main>
  );
}

export default App;
