var p1LengthObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "cm",
    firstValue: 0,
    secondValue: 0,
    selectedSymbol: null,
}

var p1LengthUnits = {
    cm: { label: 'ซม.', largest: 100 },
    m: { label: 'ม.', largest: 20 },
};

bindSymbolPicker('lengthSymbolPicker', p1LengthObj);

function validateLengthResult() {
    if (!p1LengthObj.selectedSymbol) {
        flagFieldRequired('lengthSymbolPicker');
        return;
    }

    let unit = p1LengthUnits[p1LengthObj.mode].label;
    let isCorrect = p1LengthObj.selectedSymbol === compareSymbolOf(p1LengthObj.firstValue, p1LengthObj.secondValue);
    let expr = `${p1LengthObj.firstValue} ${unit} ${compareSymbolText[p1LengthObj.selectedSymbol]} ${p1LengthObj.secondValue} ${unit}`;

    showFeedback('feedbackLength', isCorrect);

    if (isCorrect) {
        addResultLengthToItemList({ expr })
        $('#contentLengthResult').show();
        addSuggestLengthValue();
    }

    $('#contentLengthHistory').show();
    addResultLengthToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultLengthToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1LengthObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultLengthList').append(elementItem)

    p1LengthObj.numRows++;
}

function addResultLengthToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1LengthObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyLengthList').append(elementItem)

    recordHistoryAttempt('p1length', isCorrect, 'historyLengthList');

    if (isCorrect) {
        p1LengthObj.numRowsHistory++;
    }
}

function addSuggestLengthValue() {
    let unit = p1LengthUnits[p1LengthObj.mode];
    let firstValue = randomInt(1, unit.largest);
    let secondValue = Math.random() < 0.2 ? firstValue : randomInt(1, unit.largest);

    p1LengthObj.firstValue = firstValue;
    p1LengthObj.secondValue = secondValue;
    p1LengthObj.selectedSymbol = null;

    $('#lengthSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstLengthNumber').text(`${firstValue} ${unit.label}`);
    $('#secondLengthNumber').text(`${secondValue} ${unit.label}`);
}

bindModePicker('lengthModePicker', p1LengthObj, addSuggestLengthValue);

addSuggestLengthValue();
