import React from "react";

// Test just the component import without full rendering
console.log("Starting component import test...");

try {
  // Import the main component
  import('./src/components/FarmSimCanvas.jsx').then((module) => {
    console.log("✅ Component imported successfully:", module);
    console.log("Default export:", module.default);
  }).catch((error) => {
    console.error("❌ Component import failed:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  });
} catch (syncError) {
  console.error("❌ Synchronous error during import:", syncError);
}