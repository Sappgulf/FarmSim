import React, { memo } from 'react';
import { Circle } from 'lucide-react';

const SoraIcon = memo(function SoraIcon({
  className = 'icon-16',
  fallbackIcon: FallbackIcon,
  fallbackEmoji,
}) {
  if (FallbackIcon) {
    return <FallbackIcon className={className} aria-hidden="true" />;
  }

  if (fallbackEmoji) {
    return (
      <span className={`text-base ${className}`} aria-hidden="true">
        {fallbackEmoji}
      </span>
    );
  }

  return <Circle className={className} aria-hidden="true" />;
});

export default SoraIcon;
