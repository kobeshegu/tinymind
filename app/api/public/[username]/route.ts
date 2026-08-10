import { NextRequest, NextResponse } from 'next/server';
import { getPublicProfileData } from '@/lib/publicData';
import { usernameSchema } from '@/lib/validation';

// No force-dynamic: it overrode `revalidate` and the s-maxage header below,
// so the route re-rendered on every request while claiming to be cacheable.
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  // Add cache control headers
  const headers = {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
    'Content-Type': 'application/json',
  };

  const { username } = await params;

  if (!usernameSchema.safeParse(username).success) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 404, headers });
  }

  try {
    const { blogPosts, thoughts, aboutPage } = await getPublicProfileData(username);

    return NextResponse.json(
      { blogPosts, thoughts, aboutPage },
      { 
        headers,
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching public data:', error);
    
    // Handle rate limiting specifically
    if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'GitHub API rate limit exceeded. Please try again later.' },
        { 
          headers,
          status: 429 
        }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch public data' },
      { 
        headers,
        status: 500 
      }
    );
  }
}
