                >
                  {plots.map((p, i) => <PlotCard key={i} p={p} i={i} />)}
                </div>
              </CardContent>
            </Card>

            {/* Level Status */}
            {levelStatus !== "playing" && level && (
              <Card className={`border-4 ${levelStatus === 'won' ? 'border-emerald-400 bg-emerald-50/50' : 'border-red-400 bg-red-50/50'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${levelStatus === 'won' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {levelStatus === 'won' ? <Trophy size={24}/> : <AlertTriangle size={24}/>}
                    {levelStatus === 'won' ? '🎉 Goal Complete!' : '⏰ Time\'s Up!'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {levelStatus === 'won' ? (
                    <div className="text-emerald-700">
                      🎊 Congratulations! You reached {level.targetCoins}🪙 and earned {level.reward}🪙 bonus!
                      Your farming skills are improving!
                    </div>
                  ) : (
                    <div className="text-red-700">
                      ⏱️ Time expired! You earned {coins}🪙 out of {level.targetCoins}🪙 needed.
                      Keep practicing your farming techniques!
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        const L = LEVELS.find(l => l.id === levelId);
                        if (L) {
                          setLevelEndsAt(nowSec() + L.minutes * 60);
                          setLevelStartedAt(nowSec());
                          setLevelStatus("playing");
                          addLog("🔄 Timer restarted!");
                        }
                      }}
                      className="flex-1"
                    >
                      🔄 Try Again
                    </Button>
                    {levelStatus === 'won' && levelId !== 'endless' && (
                      <Button 
                        onClick={() => {
                          const nextLevel = LEVELS.find(l => l.id === `lvl${parseInt(levelId.slice(3)) + 1}`);
                          if (nextLevel) {
                            setCoins(c => c + level.reward);
                            setLevelId(nextLevel.id);
                            setLevelEndsAt(nowSec() + nextLevel.minutes * 60);
                            setLevelStartedAt(nowSec());
                            setLevelStatus("playing");
                            addLog(`🚀 Advanced to ${nextLevel.label}!`);
                          }
                        }}
                        variant="secondary"
                        className="flex-1"
                      >
                        🚀 Next Level
                      </Button>
                    )}
                  </div>
                </CardContent>
