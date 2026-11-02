// The trophy count at the top of the home page: every trophy the child holds, from
// the final quiz's grades and the practice papers, each counted at its best. It
// stays hidden until there is one, and whenever a count could not be trusted.
var homeTrophyOwner = null;

function homeTrophyTally(quizResults, mockResults) {
    let tally = { gold: 0, silver: 0, bronze: 0 };

    Object.keys(quizResults).forEach(function (grade) {
        let trophy = finalQuizTrophy(finalQuizPercent(finalQuizBest(quizResults[grade])));
        if (trophy) {
            tally[trophy.id]++;
        }
    });
    Object.keys(MOCK_EXAMS).forEach(function (exam) {
        let trophy = mockExamTrophy(mockResults[exam]);
        if (trophy) {
            tally[trophy.id]++;
        }
    });

    return tally;
}

function renderHomeTrophies(tally) {
    let total = tally ? tally.gold + tally.silver + tally.bronze : 0;

    $('#homeTrophies').toggle(total > 0);
    if (!total) {
        return;
    }

    // the icon takes the colour of the best trophy held
    let best = FINAL_QUIZ_TROPHIES.find(function (trophy) { return tally[trophy.id]; });
    let kinds = FINAL_QUIZ_TROPHIES
        .filter(function (trophy) { return tally[trophy.id]; })
        .map(function (trophy) { return trophy.label.replace('ถ้วย', '') + ' ' + tally[trophy.id]; });

    $('#homeTrophyIcon').attr('class', 'bi bi-trophy-fill trophy-' + best.id);
    $('#homeTrophyCount').text('ถ้วยรางวัล ' + total + ' ใบ');
    $('#homeTrophyKinds').text(kinds.join(' · '));
}

function refreshHomeTrophies() {
    let owner = finalQuizOwner();
    let quiz = currentUserId ? fetchFinalQuizResults() : Promise.resolve(readFinalQuizResults());
    let mock = loadMockExamResults();

    homeTrophyOwner = owner;
    Promise.all([quiz, mock]).then(function (results) {
        // a slow answer for one child must not count towards the next one
        if (homeTrophyOwner !== owner || finalQuizOwner() !== owner) {
            return;
        }
        renderHomeTrophies(results[0] && results[1] ? homeTrophyTally(results[0], results[1]) : null);
    });
}

$('#homeTrophies').on('click', function () {
    let menu = document.getElementById(currentUserId ? 'menu_progress' : 'menu_finalquiz');
    bootstrap.Tab.getOrCreateInstance(menu).show();
});

// back on the home page after a quiz, the count has to include what was just won
$(document).on('shown.bs.tab', '#menu_speedquiz', refreshHomeTrophies);

// deferred because this reads the database, and supabase-js holds its auth lock
// until we return
supabaseClient.auth.onAuthStateChange(function () {
    setTimeout(refreshHomeTrophies, 0);
});

refreshHomeTrophies();

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
