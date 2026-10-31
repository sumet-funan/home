var p2TimeObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "clock",
    hour: 3,
    minute: 0,
    text: '',
    expected: 0,
    unit: '',
}

function renderP2ClockSVG(hour, minute) {
    let marks = '';

    for (let i = 1; i <= 12; i++) {
        let rad = i * 30 * Math.PI / 180;
        let x1 = 100 + 86 * Math.sin(rad);
        let y1 = 100 - 86 * Math.cos(rad);
        let x2 = 100 + 78 * Math.sin(rad);
        let y2 = 100 - 78 * Math.cos(rad);
        let x3 = 100 + 63 * Math.sin(rad);
        let y3 = 100 - 63 * Math.cos(rad);
        marks += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" class="clock-tick"/>';
        marks += '<text x="' + x3.toFixed(1) + '" y="' + y3.toFixed(1) + '" class="clock-numeral">' + i + '</text>';
    }

    return '<svg viewBox="0 0 200 200" width="200" height="200" role="img" aria-label="นาฬิกา">' +
        '<circle cx="100" cy="100" r="92" class="clock-face"/>' +
        marks +
        '<line x1="100" y1="100" x2="100" y2="58" class="clock-hand" transform="rotate(' + ((hour % 12) * 30 + minute / 2) + ' 100 100)"/>' +
        '<line x1="100" y1="100" x2="100" y2="28" class="clock-hand-minute" transform="rotate(' + (minute * 6) + ' 100 100)"/>' +
        '<circle cx="100" cy="100" r="7" class="clock-center"/>' +
        '</svg>';
}

function validateP2TimeResult() {
    let isCorrect, expr;

    if (p2TimeObj.mode === 'clock') {
        if (focusFirstEmptyField(['p2TimeHourNumber', 'p2TimeMinuteNumber'])) {
            return;
        }

        let hour = +$('#p2TimeHourNumber').val();
        let minute = +$('#p2TimeMinuteNumber').val();

        isCorrect = hour === p2TimeObj.hour && minute === p2TimeObj.minute;
        expr = `${hour} นาฬิกา ${minute} นาที`;
    } else {
        if (focusFirstEmptyField(['p2TimeWordAnswerNumber'])) {
            return;
        }

        let answer = +$('#p2TimeWordAnswerNumber').val();

        isCorrect = answer === p2TimeObj.expected;
        expr = `${p2TimeObj.text} = ${answer} ${p2TimeObj.unit}`;
    }

    showFeedback('feedbackP2Time', isCorrect);

    if (isCorrect) {
        addResultP2TimeToItemList({ expr })
        $('#contentP2TimeResult').show();
        addSuggestP2TimeValue();
        $('#p2TimeHourNumber, #p2TimeWordAnswerNumber').filter(':visible').first().trigger('focus');
    }

    $('#contentP2TimeHistory').show();
    addResultP2TimeToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2TimeToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2TimeObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2TimeList').append(elementItem)

    p2TimeObj.numRows++;
}

function addResultP2TimeToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2TimeObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2TimeList').append(elementItem)

    recordHistoryAttempt('p2time', isCorrect, 'historyP2TimeList');

    if (isCorrect) {
        p2TimeObj.numRowsHistory++;
    }
}

// Every question stays in one unit: hours, minutes or days, never a mix.
function suggestP2TimeWord() {
    let name = p2Pick(p2WordNames);
    let start = p2RandomInt(7, 11);
    let hours = p2RandomInt(1, 4);
    let longer = p2RandomInt(4, 11) * 5;
    let shorter = p2RandomInt(1, 3) * 5;
    let holiday = p2RandomInt(10, 30);
    let daysGone = p2RandomInt(2, holiday - 1);
    let questions = [
        { text: `${name}เริ่มอ่านหนังสือเวลา ${start} นาฬิกา และอ่านจบเวลา ${start + hours} นาฬิกา ${name}อ่านหนังสือนานกี่ชั่วโมง`, expected: hours, unit: 'ชั่วโมง' },
        { text: `${name}ทำการบ้าน ${longer} นาที แล้วอ่านหนังสือต่ออีก ${shorter} นาที ${name}ใช้เวลาทั้งหมดกี่นาที`, expected: longer + shorter, unit: 'นาที' },
        { text: `เดินไปโรงเรียนใช้เวลา ${longer} นาที ขี่จักรยานใช้เวลา ${shorter} นาที เดินใช้เวลานานกว่ากี่นาที`, expected: longer - shorter, unit: 'นาที' },
        { text: `ปิดเทอม ${holiday} วัน ผ่านไปแล้ว ${daysGone} วัน เหลืออีกกี่วัน`, expected: holiday - daysGone, unit: 'วัน' },
    ];
    let question = p2Pick(questions);

    p2TimeObj.text = question.text;
    p2TimeObj.expected = question.expected;
    p2TimeObj.unit = question.unit;

    $('#p2TimeWordText').text(question.text);
    $('#p2TimeWordAnswerNumber').val('');
}

function suggestP2TimeClock() {
    p2TimeObj.hour = p2RandomInt(1, 12);
    p2TimeObj.minute = p2RandomInt(0, 11) * 5;

    $('#p2ClockDisplay').html(renderP2ClockSVG(p2TimeObj.hour, p2TimeObj.minute));
    $('#p2TimeHourNumber').val('');
    $('#p2TimeMinuteNumber').val('');
}

function addSuggestP2TimeValue() {
    let isClock = p2TimeObj.mode === 'clock';

    $('#p2TimeClockArea').toggle(isClock);
    $('#p2TimeWordArea').toggle(!isClock);

    if (isClock) {
        suggestP2TimeClock();
    } else {
        suggestP2TimeWord();
    }
}

bindModePicker('p2TimeModePicker', p2TimeObj, addSuggestP2TimeValue);

addSuggestP2TimeValue();
