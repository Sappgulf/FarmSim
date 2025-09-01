import React from "react";

function MinimalTest() {
  return (
    <div style={{padding: "20px", background: "white", color: "black"}}>
      <h1>MINIMAL TEST</h1>
      <p>If you see this, React is working!</p>
      <button onClick={() => alert("Button works!")}>Test Button</button>
    </div>
  );
}

export default MinimalTest;
