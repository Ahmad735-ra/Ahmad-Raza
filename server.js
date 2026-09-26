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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Store contact messages
const MESSAGES_FILE = path.join(__dirname, 'contact_messages.json');
const PROJECTS_FILE = path.join(__dirname, 'projects.json');
const CERTIFICATES_FILE = path.join(__dirname, 'certificates.json');

const INITIAL_CERTIFICATES = [
  {
    id: 1,
    title: "CCNA Routing & Switching",
    issuer: "Cisco Systems",
    date: "Certified 2023",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80",
    description: "Enterprise routing, switching, VLAN, OSPF, Access Control Lists, IPv4/IPv6 subnetting, and WAN configurations.",
    verificationUrl: ""
  },
  {
    id: 2,
    title: "Certified Professional Assessor",
    issuer: "NAVTTC Pakistan",
    date: "Certified 2024",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
    description: "Official Assessor Certification for evaluating vocational & technical students under Pakistan's National Vocational and Technical Training Commission guidelines.",
    verificationUrl: ""
  },
  {
    id: 3,
    title: "DAE Civil Technology",
    issuer: "Punjab Board of Technical Education",
    date: "Completed 2022",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
    description: "Diploma of Associate Engineering covering construction engineering, surveying, quantity surveying (BOQ), soil mechanics, and concrete quality control.",
    verificationUrl: ""
  }
];

// Initialize certificates file if it doesn't exist
try {
  if (!fs.existsSync(CERTIFICATES_FILE)) {
    fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(INITIAL_CERTIFICATES, null, 2));
  }
} catch (err) {
  console.error('Error initializing certificates file:', err);
}

app.get('/api/certificates', (req, res) => {
  try {
    if (fs.existsSync(CERTIFICATES_FILE)) {
      const data = fs.readFileSync(CERTIFICATES_FILE, 'utf8');
      return res.json(JSON.parse(data || '[]'));
    }
  } catch (err) {
    console.error('Error reading certificates:', err);
  }
  return res.json(INITIAL_CERTIFICATES);
});

app.post('/api/certificates', (req, res) => {
  const { title, issuer, date, image, description, verificationUrl, password } = req.body;

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Certificate cannot be added.' });
  }

  if (!title || !issuer || !date) {
    return res.status(400).json({ error: 'Title, issuer, and date are required.' });
  }

  const newCertificate = {
    id: Date.now(),
    title,
    issuer,
    date,
    image: image || "https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?auto=format&fit=crop&w=600&q=80",
    description: description || "",
    verificationUrl: verificationUrl || ""
  };

  try {
    let certificates = [];
    if (fs.existsSync(CERTIFICATES_FILE)) {
      const data = fs.readFileSync(CERTIFICATES_FILE, 'utf8');
      certificates = JSON.parse(data || '[]');
    } else {
      certificates = [...INITIAL_CERTIFICATES];
    }
    certificates.unshift(newCertificate);
    fs.writeFileSync(CERTIFICATES_FILE, JSON.stringify(certificates, null, 2));
    return res.json(newCertificate);
  } catch (err) {
    console.error('Error saving new certificate:', err);
    return res.status(500).json({ error: 'Failed to save new certificate.' });
  }
});

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

// Initialize projects file if it doesn't exist
try {
  if (!fs.existsSync(PROJECTS_FILE)) {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(INITIAL_PROJECTS, null, 2));
  }
} catch (err) {
  console.error('Error initializing projects file:', err);
}

app.get('/api/projects', (req, res) => {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      return res.json(JSON.parse(data || '[]'));
    }
  } catch (err) {
    console.error('Error reading projects:', err);
  }
  return res.json(INITIAL_PROJECTS);
});

app.post('/api/projects', (req, res) => {
  const { title, category, categoryLabel, image, description, tags, password } = req.body;

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Project cannot be added.' });
  }

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required.' });
  }

  const newProject = {
    id: Date.now(),
    title,
    category,
    categoryLabel: categoryLabel || (category === 'civil' ? 'Civil Engineering' : category === 'networking' ? 'Networking & IT' : 'Other Projects'),
    image: image || "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
    description,
    tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
  };

  try {
    let projects = [];
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      projects = JSON.parse(data || '[]');
    } else {
      projects = [...INITIAL_PROJECTS];
    }
    projects.unshift(newProject);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    return res.json(newProject);
  } catch (err) {
    console.error('Error saving new project:', err);
    return res.status(500).json({ error: 'Failed to save new project.' });
  }
});

app.put('/api/projects/:id', (req, res) => {
  const { title, category, categoryLabel, image, description, tags, password } = req.body;
  const projectId = parseInt(req.params.id, 10);

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Project cannot be updated.' });
  }

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required.' });
  }

  try {
    let projects = [];
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      projects = JSON.parse(data || '[]');
    } else {
      projects = [...INITIAL_PROJECTS];
    }

    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    projects[index] = {
      ...projects[index],
      title,
      category,
      categoryLabel: categoryLabel || (category === 'civil' ? 'Civil Engineering' : category === 'networking' ? 'Networking & IT' : 'Other Projects'),
      image: image || projects[index].image,
      description,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : [])
    };

    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    return res.json(projects[index]);
  } catch (err) {
    console.error('Error updating project:', err);
    return res.status(500).json({ error: 'Failed to update project.' });
  }
});

app.delete('/api/projects/:id', (req, res) => {
  const { password } = req.body;
  const projectId = parseInt(req.params.id, 10);

  if (password !== 'Ahmad@001') {
    return res.status(403).json({ error: 'Incorrect authorization password. Project cannot be deleted.' });
  }

  try {
    let projects = [];
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf8');
      projects = JSON.parse(data || '[]');
    } else {
      projects = [...INITIAL_PROJECTS];
    }

    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    projects.splice(index, 1);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
    return res.json({ success: true, id: projectId });
  } catch (err) {
    console.error('Error deleting project:', err);
    return res.status(500).json({ error: 'Failed to delete project.' });
  }
});

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

