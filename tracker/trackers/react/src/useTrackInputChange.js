import { useState } from 'react';

export default function useTrackInputChange(tracker) {
  const [previousValue, setPreviousValue] = useState('');

  return (event) => {
    const inputIdentifier = event.target.id ?? event.target.name;
    const inputValue = event.target.value;

    if (!inputIdentifier) {
      console.warn('Cannot track input without `id` or `name`', event.target);
      return;
    }

    if (previousValue !== inputValue) {
      setPreviousValue(inputValue);
      tracker.trackEvent({
        event: 'InputChangeEvent',
        location_stack: [
          {
            _context_type: 'InputContext',
            id: event.target.id ?? event.target.name,
            // TODO We don't track values because they can be sensitive, but they may be relevant in some cases
          },
        ],
      });
    }
  };
}
