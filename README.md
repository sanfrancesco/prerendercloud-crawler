# prerendercloud-crawler

<img align="right" src="https://cloud.githubusercontent.com/assets/22159102/21554484/9d542f5a-cdc4-11e6-8c4c-7730a9e9e2d1.png">

Example code for crawling a JavaScript single-page app using [Headless-Render-API](https://headless-render-api.com/)'s scrape endpoint.

Generates the following files:

- output/crawl-results.html with an HTML table of screenshots and meta tags per page
- output/crawl-results.json for the full data
- output/screenshots/\*.png for each page screenshot

To use, clone and run `npm start`

```bash
git clone git@github.com:sanfrancesco/prerendercloud-crawler.git
cd prerendercloud-crawler
npm install
PRERENDER_TOKEN="" HOST_TO_SCRAPE=example.com npm start
```

Example console output if ran for headless-render-api.com will look something like:

```
$ PRERENDER_TOKEN="secretToken" HOST_TO_SCRAPE=headless-render-api.com npm start

scraping https://headless-render-api.com/
scraping https://headless-render-api.com/pricing
scraping https://headless-render-api.com/docs
scraping https://headless-render-api.com/support
scraping https://headless-render-api.com/blog
scraping https://headless-render-api.com/users/sign-in
scraping https://headless-render-api.com/docs/api/prerender
scraping https://headless-render-api.com/docs/api/examples
scraping https://headless-render-api.com/docs/api/usage
 // skipping https://hub.docker.com/r/prerendercloud/webserver
scraping https://headless-render-api.com/users/sign-up
scraping https://headless-render-api.com/docs/api/screenshot-examples
scraping https://headless-render-api.com/docs/api/screenshot
```

Example output/crawl-results.html:

<img width="991" alt="image" src="https://github.com/sanfrancesco/prerendercloud-crawler/assets/16573/98f2953b-fce2-491f-ac6b-ad1b4c30f340">
