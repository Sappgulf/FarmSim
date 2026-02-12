import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FarmingSystem } from '../components/farm-sim/systems/FarmingSystem';

describe('FarmingSystem', () => {
    let farmingSystem;
    let mockGameState;
    let mockActions;

    beforeEach(() => {
        mockActions = {
            setCoins: vi.fn(),
            spendMoney: vi.fn(),
            earnMoney: vi.fn(),
            updatePlots: vi.fn(),
            setXp: vi.fn(),
            addXP: vi.fn(),
            updateInventory: vi.fn(),
            addNotification: vi.fn(),
        };

        mockGameState = {
            coins: 100,
            xp: 0,
            plots: Array(9).fill(null).map((_, i) => ({
                id: i,
                state: 'empty',
                soilFertility: 1.0,
                waterLevel: 50,
            })),
            inventory: {},
            weather: 'sunny',
            season: { config: { bonuses: { growthSpeed: 1.0 } } }
        };

        farmingSystem = new FarmingSystem(mockGameState, mockActions);
    });

    it('should plant a crop successfully', () => {
        const cropData = { id: 'carrot', cost: 10, growthTime: 10, name: 'Carrot' };

        const success = farmingSystem.plantCrop(0, cropData);

        expect(success).toBe(true);
        expect(mockActions.spendMoney).toHaveBeenCalledWith(10); // crop cost
        expect(mockActions.updatePlots).toHaveBeenCalled();

        // Verify call args
        const updateCall = mockActions.updatePlots.mock.calls[0][0];
        const updatedPlot = updateCall[0];
        expect(updatedPlot.state).toBe('planted');
        expect(updatedPlot.crop).toEqual(cropData);
        expect(updatedPlot.plantedAt).toBeDefined();
    });

    it('should fail to plant if insufficient funds', () => {
        mockGameState.coins = 5;
        farmingSystem = new FarmingSystem(mockGameState, mockActions); // Update with new state logic

        const cropData = { id: 'expensive_crop', cost: 50, growthTime: 10, name: 'Gold' };

        const success = farmingSystem.plantCrop(0, cropData);

        expect(success).toBe(false);
        expect(mockActions.spendMoney).not.toHaveBeenCalled();
    });

    it('should reduce planting seed cost with precision hoe', () => {
        mockGameState.inventory = { precision_hoe: 1 };
        farmingSystem = new FarmingSystem(mockGameState, mockActions);

        const cropData = { id: 'corn', cost: 25, growthTime: 10, name: 'Corn' };
        const success = farmingSystem.plantCrop(0, cropData);

        expect(success).toBe(true);
        expect(mockActions.spendMoney).toHaveBeenCalledWith(22);
    });

    it('should harvest a ready crop', () => {
        // Setup a ready plot
        mockGameState.plots[0] = {
            state: 'ready',
            crop: { id: 'carrot', baseValue: 20 },
            soilFertility: 1.0
        };
        farmingSystem = new FarmingSystem(mockGameState, mockActions);

        const success = farmingSystem.harvestCrop(0);

        expect(success).toBe(true);

        // Check earnings (base value × harvest multiplier)
        expect(mockActions.earnMoney).toHaveBeenCalledWith(24, 'harvest');

        // Check plot clear
        const updateCall = mockActions.updatePlots.mock.calls[0][0];
        const updatedPlot = updateCall[0];
        expect(updatedPlot.state).toBe('empty');
        expect(updatedPlot.crop).toBeNull();
    });

    it('should not harvest a growing crop', () => {
        mockGameState.plots[0] = {
            state: 'growing',
            crop: { id: 'carrot' },
        };
        farmingSystem = new FarmingSystem(mockGameState, mockActions);

        const success = farmingSystem.harvestCrop(0);

        expect(success).toBe(false);
        expect(mockActions.earnMoney).not.toHaveBeenCalled();
    });

    it('should auto-harvest up to two ready plots when drone harvester is owned', () => {
        const now = Date.now();
        mockGameState.inventory = { drone_harvester: 1 };
        mockGameState.plots[0] = { state: 'ready', crop: { id: 'carrot', baseValue: 20, name: 'Carrot', emoji: '🥕' }, soilFertility: 1.0 };
        mockGameState.plots[1] = { state: 'ready', crop: { id: 'potato', baseValue: 18, name: 'Potato', emoji: '🥔' }, soilFertility: 1.0 };
        mockGameState.plots[2] = { state: 'ready', crop: { id: 'corn', baseValue: 16, name: 'Corn', emoji: '🌽' }, soilFertility: 1.0 };
        farmingSystem = new FarmingSystem(mockGameState, mockActions);

        vi.useFakeTimers();
        vi.setSystemTime(now);
        farmingSystem.update(mockGameState);
        vi.setSystemTime(now + 16000);
        farmingSystem.update(mockGameState);

        expect(mockActions.earnMoney).toHaveBeenCalledTimes(2);
        expect(mockActions.addNotification).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it('should calculate growth correctly in update loop', () => {
        const now = Date.now();
        const plantedTime = now - 5000; // 5 seconds ago

        mockGameState.weather = 'cloudy'; // 1.0 growth modifier
        mockGameState.plots[0] = {
            state: 'growing',
            crop: { id: 'fast_crop', growthTime: 10 }, // 10 sec growth
            plantedAt: plantedTime,
            waterLevel: 100,
            soilFertility: 1.0
        };
        farmingSystem = new FarmingSystem(mockGameState, mockActions);

        // Run update logic
        // We can't easily mock Date.now() inside the class without dependency injection or global mock,
        // but the class uses Date.now().
        // Vitest can mock system time.

        vi.useFakeTimers();
        vi.setSystemTime(now); // Sync

        farmingSystem.update(mockGameState);

        // Should trigger updatePlots with progress ~0.5
        expect(mockActions.updatePlots).toHaveBeenCalled();
        const updateCall = mockActions.updatePlots.mock.calls[0][0];
        const updatedPlot = updateCall[0];

        // 5s / 10s = 0.5 progress (approx)
        expect(updatedPlot.progress).toBeCloseTo(0.5, 1);

        vi.useRealTimers();
    });
});
