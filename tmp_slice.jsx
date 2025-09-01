                    ))}
                  </TabsList>
                  
                  {LEVELS.map(L => (
                    <TabsContent key={L.id} value={L.id} className="text-sm space-y-2">
                      <div className="bg-slate-100/80 backdrop-blur-sm rounded-lg p-3 border">
                        <div className="font-semibold">{L.label}</div>
                        <div className="text-xs opacity-70 mt-1">
                          Target: <span className="font-bold text-emerald-600">{L.targetCoins}🪙</span> • 
                          Time: <span className="font-bold text-blue-600">{L.minutes === 9999 ? "∞" : `${L.minutes}min`}</span>
                          {L.reward > 0 && (
                            <> • Reward: <span className="font-bold text-purple-600">{L.reward}🪙</span></>
                          )}
                        </div>
                        <div className="text-xs opacity-60 mt-1">Difficulty: {L.difficulty}</div>
                        
                        {/* Progress bar for current level */}
                        {L.id === levelId && L.id !== "endless" && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress: {coins}/{L.targetCoins}🪙</span>
                              <span>{Math.round((coins / L.targetCoins) * 100)}%</span>
                            </div>
