var speedQuizObj = {
    mode: "+",
    size: 100,
    kind: "count",     // "count" = finish a fixed set, "timed" = as many as possible
    layout: "sheet",   // "sheet" = one question per card, "grid" = shared headers
    questions: [],
    rowHeaders: [],
    colHeaders: [],
    running: false,
    startTime: 0,
    timerInterval: null,
}

const SPEED_QUIZ_TIMED_SECONDS = 60;
// Deliberately more than anyone can finish in the time, so the clock is always
// what stops the round rather than running out of questions.
const SPEED_QUIZ_TIMED_QUESTIONS = 200;

function speedQuizQuestionCount() {
    return speedQuizObj.kind === 'timed' ? SPEED_QUIZ_TIMED_QUESTIONS : speedQuizObj.size;
}

// Shows the "leave running quiz?" modal only if a round is in progress;
// otherwise runs the action immediately. On confirm, hides the modal then
// runs the action.
function confirmSpeedQuizLeave(onConfirm) {
    if (!speedQuizObj.running) {
        onConfirm();
        return;
    }

    let modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('speedQuizLeaveModal'));

    $('#speedQuizLeaveConfirmBtn').off('click.speedQuizLeave').on('click.speedQuizLeave', function () {
        modal.hide();
        onConfirm();
    });

    modal.show();
}

function shuffleSpeedQuizArray(arr) {
    let a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        let j = parseInt(Math.random() * (i + 1));
        let temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a;
}

// Every pairing of the two digit sets is built and then shuffled, rather than
// drawing random pairs. That keeps the point of the drill: across a full round
// each combination appears exactly once, so no fact is practised twice while
// another is missed.
function expectedSpeedQuizAnswer(a, b) {
    return speedQuizObj.mode === '+' ? a + b
        : speedQuizObj.mode === '-' ? a - b
        : a * b;
}

function generateSpeedQuizQuestions() {
    let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let firsts = speedQuizObj.mode === '-'
        ? [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]   // keeps every answer >= 0
        : digits;

    // Both layouts end up with the same list of questions, so marking and
    // keyboard navigation stay identical; only the drawing differs.
    let wanted = speedQuizQuestionCount();

    if (speedQuizObj.layout === 'grid') {
        // rows repeat once the digit set runs out, which timed rounds need
        speedQuizObj.rowHeaders = [];
        while (speedQuizObj.rowHeaders.length < wanted / 10) {
            speedQuizObj.rowHeaders = speedQuizObj.rowHeaders.concat(shuffleSpeedQuizArray(firsts));
        }
        speedQuizObj.rowHeaders = speedQuizObj.rowHeaders.slice(0, wanted / 10);
        speedQuizObj.colHeaders = shuffleSpeedQuizArray(digits);

        speedQuizObj.questions = [];
        speedQuizObj.rowHeaders.forEach(function (a) {
            speedQuizObj.colHeaders.forEach(function (b) {
                speedQuizObj.questions.push({ a: a, b: b, expected: expectedSpeedQuizAnswer(a, b) });
            });
        });
        return;
    }

    let pairs = [];
    firsts.forEach(function (a) {
        digits.forEach(function (b) {
            pairs.push({ a: a, b: b });
        });
    });

    // Each pass is a fresh shuffle of every combination, so a timed round only
    // starts repeating facts once it has been through them all.
    let picked = [];
    while (picked.length < wanted) {
        picked = picked.concat(shuffleSpeedQuizArray(pairs));
    }

    speedQuizObj.questions = picked
        .slice(0, wanted)
        .map(function (p) {
            return { a: p.a, b: p.b, expected: expectedSpeedQuizAnswer(p.a, p.b) };
        });
}

function speedQuizSymbol() {
    return speedQuizObj.mode === '*' ? '×' : speedQuizObj.mode;
}

function speedQuizInputHtml(index) {
    return '<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" ' +
        'autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" ' +
        'class="speed-quiz-input" data-index="' + index + '">';
}

