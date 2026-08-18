const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// MongoDB Atlas URI
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://shreyasdokrimare8459_db_user:yB0tYUz786mgZYzj@cluster0.szdzi7u.mongodb.net/crime_intel_db?retryWrites=true&w=majority&appName=Cluster0";

// ================= SCHEMAS & MODELS =================

// 1. User Model
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  role: { type: String, required: true }, // "Citizen" or "Police Officer"
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", UserSchema);

// 2. Case Model
const CaseSchema = new mongoose.Schema({
  caseId: { type: String, unique: true },
  title: { type: String, required: true },
  crimeType: { type: String, default: "Other" },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  date: { type: String, default: () => new Date().toISOString().split("T")[0] },
  keywords: [{ type: String }],
  evidenceSummary: { type: String, default: "" },
  evidenceCount: { type: Number, default: 0 },
  status: { type: String, default: "Under Investigation" },
  priority: { type: String, default: "Open" },
  firText: { type: String, default: "" },
  suspectCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Case = mongoose.model("Case", CaseSchema);

// 3. Evidence Model
const EvidenceSchema = new mongoose.Schema({
  caseId: { type: String, default: "" },
  applicationId: { type: String, default: "" },
  name: { type: String, default: "Evidence Item" },
  type: { type: String, default: "physical" },
  description: { type: String, default: "" },
  location: { type: String, default: "" },
  time: { type: String, default: "" },
  tags: [{ type: String }],
  dataUrl: { type: String, default: "" },
  fileSize: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
const Evidence = mongoose.model("Evidence", EvidenceSchema);

// 4. Suspect Model
const SuspectSchema = new mongoose.Schema({
  caseId: { type: String, default: "" },
  applicationId: { type: String, default: "" },
  name: { type: String, required: true },
  alias: { type: String, default: "" },
  age: { type: String, default: "" },
  gender: { type: String, default: "Unknown" },
  description: { type: String, default: "" },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});
const Suspect = mongoose.model("Suspect", SuspectSchema);

// 5. Citizen Complaint Model
const ComplaintSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true },
  citizenName: { type: String, default: "Citizen" },
  citizenPhone: { type: String, default: "" },
  title: { type: String, required: true },
  category: { type: String, required: true },
  incidentDate: { type: String, required: true },
  incidentLocation: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, default: "Submitted" },
  suspectInfo: {
    name: { type: String, default: "" },
    age: { type: String, default: "" },
    gender: { type: String, default: "" },
    description: { type: String, default: "" }
  },
  attachments: [{
    name: String,
    type: String,
    dataUrl: String,
    fileSize: Number
  }],
  createdAt: { type: Date, default: Date.now }
});
const Complaint = mongoose.model("Complaint", ComplaintSchema);

// ================= AUTO SEED CSV FUNCTION =================
function parseCSVLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' && text[i+1] === '"') { cur += '"'; i++; }
    else if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
    else { cur += c; }
  }
  result.push(cur.trim());
  return result;
}

async function seedDatabaseFromCSV() {
  try {
    const count = await Case.countDocuments();
    if (count === 0) {
      console.log("No cases found in DB. Checking CSV dataset to seed...");
      const csvPath = path.join(__dirname, "CrimeIntel_AI - dataset.csv");
      if (fs.existsSync(csvPath)) {
        const fileContent = fs.readFileSync(csvPath, "utf-8");
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== "");
        const headers = parseCSVLine(lines[0]);

        const caseDocs = [];
        for (let i = 1; i < lines.length; i++) {
          const row = parseCSVLine(lines[i]);
          if (row.length < headers.length) continue;
          caseDocs.push({
            caseId: row[0],
            title: row[1],
            crimeType: row[2],
            description: row[3],
            location: row[4],
            date: row[5],
            keywords: row[6] ? row[6].split(",").map(s => s.trim()) : [],
            evidenceSummary: row[7] || "",
            evidenceCount: parseInt(row[8], 10) || 0,
            status: row[9] || "Under Investigation",
            priority: row[10] || "Open",
            firText: row[11] || "",
            suspectCount: parseInt(row[12], 10) || 0
          });
        }
        if (caseDocs.length > 0) {
          await Case.insertMany(caseDocs);
          console.log(` Successfully seeded ${caseDocs.length} cases from CSV into MongoDB Atlas!`);
        }
      }
    } else {
      console.log(` Database already contains ${count} cases. Ready to serve.`);
    }
  } catch (err) {
    console.error("Auto-seeding error:", err.message);
  }
}

