export type PricingSettings = {
  makingPercentage: number;
  lightweightThreshold: number;
  lightweightMakingCharge: number;
  goldGstPercentage: number;
  makingGstPercentage: number;
};

export type PricingResult = {
  goldValue: number;
  makingCharge: number;
  goldGst: number;
  makingGst: number;
  additionalCharges: number;
  finalPrice: number;
};

export const DEFAULT_PRICING_SETTINGS: PricingSettings = {
  makingPercentage: 0.10,
  lightweightThreshold: 1.0,
  lightweightMakingCharge: 1500,
  goldGstPercentage: 0.03,
  makingGstPercentage: 0.03,
};

export function calculateGoldPrice(
  goldWeight: number,
  goldRatePerGram: number,
  additionalCharges = 0,
  settings: PricingSettings = DEFAULT_PRICING_SETTINGS
): PricingResult {
  const goldValue = goldWeight * goldRatePerGram;

  const makingCharge =
    goldWeight >= settings.lightweightThreshold
      ? goldValue * settings.makingPercentage
      : settings.lightweightMakingCharge;

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
