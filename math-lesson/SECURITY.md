# Security notes — Math Lesson

Reviewed 2026-08-19 against the live Supabase project (`tczmgtztaaxibfrsqiaa`)
and the deployed site at <https://sumet-funan.github.io/home/math-lesson/>.

Everything below was **tested against the real backend**, not reasoned about.
Nothing here is urgent for a family/classroom app. The items in "Open items"
matter more the wider the app is shared.

---

## Verified working

| Check | Result |
| --- | --- |
| Anonymous read of `profiles`, `attempts`, `quiz_results`, `retired_usernames` | 0 rows — RLS blocks all four |
| Insert a row under another user's `user_id` | rejected, Postgres `42501` |
| Update or delete your own `attempts` rows | silently affects 0 rows — no UPDATE/DELETE policy exists, so history is append-only |
| Direct write to `retired_usernames` | rejected, `42501` |
| `service_role` key present in shipped site | absent — only inside the Edge Function, which runs server-side |
| Harvesting real emails by guessing usernames | not possible — `auth_email_for_username` / `auth_email_for_contact` return only `@mathlesson.invalid` addresses |
| Discovering valid usernames through the login form | not possible — an unknown username returns the same message as a wrong password |
| Stored XSS via lesson answers on the Progress page | not possible — expressions are inserted with `.text()` / escaped |

The `anon` key is public **by design**; any browser app must expose it. RLS is
what protects the data, not secrecy of that key. Never ship the `service_role`
key — it bypasses RLS entirely.

---

## Open items

### 1. Minimum password length is 6 — *highest value fix*

Weakest link, because usernames are guessable and short passwords are cheap to
try. Kids will pick weak passwords.

**Fix:** Supabase Dashboard → Authentication → Policies → set minimum password
length to at least 8. Optionally require a character class. Note this only
applies to *new* passwords; existing ones are unaffected.

### 2. `username_available` is public and unthrottled

Anyone can enumerate which usernames exist. Usernames aren't secret, so this is
low severity on its own — but it hands an attacker a list of valid targets to
try passwords against.

**Fix options (in order of effort):**
- Accept it (reasonable for a small private app), *or*
- Move the availability check into the `claim-username` Edge Function and drop
  the public `grant execute ... to anon`, so it is only callable while
  authenticated, *or*
- Add a rate limit in front of it.

Do **not** "fix" this by making login report "no such user" — that would
reintroduce enumeration through a worse channel.

### 3. Anyone on the internet can register

The site is public with no CAPTCHA and email confirmation is disabled, so
accounts can be created in bulk and fill the free tier.

**Fix options:**
- Enable CAPTCHA: Supabase Dashboard → Authentication → Bot and Abuse
  Protection (hCaptcha/Turnstile), then pass the token in `signUp`, *or*
- Gate registration behind a shared invite code checked in an Edge Function.

### 4. A user can forge their own progress

Inserting an arbitrary `attempts` row for **your own** `user_id` is accepted —
confirmed by inserting one with `expression = 'forged'`. Only ever affects that
user's own statistics; no other account is reachable.

For a practice app this is cosmetic. It only matters if progress is ever used
for something that counts (grades, competition, rewards). Proper fixes would
mean validating answers server-side, which is a large change — don't do it
unless the stakes change.

---

## Operational hazards (not vulnerabilities, but they bite)

### Deleting `profiles` rows locks converted accounts out

An account converted by `claim-username` signs in via an internal
`@mathlesson.invalid` address. The **only** things mapping its username or its
real email to that address are its `profiles` row. Delete the row and neither
login route works — the account is reachable only by typing the internal
address directly.

Happened once already, on 2026-08-19, while clearing username data.

**Before clearing `profiles`:** either delete the accounts themselves (which
cascades cleanly), or first restore each converted account's real email in
Authentication → Users so email login still works.

### No password reset

Email sending fails project-wide, so a forgotten password must be reset by an
admin in the Dashboard. Changing a user's email through the API also fails for
every account — the error misleadingly claims the *current* address is invalid.
Configuring SMTP would fix password reset for accounts that have a contact
email on file.

---

## Re-testing

Paste into the browser console on the site while **signed out** to re-check the
anonymous surface:

```js
(async () => {
  for (const t of ['profiles','attempts','quiz_results','retired_usernames']) {
    const r = await supabaseClient.from(t).select('*');
    console.log(t, r.error ? 'blocked' : r.data.length + ' rows (expect 0)');
  }
  const w = await supabaseClient.from('attempts').insert({
    user_id: '00000000-0000-0000-0000-000000000000', lesson_id: 'x', is_correct: true });
  console.log('cross-user insert:', w.error ? 'rejected (good)' : 'ACCEPTED (BAD)');
})();
```

Any table returning rows while signed out, or an accepted cross-user insert,
means an RLS policy has regressed and should be fixed immediately.
