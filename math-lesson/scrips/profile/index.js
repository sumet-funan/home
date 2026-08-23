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

    // Username accounts must never be shown their internal .invalid address,
    // and only they can be renamed: resolving a real-email account by username
    // would mean handing out its email to anyone guessing names.
    let isUsernameAccount = !!(user.user_metadata && user.user_metadata.username);
    $('#profileIdentityLabel').text(isUsernameAccount ? 'ชื่อผู้ใช้' : 'อีเมล');
    $('#profileEmail')
        .val(getAccountIdentityLabel(user))
        .prop('readonly', !isUsernameAccount)
        .toggleClass('profile-readonly', !isUsernameAccount);
    $('#profileUsernameNote').toggle(isUsernameAccount);

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
var profileLoadedUser = null;

function applyProfileAuthState(user) {
    if (user) {
        $('#navGroupProfile').show();
        // kept current even on USER_UPDATED, so a rename compares against the
        // name that is actually stored rather than a stale one
        profileLoadedUser = user;
        if (profileLoadedUserId !== user.id) {
            profileLoadedUserId = user.id;
            loadProfileIntoForm(user);
        }
        return;
    }

    profileLoadedUserId = null;
    profileLoadedUser = null;

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
    let isUsernameAccount = !$('#profileEmail').prop('readonly');
    let typedName = $('#profileEmail').val().trim().toLowerCase();
    let currentName = (profileLoadedUser && profileLoadedUser.user_metadata.username) || '';
    let renaming = isUsernameAccount && typedName !== currentName;

    if (renaming && !AUTH_USERNAME_PATTERN.test(typedName)) {
        // put the real name back: leaving invalid text in the field would block
        // every later save, including ones that only change the grade
        $('#profileEmail').val(currentName);
        showProfileFeedback('feedbackProfile', false, 'ชื่อผู้ใช้ต้องเป็น a-z, 0-9 หรือ _ ความยาว 3-20 ตัวอักษร');
        return;
    }

    $btn.prop('disabled', true).text('กำลังบันทึก...');

    let finish = function (ok, message) {
        $btn.prop('disabled', false).text('บันทึกข้อมูล');
        showProfileFeedback('feedbackProfile', ok, message);
    };

    supabaseClient.auth.updateUser({ data: { grade: grade } }).then(function (result) {
        if (result.error) {
            finish(false, 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง');
            return;
        }

        if (!renaming) {
            finish(true, 'บันทึกข้อมูลเรียบร้อยแล้ว');
            return;
        }

        // profiles is the source of truth for the name and enforces both
        // uniqueness and the retired-name rule; metadata is only a display copy
        return supabaseClient.from('profiles')
            .update({ username: typedName })
            .eq('id', profileLoadedUser.id)
            .then(function (upd) {
                if (upd.error) {
                    let taken = (upd.error.message || '').indexOf('username_retired') !== -1
                        ? 'ชื่อนี้เคยถูกใช้แล้ว ไม่สามารถนำกลับมาใช้ได้'
                        : 'ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น';
                    $('#profileEmail').val(currentName);
                    finish(false, taken);
                    return;
                }

                return supabaseClient.auth.updateUser({ data: { username: typedName } }).then(function () {
                    finish(true, 'เปลี่ยนชื่อผู้ใช้แล้ว ครั้งต่อไปให้เข้าสู่ระบบด้วยชื่อใหม่');
                });
            });
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
