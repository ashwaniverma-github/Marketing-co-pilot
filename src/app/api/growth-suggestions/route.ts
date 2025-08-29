import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getAuthenticatedUser(): Promise<string> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? undefined;
  if (!userId) throw new Error('Not authenticated');
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const suggestions = await db.growthSuggestion.findMany({
      where: {
        app: {
          userId,
        },
        ...(appId && { appId }),
        ...(category && { category: category.toUpperCase() as any }),
        ...(status && { status: status.toUpperCase() as any }),
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { aiConfidence: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      suggestions: suggestions.map(suggestion => ({
        id: suggestion.id,
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category.toLowerCase(),
        priority: suggestion.priority,
        effort: suggestion.effort.toLowerCase(),
        impact: suggestion.impact.toLowerCase(),
        actionItems: suggestion.actionItems,
        estimatedROI: suggestion.estimatedROI,
        timeframe: suggestion.timeframe,
        status: suggestion.status.toLowerCase(),
        implementedAt: suggestion.implementedAt,
        results: suggestion.results,
        aiConfidence: suggestion.aiConfidence,
        sourceAnalysis: suggestion.sourceAnalysis,
        createdAt: suggestion.createdAt.toISOString(),
        updatedAt: suggestion.updatedAt.toISOString(),
        app: suggestion.app,
      })),
    });

  } catch (error) {
    console.error('Fetch growth suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch growth suggestions' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUser();
    const body = await request.json();
    const { id, status, results } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    // Verify the suggestion belongs to the user's app
    const suggestion = await db.growthSuggestion.findFirst({
      where: {
        id,
        app: {
          userId,
        },
      },
    });

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Growth suggestion not found or not authorized' },
        { status: 404 }
      );
    }

    const updatedSuggestion = await db.growthSuggestion.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        ...(status.toLowerCase() === 'completed' && {
          implementedAt: new Date(),
          results,
        }),
      },
      include: {
        app: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      suggestion: {
        id: updatedSuggestion.id,
        title: updatedSuggestion.title,
        description: updatedSuggestion.description,
        category: updatedSuggestion.category.toLowerCase(),
        priority: updatedSuggestion.priority,
        effort: updatedSuggestion.effort.toLowerCase(),
        impact: updatedSuggestion.impact.toLowerCase(),
        status: updatedSuggestion.status.toLowerCase(),
        implementedAt: updatedSuggestion.implementedAt,
        results: updatedSuggestion.results,
        updatedAt: updatedSuggestion.updatedAt.toISOString(),
        app: updatedSuggestion.app,
      },
    });

  } catch (error) {
    console.error('Update growth suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to update growth suggestion' },
      { status: 500 }
    );
  }
}
