import { NextRequest, NextResponse } from 'next/server';
import { trackFreeUsage } from '@/lib/subscription';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return await trackFreeUsage(request);
  } catch (error) {
    console.error('Error tracking free usage:', error);
    return NextResponse.json({ 
      error: 'Failed to track usage', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
