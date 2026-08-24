import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F5F3EE',
          borderRadius: 36,
        }}
      >
        <svg width="112" height="112" viewBox="0 0 64 64" aria-hidden="true">
          <path
            fill="#0F8F86"
            d="M6.07 9.85 6.2 19.75 7.13 21.34 10.72 25.06 10.72 25.86 7.79 30.17 7.06 32.83 7.13 54.02 22.54 43.72 23.73 41.86 23.67 31.17 24.73 31.44 33.16 43.79 37.61 49.3 41.13 52.69 43.99 54.02 46.98 54.15 49.03 53.42 51.16 51.89 55.48 46.05 57.07 42.26 57.73 39.07 57.54 11.78 43.06 22.87 42.13 24.66 42.26 31.17 41.4 31.24 34.22 23.13 29.44 19.28 26.45 13.9 23.93 11.38 22.01 10.45 19.15 9.79Z"
          />
        </svg>
      </div>
    ),
    size,
  );
}
