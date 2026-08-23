const SUPABASE_URL = 'https://tczmgtztaaxibfrsqiaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjem1ndHp0YWF4aWJmcnNxaWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNjU0MjUsImV4cCI6MjEwMjY0MTQyNX0.8U_QX18vIPTYo49f8aYaZUYR4NYSD-WRZEDZ5ehDDUE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// A username is stored as an address under a reserved TLD (RFC 2606 guarantees
// .invalid never resolves, so no mail can reach a real domain). That puts
// usernames in the same auth.users.email column Postgres already keeps a unique
// index on, so duplicates are rejected by the database rather than by a check
// the app could race or forget. It also means signing in needs no lookup of
// another account's row, which would otherwise expose real email addresses.
const AUTH_USERNAME_DOMAIN = '@mathlesson.invalid';
const AUTH_USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

// Accepts either form in one field: anything with an "@" is an email, anything
// else is a username. Usernames cannot contain "@", so the two never collide.
function resolveAuthIdentifier(input) {
    let value = (input || '').trim();

    if (!value) {
        return { error: 'กรุณากรอกชื่อผู้ใช้หรืออีเมล' };
    }

    if (value.indexOf('@') !== -1) {
        return { email: value, username: null };
    }

    let username = value.toLowerCase();
    if (!AUTH_USERNAME_PATTERN.test(username)) {
        return { error: 'ชื่อผู้ใช้ต้องเป็น a-z, 0-9 หรือ _ ความยาว 3-20 ตัวอักษร' };
    }

    return { email: null, username: username };
}

// The account's address is random and permanent, so renaming never has to
// change it — which matters because email changes are rejected on this project,
// and a .invalid address could never confirm one anyway. It also means a freed
// username is never blocked by a leftover address.
function generateInternalAuthEmail() {
    let id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID().replace(/-/g, '')
        : String(Date.now()) + Math.random().toString(36).slice(2, 12);
    return 'u' + id + AUTH_USERNAME_DOMAIN;
}

// Usernames live in profiles now, so signing in needs a lookup. The function
// only ever returns .invalid addresses, so this cannot expose a real email.
function lookupAuthEmailForUsername(username) {
    return supabaseClient
        .rpc('auth_email_for_username', { p_username: username })
        .then(function (result) {
            return result.error ? null : result.data;
        });
}

function mapAuthErrorToThai(message, usedUsername) {
    if (!message) {
        return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
    }
    if (message.indexOf('already registered') !== -1) {
        return usedUsername ? 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' : 'อีเมลนี้ถูกใช้สมัครแล้ว';
    }
    if (message.indexOf('Invalid login credentials') !== -1) {
        return usedUsername ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
    }
    if (message.indexOf('Password should be at least') !== -1) {
        return 'รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัวอักษร)';
    }
    if (message.toLowerCase().indexOf('email') !== -1 && message.toLowerCase().indexOf('invalid') !== -1) {
        return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
}

// Username accounts must never show their internal .invalid address.
function getAccountIdentityLabel(user) {
    let metadata = user.user_metadata || {};
    if (metadata.username) {
        return metadata.username;
    }
    let email = user.email || '';
    return email.indexOf(AUTH_USERNAME_DOMAIN) !== -1
        ? email.slice(0, email.indexOf(AUTH_USERNAME_DOMAIN))
        : email;
}

// The sign-in identity is the only name shown anywhere. A separate editable
// display name meant a child could see one name in the sidebar while signing
// in with another, and had no reliable way to find the name they log in with.
function getAccountDisplayName(user) {
    return getAccountIdentityLabel(user);
}

function renderAccountUI(user) {
    let $account = $('#appAccount');

    if (user) {
        $account.html(
            '<div class="app-account-info">' +
                '<i class="bi bi-person-check-fill"></i>' +
                '<span class="app-account-email"></span>' +
            '</div>' +
            '<button type="button" class="app-account-signout-btn" id="appAccountSignOutBtn" title="ออกจากระบบ">' +
                '<i class="bi bi-box-arrow-right"></i>' +
            '</button>'
        );
        // .text() so a display name containing markup renders as literal text
        $account.find('.app-account-email').text(getAccountDisplayName(user));
    } else {
        $account.html(
            '<button type="button" class="app-account-btn" id="appAccountSignInBtn">' +
                '<i class="bi bi-person-circle"></i> เข้าสู่ระบบ' +
            '</button>'
        );
    }
}

function resetAuthModal() {
    $('.auth-error').text('');
    $('#signinIdentifier, #signinPassword, #registerIdentifier, #registerPassword, #registerPasswordConfirm').val('');
    $('#authTabPicker .mode-btn').removeClass('active');
    $('#authTabPicker .mode-btn[data-auth-tab="signin"]').addClass('active');
    $('.auth-tab-panel').removeClass('active');
    $('#authPanelSignin').addClass('active');
}

$(document).on('click', '#appAccountSignInBtn', function () {
    resetAuthModal();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('authModal')).show();
});

