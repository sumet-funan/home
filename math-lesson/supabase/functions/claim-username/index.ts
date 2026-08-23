// Converts an account that signs in by email into one that signs in by
// username, without ever exposing anyone's real email address to the browser.
//
// Why this has to run server-side: it swaps the account's auth address to an
// internal .invalid one, which needs the admin API. The browser only ever holds
// the anon key, and changing an email from the client is rejected by this
// project anyway.
//
// After conversion the real email is kept in profiles as contact info, so the
// user can still sign in with it -- the lookup for that returns only .invalid
// addresses, so guessing names or emails reveals nothing.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const INTERNAL_DOMAIN = '@mathlesson.invalid';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'unauthorized' }, 401);
  }

  // Identify the caller from their own token; never trust an id sent in the body.
  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await caller.auth.getUser();
  const user = userData?.user;
  if (!user || !user.email) {
    return json({ error: 'unauthorized' }, 401);
  }

  if (user.email.endsWith(INTERNAL_DOMAIN)) {
    return json({ error: 'already_username_account' }, 400);
  }

  let username = '';
  try {
    username = String(((await req.json()) ?? {}).username ?? '').trim().toLowerCase();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  if (!USERNAME_PATTERN.test(username)) {
    return json({ error: 'invalid_username' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: available } = await admin.rpc('username_available', { p_username: username });
  if (available === false) {
    return json({ error: 'username_taken' }, 409);
  }

  const originalEmail = user.email;
  const internalEmail =
    'u' + crypto.randomUUID().replace(/-/g, '') + INTERNAL_DOMAIN;

  // email_confirm skips the confirmation mail, which could never be delivered
  // to a .invalid address and which this project cannot send in any case.
  const { error: emailError } = await admin.auth.admin.updateUserById(user.id, {
    email: internalEmail,
    email_confirm: true,
  });
  if (emailError) {
    return json({ error: 'email_change_failed', detail: emailError.message }, 500);
  }

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: user.id, username, email: originalEmail });

  if (profileError) {
    // Put the address back, or the account would be left signing in with an
    // internal address nobody knows and no username to reach it by.
    await admin.auth.admin.updateUserById(user.id, {
      email: originalEmail,
      email_confirm: true,
    });
    const taken = /duplicate key|unique/i.test(profileError.message);
    return json(
      { error: taken ? 'username_taken' : 'profile_insert_failed', detail: profileError.message },
      taken ? 409 : 500,
    );
  }

  // display copy, so the sidebar and profile can show the name without a query
  await admin.auth.admin.updateUserById(user.id, {
    user_metadata: { ...(user.user_metadata ?? {}), username },
  });

  return json({ ok: true, username, contact_email: originalEmail });
});