const SPEED_QUIZ_MODE_NAMES = { '+': 'บวก', '-': 'ลบ', '*': 'คูณ' };

function renderSpeedQuizSheet() {
    // The sign is not repeated on every card -- the whole round uses one
    // operation -- so it is shown once in a chip that stays in view while
    // scrolling, or a child partway down has no way to check which it is.
    // It lives outside the grid wrapper: that wrapper scrolls horizontally for
    // the table layout, and a sticky child sticks to its scroll container
    // rather than the page, so inside it the chip just scrolled away.
    $('#speedQuizOperatorHint')
        .html('<span class="sq-hint-symbol">' + speedQuizSymbol() + '</span>' +
              (SPEED_QUIZ_MODE_NAMES[speedQuizObj.mode] || ''))
        .show();

    let cards = speedQuizObj.questions.map(function (q, i) {
        return '<div class="speed-quiz-item">' +
            '<span class="sq-first">' + q.a + '</span>' +
            '<span class="sq-second">' + q.b + '</span>' +
            speedQuizInputHtml(i) +
        '</div>';
    }).join('');

    $('#speedQuizGrid')
        .removeClass('speed-quiz-sheet')
        .html('<div class="speed-quiz-sheet">' + cards + '</div>');
}

function renderSpeedQuizTable() {
    let html = '<table class="speed-quiz-table"><thead><tr><th class="corner-cell">' +
        speedQuizSymbol() + '</th>';

    speedQuizObj.colHeaders.forEach(function (b) {
        html += '<th>' + b + '</th>';
    });
    html += '</tr></thead><tbody>';

    speedQuizObj.rowHeaders.forEach(function (a, r) {
        html += '<tr><th>' + a + '</th>';
        for (let c = 0; c < speedQuizObj.colHeaders.length; c++) {
            html += '<td>' + speedQuizInputHtml(r * 10 + c) + '</td>';
        }
        html += '</tr>';
    });
    html += '</tbody></table>';

    // the table shows the operator in its own corner cell already
    $('#speedQuizOperatorHint').hide();
    $('#speedQuizGrid').removeClass('speed-quiz-sheet').html(html);
}

function renderSpeedQuizGrid() {
    if (speedQuizObj.layout === 'grid') {
        renderSpeedQuizTable();
        return;
    }
    renderSpeedQuizSheet();
}

function formatSpeedQuizTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return pad(minutes) + ':' + pad(seconds);
}

function updateSpeedQuizTimerDisplay() {
    let elapsed = Date.now() - speedQuizObj.startTime;

    if (speedQuizObj.kind !== 'timed') {
        $('#speedQuizTimer').text(formatSpeedQuizTime(elapsed));
        return;
    }

    let remaining = Math.max(0, SPEED_QUIZ_TIMED_SECONDS * 1000 - elapsed);
    $('#speedQuizTimer')
        .text(formatSpeedQuizTime(remaining))
        .toggleClass('is-running-out', remaining <= 10000 && remaining > 0);

    if (remaining === 0 && speedQuizObj.running) {
        finishSpeedQuiz(true);
    }
}

function getSpeedQuizStorageKey() {
    return speedQuizObj.kind === 'timed'
        ? 'speedQuizBestScore_' + speedQuizObj.mode
        : 'speedQuizBestTime_' + speedQuizObj.mode + '_' + speedQuizObj.size;
}

function getLocalSpeedQuizBestTime() {
    let stored = localStorage.getItem(getSpeedQuizStorageKey());
    return stored ? +stored : null;
}

// A fixed-count round is better when it is faster; a timed one when more
// questions were answered correctly. Same slot on screen, opposite comparison.
function isBetterSpeedQuizResult(candidate, current) {
    if (current === null) {
        return true;
    }
    return speedQuizObj.kind === 'timed' ? candidate > current : candidate < current;
}

