require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

// Servir fichiers statiques front
app.use(express.static(path.join(__dirname, "public")));

// POST /subscribe
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        listIds: [Number(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
      return res.status(500).json({ error: "Brevo API error" });
    }

    res.json({ message: "✅ Email added to Brevo list." });
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /signup
app.post("/signup", async (req, res) => {
  const { name, email } = req.body;
  if (!email || !name) return res.status(400).json({ error: "Name and email required" });

  try {
    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: { FIRSTNAME: name },
        listIds: [Number(process.env.BREVO_SIGNUP_LIST_ID)],
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API error:", errorData);
      return res.status(500).json({ error: "Brevo API error" });
    }

    res.json({ message: "✅ Signup successful." });
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// IA : /generate-contract (mock Gemini)
app.get('/generate-contract', async (req, res) => {
  const fakeContract = `
  Service Agreement

  This contract is made between the Freelancer and Client.

  Scope: Design and build the project as agreed.

  Payment: 30% upfront, 70% upon delivery.

  Delivery: 2 weeks after signing.

  Confidentiality: Both parties agree to confidentiality.

  Signature:
  `;
  res.json({ contract: fakeContract });
});

// Signature PDF : /sign-pdf (mock PDF.co)
app.post('/sign-pdf', async (req, res) => {
  const signUrl = "https://app.pdf.co/document-sign-link/demo"; // à remplacer plus tard
  res.json({ signUrl });
});

// Routes HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/demo", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "demo.html"));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});
app.get("/contract", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "contract.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
