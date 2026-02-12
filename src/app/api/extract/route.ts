import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
    try {
        const { imagePath } = await request.json();

        if (!imagePath) {
            return NextResponse.json({ error: 'Image path is required' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Get the image from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('receipt-images')
            .download(imagePath);

        if (downloadError || !fileData) {
            console.error('Download error:', downloadError);
            return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');

        // 2. Call Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            Analyze this watch service receipt. 
            Extract the following information in JSON format:
            {
               "serviceDate": "DD/MM/YYYY", (Extract the date in this specific format. Ignore the time.)
               "items": [
                 {
                   "watchModel": "string", (The model of the watch, e.g., Seiko SNK809)
                   "batteryModelNo": "string", (The battery model or brand code related to the battery changed, e.g., SR920SW)
                   "price": "string" (The price if available, e.g., 15.00)
                 }
               ]
            }
            Return ONLY the valid JSON. If you cannot find a piece of information, return null for that field.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: fileData.type,
                },
            },
        ]);

        const responseText = result.response.text();
        // Clean up markdown if Gemini wraps it
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;

        const extracted = JSON.parse(jsonStr);

        return NextResponse.json(extracted);
    } catch (error) {
        console.error('Extraction error:', error);
        return NextResponse.json({ error: 'Failed to extract data' }, { status: 500 });
    }
}
