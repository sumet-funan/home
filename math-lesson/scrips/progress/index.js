// Thai display names for every lesson id written by the showFeedback hook.
// Ids that are not in this map (e.g. leftover test rows) are simply not shown.
const LESSON_LABELS = {
    plus: 'บวก',
    minus: 'ลบ',
    multiply: 'คูณ',
    divide: 'หาร',
    p1plus: 'บวก (ป.1)',
    p1minus: 'ลบ (ป.1)',
    p1compare: 'เปรียบเทียบจำนวน (ป.1)',
    p1numberbond: 'คู่จำนวน (ป.1)',
    p1pattern: 'แบบรูป (ป.1)',
    p1placevalue: 'หลักหน่วย/หลักสิบ (ป.1)',
    p1shape: 'รูปเรขาคณิต (ป.1)',
    p1length: 'ความยาว (ป.1)',
    p1weight: 'น้ำหนัก (ป.1)',
    p1capacity: 'ความจุ (ป.1)',
    p1time: 'เวลา (ป.1)',
    p1money: 'เงิน (ป.1)',
    p1wordproblem: 'โจทย์ปัญหา (ป.1)',
    p5decimal: 'ทศนิยม (ป.5)',
    p5percentage: 'ร้อยละ (ป.5)',
    p5fraction: 'เศษส่วน (ป.5)',
    p5gcflcm: 'ห.ร.ม. / ค.ร.น. (ป.5)',
    p5mixednumber: 'จำนวนคละ (ป.5)',
    p5geometry: 'พื้นที่ / รอบรูป (ป.5)',
    p5volume: 'ปริมาตร (ป.5)',
    p5angle: 'มุม (ป.5)',
    p5average: 'ค่าเฉลี่ย (ป.5)',
    p5barchart: 'แผนภูมิแท่ง (ป.5)',
    p5wordproblem: 'โจทย์ปัญหา (ป.5)',
};

function formatProgressDate(isoString) {
    let d = new Date(isoString);
    let pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + (d.getFullYear() + 543);
}

function formatProgressDuration(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return pad(Math.floor(totalSeconds / 60)) + ':' + pad(totalSeconds % 60);
}

function accuracyClass(pct) {
    if (pct >= 80) {
        return 'is-high';
    }
    return pct >= 50 ? 'is-mid' : 'is-low';
}

const PROGRESS_RANGE_LABELS = {
    day: 'วันนี้',
    week: 'สัปดาห์นี้',
    month: 'เดือนนี้',
    year: 'ปีนี้',
};

// "no data" means something different per range: nothing ever recorded, versus
// nothing recorded in the chosen period. Saying "try a question" for the latter
// would be wrong when the child has plenty of history.
function progressEmptyText(whatIsMissing) {
    let label = PROGRESS_RANGE_LABELS[progressRange];
    return label
        ? 'ไม่มี' + whatIsMissing + PROGRESS_RANGE_LABELS[progressRange]
        : null;
}

function renderProgressSummary(stats) {
    let total = 0;
    let correct = 0;

    // same filter as the lesson list, so the totals always match what is shown
    stats.filter(function (row) { return LESSON_LABELS[row.lesson_id]; }).forEach(function (row) {
        total += +row.total;
        correct += +row.correct;
    });

    let accuracy = total ? Math.round(1000 * correct / total) / 10 : 0;

    // The combo is tracked on the device rather than in the database, so it is
    // shown as-is regardless of the selected range.
    let bestStreak = typeof getBestStreak === 'function' ? getBestStreak() : 0;

    $('#progressSummary').html(
        '<div class="progress-stat"><span class="progress-stat-label">ทำทั้งหมด</span>' +
        '<span class="progress-stat-value">' + total + '</span></div>' +
        '<div class="progress-stat"><span class="progress-stat-label">ตอบถูก</span>' +
        '<span class="progress-stat-value">' + correct + '</span></div>' +
        '<div class="progress-stat"><span class="progress-stat-label">ความแม่นยำ</span>' +
        '<span class="progress-stat-value">' + accuracy + '%</span></div>' +
        '<div class="progress-stat"><span class="progress-stat-label">คอมโบสูงสุด</span>' +
        '<span class="progress-stat-value">x' + bestStreak + '</span></div>'
    );
}

