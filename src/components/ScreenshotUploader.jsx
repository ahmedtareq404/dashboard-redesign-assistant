import React, { useRef, useState } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function ScreenshotUploader() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  function selectFile(nextFile) {
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.includes(nextFile.type)) {
      setError("Use a PNG, JPG, or WEBP screenshot.");
      return;
    }
    if (nextFile.size > MAX_SIZE) {
      setError("Keep screenshots under 10 MB.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setUploadedUrl("");
    setProgress(0);
    setStatus("ready");
    setError("");
  }

  function uploadFile() {
    if (!file) return;
    const formData = new FormData();
    formData.append("screenshot", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onloadstart = () => setStatus("uploading");
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        setUploadedUrl(response.file.url);
        setProgress(100);
        setStatus("success");
        return;
      }
      setStatus("error");
      try {
        const response = JSON.parse(xhr.responseText);
        setError(response.error || "Upload failed. Please try again.");
      } catch {
        setError("Upload failed. Please try again.");
      }
    };
    xhr.onerror = () => {
      setStatus("error");
      setError("Network error while uploading.");
    };
    xhr.send(formData);
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl("");
    setUploadedUrl("");
    setProgress(0);
    setStatus("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="glass-panel p-6">
        <div className="mb-6">
          <p className="eyebrow text-[var(--accent-cyan)]">Screenshot intake</p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">Upload dashboard screenshot</h1>
          <p className="mt-2 text-[var(--text-muted)]">Drop a dashboard capture, preview it instantly, then send it to the backend pipeline.</p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files?.[0]);
          }}
          className={`flex min-h-[280px] w-full flex-col items-center justify-center rounded-[var(--radius-panel)] border border-dashed p-6 text-center transition ${
            isDragging ? "border-cyan-200 bg-cyan-200/10" : "border-white/15 bg-white/[0.03] hover:border-cyan-200/50 hover:bg-white/[0.05]"
          }`}
        >
          <div className="neon-pill mb-4 p-4 text-slate-950">
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M5 20h14" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[var(--text)]">Drag & drop your screenshot here</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">or click to browse · PNG, JPG, WEBP · max 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => selectFile(event.target.files?.[0])}
          />
        </button>

        {error && <p className="mt-4 text-sm text-[var(--accent-rose)]">{error}</p>}

        <div className="inner-panel mt-5 p-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="truncate text-[var(--text)]">{file?.name ?? "No screenshot selected"}</span>
            <span className="shrink-0 text-[var(--text-muted)]">{file ? formatBytes(file.size) : "Waiting"}</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={uploadFile} disabled={!file || status === "uploading"} className="neon-pill px-4 py-2 text-sm font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
              {status === "uploading" ? "Uploading..." : "Upload screenshot"}
            </button>
            <button type="button" onClick={reset} className="rounded-[var(--radius-pill)] border border-white/10 px-4 py-2 text-sm text-[var(--text-muted)] transition hover:border-white/25 hover:text-[var(--text)]">
              Reset
            </button>
          </div>
        </div>
      </div>

      <aside className="glass-panel p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text)]">Preview</h2>
          <span className="rounded-[var(--radius-pill)] bg-white/10 px-3 py-1 text-xs text-[var(--text-muted)]">
            {status === "success" ? "Uploaded" : status === "uploading" ? `${progress}%` : "Waiting"}
          </span>
        </div>
        <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-[var(--radius-panel)] border border-white/10 bg-black/20">
          {previewUrl ? (
            <img src={previewUrl} alt="Dashboard screenshot preview" className="h-full w-full object-cover" />
          ) : (
            <div className="px-8 text-center text-[var(--text-muted)]">
              <div className="mx-auto mb-4 h-20 w-28 rounded-[var(--radius-inner)] border border-white/10 bg-white/[0.03]" />
              <p>Your dashboard preview will appear here.</p>
            </div>
          )}
        </div>
        {uploadedUrl && <p className="mt-4 text-sm text-[var(--accent-green)]">Upload complete. Stored at {uploadedUrl}</p>}
      </aside>
    </section>
  );
}


