import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboard/:path*",
    "/generate-kit/:path*",
    "/api/analyze-product",
    "/api/analytics",
    "/api/apps",
    "/api/enhanced-analysis",
    "/api/generate-kit",
    "/api/growth-suggestions",
    "/api/posts",
    "/api/post-to-social",
  ],
};
