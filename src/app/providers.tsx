'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { SessionProvider, useSession } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <PostHogProvider client={posthog}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Suspense fallback={null}>
          <PostHogInit />
        </Suspense>
      </PostHogProvider>
    </SessionProvider>
  );
}

function PostHogInit() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // Initialize PostHog once on the client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      capture_pageview: false,
      person_profiles: 'identified_only',
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: 'input, textarea, [data-ph-mask]',
      },
    });
  }, []);

  // Identify the user when session is available
  useEffect(() => {
    const userId = (session as any)?.user?.id || (session as any)?.userId;
    if (!userId) return;

    posthog.identify(String(userId), {
      email: (session as any)?.user?.email || undefined,
      name: (session as any)?.user?.name || undefined,
    });
  }, [session]);

  // Capture pageviews on route changes
  useEffect(() => {
    if (!pathname) return;
    // Include full URL for better context
    posthog.capture('$pageview', { $current_url: window.location.href });
  }, [pathname, searchParams]);

  // Capture button clicks globally on all pages
  useEffect(() => {
    // Only attach if a key is present (PostHog initialized in this process)
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    // Avoid duplicate listeners in Fast Refresh/Strict Effects
    if ((window as any).__phButtonListenerAdded) return;
    (window as any).__phButtonListenerAdded = true;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest(
        'button, [role="button"], a[role="button"]'
      ) as HTMLElement | null;
      if (!clickable) return;

      const text = (clickable.textContent || '').trim().slice(0, 200) || undefined;
      const name = clickable.getAttribute('data-ph-name') || text || 'button';
      const href = (clickable as HTMLAnchorElement).href || undefined;

      posthog.capture('button_click', {
        name,
        text,
        id: clickable.id || undefined,
        classes: clickable.className || undefined,
        role: clickable.getAttribute('role') || undefined,
        href,
        path: window.location.pathname,
        url: window.location.href,
      });
    };

    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true } as any);
      (window as any).__phButtonListenerAdded = false;
    };
  }, []);

  // Auto-annotate buttons with data-ph-name for consistency
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    if ((window as any).__phNameObserverAdded) return;
    (window as any).__phNameObserverAdded = true;

    const selector = 'button, [role="button"], a[role="button"]';

    const deriveName = (el: HTMLElement): string | undefined => {
      const explicit = el.getAttribute('data-ph-name');
      if (explicit) return explicit;
      const aria = el.getAttribute('aria-label') || undefined;
      if (aria) return aria;
      const title = el.getAttribute('title') || undefined;
      if (title) return title;
      const text = (el.textContent || '').trim().slice(0, 200) || undefined;
      return text;
    };

    const annotate = (root: ParentNode | Document) => {
      const nodes = (root instanceof Element ? [root, ...Array.from(root.querySelectorAll(selector))] : Array.from(document.querySelectorAll(selector))) as HTMLElement[];
      for (const el of nodes) {
        if (!el.matches || !el.matches(selector)) continue;
        if (!el.getAttribute('data-ph-name')) {
          const name = deriveName(el);
          if (name) el.setAttribute('data-ph-name', name);
        }
      }
    };

    // Initial pass
    annotate(document);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'childList') {
          m.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              annotate(node as Element);
            }
          });
        } else if (m.type === 'attributes' && m.target instanceof HTMLElement) {
          const el = m.target as HTMLElement;
          if (el.matches(selector) && !el.getAttribute('data-ph-name')) {
            const name = deriveName(el);
            if (name) el.setAttribute('data-ph-name', name);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-label', 'title'],
    });

    return () => {
      observer.disconnect();
      (window as any).__phNameObserverAdded = false;
    };
  }, []);

  return null;
}
