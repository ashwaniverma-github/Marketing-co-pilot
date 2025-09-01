import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    console.log("Middleware - Request:", {
      pathname: req.nextUrl.pathname,
      method: req.method,
    });
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Ensure token exists and has a userId
        const isValid = !!(token && (token as any).userId);
        console.log("Middleware - Authorization check:", {
          hasToken: !!token,
          hasUserId: !!(token && (token as any).userId),
          tokenKeys: token ? Object.keys(token) : [],
          userId: token ? (token as any).userId : null,
          isValid,
        });
        return isValid;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboard/:path*",
    "/api/analyze-product",
    "/api/apps",
    "/api/enhanced-analysis",
    "/api/posts",
    "/api/post-to-social",
  ],
};
