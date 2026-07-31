import React from 'react';
import { getFarmAsset, getGeneratedFarmAssetSource } from '../../../assets/farmAssetRegistry';

const clampStage = (stage, max = 4) => Math.max(0, Math.min(max, Number(stage) || 0));

function Soil({ color = '#6c4c36' }) {
  return <ellipse cx="50" cy="84" rx="35" ry="8" fill={color} opacity="0.22" />;
}

function Sprout({ asset, stage }) {
  const mature = stage >= 2;
  return (
    <>
      <path
        d="M50 80 C50 66 49 52 50 37"
        fill="none"
        stroke={asset.leaf}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M49 59 C37 48 28 50 23 57 C34 62 42 63 49 59Z" fill={asset.leaf} />
      <path d="M51 52 C62 40 72 42 78 49 C68 55 59 57 51 52Z" fill={asset.accent} opacity="0.9" />
      {mature && <path d="M50 39 C40 25 28 29 25 38 C35 44 43 44 50 39Z" fill={asset.accent} />}
    </>
  );
}

function RootCrop({ asset, stage }) {
  const mature = stage >= 2;
  return (
    <>
      <path
        d="M50 80 C50 67 49 51 50 31"
        fill="none"
        stroke={asset.leaf}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M49 52 C36 38 24 41 21 51 C33 57 42 57 49 52Z" fill={asset.leaf} />
      <path d="M51 43 C64 28 76 32 80 42 C68 50 58 50 51 43Z" fill={asset.leaf} opacity="0.9" />
      {mature ? (
        <path
          d="M50 53 C42 58 40 70 50 81 C60 70 58 58 50 53Z"
          fill={asset.accent}
          stroke={asset.shadow}
          strokeWidth="2"
        />
      ) : (
        <circle cx="50" cy="68" r="7" fill={asset.accent} opacity="0.55" />
      )}
    </>
  );
}

function LeafCrop({ asset, stage }) {
  const scale = stage >= 2 ? 1 : 0.78;
  return (
    <g transform={`translate(${50 - 50 * scale} ${83 - 83 * scale}) scale(${scale})`}>
      <path
        d="M50 82 C45 67 43 54 50 40"
        fill="none"
        stroke={asset.shadow}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M50 63 C27 64 18 50 27 39 C40 38 48 46 50 58Z" fill={asset.leaf} />
      <path d="M50 67 C72 65 83 52 75 39 C62 39 53 48 50 60Z" fill={asset.accent} />
      <path d="M49 53 C35 46 34 33 43 27 C53 30 55 40 49 53Z" fill={asset.leaf} opacity="0.95" />
      {stage >= 3 && <circle cx="50" cy="47" r="9" fill={asset.accent} opacity="0.85" />}
    </g>
  );
}

function VineCrop({ asset, stage }) {
  const fruitCount = stage >= 3 ? 3 : stage >= 2 ? 1 : 0;
  return (
    <>
      <path
        d="M50 82 C51 68 47 54 54 38 C58 28 67 24 73 30"
        fill="none"
        stroke={asset.leaf}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M52 59 C38 47 28 48 22 57 C34 63 44 64 52 59Z" fill={asset.leaf} />
      <path d="M55 47 C67 39 76 42 81 50 C70 56 62 55 55 47Z" fill={asset.leaf} opacity="0.85" />
      {Array.from({ length: fruitCount }).map((_, index) => (
        <circle
          key={index}
          cx={[40, 62, 52][index]}
          cy={[69, 61, 46][index]}
          r={index === 2 ? 7 : 6}
          fill={asset.accent}
          stroke={asset.shadow}
          strokeWidth="2"
        />
      ))}
      {stage === 0 && <circle cx="52" cy="69" r="5" fill={asset.accent} opacity="0.45" />}
    </>
  );
}

