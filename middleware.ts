import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Supabase session protection should be added here after project credentials
  // are configured. The starter intentionally leaves demo admin screens visible
  // so the UI can be reviewed before Supabase setup.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};