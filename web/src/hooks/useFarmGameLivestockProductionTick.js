import { useEffect } from 'react';
import { LIVESTOCK } from '../data/buildings';

/**
 * Classic FarmGame: advance livestock production on an interval and enqueue pending products.
 *
 * @param {import('react').Dispatch<React.SetStateAction<object[]>>} setOwnedAnimals
 * @param {import('react').Dispatch<React.SetStateAction<object[]>>} setPendingProducts
 */
export function useFarmGameLivestockProductionTick(
  ownedAnimals,
  setOwnedAnimals,
  setPendingProducts
) {
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000;

      ownedAnimals.forEach((animal, index) => {
        const livestock = LIVESTOCK[animal.type];
        if (!livestock) return;

        const timeSinceProduct = now - (animal.lastProductAt || now);
        if (timeSinceProduct >= livestock.interval) {
          setPendingProducts((prev) => [
            ...prev,
            {
              animalId: animal.id,
              type: livestock.product,
              name: livestock.product.charAt(0).toUpperCase() + livestock.product.slice(1),
              emoji: livestock.productEmoji,
              value: livestock.value,
            },
          ]);

          setOwnedAnimals((prev) =>
            prev.map((a, i) => (i === index ? { ...a, lastProductAt: now } : a))
          );
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [ownedAnimals, setOwnedAnimals, setPendingProducts]);
}
