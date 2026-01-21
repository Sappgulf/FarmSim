import React, { useState, useEffect } from "react";

function FarmSimCanvasSimple() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 100);
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl">Loading Simple Farm...</h1>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">🌾 Simple Farm Test 🌾</h1>
        <p className="text-xl">If you can see this, React is working!</p>
        <button 
          onClick={() => alert('Button works!')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default FarmSimCanvasSimple;