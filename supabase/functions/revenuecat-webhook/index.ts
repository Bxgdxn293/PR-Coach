// Supabase Edge Function: keeps profiles.is_premium in sync with RevenueCat.
// Deploy:  supabase functions deploy revenuecat-webhook --no-verify-jwt
// Secrets: supabase secrets set REVENUECAT_WEBHOOK_SECRET=<long random string>
// RevenueCat dashboard > Integrations > Webhooks: URL = this function's URL,
// Authorization header value = the same secret.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const GRANT = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE'];
const REVOKE = ['EXPIRATION'];

Deno.serve(async (req) => {
  if (req.headers.get('Authorization') !== Deno.env.get('REVENUECAT_WEBHOOK_SECRET')) {
    return new Response('unauthorized', { status: 401 });
  }
  let event: any;
  try {
    ({ event } = await req.json());
  } catch {
    return new Response('bad request', { status: 400 });
  }
  const userId: string | undefined = event?.app_user_id;
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    return new Response('ignored', { status: 200 });
  }
  let premium: boolean | null = null;
  if (GRANT.includes(event.type)) premium = true;
  if (REVOKE.includes(event.type)) premium = false;
  if (premium === null) return new Response('ignored', { status: 200 });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error } = await admin
    .from('profiles')
    .upsert({ id: userId, is_premium: premium, updated_at: new Date().toISOString() }); // upsert: users created before the trigger have no row
  if (error?.code === '23503') return new Response('ignored', { status: 200 }); // unknown user: retrying will not help
  if (error) return new Response(error.message, { status: 500 });
  return new Response('ok', { status: 200 });
});
