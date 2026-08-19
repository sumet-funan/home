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

function renderProgressSummary(stats) {
    let total = 0;
    let correct = 0;

    // same filter as the lesson list, so the totals always match what is shown
    stats.filter(function (row) { return LESSON_LABELS[row.lesson_id]; }).forEach(function (row) {
        total += +row.total;
        correct += +row.correct;
    });

    let accuracy = total ? Math.round(1000 * correct / total) / 10 : 0;

    $('#progressSummary').html(
        '<div class="progress-stat"><span class="progress-stat-label">ทำทั้งหมด</span>' +
        '<span class="progress-stat-value">' + total + '</span></div>' +
        '<div class="progress-stat"><span class="progress-stat-label">ตอบถูก</span>' +
        '<span class="progress-stat-value">' + correct + '</span></div>' +
        '<div class="progress-stat"><span class="progress-stat-label">ความแม่นยำ</span>' +
        '<span class="progress-stat-value">' + accuracy + '%</span></div>'
    );
}

function renderProgressLessons(stats) {
    let known = stats.filter(function (row) { return LESSON_LABELS[row.lesson_id]; });

    if (!known.length) {
        $('#progressLessonList').html('<p class="progress-empty">ยังไม่มีข้อมูล ลองฝึกทำโจทย์สักข้อแล้วกลับมาดูใหม่นะ</p>');
        return;
    }

    known.sort(function (a, b) { return b.total - a.total; });

    let html = known.map(function (row) {
        let pct = +row.accuracy_pct;
        return '<div class="progress-row">' +
            '<div class="progress-row-head">' +
                '<span class="progress-row-name">' + LESSON_LABELS[row.lesson_id] + '</span>' +
                '<span class="progress-row-score">' + row.correct + '/' + row.total + ' (' + pct + '%)</span>' +
            '</div>' +
            '<div class="progress-bar-track">' +
                '<div class="progress-bar-fill ' + accuracyClass(pct) + '" style="width: ' + pct + '%;"></div>' +
            '</div>' +
            '<div class="progress-row-meta">ฝึกล่าสุด ' + formatProgressDate(row.last_practiced_at) + '</div>' +
        '</div>';
    }).join('');

    $('#progressLessonList').html(html);
}

function renderProgressQuiz(results) {
    // best (lowest) time per mode+size, counting perfect runs only
    let bests = {};
    results.forEach(function (row) {
        if (row.correct_count !== row.size) {
            return;
        }
        let key = row.mode + '_' + row.size;
        if (!bests[key] || row.duration_ms < bests[key].duration_ms) {
            bests[key] = row;
        }
    });

    let keys = Object.keys(bests);
    if (!keys.length) {
        $('#progressQuizList').html('<p class="progress-empty">ยังไม่มีสถิติ ลองทำแบบฝึกคำนวณเร็วให้ครบทุกข้อนะ</p>');
        return;
    }

    let symbols = { '+': '+', '-': '−', '*': '×' };
    let html = keys.sort().map(function (key) {
        let row = bests[key];
        return '<div class="progress-row progress-row-compact">' +
            '<span class="progress-row-name">' + symbols[row.mode] + ' &nbsp;' + row.size + ' ข้อ</span>' +
            '<span class="progress-row-score">' + formatProgressDuration(row.duration_ms) + '</span>' +
        '</div>';
    }).join('');

    $('#progressQuizList').html(html);
}

function refreshProgressPage() {
    if (typeof fetchLessonStats !== 'function') {
        return;
    }

    fetchLessonStats().then(function (stats) {
        renderProgressSummary(stats);
        renderProgressLessons(stats);
    });

    fetchQuizBests().then(renderProgressQuiz);
}

// Recompute when the page is opened so it always reflects the latest answers.
$(document).on('shown.bs.tab', '#menu_progress', refreshProgressPage);
