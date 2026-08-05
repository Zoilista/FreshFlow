import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  
  try {
    const body = await request.json()
    

    const { name, email, business_type, city } = body as {
      name: string
      email: string
      business_type?: string
      city: string
    }

    if (!name || !email || !city) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    
    
    

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    
    const { error } = await supabase
      .from('waitlist')
      .insert({ name, email, business_type, city })
      .select()

    

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
