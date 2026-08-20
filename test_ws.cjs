const axios = require('axios');
const WebSocket = require('ws');

async function run() {
  const { data } = await axios.get('http://localhost:9222/json/list');
  const pageTarget = data.find(t => t.type === 'page' && t.url.includes('localhost'));
  
  if (!pageTarget) return console.error('No page target found');
  
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  
  let msgId = 1;
  const send = (method, params = {}) => new Promise(resolve => {
    const id = msgId++;
    const listener = (data) => {
      const msg = JSON.parse(data);
      if (msg.id === id) {
        ws.removeListener('message', listener);
        resolve(msg.result);
      }
    };
    ws.on('message', listener);
    ws.send(JSON.stringify({ id, method, params }));
  });

  ws.on('open', async () => {
    console.log('Connected');
    
    // Check text
    const textRes = await send('Runtime.evaluate', {
      expression: 'document.body.innerText',
      returnByValue: true
    });
    console.log('INITIAL SCREEN:', textRes.result.value.replace(/\\n/g, ' ').substring(0, 200));

    // Try clicking the scan button
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('scan') || b.textContent.toLowerCase().includes('analyze'));
          if (btn) btn.click();
          return !!btn;
        })()
      `,
      returnByValue: true
    });
    console.log('Clicked Scan button.');

    // Wait 4 seconds for scan
    await new Promise(r => setTimeout(r, 4000));
    
    const postScanText = await send('Runtime.evaluate', {
      expression: 'document.body.innerText',
      returnByValue: true
    });
    console.log('AFTER SCAN:', postScanText.result.value.replace(/\\n/g, ' ').substring(0, 200));

    // Click "Review Files" or "Clean" if it exists
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.toLowerCase().includes('review') || b.textContent.toLowerCase().includes('clean'));
          if (btn) btn.click();
          return !!btn;
        })()
      `,
      returnByValue: true
    });
    console.log('Clicked Review/Clean button.');

    // Wait 3 seconds
    await new Promise(r => setTimeout(r, 3000));
    
    const postReviewText = await send('Runtime.evaluate', {
      expression: 'document.body.innerText',
      returnByValue: true
    });
    console.log('AFTER REVIEW/CLEAN:', postReviewText.result.value.replace(/\\n/g, ' ').substring(0, 200));

    ws.close();
  });
}

run();
