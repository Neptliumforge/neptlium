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
          background: '#F5F3EE',
          color: '#101214',
          padding: '72px 80px',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <svg width="54" height="54" viewBox="0 0 64 64" aria-hidden="true">
            <path
              fill="#0F8F86"
              d="M6.07 9.85 6.2 19.75 7.13 21.34 10.72 25.06 10.72 25.86 7.79 30.17 7.06 32.83 7.13 54.02 22.54 43.72 23.73 41.86 23.67 31.17 24.73 31.44 33.16 43.79 37.61 49.3 41.13 52.69 43.99 54.02 46.98 54.15 49.03 53.42 51.16 51.89 55.48 46.05 57.07 42.26 57.73 39.07 57.54 11.78 43.06 22.87 42.13 24.66 42.26 31.17 41.4 31.24 34.22 23.13 29.44 19.28 26.45 13.9 23.93 11.38 22.01 10.45 19.15 9.79Z"
            />
          </svg>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.04em' }}>NEPTLIUM</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
          <div style={{ fontSize: 76, lineHeight: 0.98, letterSpacing: '-0.055em', fontWeight: 600 }}>
            Capital operating infrastructure.
          </div>
          <div style={{ width: 170, height: 4, background: '#0F8F86' }} />
          <div style={{ fontSize: 28, lineHeight: 1.35, color: '#343A3F' }}>
            Portfolio context, capital operations, treasury and governed allocation in one institutional operating environment.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, color: '#343A3F' }}>
          <span>Capital context, put into operation.</span>
          <span>neptlium.com</span>
        </div>
      </div>
    ),
    size,
  );
}
