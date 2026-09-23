import { forwardRef } from "react";
import { formatPrice, pad } from "@/data/products";

export const ExhibitionObject = forwardRef(function ExhibitionObject(
  { product, index, imgRef, onHover },
  ref
) {
  return (
    <article
      ref={ref}
      className="obj"
      data-object-id={product.id}
      data-testid={`object-card-${product.id}`}
      data-cursor="view"
      style={{ zIndex: 10 }}
      onMouseEnter={() => onHover(product.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="obj__frame">
        <img ref={imgRef} className="obj__img" src={product.image} alt={product.name} draggable={false} />
        <div className="obj__scrim" aria-hidden />
        <div className="obj__reel obj__reel--top" aria-hidden />
        <div className="obj__reel obj__reel--bottom" aria-hidden />
        <div className="obj__tag" data-testid={`object-tag-${product.id}`}>
          <span className="obj__tag-num">{pad(index + 1)}</span>
          <span className="obj__tag-place">{product.place}</span>
        </div>
      </div>
      <div className="obj__label" data-testid={`object-metadata-${product.id}`}>
        <div className="obj__bigname">
          <span className="obj__bigname-inner">{product.name}</span>
        </div>
        <div className="obj__details">
          <span>{product.material}</span>
          <span className="obj__price">{formatPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
});
