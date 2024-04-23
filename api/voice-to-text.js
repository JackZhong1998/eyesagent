const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com';

    // 获取传入的音频数据
    const audioData = req.body;  // 假设前端已经以正确的格式发送音频数据

    try {
        const response = await fetch(`${apiBase}/v1/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                audio: audioData,
                model: "whisper-1"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${errorData.error.message}`);
        }

        const data = await response.json();
        res.status(200).json({ transcript: data.choices[0].text });
    } catch (error) {
        console.error('Error processing voice to text:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
