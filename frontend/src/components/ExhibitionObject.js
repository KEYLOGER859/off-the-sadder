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
      style={{ zIndex: Math.round(product.layout.speed * 10) }}
      onMouseEnter={() => onHover(product.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="obj__frame">
        <img ref={imgRef} className="obj__img" src={product.image} alt={product.name} draggable={false} />
      </div>
      <span className="obj__num">{pad(index + 1)}</span>
      <div className="obj__meta" data-testid={`object-metadata-${product.id}`}>
        <h3 className="obj__name">{product.name}</h3>
        <div className="obj__details">
          <span>{product.place}</span>
          <span>{product.material}</span>
          <span className="obj__price">{formatPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
});
