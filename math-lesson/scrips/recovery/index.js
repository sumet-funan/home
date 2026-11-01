// Forgotten username or password. This project cannot send email, so an account
// is recovered with a code the child or parent keeps. The work happens in the
// account-recovery Edge Function, which never lets a username alone reset anything.
var recoveryObj = {
    mode: "password",
    username: '',
}

const RECOVERY_MESSAGES = {
    too_many: 'ลองผิดหลายครั้งเกินไป กรุณารอ 1 ชั่วโมงแล้วลองใหม่',
    weak_password: 'รหัสผ่านนี้ใช้ไม่ได้ กรุณาตั้งให้ยาวขึ้นหรือเดายากขึ้น',
};

function invokeRecovery(body) {
    return supabaseClient.functions.invoke('account-recovery', { body: body })
        .then(function (result) {
            return result.error ? { error: 'failed' } : result.data;
        })
        .catch(function () {
            return { error: 'failed' };
        });
}

function recoveryErrorText(error, invalidText) {
    if (error === 'invalid') {
        return invalidText;
    }
    return RECOVERY_MESSAGES[error] || 'เกิดข้อผิดพลาด กรุณาลองอีกครั้ง';
}

function showRecoveryCode(code) {
    $('#recoveryCodeValue').text(code);
    $('#recoveryCopyBtn').html('<i class="bi bi-clipboard"></i> คัดลอก');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('recoveryCodeModal')).show();
}

// Called once a new account exists. It has to be a separate step, because a
// code can only be issued to a signed-in account. If it fails the account is
// still fine, and the profile page offers to make one.
function issueRecoveryCodeForNewAccount() {
    invokeRecovery({ action: 'issue' }).then(function (result) {
        if (result.code) {
            showRecoveryCode(result.code);
        }
    });
}

function showRecoverForm() {
    let forPassword = recoveryObj.mode === 'password';

    $('#recoverForm').show();
    $('#recoverDone').hide();
    $('#recoverError').text('');
    $('#recoverUsername, #recoverPassword, #recoverPasswordConfirm').toggle(forPassword);
    $('#recoverSubmitBtn').text(forPassword ? 'ตั้งรหัสผ่านใหม่' : 'ดูชื่อผู้ใช้');
}

function showRecoverPanel() {
    resetAuthModal();
    recoveryObj.mode = 'password';
    $('#recoverModePicker .mode-btn').removeClass('active');
    $('#recoverModePicker [data-recover="password"]').addClass('active');
    $('#authTabPicker').hide();
    $('.auth-tab-panel').removeClass('active');
    $('#authPanelRecover').addClass('active');
    showRecoverForm();
}

function leaveRecoverPanel(username) {
    resetAuthModal();
    $('#authTabPicker').show();
    $('#signinIdentifier').val(username || '');
}

function showRecoverDone(message, username, code) {
    recoveryObj.username = username;
    $('#recoverForm').hide();
    $('#recoverDone').show();
    $('#recoverDoneMessage').text(message);
    $('#recoverDoneUsername').text(username);
    $('#recoverDoneCodeBlock').toggle(!!code);
    $('#recoverDoneCode').text(code || '');
}

