import React, { memo, useMemo, useState } from 'react';
import { Circle } from 'lucide-react';

const SORA_ICON_BASE = '/assets/sora/icons';

const SoraIcon = memo(function SoraIcon({
  id,
  className = 'icon-16',
  fallbackIcon: FallbackIcon,
  fallbackEmoji,
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const src = useMemo(() => {
    if (!id || loadFailed) return null;
    return `${SORA_ICON_BASE}/${id}.png`;
  }, [id, loadFailed]);

  if (src) {
    return (
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={className}
        decoding="async"
        onError={() => setLoadFailed(true)}
      />
    );
  }

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
