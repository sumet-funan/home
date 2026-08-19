var p1PlaceValueObj = {
    numRows: 1,
    numRowsHistory: 1,
    currentNumber: 0,
}

function validatePlaceValueResult() {
    if (focusFirstEmptyField(['placeValueTensNumber', 'placeValueUnitsNumber'])) {
        return;
    }

    let tens = +$('#placeValueTensNumber').val();
    let units = +$('#placeValueUnitsNumber').val();
    let expectedTens = Math.floor(p1PlaceValueObj.currentNumber / 10);
    let expectedUnits = p1PlaceValueObj.currentNumber % 10;
    let isCorrect = tens === expectedTens && units === expectedUnits;
    let textColor = "green";

    showFeedback('feedbackPlaceValue', isCorrect);

    if (!isCorrect) {
        textColor = "red";
    }

    let expr = `${p1PlaceValueObj.currentNumber} = หลักสิบ ${tens} หลักหน่วย ${units}`;

    if (isCorrect) {
        addResultPlaceValueToItemList({ expr })
        $('#contentPlaceValueResult').show();
        addSuggestPlaceValueValue();
    }

    $('#contentPlaceValueHistory').show();
    addResultPlaceValueToHistoryList({ expr, color: textColor })
}

function addResultPlaceValueToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1PlaceValueObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultPlaceValueList').append(elementItem)

    p1PlaceValueObj.numRows++;
}

function addResultPlaceValueToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1PlaceValueObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyPlaceValueList').append(elementItem)

    recordHistoryAttempt('p1placevalue', isCorrect, 'historyPlaceValueList');

    if (isCorrect) {
        p1PlaceValueObj.numRowsHistory++;
    }
}

function addSuggestPlaceValueValue() {
    let number = parseInt(Math.random() * 90) + 10;

    p1PlaceValueObj.currentNumber = number;
    $('#placeValueNumber').text(number);
    $('#placeValueTensNumber').val('');
    $('#placeValueUnitsNumber').val('');
}

addSuggestPlaceValueValue();
