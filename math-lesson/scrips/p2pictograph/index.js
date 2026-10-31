var p2PictographObj = {
    numRows: 1,
    numRowsHistory: 1,
    text: '',
    expected: 0,
}

function validateP2PictographResult() {
    if (focusFirstEmptyField(['p2PictographAnswerNumber'])) {
        return;
    }

    let answer = +$('#p2PictographAnswerNumber').val();
    let isCorrect = answer === p2PictographObj.expected;
    let expr = `${p2PictographObj.text} = ${answer}`;

    showFeedback('feedbackP2Pictograph', isCorrect);

    if (isCorrect) {
        addResultP2PictographToItemList({ expr })
        $('#contentP2PictographResult').show();
        addSuggestP2PictographValue();
    }

    $('#contentP2PictographHistory').show();
    addResultP2PictographToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2PictographToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2PictographObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2PictographList').append(elementItem)

    p2PictographObj.numRows++;
}

function addResultP2PictographToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2PictographObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2PictographList').append(elementItem)

    recordHistoryAttempt('p2pictograph', isCorrect, 'historyP2PictographList');

    if (isCorrect) {
        p2PictographObj.numRowsHistory++;
    }
}

function addSuggestP2PictographValue() {
    let question = buildPictographQuestion(pickOne([2, 5, 10]));

    p2PictographObj.text = question.text;
    p2PictographObj.expected = question.expected;

    $('#p2PictographDisplay').html(question.html);
    $('#p2PictographQuestion').text(question.text);
    $('#p2PictographAnswerNumber').val('');
}

addSuggestP2PictographValue();
