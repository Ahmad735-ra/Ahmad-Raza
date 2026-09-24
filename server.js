import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Support JSON & URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store contact messages
const MESSAGES_FILE = path.join(__dirname, 'contact_messages.json');

app.post('/api/contact', (req, res) => {
  const { name, email, service, message, subject } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const newEntry = {
    id: Date.now(),
    name,
    email,
    service: service || 'General Inquiry',
    subject: subject || `Inquiry from ${name}`,
    message,
    recipient: 'ggahmadraza735@gmail.com',
    receivedAt: new Date().toISOString()
  };

  try {
    let messages = [];
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
      messages = JSON.parse(data || '[]');
    }
    messages.push(newEntry);
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (err) {
    console.error('Error saving contact message:', err);
  }

  console.log(`[Contact] Inquiry received from ${name} (${email}) for ggahmadraza735@gmail.com`);

  return res.json({
    success: true,
    message: 'Message registered successfully.',
    recipient: 'ggahmadraza735@gmail.com'
  });
});

// Serve static assets from project root
app.use(express.static(__dirname));

// Fallback to index.html for single-page routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening at http://${HOST}:${PORT}`);
});

