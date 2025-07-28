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
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {question}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
