import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function FarmSimTest() {
  const [coins, setCoins] = useState(100);
  const [message, setMessage] = useState("Testing farm simulation...");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌾 Farm Sim Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>Coins: {coins}🪙</div>
              <div>{message}</div>
              <Button 
                onClick={() => {
                  setCoins(c => c + 10);
                  setMessage("Farm is working!");
                }}
              >
                Test Button
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
