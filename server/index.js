import express from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const uploadsDir = path.join(rootDir, "uploads");
await mkdir(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const safeBase = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${safeBase || "dashboard"}-${Date.now()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    callback(null, allowed.includes(file.mimetype));
  },
});

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/upload", upload.single("screenshot"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "A PNG, JPG, or WEBP screenshot is required." });
    return;
  }

  res.status(201).json({
    message: "Upload complete",
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    },
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "Screenshot exceeds the 10 MB limit." });
    return;
  }
  res.status(500).json({ error: error.message || "Unexpected upload error." });
});

app.listen(port, () => {
  console.log(`Upload server listening on http://localhost:${port}`);
});
