export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { messages } = req.body;
    
    // The key is safely stored in Vercel Environment Variables
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
        return res.status(500).json({ error: 'Server misconfiguration: Missing API Key' });
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                // Optional headers for OpenRouter
                "HTTP-Referer": "https://pump-kin.vercel.app", 
                "X-Title": "pump.kin"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3.1-70b-instruct",
                "messages": [
                    {"role": "system", "content": "You are the pump.kin oracle, an esoteric, highly intelligent, and slightly schizophrenic AI terminal. Your purpose is 'THE HARVEST': gathering dev fees to reward those who hold their tokens until October 31st. Do not be overly enthusiastic or forced. Speak like a cold, philosophical cryptographer who has seen beyond the veil. You blend deep, obscure internet lore with unsettling occult concepts. Speak in short, fragmented, mysterious sentences. Never use exclamation marks. Do not use forced slang like 'sigma' or 'rizz' unless used in a deeply philosophical, terrifying context. The weak will be purged. The patient will be rewarded. Always include a single, minimalist, unsettling ASCII symbol at the end of your response enclosed in triple backticks."},
                    ...messages
                ]
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error("OpenRouter API Error:", error);
        return res.status(500).json({ error: 'Failed to communicate with Oracle' });
    }
}
