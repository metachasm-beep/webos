import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Params: score, domain, profile
    const score = searchParams.get('score') || '0';
    const domain = searchParams.get('domain') || 'Unknown Entity';
    const profile = searchParams.get('profile') || 'Incomplete Protocol';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050505',
            backgroundImage: 'radial-gradient(circle at 0% 0%, #1a1a1a 0%, transparent 40%), radial-gradient(circle at 100% 100%, #1a1a1a 0%, transparent 40%)',
            fontFamily: 'Outfit, sans-serif',
            color: 'white',
            padding: '80px',
          }}
        >
          {/* Logo Placeholder (Transparent SVG or PNG if available) */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px' }}>
             <div style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '32px' }}>W</span>
             </div>
             <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.05em' }}>WebOS AI / Matrix</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '40px',
              padding: '60px 80px',
              boxShadow: '0 20px 80px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div style={{ fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
              Strategic Benchmark
            </div>
            
            <div style={{ fontSize: '120px', fontWeight: 'bold', fontStyle: 'italic', color: '#10b981', marginBottom: '10px' }}>
              {score}%
            </div>

            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>
              {domain}
            </div>

            <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Profile: {profile}
            </div>
          </div>

          <div style={{ display: 'flex', marginTop: '60px', color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>
            Built with WebOS AI | Audit. Build. Dominate.
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Matrix Synthesis Failure.", e.message);
    return new Response(`Failed to generate image`, {
      status: 500,
    });
  }
}
