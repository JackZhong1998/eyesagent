const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Bad Request', message: 'No text provided.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  try {
    const response = await fetch(`${process.env.OPENAI_API_BASE}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model: "tts-1"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error.message}`);
    }

    const data = await response.json();
    res.status(200).json({ audioUrl: data.url });
  } catch (error) {
    console.error('Error processing text to speech:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
