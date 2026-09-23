import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { pad } from "@/data/products";

export const BottomUI = ({ index, total, dragging, hidden }) => {
  const numRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(rootRef.current.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, stagger: 0.1, delay: 1.1 });
  }, []);

  useEffect(() => {
    gsap.fromTo(numRef.current, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7 });
  }, [index]);

  useEffect(() => {
    gsap.to(rootRef.current, { opacity: hidden ? 0 : 1, duration: 0.6 });
  }, [hidden]);

  return (
    <div className={`bottom ${dragging ? "is-dragging" : ""}`} ref={rootRef}>
      <div className="bottom__counter" data-testid="bottom-counter">
        <span className="bottom__mask"><span ref={numRef}>{pad(index + 1)}</span></span>
        <span className="bottom__sep">/</span>
        <span>{pad(total)}</span>
      </div>
      <div className="bottom__ticks" aria-hidden>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={i === index ? "is-active" : ""} />
        ))}
      </div>
      <div className="bottom__cue" data-testid="bottom-drag-cue">
        <span className="bottom__cue-text">{dragging ? "Exploring" : "Drag to explore"}</span>
        <span className="bottom__arrow">→</span>
      </div>
    </div>
  );
};
