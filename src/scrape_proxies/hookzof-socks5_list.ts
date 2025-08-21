// Source URLs:
// - https://github.com/hookzof/socks5_list/raw/refs/heads/master/proxy.txt
//
// Example format data:
// ```
// 138.68.21.132:40467
// ```
//
// Notes:
// - Check if its a South Korean proxy
// - If the proxy is South Korean, include it in the final list

import { isSouthKorean } from '../utils/geolocation.js';

const SOURCE_URL = 'https://github.com/hookzof/socks5_list/raw/refs/heads/master/proxy.txt';

/**
 * Scrapes SOCKS5 proxies from hookzof's GitHub repository and filters for South Korean proxies
 * @returns Promise<string[]> Array of South Korean SOCKS5 proxies in format "socks5://ip:port"
 */
export async function scrapeHookzofSocks5Proxies(): Promise<string[]> {
  try {
    console.log('Fetching SOCKS5 proxies from hookzof repository...');

    // Fetch the proxy list from GitHub
    const response = await fetch(SOURCE_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const proxyData = await response.text();

    // Parse the proxy list (format: ip:port, one per line)
    const proxyLines = proxyData
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')); // Remove empty lines and comments

    const southKoreanProxies: string[] = [];

    console.log(`Found ${proxyLines.length} total proxies, filtering for South Korean IPs...`);

    // Filter for South Korean proxies
    for (const proxyLine of proxyLines) {
      if (proxyLine.includes(':')) {
        const [ip, port] = proxyLine.split(':');

        if (ip && port && isSouthKorean(ip)) {
          southKoreanProxies.push(`socks5://${ip}:${port}`);
        }
      }
    }

    console.log(`Found ${southKoreanProxies.length} South Korean SOCKS5 proxies`);
    return southKoreanProxies;

  } catch (error) {
    console.error('Error scraping hookzof SOCKS5 proxies:', error);
    return [];
  }
}
