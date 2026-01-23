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
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-blue-800">👥 Social Hub</h3>
            <p className="text-sm text-blue-700">
              Reputation: {social.reputation} • Friends: {social.friends.length}
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Level {state.level}
          </Badge>
        </div>
      </Card>

      {/* Your Profile */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">📋 Your Profile</h4>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="font-bold text-green-600">{state.level}</div>
            <div className="text-green-700">Farm Level</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="font-bold text-blue-600">{social.reputation}</div>
            <div className="text-blue-700">Reputation</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="font-bold text-yellow-600">{state.coins}🪙</div>
            <div className="text-yellow-700">Total Coins</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <div className="font-bold text-purple-600">{state.xp} XP</div>
            <div className="text-purple-700">Experience</div>
          </div>
        </div>
      </Card>

      {/* Friends List */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">👫 Friends</h4>

        {mockFriends.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">No friends yet</p>
            <Button size="sm">
              🔍 Find Friends
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {mockFriends.map(friend => (
              <Card key={friend.id} className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">👤</div>
                    <div>
                      <div className="font-medium">{friend.name}</div>
                      <div className="text-xs text-gray-600">
                        Level {friend.level} • {friend.reputation} reputation
                      </div>
                    </div>
                  </div>
                  <Badge variant={friend.status === 'online' ? 'default' : 'outline'}>
                    {friend.status === 'online' ? '🟢 Online' : '⚪ Offline'}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  Last active: {friend.lastActive}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleVisitFarm(friend.id)}
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1"
                  >
                    🏠 Visit Farm
                  </Button>
                  <Button
                    onClick={() => handleSendGift(friend.id)}
                    size="sm"
                    variant="outline"
                    className="text-xs flex-1"
                    disabled={state.coins < 10}
                  >
                    🎁 Send Gift (10🪙)
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Leaderboard */}
      <Card className="p-4">
        <h4 className="font-semibold mb-3">🏆 Leaderboard</h4>

        <div className="space-y-2">
          {[...mockFriends]
            .sort((a, b) => b.reputation - a.reputation)
            .map((friend, index) => (
              <div key={friend.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 text-center">
                    #{index + 1}
                  </Badge>
                  <span className="font-medium">{friend.name}</span>
                </div>
                <span className="text-sm text-blue-600 font-semibold">
                  {friend.reputation} 🏆
                </span>
              </div>
            ))}
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
