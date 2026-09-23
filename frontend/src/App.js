import { useCallback, useRef, useState } from "react";
import "@/App.css";
import { products } from "@/data/products";
import { Header } from "@/components/Header";
import { Exhibition } from "@/components/Exhibition";
import { BottomUI } from "@/components/BottomUI";
import { Cursor } from "@/components/Cursor";
import { ProductView } from "@/components/ProductView";
import { MenuOverlay } from "@/components/MenuOverlay";
import { BagDrawer } from "@/components/BagDrawer";

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [dimmed, setDimmed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [bag, setBag] = useState([]);
  const exhibitionRef = useRef(null);

  const openProduct = useCallback((id, sourceEl) => {
    const index = products.findIndex((p) => p.id === id);
    setViewing({ product: products[index], index, sourceEl });
    setDimmed(true);
  }, []);

  const navigate = useCallback((dir) => {
    setViewing((v) => {
      if (!v) return v;
      const next = (v.index + dir + products.length) % products.length;
      const product = products[next];
      exhibitionRef.current?.glideTo(next, { immediate: true });
      const el = document.querySelector(`[data-object-id="${product.id}"]`);
      return { product, index: next, sourceEl: el || v.sourceEl };
    });
  }, []);

  const addToBag = useCallback((product) => {
    setBag((b) => [...b, product]);
  }, []);

  const removeFromBag = useCallback((idx) => {
    setBag((b) => b.filter((_, i) => i !== idx));
  }, []);

  return (
    <div className="app" data-testid="objects-marketplace">
      <Header bagCount={bag.length} onMenu={() => setMenuOpen(true)} onBag={() => setBagOpen(true)} />
      <Exhibition
        ref={exhibitionRef}
        products={products}
        onOpen={openProduct}
        onActiveChange={setActiveIndex}
        onDragChange={setDragging}
        dimmed={dimmed || menuOpen || bagOpen}
      />
      <BottomUI index={activeIndex} total={products.length} dragging={dragging} hidden={!!viewing} />
      {viewing && (
        <ProductView
          product={viewing.product}
          index={viewing.index}
          total={products.length}
          sourceEl={viewing.sourceEl}
          onExitStart={() => setDimmed(false)}
          onClosed={() => setViewing(null)}
          onAddToBag={addToBag}
          onNavigate={navigate}
        />
      )}
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <BagDrawer open={bagOpen} bag={bag} onClose={() => setBagOpen(false)} onRemove={removeFromBag} />
      <Cursor dragging={dragging} />
    </div>
  );
}
