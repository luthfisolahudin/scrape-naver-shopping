import playwright from 'playwright-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import EvadeLanguage from 'puppeteer-extra-plugin-stealth/evasions/navigator.languages'
import { getRandomDesktopViewport } from './utils/viewport.js';

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
            // 'navigator.languages', // disabled to use korean lang
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

interface FetchSearchOptions {
    proxy: Proxy;
    url: string;
}

export async function fetchUsingPlaywright({ proxy, url }: FetchSearchOptions) {
    const viewport = getRandomDesktopViewport();
    const context = await browser.newContext({
        viewport,
        deviceScaleFactor: viewport.deviceScaleFactor,
        timezoneId: 'Asia/Seoul',
        locale: 'ko-KR',
        proxy,
    });

    const page = await context.newPage();

    const response = await page.goto(url, { waitUntil: 'load', timeout: 5 * 1000 });
    const json = await response?.json();

    await context.close();

    return json;
}