$(document).on('click', '#appAccountSignOutBtn', function () {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('signOutModal')).show();
});

$('#signOutConfirmBtn').on('click', function () {
    bootstrap.Modal.getInstance(document.getElementById('signOutModal')).hide();
    supabaseClient.auth.signOut();
});

$('#authTabPicker').on('click', '.mode-btn', function () {
    let tab = $(this).data('auth-tab');

    $('#authTabPicker .mode-btn').removeClass('active');
    $(this).addClass('active');

    $('.auth-tab-panel').removeClass('active');
    $('#authPanel' + (tab === 'signin' ? 'Signin' : 'Register')).addClass('active');
});

$('#signinSubmitBtn').on('click', function () {
    let password = $('#signinPassword').val();
    let $error = $('#signinError');
    let $btn = $(this);

    $error.text('');

    let identity = resolveAuthIdentifier($('#signinIdentifier').val());
    if (identity.error) {
        $error.text(identity.error);
        return;
    }
    if (!password) {
        $error.text('กรุณากรอกรหัสผ่าน');
        return;
    }

    $btn.prop('disabled', true).text('กำลังเข้าสู่ระบบ...');

    let emailPromise = identity.email
        ? Promise.resolve(identity.email)
        : lookupAuthEmailForUsername(identity.username);

    emailPromise.then(function (email) {
        if (!email) {
            // unknown username: same wording as a bad password, so this cannot
            // be used to discover which usernames exist
            $btn.prop('disabled', false).text('เข้าสู่ระบบ');
            $error.text('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            return;
        }

        return supabaseClient.auth.signInWithPassword({ email: email, password: password }).then(function (result) {
            $btn.prop('disabled', false).text('เข้าสู่ระบบ');

            if (result.error) {
                $error.text(mapAuthErrorToThai(result.error.message, !!identity.username));
                return;
            }

            bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
        });
    });
});

$('#registerSubmitBtn').on('click', function () {
    let password = $('#registerPassword').val();
    let passwordConfirm = $('#registerPasswordConfirm').val();
    let $error = $('#registerError');
    let $btn = $(this);

    $error.text('');

    let identity = resolveAuthIdentifier($('#registerIdentifier').val());
    if (identity.error) {
        $error.text(identity.error);
        return;
    }
    if (!password) {
        $error.text('กรุณากรอกรหัสผ่าน');
        return;
    }
    if (password.length < 6) {
        $error.text('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
    }
    if (password !== passwordConfirm) {
        $error.text('รหัสผ่านไม่ตรงกัน');
        return;
    }

    $btn.prop('disabled', true).text('กำลังสมัครสมาชิก...');

    let done = function (message) {
        $btn.prop('disabled', false).text('สมัครสมาชิก');
        if (message) {
            $error.text(message);
            return;
        }
        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    };

    if (!identity.username) {
        supabaseClient.auth.signUp({ email: identity.email, password: password }).then(function (result) {
            if (result.error) {
                done(mapAuthErrorToThai(result.error.message, false));
                return;
            }
            let user = result.data.user;
            // Supabase can obscure a duplicate by returning a user with no
            // identities instead of an error, so treat that as taken too.
            if (user && user.identities && user.identities.length === 0) {
                done('อีเมลนี้ถูกใช้สมัครแล้ว กรุณาเข้าสู่ระบบแทน');
                return;
            }
            done(null);
        });
        return;
    }

    // Checked up front so the common case fails before an account is created.
    // The database still has the final say, since two people could pass this
    // check at the same instant.
    supabaseClient.rpc('username_available', { p_username: identity.username }).then(function (avail) {
        if (!avail.error && avail.data === false) {
            done('ชื่อผู้ใช้นี้ถูกใช้แล้ว');
            return;
        }

        return supabaseClient.auth.signUp({
            email: generateInternalAuthEmail(),
            password: password,
            options: { data: { username: identity.username } }
        }).then(function (result) {
            if (result.error) {
                done(mapAuthErrorToThai(result.error.message, true));
                return;
            }

            let user = result.data.user;
            if (!user) {
                done('เกิดข้อผิดพลาด กรุณาลองอีกครั้ง');
                return;
            }

            return supabaseClient.from('profiles')
                .insert({ id: user.id, username: identity.username })
                .then(function (ins) {
                    if (!ins.error) {
                        done(null);
                        return;
                    }
                    // The name was taken in the gap since the check. Sign back
                    // out so the half-made account cannot be used under a name
                    // it does not own.
                    return supabaseClient.auth.signOut().then(function () {
                        done('ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น');
                    });
                });
        });
    });
});

supabaseClient.auth.onAuthStateChange(function (event, session) {
    renderAccountUI(session ? session.user : null);
});

supabaseClient.auth.getSession().then(function (result) {
    renderAccountUI(result.data.session ? result.data.session.user : null);
});
