type BrandProps = {
  onClick?: () => void
}

export function Brand({ onClick }: BrandProps) {
  return (
    <button className="brand" type="button" aria-label="Go to Farm Overview" data-testid="brand-home" onClick={onClick}>
      <span className="brand-word">FarmSim</span>
      <svg className="brand-sprig" aria-hidden="true" viewBox="0 0 42 26">
        <path d="M5 22C14 18 17 11 19 3M17 14c6 0 10-2 13-6M11 18c-5-1-8-4-9-8M21 7c5-4 10-4 15-3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M5 10c4 0 7 2 8 5-4 1-7 0-8-5Zm13-5c4 0 7 2 8 5-4 1-7 0-8-5Zm10 2c3-2 6-2 9 0-2 3-5 4-9 0Z" fill="currentColor" />
      </svg>
    </button>
  )
}
