var speedQuizObj = {
    mode: "+",
    size: 100,
    rowHeaders: [],
    colHeaders: [],
    running: false,
    startTime: 0,
    timerInterval: null,
}

const SPEED_QUIZ_LEAVE_WARNING = 'กำลังทำแบบฝึกคำนวณเร็วอยู่ ถ้าออกตอนนี้ความคืบหน้าจะหายไป ต้องการออกจากหน้านี้หรือไม่?';

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

function generateSpeedQuizHeaders() {
    let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let numRows = speedQuizObj.size / 10;

    if (speedQuizObj.mode === "-") {
        let bigDigits = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
        speedQuizObj.rowHeaders = shuffleSpeedQuizArray(bigDigits).slice(0, numRows);
        speedQuizObj.colHeaders = shuffleSpeedQuizArray(digits);
    } else {
        speedQuizObj.rowHeaders = shuffleSpeedQuizArray(digits).slice(0, numRows);
        speedQuizObj.colHeaders = shuffleSpeedQuizArray(digits);
    }
}

function renderSpeedQuizGrid() {
    let symbolDisplay = speedQuizObj.mode === '*' ? '×' : speedQuizObj.mode;
    let html = '<thead><tr><th class="corner-cell">' + symbolDisplay + '</th>';

    for (let c = 0; c < 10; c++) {
        html += '<th>' + speedQuizObj.colHeaders[c] + '</th>';
    }
    html += '</tr></thead><tbody>';

    for (let r = 0; r < speedQuizObj.rowHeaders.length; r++) {
        html += '<tr><th>' + speedQuizObj.rowHeaders[r] + '</th>';
        for (let c = 0; c < 10; c++) {
            html += '<td><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" class="speed-quiz-input" data-row="' + r + '" data-col="' + c + '"></td>';
        }
        html += '</tr>';
    }
    html += '</tbody>';

    $('#speedQuizGrid').html(html);
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
    $('#speedQuizTimer').text(formatSpeedQuizTime(elapsed));
}

function getSpeedQuizStorageKey() {
    return 'speedQuizBestTime_' + speedQuizObj.mode + '_' + speedQuizObj.size;
}

function loadSpeedQuizBestTime() {
    let stored = localStorage.getItem(getSpeedQuizStorageKey());
    $('#speedQuizBestTime').text(stored ? formatSpeedQuizTime(+stored) : '--:--');
}

function saveSpeedQuizBestTime(elapsedMs) {
    let key = getSpeedQuizStorageKey();
    let stored = localStorage.getItem(key);
    let isNewRecord = !stored || elapsedMs < +stored;
    if (isNewRecord) {
        localStorage.setItem(key, String(elapsedMs));
        loadSpeedQuizBestTime();
    }
    return isNewRecord;
}

function showSpeedQuizFeedback(correctCount, elapsedMs, isNewRecord) {
    let $feedback = $('#feedbackSpeedQuiz');
    let isPerfect = correctCount === speedQuizObj.size;

    $feedback.removeClass('show is-correct is-incorrect');
    void $feedback[0].offsetWidth;

    let message = isPerfect
        ? '<i class="bi bi-check-circle-fill"></i> ถูกทั้งหมด ' + speedQuizObj.size + ' ข้อ! เวลา ' + formatSpeedQuizTime(elapsedMs) + (isNewRecord ? ' (สถิติใหม่!)' : '')
        : '<i class="bi bi-x-circle-fill"></i> ถูก ' + correctCount + ' จาก ' + speedQuizObj.size + ' ข้อ ลองใหม่อีกครั้งนะ';

    $feedback
        .addClass(isPerfect ? 'is-correct' : 'is-incorrect')
        .html(message)
        .addClass('show');
}

