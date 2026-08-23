// Profile data lives in Supabase user_metadata rather than a separate table,
// so no SQL migration or row-level-security setup is needed — a user can only
// ever read and write their own metadata.

function showProfileFeedback(feedbackId, isSuccess, message) {
    let $feedback = $('#' + feedbackId);

    $feedback.removeClass('show is-correct is-incorrect');
    void $feedback[0].offsetWidth;

    $feedback
        .addClass(isSuccess ? 'is-correct' : 'is-incorrect')
        .html('<i class="bi ' + (isSuccess ? 'bi-check-circle-fill' : 'bi-x-circle-fill') + '"></i> ' + message)
        .addClass('show');
}

function loadProfileIntoForm(user) {
    let metadata = user.user_metadata || {};

    // username accounts must never be shown their internal .invalid address
    let isUsernameAccount = !!(user.user_metadata && user.user_metadata.username);
    $('#profileIdentityLabel').text(isUsernameAccount ? 'ชื่อผู้ใช้' : 'อีเมล');
    $('#profileEmail').val(getAccountIdentityLabel(user));

    let grade = metadata.grade || '';
    $('#profileGradePicker .mode-btn').removeClass('active');
    $('#profileGradePicker .mode-btn[data-grade="' + grade + '"]').addClass('active');

    $('#profileNewPassword, #profileNewPasswordConfirm').val('');
    $('#feedbackProfile, #feedbackProfilePassword').removeClass('show is-correct is-incorrect').text('');
}

// Refill the form only when a genuinely different account is in play. Saving
// fires USER_UPDATED *and* SIGNED_IN, and refilling on those would wipe the
// success message the user just triggered.
var profileLoadedUserId = null;

function applyProfileAuthState(user) {
    if (user) {
        $('#navGroupProfile').show();
        if (profileLoadedUserId !== user.id) {
            profileLoadedUserId = user.id;
            loadProfileIntoForm(user);
        }
        return;
    }

    profileLoadedUserId = null;

    $('#navGroupProfile').hide();

    // signed out while sitting on the profile tab: fall back to the first lesson
    if ($('#content_profile').hasClass('active')) {
        bootstrap.Tab.getOrCreateInstance(document.getElementById('menu_plus')).show();
    }
}

$('#profileGradePicker').on('click', '.mode-btn', function () {
    $('#profileGradePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
});

$('#profileSaveBtn').on('click', function () {
    let grade = $('#profileGradePicker .mode-btn.active').data('grade') || '';
    let $btn = $(this);

    $btn.prop('disabled', true).text('กำลังบันทึก...');

    supabaseClient.auth.updateUser({
        data: { grade: grade }
    }).then(function (result) {
        $btn.prop('disabled', false).text('บันทึกข้อมูล');

        if (result.error) {
            showProfileFeedback('feedbackProfile', false, 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง');
            return;
        }

        showProfileFeedback('feedbackProfile', true, 'บันทึกข้อมูลเรียบร้อยแล้ว');
    });
});

$('#profilePasswordBtn').on('click', function () {
    let password = $('#profileNewPassword').val();
    let passwordConfirm = $('#profileNewPasswordConfirm').val();
    let $btn = $(this);

    if (!password) {
        showProfileFeedback('feedbackProfilePassword', false, 'กรุณากรอกรหัสผ่านใหม่');
        return;
    }
    if (password.length < 6) {
        showProfileFeedback('feedbackProfilePassword', false, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
    }
    if (password !== passwordConfirm) {
        showProfileFeedback('feedbackProfilePassword', false, 'รหัสผ่านไม่ตรงกัน');
        return;
    }

    $btn.prop('disabled', true).text('กำลังเปลี่ยนรหัสผ่าน...');

    supabaseClient.auth.updateUser({ password: password }).then(function (result) {
        $btn.prop('disabled', false).text('เปลี่ยนรหัสผ่าน');

        if (result.error) {
            let message = result.error.message.indexOf('should be different') !== -1
                ? 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม'
                : 'เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองอีกครั้ง';
            showProfileFeedback('feedbackProfilePassword', false, message);
            return;
        }

        $('#profileNewPassword, #profileNewPasswordConfirm').val('');
        showProfileFeedback('feedbackProfilePassword', true, 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    });
});

supabaseClient.auth.onAuthStateChange(function (event, session) {
    applyProfileAuthState(session ? session.user : null);
});

supabaseClient.auth.getSession().then(function (result) {
    applyProfileAuthState(result.data.session ? result.data.session.user : null);
});
