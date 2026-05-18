# Vercel deployment notes

This project is now shaped for Vercel hosting:

- the Vite frontend builds as a static app
- `api/upload.js` handles screenshot uploads as a Vercel Function
- uploaded files are stored in Vercel Blob rather than local disk

## Required environment

Create a Vercel Blob store and expose the generated `BLOB_READ_WRITE_TOKEN` in the project environment before testing uploads.

## Local vs hosted

- local dev can still use `server/index.js` if you want the Express + Multer flow
- hosted Vercel deployments should use `api/upload.js`

The hosted upload path remains `/api/upload`, so the React uploader does not need to change between environments.
