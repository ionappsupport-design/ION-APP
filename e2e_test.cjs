const puppeteer = require('puppeteer-core');
const axios = require('axios');

async function runE2ETest() {
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
    
    // Wait for the app to load
    await page.waitForSelector('#ion-app', { timeout: 10000 }).catch(() => {});
    console.log("--- APP LOADED ---");
    
    // Helper to print text
    const printText = async (label) => {
      const text = await page.evaluate(() => document.body.innerText);
      console.log(`\n--- ${label} ---`);
      console.log(text.replace(/\n+/g, ' ').substring(0, 500) + '...');
    };

    await printText('INITIAL SCREEN');

    // Wait for the big "Scan Storage" or "Analyze" button
    let scanBtnFound = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const scanBtn = btns.find(b => b.textContent.toLowerCase().includes('scan') || b.textContent.toLowerCase().includes('analyze'));
      if (scanBtn) {
        scanBtn.click();
        return true;
      }
      return false;
    });

    if (scanBtnFound) {
      console.log("Clicked Scan/Analyze button.");
    } else {
      console.log("Could not find Scan button. The app might be in a different state.");
    }

    // Wait 5 seconds for scan to complete
    await new Promise(r => setTimeout(r, 5000));
    await printText('AFTER SCAN');

    // Click "Review Files" or "Clean" if it exists
    let reviewBtnFound = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reviewBtn = btns.find(b => b.textContent.toLowerCase().includes('review') || b.textContent.toLowerCase().includes('clean'));
      if (reviewBtn) {
        reviewBtn.click();
        return true;
      }
      return false;
    });

    if (reviewBtnFound) {
      console.log("Clicked Review/Clean button.");
    } else {
      console.log("Could not find Review/Clean button.");
    }

    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));
    await printText('AFTER REVIEW/CLEAN');

    await browser.disconnect();
    console.log("Test complete.");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runE2ETest();
