var p1MissingObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "add",
    text: '',
    expected: 0,
}

var p1MissingBuilders = {
    add: function () {
        let a = randomInt(1, 90), b = randomInt(1, 100 - a);
        return pickOne([
            { text: `□ + ${b} = ${a + b}`, expected: a },
            { text: `${a} + □ = ${a + b}`, expected: b },
            { text: `${a} + ${b} = □`, expected: a + b },
        ]);
    },
    sub: function () {
        let a = randomInt(10, 100), b = randomInt(1, a);
        return pickOne([
            { text: `□ − ${b} = ${a - b}`, expected: a },
            { text: `${a} − □ = ${a - b}`, expected: b },
            { text: `${a} − ${b} = □`, expected: a - b },
        ]);
    },
};

function validateP1MissingResult() {
    if (focusFirstEmptyField(['p1MissingAnswerNumber'])) {
        return;
    }

    let answer = +$('#p1MissingAnswerNumber').val();
    let isCorrect = answer === p1MissingObj.expected;
    let expr = `${p1MissingObj.text} (□ = ${answer})`;

    showFeedback('feedbackP1Missing', isCorrect);

    if (isCorrect) {
        addResultP1MissingToItemList({ expr })
        $('#contentP1MissingResult').show();
        addSuggestP1MissingValue();
    }

    $('#contentP1MissingHistory').show();
    addResultP1MissingToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP1MissingToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1MissingObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP1MissingList').append(elementItem)

    p1MissingObj.numRows++;
}

function addResultP1MissingToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1MissingObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP1MissingList').append(elementItem)

    recordHistoryAttempt('p1missing', isCorrect, 'historyP1MissingList');

    if (isCorrect) {
        p1MissingObj.numRowsHistory++;
    }
}

function addSuggestP1MissingValue() {
    let question = p1MissingBuilders[p1MissingObj.mode]();

    p1MissingObj.text = question.text;
    p1MissingObj.expected = question.expected;

    $('#p1MissingQuestion').text(question.text);
    $('#p1MissingAnswerNumber').val('');
}

bindModePicker('p1MissingModePicker', p1MissingObj, addSuggestP1MissingValue);

addSuggestP1MissingValue();
