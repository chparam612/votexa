import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let heartbeat: ReturnType<typeof setInterval> | null = null;
      let unsubscribe: (() => void) | null = null;

      const cleanup = () => {
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }
      };

      try {
        // 1. Listen to Firestore real-time updates
        unsubscribe = db.collection('election_metadata').doc('global').onSnapshot(
          (doc) => {
            const data = doc.data();
            if (data) {
              const eventData = `data: ${JSON.stringify(data)}\n\n`;
              controller.enqueue(encoder.encode(eventData));
            }
          },
          (error) => {
            console.error('SSE Snapshot Error:', error);
            // Send an error event so the client can distinguish a server error
            // from a network drop and display a meaningful message.
            try {
              controller.enqueue(
                encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'Firestore connection failed' })}\n\n`)
              );
            } catch {
              // controller may already be closed
            }
            cleanup();
            controller.close();
          }
        );
      } catch (error) {
        // Firebase Admin failed to initialize (e.g. missing credentials).
        console.error('SSE Setup Error:', error);
        try {
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'Server configuration error' })}\n\n`)
          );
        } catch {
          // controller may already be closed
        }
        controller.close();
        return;
      }

      // 2. Keep-alive heartbeat every 30s
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          cleanup();
        }
      }, 30000);

      // 3. Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        cleanup();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
