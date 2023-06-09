const prerendercloud = require(process.env.OVERRIDE_PRERENDERCLOUD ||
  "prerendercloud");
const fs = require("fs");
const path = require("path");

const generateHtmlTable = require("./generate-html-table");

const outputDir = path.join(__dirname, "output");
const screenshotsDir = path.join(outputDir, "screenshots");
fs.mkdirSync(screenshotsDir, { recursive: true });

function isValidHostname(hostname) {
  let regex =
    /^(?:(?:[A-Za-z0-9][A-Za-z0-9\-]{0,61}[A-Za-z0-9])|(?:[A-Za-z0-9]+))\.[A-Za-z0-9]{2,}$/;
  return regex.test(hostname);
}

const hostToScrape = process.env.HOST_TO_SCRAPE;
if (!hostToScrape)
  throw new Error(
    "HOST_TO_SCRAPE env var is required, e.g. 'headless-render-api.com'"
  );

if (!isValidHostname(hostToScrape))
  throw new Error(`Invalid hostname: ${hostToScrape}`);

const urlToScrape = `https://${hostToScrape}`;

const visitedUrls = new Set();
const skippedUrls = new Set();
const allRelativeLinks = new Set();
const urlMetadata = new Map();
const screenshots = new Map();
const redirectsFromTo = new Map();
const foundFiles = new Set();
const queue = [urlToScrape];
const MAX_CONCURRENCY = 3;

// modify this function to control which urls are scraped
function isValidUrlForScraping(parsedUrl) {
  const isHttp = parsedUrl.protocol && parsedUrl.protocol.startsWith("http");
  if (!isHttp) return false;

  const isRelative =
    !parsedUrl.host ||
    parsedUrl.host === hostToScrape ||
    (!hostToScrape.startsWith("www") &&
      parsedUrl.host === `www.${hostToScrape}`);
  if (!isRelative) return false;

  // avoid scraping things like .json, .pdf, etc.
  // TODO: consider modifying to allow files with .html extension
  const isFile = parsedUrl.pathname.split("/").pop().includes(".");
  if (isFile) {
    foundFiles.add(parsedUrl.href);
    return false;
  }

  return true;
}

function parseUrl(url) {
  url = url.split("#")[0];

  let parsedRedirectedToUrl;
  try {
    parsedRedirectedToUrl = !url.startsWith("http")
      ? new URL(url, urlToScrape)
      : new URL(url);
  } catch (err) {
    console.log(err, { url, hostToScrape });
    parsedRedirectedToUrl = new URL(url, urlToScrape);
  }

  return parsedRedirectedToUrl;
}

async function recursiveScrape(currentUrl) {
  const { body, meta, links, statusCode, headers, screenshot } =
    await prerendercloud.scrape(currentUrl, {
      withMetadata: true,
      withScreenshot: true,
      waitExtraLong: true,
    });

  if (statusCode === 301 || statusCode === 302) {
    const parsedRedirectedToUrl = parseUrl(headers.location);

    if (visitedUrls.has(parsedRedirectedToUrl.href)) return;

    redirectsFromTo.set(currentUrl, parsedRedirectedToUrl.href);
    queue.push(parsedRedirectedToUrl.href);
    return;
  }

  urlMetadata.set(currentUrl, meta);

  (links || []).forEach((link) => {
    const parsedLink = parseUrl(link);

    if (!isValidUrlForScraping(parsedLink)) {
      if (!skippedUrls.has(parsedLink.href)) {
        console.log(" // skipping", parsedLink.href);
      }
      skippedUrls.add(parsedLink.href);

      return;
    }

    if (visitedUrls.has(parsedLink.href)) return;

    console.log("scraping", parsedLink.href);

    visitedUrls.add(parsedLink.href);
    queue.push(parsedLink.href);
    allRelativeLinks.add(parsedLink.href);
  });

  if (screenshot) {
    const urlPath = new URL(currentUrl).pathname;
    const screenshotPath = path.join(
      screenshotsDir,
      `${urlPath.replace(/[^a-zA-Z0-9]/g, "_")}.png`
    );
    fs.writeFileSync(screenshotPath, screenshot);
    screenshots.set(currentUrl, screenshotPath);
  }
}

// entrypoint (main function)
(async () => {
  while (queue.length > 0) {
    const tasks = [];
    for (let i = 0; i < MAX_CONCURRENCY && queue.length > 0; i++) {
      const currentUrl = queue.shift();
      tasks.push(recursiveScrape(currentUrl));
    }
    await Promise.all(tasks);
  }

  const resultsObj = {
    metadata: Object.fromEntries(urlMetadata),
    links: [...allRelativeLinks],
    redirects: Object.fromEntries(redirectsFromTo),
    files: [...foundFiles],
    screenshots: Object.fromEntries(screenshots),
  };

  const outputPathCrawlResults = path.join(outputDir, "crawl-results.json");
  fs.writeFileSync(outputPathCrawlResults, JSON.stringify(resultsObj));
  console.log("Successfully wrote full results to " + outputPathCrawlResults);

  const html = generateHtmlTable(resultsObj);
  const outputPathHtml = path.join(outputDir, "crawl-results.html");
  fs.writeFileSync(outputPathHtml, html);
  console.log("Successfully created HTML report at " + outputPathHtml);

  // uncomment these to see the results in the console
  // console.log("Redirects", Object.fromEntries(redirectsFromTo));
  // console.log("Files", [...foundFiles]);
  // console.log("Links", [...allRelativeLinks]);
  // console.log("Metadata", Object.fromEntries(urlMetadata));
})();
