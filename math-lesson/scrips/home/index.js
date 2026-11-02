// Today's answers against the daily goal, and the run of days, the same numbers as
// the Progress page's "วันนี้" card. Shown to guests too: they are counted on the
// device either way, and the Progress page is only there once signed in.
function renderHomeToday() {
    let goal = getDailyGoal();
    let done = getDailyCount();
    let reached = done >= goal;

    $('#homeTodayCount').text(done + ' / ' + goal + ' ข้อ');
    $('#homeTodayDone').toggle(reached);
    $('#homeTodayBar')
        .css('width', Math.min(100, Math.round(100 * done / goal)) + '%')
        .toggleClass('is-reached', reached);
    $('#homeTodayStreak').text(getDayStreak() + ' วัน');
}

$('#homeToday').on('click', function () {
    if (currentUserId) {
        bootstrap.Tab.getOrCreateInstance(document.getElementById('menu_progress')).show();
    } else {
        $('#appAccountSignInBtn').trigger('click');
    }
});

// the numbers move while the child is in a lesson, so they are read again on the
// way back; and day changes over midnight need nothing more than that
$(document).on('shown.bs.tab', '#menu_speedquiz', renderHomeToday);

renderHomeToday();
