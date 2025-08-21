// Source URLs:
// - https://github.com/roosterkid/openproxylist/raw/refs/heads/main/HTTPS.txt
// - https://github.com/roosterkid/openproxylist/raw/refs/heads/main/SOCKS4.txt
// - https://github.com/roosterkid/openproxylist/raw/refs/heads/main/SOCKS5.txt
//
// Example format data:
// ```
// SOCKS4 Proxy list updated at 2025-08-20 20:00:01 GMT+7
// Website=https://openproxylist.com
//
// Support us:
// BTC : ...
// ETH : ...
// LTC : ...
// Doge: ...
// https://buymeacoffee.com/...
//
// Fromat: CountryFlag IP:PORT ResponseTime CountryCode [ISP]
//
// 🇧🇩 203.188.245.98:52837 791ms BD [...]
// 🇰🇷 8.213.129.15:8080 792ms KR [...]
// ```
//
// Notes:
// Filter and only get South Korean proxies

import { isSouthKorean } from '../utils/geolocation.js';

const SOURCE_URLS = {
  https: 'https://github.com/roosterkid/openproxylist/raw/refs/heads/main/HTTPS.txt',
  socks4: 'https://github.com/roosterkid/openproxylist/raw/refs/heads/main/SOCKS4.txt',
  socks5: 'https://github.com/roosterkid/openproxylist/raw/refs/heads/main/SOCKS5.txt'
};

/**
 * Scrapes proxies from Roosterkid's OpenProxyList repository and filters for South Korean proxies
 * @returns Promise<string[]> Array of South Korean proxies in format "protocol://ip:port"
 */
export async function scrapeRoosterkidProxies(): Promise<string[]> {
  const allKoreanProxies: string[] = [];

  try {
    console.log('Fetching proxies from Roosterkid OpenProxyList...');

    // Process each proxy type
    for (const [protocol, url] of Object.entries(SOURCE_URLS)) {
      try {
        console.log(`Fetching ${protocol.toUpperCase()} proxies...`);

        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Failed to fetch ${protocol} proxies: HTTP ${response.status}`);
          continue;
        }

        const proxyData = await response.text();

        // Parse the proxy list (format: CountryFlag IP:PORT ResponseTime CountryCode [ISP])
        const proxyLines = proxyData
          .trim()
          .split('\n')
          .map(line => line.trim())
          .filter(line => line &&
                         !line.startsWith('#') &&
                         !line.startsWith('//') &&
                         !line.includes('updated at') &&
                         !line.includes('Website=') &&
                         !line.includes('Support us') &&
                         !line.includes('BTC') &&
                         !line.includes('ETH') &&
                         !line.includes('LTC') &&
                         !line.includes('Doge') &&
                         !line.includes('buymeacoffee') &&
                         !line.includes('Format:') &&
                         line.includes(':') // Must contain port separator
          );

        console.log(`Found ${proxyLines.length} ${protocol} proxy entries, filtering for South Korea...`);

        for (const line of proxyLines) {
          // Match format: 🇰🇷 IP:PORT ResponseTime KR [ISP]
          // Look for KR country code
          const koreanMatch = line.match(/🇰🇷\s+([^:]+):(\d+)\s+\d+ms\s+KR\s+\[.*\]/);
          if (koreanMatch) {
            const [, ip, port] = koreanMatch;

            // Double-check with geolocation
            if (ip && isSouthKorean(ip)) {
              const protocolPrefix = protocol === 'https' ? 'http' : protocol;
              allKoreanProxies.push(`${protocolPrefix}://${ip}:${port}`);
            }
            continue;
          }

          // Alternative parsing: look for any line with KR country code
          const generalMatch = line.match(/([^:]+):(\d+)\s+\d+ms\s+KR\s+/);
          if (generalMatch) {
            const [, ip, port] = generalMatch;

            // Verify with geolocation
            if (ip && isSouthKorean(ip)) {
              const protocolPrefix = protocol === 'https' ? 'http' : protocol;
              allKoreanProxies.push(`${protocolPrefix}://${ip}:${port}`);
            }
          }
        }

      } catch (error) {
        console.warn(`Error fetching ${protocol} proxies from Roosterkid:`, error);
      }
    }

    console.log(`Found ${allKoreanProxies.length} total South Korean proxies from Roosterkid`);
    return allKoreanProxies;

  } catch (error) {
    console.error('Error scraping Roosterkid proxies:', error);
    return [];
  }
}
