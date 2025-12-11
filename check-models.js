
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.argv[2];

if (!apiKey) {
    console.error("Please provide API Key as argument");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function checkModels() {
    console.log("Checking models...");

    // List of models to try
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

    for (const modelName of models) {
        process.stdout.write(`Testing: ${modelName} ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ OK`);
        } catch (error) {
            console.log(`❌ FAILED`);
            console.log(`   Reason: ${error.message.split('\n')[0]}`);
        }
    }
}

checkModels();
