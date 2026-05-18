import React from "react";
import ScreenshotUploader from "./components/ScreenshotUploader.jsx";
import { futuristicTheme, toCssVars } from "./theme.js";

export default function App() {
  return (
    <main className="app-shell min-h-screen px-6 py-10" style={toCssVars(futuristicTheme)}>
      <div className="mx-auto max-w-7xl">
        <ScreenshotUploader />
      </div>
    </main>
  );
}
