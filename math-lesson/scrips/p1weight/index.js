var p1WeightObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstValue: 0,
    secondValue: 0,
    selectedSymbol: null,
}

$(document).on('click', '#weightSymbolPicker .symbol-btn', function () {
    $('#weightSymbolPicker .symbol-btn').removeClass('selected');
    $(this).addClass('selected');
    p1WeightObj.selectedSymbol = $(this).data('symbol');
});

function validateWeightResult() {
    if (!p1WeightObj.selectedSymbol) {
        flagFieldRequired('weightSymbolPicker');
        return;
    }

    let firstValue = p1WeightObj.firstValue;
    let secondValue = p1WeightObj.secondValue;
    let actual = firstValue > secondValue ? 'gt' : (firstValue < secondValue ? 'lt' : 'eq');
    let symbolText = { gt: '>', lt: '<', eq: '=' }[actual];
    let isCorrect = p1WeightObj.selectedSymbol === actual;
    let textColor = "green";

    showFeedback('feedbackWeight', isCorrect);

    if (isCorrect) {
        addResultWeightToItemList({ firstValue, secondValue, symbol: symbolText })
        $('#contentWeightResult').show();
    }
    else {
        textColor = "red";
    }

    $('#contentWeightHistory').show();
    addResultWeightToHistoryList({ firstValue, secondValue, symbol: symbolText, color: textColor })

    if (isCorrect) {
        addSuggestWeightValue();
    }
}

function addResultWeightToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1WeightObj.numRows}</span>
            <span class="answer-expr">${item.firstValue} กก. ${item.symbol} ${item.secondValue} กก.</span>
        </div>`
    $('#resultWeightList').append(elementItem)

    p1WeightObj.numRows++;
}

function addResultWeightToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</i>
            <span class="answer-index">${p1WeightObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstValue} กก. ${item.symbol} ${item.secondValue} กก.</span>
        </div>`
    $('#historyWeightList').append(elementItem)

    if (isCorrect) {
        p1WeightObj.numRowsHistory++;
    }
}

function addSuggestWeightValue() {
    let firstValue = parseInt(Math.random() * 20) + 1;
    let secondValue = Math.random() < 0.2 ? firstValue : parseInt(Math.random() * 20) + 1;

    p1WeightObj.firstValue = firstValue;
    p1WeightObj.secondValue = secondValue;
    p1WeightObj.selectedSymbol = null;

    $('#weightSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstWeightNumber').text(firstValue + ' กก.');
    $('#secondWeightNumber').text(secondValue + ' กก.');
}

addSuggestWeightValue();
