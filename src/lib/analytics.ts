import 'server-only';

import { PostHog } from 'posthog-node';

let client: PostHog | null = null;

export function getPosthogServer(): PostHog | null {
  if (client) return client;
  const key = process.env.POSTHOG_API_KEY;
  if (!key) return null;
  client = new PostHog(key, {
    host: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    flushAt: 1,
  });
  return client;
}

export function captureServerEvent(distinctId: string, event: string, properties?: Record<string, any>) {
  const ph = getPosthogServer();
  if (!ph) return;
  ph.capture({ distinctId, event, properties });
}

export function identifyServerUser(distinctId: string, properties?: Record<string, any>) {
  const ph = getPosthogServer();
  if (!ph) return;
  ph.identify({ distinctId, properties });
}

export async function shutdownPosthog() {
  if (!client) return;
  await client.shutdown();
  client = null;
}


