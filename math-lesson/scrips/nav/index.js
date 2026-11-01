// Keeps the lesson menu pointing at where the child is. With 50 lessons behind
// collapsed groups, an unopened menu says nothing about which lesson is showing.
var menuGradeApplied = '';
var menuScrollTarget = null;

function showMenuGroup(group) {
    bootstrap.Collapse.getOrCreateInstance(group, { toggle: false }).show();
}

function scrollMenuTo(element) {
    let sidebar = document.getElementById('appSidebar');
    let box = sidebar.getBoundingClientRect();
    let rect = element.getBoundingClientRect();

    if (rect.bottom > box.bottom) {
        sidebar.scrollTop += rect.bottom - box.bottom + 16;
    } else if (rect.top < box.top) {
        sidebar.scrollTop -= box.top - rect.top + 16;
    }
}

function revealActiveMenuItem() {
    let item = document.querySelector('#list-tab .nav-menu-item.active');
    let group = item && item.closest('.collapse');

    menuScrollTarget = item;
    if (group) {
        showMenuGroup(group);
    }
    if (item) {
        scrollMenuTo(item);
    }
}

// the group's height only settles once it has finished opening
$('#list-tab').on('shown.bs.collapse', function () {
    if (menuScrollTarget) {
        scrollMenuTo(menuScrollTarget);
    }
});

$('#sidebarToggleBtn').on('click', revealActiveMenuItem);
$(document).on('shown.bs.tab', '[data-bs-toggle="list"]', revealActiveMenuItem);

$('#homeShortcuts').on('click', '.home-shortcut', function () {
    let group = document.getElementById('group-' + $(this).data('group'));

    openSidebar();
    menuScrollTarget = group;
    showMenuGroup(group);
    scrollMenuTo(group);
});

$('#homeSigninBtn').on('click', function () {
    $('#appAccountSignInBtn').trigger('click');
});

// The grade set in the profile is the one to open with.
function applyMenuGrade(grade) {
    if (grade === menuGradeApplied) {
        return;
    }

    menuGradeApplied = grade;
    $('.home-shortcut').removeClass('is-mine');
    $('.home-shortcut[data-group="' + grade + '"]').addClass('is-mine');

    let group = document.getElementById('group-' + grade);
    if (group) {
        showMenuGroup(group);
    }
}

function applyMenuAccount(user) {
    $('#homeSigninBtn').toggle(!user);
    applyMenuGrade((user && user.user_metadata && user.user_metadata.grade) || '');
}

supabaseClient.auth.onAuthStateChange(function (event, session) {
    applyMenuAccount(session ? session.user : null);
});

supabaseClient.auth.getSession().then(function (result) {
    applyMenuAccount(result.data.session ? result.data.session.user : null);
});
