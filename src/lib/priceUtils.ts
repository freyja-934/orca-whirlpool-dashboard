import { Decimal } from "decimal.js";

// Constants for tick math
const MIN_TICK = -443636;
const MAX_TICK = 443636;

/**
 * Calculate tick index from price
 * Formula: tick = log(price) / log(1.0001)
 */
export function priceToTickIndex(price: Decimal, decimalsA: number, decimalsB: number): number {
  // Adjust price for decimal differences
  const decimalAdjustedPrice = price.mul(
    new Decimal(10).pow(decimalsA - decimalsB)
  );
  
  // Calculate tick: log(price) / log(1.0001)
  const tick = decimalAdjustedPrice.ln().div(new Decimal(1.0001).ln());
  
  // Round to nearest integer
  return Math.floor(tick.toNumber());
}

/**
 * Calculate price from tick index  
 * Formula: price = 1.0001^tick
 */
export function tickIndexToPrice(tick: number, decimalsA: number, decimalsB: number): Decimal {
  // Calculate raw price: 1.0001^tick
  const rawPrice = new Decimal(1.0001).pow(tick);
  
  // Adjust for decimal differences
  return rawPrice.div(new Decimal(10).pow(decimalsA - decimalsB));
}

/**
 * Get the nearest valid tick for a given tick spacing
 */
export function getNearestValidTick(tick: number, tickSpacing: number): number {
  return Math.round(tick / tickSpacing) * tickSpacing;
}

/**
 * Get tick bounds for full range position
 */
export function getFullRangeTicks(tickSpacing: number): { tickLower: number; tickUpper: number } {
  return {
    tickLower: getNearestValidTick(MIN_TICK, tickSpacing),
    tickUpper: getNearestValidTick(MAX_TICK, tickSpacing),
  };
}

/**
 * Convert min/max prices to tick indices
 */
export function priceRangeToTicks(
  minPrice: number,
  maxPrice: number,
  decimalsA: number,
  decimalsB: number,
  tickSpacing: number
): { tickLower: number; tickUpper: number } {
  const tickLower = priceToTickIndex(new Decimal(minPrice), decimalsA, decimalsB);
  const tickUpper = priceToTickIndex(new Decimal(maxPrice), decimalsA, decimalsB);
  
  return {
    tickLower: getNearestValidTick(tickLower, tickSpacing),
    tickUpper: getNearestValidTick(tickUpper, tickSpacing),
  };
} 