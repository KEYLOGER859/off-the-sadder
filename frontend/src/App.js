import { useCallback, useState } from "react";
import "@/App.css";
import { products } from "@/data/products";
import { Header } from "@/components/Header";
import { Exhibition } from "@/components/Exhibition";
import { BottomUI } from "@/components/BottomUI";
import { Cursor } from "@/components/Cursor";
import { ProductView } from "@/components/ProductView";
import { MenuOverlay } from "@/components/MenuOverlay";

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [dimmed, setDimmed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bagCount, setBagCount] = useState(0);

  const openProduct = useCallback((id, sourceEl) => {
    const index = products.findIndex((p) => p.id === id);
    setViewing({ product: products[index], index, sourceEl });
    setDimmed(true);
  }, []);

  return (
    <div className="app" data-testid="objects-marketplace">
      <Header bagCount={bagCount} onMenu={() => setMenuOpen(true)} />
      <Exhibition
        products={products}
        onOpen={openProduct}
        onActiveChange={setActiveIndex}
        onDragChange={setDragging}
        dimmed={dimmed || menuOpen}
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
          onAddToBag={() => setBagCount((c) => c + 1)}
        />
      )}
      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
      <Cursor dragging={dragging} />
    </div>
  );
}
