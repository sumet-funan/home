var speedQuizObj = {
    mode: "+",
    rowHeaders: [],
    colHeaders: [],
    running: false,
    startTime: 0,
    timerInterval: null,
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

function generateSpeedQuizHeaders() {
    let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    if (speedQuizObj.mode === "-") {
        let bigDigits = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
        speedQuizObj.rowHeaders = shuffleSpeedQuizArray(bigDigits);
        speedQuizObj.colHeaders = shuffleSpeedQuizArray(digits);
    } else {
        speedQuizObj.rowHeaders = shuffleSpeedQuizArray(digits);
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

    for (let r = 0; r < 10; r++) {
        html += '<tr><th>' + speedQuizObj.rowHeaders[r] + '</th>';
        for (let c = 0; c < 10; c++) {
            html += '<td><input type="text" inputmode="numeric" class="speed-quiz-input" data-row="' + r + '" data-col="' + c + '"></td>';
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
    return 'speedQuizBestTime_' + speedQuizObj.mode;
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
    let isPerfect = correctCount === 100;

    $feedback.removeClass('show is-correct is-incorrect');
    void $feedback[0].offsetWidth;

    let message = isPerfect
        ? '<i class="bi bi-check-circle-fill"></i> ถูกทั้งหมด 100 ข้อ! เวลา ' + formatSpeedQuizTime(elapsedMs) + (isNewRecord ? ' (สถิติใหม่!)' : '')
        : '<i class="bi bi-x-circle-fill"></i> ถูก ' + correctCount + ' จาก 100 ข้อ ลองใหม่อีกครั้งนะ';

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

    let isNewRecord = correctCount === 100 && saveSpeedQuizBestTime(elapsed);
    showSpeedQuizFeedback(correctCount, elapsed, isNewRecord);
}

function startSpeedQuiz() {
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

$('#speedQuizModePicker').on('click', '.mode-btn', function () {
    $('#speedQuizModePicker .mode-btn').removeClass('active');
    $(this).addClass('active');
    speedQuizObj.mode = $(this).data('mode');

    clearInterval(speedQuizObj.timerInterval);
    speedQuizObj.running = false;
    $('#speedQuizTimer').text('00:00');
    $('#speedQuizGrid').empty();
    $('#feedbackSpeedQuiz').removeClass('show is-correct is-incorrect').text('');

    loadSpeedQuizBestTime();
});

$(document).on('input', '.speed-quiz-input', function () {
    if (!speedQuizObj.running) {
        return;
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

    let row = +$(this).data('row');
    let col = +$(this).data('col');
    let nextCol = col + 1;
    let nextRow = row;

    if (nextCol > 9) {
        nextCol = 0;
        nextRow = row + 1;
    }

    if (nextRow <= 9) {
        $('.speed-quiz-input[data-row="' + nextRow + '"][data-col="' + nextCol + '"]').trigger('focus');
    }
});

loadSpeedQuizBestTime();
