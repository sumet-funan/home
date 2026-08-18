var p1CapacityObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstValue: 0,
    secondValue: 0,
    selectedSymbol: null,
}

$(document).on('click', '#capacitySymbolPicker .symbol-btn', function () {
    $('#capacitySymbolPicker .symbol-btn').removeClass('selected');
    $(this).addClass('selected');
    p1CapacityObj.selectedSymbol = $(this).data('symbol');
});

function validateCapacityResult() {
    if (!p1CapacityObj.selectedSymbol) {
        flagFieldRequired('capacitySymbolPicker');
        return;
    }

    let firstValue = p1CapacityObj.firstValue;
    let secondValue = p1CapacityObj.secondValue;
    let actual = firstValue > secondValue ? 'gt' : (firstValue < secondValue ? 'lt' : 'eq');
    let symbolText = { gt: '>', lt: '<', eq: '=' }[actual];
    let isCorrect = p1CapacityObj.selectedSymbol === actual;
    let textColor = "green";

    showFeedback('feedbackCapacity', isCorrect);

    if (isCorrect) {
        addResultCapacityToItemList({ firstValue, secondValue, symbol: symbolText })
        $('#contentCapacityResult').show();
    }
    else {
        textColor = "red";
    }

    $('#contentCapacityHistory').show();
    addResultCapacityToHistoryList({ firstValue, secondValue, symbol: symbolText, color: textColor })

    if (isCorrect) {
        addSuggestCapacityValue();
    }
}

function addResultCapacityToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1CapacityObj.numRows}</span>
            <span class="answer-expr">${item.firstValue} ลิตร ${item.symbol} ${item.secondValue} ลิตร</span>
        </div>`
    $('#resultCapacityList').append(elementItem)

    p1CapacityObj.numRows++;
}

function addResultCapacityToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1CapacityObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstValue} ลิตร ${item.symbol} ${item.secondValue} ลิตร</span>
        </div>`
    $('#historyCapacityList').append(elementItem)

    if (isCorrect) {
        p1CapacityObj.numRowsHistory++;
    }
}

function addSuggestCapacityValue() {
    let firstValue = parseInt(Math.random() * 20) + 1;
    let secondValue = Math.random() < 0.2 ? firstValue : parseInt(Math.random() * 20) + 1;

    p1CapacityObj.firstValue = firstValue;
    p1CapacityObj.secondValue = secondValue;
    p1CapacityObj.selectedSymbol = null;

    $('#capacitySymbolPicker .symbol-btn').removeClass('selected');
    $('#firstCapacityNumber').text(firstValue + ' ลิตร');
    $('#secondCapacityNumber').text(secondValue + ' ลิตร');
}

addSuggestCapacityValue();
