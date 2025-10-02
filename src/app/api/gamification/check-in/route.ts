import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gamificationHelpers } from '@/lib/db';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await gamificationHelpers.checkIn(userId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}
