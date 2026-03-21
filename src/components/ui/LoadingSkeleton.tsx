interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'var(--bg-elevated)',
      position: 'relative', overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s linear infinite',
      }} />
    </div>
  )
}

export function MatchCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 16,
    }}>
      <Skeleton height={10} width="40%" style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <Skeleton width={32} height={32} borderRadius={8} />
        <Skeleton width={60} height={32} />
        <Skeleton width={32} height={32} borderRadius={8} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton height={32} style={{ flex: 1 }} />
        <Skeleton height={32} style={{ flex: 1 }} />
      </div>
    </div>
  )
}

export function CharacterCardSkeleton() {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 12, padding: 14,
    }}>
      <Skeleton width={40} height={40} borderRadius={10} style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="70%" style={{ marginBottom: 6 }} />
      <Skeleton height={10} width="50%" />
    </div>
  )
}
