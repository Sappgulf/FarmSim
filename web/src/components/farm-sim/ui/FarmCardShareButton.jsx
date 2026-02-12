import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { useGameActions, useGameStore } from '../context/GameContext';
import { exportFarmCard } from '../../../utils/farmCard';

const FarmCardShareButton = ({
  label = 'Share Farm',
  size = 'sm',
  variant = 'default',
  className = '',
}) => {
  const actions = useGameActions();
  const store = useGameStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = async () => {
    if (isExporting) return;
    setIsExporting(true);
    actions.addNotification({ message: 'Preparing your Farm Card…', type: 'info' });

    try {
      // Read the latest snapshot at click-time without subscribing this component to state churn.
      await exportFarmCard(store.getState());
      actions.addNotification({ message: '📸 Farm Card saved to your device.', type: 'success' });
    } catch (error) {
      actions.addNotification({ message: 'Share failed. Please try again.', type: 'error' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleShare}
      disabled={isExporting}
      className={className}
      data-qa="farm-card-share"
    >
      {isExporting ? 'Preparing…' : label}
    </Button>
  );
};

export default FarmCardShareButton;
