import { Hono } from 'hono'
import PQueue from 'p-queue';
import { fetchUsingPlaywright } from './fetch.js';
import { premiumProxy } from './proxies.js';

const app = new Hono()
const queue = new PQueue({
  // Max 20 concurrent requests
  concurrency: 20,

  // Max 60 request per minute
  interval: 1000 * 60,
  intervalCap: 60,
});

app.get('/naver/*', async (c) => {
  const startTime = Date.now();
  const url = c.req.path.replace('/naver/', '');

  if (!url) {
    return c.json({
      success: false,
      message: 'URL is required',
    }, 400);
  }

  const query = new URLSearchParams(c.req.query());
  const urlWithQuery = url + '?' + query.toString();

  try {
    return c.json(await queue.add(async () => {
      console.debug(`Fetching "${urlWithQuery}"...`);

      const json = await fetchUsingPlaywright({ proxy: premiumProxy(), url: urlWithQuery });

      const duration = Date.now() - startTime;
      console.debug(`Fetched "${urlWithQuery}" in ${duration}ms`);

      return json;
    }))
  } catch (error) {
    return c.json({
      success: false,
      message: 'Failed to fetch data',
      error: error instanceof Error ? error.message : String(error),
    }, 500);
  }
})

export default app
