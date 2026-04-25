/**
 * MedPing logo — asterisk bloom mark.
 * Six rounded arms radiating from centre, paired with the wordmark.
 */
export default function Logo({ size = 32, color = '#d97757', withText = false, textColor = '#141413' }) {
  const s = size;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: s * 0.35 }}>
      {/* ── Mark ─────────────────────────────────────────── */}
      <svg
        width={s}
        height={s}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* 6 rounded arms at 0°, 60°, 120°, 180°, 240°, 300° */}
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <rect
            key={deg}
            x="44"
            y="10"
            width="12"
            height="42"
            rx="6"
            fill={color}
            transform={`rotate(${deg} 50 50)`}
            opacity={deg === 0 || deg === 60 ? 1 : deg === 120 || deg === 180 ? 0.82 : 0.64}
          />
        ))}
      </svg>

      {/* ── Wordmark ──────────────────────────────────────── */}
      {withText && (
        <span style={{
          fontFamily: "'Poppins', Arial, sans-serif",
          fontWeight: 700,
          fontSize: s * 0.6,
          color: textColor,
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}>
          MedPing
        </span>
      )}
    </div>
  );
}

/** Compact icon-only version for favicons / small spaces */
export function LogoMark({ size = 24, color = '#d97757' }) {
  return <Logo size={size} color={color} withText={false} />;
}

/** Full horizontal lockup */
export function LogoFull({ size = 28, dark = false }) {
  return (
    <Logo
      size={size}
      color="#d97757"
      withText
      textColor={dark ? '#ffffff' : '#141413'}
    />
  );
}
