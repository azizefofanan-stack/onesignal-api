// index.js (CommonJS)
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const APP_ID = process.env.ONESIGNAL_APP_ID;
const API_KEY = process.env.ONESIGNAL_API_KEY;
const API_SECRET = process.env.API_SECRET;

// Petit middleware sécurité (clé côté client)
app.use((req, res, next) => {
  if (!API_SECRET) return next(); // si tu n’as pas encore mis la variable
  const key = req.headers["x-api-key"];
  if (key !== API_SECRET) return res.status(401).json({ error: "Unauthorized" });
  next();
});

// Health check
app.get("/", (_, res) => res.send("OneSignal API OK 🚀"));

// Envoi 1 cible (playerId OU userId = external user id)
app.post("/send", async (req, res) => {
  try {
    const { title, message, playerId, userId } = req.body;
    if (!title || !message) return res.status(400).json({ error: "title/message requis" });

    const body = {
      app_id: APP_ID,
      headings: { en: title, fr: title },
      contents: { en: message, fr: message },
    };

    if (userId) body.include_external_user_ids = [String(userId)];
    else if (playerId) body.include_player_ids = [playerId];
    else return res.status(400).json({ error: "playerId ou userId requis" });

    const r = await axios.post("https://onesignal.com/api/v1/notifications", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${API_KEY}`,
      },
    });

    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Envoi bulk (liste de playerIds OU userIds)
app.post("/send-bulk", async (req, res) => {
  try {
    const { title, message, playerIds = [], userIds = [] } = req.body;
    if (!title || !message) return res.status(400).json({ error: "title/message requis" });
    if (playerIds.length === 0 && userIds.length === 0)
      return res.status(400).json({ error: "playerIds ou userIds requis" });

    const body = {
      app_id: APP_ID,
      headings: { en: title, fr: title },
      contents: { en: message, fr: message },
    };
    if (userIds.length) body.include_external_user_ids = userIds.map(String);
    if (playerIds.length) body.include_player_ids = playerIds;

    const r = await axios.post("https://onesignal.com/api/v1/notifications", body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${API_KEY}`,
      },
    });

    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
