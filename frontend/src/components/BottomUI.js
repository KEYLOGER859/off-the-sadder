import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { pad } from "@/data/products";

export const BottomUI = ({ index, total, dragging, hidden }) => {
  const rootRef = useRef(null);
  const fillRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      rootRef.current.children,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.4, stagger: 0.1, delay: 1.1 }
    );
  }, []);

  useEffect(() => {
    gsap.to(fillRef.current, {
      scaleX: (index + 1) / total,
      duration: 0.9,
      ease: "expo.out",
    });
  }, [index, total]);

  useEffect(() => {
    gsap.to(rootRef.current, { opacity: hidden ? 0 : 1, duration: 0.6 });
  }, [hidden]);

  return (
    <div className={`bottom ${dragging ? "is-dragging" : ""}`} ref={rootRef}>
      <div className="bottom__pager" data-testid="chronicle-pager">
        <span className="bottom__bracket">[</span>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`bottom__pg ${i === index ? "is-active" : ""}`}
            data-testid={`chronicle-pg-${i}`}
          >
            {pad(i + 1)}
          </span>
        ))}
        <span className="bottom__bracket">]</span>
      </div>
      <div className="bottom__right">
        <div className="bottom__cue" data-testid="bottom-drag-cue">
          <span className="bottom__cue-text">{dragging ? "Exploring" : "Drag · Arrow keys to explore"}</span>
          <span className="bottom__arrow">→</span>
        </div>
        <div className="bottom__track" aria-hidden>
          <div ref={fillRef} className="bottom__track-fill" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
};