function GrainCrop({ asset, stage }) {
  return (
    <>
      {[37, 50, 63].map((x, index) => (
        <path
          key={x}
          d={`M50 84 C${x} ${70 - index * 3} ${x - 5} ${48 - index * 5} ${x + 2} ${30 - index * 4}`}
          fill="none"
          stroke={asset.leaf}
          strokeWidth={stage >= 2 ? 4 : 3}
          strokeLinecap="round"
        />
      ))}
      {stage >= 2 && <path d="M50 33 C39 25 34 27 32 34 C40 39 46 39 50 33Z" fill={asset.accent} />}
      {stage >= 3 && <path d="M51 30 C61 21 68 23 70 30 C62 36 56 35 51 30Z" fill={asset.accent} />}
    </>
  );
}

function FlowerCrop({ asset, stage }) {
  return (
    <>
      <path
        d="M50 83 C49 68 50 52 50 36"
        fill="none"
        stroke={asset.leaf}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M49 60 C37 50 28 53 25 61 C36 66 43 66 49 60Z" fill={asset.leaf} />
      {stage >= 2 ? (
        <>
          <circle cx="50" cy="34" r="10" fill={asset.accent} />
          <circle cx="50" cy="34" r="4" fill={asset.shadow} />
        </>
      ) : (
        <circle cx="50" cy="43" r="5" fill={asset.accent} opacity="0.7" />
      )}
    </>
  );
}

function WornCrop({ asset }) {
  return (
    <>
      <path
        d="M50 82 C42 65 56 50 45 35"
        fill="none"
        stroke="#7f735f"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M47 56 C32 45 26 49 23 57 C34 62 42 62 47 56Z" fill="#a29378" />
      <path d="M51 46 C64 35 73 39 77 47 C66 53 58 52 51 46Z" fill="#8b806d" />
      <path
        d="M45 35 L40 29 M56 53 L63 45"
        stroke="#c1b39a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="50" cy="84" r="4" fill={asset.shadow} opacity="0.6" />
    </>
  );
}

export default function FarmSprite({
  cropId = 'seedling',
  stage = 0,
  state = 'growing',
  className = '',
  size = 'medium',
}) {
  const asset = getFarmAsset(cropId);
  const normalizedStage = clampStage(stage, 5);
  const generatedSource = getGeneratedFarmAssetSource(cropId, state);
  const sizeClass =
    size === 'small' ? 'farm-sprite--small' : size === 'large' ? 'farm-sprite--large' : '';
  const stageClass = `farm-sprite--stage-${Math.min(4, normalizedStage)}`;
  const stateClass = state === 'ready' ? 'farm-sprite--ready' : '';

  let art = null;
  if (state === 'withered') {
    art = <WornCrop asset={asset} />;
  } else if (normalizedStage === 0 || asset.shape === 'seedling') {
    art = <Sprout asset={asset} stage={normalizedStage} />;
  } else if (asset.shape === 'root') {
    art = <RootCrop asset={asset} stage={normalizedStage} />;
  } else if (asset.shape === 'leaf') {
    art = <LeafCrop asset={asset} stage={normalizedStage} />;
  } else if (asset.shape === 'vine') {
    art = <VineCrop asset={asset} stage={normalizedStage} />;
  } else if (asset.shape === 'grain') {
    art = <GrainCrop asset={asset} stage={normalizedStage} />;
  } else {
    art = <FlowerCrop asset={asset} stage={normalizedStage} />;
  }

  return (
    <span
      className={`farm-sprite ${sizeClass} ${stageClass} ${stateClass} ${state === 'growing' ? 'farm-sprite--growing' : ''} ${className}`}
    >
      {generatedSource ? (
        <img
          src={generatedSource}
          alt={`${cropId} ${state}`}
          className="farm-sprite__generated"
          draggable="false"
        />
      ) : (
        <svg viewBox="0 0 100 100" role="img" aria-label={`${cropId} ${state}`}>
          <title>{`${cropId} ${state}`}</title>
          <Soil color={state === 'withered' ? '#76583e' : '#6c4c36'} />
          {art}
        </svg>
      )}
    </span>
  );
}
