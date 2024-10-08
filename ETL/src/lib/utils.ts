/**
 * Get distance between two points
 * https://henry-rossiter.medium.com/calculating-distance-between-geographic-coordinates-with-javascript-5f3097b61898
 */
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3;
  const p1 = (lat1) * Math.PI / 180;
  const p2 = (lat2) * Math.PI / 180;
  const deltaP = p2 - p1;
  const deltaLon = (lon2) - (lon1);
  const deltaLambda = (deltaLon * Math.PI) / 180;
  const a = Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const d = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * R;
  return Math.round(d / 1000);
};
