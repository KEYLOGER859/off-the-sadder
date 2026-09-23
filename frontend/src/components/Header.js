import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { pad } from "@/data/products";

export const Header = ({ bagCount, onMenu, onBag }) => {
  const countRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      rootRef.current.children,
      { y: -14, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, stagger: 0.08, delay: 0.5 }
    );
  }, []);

  useEffect(() => {
    if (!bagCount) return;
    gsap.fromTo(countRef.current, { y: 8, color: "#c4653a" }, { y: 0, color: "#f4f1ea", duration: 0.9 });
  }, [bagCount]);

  return (
    <header className="hdr" ref={rootRef}>
      <a className="hdr__logo" href="/" data-testid="header-logo" data-cursor="link" aria-label="OFF THE SADDLE">
        <img src="/logo.png" alt="OFF THE SADDLE" />
      </a>
      <div className="hdr__title" data-testid="header-exhibition-title">
        <span>Chronicle</span>
        <span className="hdr__title-sub">Chronicle 01 — Artisan Jewellery, India</span>
      </div>
      <nav className="hdr__nav">
        <button className="hdr__btn" onClick={onBag} data-testid="header-bag-button" data-cursor="link" type="button">
          Bag <span ref={countRef} className="hdr__count" data-testid="header-bag-count">{pad(bagCount)}</span>
        </button>
        <button className="hdr__btn" onClick={onMenu} data-testid="header-menu-button" data-cursor="link" type="button">
          Menu
        </button>
      </nav>
    </header>
  );
};
