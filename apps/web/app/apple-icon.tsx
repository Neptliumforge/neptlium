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
          background: '#101214',
          borderRadius: 36,
        }}
      >
        <svg width="112" height="112" viewBox="0 0 64 64" aria-hidden="true">
          <g
            fill="none"
            stroke="#F5F3EE"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 17.5C23 17.5 38 13.5 54 6.5" />
            <path d="M10 38.5C19.5 36.5 25.5 28.5 34.5 27.5C43 26.5 49 21.5 54.5 16" />
            <path d="M30.5 52C35.5 45.5 44.5 45.5 50.5 51.5" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
