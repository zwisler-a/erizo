const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const path = require('path');

// Get LAN IP
const interfaces = os.networkInterfaces();
const ip = Object.values(interfaces)
  .flat()
  .find((i) => i.family === 'IPv4' && !i.internal)?.address;

if (!ip) throw new Error('Unable to detect LAN IP.');

const keyPath = path.resolve(__dirname, '../certs/dev.key');
const certPath = path.resolve(__dirname, '../certs/dev.crt');

// Create certs folder
fs.mkdirSync(path.resolve(__dirname, '../certs'), { recursive: true });

// Generate cert
execSync(`
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ${keyPath} -out ${certPath} \
  -subj "/C=US/ST=State/L=City/O=Org/CN=${ip}" \
  -addext "subjectAltName=IP:${ip}"
`);

// Create `.env`
fs.writeFileSync(path.resolve(__dirname, '../.env'), `DEV_HOST=${ip}`);
console.log(`✔ Dev cert created for IP: ${ip}`);
