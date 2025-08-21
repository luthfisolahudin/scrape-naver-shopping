// Source URLs:
// - https://github.com/proxifly/free-proxy-list/raw/refs/heads/main/proxies/countries/KR/data.txt
//
// Example format data:
// ```
// socks4://125.141.133.48:5566
// socks5://121.169.46.116:1090
// http://123.141.181.1:5031
// ```

import { isSouthKorean } from '../utils/geolocation.js';

const SOURCE_URL = 'https://github.com/proxifly/free-proxy-list/raw/refs/heads/main/proxies/countries/KR/data.txt';

/**
 * Scrapes proxies from Proxifly's South Korea-specific proxy list
 * @returns Promise<string[]> Array of South Korean proxies in format "protocol://ip:port"
 */
export async function scrapeProxiflyKoreanProxies(): Promise<string[]> {
  try {
    console.log('Fetching proxies from Proxifly Korea list...');

    // Fetch the proxy list from GitHub
    const response = await fetch(SOURCE_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const proxyData = await response.text();

    // Parse the proxy list (format: protocol://ip:port, one per line)
    const proxyLines = proxyData
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')); // Remove empty lines and comments

    const validKoreanProxies: string[] = [];

    console.log(`Found ${proxyLines.length} total proxies from Proxifly, validating Korean IPs...`);

    // Validate that proxies are actually from South Korea using geolocation
    for (const proxyLine of proxyLines) {
      // Extract IP from protocol://ip:port format
      const match = proxyLine.match(/^(\w+):\/\/([^:]+):(\d+)$/);
      if (match) {
        const [, protocol, ip, port] = match;

        // Double-check that IP is actually South Korean (even though source claims KR)
        if (ip && isSouthKorean(ip)) {
          validKoreanProxies.push(`${protocol}://${ip}:${port}`);
        } else {
          console.warn(`IP ${ip} from KR list is not actually South Korean`);
        }
      }
    }

    console.log(`Found ${validKoreanProxies.length} validated South Korean proxies from Proxifly`);
    return validKoreanProxies;

  } catch (error) {
    console.error('Error scraping Proxifly Korean proxies:', error);
    return [];
  }
}

