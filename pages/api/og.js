import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const question = searchParams.get('question') || 'Default Question';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#1A1A1A',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: 50, margin: 0, paddingBottom: 20 }}>iWager</h1>
        <p style={{ fontSize: 40, margin: 0 }}>{question}</p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
