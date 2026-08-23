// Daily goal and day streak.
//
// Neither of these blocks anything: the goal is a target to aim at and the
// streak counts days practised, so a child who wants to keep going always can.
// Both live in localStorage, so they work signed out and survive a reload.

const DAILY_DATE_KEY = 'mathLessonDailyDate';
const DAILY_COUNT_KEY = 'mathLessonDailyCount';
const DAILY_GOAL_KEY = 'mathLessonDailyGoal';
const DAY_STREAK_KEY = 'mathLessonDayStreak';
const DAY_STREAK_BEST_KEY = 'mathLessonDayStreakBest';
const DAY_STREAK_LAST_KEY = 'mathLessonDayStreakLast';

const DAILY_GOAL_DEFAULT = 20;

// Local date, not UTC: "today" has to mean the child's today, or the day rolls
// over mid-afternoon in Thailand.
function localDateKey(date) {
    let d = date || new Date();
    let pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function readNumber(key, fallback) {
    let raw = localStorage.getItem(key);
    if (raw === null) {
        return fallback;
    }
    let value = parseInt(raw, 10);
    return isNaN(value) || value < 0 ? fallback : value;
}

function writeValue(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch (e) {
        // storage unavailable: these are encouragements, never a reason to
        // interrupt the lesson
    }
}

function getDailyGoal() {
    return readNumber(DAILY_GOAL_KEY, DAILY_GOAL_DEFAULT) || DAILY_GOAL_DEFAULT;
}

function setDailyGoal(value) {
    writeValue(DAILY_GOAL_KEY, value);
}

// Counting resets when the calendar day changes, without needing anything to
// run at midnight.
function getDailyCount() {
    return localStorage.getItem(DAILY_DATE_KEY) === localDateKey()
        ? readNumber(DAILY_COUNT_KEY, 0)
        : 0;
}

function getDayStreak() {
    let last = localStorage.getItem(DAY_STREAK_LAST_KEY);
    if (!last) {
        return 0;
    }

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // a streak stays alive today and yesterday; older than that it has lapsed
    if (last === localDateKey() || last === localDateKey(yesterday)) {
        return readNumber(DAY_STREAK_KEY, 0);
    }
    return 0;
}

function getBestDayStreak() {
    return readNumber(DAY_STREAK_BEST_KEY, 0);
}

function registerDailyActivity() {
    let today = localDateKey();
    let storedDate = localStorage.getItem(DAILY_DATE_KEY);

    if (storedDate !== today) {
        writeValue(DAILY_DATE_KEY, today);
        writeValue(DAILY_COUNT_KEY, 0);
    }

    let countBefore = getDailyCount();
    let countAfter = countBefore + 1;
    writeValue(DAILY_COUNT_KEY, countAfter);

    // first activity of the day extends (or restarts) the run of days
    let lastActive = localStorage.getItem(DAY_STREAK_LAST_KEY);
    if (lastActive !== today) {
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        let streak = lastActive === localDateKey(yesterday) ? readNumber(DAY_STREAK_KEY, 0) + 1 : 1;
        writeValue(DAY_STREAK_KEY, streak);
        writeValue(DAY_STREAK_LAST_KEY, today);

        if (streak > getBestDayStreak()) {
            writeValue(DAY_STREAK_BEST_KEY, streak);
        }
    }

    let goal = getDailyGoal();
    if (countBefore < goal && countAfter >= goal) {
        showDailyGoalToast(goal);
    }
}

function showDailyGoalToast(goal) {
    let $toast = $('#dailyGoalToast');
    $toast.find('.daily-toast-text').text('ครบเป้าหมายวันนี้แล้ว ' + goal + ' ข้อ เก่งมาก!');
    $toast.addClass('is-visible');
    clearTimeout($toast.data('hideTimer'));
    $toast.data('hideTimer', setTimeout(function () {
        $toast.removeClass('is-visible');
    }, 4000));
}
