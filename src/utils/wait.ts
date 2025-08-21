import { randomInt } from 'node:crypto';

export async function randomWait(minSecond = .5, maxSecond = 1) {
    const random = randomInt(1000 * minSecond, 1000 * maxSecond);

    console.debug(`Waiting ${random}ms`);

    await new Promise(resolve => setTimeout(resolve, random));
}
