import { ImageResponse } from 'next/og';

export const alt = 'Neptlium — Capital Operating Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#101214',
          color: '#F5F3EE',
          padding: '72px 80px',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.04em' }}>Neptlium</div>
          <svg width="52" height="52" viewBox="0 0 64 64" aria-hidden="true">
            <g fill="none" stroke="#20AFA3" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 17.5C23 17.5 38 13.5 54 6.5" />
              <path d="M10 38.5C19.5 36.5 25.5 28.5 34.5 27.5C43 26.5 49 21.5 54.5 16" />
              <path d="M30.5 52C35.5 45.5 44.5 45.5 50.5 51.5" />
            </g>
          </svg>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
          <div style={{ fontSize: 76, lineHeight: 0.98, letterSpacing: '-0.055em', fontWeight: 600 }}>
            The operating system for capital.
          </div>
          <div style={{ width: 170, height: 1, background: '#20AFA3' }} />
          <div style={{ fontSize: 28, lineHeight: 1.35, color: 'rgba(245,243,238,.68)' }}>
            See, coordinate and govern capital across treasury, allocation and portfolio context.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: 'rgba(245,243,238,.56)' }}>
          <span>Capital context, put into operation.</span>
          <span>neptlium.com</span>
        </div>
      </div>
    ),
    size,
  );
}
