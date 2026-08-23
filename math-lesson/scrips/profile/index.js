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

    // An account signs in either by username (its auth address is an internal
    // .invalid one, never shown) or by a real email set at registration. Only
    // the former can use a username, because resolving a name to a real email
    // would hand that address to anyone guessing names.
    let signsInByUsername = isInternalAuthAddress(user.email);

    $('#profileUsername')
        .val((user.user_metadata && user.user_metadata.username) || '')
        .prop('readonly', !signsInByUsername)
        .toggleClass('profile-readonly', !signsInByUsername)
        .attr('placeholder', signsInByUsername ? 'ชื่อผู้ใช้' : 'บัญชีนี้เข้าสู่ระบบด้วยอีเมล');
    $('#profileUsernameNote').toggle(signsInByUsername);

    // For username accounts the email is optional contact info only, and is
    // stored in profiles rather than being the credential. For email accounts
    // it *is* the credential, so it cannot be edited here (and email changes
    // are rejected by this project anyway).
    $('#profileEmail')
        .val(signsInByUsername ? (profileContactEmail || '') : user.email)
        .prop('readonly', !signsInByUsername)
        .toggleClass('profile-readonly', !signsInByUsername);
    $('#profileEmailNote').text(signsInByUsername
        ? 'ไม่บังคับ ใช้สำหรับติดต่อเท่านั้น ไม่ได้ใช้เข้าสู่ระบบ'
        : 'บัญชีนี้ใช้อีเมลนี้เข้าสู่ระบบ จึงเปลี่ยนที่นี่ไม่ได้');

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
var profileContactEmail = null;

function applyProfileAuthState(user) {
    if (user) {
        $('#navGroupProfile').show();
        // kept current even on USER_UPDATED, so a rename compares against the
        // name that is actually stored rather than a stale one
        profileLoadedUser = user;
        if (profileLoadedUserId !== user.id) {
            profileLoadedUserId = user.id;
            // contact email lives in profiles, so fetch it before filling the form
            supabaseClient.from('profiles').select('email').eq('id', user.id).maybeSingle()
                .then(function (result) {
                    profileContactEmail = (!result.error && result.data) ? result.data.email : null;
                    loadProfileIntoForm(user);
                });
        }
        return;
    }

    profileLoadedUserId = null;
    profileLoadedUser = null;
    profileContactEmail = null;

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
    let editable = !$('#profileUsername').prop('readonly');
    let typedName = $('#profileUsername').val().trim().toLowerCase();
    let currentName = (profileLoadedUser && profileLoadedUser.user_metadata.username) || '';
    let renaming = editable && typedName !== currentName;

    let typedEmail = $('#profileEmail').val().trim();
    let emailChanged = editable && typedEmail !== (profileContactEmail || '');

    if (renaming && !AUTH_USERNAME_PATTERN.test(typedName)) {
        // put the real name back: leaving invalid text in the field would block
        // every later save, including ones that only change the grade
        $('#profileUsername').val(currentName);
        showProfileFeedback('feedbackProfile', false, 'ชื่อผู้ใช้ต้องเป็น a-z, 0-9 หรือ _ ความยาว 3-20 ตัวอักษร');
        return;
    }

    if (emailChanged && typedEmail && typedEmail.indexOf('@') === -1) {
        $('#profileEmail').val(profileContactEmail || '');
        showProfileFeedback('feedbackProfile', false, 'รูปแบบอีเมลไม่ถูกต้อง');
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

        if (!renaming && !emailChanged) {
            finish(true, 'บันทึกข้อมูลเรียบร้อยแล้ว');
            return;
        }

        if (!renaming) {
            return supabaseClient.from('profiles')
                .update({ email: typedEmail || null })
                .eq('id', profileLoadedUser.id)
                .then(function (upd) {
                    if (upd.error) {
                        finish(false, 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง');
                        return;
                    }
                    profileContactEmail = typedEmail || null;
                    finish(true, 'บันทึกข้อมูลเรียบร้อยแล้ว');
                });
        }

        // profiles is the source of truth for the name and enforces both
        // uniqueness and the retired-name rule; metadata is only a display copy
        return supabaseClient.from('profiles')
            .update({ username: typedName, email: typedEmail || null })
            .eq('id', profileLoadedUser.id)
            .then(function (upd) {
                if (upd.error) {
                    let taken = (upd.error.message || '').indexOf('username_retired') !== -1
                        ? 'ชื่อนี้เคยถูกใช้แล้ว ไม่สามารถนำกลับมาใช้ได้'
                        : 'ชื่อผู้ใช้นี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น';
                    $('#profileUsername').val(currentName);
                    finish(false, taken);
                    return;
                }

                profileContactEmail = typedEmail || null;
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
