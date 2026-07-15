import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for privileged server-side operations
 * (storage uploads, image URL writes). NEVER import this into client code —
 * it carries the service-role key. Server routes/actions only.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export const BUSINESS_IMAGES_BUCKET = 'business-images'
