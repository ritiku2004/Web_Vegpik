import React from 'react';
import productPlaceholder from '../../../assets/product_placeholder.png';
import styles from './ProductCard.module.css';

const ProductCard = React.memo(({
  product,
  cartQuantity = 0,
  onPress,
  onIncrement,
  onDecrement,
  className = '',
}) => {
  const { name, price, discountPrice, unit, image, stock = 0, isAvailable = true } = product;
  const hasDiscount = discountPrice && discountPrice < price;
  const isOutOfStock = stock <= 0 || !isAvailable;

  // Calculate discount percentage
  const discountPercent = hasDiscount ? Math.round(((price - discountPrice) / price) * 100) : 0;

  return (
    <div 
      className={`${styles.card} ${isOutOfStock ? styles.outOfStockCard : ''} ${className}`}
      onClick={!isOutOfStock ? onPress : undefined}
    >
      {/* Product Image Section */}
      <div className={styles.imageContainer}>
        <img
          src={image || productPlaceholder}
          alt={name}
          className={styles.image}
        />

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className={styles.outOfStockOverlay}>
            <span className={styles.outOfStockText}>OUT OF STOCK</span>
          </div>
        )}

        {/* Veg Icon (Bottom Left) */}
        <div className={styles.vegIcon}>
          <div className={styles.vegDot} />
        </div>

        {/* Overlapping ADD Button (Bottom Right) */}
        {!isOutOfStock && (
          <div className={styles.addButtonWrapper} onClick={(e) => e.stopPropagation()}>
            {cartQuantity > 0 ? (
              <div className={styles.quantityControl}>
                <button className={styles.qtyBtn} onClick={onDecrement}>-</button>
                <span className={styles.qtyText}>{cartQuantity}</span>
                <button className={styles.qtyBtn} onClick={onIncrement}>+</button>
              </div>
            ) : (
              <button className={styles.addBtn} onClick={onIncrement}>
                ADD
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Info Section */}
      <div className={styles.infoContainer}>
        {/* Unit Tag */}
        <div className={styles.unitTag}>
          <span className={styles.unitText}>{unit}</span>
        </div>

        {/* Product Name */}
        <h4 className={styles.name} title={name}>
          {name}
        </h4>


        {/* Discount badge */}
        {hasDiscount && (
          <div className={styles.discountText}>
            {discountPercent}% OFF
          </div>
        )}

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.price}>₹{discountPrice || price}</span>
          {hasDiscount && (
            <span className={styles.originalPrice}>₹{price}</span>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
