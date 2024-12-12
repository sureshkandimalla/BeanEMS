export const formatCurrency = (value) => {
    if (value == null) return '$0.00'; // Handle null or undefined values
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };