// Source URLs:
// - https://github.com/TheSpeedX/PROXY-List/raw/refs/heads/master/http.txt
// - https://github.com/TheSpeedX/PROXY-List/raw/refs/heads/master/socks4.txt
// - https://github.com/TheSpeedX/PROXY-List/raw/refs/heads/master/socks5.txt
//
// Example format data:
// ```
// 195.130.115.208:33333
// 104.143.226.159:5762
// ```
//
// Notes:
// - Check if its a South Korean proxy
// - If the proxy is South Korean, include it in the final list

import { isSouthKorean } from '../utils/geolocation.js';

const SOURCE_URLS = {
  http: 'https://github.com/TheSpeedX/PROXY-List/raw/refs/heads/master/http.txt',
  socks4: 'https://github.com/TheSpeedX/PROXY-List/raw/refs/heads/master/socks4.txt',
  socks5: 'https://github.com/TheSpeedX/PROXY-List/raw/refs/heads/master/socks5.txt'
};

/**
 * Scrapes proxies from TheSpeedX PROXY-List repository and filters for South Korean proxies
 * @returns Promise<string[]> Array of South Korean proxies in format "protocol://ip:port"
 */
export async function scrapeTheSpeedXProxies(): Promise<string[]> {
  const allKoreanProxies: string[] = [];

  try {
    console.log('Fetching proxies from TheSpeedX PROXY-List...');

    // Process each proxy type
    for (const [protocol, url] of Object.entries(SOURCE_URLS)) {
      try {
        console.log(`Fetching ${protocol.toUpperCase()} proxies from TheSpeedX...`);

        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch ${protocol} proxies: HTTP ${response.status}`);
          continue;
        }

        const proxyData = await response.text();

        // Parse the proxy list (format: ip:port, one per line)
        const proxyLines = proxyData
          .trim()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line &&
                         !line.startsWith('#') &&
                         !line.startsWith('//') &&
                         line.includes(':') // Must contain port separator
          );

        console.log(`Found ${proxyLines.length} ${protocol} proxies, filtering for South Korean IPs...`);

        // Filter for South Korean proxies
        for (const proxyLine of proxyLines) {
          if (proxyLine.includes(':')) {
            const [ip, port] = proxyLine.split(':');

            if (ip && port && isSouthKorean(ip)) {
              allKoreanProxies.push(`${protocol}://${ip}:${port}`);
            }
          }
        }

      } catch (error) {
        console.warn(`Error fetching ${protocol} proxies from TheSpeedX:`, error);
      }
    }

    console.log(`Found ${allKoreanProxies.length} total South Korean proxies from TheSpeedX`);
    return allKoreanProxies;

  } catch (error) {
    console.error('Error scraping TheSpeedX proxies:', error);
    return [];
  }
}
