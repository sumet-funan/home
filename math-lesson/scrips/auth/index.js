const SUPABASE_URL = 'https://tczmgtztaaxibfrsqiaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjem1ndHp0YWF4aWJmcnNxaWFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNjU0MjUsImV4cCI6MjEwMjY0MTQyNX0.8U_QX18vIPTYo49f8aYaZUYR4NYSD-WRZEDZ5ehDDUE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase Auth has no username+password provider, so a username is mapped to a
// synthetic address under a reserved TLD (RFC 2606 guarantees .invalid never
// resolves, so no mail can ever reach a real domain). The username the user
// actually typed is kept in user_metadata for display.
const AUTH_USERNAME_DOMAIN = '@mathlesson.invalid';
const AUTH_USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

function usernameToAuthEmail(username) {
    return username.toLowerCase() + AUTH_USERNAME_DOMAIN;
}

function getDisplayName(user) {
    if (user.user_metadata && user.user_metadata.username) {
        return user.user_metadata.username;
    }
    return user.email ? user.email.split('@')[0] : '';
}

function validateUsername(username) {
    if (!username) {
        return 'กรุณากรอกชื่อผู้ใช้';
    }
    if (!AUTH_USERNAME_PATTERN.test(username.toLowerCase())) {
        return 'ชื่อผู้ใช้ต้องเป็น a-z, 0-9 หรือ _ ความยาว 3-20 ตัวอักษร';
    }
    return '';
}

function mapAuthErrorToThai(message) {
    if (!message) {
        return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
    }
    if (message.indexOf('already registered') !== -1) {
        return 'ชื่อผู้ใช้นี้ถูกใช้แล้ว';
    }
    if (message.indexOf('Invalid login credentials') !== -1) {
        return 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    }
    if (message.indexOf('Password should be at least') !== -1) {
        return 'รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัวอักษร)';
    }
    return 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
}

function renderAccountUI(user) {
    let $account = $('#appAccount');

    if (user) {
        $account.html(
            '<div class="app-account-info">' +
                '<i class="bi bi-person-check-fill"></i>' +
                '<span class="app-account-email">' + getDisplayName(user) + '</span>' +
            '</div>' +
            '<button type="button" class="app-account-signout-btn" id="appAccountSignOutBtn" title="ออกจากระบบ">' +
                '<i class="bi bi-box-arrow-right"></i>' +
            '</button>'
        );
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
    $('#signinUsername, #signinPassword, #registerUsername, #registerPassword, #registerPasswordConfirm').val('');
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
    let username = $('#signinUsername').val().trim();
    let password = $('#signinPassword').val();
    let $error = $('#signinError');
    let $btn = $(this);

    $error.text('');

    if (!username || !password) {
        $error.text('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
        return;
    }

    $btn.prop('disabled', true).text('กำลังเข้าสู่ระบบ...');

    supabaseClient.auth.signInWithPassword({ email: usernameToAuthEmail(username), password: password }).then(function (result) {
        $btn.prop('disabled', false).text('เข้าสู่ระบบ');

        if (result.error) {
            $error.text(mapAuthErrorToThai(result.error.message));
            return;
        }

        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    });
});

$('#registerSubmitBtn').on('click', function () {
    let username = $('#registerUsername').val().trim();
    let password = $('#registerPassword').val();
    let passwordConfirm = $('#registerPasswordConfirm').val();
    let $error = $('#registerError');
    let $btn = $(this);

    $error.text('');

    let usernameError = validateUsername(username);
    if (usernameError) {
        $error.text(usernameError);
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

    supabaseClient.auth.signUp({
        email: usernameToAuthEmail(username),
        password: password,
        options: { data: { username: username.toLowerCase() } }
    }).then(function (result) {
        $btn.prop('disabled', false).text('สมัครสมาชิก');

        if (result.error) {
            $error.text(mapAuthErrorToThai(result.error.message));
            return;
        }

        let user = result.data.user;
        if (user && user.identities && user.identities.length === 0) {
            $error.text('ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเข้าสู่ระบบแทน');
            return;
        }

        bootstrap.Modal.getInstance(document.getElementById('authModal')).hide();
    });
});

supabaseClient.auth.onAuthStateChange(function (event, session) {
    renderAccountUI(session ? session.user : null);
});

supabaseClient.auth.getSession().then(function (result) {
    renderAccountUI(result.data.session ? result.data.session.user : null);
});
