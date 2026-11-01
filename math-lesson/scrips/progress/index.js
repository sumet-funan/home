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
    p1capacity: 'ความจุ (เสริม)',
    p1time: 'เวลา (เสริม)',
    p1money: 'เงิน (เสริม)',
    p1wordproblem: 'โจทย์ปัญหา (ป.1)',
    p1missing: 'ตัวไม่ทราบค่า (ป.1)',
    p1number: 'จำนวนและตัวเลข (ป.1)',
    p1pictograph: 'แผนภูมิรูปภาพ (ป.1)',
    p2plus: 'บวก (ป.2)',
    p2minus: 'ลบ (ป.2)',
    p2multiply: 'คูณ (ป.2)',
    p2divide: 'หาร (ป.2)',
    p2mixed: 'ระคน (ป.2)',
    p2missing: 'ตัวไม่ทราบค่า (ป.2)',
    p2placevalue: 'จำนวนไม่เกิน 1,000 (ป.2)',
    p2compare: 'เปรียบเทียบจำนวน (ป.2)',
    p2length: 'ความยาว (ป.2)',
    p2weight: 'น้ำหนัก (ป.2)',
    p2capacity: 'ความจุ (ป.2)',
    p2time: 'เวลา (ป.2)',
    p2shape: 'รูปเรขาคณิต (ป.2)',
    p2pictograph: 'แผนภูมิรูปภาพ (ป.2)',
    p2wordproblem: 'โจทย์ปัญหา (ป.2)',
    p5decimal: 'ทศนิยม (ป.5)',
    p5percentage: 'ร้อยละ (ป.5)',
    p5fraction: 'เศษส่วน (ป.5)',
    p5gcflcm: 'ห.ร.ม. / ค.ร.น. (ป.6)',
    p5mixednumber: 'จำนวนคละ (ป.5)',
    p5geometry: 'พื้นที่ / รอบรูป (เสริม)',
    p5volume: 'ปริมาตร (ป.5)',
    p5angle: 'มุม (เสริม)',
    p5average: 'ค่าเฉลี่ย (เสริม)',
    p5barchart: 'อ่านแผนภูมิแท่ง (ป.4)',
    p5wordproblem: 'โจทย์ปัญหา (ป.5)',
    p5fractiondecimal: 'เศษส่วนเป็นทศนิยม (ป.5)',
    p5proportion: 'บัญญัติไตรยางศ์ (ป.5)',
    p5measure: 'ความยาวและน้ำหนัก (ป.5)',
    p5quadrilateral: 'จำแนกรูปสี่เหลี่ยม (ป.5)',
    p5quadarea: 'รอบรูปและพื้นที่สี่เหลี่ยม (ป.5)',
    p5prism: 'ปริซึม (ป.5)',
    p5linegraph: 'กราฟเส้น (ป.5)',
    p5barwrite: 'เขียนแผนภูมิแท่ง (ป.5)',
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

    let current = known.filter(function (row) { return lessonMenuId(row.lesson_id); });
    let removed = known.filter(function (row) { return !lessonMenuId(row.lesson_id); });

    $('#progressLessonList').html(progressLessonRows(current) + (removed.length
        ? '<h4 class="progress-sub-title">บทเก่าที่เอาออกจากเมนูแล้ว</h4>' + progressLessonRows(removed)
        : ''));
}

