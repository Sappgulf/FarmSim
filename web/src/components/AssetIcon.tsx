import type { CSSProperties } from 'react'
import type { CropKey, InventoryKey } from '../data'

type AssetKey = CropKey | InventoryKey | 'chicken' | 'cow' | 'cheese' | 'bread' | 'butter'

type AssetIconProps = {
  asset: AssetKey
  label?: string
  size?: number
  className?: string
}

const spritePositions: Record<AssetKey, [number, number]> = {
  wheat: [0, 0],
  tomato: [1, 0],
  corn: [2, 0],
  eggs: [3, 0],
  milk: [0, 1],
  grain: [1, 1],
  wool: [2, 1],
  chicken: [3, 1],
  cow: [0, 2],
  cheese: [1, 2],
  bread: [2, 2],
  butter: [3, 2],
}

export function AssetIcon({ asset, label, size = 56, className = '' }: AssetIconProps) {
  const [column, row] = spritePositions[asset]
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundImage: 'url(/assets/farm-assets-sheet-alpha.webp)',
    backgroundSize: '400% 300%',
    backgroundPosition: `${column * 33.333333}% ${row * 50}%`,
  }

  return <span className={`asset-icon ${className}`} style={style} role="img" aria-label={label ?? asset} />
}
