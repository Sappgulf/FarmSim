import React from 'react';

const TutorialOverlay = ({ 
  isVisible, 
  step, 
  totalSteps, 
  title, 
  content, 
  onNext, 
  onPrevious, 
  onSkip,
  position = 'center'
}) => {
  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'left-4 top-1/2 transform -translate-y-1/2';
      case 'right':
        return 'right-4 top-1/2 transform -translate-y-1/2';
      default:
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto" onClick={onSkip}></div>
      
      {/* Tutorial card */}
      <div className={`absolute pointer-events-auto ${getPositionClasses()}`}>
        <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-200 max-w-sm w-full mx-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{title}</h3>
              <div className="text-sm opacity-90">
                {step + 1} / {totalSteps}
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-gray-700 mb-4">{content}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              ></div>
            </div>
            
            {/* Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip Tutorial
              </button>
              
              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    onClick={onPrevious}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                  >
                    ← Previous
                  </button>
                )}
                
                <button
                  onClick={onNext}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  {step === totalSteps - 1 ? 'Finish' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pointer arrow */}
        {position !== 'center' && (
          <div className={`absolute w-0 h-0 ${
            position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-white' :
            position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-white' :
            position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-white' :
            'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-white'
          }`} />
        )}
      </div>
    </div>
  );
};

export default TutorialOverlay;
