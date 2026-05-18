import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_SIZE = 10 * 1024 * 1024;

export const config = {
  runtime: "edge",
};

export default async function handler(request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const form = await request.formData();
  const file = form.get("screenshot");

  if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type)) {
    return new Response(JSON.stringify({ error: "A PNG, JPG, or WEBP screenshot is required." }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: "Screenshot exceeds the 10 MB limit." }), {
      status: 413,
      headers: { "content-type": "application/json" },
    });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
  const blob = await put(`screenshots/${safeName || "dashboard.png"}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return new Response(
    JSON.stringify({
      message: "Upload complete",
      file: {
        originalName: file.name,
        filename: blob.pathname,
        mimetype: file.type,
        size: file.size,
        url: blob.url,
      },
    }),
    {
      status: 201,
      headers: { "content-type": "application/json" },
    },
  );
}