function renderProgressLessons(stats) {
    let known = stats.filter(function (row) { return LESSON_LABELS[row.lesson_id]; });

    if (!known.length) {
        $('#progressLessonList').html('<p class="progress-empty">' +
            (progressEmptyText('การฝึก') || 'ยังไม่มีข้อมูล ลองฝึกทำโจทย์สักข้อแล้วกลับมาดูใหม่นะ') + '</p>');
        return;
    }

    known.sort(function (a, b) { return b.total - a.total; });

    let html = known.map(function (row) {
        let pct = +row.accuracy_pct;
        return '<div class="progress-row is-expandable" data-lesson-id="' + row.lesson_id + '">' +
            '<div class="progress-row-head">' +
                '<span class="progress-row-name">' +
                    '<i class="bi bi-chevron-right progress-row-caret"></i> ' +
                    LESSON_LABELS[row.lesson_id] +
                '</span>' +
                '<span class="progress-row-score">' + row.correct + '/' + row.total + ' (' + pct + '%)</span>' +
            '</div>' +
            '<div class="progress-bar-track">' +
                '<div class="progress-bar-fill ' + accuracyClass(pct) + '" style="width: ' + pct + '%;"></div>' +
            '</div>' +
            '<div class="progress-row-meta">ฝึกล่าสุด ' + formatProgressDate(row.last_practiced_at) +
                (row.avg_response_ms ? ' · เฉลี่ย ' + formatResponseTime(row.avg_response_ms) + '/ข้อ' : '') +
            '</div>' +
            '<div class="progress-attempts" style="display: none;"></div>' +
        '</div>';
    }).join('');

    $('#progressLessonList').html(html);
}

function formatResponseTime(ms) {
    let seconds = ms / 1000;
    return (seconds >= 10 ? Math.round(seconds) : Math.round(seconds * 10) / 10) + ' วิ';
}

// Slow relative to how this child usually answers this lesson, not a fixed
// number of seconds: thirty seconds on a word problem is fine, on 7x8 it is not.
function slowResponseThreshold(rows) {
    let times = rows
        .filter(function (r) { return r.is_correct && r.response_ms; })
        .map(function (r) { return r.response_ms; })
        .sort(function (a, b) { return a - b; });

    if (times.length < 5) {
        return Infinity;      // too little to say what normal looks like yet
    }
    return times[Math.floor(times.length / 2)] * 2;
}

