
const https = require('https');
const fs = require('fs');

const apiKey = process.argv[2];
if (!apiKey) {
    console.error("No API key provided");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Fetching models...`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        fs.writeFileSync('models.json', data);
        console.log("Saved to models.json");
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
