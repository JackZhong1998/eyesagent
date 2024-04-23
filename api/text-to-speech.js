const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
    }

    const { text } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;
    const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com';

    try {
        const response = await fetch(`${apiBase}/v1/audio/speech`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model: "tts-1"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${errorData.error.message}`);
        }

        const data = await response.json();
        res.status(200).json({ audioUrl: data.url });  // 返回语音文件的 URL
    } catch (error) {
        console.error('Error processing text to speech:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
