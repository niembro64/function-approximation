// Format number in scientific notation with explicit signs on both mantissa and exponent
export const generateScientificNotation = (value: number, decimals: number): string => {
  const expStr: string = value.toExponential(decimals);
  // Replace 'e' or 'e-' with 'e+' or 'e-' to always show sign on exponent
  // and pad exponent to always show two digits
  const withExpSign: string = expStr
    .replace(/e(\d)$/, 'e+0$1')  // Single digit positive: e5 -> e+05
    .replace(/e\+(\d)$/, 'e+0$1') // Single digit with +: e+5 -> e+05
    .replace(/e-(\d)$/, 'e-0$1')  // Single digit negative: e-5 -> e-05
    .replace(/e(\d{2,})/, 'e+$1') // Multi-digit without sign: e15 -> e+15
    .replace(/e\+\-/, 'e-');       // Fix double sign
  // Add sign to mantissa if positive
  return value >= 0 ? `+${withExpSign}` : withExpSign;
};
