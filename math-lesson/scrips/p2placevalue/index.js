var p2PlaceValueObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "place",
    currentNumber: 0,
    shown: '',
}

var p2ThaiDigits = '๐๑๒๓๔๕๖๗๘๙';
var p2DigitWords = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];

function p2ToThaiDigits(number) {
    return String(number).replace(/\d/g, function (digit) {
        return p2ThaiDigits[digit];
    });
}

function p2NumberToWords(number) {
    if (number === 0) {
        return p2DigitWords[0];
    }
    if (number === 1000) {
        return 'หนึ่งพัน';
    }

    let hundreds = Math.floor(number / 100);
    let tens = Math.floor(number / 10) % 10;
    let units = number % 10;
    let words = hundreds ? p2DigitWords[hundreds] + 'ร้อย' : '';

    if (tens === 1) {
        words += 'สิบ';
    } else if (tens === 2) {
        words += 'ยี่สิบ';
    } else if (tens) {
        words += p2DigitWords[tens] + 'สิบ';
    }

    if (units === 1 && number > 1) {
        words += 'เอ็ด';
    } else if (units) {
        words += p2DigitWords[units];
    }

    return words;
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
    let number = mode === 'place' ? p2RandomInt(100, 999) : p2RandomInt(0, 1000);
    let shown = number;

    if (mode === 'thai') {
        shown = p2ToThaiDigits(number);
    } else if (mode === 'word') {
        shown = p2NumberToWords(number);
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
