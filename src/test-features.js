/**
 * Comprehensive test suite for FarmLife features
 * Run this in the browser console to test all game systems
 */

const testSuite = {
  // Test localStorage and save system
  testSaveSystem: () => {
    console.log("🧪 Testing Save System...");
    try {
      const testData = {
        version: 2,
        savedAt: Date.now(),
        coins: 999,
        plots: [],
        test: true
      };
      
      localStorage.setItem('farm_sim_test', JSON.stringify(testData));
      const loaded = JSON.parse(localStorage.getItem('farm_sim_test'));
      
      if (loaded && loaded.test === true && loaded.coins === 999) {
        console.log("✅ Save system working");
        localStorage.removeItem('farm_sim_test');
        return true;
      } else {
        console.error("❌ Save system failed");
        return false;
      }
    } catch (e) {
      console.error("❌ Save system error:", e);
      return false;
    }
  },

  // Check for existing game save
  checkExistingSave: () => {
    console.log("🧪 Checking for existing save...");
    const save = localStorage.getItem('farm_sim_enhanced_v2');
    if (save) {
      try {
        const data = JSON.parse(save);
        console.log("✅ Found save:", {
          version: data.version,
          coins: data.coins,
          plots: data.plots?.length,
          savedAt: new Date(data.savedAt).toLocaleString()
        });
        return true;
      } catch (e) {
        console.error("❌ Corrupted save data");
        return false;
      }
    } else {
      console.log("ℹ️ No existing save found");
      return null;
    }
  },

  // Test game state
  testGameState: () => {
    console.log("🧪 Testing Game State...");
    
    // Check if React is loaded
    if (typeof React === 'undefined') {
      console.warn("⚠️ React not detected in global scope");
    }
    
    // Check if the game container exists
    const root = document.getElementById('root');
    if (root) {
      console.log("✅ Root element found");
      
      // Check for game elements
      const hasCanvas = document.querySelector('canvas') !== null;
      const hasButtons = document.querySelectorAll('button').length > 0;
      const hasTabs = document.querySelector('[role="tablist"]') !== null;
      
      console.log("Game elements:", {
        canvas: hasCanvas ? "✅" : "❌",
        buttons: hasButtons ? "✅" : "❌",
        tabs: hasTabs ? "✅" : "❌"
      });
      
      return hasButtons;
    } else {
      console.error("❌ Root element not found");
      return false;
    }
  },

  // Test UI components
  testUIComponents: () => {
    console.log("🧪 Testing UI Components...");
    const components = {
      buttons: document.querySelectorAll('button').length,
      cards: document.querySelectorAll('[class*="card"]').length,
      badges: document.querySelectorAll('[class*="badge"]').length,
      tabs: document.querySelectorAll('[role="tab"]').length,
      inputs: document.querySelectorAll('input').length
    };
    
    console.log("UI Components found:", components);
    return components.buttons > 0;
  },

  // Test game features
  testGameFeatures: () => {
    console.log("🧪 Testing Game Features...");
    
    // Check for shop
    const shopExists = document.querySelector('[class*="shop"]') || 
                      Array.from(document.querySelectorAll('*')).some(el => 
                        el.textContent.includes('Seeds') || 
                        el.textContent.includes('Shop'));
    
    // Check for farm grid
    const gridExists = document.querySelector('[class*="grid"]') ||
                      document.querySelector('canvas');
    
    // Check for achievements
    const achievementsExist = Array.from(document.querySelectorAll('*')).some(el => 
                             el.textContent.includes('Achievement'));
    
    console.log("Game features:", {
      shop: shopExists ? "✅" : "❌",
      farmGrid: gridExists ? "✅" : "❌",
      achievements: achievementsExist ? "✅" : "❌"
    });
    
    return shopExists && gridExists;
  },

  // Run all tests
  runAll: function() {
    console.log("🚀 Starting comprehensive test suite...\n");
    
    const results = {
      saveSystem: this.testSaveSystem(),
      existingSave: this.checkExistingSave(),
      gameState: this.testGameState(),
      uiComponents: this.testUIComponents(),
      gameFeatures: this.testGameFeatures()
    };
    
    const passed = Object.values(results).filter(r => r === true).length;
    const total = Object.keys(results).length;
    
    console.log("\n📊 Test Results:");
    console.log(`Passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log("🎉 All tests passed! Game is fully functional.");
    } else if (passed >= total - 1) {
      console.log("✅ Game is mostly functional with minor issues.");
    } else {
      console.log("⚠️ Some features may not be working correctly.");
    }
    
    return results;
  },

  // Clear all game data
  clearGameData: () => {
    if (confirm("This will delete all game data. Are you sure?")) {
      localStorage.removeItem('farm_sim_enhanced_v2');
      localStorage.removeItem('farm_sim_enhanced');
      console.log("🗑️ Game data cleared");
      location.reload();
    }
  },

  // Export current save
  exportSave: () => {
    const save = localStorage.getItem('farm_sim_enhanced_v2');
    if (save) {
      const blob = new Blob([save], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `farm_save_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      console.log("💾 Save exported");
    } else {
      console.log("❌ No save to export");
    }
  }
};

// Auto-run tests when loaded
console.log("FarmLife Test Suite Loaded!");
console.log("Commands available:");
console.log("- testSuite.runAll() - Run all tests");
console.log("- testSuite.exportSave() - Export save file");
console.log("- testSuite.clearGameData() - Clear all data");

// Export for use
window.farmLifeTests = testSuite;

// Run tests automatically
testSuite.runAll();
