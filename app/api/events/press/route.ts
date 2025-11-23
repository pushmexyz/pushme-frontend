import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      // Still return success for MVP - events will be logged when Supabase is configured
      return NextResponse.json({ ok: true, warning: 'Database not configured' });
    }

    const body = await request.json();
    const { wallet, username, anonymous } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Insert event
    const { error } = await supabase.from('events').insert({
      wallet,
      username: anonymous ? null : username || null,
      type: 'press',
      metadata: {},
    });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to record press event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error recording press event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

