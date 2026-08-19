var p1LengthObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstValue: 0,
    secondValue: 0,
    selectedSymbol: null,
}

$(document).on('click', '#lengthSymbolPicker .symbol-btn', function () {
    $('#lengthSymbolPicker .symbol-btn').removeClass('selected');
    $(this).addClass('selected');
    p1LengthObj.selectedSymbol = $(this).data('symbol');
});

function validateLengthResult() {
    if (!p1LengthObj.selectedSymbol) {
        flagFieldRequired('lengthSymbolPicker');
        return;
    }

    let firstValue = p1LengthObj.firstValue;
    let secondValue = p1LengthObj.secondValue;
    let actual = firstValue > secondValue ? 'gt' : (firstValue < secondValue ? 'lt' : 'eq');
    let symbolText = { gt: '>', lt: '<', eq: '=' }[actual];
    let isCorrect = p1LengthObj.selectedSymbol === actual;
    let textColor = "green";

    showFeedback('feedbackLength', isCorrect);

    if (isCorrect) {
        addResultLengthToItemList({ firstValue, secondValue, symbol: symbolText })
        $('#contentLengthResult').show();
    }
    else {
        textColor = "red";
    }

    $('#contentLengthHistory').show();
    addResultLengthToHistoryList({ firstValue, secondValue, symbol: symbolText, color: textColor })

    if (isCorrect) {
        addSuggestLengthValue();
    }
}

function addResultLengthToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1LengthObj.numRows}</span>
            <span class="answer-expr">${item.firstValue} ซม. ${item.symbol} ${item.secondValue} ซม.</span>
        </div>`
    $('#resultLengthList').append(elementItem)

    p1LengthObj.numRows++;
}

function addResultLengthToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1LengthObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstValue} ซม. ${item.symbol} ${item.secondValue} ซม.</span>
        </div>`
    $('#historyLengthList').append(elementItem)

    recordHistoryAttempt('p1length', isCorrect, 'historyLengthList');

    if (isCorrect) {
        p1LengthObj.numRowsHistory++;
    }
}

function addSuggestLengthValue() {
    let firstValue = parseInt(Math.random() * 96) + 5;
    let secondValue = Math.random() < 0.2 ? firstValue : parseInt(Math.random() * 96) + 5;

    p1LengthObj.firstValue = firstValue;
    p1LengthObj.secondValue = secondValue;
    p1LengthObj.selectedSymbol = null;

    $('#lengthSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstLengthNumber').text(firstValue + ' ซม.');
    $('#secondLengthNumber').text(secondValue + ' ซม.');
}

addSuggestLengthValue();
