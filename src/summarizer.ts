import fetch from 'node-fetch';

export class Summarizer {
    private apiUrl = "https://www.echoyz.net/api/generate";
    private headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    constructor() {
        this.warmUp();
    }

    private async warmUp(): Promise<void> {
        // Send a warm-up request when the extension loads
        try {
            await this.summarizeText("hi");
            console.log("Summarizer warmed up successfully");
        } catch (error) {
            console.error("Warm-up failed:", error);
        }
    }

    async summarizeText(text: string, maxRetries: number = 3): Promise<string> {
        const payload = {
            prompt: `Please summarize the following text:\n\n${text}`,
            userId: "anonymous",
            sessionId: "0qg3df",
            useSearch: false
        };

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`Sending request to EchoYZ API (Attempt ${attempt + 1}/${maxRetries})...`);
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: this.headers,
                    body: JSON.stringify(payload)
                });

                console.log(`API Response Status: ${response.status}`);

                if (response.status === 504 && attempt < maxRetries - 1) {
                    const waitTime = 2 * (attempt + 1);
                    console.warn(`504 Timeout. Retrying in ${waitTime} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                    continue;
                }

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const result = await response.json();
                return result.content || "No content in response";

            } catch (error) {
                if (attempt === maxRetries - 1) {
                    console.error(`Request failed after ${maxRetries} attempts:`, error);
                    throw error;
                }
                const waitTime = 2 * (attempt + 1);
                console.warn(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}. Retrying in ${waitTime} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            }
        }

        throw new Error("Failed to get response after all retries");
    }
} 