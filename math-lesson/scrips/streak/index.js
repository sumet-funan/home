// Running count of correct answers in a row, across every lesson rather than
// per lesson -- switching topic keeps the combo alive, which is the point.
//
// Kept in localStorage so it survives a reload and works signed out. The speed
// quiz is deliberately excluded: it is marked in one go at the end, so a single
// submit would add a hundred to the combo and make it meaningless.

const STREAK_CURRENT_KEY = 'mathLessonStreak';
const STREAK_BEST_KEY = 'mathLessonBestStreak';
const STREAK_SHOW_FROM = 2;      // "x1" is just a right answer, not a combo

function readStreakValue(key) {
    let raw = localStorage.getItem(key);
    let value = raw === null ? 0 : parseInt(raw, 10);
    return isNaN(value) || value < 0 ? 0 : value;
}

function writeStreakValue(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch (e) {
        // storage full or unavailable: the combo is a flourish, never a reason
        // to break the lesson the child is in the middle of
    }
}

function getCurrentStreak() {
    return readStreakValue(STREAK_CURRENT_KEY);
}

function getBestStreak() {
    return readStreakValue(STREAK_BEST_KEY);
}

// 5s and 10s get progressively hotter, so a long run looks different from a
// short one at a glance rather than just showing a bigger number.
function streakTier(streak) {
    if (streak >= 20) return 'tier-gold';
    if (streak >= 10) return 'tier-hot';
    if (streak >= 5) return 'tier-warm';
    return '';
}

function renderStreakBadge(streak, justBroken) {
    let $badge = $('#comboBadge');

    if (streak < STREAK_SHOW_FROM) {
        if (justBroken) {
            $badge.removeClass('is-visible is-pop tier-warm tier-hot tier-gold')
                .addClass('is-broken');
            setTimeout(function () { $badge.removeClass('is-broken'); }, 600);
            return;
        }
        $badge.removeClass('is-visible is-pop is-broken tier-warm tier-hot tier-gold');
        return;
    }

    $badge
        .removeClass('tier-warm tier-hot tier-gold is-broken')
        .addClass('is-visible')
        .addClass(streakTier(streak));

    $('#comboCount').text('x' + streak);

    // restart the pop animation on every increment
    $badge.removeClass('is-pop');
    void $badge[0].offsetWidth;
    $badge.addClass('is-pop');

    $('#comboMilestone').toggle(streak % 5 === 0);
}

function registerStreakAnswer(isCorrect) {
    let current = getCurrentStreak();

    if (!isCorrect) {
        let hadCombo = current >= STREAK_SHOW_FROM;
        writeStreakValue(STREAK_CURRENT_KEY, 0);
        renderStreakBadge(0, hadCombo);
        return;
    }

    let next = current + 1;
    writeStreakValue(STREAK_CURRENT_KEY, next);

    if (next > getBestStreak()) {
        writeStreakValue(STREAK_BEST_KEY, next);
    }

    renderStreakBadge(next, false);
}

$(function () {
    renderStreakBadge(getCurrentStreak(), false);
});
