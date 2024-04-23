const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
    }

    // 从请求体中获取图像数据
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ error: 'Bad Request', message: 'No image provided.' });
    }

    // 使用环境变量中配置的 API 密钥和 API 基址
    const apiKey = process.env.OPENAI_API_KEY;
    const apiBase = process.env.OPENAI_API_BASE || 'https://api.openai.com';

    try {
        // 使用 OpenAI API 进行图像识别
        const response = await fetch(`${apiBase}/v1/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                prompt: "Generate a description for this image: " + image, // 假设图像以某种方式嵌入到提示中
                max_tokens: 150
            })
        });

        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API error: ${errorData.error.message}`);
        }

        // 解析响应数据
        const data = await response.json();
        res.status(200).json({ description: data.choices[0].text });
    } catch (error) {
        console.error('Error processing image recognition:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};
