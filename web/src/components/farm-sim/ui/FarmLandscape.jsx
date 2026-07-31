import React, { memo } from 'react';
import { getFarmAsset } from '../../../assets/farmAssetRegistry';

function LandmarkArt({ type }) {
  if (type === 'well') {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M25 45 H75 V82 H25 Z" fill="#a0a6a1" stroke="#6e786f" strokeWidth="4" />
        <path d="M18 45 Q50 24 82 45" fill="none" stroke="#8a6348" strokeWidth="8" />
        <path d="M50 27 V70" stroke="#8a6348" strokeWidth="5" />
        <ellipse cx="50" cy="59" rx="18" ry="7" fill="#71b5c1" stroke="#467c86" strokeWidth="3" />
      </svg>
    );
  }

  if (type === 'barn') {
    return (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d="M18 46 L50 20 L82 46 V82 H18 Z" fill="#cf7459" stroke="#994b3c" strokeWidth="4" />
        <path d="M38 82 V53 H62 V82" fill="#7f4d3f" stroke="#6b4136" strokeWidth="3" />
        <path d="M25 42 H75" stroke="#f3c48c" strokeWidth="4" />
        <path d="M50 22 V43" stroke="#f3c48c" strokeWidth="4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 58 V87" stroke="#866044" strokeWidth="8" strokeLinecap="round" />
      <circle cx="34" cy="46" r="18" fill="#609c63" />
      <circle cx="61" cy="38" r="24" fill="#7bb874" />
      <circle cx="76" cy="52" r="15" fill="#4e8b5c" />
      <circle cx="48" cy="28" r="14" fill="#9bcf80" />
    </svg>
  );
}

const FarmLandscape = memo(
  ({ gridSize = 3, buildings = {}, season = 'spring', weather = 'sunny' }) => {
    const hasWell = Boolean(buildings?.well?.built) || gridSize >= 4;
    const hasBarn = Boolean(buildings?.barn?.built) || gridSize >= 5;
    const seasonKey = String(season || 'spring')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    const weatherKey = String(weather || 'sunny')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    const atmosphere = getFarmAsset('terrain.atmosphere');

    return (
      <div
        className={`farm-landscape-layer farm-landscape-layer--season-${seasonKey} farm-landscape-layer--weather-${weatherKey}`}
        data-farm-atmosphere="true"
        data-season={seasonKey}
        data-weather={weatherKey}
        aria-hidden="true"
      >
        <img
          className="farm-landscape__art"
          src={atmosphere.src}
          alt=""
          width="1536"
          height="1024"
          loading="eager"
          decoding="async"
        />
        <div className="farm-landscape__wash" />
        <div className="farm-landscape__path farm-landscape__path--horizontal" />
        <div className="farm-landscape__path farm-landscape__path--vertical" />
        <div className="farm-landmark farm-landmark--trees">
          <LandmarkArt type="trees" />
        </div>
        {hasWell && (
          <div className="farm-landmark farm-landmark--well" data-landmark="well">
            <LandmarkArt type="well" />
            <span>Well</span>
          </div>
        )}
        {hasBarn && (
          <div className="farm-landmark farm-landmark--barn" data-landmark="barn">
            <LandmarkArt type="barn" />
            <span>Barn</span>
          </div>
        )}
        <div className="farm-landscape__glow farm-landscape__glow--left" />
        <div className="farm-landscape__glow farm-landscape__glow--right" />
      </div>
    );
  }
);

FarmLandscape.displayName = 'FarmLandscape';

export default FarmLandscape;
