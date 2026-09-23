import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap, Draggable } from "@/lib/gsap";
import { ExhibitionObject } from "@/components/ExhibitionObject";

const TILT = -6; // resting card tilt (deg); straightens on hover

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
    const depths = products.map((p) => p.layout.speed);
    const lenis = new Lenis({
      orientation: "horizontal",
      gestureOrientation: "both",
      lerp: 0.07,
      wheelMultiplier: 1.1,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 0,
      infinite: true,
      autoRaf: false,
    });
    lenisRef.current = lenis;

    let positions = [];
    let step = 0;
    let totalWidth = 0;
    let cardW = 0;

    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cardH = Math.min(vh * 0.62, vh - 180);
      cardW = cardH * 0.72;
      const gap = Math.max(vw * 0.055, 64);
      step = cardW + gap;
      totalWidth = products.length * step;
      const cy = (vh - cardH) / 2 - vh * 0.01;
      positions = products.map((_, i) => {
        gsap.set(items[i], { width: cardW, height: cardH, y: cy, rotation: TILT });
        return i * step;
      });
      // reserve scroll space so lenis wrap period === totalWidth
      spacerRef.current.style.width = `${Math.ceil(vw + totalWidth)}px`;
      lenis.resize();
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
      for (let i = 0; i < positions.length; i++) {
        const x = gsap.utils.wrap(-step, totalWidth - step, positions[i] - s);
        xSet[i](x);
        skewSet[i](skew);
        const rel = (x + cardW / 2 - vw / 2) / vw;
        imgSet[i](gsap.utils.clamp(-1.25, 1.25, rel) * cardW * -0.14 * depths[i]);
        const dist = Math.abs(rel);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
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
      throwResistance: 1400,
      maxDuration: 2.2,
      minimumMovement: 4,
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

    // glide to center a given object index (momentum by default, shortest path)
    glideRef.current = (index, opts = {}) => {
      if (!positions.length) return;
      const vw = window.innerWidth;
      const want = positions[index] - (vw - cardW) / 2;
      const s = lenis.scroll;
      let delta = (((want - s) % totalWidth) + totalWidth) % totalWidth;
      if (delta > totalWidth / 2) delta -= totalWidth;
      const target = s + delta;
      if (opts.immediate) {
        lenis.scrollTo(target, { immediate: true, force: true });
        gsap.set(proxyRef.current, { x: -target });
      } else {
        lenis.scrollTo(target, { duration: 1.15, force: true, easing: (t) => 1 - Math.pow(1 - t, 3) });
      }
    };

    const onKey = (e) => {
      if (dimmedRef.current) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        glideRef.current(activeRef.current + 1 >= products.length ? 0 : activeRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        glideRef.current(activeRef.current - 1 < 0 ? products.length - 1 : activeRef.current - 1);
      }
    };
    window.addEventListener("keydown", onKey);

    const intro = gsap.timeline({ delay: 0.25, onComplete: () => (introDone.current = true) });
    intro
      .fromTo(
        items,
        { yPercent: 14, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1.9, stagger: 0.08, ease: "expo.out" }
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
        scale: isHover ? 1.05 : 1,
        rotation: isHover ? 0 : TILT,
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
