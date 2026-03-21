'use client'

type Tab = 'ai' | 'reactions' | 'stats' | 'radio'

const TABS: { key: Tab; label: string }[] = [
  { key: 'ai',        label: 'AI' },
  { key: 'reactions', label: 'Reactions' },
  { key: 'stats',     label: 'Stats' },
  { key: 'radio',     label: 'Radio' },
]

interface LiveTabsProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

export function LiveTabs({ activeTab, onTabChange }: LiveTabsProps) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg-elevated)',
      position: 'sticky', top: 200, zIndex: 80,
    }}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            flex: 1, padding: '10px 4px',
            background: 'none', border: 'none',
            borderBottom: `2px solid ${activeTab === tab.key ? 'var(--green)' : 'transparent'}`,
            fontSize: 12, fontWeight: 600,
            color: activeTab === tab.key ? 'var(--green)' : 'var(--text-3)',
            cursor: 'pointer',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
