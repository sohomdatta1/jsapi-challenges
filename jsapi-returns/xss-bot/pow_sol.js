const net = require('net');
const crypto = require('crypto');

// Configuration
const HOST = 'localhost';
const PORT = process.argv[3];

// Get URL from command line argument
const URL_TO_VISIT = process.argv[2];
if (!URL_TO_VISIT) {
    console.error('Please provide a URL as an argument');
    console.error('Usage: node solve_pow.js <url>');
    process.exit(1);
}

function solveProofOfWork(challenge, difficulty) {
    let nonce = 0;
    while (true) {
        const hash = crypto.createHash('sha256')
            .update(challenge + nonce.toString())
            .digest('hex');
        if (hash.startsWith('0'.repeat(difficulty))) {
            console.log(`Found solution: ${nonce}`);
            return nonce.toString();
        }
        nonce++;
        if (nonce % 100000 === 0) {
            console.log(`Tried ${nonce} solutions...`);
        }
    }
}

const client = new net.Socket();

console.log(`Attempting to visit: ${URL_TO_VISIT}`);

client.connect(PORT, HOST, () => {
    console.log('Connected to bot server');
});

client.on('data', (data) => {
    const response = data.toString();
    console.log('Received:', response);

    if (response.includes('Challenge:')) {
        const challenge = response.match(/Challenge: ([a-f0-9]+)/)[1];
        const difficulty = parseInt(response.match(/Difficulty: (\d+)/)[1]);
        
        console.log(`Starting to solve PoW with difficulty ${difficulty}...`);
        const solution = solveProofOfWork(challenge, difficulty);
        console.log('Sending solution:', solution);
        client.write(solution + '\n');
    }
    
    if (response.includes('verified')) {
        console.log('PoW verified, sending URL...');
        client.write(URL_TO_VISIT + '\n');
    }

    if (response.includes('Invalid URL') || response.includes('Error')) {
        console.log(response.text)
        client.end();
    }

    if (response.includes('admin visited')) {
        console.log('Success! Admin visited the URL');
        client.end();
    }
});

client.on('close', () => {
    console.log('Connection closed');
});

client.on('error', (err) => {
    console.error('Connection error:', err);
});
