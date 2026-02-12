/**
 * Deterministic receipt parser for structured battery service receipts.
 *
 * Expected format:
 *   Header with date/time
 *   ...
 *   Battery change <model>
 *   <brand_code>
 *   ...
 *   Battery change <model>
 *   <brand_code>
 */

export interface ParsedItem {
    watchModel: string;
    batteryModelNo: string;
}

export interface ParsedReceipt {
    serviceDate: string | null;
    items: ParsedItem[];
    rawText: string;
}

const BATTERY_CHANGE_REGEX = /Battery\s+change\s+(.+)/i;

// Common date patterns in receipt headers
const DATE_PATTERNS = [
    // MM/DD/YYYY HH:MM
    /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)/,
    // YYYY-MM-DD HH:MM
    /(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2}(?::\d{2})?)/,
    // DD MMM YYYY
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
    // MM/DD/YYYY (date only)
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
];

function extractServiceDate(text: string): string | null {
    const lines = text.split('\n');
    // Only look in the first 10 lines for the date (header area)
    const headerLines = lines.slice(0, 10).join('\n');

    for (const pattern of DATE_PATTERNS) {
        const match = headerLines.match(pattern);
        if (match) {
            try {
                const dateStr = match[0];
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString();
                }
                // If Date constructor can't parse it, return the raw string
                return dateStr;
            } catch {
                return match[0];
            }
        }
    }

    return null;
}

function extractItems(text: string): ParsedItem[] {
    const lines = text.split('\n').map((l) => l.trim());
    const items: ParsedItem[] = [];

    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(BATTERY_CHANGE_REGEX);
        if (match) {
            // Based on user feedback: "Battery change <Battery Model>"
            // The line indicates the battery model number (e.g. 371, 2016)
            const batteryModelNo = match[1].trim();

            // The next non-empty line is the Watch Model / Brand (e.g. Bulova Precision)
            let watchModel = '';
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].length > 0) {
                    // Stop if the next non-empty line is another "Battery change"
                    if (BATTERY_CHANGE_REGEX.test(lines[j])) break;
                    watchModel = lines[j];
                    break;
                }
            }

            items.push({ watchModel, batteryModelNo });
        }
    }

    return items;
}

export function parseReceipt(rawText: string): ParsedReceipt {
    const serviceDate = extractServiceDate(rawText);
    const items = extractItems(rawText);

    return {
        serviceDate,
        items,
        rawText,
    };
}

/**
 * Placeholder for future OCR integration (Google Vision, Tesseract, etc.)
 * In MVP, the user pastes or types receipt text, or uses manual entry.
 */
export async function extractTextFromImage(_imagePath: string): Promise<string> {
    // TODO: Integrate with OCR API
    // For now, return empty string — the upload flow will allow manual text input
    return '';
}
