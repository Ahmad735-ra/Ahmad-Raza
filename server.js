import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Support JSON & URL-encoded request bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Local file paths for backup / cache seeding
const MESSAGES_FILE = path.join(__dirname, 'contact_messages.json');
const PROJECTS_FILE = path.join(__dirname, 'projects.json');
const CERTIFICATES_FILE = path.join(__dirname, 'certificates.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Convert base64 data URIs into static image files on disk
function saveBase64Image(dataUri, prefix) {
  if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:image/')) {
    return dataUri;
  }
  try {
    const matches = dataUri.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataUri;
    }
    const ext = matches[1].replace('jpeg', 'jpg');
    const base64Data = matches[2];
    const filename = `${prefix}_${Date.now()}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    console.log(`Saved uploaded image to: /uploads/${filename}`);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Error saving base64 image to file:', err);
    return dataUri;
  }
}

// Initialize Firebase Admin with named database
let dbInstance = null;
try {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf8'));
  const adminApp = admin.initializeApp({
    projectId: firebaseConfig.projectId
  });
  dbInstance = firebaseConfig.firestoreDatabaseId 
    ? getFirestore(adminApp, firebaseConfig.firestoreDatabaseId) 
    : getFirestore(adminApp);
  console.log('Firebase Admin initialized successfully with databaseId:', firebaseConfig.firestoreDatabaseId);
} catch (err) {
  console.error('Warning: Failed to initialize Firebase Admin, using local filesystem fallback:', err.message);
}

const INITIAL_CERTIFICATES = [
  {
    id: 1,
    title: "Bachelor in Arts",
    issuer: "BZU MULTAN",
    date: "2022",
    image: "bzu_degree.svg",
    description: "Associate Degree of Arts (Session Supplementary Exam 2022) from Bahauddin Zakariya University Multan-Pakistan.",
    verificationUrl: "https://www.bzu.edu.pk"
  },
  {
    id: 2,
    title: "CCNA Routing & Switching",
    issuer: "Cisco Systems",
    date: "Certified 2023",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
    description: "Enterprise routing, switching, VLAN, OSPF, Access Control Lists, IPv4/IPv6 subnetting, and WAN configurations.",
    verificationUrl: ""
  },
  {
    id: 3,
    title: "Certified Professional Assessor",
    issuer: "NAVTTC Pakistan",
    date: "Certified 2024",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    description: "Official Assessor Certification for evaluating vocational & technical students under Pakistan's National Vocational and Technical Training Commission guidelines.",
    verificationUrl: ""
  },
  {
    id: 4,
    title: "DAE Civil Technology",
    issuer: "Punjab Board of Technical Education",
    date: "Completed 2022",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    description: "Diploma of Associate Engineering covering construction engineering, surveying, quantity surveying (BOQ), soil mechanics, and concrete quality control.",
    verificationUrl: ""
  }
];

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: "Architectural 3D Model & Site Supervision",
    category: "civil",
    categoryLabel: "Civil Engineering",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    description: "Complete AutoCAD drafting, 3D structural elevation render, and active site supervision for modern multi-story building project.",
    tags: ["AutoCAD 3D", "Site Supervision", "Civil Engineering"]
  },
  {
    id: 2,
    title: "Cisco Multi-Site Enterprise Routing Topology",
    category: "networking",
    categoryLabel: "Networking & IT",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    description: "Design and deployment of multi-VLAN topology featuring OSPF routing, DHCP servers, and redundant link failovers using Packet Tracer.",
    tags: ["CCNA", "Packet Tracer", "OSPF", "VLAN"]
  },
  {
    id: 3,
    title: "High-Rise Highway & Flyover Construction",
    category: "civil",
    categoryLabel: "Civil Engineering",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
    description: "Structural surveying, concrete quality inspection, and BOQ estimation for urban highway infrastructure extension.",
    tags: ["BOQ", "Quality Control", "Surveying"]
  },
  {
    id: 4,
    title: "Server Rack & Network Infrastructure Setup",
    category: "networking",
    categoryLabel: "Networking & IT",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
    description: "Enterprise physical server rack organization, patch panel termination, Wireshark traffic analysis, and firewall hardening.",
    tags: ["Patch Panels", "Wireshark", "Network Security"]
  },
  {
    id: 5,
    title: "Rocky Linux Web & Enterprise Domain Server",
    category: "networking",
    categoryLabel: "Networking & IT",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=800&q=80",
    description: "Hardened Linux server configuration with active SSH keys, UFW rules, Apache Web Server, and custom Bash automation scripts.",
    tags: ["Rocky Linux", "SysAdmin", "Bash Scripting"]
  },
  {
    id: 6,
    title: "Mobile App & UI Engineering Wireframes",
    category: "other",
    categoryLabel: "Other Projects",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    description: "Interface layout drafting and prototype workflow for engineering site data management mobile application.",
    tags: ["UI Design", "Workflow", "Prototypes"]
  }
];

let certificatesCache = null;
let projectsCache = null;
let messagesCache = null;

// File fallback helper methods
function loadCertificatesFromFile() {
  let certs = [];
  try {
    if (fs.existsSync(CERTIFICATES_FILE)) {
      const data = fs.readFileSync(CERTIFICATES_FILE, 'utf8');
      certs = JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('Error loading certificates from file:', err);
  }

  // Ensure all initial certificates are present (do not lose default or user added certs)
  if (!Array.isArray(certs) || certs.length === 0) {
    certs = [...INITIAL_CERTIFICATES];
  } else {
    for (const initCert of INITIAL_CERTIFICATES) {
      if (!certs.some(c => c.id === initCert.id || (c.title === initCert.title && c.issuer === initCert.issuer))) {
        certs.push(initCert);
      }
    }
  }
  try {
    fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(certs, null, 2));
  } catch (err) {
    console.warn('Warning: Could not save certificates file:', err.message);
  }
  return certs;
}

function saveCertificatesToFile() {
  try {
    fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(certificatesCache || [], null, 2));
  } catch (err) {
    console.warn('Warning: Failed to write certificates to file:', err.message);
  }
}

function loadProjectsFromFile() {
  let projs = [];
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      projs = JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('Error loading projects from file:', err);
  }

  if (!Array.isArray(projs) || projs.length === 0) {
    projs = [...INITIAL_PROJECTS];
  } else {
    for (const initProj of INITIAL_PROJECTS) {
      if (!projs.some(p => p.id === initProj.id || p.title === initProj.title)) {
        projs.push(initProj);
      }
    }
  }
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projs, null, 2));
  } catch (err) {
    console.warn('Warning: Could not save projects file:', err.message);
  }
  return projs;
}

function saveProjectsToFile() {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projectsCache || [], null, 2));
  } catch (err) {
    console.warn('Warning: Failed to write projects to file:', err.message);
  }
}

function loadMessagesFromFile() {
  try {
    if (fs.existsSync(MESSAGES_FILE)) {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('Error loading messages from file:', err);
  }
  return [];
}

function saveMessagesToFile() {
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messagesCache || [], null, 2));
  } catch (err) {
    console.warn('Warning: Failed to write messages to file:', err.message);
  }
}

// Startup seeding and cache load
async function initializeData() {
  // Always load from local persistent storage first
  certificatesCache = loadCertificatesFromFile();
  projectsCache = loadProjectsFromFile();
  messagesCache = loadMessagesFromFile();

  if (dbInstance) {
    try {
      // 1. Load/seed Certificates with Firestore if available
      const certSnap = await dbInstance.collection('certificates').get();
      if (certSnap.empty) {
        console.log('Seeding initial certificates to Firestore...');
        for (const cert of certificatesCache) {
          await dbInstance.collection('certificates').doc(cert.id.toString()).set(cert);
        }
      } else {
        const firestoreCerts = [];
        certSnap.forEach(doc => {
          firestoreCerts.push(doc.data());
        });
        if (firestoreCerts.length > 0) {
          // Merge without overwriting local custom certs
          const merged = [...firestoreCerts];
          for (const localC of certificatesCache) {
            if (!merged.some(m => m.id === localC.id || (m.title === localC.title && m.issuer === localC.issuer))) {
              merged.push(localC);
            }
          }
          merged.sort((a, b) => b.id - a.id);
          certificatesCache = merged;
          saveCertificatesToFile();
        }
      }

      // 2. Load/seed Projects with Firestore if available
      const projSnap = await dbInstance.collection('projects').get();
      if (projSnap.empty) {
        console.log('Seeding initial projects to Firestore...');
        for (const proj of projectsCache) {
          await dbInstance.collection('projects').doc(proj.id.toString()).set(proj);
        }
      } else {
        const firestoreProjects = [];
        projSnap.forEach(doc => {
          firestoreProjects.push(doc.data());
        });
        if (firestoreProjects.length > 0) {
          const mergedProj = [...firestoreProjects];
          for (const localP of projectsCache) {
            if (!mergedProj.some(m => m.id === localP.id || m.title === localP.title)) {
              mergedProj.push(localP);
            }
          }
          mergedProj.sort((a, b) => b.id - a.id);
          projectsCache = mergedProj;
          saveProjectsToFile();
        }
      }

      // 3. Load Messages
      const msgSnap = await dbInstance.collection('contact_messages').get();
      const fsMessages = [];
      msgSnap.forEach(doc => {
        fsMessages.push(doc.data());
      });
      if (fsMessages.length > 0) {
        messagesCache = fsMessages;
        saveMessagesToFile();
      }
      console.log('Firestore connection and sync checked successfully.');
    } catch (err) {
      console.warn('Note: Operating with robust local persistent cache (Firestore restricted):', err.message);
    }
  }
}

initializeData();

app.get('/api/certificates', async (req, res) => {
  if (!certificatesCache) {
    await initializeData();
  }
  return res.json(certificatesCache || []);
});

app.post('/api/certificates', async (req, res) => {
  const { title, issuer, date, image, description, verificationUrl, password } = req.body;

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Certificate cannot be added.' });
  }

  if (!title || !issuer || !date) {
    return res.status(400).json({ error: 'Title, issuer, and date are required.' });
  }

  const savedImage = saveBase64Image(image, 'cert');
  const newCertificate = {
    id: Date.now(),
    title,
    issuer,
    date,
    image: savedImage || "bzu_degree.svg",
    description: description || "",
    verificationUrl: verificationUrl || ""
  };

  if (!certificatesCache) certificatesCache = [];
  certificatesCache.unshift(newCertificate);
  saveCertificatesToFile();

  if (dbInstance) {
    try {
      await dbInstance.collection('certificates').doc(newCertificate.id.toString()).set(newCertificate);
    } catch (err) {
      console.warn('Warning: Could not sync certificate to Firestore, saved locally:', err.message);
    }
  }
  return res.json(newCertificate);
});

app.put('/api/certificates/:id', async (req, res) => {
  const { title, issuer, date, verificationUrl, image, description, password } = req.body;
  const certId = parseInt(req.params.id, 10);

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Certificate cannot be updated.' });
  }

  if (!title || !issuer || !date) {
    return res.status(400).json({ error: 'Title, issuer, and date are required.' });
  }

  if (!certificatesCache) {
    await initializeData();
  }

  const index = certificatesCache.findIndex(c => c.id === certId);
  if (index === -1) {
    return res.status(404).json({ error: 'Certificate not found.' });
  }

  const savedImage = saveBase64Image(image, 'cert');
  certificatesCache[index] = {
    ...certificatesCache[index],
    title,
    issuer,
    date,
    image: savedImage || certificatesCache[index].image,
    description: description || "",
    verificationUrl: verificationUrl || ""
  };

  saveCertificatesToFile();

  if (dbInstance) {
    try {
      await dbInstance.collection('certificates').doc(certId.toString()).set(certificatesCache[index]);
    } catch (err) {
      console.warn('Warning: Could not sync certificate update to Firestore, updated locally:', err.message);
    }
  }
  return res.json(certificatesCache[index]);
});

app.delete('/api/certificates/:id', async (req, res) => {
  const { password } = req.body;
  const certId = parseInt(req.params.id, 10);

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Certificate cannot be deleted.' });
  }

  if (!certificatesCache) {
    await initializeData();
  }

  const index = certificatesCache.findIndex(c => c.id === certId);
  if (index === -1) {
    return res.status(404).json({ error: 'Certificate not found.' });
  }

  certificatesCache.splice(index, 1);
  saveCertificatesToFile();

  if (dbInstance) {
    try {
      await dbInstance.collection('certificates').doc(certId.toString()).delete();
    } catch (err) {
      console.warn('Warning: Could not sync certificate deletion to Firestore, deleted locally:', err.message);
    }
  }
  return res.json({ success: true, id: certId });
});

app.get('/api/projects', async (req, res) => {
  if (!projectsCache) {
    await initializeData();
  }
  return res.json(projectsCache || []);
});

app.post('/api/projects', async (req, res) => {
  const { title, category, categoryLabel, image, description, tags, password } = req.body;

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Project cannot be added.' });
  }

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required.' });
  }

  const savedImage = saveBase64Image(image, 'proj');
  const newProject = {
    id: Date.now(),
    title,
    category,
    categoryLabel: categoryLabel || (category === 'civil' ? 'Civil Engineering' : category === 'networking' ? 'Networking & IT' : 'Other Projects'),
    image: savedImage || "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
    description,
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
  };

  if (!projectsCache) projectsCache = [];
  projectsCache.unshift(newProject);
  saveProjectsToFile();

  if (dbInstance) {
    try {
      await dbInstance.collection('projects').doc(newProject.id.toString()).set(newProject);
    } catch (err) {
      console.warn('Warning: Could not sync project to Firestore, saved locally:', err.message);
    }
  }
  return res.json(newProject);
});

app.put('/api/projects/:id', async (req, res) => {
  const { title, category, categoryLabel, image, description, tags, password } = req.body;
  const projectId = parseInt(req.params.id, 10);

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Project cannot be updated.' });
  }

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required.' });
  }

  if (!projectsCache) {
    await initializeData();
  }

  const index = projectsCache.findIndex(p => p.id === projectId);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const savedImage = saveBase64Image(image, 'proj');
  projectsCache[index] = {
    ...projectsCache[index],
    title,
    category,
    categoryLabel: categoryLabel || (category === 'civil' ? 'Civil Engineering' : category === 'networking' ? 'Networking & IT' : 'Other Projects'),
    image: savedImage || projectsCache[index].image,
    description,
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
  };

  saveProjectsToFile();

  if (dbInstance) {
    try {
      await dbInstance.collection('projects').doc(projectId.toString()).set(projectsCache[index]);
    } catch (err) {
      console.warn('Warning: Could not sync project update to Firestore, updated locally:', err.message);
    }
  }
  return res.json(projectsCache[index]);
});

app.delete('/api/projects/:id', async (req, res) => {
  const { password } = req.body;
  const projectId = parseInt(req.params.id, 10);

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Project cannot be deleted.' });
  }

  if (!projectsCache) {
    await initializeData();
  }

  const index = projectsCache.findIndex(p => p.id === projectId);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  projectsCache.splice(index, 1);
  saveProjectsToFile();

  if (dbInstance) {
    try {
      await dbInstance.collection('projects').doc(projectId.toString()).delete();
    } catch (err) {
      console.warn('Warning: Could not sync project deletion to Firestore, deleted locally:', err.message);
    }
  }
  return res.json({ success: true, id: projectId });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, service, message, subject } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const newEntry = {
    id: Date.now().toString(),
    name,
    email,
    service: service || 'General Inquiry',
    subject: subject || `Inquiry from ${name}`,
    message,
    recipient: 'ggahmadraza735@gmail.com',
    receivedAt: new Date().toISOString()
  };

  try {
    if (dbInstance) {
      await dbInstance.collection('contact_messages').doc(newEntry.id).set(newEntry);
    }
    if (!messagesCache) messagesCache = [];
    messagesCache.push(newEntry);
    saveMessagesToFile();
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
