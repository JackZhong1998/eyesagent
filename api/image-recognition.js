const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed', message: 'Only POST requests are accepted.' });
  }

  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: 'Bad Request', message: 'No image provided.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  try {
    const response = await fetch(`${process.env.OPENAI_API_BASE}/models/dalle-2/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image,
        model: "dalle-2",
        // Add more parameters as needed
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error.message}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error processing image recognition:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};
