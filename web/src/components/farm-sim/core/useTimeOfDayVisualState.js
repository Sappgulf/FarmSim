import { useEffect, useState } from 'react';
import { getDayKey } from '../../../systems/almanac';

const computeTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 17 && hour < 20) return 'dusk';
  if (hour >= 20 || hour < 5) return 'night';
  return 'day';
};

export function useTimeOfDayVisualState(actions) {
  const [timePeriod, setTimePeriod] = useState('day');

  useEffect(() => {
    const updatePeriod = () => {
      const next = computeTimePeriod();
      setTimePeriod((prev) => {
        if (prev !== 'night' && next === 'night') {
          actions.recordCozyExpansionEvent?.('nightfall', { dayKey: getDayKey() });
        }
        return next;
      });
    };

    updatePeriod();
    const timer = setInterval(updatePeriod, 60000);
    return () => clearInterval(timer);
  }, [actions]);

  return timePeriod;
}
