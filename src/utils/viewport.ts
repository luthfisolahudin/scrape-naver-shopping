export function getRandomDesktopViewport() {
  const desktopViewports = [
    { width: 1920, height: 1080, deviceScaleFactor: 1 },
    { width: 1366, height: 768, deviceScaleFactor: 1 },
    { width: 1600, height: 900, deviceScaleFactor: 1 },
    { width: 1440, height: 900, deviceScaleFactor: 1 },
    { width: 1536, height: 864, deviceScaleFactor: 1 },
    { width: 2560, height: 1440, deviceScaleFactor: 1.25 },
    { width: 2880, height: 1800, deviceScaleFactor: 2 },
    { width: 3000, height: 2000, deviceScaleFactor: 2 },
  ];

  return desktopViewports[Math.floor(Math.random() * desktopViewports.length)]!;
}