function formatSpeedQuizBest(value) {
    if (value === null) {
        return speedQuizObj.kind === 'timed' ? '- ข้อ' : '--:--';
    }
    return speedQuizObj.kind === 'timed' ? value + ' ข้อ' : formatSpeedQuizTime(value);
}

// Signed in: the account's best time follows the child across devices.
// Guest: the local best time still works exactly as before.
function loadSpeedQuizBestTime() {
    let mode = speedQuizObj.mode;
    let size = speedQuizObj.size;
    let localBest = getLocalSpeedQuizBestTime();

    let kind = speedQuizObj.kind;
    $('#speedQuizBestTime').text(formatSpeedQuizBest(localBest));

    if (typeof fetchBestQuizResult !== 'function') {
        return;
    }

    fetchBestQuizResult(mode, kind === 'timed' ? SPEED_QUIZ_TIMED_SECONDS : size, kind)
        .then(function (remoteBest) {
            // the selection may have changed while the request was in flight
            if (speedQuizObj.mode !== mode || speedQuizObj.size !== size || speedQuizObj.kind !== kind) {
                return;
            }
            let best = localBest;
            if (remoteBest !== null && isBetterSpeedQuizResult(remoteBest, best)) {
                best = remoteBest;
            }
            $('#speedQuizBestTime').text(formatSpeedQuizBest(best));
        });
}

function saveSpeedQuizBestTime(value) {
    let key = getSpeedQuizStorageKey();
    let stored = localStorage.getItem(key);
    let isNewRecord = isBetterSpeedQuizResult(value, stored === null ? null : +stored);
    if (isNewRecord) {
        localStorage.setItem(key, String(value));
        loadSpeedQuizBestTime();
    }
    return isNewRecord;
}

function showSpeedQuizFeedback(correctCount, elapsedMs, isNewRecord, answeredCount, endedByTimeout) {
    let $feedback = $('#feedbackSpeedQuiz');

    $feedback.removeClass('show is-correct is-incorrect');
    void $feedback[0].offsetWidth;

    let message;
    let good;

    if (speedQuizObj.kind === 'timed') {
        good = correctCount > 0;
        message = '<i class="bi bi-stopwatch-fill"></i> ' +
            (endedByTimeout ? 'หมดเวลา! ' : 'จบรอบ! ') +
            'ทำถูก ' + correctCount + ' ข้อ จากที่ตอบ ' + answeredCount + ' ข้อ' +
            (isNewRecord ? ' (สถิติใหม่!)' : '');
    } else {
        good = correctCount === speedQuizObj.size;
        message = good
            ? '<i class="bi bi-check-circle-fill"></i> ถูกทั้งหมด ' + speedQuizObj.size + ' ข้อ! เวลา ' + formatSpeedQuizTime(elapsedMs) + (isNewRecord ? ' (สถิติใหม่!)' : '')
            : '<i class="bi bi-x-circle-fill"></i> ถูก ' + correctCount + ' จาก ' + speedQuizObj.size + ' ข้อ ลองใหม่อีกครั้งนะ';
    }

    $feedback
        .addClass(good ? 'is-correct' : 'is-incorrect')
        .html(message)
        .addClass('show');
}

