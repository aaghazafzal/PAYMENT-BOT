import localtunnel from 'localtunnel';
import axios from 'axios';

const subdomain = 'univorapayment';
const port = 9090;
const targetUrl = `https://${subdomain}.loca.lt`;

console.log(`🚀 Initializing Native Localtunnel Manager for ${targetUrl} (Port ${port})...`);

let tunnelInstance = null;

async function startTunnel() {
  try {
    if (tunnelInstance) {
      try { tunnelInstance.close(); } catch (e) {}
    }
    
    tunnelInstance = await localtunnel({ port, subdomain });
    console.log(`✅ Localtunnel Active: ${tunnelInstance.url}`);

    tunnelInstance.on('close', () => {
      console.warn('⚠️ Localtunnel closed. Reconnecting in 3s...');
      setTimeout(startTunnel, 3000);
    });
    
    tunnelInstance.on('error', (err) => {
      console.error('❌ Localtunnel Error:', err);
    });
  } catch (err) {
    console.error('❌ Failed to start localtunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

// Keep-alive ping every 12 seconds
setInterval(async () => {
  try {
    const res = await axios.get(`${targetUrl}/health`, { timeout: 4000 });
    console.log(`[KeepAlive Ping] ${new Date().toLocaleTimeString()} => HTTP ${res.status} OK`);
  } catch (err) {
    console.warn(`[KeepAlive Ping] ${new Date().toLocaleTimeString()} => ${err.message}`);
  }
}, 12000);

startTunnel();
