import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, Draggable } from "@/lib/gsap";
import { ExhibitionObject } from "@/components/ExhibitionObject";

export const Exhibition = forwardRef(function Exhibition(
  { products, onOpen, onActiveChange, onDragChange, dimmed },
  ref
) {
  const stageRef = useRef(null);
  const proxyRef = useRef(null);
  const spacerRef = useRef(null);
  const ghostRef = useRef(null);
  const itemRefs = useRef([]);
  const imgRefs = useRef([]);
  const lenisRef = useRef(null);
  const dragRef = useRef(null);
  const layoutRef = useRef([]);
  const activeRef = useRef(0);
  const dimmedRef = useRef(false);
  const glideRef = useRef(() => {});
  const introDone = useRef(false);
  const [hoverId, setHoverId] = useState(null);

  useImperativeHandle(ref, () => ({
    glideTo: (index, opts) => glideRef.current(index, opts),
  }));

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
      const cardH = Math.min(vh * 0.66, vh - 176);
      const cardW = cardH * 0.72;
      const gap = Math.max(vw * 0.05, 56);
      const padL = Math.max(vw * 0.07, 44);
      const padR = Math.max(vw * 0.12, 120);
      const cy = (vh - cardH) / 2 - vh * 0.01;
      let limit = 0;
      layout = products.map((p, i) => {
        const x = padL + i * (cardW + gap);
        gsap.set(items[i], { width: cardW, height: cardH, y: cy });
        limit = Math.max(limit, x + cardW + padR - vw);
        return { x, w: cardW, y: cy, depth: p.layout.speed };
      });
      layoutRef.current = layout;
      spacerRef.current.style.width = `${Math.ceil(vw + Math.max(limit, 0))}px`;
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
      const skew = gsap.utils.clamp(-2.2, 2.2, lenis.velocity * 0.045);
      const d = dragRef.current;
      if (d && !d.isPressed && !d.isDragging && !d.isThrowing) gsap.set(proxyRef.current, { x: -s });
      let best = 0;
      let bestDist = Infinity;
      layout.forEach((l, i) => {
        const sx = l.x - s;
        xSet[i](sx);
        skewSet[i](skew);
        const rel = (sx + l.w / 2 - vw / 2) / vw;
        imgSet[i](gsap.utils.clamp(-1.25, 1.25, rel) * l.w * -0.14 * l.depth);
        const dist = Math.abs(rel);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      ghostSet(-s * 0.4);
      if (best !== active) {
        active = best;
        activeRef.current = best;
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
        lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
        gsap.set(this.target, { x: -lenis.scroll });
        this.update();
        onDragChange(true);
      },
      onDrag() {
        lenis.scrollTo(-this.x, { immediate: true, force: true });
      },
      onThrowUpdate() {
        lenis.scrollTo(-this.x, { immediate: true, force: true });
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

    // glide to a given object index, centering it (momentum by default)
    glideRef.current = (index, opts = {}) => {
      const l = layoutRef.current[index];
      if (!l) return;
      const vw = window.innerWidth;
      const target = gsap.utils.clamp(0, lenis.limit, l.x + l.w / 2 - vw / 2);
      if (opts.immediate) {
        lenis.scrollTo(target, { immediate: true, force: true });
        gsap.set(proxyRef.current, { x: -target });
      } else {
        lenis.scrollTo(target, {
          duration: 1.15,
          force: true,
          easing: (t) => 1 - Math.pow(1 - t, 3),
        });
      }
    };

    const onKey = (e) => {
      if (dimmedRef.current) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        glideRef.current(Math.min(activeRef.current + 1, products.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        glideRef.current(Math.max(activeRef.current - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);

    const intro = gsap.timeline({ delay: 0.25, onComplete: () => (introDone.current = true) });
    intro
      .fromTo(
        items,
        { y: (i) => layout[i].y + 84, opacity: 0 },
        { y: (i) => layout[i].y, opacity: 1, duration: 1.9, stagger: 0.08, ease: "expo.out" }
      )
      .fromTo(ghostRef.current, { opacity: 0, yPercent: 18 }, { opacity: 1, yPercent: 0, duration: 2.2 }, 0.3);

    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("keydown", onKey);
      gsap.ticker.remove(tick);
      draggable.kill();
      lenis.destroy();
      intro.kill();
    };
  }, [products, onOpen, onActiveChange, onDragChange]);

  useEffect(() => {
    if (!introDone.current) return;
    itemRefs.current.forEach((el, i) => {
      const isHover = products[i].id === hoverId;
      el.classList.toggle("is-hover", isHover);
      gsap.to(el, {
        scale: isHover ? 1.04 : 1,
        opacity: hoverId && !isHover ? 0.3 : 1,
        zIndex: isHover ? 60 : 10,
        duration: 1.1,
        ease: "expo.out",
        overwrite: "auto",
      });
    });
  }, [hoverId, products]);

  useEffect(() => {
    dimmedRef.current = dimmed;
    const lenis = lenisRef.current;
    const d = dragRef.current;
    if (dimmed) {
      lenis.stop();
      d.disable();
    } else {
      lenis.start();
      d.enable();
    }
    gsap.to(stageRef.current, {
      opacity: dimmed ? 0 : 1,
      scale: dimmed ? 0.96 : 1,
      duration: dimmed ? 0.9 : 1.3,
      ease: "expo.inOut",
    });
  }, [dimmed]);

  return (
    <>
      <div ref={spacerRef} className="ex-spacer" aria-hidden />
      <div ref={proxyRef} className="ex-proxy" aria-hidden />
      <section ref={stageRef} className="ex-stage" data-testid="spatial-canvas">
        <div ref={ghostRef} className="ex-ghost" aria-hidden>
          Chronicle
        </div>
        <p className="ex-caption" aria-hidden>
          Chronicle 01 — Eight objects — Made by hand across India
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
});