function progressLessonRows(rows) {
    return rows.map(function (row) {
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
        $('#progressQuizList').html('<p class="progress-empty">ยังไม่มีสถิติ ลองทำแบบฝึกคำนวณเร็วให้ครบทุกข้อนะ</p>');
        return 0;
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
    return keys.length;
}

function renderProgressFinalQuiz(results, speedCount) {
    let grades = Object.keys(results).sort();

    $('#progressFinalQuizList').html(grades.length
        ? grades.map(function (grade) {
            let row = results[grade];
            return '<div class="progress-row progress-row-compact">' +
                '<span class="progress-row-name">' + progressGroupLabel(grade) + '</span>' +
                '<span class="progress-row-score">' + row.correct + '/' + row.total +
                    ' (' + finalQuizPercent(row) + '%) · ' + formatProgressDate(row.at) + '</span>' +
            '</div>';
        }).join('')
        : '<p class="progress-empty">ยังไม่มีคะแนนแบบทดสอบ</p>');

    let latest = grades.map(function (grade) { return results[grade]; })
        .sort(function (a, b) { return a.at < b.at ? 1 : -1; })[0];
    let notes = [];

    if (speedCount) {
        notes.push('คำนวณเร็ว ' + speedCount + ' รายการ');
    }
    if (latest) {
        notes.push('แบบทดสอบล่าสุด ' + finalQuizPercent(latest) + '%');
    }
    $('#progressStatsNote').text(notes.join(' · ') || 'ยังไม่มีสถิติ');
}

// Only once there is something on it: three empty slots are an invitation on the
// quiz page, but here they would be one more thing a new child has not done.
function renderProgressTrophies(results) {
    $('#progressTrophyCard').toggle(!!results && finalQuizHasTrophy(results));
    $('#progressTrophyShelf').html(finalQuizShelfHtml(results || {}));
}

// Lesson ids map onto menu ids by grade prefix (p5decimal -> menu_p5_decimal).
// Returns null when no such menu exists, which is the case for the four
// general lessons that were removed but whose history is still shown.
function lessonMenuId(lessonId) {
    let menuId = lessonId.replace(/^(p\d)/, 'menu_$1_');
    return document.getElementById(menuId) ? menuId : null;
}

// attr rather than data: jQuery would remember the first value, and the next-step
// button changes target as the child works through things
$(document).on('click', '.progress-fix-btn, .progress-map-row, #progressNextBtn', function (e) {
    e.stopPropagation();
    let el = document.getElementById($(this).attr('data-menu-id'));
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

// Whether the card is shown at all. Kept on the account (user_metadata, like the
// grade) so hiding it on the tablet hides it on the laptop too. Absent means
// shown, so nobody loses the card by not having an opinion about it.
var reviewEnabled = true;

function isReviewEnabled() {
    return reviewEnabled;
}

// The profile picker only follows a real change, so a pill the child has clicked
// but not saved yet survives the auth events that fire on tab refocus.
function setReviewPreference(user) {
    let enabled = !(user.user_metadata && user.user_metadata.review_enabled === false);
    if (enabled === reviewEnabled) {
        return;
    }
    reviewEnabled = enabled;
    if (typeof syncProfileReviewToggle === 'function') {
        syncProfileReviewToggle();
    }
}

function hideProgressReview() {
    $('#progressReviewCard').hide();
    $('#menu_progress .nav-review-badge').remove();
}

// session.user is this device's cached copy and can lag a change made elsewhere
// by up to an hour, so ask the server before drawing anything. Otherwise the
// badge would flash up for a card that was hidden on another device. If the
// request fails the cached value stands.
function applyReviewVisibility() {
    return supabaseClient.auth.getUser().then(function (result) {
        if (result.data && result.data.user) {
            setReviewPreference(result.data.user);
        }
        if (!isReviewEnabled()) {
            hideProgressReview();
            return;
        }
        if (typeof fetchLessonStats === 'function') {
            return fetchLessonStats('all').then(renderProgressReview);
        }
    });
}

function daysSince(iso) {
    if (!iso) {
        return Infinity;
    }
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function buildReviewList(stats) {
    // a lesson taken out of the menu cannot be practised, so it is never due
    return stats
        .filter(function (row) { return LESSON_LABELS[row.lesson_id] && lessonMenuId(row.lesson_id); })
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
    if (!isReviewEnabled()) {
        hideProgressReview();
        return;
    }

    let rows = buildReviewList(stats);

    // Capped and hidden when empty: a wall of overdue topics is what makes
    // people abandon review lists, and "nothing to review" needs no card.
    $('#progressReviewCard').toggle(rows.length > 0);
    $('#menu_progress .nav-review-badge').remove();
    if (!rows.length) {
        return;
    }

    $('#progressReviewCount').text(rows.length + ' บท');

    $('#menu_progress').append('<span class="nav-review-badge">' + rows.length + '</span>');

    $('#progressReviewList').html(rows.map(function (row) {
        return '<div class="progress-row progress-row-compact">' +
            '<span class="progress-review-name">' + LESSON_LABELS[row.lessonId] + '</span>' +
            '<span class="progress-review-reason">' + row.reasons.join(' · ') + '</span>' +
            '<button type="button" class="progress-fix-btn" data-menu-id="' + lessonMenuId(row.lessonId) + '">ทบทวน</button>' +
        '</div>';
    }).join(''));
}

// Newest mistake first, so the group order follows what happened most recently.
function groupMistakes(rows) {
    let groups = [];
    let byLesson = {};

    rows.forEach(function (row) {
        if (!byLesson[row.lesson_id]) {
            byLesson[row.lesson_id] = { lessonId: row.lesson_id, expressions: [] };
            groups.push(byLesson[row.lesson_id]);
        }
        byLesson[row.lesson_id].expressions.push(row.expression);
    });

    return groups;
}

function renderProgressMistakes(rows) {
    $('#progressMistakeCount').text(rows.length + ' ข้อ');

    if (!rows.length) {
        $('#progressMistakeList').html('<p class="progress-empty">ยังไม่มีข้อที่ตอบผิด เก่งมาก!</p>');
        return;
    }

    $('#progressMistakeList').html(groupMistakes(rows).map(function (group) {
        let label = LESSON_LABELS[group.lessonId] || group.lessonId;
        // the four removed general lessons have no menu to send anyone to
        let menuId = lessonMenuId(group.lessonId);
        let shown = group.expressions.slice(0, MISTAKE_EXAMPLES_SHOWN);
        let hidden = group.expressions.length - shown.length;

        return '<div class="progress-row">' +
            '<div class="progress-mistake-head">' +
                '<span class="progress-review-name">' + label + '</span>' +
                '<span class="progress-mistake-lesson">' + group.expressions.length + ' ข้อ</span>' +
                (menuId
                    ? '<button type="button" class="progress-fix-btn" data-menu-id="' + menuId + '">ฝึกแก้</button>'
                    : '') +
            '</div>' +
            shown.map(function (expression) {
                return '<div class="progress-mistake-expr">' + $('<div>').text(expression).html() + '</div>';
            }).join('') +
            (hidden ? '<div class="progress-mistake-more">และอีก ' + hidden + ' ข้อ</div>' : '') +
        '</div>';
    }).join(''));
}

// All-time, because how far a lesson has come does not change with the range
// picker. Ten answers is the least that says anything: most lessons have fewer,
// and one wrong out of three would otherwise read as a weak lesson.
const LESSON_STAGE_MIN_ANSWERS = 10;
const LESSON_STRONG_ACCURACY = 80;

const LESSON_STAGES = {
    strong: { label: 'เก่งแล้ว', icon: 'bi-star-fill' },
    practising: { label: 'กำลังฝึก', icon: 'bi-pencil-fill' },
    started: { label: 'เพิ่งเริ่ม', icon: 'bi-play-circle' },
    new: { label: 'ยังไม่เริ่ม', icon: 'bi-circle' },
};

const PROGRESS_GRADE_GROUPS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
const PROGRESS_MAP_SHOWN = 6;
const MISTAKE_EXAMPLES_SHOWN = 3;
const PROGRESS_MISTAKE_LIMIT = 1000;      // PostgREST's row cap, far past any real list

// The curriculum's standards under the names a parent would look for them by.
const PROGRESS_STRANDS = {
    'ค 1.1': 'จำนวนและการดำเนินการ',
    'ค 1.2': 'แบบรูปและความสัมพันธ์',
    'ค 2.1': 'การวัด',
    'ค 2.2': 'เรขาคณิต',
    'ค 3.1': 'สถิติ',
};

var progressAllStats = [];
var progressMapGroup = null;              // null until the child picks a tab
var progressMapExpanded = false;
var progressCurriculumGrade = null;       // null until a parent picks one

function progressGroupLabel(group) {
    return $('#progressMapPicker [data-group="' + group + '"]').text();
}

function progressStatsById() {
    let byId = {};
    progressAllStats.forEach(function (row) { byId[row.lesson_id] = row; });
    return byId;
}

// The sidebar already lists every lesson in teaching order, so the map reads it
// instead of keeping a second list that could drift from the menu.
function progressGroupLessons(group) {
    let byId = progressStatsById();

    return $('#group-' + group + ' .nav-menu-item').map(function () {
        let id = this.id.replace('menu_', '').replace('_', '');
        let stats = byId[id] || null;
        return {
            id: id,
            menuId: this.id,
            name: $(this).find('span').text(),
            stats: stats,
            stage: lessonStage(stats)
        };
    }).get();
}

function lessonStage(stats) {
    if (!stats) {
        return 'new';
    }
    if (stats.total < LESSON_STAGE_MIN_ANSWERS) {
        return 'started';
    }
    return +stats.accuracy_pct >= LESSON_STRONG_ACCURACY ? 'strong' : 'practising';
}

function lessonStageText(stage, stats) {
    return LESSON_STAGES[stage].label + (stage === 'started' ? ' ' + stats.total + ' ข้อ' : '');
}

// The grade from the profile when there is one, otherwise wherever the child has
// done the most work. เสริม is not a grade, so it is never the starting point.
function homeProgressGroup() {
    if (PROGRESS_GRADE_GROUPS.indexOf(menuGradeApplied) !== -1) {
        return menuGradeApplied;
    }

    let answers = function (group) {
        return progressGroupLessons(group).reduce(function (sum, lesson) {
            return sum + (lesson.stats ? +lesson.stats.total : 0);
        }, 0);
    };

    return PROGRESS_GRADE_GROUPS.reduce(function (best, group) {
        return answers(group) > answers(best) ? group : best;
    });
}

function renderProgressMap() {
    let group = progressMapGroup || homeProgressGroup();
    let lessons = progressGroupLessons(group);
    let strong = lessons.filter(function (lesson) { return lesson.stage === 'strong'; }).length;
    let shown = progressMapExpanded ? lessons : lessons.slice(0, PROGRESS_MAP_SHOWN);
    let hidden = lessons.length - PROGRESS_MAP_SHOWN;

    $('#progressMapPicker .mode-btn').removeClass('active');
    $('#progressMapPicker [data-group="' + group + '"]').addClass('active');
    $('#progressMapCount').text('เก่งแล้ว ' + strong + ' จาก ' + lessons.length + ' บท');
    $('#progressMapBar').css('width', (lessons.length ? 100 * strong / lessons.length : 0) + '%');

    $('#progressMapList').html(shown.map(function (lesson) {
        return '<button type="button" class="progress-map-row is-' + lesson.stage + '" data-menu-id="' + lesson.menuId + '">' +
            '<i class="bi ' + LESSON_STAGES[lesson.stage].icon + '"></i>' +
            '<span class="progress-map-name">' + lesson.name + '</span>' +
            '<span class="progress-map-stage">' + lessonStageText(lesson.stage, lesson.stats) + '</span>' +
        '</button>';
    }).join(''));

    $('#progressMapMore')
        .toggle(hidden > 0)
        .text(progressMapExpanded ? 'ย่อรายการ' : 'ดูอีก ' + hidden + ' บท');
}

$('#progressMapPicker').on('click', '.mode-btn', function () {
    progressMapGroup = $(this).data('group');
    progressMapExpanded = false;
    renderProgressMap();
});

$('#progressMapMore').on('click', function () {
    progressMapExpanded = !progressMapExpanded;
    renderProgressMap();
});

// Strong only when every lesson is. Adding the answers up instead would let two
// hundred additions read as strong on an indicator that also asks for subtraction.
function combinedLessonStage(lessons) {
    let has = function (stage) {
        return lessons.some(function (lesson) { return lesson.stage === stage; });
    };

    if (lessons.every(function (lesson) { return lesson.stage === 'strong'; })) {
        return 'strong';
    }
    if (has('strong') || has('practising')) {
        return 'practising';
    }
    return has('started') ? 'started' : 'new';
}

// Answers are only recorded per lesson, so an indicator takes its stage from the
// lessons that teach it, and every indicator sharing them reads the same. They come
// in sidebar order, so a row leads to the first lesson still to do.
function progressIndicators(grade) {
    let lessons = progressGroupLessons(grade);

    return finalQuizIndicators[grade].map(function (indicator) {
        let ids = [indicator.lesson].concat(indicator.also || []);
        let linked = lessons.filter(function (lesson) { return ids.indexOf(lesson.id) !== -1; });
        let next = linked.filter(function (lesson) { return lesson.stage !== 'strong'; })[0] || null;

        return {
            code: indicator.code,
            text: indicator.text,
            strand: indicator.code.split(' ป.')[0],
            lessons: linked,
            next: next,
            menuId: (next || linked[0]).menuId,
            stats: {
                total: linked.reduce(function (sum, lesson) {
                    return sum + (lesson.stats ? +lesson.stats.total : 0);
                }, 0)
            },
            stage: combinedLessonStage(linked)
        };
    });
}

function progressStrongCount(indicators) {
    return indicators.filter(function (indicator) { return indicator.stage === 'strong'; }).length;
}

function progressIndicatorNext(indicator) {
    let count = indicator.lessons.length;

    if (count < 2 || !indicator.next) {
        return '';
    }

    let strong = count - indicator.lessons.filter(function (lesson) { return lesson.stage !== 'strong'; }).length;

    return '<span class="progress-indicator-next">' +
        (strong ? 'เก่งแล้ว ' + strong + ' จาก ' + count + ' บท · ' : '') + 'ต่อไป ' + indicator.next.name +
    '</span>';
}

function progressIndicatorRow(indicator) {
    let names = indicator.lessons.map(function (lesson) { return lesson.name; }).join(', ');

    return '<button type="button" class="progress-map-row progress-indicator-row is-' + indicator.stage +
        '" data-menu-id="' + indicator.menuId + '">' +
        '<i class="bi ' + LESSON_STAGES[indicator.stage].icon + '"></i>' +
        '<span class="progress-indicator-text">' +
            '<span class="progress-map-name">' + $('<div>').text(indicator.text).html() + '</span>' +
            '<span class="progress-indicator-meta">' +
                '<span>' + indicator.code + ' · ' + names + '</span>' +
                '<span class="progress-map-stage">' + lessonStageText(indicator.stage, indicator.stats) + '</span>' +
                progressIndicatorNext(indicator) +
            '</span>' +
        '</span>' +
    '</button>';
}

// All-time, like the map above it: the range picker below only moves what is
// under it, because a term's coverage does not reset each week.
function renderProgressCurriculum() {
    let grade = progressCurriculumGrade || homeProgressGroup();
    let indicators = progressIndicators(grade);
    let strong = progressStrongCount(indicators);
    let strands = indicators
        .map(function (indicator) { return indicator.strand; })
        .filter(function (strand, index, all) { return all.indexOf(strand) === index; });

    $('#progressCurriculumPicker .mode-btn').removeClass('active');
    $('#progressCurriculumPicker [data-grade="' + grade + '"]').addClass('active');
    $('#progressCurriculumCount').text('เก่งแล้ว ' + strong + ' จาก ' + indicators.length + ' ตัวชี้วัด');
    $('#progressCurriculumBar').css('width', 100 * strong / indicators.length + '%');
    $('#progressCurriculumGap').text(finalQuizNotCovered[grade] || '');

    $('#progressCurriculumList').html(strands.map(function (strand) {
        let rows = indicators.filter(function (indicator) { return indicator.strand === strand; });
        return '<div class="progress-strand">' +
            '<div class="progress-strand-head">' +
                '<span>' + PROGRESS_STRANDS[strand] + '</span>' +
                '<span>เก่งแล้ว ' + progressStrongCount(rows) + ' จาก ' + rows.length + '</span>' +
            '</div>' +
            rows.map(progressIndicatorRow).join('') +
        '</div>';
    }).join(''));
}

$('#progressCurriculumPicker').on('click', '.mode-btn', function () {
    progressCurriculumGrade = $(this).data('grade');
    renderProgressCurriculum();
});

function mistakeNextStep(mistakes) {
    let top = groupMistakes(mistakes)
        .filter(function (group) { return lessonMenuId(group.lessonId); })
        .sort(function (a, b) { return b.expressions.length - a.expressions.length; })[0];

    return top && {
        menuId: lessonMenuId(top.lessonId),
        title: 'ฝึกแก้ ' + LESSON_LABELS[top.lessonId],
        reason: 'มีข้อที่ต้องแก้ ' + top.expressions.length + ' ข้อ'
    };
}

function reviewNextStep() {
    if (!isReviewEnabled()) {
        return null;
    }

    let top = buildReviewList(progressAllStats)[0];

    return top && {
        menuId: lessonMenuId(top.lessonId),
        title: 'ทบทวน ' + LESSON_LABELS[top.lessonId],
        reason: top.reasons.join(' · ')
    };
}

// Past mistakes and reviews the next step stays within the child's own grade, so
// it follows the order the lessons are taught in.
function lessonNextStep() {
    let group = homeProgressGroup();
    let lessons = progressGroupLessons(group);

    let underway = lessons
        .filter(function (lesson) { return lesson.stage === 'started' || lesson.stage === 'practising'; })
        .sort(function (a, b) { return a.stats.last_practiced_at < b.stats.last_practiced_at ? 1 : -1; })[0];

    if (underway) {
        return {
            menuId: underway.menuId,
            title: 'ฝึกต่อ ' + LESSON_LABELS[underway.id],
            reason: underway.stage === 'started'
                ? 'ทำแล้ว ' + underway.stats.total + ' ข้อ อีก ' +
                    (LESSON_STAGE_MIN_ANSWERS - underway.stats.total) + ' ข้อจะรู้ระดับ'
                : 'ตอบถูก ' + underway.stats.accuracy_pct + '% ฝึกให้ถึง ' + LESSON_STRONG_ACCURACY + '%'
        };
    }

    let fresh = lessons.filter(function (lesson) { return lesson.stage === 'new'; })[0];

    if (fresh) {
        return {
            menuId: fresh.menuId,
            title: 'เริ่มบทใหม่ ' + LESSON_LABELS[fresh.id],
            reason: 'ยังไม่เคยฝึกบทนี้'
        };
    }

    return {
        menuId: 'menu_finalquiz',
        title: 'เก่งครบทุกบทของ ' + progressGroupLabel(group) + ' แล้ว',
        reason: 'ลองทำแบบทดสอบดูว่าพร้อมแค่ไหน',
        action: 'ไปที่แบบทดสอบ'
    };
}

function renderProgressNext(mistakes) {
    let step = mistakeNextStep(mistakes) || reviewNextStep() || lessonNextStep();

    $('#progressNextTitle').text(step.title);
    $('#progressNextReason').text(step.reason);
    $('#progressNextAction').text(step.action || 'เริ่มฝึก');
    $('#progressNextBtn').attr('data-menu-id', step.menuId);
    $('#progressNextCard').show();
}

const DAILY_CHART_DAYS = 14;

var dailyChartSummary = '';

function dailyChartDayName(date, options) {
    return date.toLocaleDateString('th-TH', options);
}

// A day only counts as practised if it is in the list: a speed quiz with nothing
// right is still a day the child sat down and tried.
function renderDailyChart(days) {
    $('#dailyChartCard').toggle(!!days);
    if (!days) {
        return;
    }

    let answersOn = {};
    days.forEach(function (row) { answersOn[row.day] = +row.answers; });

    let chart = [];
    for (let back = DAILY_CHART_DAYS - 1; back >= 0; back--) {
        let date = new Date();
        date.setDate(date.getDate() - back);
        chart.push({ date: date, answers: answersOn[localDateKey(date)] });
    }

    let practised = chart.filter(function (day) { return day.answers !== undefined; });
    let total = practised.reduce(function (sum, day) { return sum + day.answers; }, 0);
    let most = practised.reduce(function (top, day) { return Math.max(top, day.answers); }, 0);

    dailyChartSummary = 'ฝึก ' + practised.length + ' จาก ' + DAILY_CHART_DAYS + ' วัน · ' + total + ' ข้อ' +
        (most ? ' · มากสุด ' + most + ' ข้อ' : '');

    $('#dailyChart').html(chart.map(function (day, index) {
        let name = dailyChartDayName(day.date, { weekday: 'short', day: 'numeric', month: 'short' });
        let note = name + ': ' + (day.answers === undefined ? 'ไม่ได้ฝึก' : day.answers + ' ข้อ');
        let height = most && day.answers ? 100 * day.answers / most : 0;

        return '<button type="button" class="daily-chart-day' + (index === chart.length - 1 ? ' is-today' : '') +
            '" data-note="' + note + '" aria-label="' + note + '">' +
            '<span class="daily-chart-bar' + (height ? '' : ' is-empty') + '" style="height: ' + height + '%;"></span>' +
        '</button>';
    }).join(''));

    $('#dailyChartStart').text(dailyChartDayName(chart[0].date, { day: 'numeric', month: 'short' }));
    $('#dailyChartNote').text(dailyChartSummary);
}

$('#dailyChart').on('mouseenter focusin click', '.daily-chart-day', function () {
    $('#dailyChartNote').text($(this).attr('data-note'));
});

$('#dailyChart').on('mouseleave focusout', '.daily-chart-day', function () {
    $('#dailyChartNote').text(dailyChartSummary);
});

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
    $('#dailyGoalLeft').text('อีก ' + (goal - done) + ' ข้อ').toggle(!reached);
    // No red for "not there yet": a partly filled goal is progress, not a
    // failing score, and colouring it like one would discourage exactly the
    // child who most needs encouraging.
    $('#dailyGoalBar')
        .css('width', pct + '%')
        .toggleClass('is-reached', reached);

    $('#dayStreakValue').text(getDayStreak() + ' วัน');
    $('#dayStreakBest').text(getBestDayStreak() + ' วัน');
}

// Only the parent section follows the range picker: everything above it is about
// where the child stands now, which a filter would make misleading.
function refreshProgressRange() {
    let range = progressRange;

    fetchLessonStats(range).then(function (stats) {
        // a slower earlier request must not overwrite a newer range's results
        if (progressRange !== range) {
            return;
        }
        renderProgressSummary(stats);
        renderProgressLessons(stats);
    });
}

function refreshProgressPage() {
    renderDailyGoal();

    if (typeof fetchLessonStats !== 'function') {
        return;
    }

    refreshProgressRange();

    syncDailyActivity().then(function (days) {
        renderDailyGoal();
        renderDailyChart(days);
    });

    // Waits on the review setting too, so a child who has hidden reviews is not
    // sent to one by the next-step card.
    Promise.all([
        fetchLessonStats('all'),
        fetchRecentMistakes(PROGRESS_MISTAKE_LIMIT),
        applyReviewVisibility()
    ]).then(function (results) {
        progressAllStats = results[0];
        renderProgressMap();
        renderProgressCurriculum();
        renderProgressNext(results[1]);
        renderProgressMistakes(results[1]);
    });

    Promise.all([fetchQuizBests(), fetchFinalQuizResults()]).then(function (results) {
        renderProgressTrophies(results[1]);
        renderProgressFinalQuiz(results[1] || {}, renderProgressQuiz(results[0]));
    });

    fetchFixedMistakeCount().then(function (count) {
        $('#progressMistakeNote').text(count > 0 ? 'แก้แล้ว ' + count + ' ข้อ' : 'แยกตามบทเรียน');
    });
}

$('#progressRangePicker').on('click', '.mode-btn', function () {
    $('#progressRangePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    progressRange = $(this).data('range');
    refreshProgressRange();
});

// Recompute when the page is opened so it always reflects the latest answers.
$(document).on('shown.bs.tab', '#menu_progress', refreshProgressPage);

// The badge has to be there before the page is opened, or it could never do its
// job of telling a child there is something to come back to.
// Saving the setting lands here too (USER_UPDATED), so it takes effect at once.
supabaseClient.auth.onAuthStateChange(function (event, session) {
    if (!session) {
        reviewEnabled = true;   // the next account starts from its own setting
        progressMapGroup = null;
        progressCurriculumGrade = null;
        hideProgressReview();
        return;
    }
    setReviewPreference(session.user);
    applyReviewVisibility();
});
