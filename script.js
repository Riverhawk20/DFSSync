const {
  SSL_OP_EPHEMERAL_RSA,
  SSL_OP_SSLEAY_080_CLIENT_DH_BUG,
} = require("constants");
const { stringify } = require("querystring");

async function fun() {
  const waitTime = 5000;
  const jsdom = require("jsdom");
  const { JSDOM } = jsdom;
  const puppeteer = require("puppeteer");
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });

  await page.goto("https://www.lineups.com/nfl-daily-fantasy-dfs-projections");
  await page.waitForSelector(".csv-text");
  //get Fanduel data
  await page.$eval("button.csv-btn", (el) => el.click());
  var content = await page.content();
  var dom = await new JSDOM(content);
  var csvFD = dom.window.document.querySelector(".csv-text").textContent;
  //get defense data
  await page.$eval(
    "body > app-root > div.outlet-container > app-nfl-daily-fantasy-dfs-projections-module > app-nfl-daily-fantasy-dfs-projections > div > div > div:nth-child(4) > div > div.d-flex.top-dd-wrapper-deep > div.toggles-in-page-wrapper.m-0.show-desktop > div > button.toggle-in-page.last",
    (el) => el.click()
  );
  sleep(1000);
  await page.$eval("button.csv-btn", (el) => el.click());
  sleep(1000);
  await page.$eval("button.csv-btn", (el) => el.click());
  content = await page.content();
  dom = await new JSDOM(content);
  var csvFdDef = dom.window.document.querySelector(".csv-text").textContent;

  //click draft kings button
  await page.$eval(
    "body > app-root > div.outlet-container > app-nfl-daily-fantasy-dfs-projections-module > app-nfl-daily-fantasy-dfs-projections > div > div > div:nth-child(4) > div > div.d-flex.top-dd-wrapper-deep > div:nth-child(1) > app-toggles-in-page-group > div > div > button:nth-child(2)",
    (el) => el.click()
  );
  sleep(1000);
  await page.$eval("button.csv-btn", (el) => el.click());
  sleep(1000);
  await page.$eval("button.csv-btn", (el) => el.click());
  content = await page.content();
  dom = await new JSDOM(content);
  var csvDkDef = dom.window.document.querySelector(".csv-text").textContent;

  await page.$eval(
    "body > app-root > div.outlet-container > app-nfl-daily-fantasy-dfs-projections-module > app-nfl-daily-fantasy-dfs-projections > div > div > div:nth-child(4) > div > div > div.toggles-in-page-wrapper.m-0.show-desktop > div > button.toggle-in-page.first",
    (el) => el.click()
  );
  sleep(1000);
  await page.$eval("button.csv-btn", (el) => el.click());
  sleep(1000);
  await page.$eval("button.csv-btn", (el) => el.click());
  content = await page.content();
  dom = await new JSDOM(content);
  var csvDk = dom.window.document.querySelector(".csv-text").textContent;

  var date = new Date();
  var fs = require("fs");
  let writeStream = fs.createWriteStream(
    "/ProjectionCSVFiles/projection_dkall.csv"
  );
  writeStream.write(csvDk.trim());
  writeStream.end();

  let writeStream1 = fs.createWriteStream(
    "/ProjectionCSVFiles/projection_dkdef.csv"
  );
  writeStream1.write(csvDkDef.trim());
  writeStream1.end();

  let writeStream2 = fs.createWriteStream(
    "/ProjectionCSVFiles/projection_fdall.csv"
  );
  writeStream2.write(csvFD.trim());
  writeStream2.end();

  let writeStream3 = fs.createWriteStream(
    "/ProjectionCSVFiles/projection_fddef.csv"
  );
  writeStream3.write(csvFdDef.trim());
  writeStream3.end();

  console.log("spot 1");
  // Load the SDK for JavaScript
  var AWS = require("aws-sdk");
  // Set the Region
  AWS.config.update({ region: "us-east-2" });
  s3 = new AWS.S3({ apiVersion: "2006-03-01" });
  const files = [
    {
      name: "projection_dkall.csv",
      data: fs.createReadStream("/ProjectionCSVFiles/projection_dkall.csv"),
    },
    {
      name: "projection_dkdef.csv",
      data: fs.createReadStream("/ProjectionCSVFiles/projection_dkdef.csv"),
    },
    {
      name: "projection_fdall.csv",
      data: fs.createReadStream("/ProjectionCSVFiles/projection_fdall.csv"),
    },
    {
      name: "projection_fddef.csv",
      data: fs.createReadStream("/ProjectionCSVFiles/projection_fddef.csv"),
    },
  ];
  for (const file of files) {
    const params = {
      Bucket: "hawkdfsprojections",
      Key: file.name,
      Body: file.data,
    };
    try {
      const stored = await s3.upload(params).promise();
      console.log(stored);
    } catch (err) {
      console.log(err);
    }
  }
  console.log("leave loop");
}
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

fun();

/*
 cd C:\Users\caden\Desktop\DFSSync
 node script.js
 */

/*
    var data = [];
  var rows = csv.substring(1).trim().split("\n");
  var headers = rows[0] + ",Own";
  for (var i = 1; i < rows.length; i++) {
    var values = rows[i]
      .trim()
      .replace(new RegExp('"', "g"), "")
      .concat(",placeholder")
      .split(",");
    data[i - 1] = values;
  }
  */

//scrape ownership projections
/*
  await page.goto("https://dfsforecast.com/optimizer/nfl/dk/Main", {
    waitUntil: "networkidle0",
  });
  await page.waitForSelector(
    "#scroll-root > div > div.LineupGenerator-body > div > div:nth-child(2) > div > div.ant-table-wrapper.sc-hMqMXs.dcRQVc > div > div > div > div > div > div > table > tbody"
  );
  let content2 = await page.content();
  let dom2 = await new JSDOM(content2);
  var pages =
    dom2.window.document.querySelector(
      "#scroll-root > div > div.LineupGenerator-body > div > div:nth-child(2) > div > div.ant-table-wrapper.sc-hMqMXs.dcRQVc > div > div > ul"
    ).children.length - 2;
  for (var i = 1; i <= pages; i++) {
    if (i > 0) {
      await page.$eval(
        "#scroll-root > div > div.LineupGenerator-body > div > div:nth-child(2) > div > div.ant-table-wrapper.sc-hMqMXs.dcRQVc > div > div > ul > li.ant-pagination-item.ant-pagination-item-" +
          i,
        (el) => el.click()
      );
      var start = new Date().getTime();
      while (new Date().getTime() - start < 3000) {}
    }
    content2 = await page.content();
    dom2 = await new JSDOM(content2);
    var rows = dom2.window.document.querySelectorAll(
      "#scroll-root > div > div.LineupGenerator-body > div > div:nth-child(2) > div > div.ant-table-wrapper.sc-hMqMXs.dcRQVc > div > div > div > div > div > div > table > tbody >tr"
    );
    rows.forEach((row) => {
      var name = row.children[0].textContent;
      var ownPercentage = row.children[15].textContent;
      var position = row.children[2].textContent;
      var player = data.find((element) => element[0] === name);
      if (player != null) player[player.length - 1] = ownPercentage;
    });
  }
  console.log(data);
  */
