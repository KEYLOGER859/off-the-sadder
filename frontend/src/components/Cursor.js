import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const LABELS = { view: "View", drag: "Drag", link: "", open: "Open" };

export const Cursor = ({ dragging }) => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [mode, setMode] = useState("default");
  const [down, setDown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const dx = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    const move = (e) => {
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      setVisible(true);
    };
    const over = (e) => {
      const t = e.target.closest?.("[data-cursor]");
      setMode(t ? t.dataset.cursor : "default");
    };
    const leave = () => setVisible(false);
    const dn = () => setDown(true);
    const up = () => setDown(false);
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", dn);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", dn);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  const finalMode = dragging ? "drag" : mode;
  const cls = `cursor cursor--${finalMode} ${visible ? "is-visible" : ""} ${down ? "is-down" : ""}`;

  return (
    <div className={cls} aria-hidden data-testid="custom-cursor">
      <span ref={ringRef} className="cursor__ring">
        <span className="cursor__label">{LABELS[finalMode] || ""}</span>
      </span>
      <span ref={dotRef} className="cursor__dot" />
    </div>
  );
};
