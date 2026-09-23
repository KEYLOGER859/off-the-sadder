import { useEffect } from "react";
import { formatPrice, pad } from "@/data/products";

export const BagDrawer = ({ open, bag, onClose, onRemove }) => {
  const total = bag.reduce((sum, p) => sum + p.price, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`bag__backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
        data-testid="bag-backdrop"
        aria-hidden
      />
      <aside className={`bag ${open ? "is-open" : ""}`} data-testid="bag-drawer" aria-hidden={!open}>
        <button className="bag__close" onClick={onClose} data-testid="bag-close-button" data-cursor="link" type="button">
          Close <span className="bag__close-x">×</span>
        </button>

        <div className="bag__head">
          <h2 className="bag__title">Your Bag</h2>
          <span className="bag__count" data-testid="bag-drawer-count">
            {pad(bag.length)} {bag.length === 1 ? "object" : "objects"}
          </span>
        </div>

        <div className="bag__list">
          {bag.length === 0 ? (
            <p className="bag__empty" data-testid="bag-empty">
              Your bag is empty — explore the chronicle and gather what you love.
            </p>
          ) : (
            bag.map((p, i) => (
              <div className="bag__item" key={`${p.id}-${i}`} data-testid={`bag-item-${i}`}>
                <div className="bag__thumb">
                  <img src={p.image} alt={p.name} draggable={false} />
                </div>
                <div className="bag__meta">
                  <span className="bag__name">{p.name}</span>
                  <span className="bag__place">{p.place}</span>
                </div>
                <span className="bag__price">{formatPrice(p.price)}</span>
                <button className="bag__remove" onClick={() => onRemove(i)} data-testid={`bag-remove-${i}`} data-cursor="link" type="button">
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        <div className="bag__foot">
          <div className="bag__total">
            <span>Total</span>
            <span className="bag__total-val" data-testid="bag-total">{formatPrice(total)}</span>
          </div>
          <button className="bag__checkout" data-testid="bag-checkout-button" data-cursor="link" type="button" disabled={bag.length === 0}>
            Checkout
          </button>
        </div>
      </aside>
    </>
  );
};
