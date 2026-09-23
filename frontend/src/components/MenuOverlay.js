import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const LINKS = ["Chronicle", "Makers", "Journal", "About", "Contact"];

export const MenuOverlay = ({ open, onClose }) => {
  const ref = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    const root = ref.current;
    const inner = root.querySelectorAll(".menu__line-inner");
    const meta = root.querySelectorAll(".menu__meta");
    if (open) {
      gsap.set(root, { pointerEvents: "auto" });
      gsap.timeline()
        .to(root, { opacity: 1, duration: 0.7, ease: "power2.out" }, 0)
        .fromTo(inner, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.07, ease: "expo.out" }, 0.15)
        .fromTo(meta, { opacity: 0 }, { opacity: 1, duration: 1, stagger: 0.08 }, 0.6);
    } else if (!first.current) {
      gsap.timeline({ onComplete: () => gsap.set(root, { pointerEvents: "none" }) })
        .to(inner, { yPercent: -110, duration: 0.6, stagger: 0.04, ease: "power3.in" }, 0)
        .to(root, { opacity: 0, duration: 0.6, ease: "power2.inOut" }, 0.3);
    }
    first.current = false;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className="menu" ref={ref} data-testid="menu-overlay" aria-hidden={!open}>
      <button className="menu__close" onClick={onClose} data-testid="menu-overlay-close-button" data-cursor="link" type="button">
        Close ×
      </button>
      <nav className="menu__nav">
        {LINKS.map((l, i) => (
          <a key={l} href="#" className={`menu__link ${i === 0 ? "is-current" : ""}`} data-testid={`menu-link-${l.toLowerCase()}`} data-cursor="link" onClick={(e) => { e.preventDefault(); onClose(); }}>
            <span className="menu__num">0{i + 1}</span>
            <span className="menu__line"><span className="menu__line-inner">{l}</span></span>
          </a>
        ))}
      </nav>
      <div className="menu__foot">
        <span className="menu__meta">OFF THE SADDLE — Objects made by hand across India</span>
        <span className="menu__meta">Studio · Enquiries · Instagram</span>
      </div>
    </div>
  );
};
