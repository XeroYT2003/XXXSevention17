
const express = require('express');
const fetch = require('node-fetch'); 
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN; 

if (!BOT_TOKEN) {
  console.error('ERROR: brak BOT_TOKEN w zmiennych środowiskowych.');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.post('/get-avatar', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Brak userId w body' });

  try {
    const resp = await fetch(`https://discord.com/api/v10/users/${userId}`, {
      headers: { 'Authorization': `Bot ${BOT_TOKEN}` }
    });

    if (resp.status === 404) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: 'Błąd od Discord API', details: text });
    }

    const data = await resp.json();

  
    let avatarUrl;
    if (!data.avatar) {
      
      const defaultIndex = (Number(userId) % 5);
      avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    } else {
      const isAnimated = data.avatar.startsWith('a_');
      const ext = isAnimated ? 'gif' : 'png';
      avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.${ext}?size=512`;
    }

    
    res.json({
      avatarUrl,
      username: data.username,
      discriminator: data.discriminator,
      id: data.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Błąd serwera', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
