import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Cursor from "./components/Cursor";
import Hero from "./components/Hero";
import The_arena from "./components/The_arena";
import GloryMoments from "./components/GloryMoments";
import useReducedMotion from "./hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const menuButtonVisible = showMenu && !reducedMotion;
  const menuVisible = !menuButtonVisible || isMenuOpen;

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({ duration: 1.1 });
    lenisRef.current = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => { if (!cancelled) ScrollTrigger.refresh(); };
    window.addEventListener("load", refresh);
    void document.fonts.ready.then(refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
    };
  }, []);

  useEffect(() => {
    const animation = gsap.to(".banner", {
      autoAlpha: menuVisible ? 1 : 0,
      x: menuVisible ? 0 : 30,
      duration: reducedMotion ? 0 : 0.25,
      overwrite: "auto",
    });
    return () => { animation.kill(); };
  }, [menuVisible, reducedMotion]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.querySelector<HTMLElement>(id);
    if (!target) return;
    event.preventDefault();
    const trigger = ScrollTrigger.getById(id.slice(1));
    const position = trigger ? trigger.start + 1 : target.getBoundingClientRect().top + window.scrollY;
    if (lenisRef.current) lenisRef.current.scrollTo(position);
    else window.scrollTo({ top: position, behavior: "instant" });
    window.history.replaceState(null, "", id);
    target.focus({ preventScroll: true });
    setIsMenuOpen(false);
  };

  return (
    <main className="bg-black">
      <a className="skip-link" href="#glory" onClick={(event) => navigate(event, "#glory")}>Pular para a história</a>
      <Cursor />
      <img src="/logo.webp" className="shield fixed pointer-events-none" alt="Sport Club Corinthians Paulista" />
      <div className="fixed inset-0 pointer-events-none z-999">
        <div className="hero-stage" aria-hidden="true">
          <img src="/yuri_alberto.webp" className="player yuri" alt="" decoding="async" />
          <img src="/memphis_depay.webp" className="player depay" alt="" decoding="async" />
          <img src="/hugo_souza.webp" className="player hugo" alt="" decoding="async" />
        </div>
        <button
          ref={menuBtnRef}
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuVisible}
          aria-controls="main-navigation"
          tabIndex={menuButtonVisible ? 0 : -1}
          className="fixed top-5 right-5 md:top-10 md:right-10 w-12 h-12 bg-white border-2 border-black flex flex-col items-center justify-center gap-1.5 cursor-pointer pointer-events-auto"
          style={{ visibility: menuButtonVisible ? "visible" : "hidden" }}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className={`w-6 h-0.5 bg-black ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-6 h-0.5 bg-black ${isMenuOpen ? "opacity-0" : ""}`} />
          <span className={`w-6 h-0.5 bg-black ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
        <nav
          id="main-navigation"
          aria-label="Navegação principal"
          inert={!menuVisible}
          className="hero-links fixed inset-0 pointer-events-none"
          onKeyDown={(event) => {
            if (event.key === "Escape" && showMenu) {
              setIsMenuOpen(false);
              menuBtnRef.current?.focus();
            }
          }}
        >
          {[
            { text: "THE ARENA", id: "#arena" },
            { text: "GLORY MOMENTS", id: "#glory" },
          ].map((item) => (
            <a key={item.id} href={item.id} className="banner fixed cursor-pointer pointer-events-auto"
              style={{ filter: reducedMotion ? "none" : "url(#flag-ripple)" }}
              onClick={(event) => navigate(event, item.id)}>
              {item.text}
            </a>
          ))}
        </nav>
      </div>
      <div className={reducedMotion ? "" : "sticky top-0"}>
        <Hero setShowMenuBtn={setShowMenu} setIsMenuOpen={setIsMenuOpen} />
      </div>
      <The_arena />
      <GloryMoments />
    </main>
  );
}

export default App;
