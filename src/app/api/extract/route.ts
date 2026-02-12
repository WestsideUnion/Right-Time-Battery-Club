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

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('SERVER ERROR: GEMINI_API_KEY is missing in environment variables');
            return NextResponse.json({ error: 'AI configuration error — check API Key' }, { status: 500 });
        }

        const supabase = await createClient();

        // 1. Get the image from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('receipt-images')
            .download(imagePath);

        if (downloadError || !fileData) {
            console.error('Download error:', downloadError);
            return NextResponse.json({ error: 'Failed to download image from storage' }, { status: 500 });
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const base64Image = Buffer.from(arrayBuffer).toString('base64');

        // 2. Call Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            Analyze this watch service receipt image. 
            Extract the following information in JSON format:
            {
               "serviceDate": "DD/MM/YYYY",
               "items": [
                 {
                   "watchModel": "string",
                   "batteryModelNo": "string",
                   "price": "string"
                 }
               ]
            }
            
            Rules:
            1. serviceDate should be "DD/MM/YYYY". If not found, use today's date in that format. Ignore the time.
            2. Extract every line item that indicates a battery change.
            3. watchModel: The name/model of the watch (e.g., Tissot, Seiko).
            4. batteryModelNo: The specific battery number/code (e.g., 371, 395, CR2032).
            5. price: The numeric price value (e.g., "15.00").
            6. If you cannot find a specific field, use an empty string "" instead of null.
            7. Return ONLY the valid JSON block.
        `;

        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: fileData.type,
                },
            },
            prompt,
        ]);

        const responseText = result.response.text();
        console.log('AI RAW RESPONSE:', responseText);

        // Clean up markdown if Gemini wraps it in ```json ... ```
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;

        const extracted = JSON.parse(jsonStr);

        // Final safety check/transformation
        if (extracted.items && Array.isArray(extracted.items)) {
            extracted.items = extracted.items.map((item: any) => ({
                watchModel: String(item.watchModel || ''),
                batteryModelNo: String(item.batteryModelNo || ''),
                price: String(item.price || ''),
            }));
        }

        return NextResponse.json(extracted);
    } catch (error) {
        console.error('Extraction error:', error);
        return NextResponse.json({ error: 'Failed to extract data' }, { status: 500 });
    }
}
