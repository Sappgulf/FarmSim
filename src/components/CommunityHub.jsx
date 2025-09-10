import React, { useState } from 'react';

// Simple Card component to avoid import issues
const Card = ({ className = "", children, ...props }) => (
  <div
    className={`rounded-xl border border-slate-200/60 bg-white/90 backdrop-blur-sm text-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

const CommunityHub = ({ 
  community, 
  gameState, 
  onTradeWithNeighbor, 
  onParticipateInEvent, 
  onVisitFarm,
  onStartChallenge 
}) => {
  const [activeTab, setActiveTab] = useState('neighbors');
  const [selectedNeighbor, setSelectedNeighbor] = useState(null);
  const [tradeOffer, setTradeOffer] = useState({});
  const [tradeRequest, setTradeRequest] = useState({});

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const renderNeighbors = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(community.neighbors).map(([id, neighbor]) => (
          <Card key={id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedNeighbor({ id, ...neighbor })}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{neighbor.emoji}</span>
              <div>
                <h3 className="font-bold text-lg">{neighbor.name}</h3>
                <p className="text-sm text-gray-600">{neighbor.owner}</p>
              </div>
            </div>
            
            <p className="text-sm mb-3">{neighbor.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Relationship:</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${neighbor.relationship}%` }}
                  />
                </div>
                <span className="text-xs">{neighbor.relationship.toFixed(2)}%</span>
              </div>
              
              {neighbor.tradeCooldown > 0 && (
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  Cooldown: {neighbor.tradeCooldown}
                </span>
              )}
            </div>
            
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">Specialty: {neighbor.specialty}</div>
              <div className="text-xs">
                <span className="text-green-600">Produces: </span>
                {neighbor.producesWell.slice(0, 2).join(', ')}
                {neighbor.producesWell.length > 2 && '...'}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedNeighbor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             onClick={() => setSelectedNeighbor(null)}>
          <Card className="w-full max-w-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedNeighbor.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold">{selectedNeighbor.name}</h2>
                  <p className="text-gray-600">{selectedNeighbor.owner}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNeighbor(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Neighbor Info */}
              <div>
                <h3 className="font-bold mb-2">Farm Information</h3>
                <p className="text-sm mb-3">{selectedNeighbor.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div><strong>Specialty:</strong> {selectedNeighbor.specialty}</div>
                  <div><strong>Trading Style:</strong> {selectedNeighbor.tradingStyle}</div>
                  <div className="flex items-center gap-2">
                    <strong>Relationship:</strong>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${selectedNeighbor.relationship}%` }}
                      />
                    </div>
                    <span>{selectedNeighbor.relationship.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Available Inventory:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(selectedNeighbor.inventory).map(([item, quantity]) => (
                      <div key={item} className="flex justify-between text-sm">
                        <span className="capitalize">{item.replace('_', ' ')}</span>
                        <span>{quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Currently Needs:</h4>
                  <div className="space-y-1">
                    {Object.entries(selectedNeighbor.currentNeeds).map(([item, quantity]) => (
                      <div key={item} className="flex justify-between text-sm">
                        <span className="capitalize text-orange-600">{item.replace('_', ' ')}</span>
                        <span>{quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trading Interface */}
              <div>
                <h3 className="font-bold mb-2">Trade</h3>
                
                {selectedNeighbor.tradeCooldown > 0 ? (
                  <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-center">
                    Trade available in {selectedNeighbor.tradeCooldown} cycles
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">You Offer:</h4>
                      <div className="space-y-2">
                        {Object.entries(gameState.inventory || {}).map(([item, quantity]) => (
                          quantity > 0 && (
                            <div key={item} className="flex items-center gap-2">
                              <span className="text-sm flex-1 capitalize">{item.replace('_', ' ')}</span>
                              <input 
                                type="number" 
                                min="0" 
                                max={quantity}
                                className="w-16 px-2 py-1 border rounded text-sm"
                                placeholder="0"
                                onChange={(e) => setTradeOffer({
                                  ...tradeOffer,
                                  [item]: parseInt(e.target.value) || 0
                                })}
                              />
                              <span className="text-xs text-gray-500">/{quantity}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">You Request:</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedNeighbor.inventory).map(([item, quantity]) => (
                          quantity > 0 && (
                            <div key={item} className="flex items-center gap-2">
                              <span className="text-sm flex-1 capitalize">{item.replace('_', ' ')}</span>
                              <input 
                                type="number" 
                                min="0" 
                                max={quantity}
                                className="w-16 px-2 py-1 border rounded text-sm"
                                placeholder="0"
                                onChange={(e) => setTradeRequest({
                                  ...tradeRequest,
                                  [item]: parseInt(e.target.value) || 0
                                })}
                              />
                              <span className="text-xs text-gray-500">/{quantity}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const result = onTradeWithNeighbor(selectedNeighbor.id, tradeOffer, tradeRequest);
                        if (result.success) {
                          setSelectedNeighbor(null);
                          setTradeOffer({});
                          setTradeRequest({});
                        }
                      }}
                      className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      disabled={Object.keys(tradeOffer).length === 0 || Object.keys(tradeRequest).length === 0}
                    >
                      Propose Trade
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderMarketEvents = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🏪 Farmer's Market Events</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm">Community Points:</span>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
            {community.communityPoints}
          </span>
        </div>
      </div>

      {community.activeMarketEvents.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-2">No active market events</p>
          <p className="text-sm text-gray-400">Check back in 15 minutes for new events!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {community.activeMarketEvents.map((event, index) => {
            const timeLeft = event.endTime - Date.now();
            const isActive = timeLeft > 0;
            
            return (
              <Card key={index} className={`p-4 ${isActive ? 'border-green-500' : 'border-gray-300 opacity-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{event.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isActive ? formatTime(timeLeft) : 'Ended'}
                  </span>
                </div>

                <p className="text-sm mb-4">{event.description}</p>

                {event.bonuses && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Active Bonuses:</h4>
                    <div className="space-y-1">
                      {Object.entries(event.bonuses).map(([bonus, value]) => (
                        <div key={bonus} className="text-xs flex justify-between">
                          <span className="capitalize">{bonus.replace('_', ' ')}</span>
                          <span className="text-green-600">+{Math.round((value - 1) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isActive && (
                  <button 
                    onClick={() => onParticipateInEvent(event.id, 10)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Participate (+20 Community Points)
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFarmTours = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">🚌 Farm Tours</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sample tour destinations */}
        {[
          {
            id: "rainbow_acres",
            name: "🌈 Rainbow Acres",
            owner: "Iris Bloom",
            theme: "colorful_crops",
            features: ["flower_gardens", "rainbow_vegetables", "butterfly_sanctuary"],
            inspiration_bonus: "crop_variety",
            visit_cost: 50,
            rewards: { inspiration_points: 25, flower_seeds: 10 },
            description: "A vibrant farm showcasing crops in every color of the rainbow"
          },
          {
            id: "clockwork_farm",
            name: "⚙️ Clockwork Precision Farm",
            owner: "Gears McGillicuddy",
            theme: "automation",
            features: ["robot_harvesters", "automated_irrigation", "ai_planning"],
            inspiration_bonus: "automation_efficiency",
            visit_cost: 100,
            rewards: { automation_blueprints: 3, efficiency_boost: 7 },
            description: "A marvel of agricultural automation and precision"
          },
          {
            id: "heritage_homestead",
            name: "🏚️ Heritage Homestead",
            owner: "Grandpa Wilkins",
            theme: "traditional",
            features: ["heirloom_varieties", "traditional_tools", "old_techniques"],
            inspiration_bonus: "crop_resilience",
            visit_cost: 25,
            rewards: { heirloom_seeds: 15, wisdom_points: 30 },
            description: "A traditional farm preserving ancient farming wisdom"
          },
          {
            id: "university_research",
            name: "🎓 University Research Station",
            theme: "education",
            features: ["research_labs", "experimental_plots", "student_projects"],
            learning_bonus: "research_efficiency",
            visit_cost: 75,
            rewards: { research_points: 100, knowledge_certificate: 1 },
            description: "Learn cutting-edge agricultural science"
          }
        ].map((farm, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{farm.name}</h3>
              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Cost: ${farm.visit_cost}
              </span>
            </div>

            <p className="text-sm mb-3">{farm.description}</p>

            <div className="mb-3">
              <h4 className="font-semibold text-sm mb-1">Features:</h4>
              <div className="flex flex-wrap gap-1">
                {farm.features.map((feature, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {feature.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1">Rewards:</h4>
              <div className="text-xs space-y-1">
                {Object.entries(farm.rewards).map(([reward, amount]) => (
                  <div key={reward} className="flex justify-between">
                    <span className="capitalize">{reward.replace('_', ' ')}</span>
                    <span className="text-green-600">+{amount}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onVisitFarm(farm.id)}
              className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors"
              disabled={community.completedTours?.includes(farm.id)}
            >
              {community.completedTours?.includes(farm.id) ? 'Already Visited' : 'Visit Farm'}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderChallenges = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🤝 Cooperative Challenges</h2>
        <span className="text-sm text-gray-600">Team up with the community!</span>
      </div>

      {community.activeChallenges?.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">No active challenges</p>
          <button 
            onClick={() => onStartChallenge('supply_drive')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Community Supply Drive
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {community.activeChallenges?.map((challenge, index) => (
            <Card key={index} className="p-4 border-blue-500">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{challenge.name}</h3>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {formatTime(challenge.endTime - Date.now())} left
                </span>
              </div>

              <p className="text-sm mb-4">{challenge.description}</p>

              <div className="space-y-2 mb-4">
                <h4 className="font-semibold text-sm">Progress:</h4>
                {Object.entries(challenge.goals).map(([goal, target]) => (
                  <div key={goal} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize">{goal.replace('_', ' ')}</span>
                      <span>{challenge.progress?.[goal] || 0}/{target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, ((challenge.progress?.[goal] || 0) / target) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                Contribute to Challenge
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        {[
          { id: 'neighbors', label: '👥 Neighbors', icon: '🏡' },
          { id: 'market', label: '🏪 Market Events', icon: '🎪' },
          { id: 'tours', label: '🚌 Farm Tours', icon: '🌟' },
          { id: 'challenges', label: '🤝 Challenges', icon: '🏆' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-4 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'neighbors' && renderNeighbors()}
        {activeTab === 'market' && renderMarketEvents()}
        {activeTab === 'tours' && renderFarmTours()}
        {activeTab === 'challenges' && renderChallenges()}
      </div>
    </div>
  );
};

export default CommunityHub;
