
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: "No image provided" },
                { status: 400 }
            );
        }

        // Prepare image part for Gemini
        // Expecting base64 string like "data:image/jpeg;base64,..."
        const base64Data = image.split(",")[1];
        const mimeType = image.split(",")[0].split(":")[1].split(";")[0];

        const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

        const prompt = `
      Analyze this image of an item to be sold. 
      Identify the following details and return them in pure JSON format:
      {
        "name": "Short descriptive title",
        "brand": "Brand name or 'Unknown'",
        "category": "Category (e.g. Clothing, Electronics)",
        "size": "Size if applicable (or 'N/A')",
        "condition": "Estimated condition (e.g. Good, New)",
        "estimated_price": number (conservative estimate in USD)
      }
      Do not include markdown formatting (like \`\`\`json). Just return the raw JSON string.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks if the model ignores the instruction
        const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(jsonString);

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Analyze Item Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to analyze item" },
            { status: 500 }
        );
    }
}
