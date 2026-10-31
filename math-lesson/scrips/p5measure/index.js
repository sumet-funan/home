var p5MeasureObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "length",
    text: '',
    expected: 0,
    unit: '',
}

// Worked in the smaller unit so that the answer is built from whole numbers.
var measureBuilders = {
    length: [
        function () {
            let metres = randomInt(1, 9), centimetres = randomInt(1, 99);
            return { text: `${metres} เมตร ${centimetres} เซนติเมตร`, expected: (metres * 100 + centimetres) / 100, unit: 'เมตร' };
        },
        function () {
            let kilometres = randomInt(1, 9), metres = randomInt(1, 999);
            return { text: `${kilometres} กิโลเมตร ${metres} เมตร`, expected: (kilometres * 1000 + metres) / 1000, unit: 'กิโลเมตร' };
        },
        function () {
            let centimetres = randomInt(1, 20), millimetres = randomInt(1, 9);
            return { text: `${centimetres} เซนติเมตร ${millimetres} มิลลิเมตร`, expected: (centimetres * 10 + millimetres) / 10, unit: 'เซนติเมตร' };
        },
        function () {
            let centimetres = randomInt(101, 999);
            return { text: `${(centimetres / 100).toFixed(2)} เมตร`, expected: centimetres, unit: 'เซนติเมตร' };
        },
    ],
    weight: [
        function () {
            let kilograms = randomInt(1, 9), grams = randomInt(1, 999);
            return { text: `${kilograms} กิโลกรัม ${grams} กรัม`, expected: (kilograms * 1000 + grams) / 1000, unit: 'กิโลกรัม' };
        },
        function () {
            let tons = randomInt(1, 9), kilograms = randomInt(1, 999);
            return { text: `${tons} ตัน ${kilograms} กิโลกรัม`, expected: (tons * 1000 + kilograms) / 1000, unit: 'ตัน' };
        },
        function () {
            let grams = randomInt(1001, 9999);
            return { text: `${(grams / 1000).toFixed(3)} กิโลกรัม`, expected: grams, unit: 'กรัม' };
        },
    ],
    word: [
        function () {
            let first = randomInt(101, 500), second = randomInt(11, 95);
            return { text: `เชือกเส้นแรกยาว ${(first / 100).toFixed(2)} เมตร เส้นที่สองยาว ${second} เซนติเมตร รวมกันยาว`, expected: (first + second) / 100, unit: 'เมตร' };
        },
        function () {
            let first = randomInt(201, 900), second = randomInt(11, 150);
            return { text: `ผ้ายาว ${(first / 100).toFixed(2)} เมตร ตัดออก ${second} เซนติเมตร เหลือผ้ายาว`, expected: (first - second) / 100, unit: 'เมตร' };
        },
        function () {
            let first = randomInt(1100, 5000), second = randomInt(50, 950);
            return { text: `ข้าวสารหนัก ${(first / 1000).toFixed(3)} กิโลกรัม น้ำตาลหนัก ${second} กรัม รวมกันหนัก`, expected: (first + second) / 1000, unit: 'กิโลกรัม' };
        },
    ],
};

function validateMeasureResult() {
    if (focusFirstEmptyField(['measureAnswerNumber'])) {
        return;
    }

    let answer = +$('#measureAnswerNumber').val();
    let isCorrect = isSameNumber(answer, p5MeasureObj.expected);
    let expr = `${p5MeasureObj.text} = ${answer} ${p5MeasureObj.unit}`;

    showFeedback('feedbackMeasure', isCorrect);

    if (isCorrect) {
        addResultMeasureToItemList({ expr })
        $('#contentMeasureResult').show();
        addSuggestMeasureValue();
    }

    $('#contentMeasureHistory').show();
    addResultMeasureToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultMeasureToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5MeasureObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultMeasureList').append(elementItem)

    p5MeasureObj.numRows++;
}

function addResultMeasureToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5MeasureObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyMeasureList').append(elementItem)

    recordHistoryAttempt('p5measure', isCorrect, 'historyMeasureList');

    if (isCorrect) {
        p5MeasureObj.numRowsHistory++;
    }
}

function addSuggestMeasureValue() {
    let question = pickOne(measureBuilders[p5MeasureObj.mode])();

    p5MeasureObj.text = question.text;
    p5MeasureObj.expected = question.expected;
    p5MeasureObj.unit = question.unit;

    $('#measureQuestion').text(`${question.text}${p5MeasureObj.mode === 'word' ? '' : ' เป็น'}กี่${question.unit}`);
    $('#measureAnswerNumber').val('');
}

bindModePicker('measureModePicker', p5MeasureObj, addSuggestMeasureValue);

addSuggestMeasureValue();
