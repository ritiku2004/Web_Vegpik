
const fs = require('fs');
const files = [
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/components/common/ProductCard/ProductCard.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/components/FloatingCart.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/components/ProductCard.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages/Cart/Cart.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages/OrderAgain/OrderAgain.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages/Profile/Profile.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages_next/cart/page.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages_next/checkout/page.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages_next/orders/page.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages_next/orders/[id]/page.jsx',
  'd:/Client-Projects/Vegpik/Web_Vegpik/src/pages_next/product/[id]/page.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Pattern 1: AED {variable}
  content = content.replace(/AED \{([^}]+)\}/g, (match, p1) => {
    if (p1.includes('.toFixed') || /^\d+$/.test(p1.trim())) {
      return match;
    }
    return 'AED {Number(' + p1 + ').toFixed(2)}';
  });

  // Pattern 2: AED \ inside backticks
  content = content.replace(/AED \\\$\{([^}]+)\\}/g, (match, p1) => {
    if (p1.includes('.toFixed')) return match;
    return 'AED \';
  });

  // Pattern 3: static numbers e.g. AED 20, AED 0, AED 300
  content = content.replace(/AED (\d+)(?!\.)/g, (match, p1) => {
    return 'AED ' + Number(p1).toFixed(2);
  });

  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
