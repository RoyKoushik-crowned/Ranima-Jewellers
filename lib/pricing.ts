export type PricingResult = {
  goldValue: number;
  makingCharge: number;
  goldGst: number;
  makingGst: number;
  additionalCharges: number;
  finalPrice: number;
};

export const DEFAULT_PRICING_SETTINGS = {
  makingPercentage: 0.10,
  lightweightThreshold: 1.0,
  lightweightMakingPercentage: 0.10,
  goldGstPercentage: 0.03,
  makingGstPercentage: 0.03,
};

export function calculateGoldPrice(
  goldWeight: number,
  goldRatePerGram: number,
  additionalCharges = 0,
  settings = DEFAULT_PRICING_SETTINGS
): PricingResult {
  const goldValue = goldWeight * goldRatePerGram;

  const makingCharge =
    goldWeight >= settings.lightweightThreshold
      ? goldValue * settings.makingPercentage
      : goldRatePerGram * settings.lightweightMakingPercentage;

  const goldGst = goldValue * settings.goldGstPercentage;
  const makingGst = makingCharge * settings.makingGstPercentage;

  const finalPrice =
    goldValue +
    makingCharge +
    goldGst +
    makingGst +
    additionalCharges;

  return {
    goldValue,
    makingCharge,
    goldGst,
    makingGst,
    additionalCharges,
    finalPrice,
  };
}
