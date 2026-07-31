import { describe, expect, it } from 'vitest';
import {
  getFarmAsset,
  getGeneratedFarmAssetSource,
  getFarmAssetKey,
} from '../assets/farmAssetRegistry';

describe('farm art registry', () => {
  it('keeps semantic crop keys stable while generated sources remain optional', () => {
    const lettuce = getFarmAsset('lettuce');

    expect(getFarmAssetKey('lettuce')).toBe('crop.lettuce');
    expect(lettuce.id).toBe('crop.lettuce');
    expect(lettuce.generated.available).toBe(false);
    expect(getGeneratedFarmAssetSource('lettuce', 'ready')).toBeNull();
  });

  it('resolves non-crop terrain keys without corrupting the manifest lookup', () => {
    expect(getFarmAsset('terrain.path')).toMatchObject({
      id: 'terrain.path',
      shape: 'path',
    });

    expect(getFarmAsset('terrain.atmosphere')).toMatchObject({
      id: 'terrain.atmosphere',
      shape: 'atmosphere',
      src: '/assets/farm/meadowlight-atmosphere.webp',
    });
  });
});
