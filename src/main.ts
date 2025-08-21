import playwright from 'playwright-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { randomInt } from 'node:crypto';
import EvadeLanguage from 'puppeteer-extra-plugin-stealth/evasions/navigator.languages'
import { getRandomDesktopViewport } from './utils/viewport.js';
import { scrapeHookzofSocks5Proxies } from './scrape_proxies/hookzof-socks5_list.js';
import { scrapeProxiflyKoreanProxies } from './scrape_proxies/proxifly-free-proxy-list.js';
import { scrapeRoosterkidProxies } from './scrape_proxies/roosterkid-openproxylist.js';
import { scrapeTheSpeedXProxies } from './scrape_proxies/TheSpeedX-PROXY-List.js';
import { writeFile } from 'node:fs';

const firefox = playwright
    .addExtra(playwright.firefox)
    .use(StealthPlugin({
        enabledEvasions: new Set([
            'chrome.app',
            'chrome.csi',
            'chrome.loadTimes',
            'chrome.runtime',
            'defaultArgs',
            'iframe.contentWindow',
            'media.codecs',
            'navigator.hardwareConcurrency',
            // 'navigator.languages', // disable to use korean lang
            'navigator.permissions',
            'navigator.plugins',
            'navigator.webdriver',
            'sourceurl',
            'user-agent-override',
            'webgl.vendor',
            'window.outerdimensions'
        ])
    }))
    .use(EvadeLanguage({ languages: ['ko-KR'] }))

const browser = await firefox.launch({
    headless: true,
});

interface Proxy {
    server: string;
    username?: string;
    password?: string;
}

interface TestProxyOptions {
    proxy: Proxy;
    query: string;
    pageSize?: number;
    pageNumber?: number;
}

async function fetchSearch({ proxy, query, pageSize = 50, pageNumber = 1 }: TestProxyOptions) {
    const viewport = getRandomDesktopViewport();
    const context = await browser.newContext({
        viewport,
        deviceScaleFactor: viewport.deviceScaleFactor,
        timezoneId: 'Asia/Seoul',
        locale: 'ko-KR',
        proxy,
    });

    const page = await context.newPage();

    const cursor = (pageNumber - 1) * pageSize + 1;

    const response = await page.goto(`https://search.shopping.naver.com/ns/v1/search/paged-composite-cards?cursor=${cursor}&pageSize=${pageSize}&query=${query}&searchMethod=all.basic&isFreshCategory=false&isOriginalQuerySearch=false&isCatalogDiversifyOff=false&listPage=${pageNumber}&hiddenNonProductCard=true&hasMoreAd=false`, { waitUntil: 'load', timeout: 5 * 1000 });
    const json = response?.json();

    await context.close();

    return json;
}

async function randomWait(start = .5, end = 1) {
    const random = randomInt(1000 * start, 1000 * end);
    console.debug(`Waiting ${random}ms`);

    await new Promise(resolve => setTimeout(resolve, random));
}

const query = 'iphone';

const premiumProxies = [{
    server: 'http://***REMOVED***:***REMOVED***',
    username: '***REMOVED***',
    password: '***REMOVED***'
}];

const freePublicProxies = async () => ([
    ...await scrapeHookzofSocks5Proxies(),
    ...await scrapeProxiflyKoreanProxies(),
    ...await scrapeRoosterkidProxies(),
    ...await scrapeTheSpeedXProxies(),
].map(proxy => ({ server: proxy })));

const fetchedJson = [];

while (true) {
    let pageNumber = 1;

    for (const proxy of premiumProxies) {
        console.debug(`Fetching page ${pageNumber}`);

        const json = await fetchSearch({ proxy, query, pageNumber })
            .catch((error) => {
                console.error({error})

                return null
            });

        if (json) {
            console.log(`✅ ${proxy.server} is working`);

            fetchedJson.push(json);
        } else {
            console.error(`❌ ${proxy.server} is not working`);
        }

        pageNumber = pageNumber + 1;

        await randomWait(.5, 2);
    }

    if (pageNumber >= 2) {
        break;
    }
}

writeFile('data.json', JSON.stringify(fetchedJson, null, 2), (err) => {
    if (err) {
        console.error('Error writing file:', err);
    } else {
        console.log('Data written to data.json');
    }
});
