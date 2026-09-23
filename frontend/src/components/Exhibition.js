import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, Draggable } from "@/lib/gsap";
import { ExhibitionObject } from "@/components/ExhibitionObject";

export const Exhibition = ({ products, onOpen, onActiveChange, onDragChange, dimmed }) => {
  const stageRef = useRef(null);
  const proxyRef = useRef(null);
  const spacerRef = useRef(null);
  const ghostRef = useRef(null);
  const itemRefs = useRef([]);
  const imgRefs = useRef([]);
  const lenisRef = useRef(null);
  const dragRef = useRef(null);
  const introDone = useRef(false);
  const [hoverId, setHoverId] = useState(null);

  useEffect(() => {
    const items = itemRefs.current;
    const lenis = new Lenis({
      orientation: "horizontal",
      gestureOrientation: "both",
      lerp: 0.07,
      wheelMultiplier: 1.1,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 0,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    let layout = [];
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const ux = Math.max(vw, 960);
      let limit = 0;
      layout = products.map((p, i) => {
        const h = p.layout.h * vh;
        const w = h * p.layout.ar;
        const x = p.layout.x * ux;
        gsap.set(items[i], { width: w, height: h, y: p.layout.y * vh });
        limit = Math.max(limit, (x + w + vw * 0.08 - vw) / p.layout.speed);
        return { x, w, speed: p.layout.speed };
      });
      spacerRef.current.style.width = `${Math.ceil(vw + limit)}px`;
      lenis.resize();
      dragRef.current?.applyBounds({ minX: -lenis.limit, maxX: 0 });
    };
    measure();

    const xSet = items.map((el) => gsap.quickSetter(el, "x", "px"));
    const skewSet = items.map((el) => gsap.quickSetter(el, "skewX", "deg"));
    const imgSet = imgRefs.current.map((el) => gsap.quickSetter(el, "x", "px"));
    const ghostSet = gsap.quickSetter(ghostRef.current, "x", "px");
    let active = -1;

    const tick = (time) => {
      lenis.raf(time * 1000);
      const s = lenis.scroll;
      const vw = window.innerWidth;
      const skew = gsap.utils.clamp(-2.5, 2.5, lenis.velocity * 0.05);
      const d = dragRef.current;
      if (d && !d.isPressed && !d.isDragging && !d.isThrowing) gsap.set(proxyRef.current, { x: -s });
      let best = 0;
      let bestDist = Infinity;
      layout.forEach((l, i) => {
        const sx = l.x - s * l.speed;
        xSet[i](sx);
        skewSet[i](skew);
        const rel = (sx + l.w / 2 - vw / 2) / vw;
        imgSet[i](gsap.utils.clamp(-1.5, 1.5, rel) * l.w * -0.1);
        const dist = Math.abs(rel);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      ghostSet(-s * 0.35);
      if (best !== active) {
        active = best;
        onActiveChange(best);
      }
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const [draggable] = Draggable.create(proxyRef.current, {
      type: "x",
      trigger: stageRef.current,
      inertia: true,
      allowNativeTouchScrolling: false,
      edgeResistance: 0.85,
      throwResistance: 1400,
      maxDuration: 1.8,
      minimumMovement: 4,
      bounds: { minX: -lenis.limit, maxX: 0 },
      onPress() {
        lenis.scrollTo(lenis.scroll, { immediate: true });
        gsap.set(this.target, { x: -lenis.scroll });
        this.update();
        onDragChange(true);
      },
      onDrag() {
        lenis.scrollTo(-this.x, { immediate: true });
      },
      onThrowUpdate() {
        lenis.scrollTo(-this.x, { immediate: true });
      },
      onRelease() {
        onDragChange(false);
      },
      onClick(e) {
        const el = e.target.closest?.("[data-object-id]");
        if (el) onOpen(el.dataset.objectId, el);
      },
    });
    dragRef.current = draggable;

    const intro = gsap.timeline({ delay: 0.25, onComplete: () => (introDone.current = true) });
    const vh0 = window.innerHeight;
    intro
      .fromTo(
        items,
        { y: (i) => products[i].layout.y * vh0 + 90, opacity: 0, rotation: (i) => products[i].layout.rot * 2.4 },
        {
          y: (i) => products[i].layout.y * vh0,
          opacity: 1,
          rotation: (i) => products[i].layout.rot,
          duration: 1.9,
          stagger: 0.09,
          ease: "expo.out",
        }
      )
      .fromTo(ghostRef.current, { opacity: 0, yPercent: 20 }, { opacity: 1, yPercent: 0, duration: 2.2 }, 0.3);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      gsap.ticker.remove(tick);
      draggable.kill();
      lenis.destroy();
      intro.kill();
    };
  }, [products, onOpen, onActiveChange, onDragChange]);

  useEffect(() => {
    if (!introDone.current) return;
    itemRefs.current.forEach((el, i) => {
      const p = products[i];
      const isHover = p.id === hoverId;
      el.classList.toggle("is-hover", isHover);
      gsap.to(el, {
        scale: isHover ? 1.05 : 1,
        rotation: isHover ? 0 : p.layout.rot,
        opacity: hoverId && !isHover ? 0.38 : 1,
        zIndex: isHover ? 60 : Math.round(p.layout.speed * 10),
        duration: 1.1,
        ease: "expo.out",
        overwrite: "auto",
      });
    });
  }, [hoverId, products]);

  useEffect(() => {
    const lenis = lenisRef.current;
    const d = dragRef.current;
    if (dimmed) {
      lenis.stop();
      d.disable();
    } else {
      lenis.start();
      d.enable();
    }
    gsap.to(stageRef.current, { opacity: dimmed ? 0 : 1, scale: dimmed ? 0.96 : 1, duration: dimmed ? 0.9 : 1.3, ease: "expo.inOut" });
  }, [dimmed]);

  return (
    <>
      <div ref={spacerRef} className="ex-spacer" aria-hidden />
      <div ref={proxyRef} className="ex-proxy" aria-hidden />
      <section ref={stageRef} className="ex-stage" data-testid="spatial-canvas">
        <div ref={ghostRef} className="ex-ghost" aria-hidden>
          Objects
        </div>
        <p className="ex-caption" aria-hidden>
          Exhibition 01 — Eight objects — Made by hand across India
        </p>
        {products.map((p, i) => (
          <ExhibitionObject
            key={p.id}
            product={p}
            index={i}
            ref={(el) => (itemRefs.current[i] = el)}
            imgRef={(el) => (imgRefs.current[i] = el)}
            onHover={setHoverId}
          />
        ))}
      </section>
    </>
  );
};