function submitPasswordReset() {
    let username = $('#recoverUsername').val().trim().toLowerCase();
    let code = $('#recoverCode').val().trim();
    let password = $('#recoverPassword').val();
    let $error = $('#recoverError');

    if (!username) {
        $error.text('กรุณากรอกชื่อผู้ใช้');
        return;
    }
    if (!code) {
        $error.text('กรุณากรอกรหัสกู้คืน');
        return;
    }
    if (password.length < 6) {
        $error.text('รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
    }
    if (password !== $('#recoverPasswordConfirm').val()) {
        $error.text('รหัสผ่านไม่ตรงกัน');
        return;
    }

    return invokeRecovery({ action: 'reset_password', username: username, code: code, password: password }).then(function (result) {
        if (!result.ok) {
            $error.text(recoveryErrorText(result.error, 'ชื่อผู้ใช้หรือรหัสกู้คืนไม่ถูกต้อง'));
            return;
        }
        showRecoverDone('ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว รหัสกู้คืนเดิมใช้ไม่ได้อีก ให้จดรหัสใหม่นี้ไว้แทน', result.username, result.code);
    });
}

function submitFindUsername() {
    let code = $('#recoverCode').val().trim();
    let $error = $('#recoverError');

    if (!code) {
        $error.text('กรุณากรอกรหัสกู้คืน');
        return;
    }

    return invokeRecovery({ action: 'find_username', code: code }).then(function (result) {
        if (!result.ok) {
            $error.text(recoveryErrorText(result.error, 'รหัสกู้คืนไม่ถูกต้อง'));
            return;
        }
        showRecoverDone('ชื่อผู้ใช้ของคุณคือ', result.username, null);
    });
}

$('#authForgotBtn').on('click', showRecoverPanel);

$('#recoverBackBtn').on('click', function () {
    leaveRecoverPanel('');
});

$('#recoverSigninBtn').on('click', function () {
    leaveRecoverPanel(recoveryObj.username);
    $('#signinPassword').trigger('focus');
});

$('#recoverModePicker').on('click', '.mode-btn', function () {
    $('#recoverModePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    recoveryObj.mode = $(this).data('recover');
    showRecoverForm();
});

$('#recoverSubmitBtn').on('click', function () {
    let $btn = $(this);

    $('#recoverError').text('');
    let pending = recoveryObj.mode === 'password' ? submitPasswordReset() : submitFindUsername();

    if (pending) {
        $btn.prop('disabled', true);
        pending.then(function () {
            $btn.prop('disabled', false);
        });
    }
});

$('#recoveryCopyBtn').on('click', function () {
    let $btn = $(this);

    // the clipboard can refuse on older browsers; the code stays on screen to copy by hand
    if (navigator.clipboard) {
        navigator.clipboard.writeText($('#recoveryCodeValue').text()).then(function () {
            $btn.html('<i class="bi bi-check2"></i> คัดลอกแล้ว');
        });
    }
});

// ---------- the profile page ----------

function renderRecoveryStatus(result) {
    let $status = $('#profileRecoveryStatus');
    let $btn = $('#profileRecoveryBtn');

    if (result.error === 'no_username') {
        $status.text('ตั้งชื่อผู้ใช้ก่อน จึงจะสร้างรหัสกู้คืนได้');
        $btn.hide();
        return;
    }
    if (!result.ok) {
        $status.text('ยังโหลดข้อมูลรหัสกู้คืนไม่ได้');
        $btn.hide();
        return;
    }

    $btn.show().text(result.created_at ? 'สร้างรหัสใหม่' : 'สร้างรหัสกู้คืน').data('has-code', !!result.created_at);
    $status.text(result.created_at
        ? 'สร้างรหัสกู้คืนแล้วเมื่อ ' + formatProgressDate(result.created_at)
        : 'ยังไม่มีรหัสกู้คืน ถ้าลืมรหัสผ่านจะกู้บัญชีเองไม่ได้');
}

function refreshRecoveryStatus() {
    invokeRecovery({ action: 'status' }).then(renderRecoveryStatus);
}

function issueRecoveryCode() {
    let $btn = $('#profileRecoveryBtn').prop('disabled', true);

    invokeRecovery({ action: 'issue' }).then(function (result) {
        $btn.prop('disabled', false);
        if (result.code) {
            showRecoveryCode(result.code);
        }
        refreshRecoveryStatus();
    });
}

$(document).on('shown.bs.tab', '#menu_profile', refreshRecoveryStatus);

$('#profileRecoveryBtn').on('click', function () {
    if ($(this).data('has-code')) {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('recoveryReplaceModal')).show();
    } else {
        issueRecoveryCode();
    }
});

$('#recoveryReplaceConfirmBtn').on('click', function () {
    bootstrap.Modal.getInstance(document.getElementById('recoveryReplaceModal')).hide();
    issueRecoveryCode();
});
