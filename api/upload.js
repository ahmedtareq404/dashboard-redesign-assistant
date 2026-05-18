import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    const form = await request.formData();
    const file = form.get("screenshot");

    if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type)) {
      return Response.json(
        { error: "A PNG, JPG, or WEBP screenshot is required." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "Screenshot exceeds the 10 MB limit." },
        { status: 413 },
      );
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();
    const blob = await put(`screenshots/${safeName || "dashboard.png"}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return Response.json(
      {
        message: "Upload complete",
        file: {
          originalName: file.name,
          filename: blob.pathname,
          mimetype: file.type,
          size: file.size,
          url: blob.url,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      { error: error?.message || "Unexpected upload error." },
      { status: 500 },
    );
  }
}

