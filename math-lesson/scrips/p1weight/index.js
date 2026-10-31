var p1WeightObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "kg",
    firstValue: 0,
    secondValue: 0,
    selectedSymbol: null,
}

var p1WeightUnits = {
    kg: { label: 'กก.', largest: 20 },
    hg: { label: 'ขีด', largest: 10 },
};

bindSymbolPicker('weightSymbolPicker', p1WeightObj);

function validateWeightResult() {
    if (!p1WeightObj.selectedSymbol) {
        flagFieldRequired('weightSymbolPicker');
        return;
    }

    let unit = p1WeightUnits[p1WeightObj.mode].label;
    let isCorrect = p1WeightObj.selectedSymbol === compareSymbolOf(p1WeightObj.firstValue, p1WeightObj.secondValue);
    let expr = `${p1WeightObj.firstValue} ${unit} ${compareSymbolText[p1WeightObj.selectedSymbol]} ${p1WeightObj.secondValue} ${unit}`;

    showFeedback('feedbackWeight', isCorrect);

    if (isCorrect) {
        addResultWeightToItemList({ expr })
        $('#contentWeightResult').show();
        addSuggestWeightValue();
    }

    $('#contentWeightHistory').show();
    addResultWeightToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultWeightToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1WeightObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultWeightList').append(elementItem)

    p1WeightObj.numRows++;
}

function addResultWeightToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1WeightObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyWeightList').append(elementItem)

    recordHistoryAttempt('p1weight', isCorrect, 'historyWeightList');

    if (isCorrect) {
        p1WeightObj.numRowsHistory++;
    }
}

function addSuggestWeightValue() {
    let unit = p1WeightUnits[p1WeightObj.mode];
    let firstValue = randomInt(1, unit.largest);
    let secondValue = Math.random() < 0.2 ? firstValue : randomInt(1, unit.largest);

    p1WeightObj.firstValue = firstValue;
    p1WeightObj.secondValue = secondValue;
    p1WeightObj.selectedSymbol = null;

    $('#weightSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstWeightNumber').text(`${firstValue} ${unit.label}`);
    $('#secondWeightNumber').text(`${secondValue} ${unit.label}`);
}

bindModePicker('weightModePicker', p1WeightObj, addSuggestWeightValue);

addSuggestWeightValue();
