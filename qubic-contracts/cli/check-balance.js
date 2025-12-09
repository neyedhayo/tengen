// Check Qubic wallet balance
require('dotenv').config();
const https = require('https');

async function checkBalance() {
    console.log('💰 Checking Qubic Wallet Balance...\n');

    // Get identity from command line argument or env
    let identity = process.argv[2];

    if (!identity) {
        console.error('❌ Error: Please provide your Qubic identity (address)');
        console.error('');
        console.error('Usage:');
        console.error('  node cli/check-balance.js YOUR_QUBIC_IDENTITY');
        console.error('');
        console.error('Your identity is a 55-character uppercase address (A-Z)');
        console.error('You can find it in your Qubic wallet');
        return false;
    }

    identity = identity.toUpperCase();

    if (!/^[A-Z]+$/.test(identity)) {
        console.error('❌ Error: Invalid Qubic identity format');
        console.error('   Identity must contain only uppercase letters (A-Z)');
        return false;
    }

    if (identity.length < 50 || identity.length > 65) {
        console.error('❌ Error: Invalid Qubic identity length');
        console.error(`   Expected 55-60 characters, got ${identity.length}`);
        return false;
    }

    const rpcUrl = (process.env.QUBIC_RPC_URL || 'https://testnet-rpc.qubicdev.com/').replace(/\/$/, '');

    try {
        console.log('🔑 Wallet Identity:');
        console.log(`   ${identity}\n`);

        // Fetch balance from RPC
        const balanceUrl = `${rpcUrl}/v1/balances/${identity}`;

        const response = await new Promise((resolve, reject) => {
            https.get(balanceUrl, (res) => {
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

        // Parse nested balance structure
        const balanceData = response.balance || {};
        const balance = parseInt(balanceData.balance || '0');
        const balanceQubic = balance / 1e9; // Convert from units to QUBIC

        console.log('💵 Balance:');
        console.log(`   ${balanceQubic.toFixed(9)} QUBIC`);
        console.log(`   (${balance} units)\n`);

        if (balance === 0) {
            console.log('⚠️  Zero balance detected!');
            console.log('');
            console.log('📝 To get testnet tokens:');
            console.log('   1. Visit: https://qforge.qubicdev.com/');
            console.log('   2. Enter your identity: ' + identity);
            console.log('   3. Request testnet QUBIC tokens');
            console.log('');
            return false;
        } else {
            console.log('✅ Wallet has funds and is ready for deployment!');
            return true;
        }

    } catch (error) {
        console.error('❌ Balance check failed:');
        console.error('   ' + error.message);
        return false;
    }
}

// Run the check
checkBalance()
    .then(success => process.exit(success ? 0 : 1))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
