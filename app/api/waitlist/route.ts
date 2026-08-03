import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('[waitlist] POST called')
  try {
    const body = await request.json()
    console.log('[waitlist] body:', body)

    const { name, email, business_type, city } = body as {
      name: string
      email: string
      business_type?: string
      city: string
    }

    if (!name || !email || !city) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    console.log('[waitlist] creating supabase client')
    console.log('[waitlist] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('[waitlist] KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('[waitlist] inserting...')
    const { data, error } = await supabase
      .from('waitlist')
      .insert({ name, email, business_type, city })
      .select()

    console.log('[waitlist] result:', { data, error })

    if (error) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === '23505' ? 409 : 500 }
      )
    }

    return NextResponse.json({ success: true, message: "You're on the list!" })
  } catch (err) {
    console.error('[waitlist] caught error:', err)
    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}
