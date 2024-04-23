const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
  }

  const { audioBase64 } = req.body;
  if (!audioBase64) {
    return res.status(400).json({ error: 'Bad Request', message: 'No audio provided.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  try {
    const response = await fetch(`${process.env.OPENAI_API_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: audioBase64,
        model: "whisper-large"
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error.message}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error processing voice to text:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
