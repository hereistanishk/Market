export function formatPrice(price: number, displayPrice?: string): string {
  if (displayPrice) {
    if (Math.abs(Number(price) - Number(displayPrice)) < 0.00001) {
      return displayPrice;
    } else {
      const parts = displayPrice.split('.');
      const intPart = parts[0];
      const decPart = parts.length > 1 ? parts[1] : '';
      
      const priceParts = price.toString().split('.');
      let newIntPart = priceParts[0];
      const newDecPart = priceParts.length > 1 ? priceParts[1] : '';
      
      if (intPart.length > 1 && intPart.startsWith('0')) {
         newIntPart = newIntPart.padStart(intPart.length, '0');
      }
      
      let finalDecPart = newDecPart;
      if (decPart.length > newDecPart.length) {
         finalDecPart = finalDecPart.padEnd(decPart.length, '0');
      }
      
      let res = newIntPart;
      if (finalDecPart.length > 0 || displayPrice.includes('.')) {
         res += '.' + finalDecPart;
      }
      
      return res;
    }
  }
  
  // Normal formatting for things like total when no displayPrice is available
  const str = price.toString();
  const rawDigits = str.replace(/[^0-9]/g, '');
  if (rawDigits.length < 3 && !str.includes('.')) {
    return price.toFixed(2);
  }
  return str.includes('.') ? price.toFixed(2) : str;
}

export function formatTotalPrice(items: { product: { price: number, displayPrice?: string }, quantity: number }[]): string {
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  if (items.length === 1 && items[0].product.displayPrice) {
    return formatPrice(total, items[0].product.displayPrice);
  }
  
  const itemWithFormat = items.find(item => item.product.displayPrice && (item.product.displayPrice.startsWith('00') || item.product.displayPrice.includes('.')));
  if (itemWithFormat && itemWithFormat.product.displayPrice) {
     return formatPrice(total, itemWithFormat.product.displayPrice);
  }
  
  return formatPrice(total);
}
