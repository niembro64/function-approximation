// Format number in scientific notation with explicit signs on both mantissa and exponent
export const generateScientificNotation = (value: number, decimals: number = 4): string => {
  const expStr: string = value.toExponential(decimals);
  // Replace 'e' or 'e-' with 'e+' or 'e-' to always show sign on exponent
  const withExpSign: string = expStr
    .replace(/e(\d)/, 'e+$1')
    .replace(/e\+\-/, 'e-');
  // Add sign to mantissa if positive
  return value >= 0 ? `+${withExpSign}` : withExpSign;
};
