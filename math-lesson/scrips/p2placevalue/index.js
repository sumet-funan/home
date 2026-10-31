var p2PlaceValueObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "place",
    currentNumber: 0,
    shown: '',
}

function validateP2PlaceValueResult() {
    let number = p2PlaceValueObj.currentNumber;
    let isCorrect, expr;

    if (p2PlaceValueObj.mode === 'place') {
        if (focusFirstEmptyField(['p2PlaceHundredsNumber', 'p2PlaceTensNumber', 'p2PlaceUnitsNumber'])) {
            return;
        }

        let hundreds = +$('#p2PlaceHundredsNumber').val();
        let tens = +$('#p2PlaceTensNumber').val();
        let units = +$('#p2PlaceUnitsNumber').val();

        isCorrect = hundreds === Math.floor(number / 100)
            && tens === Math.floor(number / 10) % 10
            && units === number % 10;
        expr = `${number} = ${hundreds} ร้อย ${tens} สิบ ${units} หน่วย`;
    } else {
        if (focusFirstEmptyField(['p2PlaceAnswerNumber'])) {
            return;
        }

        let answer = +$('#p2PlaceAnswerNumber').val();

        isCorrect = answer === number;
        expr = `${p2PlaceValueObj.shown} = ${answer}`;
    }

    showFeedback('feedbackP2PlaceValue', isCorrect);

    if (isCorrect) {
        addResultP2PlaceValueToItemList({ expr })
        $('#contentP2PlaceValueResult').show();
        addSuggestP2PlaceValueValue();
        $('#p2PlaceHundredsNumber, #p2PlaceAnswerNumber').filter(':visible').first().trigger('focus');
    }

    $('#contentP2PlaceValueHistory').show();
    addResultP2PlaceValueToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2PlaceValueToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2PlaceValueObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2PlaceValueList').append(elementItem)

    p2PlaceValueObj.numRows++;
}

function addResultP2PlaceValueToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2PlaceValueObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2PlaceValueList').append(elementItem)

    recordHistoryAttempt('p2placevalue', isCorrect, 'historyP2PlaceValueList');

    if (isCorrect) {
        p2PlaceValueObj.numRowsHistory++;
    }
}

function addSuggestP2PlaceValueValue() {
    let mode = p2PlaceValueObj.mode;
    let number = mode === 'place' ? randomInt(100, 999) : randomInt(0, 1000);
    let shown = number;

    if (mode === 'thai') {
        shown = toThaiDigits(number);
    } else if (mode === 'word') {
        shown = numberToThaiWords(number);
    }

    p2PlaceValueObj.currentNumber = number;
    p2PlaceValueObj.shown = shown;

    $('#p2PlaceValueNumber').text(shown).toggleClass('is-words', mode === 'word');
    $('#p2PlaceFields').toggle(mode === 'place');
    $('#p2PlaceAnswerNumber').toggle(mode !== 'place');
    $('#p2PlaceHundredsNumber, #p2PlaceTensNumber, #p2PlaceUnitsNumber, #p2PlaceAnswerNumber').val('');
}

bindModePicker('p2PlaceValueModePicker', p2PlaceValueObj, addSuggestP2PlaceValueValue);

addSuggestP2PlaceValueValue();
