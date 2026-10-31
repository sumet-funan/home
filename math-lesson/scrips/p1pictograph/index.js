var p1PictographObj = {
    numRows: 1,
    numRowsHistory: 1,
    text: '',
    expected: 0,
}

function validateP1PictographResult() {
    if (focusFirstEmptyField(['p1PictographAnswerNumber'])) {
        return;
    }

    let answer = +$('#p1PictographAnswerNumber').val();
    let isCorrect = answer === p1PictographObj.expected;
    let expr = `${p1PictographObj.text} = ${answer}`;

    showFeedback('feedbackP1Pictograph', isCorrect);

    if (isCorrect) {
        addResultP1PictographToItemList({ expr })
        $('#contentP1PictographResult').show();
        addSuggestP1PictographValue();
    }

    $('#contentP1PictographHistory').show();
    addResultP1PictographToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP1PictographToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1PictographObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP1PictographList').append(elementItem)

    p1PictographObj.numRows++;
}

function addResultP1PictographToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1PictographObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP1PictographList').append(elementItem)

    recordHistoryAttempt('p1pictograph', isCorrect, 'historyP1PictographList');

    if (isCorrect) {
        p1PictographObj.numRowsHistory++;
    }
}

function addSuggestP1PictographValue() {
    let question = buildPictographQuestion(1);

    p1PictographObj.text = question.text;
    p1PictographObj.expected = question.expected;

    $('#p1PictographDisplay').html(question.html);
    $('#p1PictographQuestion').text(question.text);
    $('#p1PictographAnswerNumber').val('');
}

addSuggestP1PictographValue();
