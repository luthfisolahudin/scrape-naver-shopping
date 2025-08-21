import { Hono } from 'hono'
import Queue from 'p-queue';
import retry from 'p-retry';
import { fetchUsingPlaywright } from './fetch.js';
import { premiumProxy } from './proxies.js';
import { isHostAllowed } from './utils/ensure-allowed-host.js';

const app = new Hono()
const queue = new Queue({
  // Max 200 concurrent requests just so the machine doesn't die
  concurrency: 200,
});

function onFailedAttempt(error: Error, attemptNumber: number) {
  console.warn(`Fetch failed. Maybe the proxy is down? Error: ${error.message}`);
}

app.get('/naver/*', async (c) => {
  const startTime = Date.now();
  const url = c.req.path.replace('/naver/', '');

  if (!url) {
    return c.json({
      success: false,
      message: 'URL is required',
    }, 400);
  }

  if (!isHostAllowed(url)) {
    return c.json({
      success: false,
      message: 'Blocked request. Trying to request to disallowed host.',
    }, 403);
  }

  const query = new URLSearchParams(c.req.query());
  const urlWithQuery = url + '?' + query.toString();

  try {
    return c.json(await queue.add(async () => {
      console.debug(`Fetching "${urlWithQuery}"...`);

      const json = await retry(() => (
        fetchUsingPlaywright({ proxy: premiumProxy(), url: urlWithQuery })
      ), {
        retries: 3,
        minTimeout: 150,
        maxTimeout: 1000,
        randomize: true,
        onFailedAttempt: (error) => onFailedAttempt(error, error.attemptNumber)
      });

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
