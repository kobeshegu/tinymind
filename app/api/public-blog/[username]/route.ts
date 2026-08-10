import { NextRequest, NextResponse } from 'next/server';
import { getPublicBlogPosts } from '@/lib/publicData';
import { usernameSchema } from '@/lib/validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!usernameSchema.safeParse(username).success) {
    return NextResponse.json({ error: 'Invalid username' }, { status: 404 });
  }

  try {
    const blogPosts = await getPublicBlogPosts(username);
    return NextResponse.json(blogPosts);
  } catch (error: unknown) {
    console.error('Error in public-blog API:', error);
    
    // Handle rate limiting
    if (error && typeof error === 'object' && 'status' in error && error.status === 403) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many requests to GitHub API' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
