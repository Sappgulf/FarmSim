import React, { memo, useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Card } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Progress } from '../../../ui/progress';

const SocialTab = memo(() => {
  const { state, actions } = useGame();

  // Ensure social state exists
  const social = state.social || { friends: [], reputation: 0, marketListings: [] };

  // Mock friends data (in real game, this would come from state)
  const mockFriends = [
    { id: 1, name: 'Farmer Joe', level: 5, reputation: 120, status: 'online', lastActive: 'now' },
    { id: 2, name: 'Green Thumb', level: 8, reputation: 250, status: 'offline', lastActive: '2h ago' },
    { id: 3, name: 'Crop Master', level: 12, reputation: 450, status: 'online', lastActive: 'now' }
  ];

  const handleSendGift = (friendId) => {
    if (state.coins >= 10) {
      actions.setCoins(state.coins - 10);
      actions.addNotification({
        message: 'Gift sent! Your friend will be notified.',
        type: 'success'
      });
    } else {
      actions.addNotification({
        message: 'Not enough coins to send gift!',
        type: 'error'
      });
    }
  };

  const handleVisitFarm = (friendId) => {
    actions.addNotification({
      message: 'Visiting friend\'s farm...',
      type: 'info'
    });
  };

  return (
    <div className="space-y-4">
      {/* Social Overview */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl pointer-events-none">👥</div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <span className="bg-blue-100 p-2 rounded-lg">👥</span> Social Hub
            </h3>
            <p className="text-sm text-blue-700 mt-1">Connect, help friends, and climb the ranks!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Your Reputation</div>
              <div className="text-2xl font-bold text-blue-800">{social.reputation} 🌟</div>
            </div>
            <div className="h-10 w-px bg-blue-200"></div>
            <div className="text-right">
              <div className="text-sm text-blue-600 font-medium">Friends</div>
              <div className="text-2xl font-bold text-blue-800">{social.friends.length}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Your Profile */}
      <Card className="p-5 border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">📋</span> Your Farmer Profile
        </h4>

        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="text-2xl mb-1">🧑‍🌾</div>
            <div className="font-bold text-green-700 text-lg">{state.level}</div>
            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Level</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="text-2xl mb-1">🌟</div>
            <div className="font-bold text-blue-700 text-lg">{social.reputation}</div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Rep</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="text-2xl mb-1">💰</div>
            <div className="font-bold text-yellow-700 text-lg">{state.coins}</div>
            <div className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Coins</div>
          </div>
          <div className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-xl border border-purple-100">
            <div className="text-2xl mb-1">✨</div>
            <div className="font-bold text-purple-700 text-lg">{state.xp}</div>
            <div className="text-xs font-semibold text-purple-600 uppercase tracking-wide">XP</div>
          </div>
        </div>
      </Card>

      {/* Friends List */}
      <Card className="p-5 border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="text-xl">👫</span> Friends List
          </h4>
          <Button size="sm" variant="outline" className="text-xs">
            🔍 Find Friends
          </Button>
        </div>

        {mockFriends.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="text-4xl mb-3 opacity-50">👥</div>
            <p className="text-gray-500 font-medium">No friends yet</p>
            <p className="text-sm text-gray-400 mb-4">Add friends to visit their farms!</p>
            <Button size="sm">Add Frinds</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockFriends.map(friend => (
              <Card key={friend.id} className="p-4 hover:shadow-md transition-shadow border-gray-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-xl border border-blue-200 shadow-inner">
                      👤
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{friend.name}</div>
                      <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Lvl {friend.level}</span>
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <span className="text-[10px]">⭐</span> {friend.reputation}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={friend.status === 'online' ? 'default' : 'secondary'} className={friend.status === 'online' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {friend.status === 'online' ? '● Online' : '○ Offline'}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => handleVisitFarm(friend.id)}
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    🏠 Visit
                  </Button>
                  <Button
                    onClick={() => handleSendGift(friend.id)}
                    size="sm"
                    variant="outline"
                    className="flex-1 h-8 text-xs border-pink-200 text-pink-700 hover:bg-pink-50"
                    disabled={state.coins < 10}
                  >
                    🎁 Gift (10🪙)
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Leaderboard */}
      <Card className="p-5 border-gray-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-5 text-8xl pointer-events-none -rotate-12">🏆</div>
        <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
          <span className="text-xl">🏆</span> Global Leaderboard
        </h4>

        <div className="space-y-2 relative z-10">
          {[...mockFriends]
            .sort((a, b) => b.reputation - a.reputation)
            .map((friend, index) => {
              let rankStyle = "bg-gray-50 border-gray-100";
              let rankIcon = `#${index + 1}`;

              if (index === 0) {
                rankStyle = "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 ring-1 ring-yellow-100";
                rankIcon = "🥇";
              } else if (index === 1) {
                rankStyle = "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200";
                rankIcon = "🥈";
              } else if (index === 2) {
                rankStyle = "bg-gradient-to-r from-orange-50 to-amber-50/50 border-orange-200";
                rankIcon = "🥉";
              }

              return (
                <div key={friend.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all hover:scale-[1.01] ${rankStyle}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">
                      {rankIcon}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{friend.name}</div>
                      <div className="text-xs text-gray-500">Farmer Level {friend.level}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-700">{friend.reputation}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Reputation</div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Community Events */}
      <Card className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
        <h4 className="font-semibold mb-3 text-orange-800">🎪 Community Events</h4>

        <div className="space-y-2">
          <div className="p-3 border border-orange-200 rounded bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">🌾 Harvest Competition</div>
                <div className="text-sm text-gray-600">Harvest the most crops to win!</div>
              </div>
              <Badge className="bg-orange-500">Active</Badge>
            </div>
            <div className="text-xs text-gray-500 mb-2">Ends in: 2 days</div>
            <Progress value={45} className="h-2 mb-2" />
            <div className="text-xs text-gray-600">Prize: 500🪙 + Rare Seeds</div>
          </div>

          <div className="p-3 border border-gray-200 rounded bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">💎 Farm of the Week</div>
                <div className="text-sm text-gray-600">Showcase your farm!</div>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
            <div className="text-xs text-gray-500">Starts in: 5 days</div>
          </div>
        </div>
      </Card>

      {/* Social Tips */}
      <Card className="p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">💡 Social Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Send gifts to friends to increase reputation</li>
          <li>• Visit friend farms to get inspiration</li>
          <li>• Participate in events to climb the leaderboard</li>
          <li>• Higher reputation unlocks exclusive items</li>
        </ul>
      </Card>
    </div>
  );
});

SocialTab.displayName = 'SocialTab';
export default SocialTab;
