const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = 'file:///c:/MY PROJECTS/Adzio/services.html';

console.log("Launching Microsoft Edge headlessly...");
const edgeProcess = spawn(edgePath, [
    '--headless',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9222',
    targetUrl
]);

edgeProcess.on('error', (err) => {
    console.error("Failed to start Edge process:", err);
});

// Wait for Edge to startup and open port 9222
setTimeout(() => {
    http.get('http://localhost:9222/json/list', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const targets = JSON.parse(data);
                const pageTarget = targets.find(t => t.type === 'page');
                if (!pageTarget) {
                    console.error("No active page target found in Edge.");
                    edgeProcess.kill();
                    return;
                }
                
                console.log("Connecting to WebSocket debugger URL:", pageTarget.webSocketDebuggerUrl);
                const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
                
                const logs = [];
                const errors = [];
                
                ws.on('open', () => {
                    // Enable Runtime and Console APIs to capture logs and exceptions
                    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
                    ws.send(JSON.stringify({ id: 2, method: 'Console.enable' }));
                    ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
                    console.log("Listening for browser console logs and exceptions...");
                });
                
                ws.on('message', (message) => {
                    const msg = JSON.parse(message);
                    
                    if (msg.method === 'Runtime.consoleAPICalled') {
                        const args = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
                        const logLine = `[Console ${msg.params.type}] ${args}`;
                        console.log(logLine);
                        logs.push(logLine);
                    }
                    
                    if (msg.method === 'Runtime.exceptionThrown') {
                        const exc = msg.params.exceptionDetails.exception;
                        const errorLine = `[Exception] ${msg.params.exceptionDetails.text} ${exc.className}: ${exc.description}`;
                        console.error(errorLine);
                        errors.push(errorLine);
                    }
                });
                
                // Allow the page to run for 4 seconds
                setTimeout(() => {
                    console.log("\n--- Debugging Summary ---");
                    console.log(`Captured ${logs.length} console log messages.`);
                    console.log(`Captured ${errors.length} runtime exceptions.`);
                    
                    ws.close();
                    edgeProcess.kill();
                    process.exit(errors.length > 0 ? 1 : 0);
                }, 4000);
                
            } catch (e) {
                console.error("Failed to parse targets JSON:", e);
                edgeProcess.kill();
            }
        });
    }).on('error', (err) => {
        console.error("Failed to query Edge remote debugging list:", err);
        edgeProcess.kill();
    });
}, 2000);
