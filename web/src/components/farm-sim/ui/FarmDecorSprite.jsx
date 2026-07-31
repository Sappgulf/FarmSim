import React from 'react';

const getDecorKind = (decorationId = '', decoration = {}) => {
  const id = String(decorationId).toLowerCase();
  const tags = Array.isArray(decoration.tags) ? decoration.tags : [];

  if (tags.includes('path') || id.includes('path') || id.includes('stone')) return 'path';
  if (tags.includes('fence') || id.includes('fence') || id.includes('gate')) return 'fence';
  if (tags.includes('lighting') || id.includes('lantern') || id.includes('candle'))
    return 'lantern';
  if (tags.includes('water') || id.includes('birdbath') || id.includes('well')) return 'water';
  if (id.includes('tree') || id.includes('hedge') || id.includes('blossom')) return 'tree';
  if (id.includes('bench') || id.includes('chair') || id.includes('hammock')) return 'seat';
  return 'flower';
};

function DecorArt({ kind }) {
  if (kind === 'path') {
    return (
      <>
        <path
          d="M16 78 C30 65 70 65 84 78"
          fill="none"
          stroke="#b7a17f"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path
          d="M18 76 C32 65 68 65 82 76"
          fill="none"
          stroke="#e3d2af"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="10 7"
        />
      </>
    );
  }

  if (kind === 'fence') {
    return (
      <>
        <path d="M12 62 H88" stroke="#8b6648" strokeWidth="7" strokeLinecap="round" />
        {[22, 42, 62, 82].map((x) => (
          <path key={x} d={`M${x} 36 V78`} stroke="#b78a5c" strokeWidth="7" strokeLinecap="round" />
        ))}
        {[22, 42, 62, 82].map((x) => (
          <path key={`cap-${x}`} d={`M${x - 5} 39 L${x} 30 L${x + 5} 39`} fill="#d2a46c" />
        ))}
      </>
    );
  }

  if (kind === 'lantern') {
    return (
      <>
        <path d="M50 38 V83" stroke="#6f5a47" strokeWidth="5" strokeLinecap="round" />
        <path d="M34 38 H66 L61 63 H39 Z" fill="#f5c55b" stroke="#9c733d" strokeWidth="3" />
        <path d="M39 30 Q50 21 61 30" fill="none" stroke="#6f5a47" strokeWidth="4" />
        <circle cx="50" cy="49" r="10" fill="#fff2af" opacity="0.7" />
      </>
    );
  }

  if (kind === 'water') {
    return (
      <>
        <ellipse cx="50" cy="70" rx="31" ry="13" fill="#77b9c4" stroke="#477e89" strokeWidth="4" />
        <path d="M27 67 Q50 51 73 67" fill="none" stroke="#d9bd91" strokeWidth="7" />
        <path d="M35 53 Q50 37 65 53" fill="none" stroke="#9a704b" strokeWidth="6" />
        <path d="M50 43 V65" stroke="#9a704b" strokeWidth="5" />
      </>
    );
  }

  if (kind === 'tree') {
    return (
      <>
        <path d="M50 55 V84" stroke="#8f6746" strokeWidth="8" strokeLinecap="round" />
        <circle cx="36" cy="43" r="17" fill="#5d9d67" />
        <circle cx="60" cy="38" r="21" fill="#72b874" />
        <circle cx="72" cy="50" r="14" fill="#4f8f5e" />
        <circle cx="52" cy="30" r="12" fill="#9bcf80" opacity="0.9" />
      </>
    );
  }

  if (kind === 'seat') {
    return (
      <>
        <path d="M28 53 H72" stroke="#a66e42" strokeWidth="11" strokeLinecap="round" />
        <path d="M35 53 V78 M65 53 V78" stroke="#7e5539" strokeWidth="6" strokeLinecap="round" />
        <path d="M31 35 H69 V52 H31 Z" fill="#c18a57" stroke="#8a5c3c" strokeWidth="4" />
      </>
    );
  }

  return (
    <>
      <path d="M50 82 V48" stroke="#5c995d" strokeWidth="5" strokeLinecap="round" />
      <path d="M49 63 C34 53 25 58 23 68 C35 70 44 68 49 63Z" fill="#6bab65" />
      <path d="M51 56 C65 44 77 49 79 59 C67 63 58 62 51 56Z" fill="#86c66e" />
      <circle cx="50" cy="42" r="10" fill="#efb3a9" />
      <circle cx="50" cy="42" r="4" fill="#e4a24e" />
    </>
  );
}

export default function FarmDecorSprite({
  decorationId = 'flower_box',
  decoration = {},
  size = 'medium',
  className = '',
}) {
  const kind = getDecorKind(decorationId, decoration);
  const sizeClass = size === 'small' ? 'farm-decor-sprite--small' : '';
  const label = decoration.name || decorationId.replaceAll('_', ' ');

  return (
    <span className={`farm-decor-sprite ${sizeClass} ${className}`} role="img" aria-label={label}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="50" cy="86" rx="33" ry="7" fill="#614c3b" opacity="0.2" />
        <DecorArt kind={kind} />
      </svg>
    </span>
  );
}
