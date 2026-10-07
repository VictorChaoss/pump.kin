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
                "model": "meta-llama/llama-3.1-8b-instruct:free",
                "messages": messages
            })
        });

        const data = await response.json();
        return res.status(200).json(data);
        
    } catch (error) {
        console.error("OpenRouter API Error:", error);
        return res.status(500).json({ error: 'Failed to communicate with Oracle' });
    }
}
