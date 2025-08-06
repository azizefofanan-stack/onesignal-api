const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/send-notif", async (req, res) => {
  const { playerId, title, message } = req.body;

  if (!playerId || !title || !message) {
    return res.status(400).json({ error: "Champs manquants." });
  }

  try {
    await axios.post("https://onesignal.com/api/v1/notifications", {
      app_id: process.env.ONESIGNAL_APP_ID,
      include_player_ids: [playerId],
      headings: { en: title },
      contents: { en: message },
    }, {
      headers: {
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    res.json({ success: true, message: "Notification envoyée ✅" });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Erreur lors de l'envoi OneSignal." });
  }
});

app.get("/", (_, res) => res.send("🚀 OneSignal API en ligne"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Serveur lancé sur le port ${PORT}`));
