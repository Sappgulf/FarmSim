import { useEffect } from 'react';

/**
 * Classic FarmGame: move finished processing jobs into completed products and notify.
 *
 * @param {import('react').Dispatch<React.SetStateAction<object[]>>} setProcessingQueue
 * @param {import('react').Dispatch<React.SetStateAction<object[]>>} setCompletedProducts
 * @param {function(string, string): void} addNotification
 * @param {{ playSuccess: function(): void }} sound
 */
export function useFarmGameProcessingQueueTick(
  setProcessingQueue,
  setCompletedProducts,
  addNotification,
  sound
) {
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      setProcessingQueue((prev) => {
        const stillProcessing = [];
        const completed = [];

        prev.forEach((item) => {
          if (now >= item.startTime + item.duration * 1000) {
            completed.push(item);
          } else {
            stillProcessing.push(item);
          }
        });

        if (completed.length > 0) {
          setCompletedProducts((existing) => [...existing, ...completed]);
          addNotification(
            `${completed.map((c) => c.emoji).join('')} Processing complete!`,
            'success'
          );
          sound.playSuccess();
        }

        return stillProcessing;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [addNotification, setProcessingQueue, setCompletedProducts, sound]);
}