function renderLessonAttempts($container, rows) {
    if (!rows.length) {
        $container.html('<p class="progress-empty">ยังไม่มีประวัติ</p>');
        return;
    }

    let slowFrom = slowResponseThreshold(rows);

    let html = rows.map(function (row) {
        let expression = row.expression
            ? $('<div>').text(row.expression).html()
            : '<span class="progress-attempt-noexpr">(ไม่ได้บันทึกรายละเอียด)</span>';
        let slow = row.is_correct && row.response_ms && row.response_ms >= slowFrom;
        return '<div class="progress-attempt ' + (row.is_correct ? 'is-correct' : 'is-incorrect') + '">' +
            '<i class="bi ' + (row.is_correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill') + '"></i>' +
            '<span class="progress-attempt-expr">' + expression + '</span>' +
            (row.response_ms
                ? '<span class="progress-attempt-time' + (slow ? ' is-slow' : '') + '">' +
                      formatResponseTime(row.response_ms) + '</span>'
                : '') +
            '<span class="progress-attempt-date">' + formatProgressDate(row.created_at) + '</span>' +
        '</div>';
    }).join('');

    $container.html(html);
}

// Attempts are fetched the first time a lesson is opened, then kept, so
// reopening is instant and the page never loads history nobody looked at.
$(document).on('click', '.progress-row.is-expandable', function () {
    let $row = $(this);
    let $panel = $row.find('.progress-attempts');
    let isOpen = $row.hasClass('is-open');

    $row.toggleClass('is-open', !isOpen);
    $panel.toggle(!isOpen);

    if (isOpen || $row.data('loaded')) {
        return;
    }

    $row.data('loaded', true);
    $panel.html('<p class="progress-empty">กำลังโหลด...</p>');
    fetchLessonAttempts($row.data('lesson-id'), 50).then(function (rows) {
        renderLessonAttempts($panel, rows);
    });
});

function renderProgressQuiz(results) {
    // The two kinds mean opposite things: a fixed-count round is best when it
    // is fastest, a timed one when the most answers were right. Mixing them
    // would report a timed round as a 60-question run finished in exactly a
    // minute, since its size is the duration and its time is always 60s.
    let bests = {};

    results.forEach(function (row) {
        let timed = row.kind === 'timed';
        let key = (timed ? 'timed_' : 'count_') + row.mode + '_' + row.size;

        if (timed) {
            if (!bests[key] || row.correct_count > bests[key].correct_count) {
                bests[key] = row;
            }
            return;
        }

        if (row.correct_count !== row.size) {
            return;                       // only a perfect run is a real time
        }
        if (!bests[key] || row.duration_ms < bests[key].duration_ms) {
            bests[key] = row;
        }
    });

    let keys = Object.keys(bests);
    if (!keys.length) {
        $('#progressQuizList').html('<p class="progress-empty">' +
            (progressEmptyText('สถิติคำนวณเร็ว') || 'ยังไม่มีสถิติ ลองทำแบบฝึกคำนวณเร็วให้ครบทุกข้อนะ') + '</p>');
        return;
    }

    let symbols = { '+': '+', '-': '−', '*': '×' };
    let html = keys.sort().map(function (key) {
        let row = bests[key];
        let timed = row.kind === 'timed';
        return '<div class="progress-row progress-row-compact">' +
            '<span class="progress-row-name">' + symbols[row.mode] + ' &nbsp;' +
                (timed ? '1 นาที' : row.size + ' ข้อ') + '</span>' +
            '<span class="progress-row-score">' +
                (timed ? row.correct_count + ' ข้อ' : formatProgressDuration(row.duration_ms)) +
            '</span>' +
        '</div>';
    }).join('');

    $('#progressQuizList').html(html);
}

// Lesson ids map onto menu ids by grade prefix (p5decimal -> menu_p5_decimal).
// Returns null when no such menu exists, which is the case for the four
// general lessons that were removed but whose history is still shown.
function lessonMenuId(lessonId) {
    let menuId = lessonId.replace(/^(p1|p5)/, 'menu_$1_');
    return document.getElementById(menuId) ? menuId : null;
}

$(document).on('click', '.progress-fix-btn', function (e) {
    e.stopPropagation();
    let el = document.getElementById($(this).data('menu-id'));
    if (el) {
        bootstrap.Tab.getOrCreateInstance(el).show();
    }
});

// What needs revisiting is worked out from data already recorded -- how long
// since a lesson was practised, and how accurate it was -- rather than kept as
// scheduling state. Nothing is stored, so there is nothing to drift.
const REVIEW_STALE_DAYS = 3;
const REVIEW_WEAK_ACCURACY = 70;
const REVIEW_MAX_SHOWN = 5;

function daysSince(iso) {
    if (!iso) {
        return Infinity;
    }
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function buildReviewList(stats) {
    return stats
        .filter(function (row) { return LESSON_LABELS[row.lesson_id]; })
        .map(function (row) {
            let days = daysSince(row.last_practiced_at);
            let accuracy = +row.accuracy_pct;
            let reasons = [];

            if (days >= REVIEW_STALE_DAYS) {
                reasons.push('ไม่ได้ฝึก ' + days + ' วัน');
            }
            if (accuracy < REVIEW_WEAK_ACCURACY) {
                reasons.push('ความแม่นยำ ' + accuracy + '%');
            }

            // days carry most of the weight; low accuracy adds up to 10 more,
            // so a weak lesson surfaces sooner but a long gap still wins
            return {
                lessonId: row.lesson_id,
                reasons: reasons,
                score: days + (100 - accuracy) / 10
            };
        })
        .filter(function (row) { return row.reasons.length; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, REVIEW_MAX_SHOWN);
}

function renderProgressReview(stats) {
    let rows = buildReviewList(stats);

    // Capped and hidden when empty: a wall of overdue topics is what makes
    // people abandon review lists, and "nothing to review" needs no card.
    $('#progressReviewCard').toggle(rows.length > 0);
    $('#menu_progress .nav-review-badge').remove();
    if (!rows.length) {
        return;
    }

    $('#menu_progress').append('<span class="nav-review-badge">' + rows.length + '</span>');

    $('#progressReviewList').html(rows.map(function (row) {
        let menuId = lessonMenuId(row.lessonId);
        return '<div class="progress-row progress-row-compact">' +
            '<span class="progress-review-name">' + LESSON_LABELS[row.lessonId] + '</span>' +
            '<span class="progress-review-reason">' + row.reasons.join(' · ') + '</span>' +
            (menuId
                ? '<button type="button" class="progress-fix-btn" data-menu-id="' + menuId + '">ทบทวน</button>'
                : '') +
        '</div>';
    }).join(''));
}

function renderProgressMistakes(rows) {
    if (!rows.length) {
        $('#progressMistakeList').html('<p class="progress-empty">' +
            (progressEmptyText('ข้อที่ตอบผิด') || 'ยังไม่มีข้อที่ตอบผิด เก่งมาก!') + '</p>');
        return;
    }

    let html = rows.map(function (row) {
        let label = LESSON_LABELS[row.lesson_id] || row.lesson_id;
        // the four removed general lessons have no menu to send anyone to
        let menuId = lessonMenuId(row.lesson_id);
        return '<div class="progress-row progress-row-compact">' +
            '<span class="progress-mistake-expr">' + $('<div>').text(row.expression).html() + '</span>' +
            '<span class="progress-mistake-lesson">' + label + '</span>' +
            (menuId
                ? '<button type="button" class="progress-fix-btn" data-menu-id="' + menuId + '">ฝึกแก้</button>'
                : '') +
        '</div>';
    }).join('');

    $('#progressMistakeList').html(html);
}

var progressRange = 'all';

// Deliberately independent of the range picker: "today" and "days in a row"
// mean the same thing whichever period the rest of the page is showing.
function renderDailyGoal() {
    if (typeof getDailyGoal !== 'function') {
        return;
    }

    let goal = getDailyGoal();
    let done = getDailyCount();
    let pct = goal > 0 ? Math.min(100, Math.round(100 * done / goal)) : 0;
    let reached = done >= goal;

    $('#dailyGoalCount').text(done + ' / ' + goal + ' ข้อ');
    $('#dailyGoalDone').toggle(reached);
    // No red for "not there yet": a partly filled goal is progress, not a
    // failing score, and colouring it like one would discourage exactly the
    // child who most needs encouraging.
    $('#dailyGoalBar')
        .css('width', pct + '%')
        .toggleClass('is-reached', reached);

    $('#dayStreakValue').text(getDayStreak() + ' วัน');
    $('#dayStreakBest').text(getBestDayStreak() + ' วัน');
}

function refreshProgressPage() {
    renderDailyGoal();

    if (typeof fetchLessonStats !== 'function') {
        return;
    }

    let range = progressRange;

    fetchLessonStats(range).then(function (stats) {
        // a slower earlier request must not overwrite a newer range's results
        if (progressRange !== range) {
            return;
        }
        renderProgressSummary(stats);
        renderProgressLessons(stats);
    });

    // Always all-time, whatever range is selected: "not practised for 5 days"
    // is meaningless inside a "today" filter, which would list every lesson.
    fetchLessonStats('all').then(renderProgressReview);

    fetchQuizBests(range).then(function (rows) {
        if (progressRange !== range) {
            return;
        }
        renderProgressQuiz(rows);
    });

    fetchRecentMistakes(10, range).then(function (rows) {
        if (progressRange !== range) {
            return;
        }
        renderProgressMistakes(rows);
    });

    fetchFixedMistakeCount(range).then(function (count) {
        if (progressRange !== range) {
            return;
        }
        $('#progressFixedCount').text(count).parent().toggle(count > 0);
    });
}

$('#progressRangePicker').on('click', '.mode-btn', function () {
    $('#progressRangePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    progressRange = $(this).data('range');
    refreshProgressPage();
});

// Recompute when the page is opened so it always reflects the latest answers.
$(document).on('shown.bs.tab', '#menu_progress', refreshProgressPage);

// The badge has to be there before the page is opened, or it could never do its
// job of telling a child there is something to come back to.
supabaseClient.auth.onAuthStateChange(function (event, session) {
    if (!session) {
        $('#menu_progress .nav-review-badge').remove();
        $('#progressReviewCard').hide();
        return;
    }
    if (typeof fetchLessonStats === 'function') {
        fetchLessonStats('all').then(renderProgressReview);
    }
});
