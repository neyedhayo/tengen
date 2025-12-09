// Test Qubic RPC connection
require('dotenv').config();
const https = require('https');

async function testRpcConnection() {
    console.log('🔌 Testing Qubic RPC Connection...\n');

    const rpcUrl = process.env.QUBIC_RPC_URL || 'https://testnet-rpc.qubicdev.com/';
    console.log(`RPC URL: ${rpcUrl}`);

    try {
        // Test /v1/status endpoint
        const statusUrl = rpcUrl.replace(/\/$/, '') + '/v1/status';
        console.log(`Testing: ${statusUrl}\n`);

        const response = await new Promise((resolve, reject) => {
            https.get(statusUrl, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode === 200) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            }).on('error', reject);
        });

        console.log('📊 Network Status:');
        console.log(`  Last Processed Tick: ${response.lastProcessedTick.tickNumber}`);
        console.log(`  Current Epoch: ${response.lastProcessedTick.epoch}`);

        if (response.emptyTicksPerEpoch) {
            const epoch = response.lastProcessedTick.epoch;
            console.log(`  Empty Ticks (Epoch ${epoch}): ${response.emptyTicksPerEpoch[epoch] || 0}`);
        }

        console.log('\n✅ RPC connection test successful!');
        console.log('✅ Qubic testnet is reachable and responsive');
        return true;
    } catch (error) {
        console.error('❌ RPC connection test failed:');
        console.error(error.message);
        return false;
    }
}

// Run the test
testRpcConnection()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
