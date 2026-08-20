const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function runTest() {
  try {
    const { data } = await axios.get('http://localhost:9222/json/list');
    const pageTarget = data.find(target => target.type === 'page' && target.url.includes('localhost'));
    
    if (!pageTarget) {
      console.error("Could not find Capacitor WebView target");
      return;
    }
    
    console.log("Connecting to:", pageTarget.webSocketDebuggerUrl);
    const browser = await puppeteer.connect({
      browserWSEndpoint: pageTarget.webSocketDebuggerUrl,
      defaultViewport: null
    });
    
    const pages = await browser.pages();
    const page = pages[0];
    
    console.log("--- APP CONNECTED ---");
    
    const textContent = await page.evaluate(() => {
      return document.body.innerText;
    });
    console.log("SCREEN TEXT:\n" + textContent);

    await browser.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

runTest();
