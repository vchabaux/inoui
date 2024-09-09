/**
 *
 *  This is the Haversine formula https://en.wikipedia.org/wiki/Haversine_formula
 *  It measures the distance between two points in a straight line following earths curvature
 *  Credit goes to StackOverflow user Airikr https://stackoverflow.com/q/18883601/13374041
 *
 * @param {Array} firstPoint Array of coordinates in [lat,lng]
 * @param {Array} secondPoint Array of coordinates in [lat,lng]
 * @param {String} metric Either km or m , depends wether you want the return value in meters or in kilometers
 * @returns {Number} Distance between two coordinates in meters or kilometers
 */
export const getDistanceFromLatLon = (
  firstPoint,
  secondPoint,
  metric = "km"
) => {
  const [lat1, lon1] = firstPoint;
  const [lat2, lon2] = secondPoint;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return metric === "km" ? distance : distance * 1000;
};

/**
 *  Degrees to Radian
 * @param {Number} deg Degrees
 * @returns {Number} Value in Radian
 */
export const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};
