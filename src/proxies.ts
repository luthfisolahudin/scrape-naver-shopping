import { scrapeHookzofSocks5Proxies } from './scrape_proxies/hookzof-socks5_list.js';
import { scrapeProxiflyKoreanProxies } from './scrape_proxies/proxifly-free-proxy-list.js';
import { scrapeRoosterkidProxies } from './scrape_proxies/roosterkid-openproxylist.js';
import { scrapeTheSpeedXProxies } from './scrape_proxies/TheSpeedX-PROXY-List.js';

export const premiumProxy = () => ({
    server: `${Bun.env.PROXY_PROTOCOL}://${Bun.env.PROXY_HOST}:${Bun.env.PROXY_PORT}`,
    username: `${Bun.env.PROXY_USERNAME}`,
    password: `${Bun.env.PROXY_PASSWORD}`,
});

export const freePublicProxies = async () => ([
    ...await scrapeHookzofSocks5Proxies(),
    ...await scrapeProxiflyKoreanProxies(),
    ...await scrapeRoosterkidProxies(),
    ...await scrapeTheSpeedXProxies(),
].map(proxy => ({ server: proxy })));
