var p1NumberObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "count",
    expected: 0,
    shown: '',
}

function renderNumberBlocks(number) {
    let tens = Math.floor(number / 10);
    let units = number % 10;
    return `<div class="learn-blocks">
        <div class="learn-tens">${'<span></span>'.repeat(tens)}</div>
        <div class="learn-units">${'<span class="learn-dot is-filled"></span>'.repeat(units)}</div>
    </div>`;
}

function validateP1NumberResult() {
    if (focusFirstEmptyField(['p1NumberAnswerNumber'])) {
        return;
    }

    let answer = +$('#p1NumberAnswerNumber').val();
    let isCorrect = answer === p1NumberObj.expected;
    let expr = `${p1NumberObj.shown} = ${answer}`;

    showFeedback('feedbackP1Number', isCorrect);

    if (isCorrect) {
        addResultP1NumberToItemList({ expr })
        $('#contentP1NumberResult').show();
        addSuggestP1NumberValue();
    }

    $('#contentP1NumberHistory').show();
    addResultP1NumberToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP1NumberToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1NumberObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP1NumberList').append(elementItem)

    p1NumberObj.numRows++;
}

function addResultP1NumberToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1NumberObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP1NumberList').append(elementItem)

    recordHistoryAttempt('p1number', isCorrect, 'historyP1NumberList');

    if (isCorrect) {
        p1NumberObj.numRowsHistory++;
    }
}

function addSuggestP1NumberValue() {
    let mode = p1NumberObj.mode;
    let number = mode === 'count' ? randomInt(1, 99) : randomInt(0, 100);

    p1NumberObj.expected = number;
    p1NumberObj.shown = mode === 'count' ? 'นับได้' : (mode === 'thai' ? toThaiDigits(number) : numberToThaiWords(number));

    $('#p1NumberBlocks').html(mode === 'count' ? renderNumberBlocks(number) : '').toggle(mode === 'count');
    $('#p1NumberShown').text(p1NumberObj.shown).toggle(mode !== 'count').toggleClass('is-words', mode === 'word');
    $('#p1NumberAnswerNumber').val('');
}

bindModePicker('p1NumberModePicker', p1NumberObj, addSuggestP1NumberValue);

addSuggestP1NumberValue();
