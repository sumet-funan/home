var p2MixedObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "addsub",
    text: '',
    expected: 0,
}

// Each builds one question; the value is worked out here rather than parsed back
// out of the text, so that the order of operations lives in one obvious place.
var p2MixedBuilders = {
    addsub: [
        function () {
            let a = randomInt(100, 500), b = randomInt(10, 400), c = randomInt(10, a + b);
            return { text: `${a} + ${b} − ${c}`, expected: a + b - c };
        },
        function () {
            let a = randomInt(100, 900), b = randomInt(10, a), c = randomInt(10, 1000 - a + b);
            return { text: `${a} − ${b} + ${c}`, expected: a - b + c };
        },
        function () {
            let a = randomInt(200, 1000), b = randomInt(10, parseInt(a / 2)), c = randomInt(10, parseInt(a / 2));
            return { text: `${a} − (${b} + ${c})`, expected: a - (b + c) };
        },
        function () {
            let a = randomInt(100, 500), b = randomInt(100, 500), c = randomInt(10, b);
            return { text: `${a} + (${b} − ${c})`, expected: a + (b - c) };
        },
    ],
    all: [
        function () {
            let a = randomInt(2, 9), b = randomInt(2, 12), c = randomInt(10, 200);
            return { text: `${a} × ${b} + ${c}`, expected: a * b + c };
        },
        function () {
            let a = randomInt(2, 9), b = randomInt(2, 12), c = randomInt(10, 200);
            return { text: `${c} + ${a} × ${b}`, expected: c + a * b };
        },
        function () {
            let a = randomInt(2, 9), b = randomInt(2, 12), c = randomInt(1, a * b);
            return { text: `${a} × ${b} − ${c}`, expected: a * b - c };
        },
        function () {
            let a = randomInt(2, 9), b = randomInt(2, 12), c = randomInt(a * b, 300);
            return { text: `${c} − ${a} × ${b}`, expected: c - a * b };
        },
        function () {
            let divisor = randomInt(2, 9), quotient = randomInt(2, 9), c = randomInt(10, 200);
            return { text: `${divisor * quotient} ÷ ${divisor} + ${c}`, expected: quotient + c };
        },
        function () {
            let divisor = randomInt(2, 9), quotient = randomInt(2, 9), c = randomInt(quotient, 100);
            return { text: `${c} − ${divisor * quotient} ÷ ${divisor}`, expected: c - quotient };
        },
        function () {
            let a = randomInt(2, 20), b = randomInt(2, 20), c = randomInt(2, 9);
            return { text: `(${a} + ${b}) × ${c}`, expected: (a + b) * c };
        },
        function () {
            let c = randomInt(2, 9), quotient = randomInt(2, 9), total = c * quotient, a = randomInt(1, total - 1);
            return { text: `(${a} + ${total - a}) ÷ ${c}`, expected: quotient };
        },
    ],
};

function validateP2MixedResult() {
    if (focusFirstEmptyField(['p2MixedAnswerNumber'])) {
        return;
    }

    let answer = +$('#p2MixedAnswerNumber').val();
    let isCorrect = answer === p2MixedObj.expected;
    let expr = `${p2MixedObj.text} = ${answer}`;

    showFeedback('feedbackP2Mixed', isCorrect);

    if (isCorrect) {
        addResultP2MixedToItemList({ expr })
        $('#contentP2MixedResult').show();
        addSuggestP2MixedValue();
    }

    $('#contentP2MixedHistory').show();
    addResultP2MixedToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2MixedToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2MixedObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2MixedList').append(elementItem)

    p2MixedObj.numRows++;
}

function addResultP2MixedToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2MixedObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2MixedList').append(elementItem)

    recordHistoryAttempt('p2mixed', isCorrect, 'historyP2MixedList');

    if (isCorrect) {
        p2MixedObj.numRowsHistory++;
    }
}

function addSuggestP2MixedValue() {
    let question = pickOne(p2MixedBuilders[p2MixedObj.mode])();

    p2MixedObj.text = question.text;
    p2MixedObj.expected = question.expected;

    $('#p2MixedQuestion').text(question.text);
    $('#p2MixedAnswerNumber').val('');
}

bindModePicker('p2MixedModePicker', p2MixedObj, addSuggestP2MixedValue);

addSuggestP2MixedValue();