function finishSpeedQuiz(endedByTimeout) {
    speedQuizObj.running = false;
    clearInterval(speedQuizObj.timerInterval);
    updateSpeedQuizTimerDisplay();
    $('#speedQuizSubmitBtn').hide();
    $('body').removeClass('sq-running');

    let elapsed = Date.now() - speedQuizObj.startTime;
    let correctCount = 0;

    let answeredCount = 0;

    $('.speed-quiz-input').each(function () {
        let question = speedQuizObj.questions[+$(this).data('index')];
        let raw = $(this).val().trim();
        // the answer sits in a card in sheet layout and a cell in grid layout
        let $item = $(this).closest('.speed-quiz-item, td');

        // A timed round always ends with far more questions untouched than
        // attempted; marking those red would bury the ones actually answered.
        if (raw === '' && speedQuizObj.kind === 'timed') {
            $item.removeClass('correct incorrect');
            return;
        }

        answeredCount++;

        // blank counts as wrong, but must not be read as 0
        if (raw !== '' && +raw === question.expected) {
            $item.removeClass('incorrect').addClass('correct');
            correctCount++;
        } else {
            $item.removeClass('correct').addClass('incorrect');
        }
    });

    let isTimed = speedQuizObj.kind === 'timed';

    if (typeof recordQuizResult === 'function') {
        recordQuizResult(
            speedQuizObj.mode,
            isTimed ? SPEED_QUIZ_TIMED_SECONDS : speedQuizObj.size,
            correctCount,
            isTimed ? SPEED_QUIZ_TIMED_SECONDS * 1000 : elapsed,
            speedQuizObj.kind
        );
    }

    // Lock the grid once it is marked: editing a graded cell would change the
    // number while its correct/incorrect colour stayed from grading, so a cell
    // could show the right answer while still marked wrong. readonly (not
    // disabled) keeps the answers readable and selectable for reviewing.
    $('.speed-quiz-input').prop('readonly', true);

    // A timed round always records a score; a fixed-count one only counts as a
    // time worth keeping when every question was right.
    let isNewRecord = isTimed
        ? saveSpeedQuizBestTime(correctCount)
        : (correctCount === speedQuizObj.size && saveSpeedQuizBestTime(elapsed));

    showSpeedQuizFeedback(correctCount, elapsed, isNewRecord, answeredCount, !!endedByTimeout);
}

function startSpeedQuiz() {
    confirmSpeedQuizLeave(beginSpeedQuizRound);
}

function beginSpeedQuizRound() {
    clearInterval(speedQuizObj.timerInterval);

    generateSpeedQuizQuestions();
    renderSpeedQuizGrid();

    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');
    $('#speedQuizTimer')
        .removeClass('is-running-out')
        .text(speedQuizObj.kind === 'timed' ? formatSpeedQuizTime(SPEED_QUIZ_TIMED_SECONDS * 1000) : '00:00');

    speedQuizObj.running = true;
    speedQuizObj.startTime = Date.now();
    speedQuizObj.timerInterval = setInterval(updateSpeedQuizTimerDisplay, 250);

    $('#speedQuizSubmitBtn').show();
    $('body').addClass('sq-running');
    $('.speed-quiz-input[data-index="0"]').trigger('focus');
}

function resetSpeedQuizForNewSelection() {
    clearInterval(speedQuizObj.timerInterval);
    speedQuizObj.running = false;
    $('#speedQuizSubmitBtn').hide();
    $('body').removeClass('sq-running');
    $('#speedQuizTimer')
        .removeClass('is-running-out')
        .text(speedQuizObj.kind === 'timed' ? formatSpeedQuizTime(SPEED_QUIZ_TIMED_SECONDS * 1000) : '00:00');
    $('#speedQuizGrid').empty();
    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');

    loadSpeedQuizBestTime();
}

$('#speedQuizModePicker').on('click', '.mode-btn', function () {
    let $btn = $(this);
    confirmSpeedQuizLeave(function () {
        $('#speedQuizModePicker .mode-btn').removeClass('active');
        $btn.addClass('active');
        speedQuizObj.mode = $btn.data('mode');

        resetSpeedQuizForNewSelection();
    });
});

$('#speedQuizSizePicker').on('click', '.mode-btn', function () {
    let $btn = $(this);
    confirmSpeedQuizLeave(function () {
        $('#speedQuizSizePicker .mode-btn').removeClass('active');
        $btn.addClass('active');
        speedQuizObj.size = +$btn.data('size');

        resetSpeedQuizForNewSelection();
    });
});

