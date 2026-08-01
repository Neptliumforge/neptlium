import { ImageResponse } from 'next/og';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '76px 82px',
        background: '#050806',
        color: '#f1f2eb',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 560,
          height: 560,
          right: -130,
          top: -180,
          border: '1px solid #24332c',
          borderRadius: '50%',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <svg width="56" height="56" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="10" fill="#030604" />
          <path d="M10 11h29l-8 14H10V11Z" fill="#6574df" />
          <path d="M33 39h21v14H25l8-14Z" fill="#6574df" />
          <circle cx="32" cy="32" r="8.5" fill="#030604" stroke="#6574df" strokeWidth="4" />
        </svg>
        <span style={{ fontSize: 28, fontWeight: 600 }}>Neptlium</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 76, letterSpacing: -4, maxWidth: 850, lineHeight: 1 }}>
          Capital, organized around you.
        </div>
        <div style={{ fontSize: 23, color: '#87928b', marginTop: 30 }}>
          Capital operating infrastructure for modern ownership.
        </div>
      </div>
    </div>,
  );
}
