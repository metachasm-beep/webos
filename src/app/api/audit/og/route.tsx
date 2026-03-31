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
            color: '#ffffff',
            padding: '40px',
          }}
        >
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '1000px',
            height: '500px',
            backgroundColor: '#0a0a0a',
            border: '2px solid #333333',
            borderRadius: '40px',
            padding: '60px',
            position: 'relative'
          }}>
            
            {/* Logo */}
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '20px', alignItems: 'center', marginBottom: '30px' }}>
               <div style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '32px', display: 'flex' }}>W</span>
               </div>
               <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.05em', color: '#ffffff', display: 'flex' }}>WebOS AI / Matrix</span>
            </div>

            <div style={{ display: 'flex', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '0.4em', color: '#666666', marginBottom: '10px' }}>
              Strategic Benchmark
            </div>
            
            <div style={{ display: 'flex', fontSize: '140px', fontWeight: 'bold', color: '#10b981', marginBottom: '0px' }}>
              {score}%
            </div>

            <div style={{ display: 'flex', fontSize: '56px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center', color: '#ffffff' }}>
              {domain}
            </div>

            <div style={{ display: 'flex', fontSize: '24px', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 'bold' }}>
              Profile: {profile}
            </div>

            <div style={{ display: 'flex', position: 'absolute', bottom: '30px', color: '#333333', fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Built with Neural Synthesis Protocol v.2.0
            </div>
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
