import { NextRequest, NextResponse } from 'next/server';
import { getPublicBlogPosts, isPublicProfileNotFound } from '@/lib/publicData';
import { usernameSchema } from '@/lib/validation';
import { createErrorResponse } from '@/lib/apiErrors';

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
    if (!isPublicProfileNotFound(error)) {
      console.error('Error in public-blog API:', error);
    }
    return createErrorResponse(error);
  }
}
