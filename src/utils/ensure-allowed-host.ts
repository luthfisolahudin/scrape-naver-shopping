const allowedHosts = ['search.shopping.naver.com'];

export function isHostAllowed(url: string) {
    const { hostname } = new URL(url);

    return allowedHosts.includes(hostname);
}
