import geoip from 'geoip-lite';

/**
 * Checks if an IP address is located in South Korea
 * @param ip - The IP address to check
 * @returns true if the IP is from South Korea ('KR'), false otherwise
 */
export function isSouthKorean(ip: string): boolean {
  try {
    // Validate IP format (basic check)
    if (!ip || typeof ip !== 'string' || ip.trim() === '') {
      return false;
    }

    // Trim whitespace
    const trimmedIp = ip.trim();

    // Lookup geolocation data
    const geo = geoip.lookup(trimmedIp);

    // Check if lookup was successful and country is South Korea
    if (geo && geo.country === 'KR') {
      return true;
    }

    return false;
  } catch (error) {
    // Handle any errors (invalid IP format, etc.) by returning false
    console.warn(`Failed to geolocate IP ${ip}:`, error);
    return false;
  }
}
