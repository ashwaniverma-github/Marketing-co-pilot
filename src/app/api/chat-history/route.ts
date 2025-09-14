// src/app/api/chat-history/route.ts  (example path)
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

// Remove unused type if not needed
// type ChatMessage = { role: string; content: string; isTweet?: boolean };

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { messages } = body ?? {};

    // Validate messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Find or create chat history
    const chatHistory = await prisma.chatHistory.upsert({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId: session.user.id
        }
      },
      update: {
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        sessionId: session.user.id,
        updatedAt: new Date()
      }
    });

    // Create messages with robust error handling and deduplication
    const messageRecords = [];
    for (const msg of messages) {
      try {
        // Generate a unique ID if not provided or might cause conflicts
        const messageId = msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Check if an identical message already exists
        const existingMessage = await prisma.message.findFirst({
          where: {
            chatHistoryId: chatHistory.id,
            role: msg.role,
            content: msg.content,
            isTweet: msg.isTweet || false
          }
        });

        // If message already exists, skip creation
        if (existingMessage) {
          continue;
        }

        // Attempt to create the message, handling potential ID conflicts
        const createdMessage = await prisma.message.upsert({
          where: { 
            id: messageId 
          },
          update: {
            // Update if the message with this ID already exists
            content: msg.content,
            role: msg.role,
            isTweet: msg.isTweet || false,
            chatHistoryId: chatHistory.id
          },
          create: {
            id: messageId,
            chatHistoryId: chatHistory.id,
            role: msg.role,
            content: msg.content,
            isTweet: msg.isTweet || false,
            createdAt: new Date()
          }
        });

        messageRecords.push(createdMessage);
      } catch (error) {
        // Log specific error details for debugging
        console.error('Error creating message:', {
          error,
          messageId: msg.id,
          role: msg.role,
          content: msg.content,
          errorName: error instanceof Error ? error.name : 'Unknown Error',
          errorMessage: error instanceof Error ? error.message : 'No error message'
        });
      }
    }

    return NextResponse.json({ 
      chatHistory, 
      messageCount: messageRecords.length,
      messageIds: messageRecords.map(record => record.id)
    }, { status: 200 });
  } catch (error) {
    console.error('Error saving chat history:', {
      error,
      errorName: error instanceof Error ? error.name : 'Unknown Error',
      errorMessage: error instanceof Error ? error.message : 'No error message'
    });

    return NextResponse.json({ 
      error: 'Failed to save chat history', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) { // Use underscore for unused parameter
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the most recent chat history for the user
    const chatHistory = await prisma.chatHistory.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          // Limit to last 50 messages to prevent overwhelming response
          take: 50
        }
      }
    });

    console.log('Most recent chat history:', JSON.stringify(chatHistory, null, 2));

    if (!chatHistory) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }

    // Transform messages to match expected format
    const messages = chatHistory.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      ...(msg.isTweet ? { isTweet: true } : {}),
      timestamp: msg.createdAt.toISOString()
    }));

    return NextResponse.json({ 
      messages,
      chatHistoryId: chatHistory.id
    }, { status: 200 });
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve chat history', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body to get the message ID
    const body = await req.json();
    const { messageId } = body;

    console.log('Received delete request:', { 
      messageId, 
      userId: session.user.id 
    });

    if (!messageId) {
      console.error('Delete request: Message ID is missing');
      return NextResponse.json({ 
        error: 'Message ID is required', 
        details: 'No messageId provided in the request body' 
      }, { status: 400 });
    }

    // Find ALL messages with similar content to debug
    const similarMessages = await prisma.message.findMany({
      where: {
        content: {
          contains: messageId // This might help if the content contains the ID
        }
      },
      include: { 
        chatHistory: {
          select: { 
            userId: true,
            id: true
          }
        }
      }
    });

    console.log('Similar messages found:', {
      count: similarMessages.length,
      messageDetails: similarMessages.map(m => ({
        id: m.id,
        content: m.content,
        chatHistoryId: m.chatHistoryId,
        userId: m.chatHistory.userId
      }))
    });

    // Find the message to ensure it belongs to the current user
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { 
        chatHistory: {
          select: { 
            userId: true,
            id: true
          }
        }
      }
    });

    // If no message found with the exact ID, try finding by content
    if (!message) {
      const contentMessage = await prisma.message.findFirst({
        where: { 
          content: messageId,
          chatHistory: {
            userId: session.user.id
          }
        },
        include: { 
          chatHistory: {
            select: { 
              userId: true,
              id: true
            }
          }
        }
      });

      if (contentMessage) {
        console.log('Found message by content:', {
          id: contentMessage.id,
          content: contentMessage.content
        });
        return NextResponse.json({ 
          error: 'Incorrect message ID', 
          details: 'The provided ID does not match a message ID. Did you mean to use the content?',
          suggestedId: contentMessage.id
        }, { status: 400 });
      }
    }

    // Verify the message exists and belongs to the current user
    if (!message) {
      console.error('Delete request: Message not found', { messageId });
      return NextResponse.json({ 
        error: 'Message not found', 
        details: `No message found with ID: ${messageId}` 
      }, { status: 404 });
    }

    if (message.chatHistory.userId !== session.user.id) {
      console.error('Delete request: Unauthorized', { 
        messageId, 
        requestUserId: session.user.id, 
        messageUserId: message.chatHistory.userId 
      });
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: 'You do not have permission to delete this message' 
      }, { status: 403 });
    }

    // Delete the message
    await prisma.message.delete({
      where: { id: messageId }
    });

    console.log('Successfully deleted message', { messageId });

    return NextResponse.json({ 
      message: 'Tweet deleted successfully',
      deletedMessageId: messageId 
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting tweet:', error);
    return NextResponse.json({ 
      error: 'Failed to delete tweet', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
