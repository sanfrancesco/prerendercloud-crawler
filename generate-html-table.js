function generateHtmlTable(resultsObj) {
  let output = `<style>
body {
    font-family: Arial, sans-serif;
}
.resultTable {
    min-width: 800px;
    border-collapse: collapse;
    border-spacing: 10px;
}
.resultTable th {
  font-weight: normal;
}
.resultTable td, .resultTable th {
    padding: 4px 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    vertical-align: top;
    font-size: 14px;
}
.resultTable tbody tr:last-child td,
.resultTable tbody tr:last-child th {
  border-bottom: none;
}
img {
    max-width: 400px;
    max-height: 200px;
}
td.cell {
  max-width: 900px;
  overflow: hidden;
  text-align:left;
}
</style>`;

  output += `<h1>Crawl Results</h1>`;

  let _redirectsList = "";
  if (resultsObj.redirects && resultsObj.redirects.length) {
    _redirectsList = resultsObj.redirects
      .slice(0, 5)
      .map((r) => `<li>${r.from} -> ${r.to}</li>`)
      .join("\n");
  }
  if (_redirectsList) {
    _redirectsList = `<ul>${_redirectsList}</ul>`;
  }

  let _filesList = "";
  if (resultsObj.files && resultsObj.files.length) {
    _filesList = resultsObj.files
      .slice(0, 5)
      .map((f) => `<li>${f}</li>`)
      .join("\n");
  }
  if (_filesList) {
    _filesList = `<ul>${_filesList}</ul>`;
  }

  output += `<ul>
<li>Total paths crawled: ${resultsObj.links.length}</li>
<li>Total redirects: ${
    Object.keys(resultsObj.redirects).length
  }${_redirectsList}</li>
<li>Total files found: ${resultsObj.files.length}${_filesList}</li>
</ul>`;

  output += '<table class="resultTable">';
  output += `
<thead>
    <tr>
        <th></th>
        <th></th>
    </tr>
</thead>`;

  output += "<tbody>";

  resultsObj.links.forEach((link) => {
    const metadata = resultsObj.metadata[link];
    const parsedUrl = new URL(link);
    const screenshotPath = resultsObj.screenshots[link];

    output += "<tr class='page-row'>";
    if (screenshotPath) {
      output += `<td><img src="${screenshotPath}" alt="${parsedUrl.host}${parsedUrl.pathname}"></td>`;
    } else {
      output += `<td></td>`;
    }
    output += `<td><table>
      <tr><th>host</th><td class='cell'>${parsedUrl.host}</td></tr>
      <tr><th>path</th><td class='cell'><strong>${
        parsedUrl.pathname
      }</strong></td></tr>
      <tr><th>document.title</th><td class='cell'>${
        metadata && metadata.title ? metadata.title : ""
      }</td></tr>
      <tr><th>document.querySelector('h1')</th><td class='cell'>${
        metadata && metadata.h1 ? metadata.h1 : ""
      }</td></tr>
      <tr><th>meta[property='og:title']</th><td class='cell'>${
        metadata && metadata.ogTitle ? metadata.ogTitle : ""
      }</td></tr>
      <tr><th>meta[property='og:type']</th><td class='cell'>${
        metadata && metadata.ogType ? metadata.ogType : ""
      }</td></tr>
      <tr><th>meta[name='description']</th><td class='cell'>${
        metadata && metadata.description ? metadata.description : ""
      }</td></tr>
      <tr><th>meta[property='og:description']</th><td class='cell'>${
        metadata && metadata.ogDescription ? metadata.ogDescription : ""
      }</td></tr>
      <tr><th>meta[property='og:image']</th><td class='cell'>${
        metadata && metadata.ogImage ? metadata.ogImage : ""
      }</td></tr>

      
    </table></td>`;

    output += "</tr>";
  });

  output += "</tbody></table>";

  return output;
}

module.exports = generateHtmlTable;
