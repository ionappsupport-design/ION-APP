const CDP = require('chrome-remote-interface');
const axios = require('axios');

async function runTest() {
    let client;
    try {
        const { data } = await axios.get('http://localhost:9222/json/list');
        const pageTarget = data.find(target => target.type === 'page' && target.url.includes('localhost'));
        
        if (!pageTarget) {
            console.error("Could not find Capacitor WebView target");
            return;
        }

        client = await CDP({ target: pageTarget.webSocketDebuggerUrl });
        const { Runtime, DOM } = client;
        await Promise.all([Runtime.enable(), DOM.enable()]);

        const result = await Runtime.evaluate({
            expression: 'Array.from(document.querySelectorAll("button, a, div")).filter(el => el.innerText && el.innerText.trim() !== "").map(el => el.innerText.trim())'
        });
        
        console.log("--- UI Elements ---");
        if (result.result.value) {
            console.log([...new Set(result.result.value)].join('\n'));
        } else if (result.result.objectId) {
            const properties = await Runtime.getProperties({
                objectId: result.result.objectId,
                ownProperties: true
            });
            console.log(properties.result.filter(p => p.value && p.name !== 'length').map(p => p.value.value).join('\n'));
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

runTest();
