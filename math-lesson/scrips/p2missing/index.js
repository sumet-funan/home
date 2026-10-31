var p2MissingObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "addsub",
    text: '',
    expected: 0,
}

var p2MissingBuilders = {
    addsub: [
        function () {
            let a = p2RandomInt(10, 900), b = p2RandomInt(10, 1000 - a);
            return Math.random() < 0.5
                ? { text: `□ + ${b} = ${a + b}`, expected: a }
                : { text: `${a} + □ = ${a + b}`, expected: b };
        },
        function () {
            let a = p2RandomInt(100, 1000), b = p2RandomInt(10, a);
            return Math.random() < 0.5
                ? { text: `□ − ${b} = ${a - b}`, expected: a }
                : { text: `${a} − □ = ${a - b}`, expected: b };
        },
    ],
    muldiv: [
        function () {
            let a = p2RandomInt(2, 9), b = p2RandomInt(2, 12);
            return Math.random() < 0.5
                ? { text: `□ × ${a} = ${a * b}`, expected: b }
                : { text: `${a} × □ = ${a * b}`, expected: b };
        },
        function () {
            let divisor = p2RandomInt(2, 9), quotient = p2RandomInt(2, 9);
            return Math.random() < 0.5
                ? { text: `□ ÷ ${divisor} = ${quotient}`, expected: divisor * quotient }
                : { text: `${divisor * quotient} ÷ □ = ${quotient}`, expected: divisor };
        },
    ],
};

function validateP2MissingResult() {
    if (focusFirstEmptyField(['p2MissingAnswerNumber'])) {
        return;
    }

    let answer = +$('#p2MissingAnswerNumber').val();
    let isCorrect = answer === p2MissingObj.expected;
    let expr = `${p2MissingObj.text} (□ = ${answer})`;

    showFeedback('feedbackP2Missing', isCorrect);

    if (isCorrect) {
        addResultP2MissingToItemList({ expr })
        $('#contentP2MissingResult').show();
        addSuggestP2MissingValue();
    }

    $('#contentP2MissingHistory').show();
    addResultP2MissingToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2MissingToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2MissingObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2MissingList').append(elementItem)

    p2MissingObj.numRows++;
}

function addResultP2MissingToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2MissingObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2MissingList').append(elementItem)

    recordHistoryAttempt('p2missing', isCorrect, 'historyP2MissingList');

    if (isCorrect) {
        p2MissingObj.numRowsHistory++;
    }
}

function addSuggestP2MissingValue() {
    let question = p2Pick(p2MissingBuilders[p2MissingObj.mode])();

    p2MissingObj.text = question.text;
    p2MissingObj.expected = question.expected;

    $('#p2MissingQuestion').text(question.text);
    $('#p2MissingAnswerNumber').val('');
}

bindModePicker('p2MissingModePicker', p2MissingObj, addSuggestP2MissingValue);

addSuggestP2MissingValue();
