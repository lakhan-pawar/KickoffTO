// src/components/ui/Flag.tsx
// KickoffTo Flag Component
'use client'

export const FLAG_ISO: Record<string,string> = {
  ARG:'ar',BRA:'br',FRA:'fr',ENG:'gb-eng',ESP:'es',
  GER:'de',POR:'pt',NED:'nl',CAN:'ca',USA:'us',
  MEX:'mx',MAR:'ma',JPN:'jp',SEN:'sn',CRO:'hr',
  URU:'uy',BEL:'be',SUI:'ch',DEN:'dk',SWE:'se',
  AUS:'au',KOR:'kr',IRN:'ir',SAU:'sa',ECU:'ec',
  COL:'co',CHI:'cl',PER:'pe',PAN:'pa',NGA:'ng',
  CMR:'cm',TUN:'tn',ANG:'ao',SRB:'rs',SVN:'si',
  SVK:'sk',UKR:'ua',GRE:'gr',AUT:'at',BIH:'ba',
  RSA:'za',IRQ:'iq',ALB:'al',TAN:'tz',NZL:'nz',
  VEN:'ve',ITA:'it',ELK:'sv',MZB:'mz',GHA:'gh',
  IRE:'ie',SCO:'gb-sct',WAL:'gb-wls',NOR:'no',
  // lowercase aliases
  arg:'ar',bra:'br',fra:'fr',eng:'gb-eng',esp:'es',
  ger:'de',por:'pt',ned:'nl',can:'ca',usa:'us',
  mex:'mx',mar:'ma',jpn:'jp',sen:'sn',cro:'hr',
  uru:'uy',bel:'be',sui:'ch',den:'dk',kor:'kr',
  aus:'au',ecu:'ec',col:'co',chi:'cl',per:'pe',
  nga:'ng',cmr:'cm',tun:'tn',srb:'rs',ita:'it',
  ven:'ve',aut:'at',gre:'gr',irl:'ie',rsa:'za',
  irq:'iq',nor:'no',
}

interface FlagProps {
  code: string
  emoji?: string
  size?: number
  style?: React.CSSProperties
}

export function Flag({ code, emoji = '🏳️', size = 28, style }: FlagProps) {
  const iso = FLAG_ISO[code] ?? FLAG_ISO[code?.toUpperCase()]
  if (!iso) {
    return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{emoji}</span>
  }
  const requestedW = Math.round(size * 1.5)
  // flagcdn supported widths: 20, 40, 80, 160, 256
  const w = requestedW <= 20 ? 20 : requestedW <= 40 ? 40 : requestedW <= 80 ? 80 : 160
  return (
    <img
      src={`https://flagcdn.com/w${w}/${iso}.png`}
      alt={code}
      width={w}
      height={size}
      loading="lazy"
      style={{
        objectFit: 'cover', borderRadius: 3,
        display: 'inline-block', verticalAlign: 'middle',
        flexShrink: 0, ...style,
      }}
      onError={e => {
        const el = e.currentTarget as HTMLImageElement
        el.replaceWith(Object.assign(document.createElement('span'), {
          textContent: emoji,
          style: `font-size:${size}px;line-height:1`,
        }))
      }}
    />
  )
}
