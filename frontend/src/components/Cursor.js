import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

const LABELS = { view: "View", drag: "Drag", link: "" };

export const Cursor = ({ dragging }) => {
  const ref = useRef(null);
  const [mode, setMode] = useState("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const xTo = gsap.quickTo(el, "x", { duration: 0.32, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.32, ease: "power3" });
    const move = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      setVisible(true);
    };
    const over = (e) => {
      const t = e.target.closest?.("[data-cursor]");
      setMode(t ? t.dataset.cursor : "default");
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  const finalMode = dragging ? "drag" : mode;
  return (
    <div ref={ref} className={`cursor cursor--${finalMode} ${visible ? "is-visible" : ""}`} aria-hidden data-testid="custom-cursor">
      <span className="cursor__dot" />
      <span className="cursor__ring">
        <span className="cursor__label">{LABELS[finalMode] || ""}</span>
      </span>
    </div>
  );
};
