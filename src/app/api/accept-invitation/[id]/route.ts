import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reqHeaders = await headers();

  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session) {
    const callbackURL = encodeURIComponent(`/api/accept-invitation/${id}`);
    return NextResponse.redirect(
      new URL(`/login?callbackURL=${callbackURL}`, request.url)
    );
  }

  try {
    await auth.api.acceptInvitation({
      body: { invitationId: id },
      headers: reqHeaders
    });
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch {
    return NextResponse.redirect(
      new URL('/dashboard?error=invitation-failed', request.url)
    );
  }
}
