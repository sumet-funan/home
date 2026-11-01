var p2LengthObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "compare",
    firstValue: 0,
    secondValue: 0,
    firstText: '',
    secondText: '',
    selectedSymbol: null,
    text: '',
    expectedMetres: 0,
    expectedCentimetres: 0,
}

bindSymbolPicker('p2LengthSymbolPicker', p2LengthObj);

function p2CompoundLength(centimetres) {
    let rest = centimetres % 100;
    return `${Math.floor(centimetres / 100)} ม.${rest ? ` ${rest} ซม.` : ''}`;
}

function validateP2LengthResult() {
    let isCorrect, expr;

    if (p2LengthObj.mode === 'compare') {
        if (!p2LengthObj.selectedSymbol) {
            flagFieldRequired('p2LengthSymbolPicker');
            return;
        }

        isCorrect = p2LengthObj.selectedSymbol === compareSymbolOf(p2LengthObj.firstValue, p2LengthObj.secondValue);
        expr = `${p2LengthObj.firstText} ${compareSymbolText[p2LengthObj.selectedSymbol]} ${p2LengthObj.secondText}`;
    } else {
        if (focusFirstEmptyField(['p2LengthMetresNumber', 'p2LengthCentimetresNumber'])) {
            return;
        }

        let metres = +$('#p2LengthMetresNumber').val();
        let centimetres = +$('#p2LengthCentimetresNumber').val();

        isCorrect = metres === p2LengthObj.expectedMetres && centimetres === p2LengthObj.expectedCentimetres;
        expr = `${p2LengthObj.text} = ${metres} เมตร ${centimetres} เซนติเมตร`;
    }

    showFeedback('feedbackP2Length', isCorrect);

    if (isCorrect) {
        addResultP2LengthToItemList({ expr })
        $('#contentP2LengthResult').show();
        addSuggestP2LengthValue();
        $('#p2LengthMetresNumber').filter(':visible').first().trigger('focus');
    }

    $('#contentP2LengthHistory').show();
    addResultP2LengthToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2LengthToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2LengthObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2LengthList').append(elementItem)

    p2LengthObj.numRows++;
}

function addResultP2LengthToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2LengthObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2LengthList').append(elementItem)

    recordHistoryAttempt('p2length', isCorrect, 'historyP2LengthList');

    if (isCorrect) {
        p2LengthObj.numRowsHistory++;
    }
}

// The centimetres never carry into metres, so the two parts are worked separately.
function buildP2LengthWord() {
    let isAddition = Math.random() < 0.5;
    let firstMetres = isAddition ? randomInt(1, 5) : randomInt(3, 9);
    let secondMetres = isAddition ? randomInt(1, 4) : randomInt(1, firstMetres - 1);
    let firstCentimetres = isAddition ? randomInt(10, 60) : randomInt(20, 95);
    let secondCentimetres = isAddition ? randomInt(5, 99 - firstCentimetres) : randomInt(5, firstCentimetres);
    let first = `${firstMetres} เมตร ${firstCentimetres} เซนติเมตร`;
    let second = `${secondMetres} เมตร ${secondCentimetres} เซนติเมตร`;
    let templates = isAddition
        ? [
            `เชือกสีแดงยาว ${first} เชือกสีฟ้ายาว ${second} เมื่อนำมาต่อกันจะยาวเท่าไร`,
            `พี่เดินไปได้ ${first} แล้วเดินต่ออีก ${second} พี่เดินได้ทั้งหมดเท่าไร`,
        ]
        : [
            `ผ้าผืนหนึ่งยาว ${first} ตัดออกไป ${second} เหลือผ้ายาวเท่าไร`,
            `ไม้ท่อนแรกยาว ${first} ไม้ท่อนที่สองยาว ${second} ไม้ท่อนแรกยาวกว่าเท่าไร`,
        ];

    return {
        text: pickOne(templates),
        expectedMetres: isAddition ? firstMetres + secondMetres : firstMetres - secondMetres,
        expectedCentimetres: isAddition ? firstCentimetres + secondCentimetres : firstCentimetres - secondCentimetres,
    };
}

function suggestP2LengthWord() {
    let question = buildP2LengthWord();

    p2LengthObj.text = question.text;
    p2LengthObj.expectedMetres = question.expectedMetres;
    p2LengthObj.expectedCentimetres = question.expectedCentimetres;

    $('#p2LengthWordText').text(p2LengthObj.text);
    $('#p2LengthMetresNumber').val('');
    $('#p2LengthCentimetresNumber').val('');
}

function suggestP2LengthCompare() {
    let firstValue = randomInt(135, 895);
    let secondValue = Math.random() < 0.2 ? firstValue : firstValue + randomInt(-30, 30);
    let compoundFirst = Math.random() < 0.5;

    p2LengthObj.firstValue = firstValue;
    p2LengthObj.secondValue = secondValue;
    p2LengthObj.firstText = compoundFirst ? p2CompoundLength(firstValue) : `${firstValue} ซม.`;
    p2LengthObj.secondText = compoundFirst ? `${secondValue} ซม.` : p2CompoundLength(secondValue);
    p2LengthObj.selectedSymbol = null;

    $('#p2LengthSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstP2LengthNumber').text(p2LengthObj.firstText);
    $('#secondP2LengthNumber').text(p2LengthObj.secondText);
}

function addSuggestP2LengthValue() {
    let isCompare = p2LengthObj.mode === 'compare';

    $('#p2LengthCompareArea').toggle(isCompare);
    $('#p2LengthWordArea').toggle(!isCompare);

    if (isCompare) {
        suggestP2LengthCompare();
    } else {
        suggestP2LengthWord();
    }
}

bindModePicker('p2LengthModePicker', p2LengthObj, addSuggestP2LengthValue);

addSuggestP2LengthValue();
