import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { formatPrice, pad } from "@/data/products";

export const ProductView = ({ product, index, total, sourceEl, onExitStart, onClosed, onAddToBag }) => {
  const rootRef = useRef(null);
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const infoRef = useRef(null);
  const closingRef = useRef(false);
  const [added, setAdded] = useState(false);

  const sourceTransform = () => {
    const r = sourceEl.getBoundingClientRect();
    const t = frameRef.current.getBoundingClientRect();
    const scale = gsap.getProperty(sourceEl, "scale") || 1;
    const w = sourceEl.offsetWidth * scale;
    const h = sourceEl.offsetHeight * scale;
    return {
      x: r.left + r.width / 2 - (t.left + t.width / 2),
      y: r.top + r.height / 2 - (t.top + t.height / 2),
      scaleX: w / t.width,
      scaleY: h / t.height,
      rotation: gsap.getProperty(sourceEl, "rotation") || 0,
    };
  };

  useLayoutEffect(() => {
    const root = rootRef.current;
    const lines = root.querySelectorAll(".pv__line-inner");
    const meta = root.querySelectorAll(".pv__reveal");
    const tl = gsap.timeline();
    tl.fromTo(root, { "--pv-bg": 0 }, { "--pv-bg": 1, duration: 0.9, ease: "power2.out" }, 0)
      .fromTo(frameRef.current, { ...sourceTransform(), transformOrigin: "50% 50%" }, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 1.4, ease: "expo.inOut" }, 0)
      .fromTo(imgRef.current, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0.15)
      .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.07, ease: "expo.out" }, 0.7)
      .fromTo(meta, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, stagger: 0.06, ease: "power3.out" }, 0.95);
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closingRef.current) return;
    closingRef.current = true;
    onExitStart();
    const tl = gsap.timeline({ onComplete: onClosed });
    tl.to(infoRef.current, { opacity: 0, y: -10, duration: 0.45, ease: "power2.in" }, 0)
      .to(frameRef.current, { ...sourceTransform(), duration: 1.1, ease: "expo.inOut" }, 0.05)
      .to(rootRef.current, { "--pv-bg": 0, duration: 0.8, ease: "power2.inOut" }, 0.3)
      .to(frameRef.current, { opacity: 0, duration: 0.3 }, 0.95);
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addToBag = () => {
    onAddToBag(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="pv" ref={rootRef} data-testid="product-detail-modal">
      <button className="pv__close" onClick={close} data-testid="product-modal-close-button" data-cursor="link" type="button">
        <span className="pv__reveal">Close</span>
        <span className="pv__reveal pv__close-x">×</span>
      </button>

      <div className="pv__media">
        <div className="pv__frame" ref={frameRef}>
          <img ref={imgRef} src={product.image} alt={product.name} draggable={false} data-testid="product-detail-image" />
        </div>
        <span className="pv__reveal pv__media-cap">
          {pad(index + 1)} / {pad(total)} — {product.place}
        </span>
      </div>

      <aside className="pv__info" ref={infoRef}>
        <span className="pv__reveal pv__eyebrow">Object {pad(index + 1)}</span>
        <h2 className="pv__name" data-testid="product-detail-name">
          {product.name.split(" ").map((w, i) => (
            <span className="pv__line" key={i}>
              <span className="pv__line-inner">{w}</span>
            </span>
          ))}
        </h2>
        <dl className="pv__specs">
          <div className="pv__reveal"><dt>Material</dt><dd data-testid="product-detail-material">{product.material}</dd></div>
          <div className="pv__reveal"><dt>Place of making</dt><dd data-testid="product-detail-place">{product.place}</dd></div>
          <div className="pv__reveal"><dt>Maker</dt><dd data-testid="product-detail-maker">{product.maker}</dd></div>
        </dl>
        <p className="pv__reveal pv__story" data-testid="product-detail-story">{product.story}</p>
        <div className="pv__reveal pv__buy">
          <span className="pv__price" data-testid="product-detail-price">{formatPrice(product.price)}</span>
          <button className={`pv__add ${added ? "is-added" : ""}`} onClick={addToBag} data-testid="product-add-to-bag-button" data-cursor="link" type="button">
            <span className="pv__add-text">{added ? "Added to bag" : "Add to bag"}</span>
            <span className="pv__add-dot" />
          </button>
        </div>
      </aside>
    </div>
  );
};