// ================= API ENDPOINTS =================

// Auth Endpoints
app.post("/api/signup", async (req, res) => {
  try {
    const { fullName, role, phone, email, password } = req.body;
    if (!fullName || !role || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (role === "Police Officer" && email) {
      const existing = await User.findOne({ email, role: "Police Officer" });
      if (existing) return res.status(400).json({ error: "Email already registered for Police Officer." });
    } else if (phone) {
      const existing = await User.findOne({ phone, role: "Citizen" });
      if (existing) return res.status(400).json({ error: "Phone number already registered for Citizen." });
    }
    const newUser = new User({ fullName, role, phone, email, password });
    await newUser.save();
    res.json({ message: "Registration successful! You can now sign in." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/signin", async (req, res) => {
  try {
    const { role, identifier, password } = req.body;
    const user = await User.findOne({
      role,
      password,
      $or: [{ email: identifier }, { phone: identifier }]
    });
    if (!user) return res.status(401).json({ error: "Invalid credentials or role." });
    res.json({
      message: "Login successful!",
      fullName: user.fullName,
      role: user.role,
      email: user.email,
      phone: user.phone
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cases Endpoints
app.get("/api/cases", async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/cases", async (req, res) => {
  try {
    const count = await Case.countDocuments();
    const caseId = req.body.caseId || `C${String(count + 1).padStart(3, "0")}`;
    const newCase = new Case({ ...req.body, caseId });
    await newCase.save();
    res.json({ message: "Case created successfully!", caseItem: newCase });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Evidence Endpoints
app.get("/api/evidence", async (req, res) => {
  try {
    const ev = await Evidence.find().sort({ createdAt: -1 });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/evidence", async (req, res) => {
  try {
    const item = new Evidence(req.body);
    await item.save();
    if (req.body.caseId) {
      await Case.findOneAndUpdate({ caseId: req.body.caseId }, { $inc: { evidenceCount: 1 } });
    }
    res.json({ message: "Evidence logged successfully!", evidence: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Suspects Endpoints
app.get("/api/suspects", async (req, res) => {
  try {
    const suspects = await Suspect.find().sort({ createdAt: -1 });
    res.json(suspects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/suspects", async (req, res) => {
  try {
    const suspect = new Suspect(req.body);
    await suspect.save();
    if (req.body.caseId) {
      await Case.findOneAndUpdate({ caseId: req.body.caseId }, { $inc: { suspectCount: 1 } });
    }
    res.json({ message: "Suspect recorded successfully!", suspect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complaints Endpoints
app.get("/api/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/complaints", async (req, res) => {
  try {
    const count = await Complaint.countDocuments();
    const appId = `CI-2026-${String(count + 1).padStart(4, "0")}`;
    const newComplaint = new Complaint({ ...req.body, applicationId: appId });
    await newComplaint.save();
    res.json({ message: "Complaint filed successfully!", applicationId: appId, complaint: newComplaint });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server & Connect Database
const PORT = process.env.PORT || 5000;
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log(">>> MongoDB Connected Successfully! <<<");
    await seedDatabaseFromCSV();
    app.listen(PORT, () => {
      console.log(`>>> CrimeIntel Server running on http://localhost:${PORT} <<<`);
    });
  })
  .catch((err) => console.error("MongoDB Connection Error:", err));