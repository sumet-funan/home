// Getting back into an account without email. This project cannot send mail, and
// many children have no address on file, so each account holds a recovery code
// instead: the code proves ownership, and the username says which account.
//
// A username alone can never be enough, because usernames are not secret. A
// classmate who knows one could otherwise take the account.
//
// The browser only holds the anon key, while setting another user's password
// needs the admin API, so this has to run here. Expected failures still answer
// 200 with an `error` field, which is what supabase-js lets the page read.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
// no 0, O, 1, I or L, which are easy to misread off a piece of paper
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;
const MIN_PASSWORD_LENGTH = 6;

const WINDOW_MS = 60 * 60 * 1000;
const MAX_USERNAME_FAILURES = 5;
const MAX_ADDRESS_FAILURES = 20;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateCode() {
  const picked = [];
  // 248 is the largest multiple of the alphabet's 31 letters that fits in a
  // byte; dropping anything above it keeps every letter equally likely
  while (picked.length < CODE_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
      if (byte < 248 && picked.length < CODE_LENGTH) {
        picked.push(CODE_ALPHABET[byte % CODE_ALPHABET.length]);
      }
    }
  }
  return picked.slice(0, 4).join('') + '-' + picked.slice(4).join('');
}

// so that a code typed in lower case, or without its dash, still matches
function normalizeCode(input: unknown) {
  return String(input ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Keyed rather than a plain hash: an 8 letter code could be guessed offline from
// a leaked table otherwise. The key is the service role key, so rotating that
// key cancels every code and each child has to make a new one.
async function hashCode(code: string, key: string) {
  const encoder = new TextEncoder();
  const hmacKey = await crypto.subtle.importKey(
    'raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', hmacKey, encoder.encode(normalizeCode(code)));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  let body;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return json({ error: 'bad_request' });
  }

  async function storeNewCode(userId: string) {
    const code = generateCode();
    const { error } = await admin.from('recovery_codes').upsert({
      user_id: userId,
      code_hash: await hashCode(code, serviceKey),
      created_at: new Date().toISOString(),
    });
    return error ? null : code;
  }

  // Never trust an id sent in the body: the caller is whoever the token says.
  async function currentUser() {
    const caller = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data } = await caller.auth.getUser();
    return data?.user ?? null;
  }

  async function failuresIn(bucket: string) {
    const since = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count } = await admin.from('recovery_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('bucket', bucket)
      .gte('created_at', since);
    return count ?? 0;
  }

  async function recordFailure(buckets: string[]) {
    await admin.from('recovery_attempts').insert(buckets.map((bucket) => ({ bucket })));
    const stale = new Date(Date.now() - WINDOW_MS).toISOString();
    await admin.from('recovery_attempts').delete().lt('created_at', stale);
  }

  const address = 'ip:' + (req.headers.get('cf-connecting-ip') ??
    (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim());

  if (body.action === 'status' || body.action === 'issue') {
    const user = await currentUser();
    if (!user) {
      return json({ error: 'unauthorized' });
    }

    // the way back in starts from a username, so an account needs one first
    const { data: profile } = await admin.from('profiles')
      .select('id').eq('id', user.id).maybeSingle();
    if (!profile) {
      return json({ error: 'no_username' });
    }

    if (body.action === 'status') {
      const { data: existing } = await admin.from('recovery_codes')
        .select('created_at').eq('user_id', user.id).maybeSingle();
      return json({ ok: true, created_at: existing?.created_at ?? null });
    }

    const code = await storeNewCode(user.id);
    return json(code ? { ok: true, code } : { error: 'failed' });
  }

  if (body.action === 'find_username') {
    if (await failuresIn(address) >= MAX_ADDRESS_FAILURES) {
      return json({ error: 'too_many' });
    }

    const { data: match } = await admin.from('recovery_codes')
      .select('user_id').eq('code_hash', await hashCode(body.code, serviceKey)).maybeSingle();
    const { data: profile } = match
      ? await admin.from('profiles').select('username').eq('id', match.user_id).maybeSingle()
      : { data: null };

    if (!profile) {
      await recordFailure([address]);
      return json({ error: 'invalid' });
    }
    return json({ ok: true, username: profile.username });
  }

  if (body.action === 'reset_password') {
    const username = String(body.username ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (password.length < MIN_PASSWORD_LENGTH) {
      return json({ error: 'weak_password' });
    }
    if (!USERNAME_PATTERN.test(username)) {
      return json({ error: 'invalid' });
    }

    const nameBucket = 'name:' + username;
    if (await failuresIn(nameBucket) >= MAX_USERNAME_FAILURES || await failuresIn(address) >= MAX_ADDRESS_FAILURES) {
      return json({ error: 'too_many' });
    }

    const { data: profile } = await admin.from('profiles')
      .select('id, username').eq('username', username).maybeSingle();
    const { data: stored } = profile
      ? await admin.from('recovery_codes').select('code_hash').eq('user_id', profile.id).maybeSingle()
      : { data: null };

    // an unknown name, an account with no code and a wrong code all look the
    // same from outside, so this cannot be used to discover who has an account
    if (!stored || stored.code_hash !== await hashCode(body.code, serviceKey)) {
      await recordFailure([nameBucket, address]);
      return json({ error: 'invalid' });
    }

    const { error } = await admin.auth.admin.updateUserById(profile.id, { password });
    if (error) {
      return json({ error: /password/i.test(error.message) ? 'weak_password' : 'failed' });
    }

    // A code that has been used may have been seen, so it stops working here.
    await admin.from('recovery_attempts').delete().eq('bucket', nameBucket);
    return json({ ok: true, username: profile.username, code: await storeNewCode(profile.id) });
  }

  return json({ error: 'bad_request' });
});