// A timed round runs until the clock stops it, so the question count is not a
// choice the child makes; hiding it avoids offering a control that does nothing.
function applySpeedQuizKindUI() {
    let timed = speedQuizObj.kind === 'timed';
    // hide the whole row, otherwise its label sits there labelling nothing
    $('#speedQuizSizeOption').toggle(!timed);
    $('#speedQuizTimerLabel').text(timed ? 'เวลาที่เหลือ' : 'เวลา');
    $('#speedQuizBestLabel').text(timed ? 'ทำได้มากที่สุด' : 'สถิติที่ดีที่สุด');
}

$('#speedQuizKindPicker').on('click', '.mode-btn', function () {
    let $btn = $(this);
    confirmSpeedQuizLeave(function () {
        $('#speedQuizKindPicker .mode-btn').removeClass('active');
        $btn.addClass('active');
        speedQuizObj.kind = $btn.data('kind');

        applySpeedQuizKindUI();
        resetSpeedQuizForNewSelection();
    });
});

$('#speedQuizLayoutPicker').on('click', '.mode-btn', function () {
    let $btn = $(this);
    confirmSpeedQuizLeave(function () {
        $('#speedQuizLayoutPicker .mode-btn').removeClass('active');
        $btn.addClass('active');
        speedQuizObj.layout = $btn.data('layout');

        resetSpeedQuizForNewSelection();
    });
});

function advanceSpeedQuizFocus(index) {
    $('.speed-quiz-input[data-index="' + (index + 1) + '"]').trigger('focus');
}

$(document).on('keydown', '.speed-quiz-input', function (e) {
    if (e.key !== 'Enter') {
        return;
    }
    e.preventDefault();
    advanceSpeedQuizFocus(+$(this).data('index'));
});

function countEmptySpeedQuizCells() {
    return $('.speed-quiz-input').filter(function () { return $(this).val().trim() === ''; }).length;
}

// The grid is graded only when the child says they are done, so they get a
// chance to look back over their answers first. Submitting with blanks asks
// first, since those count as wrong and the round cannot be reopened.
$('#speedQuizSubmitBtn').on('click', function () {
    if (!speedQuizObj.running) {
        return;
    }

    // In a timed round nearly every question is expected to be left blank, so
    // warning about them would fire on every single submit.
    let empty = speedQuizObj.kind === 'timed' ? 0 : countEmptySpeedQuizCells();
    if (!empty) {
        finishSpeedQuiz();
        return;
    }

    $('#speedQuizSubmitEmptyCount').text(empty);
    bootstrap.Modal.getOrCreateInstance(document.getElementById('speedQuizSubmitModal')).show();
});

// Grade only once the modal has fully closed. Doing it inline with hide()
// leaves the dialog stuck open: finishSpeedQuiz hides the submit button, which
// is the element Bootstrap returns focus to, and that interrupts its close.
$('#speedQuizSubmitConfirmBtn').on('click', function () {
    let el = document.getElementById('speedQuizSubmitModal');

    $(el).one('hidden.bs.modal', function () {
        if (speedQuizObj.running) {
            finishSpeedQuiz();
        }
    });

    bootstrap.Modal.getInstance(el).hide();
});

$(document).on('focus', '.speed-quiz-input', function () {
    $(this).trigger('select');
});

// switching to another lesson tab while a round is in progress
$(document).on('show.bs.tab', '[data-bs-toggle="list"]', function (e) {
    let leavingSpeedQuiz = e.relatedTarget && e.relatedTarget.id === 'menu_speedquiz';
    if (!leavingSpeedQuiz || !speedQuizObj.running) {
        return;
    }

    e.preventDefault();
    let targetTab = e.target;

    confirmSpeedQuizLeave(function () {
        speedQuizObj.running = false;
        clearInterval(speedQuizObj.timerInterval);
        bootstrap.Tab.getOrCreateInstance(targetTab).show();
    });
});

// closing the tab / refreshing / navigating away entirely
window.addEventListener('beforeunload', function (e) {
    if (speedQuizObj.running) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// signing in or out changes whose best time applies
supabaseClient.auth.onAuthStateChange(function () {
    loadSpeedQuizBestTime();
});

loadSpeedQuizBestTime();
