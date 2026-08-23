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
            '<div class="progress-row-meta">ฝึกล่าสุด ' + formatProgressDate(row.last_practiced_at) + '</div>' +
            '<div class="progress-attempts" style="display: none;"></div>' +
        '</div>';
    }).join('');

    $('#progressLessonList').html(html);
}

function renderLessonAttempts($container, rows) {
    if (!rows.length) {
        $container.html('<p class="progress-empty">ยังไม่มีประวัติ</p>');
        return;
    }

    let html = rows.map(function (row) {
        let expression = row.expression
            ? $('<div>').text(row.expression).html()
            : '<span class="progress-attempt-noexpr">(ไม่ได้บันทึกรายละเอียด)</span>';
        return '<div class="progress-attempt ' + (row.is_correct ? 'is-correct' : 'is-incorrect') + '">' +
            '<i class="bi ' + (row.is_correct ? 'bi-check-circle-fill' : 'bi-x-circle-fill') + '"></i>' +
            '<span class="progress-attempt-expr">' + expression + '</span>' +
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

function renderProgressMistakes(rows) {
    if (!rows.length) {
        $('#progressMistakeList').html('<p class="progress-empty">' +
            (progressEmptyText('ข้อที่ตอบผิด') || 'ยังไม่มีข้อที่ตอบผิด เก่งมาก!') + '</p>');
        return;
    }

    let html = rows.map(function (row) {
        let label = LESSON_LABELS[row.lesson_id] || row.lesson_id;
        return '<div class="progress-row progress-row-compact">' +
            '<span class="progress-mistake-expr">' + $('<div>').text(row.expression).html() + '</span>' +
            '<span class="progress-mistake-lesson">' + label + '</span>' +
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
}

$('#progressRangePicker').on('click', '.mode-btn', function () {
    $('#progressRangePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    progressRange = $(this).data('range');
    refreshProgressPage();
});

// Recompute when the page is opened so it always reflects the latest answers.
$(document).on('shown.bs.tab', '#menu_progress', refreshProgressPage);