function finishSpeedQuiz() {
    speedQuizObj.running = false;
    clearInterval(speedQuizObj.timerInterval);
    updateSpeedQuizTimerDisplay();

    let elapsed = Date.now() - speedQuizObj.startTime;
    let correctCount = 0;

    $('.speed-quiz-input').each(function () {
        let row = +$(this).data('row');
        let col = +$(this).data('col');
        let rowVal = speedQuizObj.rowHeaders[row];
        let colVal = speedQuizObj.colHeaders[col];
        let expected;

        if (speedQuizObj.mode === '+') {
            expected = rowVal + colVal;
        } else if (speedQuizObj.mode === '-') {
            expected = rowVal - colVal;
        } else {
            expected = rowVal * colVal;
        }

        let answer = +$(this).val();
        let $cell = $(this).closest('td');

        if (answer === expected) {
            $cell.removeClass('incorrect').addClass('correct');
            correctCount++;
        } else {
            $cell.removeClass('correct').addClass('incorrect');
        }
    });

    let isNewRecord = correctCount === speedQuizObj.size && saveSpeedQuizBestTime(elapsed);
    showSpeedQuizFeedback(correctCount, elapsed, isNewRecord);
}

function startSpeedQuiz() {
    if (speedQuizObj.running && !confirm(SPEED_QUIZ_LEAVE_WARNING)) {
        return;
    }

    clearInterval(speedQuizObj.timerInterval);

    generateSpeedQuizHeaders();
    renderSpeedQuizGrid();

    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');
    $('#speedQuizTimer').text('00:00');

    speedQuizObj.running = true;
    speedQuizObj.startTime = Date.now();
    speedQuizObj.timerInterval = setInterval(updateSpeedQuizTimerDisplay, 250);

    $('.speed-quiz-input[data-row="0"][data-col="0"]').trigger('focus');
}

function resetSpeedQuizForNewSelection() {
    clearInterval(speedQuizObj.timerInterval);
    speedQuizObj.running = false;
    $('#speedQuizTimer').text('00:00');
    $('#speedQuizGrid').empty();
    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');

    loadSpeedQuizBestTime();
}

$('#speedQuizModePicker').on('click', '.mode-btn', function () {
    if (speedQuizObj.running && !confirm(SPEED_QUIZ_LEAVE_WARNING)) {
        return;
    }

    $('#speedQuizModePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    speedQuizObj.mode = $(this).data('mode');

    resetSpeedQuizForNewSelection();
});

$('#speedQuizSizePicker').on('click', '.mode-btn', function () {
    if (speedQuizObj.running && !confirm(SPEED_QUIZ_LEAVE_WARNING)) {
        return;
    }

    $('#speedQuizSizePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    speedQuizObj.size = +$(this).data('size');

    resetSpeedQuizForNewSelection();
});

function advanceSpeedQuizFocus(row, col) {
    let nextCol = col + 1;
    let nextRow = row;

    if (nextCol > 9) {
        nextCol = 0;
        nextRow = row + 1;
    }

    if (nextRow <= speedQuizObj.rowHeaders.length - 1) {
        $('.speed-quiz-input[data-row="' + nextRow + '"][data-col="' + nextCol + '"]').trigger('focus');
    }
}

$(document).on('input', '.speed-quiz-input', function () {
    if (!speedQuizObj.running) {
        return;
    }

    // iPad's numeric keypad has no Enter key, so auto-advance once a
    // 2-digit answer is complete (every possible answer is at most 2 digits).
    if ($(this).val().length >= 2) {
        advanceSpeedQuizFocus(+$(this).data('row'), +$(this).data('col'));
    }

    let allFilled = true;
    $('.speed-quiz-input').each(function () {
        if ($(this).val() === '') {
            allFilled = false;
        }
    });

    if (allFilled) {
        finishSpeedQuiz();
    }
});

$(document).on('keydown', '.speed-quiz-input', function (e) {
    if (e.key !== 'Enter') {
        return;
    }
    e.preventDefault();
    advanceSpeedQuizFocus(+$(this).data('row'), +$(this).data('col'));
});

$(document).on('focus', '.speed-quiz-input', function () {
    $(this).trigger('select');
});

// switching to another lesson tab while a round is in progress
$(document).on('show.bs.tab', '[data-bs-toggle="list"]', function (e) {
    let leavingSpeedQuiz = e.relatedTarget && e.relatedTarget.id === 'menu_speedquiz';
    if (leavingSpeedQuiz && speedQuizObj.running && !confirm(SPEED_QUIZ_LEAVE_WARNING)) {
        e.preventDefault();
    }
});

// closing the tab / refreshing / navigating away entirely
window.addEventListener('beforeunload', function (e) {
    if (speedQuizObj.running) {
        e.preventDefault();
        e.returnValue = '';
    }
});

loadSpeedQuizBestTime();
