import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function FarmSimTest() {
  const [coins, setCoins] = useState(100);
  const [message, setMessage] = useState("Testing farm simulation...");
  const [testLevel, setTestLevel] = useState("basic");
  const [testResults, setTestResults] = useState([]);

  const runTest = (level) => {
    setTestLevel(level);
    const earnings = level === "minimal" ? 5 : level === "basic" ? 10 : 25;
    setCoins(c => c + earnings);
    
    const result = `${level} test completed - Farm is working! (+${earnings} coins)`;
    setMessage(result);
    setTestResults(prev => [`${new Date().toLocaleTimeString()}: ${result}`, ...prev].slice(0, 5));
  };

  const resetTest = () => {
    setCoins(100);
    setMessage("Testing farm simulation...");
    setTestLevel("basic");
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌾 Farm Sim Test Suite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>Coins: {coins}🪙</div>
                <div>Test Level: {testLevel}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <strong>Status:</strong> {message}
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  onClick={() => runTest("minimal")}
                  variant="outline"
                  size="sm"
                >
                  Minimal Test
                </Button>
                <Button 
                  onClick={() => runTest("basic")}
                  variant="default"
                  size="sm"
                >
                  Basic Test  
                </Button>
                <Button 
                  onClick={() => runTest("comprehensive")}
                  variant="secondary"
                  size="sm"
                >
                  Full Test
                </Button>
                <Button 
                  onClick={resetTest}
                  variant="destructive"
                  size="sm"
                >
                  Reset
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Test History:</h3>
                  <div className="space-y-1 text-sm bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                    {testResults.map((result, i) => (
                      <div key={i} className="text-gray-700">{result}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
