import type { CSSProperties } from 'react'
import type { CropKey } from '../data'

type CropStageIconProps = {
  crop: CropKey
  growthDays: number
  totalDays: number
  ready: boolean
}

const cropRows: Record<CropKey, number> = {
  wheat: 0,
  tomato: 1,
  corn: 2,
}

export function CropStageIcon({ crop, growthDays, totalDays, ready }: CropStageIconProps) {
  const stage = ready ? 3 : growthDays === 0 ? 0 : Math.min(2, Math.ceil((growthDays / totalDays) * 2))
  const style: CSSProperties = {
    backgroundPosition: `${stage * 33.333333}% ${cropRows[crop] * 50}%`,
  }

  return <span className="crop-stage-icon" style={style} aria-hidden="true" />
}
