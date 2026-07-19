"use client";

import {
  PostHogProvider as PHProvider,
  usePostHog,
} from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (!pathname || !posthog) return;

    const query = searchParams.toString();
    const url = `${window.origin}${pathname}${query ? `?${query}` : ""}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthog]);

  return null;
}

function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PostHogPageViewTracker />
    </Suspense>
  );
}

export function PostHogProvider({ children }: { children: ReactNode }) {
  if (!posthogKey || !posthogHost) {
    return <>{children}</>;
  }

  return (
    <PHProvider
      apiKey={posthogKey}
      options={{
        api_host: posthogHost,
        person_profiles: "identified_only",
        capture_pageview: false,
      }}
    >
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
