var p2MinusObj = {
    numRows: 1,
    numRowsHistory: 1,
    format: "number",
}

function buildP2MinusWordText(firstNumber, secondNumber) {
    let name = p2Pick(p2WordNames);
    let itemObj = p2Pick(p2WordItems);
    let templates = [
        `${name}มี${itemObj.item} ${firstNumber} ${itemObj.classifier} ให้เพื่อนไป ${secondNumber} ${itemObj.classifier} ${name}เหลือ${itemObj.item}กี่${itemObj.classifier}`,
        `${name}มี${itemObj.item} ${firstNumber} ${itemObj.classifier} ใช้ไป ${secondNumber} ${itemObj.classifier} เหลือ${itemObj.item}กี่${itemObj.classifier}`,
    ];
    return p2Pick(templates);
}

function validateP2MinusResult() {
    if (focusFirstEmptyField(['firstP2MinusNumber', 'secondP2MinusNumber', 'resultP2MinusNumber'])) {
        return;
    }

    let firstNumber = +$('#firstP2MinusNumber').val();
    let secondNumber = +$('#secondP2MinusNumber').val();
    let resultNumber = +$('#resultP2MinusNumber').val();
    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, "-").status;
    let expr = `${firstNumber} − ${secondNumber} = ${resultNumber}`;

    showFeedback('feedbackP2Minus', isCorrect);

    if (isCorrect) {
        addResultP2MinusToItemList({ expr })
        $('#contentP2MinusResult').show();
        addSuggestP2MinusValue();
    }

    $('#contentP2MinusHistory').show();
    addResultP2MinusToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2MinusToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2MinusObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2MinusList').append(elementItem)

    p2MinusObj.numRows++;
}

function addResultP2MinusToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2MinusObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2MinusList').append(elementItem)

    recordHistoryAttempt('p2minus', isCorrect, 'historyP2MinusList');

    if (isCorrect) {
        p2MinusObj.numRowsHistory++;
    }
}

function addSuggestP2MinusValue() {
    let firstNumber = p2RandomInt(100, 1000);
    let secondNumber = p2RandomInt(10, firstNumber);

    $('#firstP2MinusNumber').val(firstNumber);
    $('#secondP2MinusNumber').val(secondNumber);
    $('#resultP2MinusNumber').val('');

    if (p2MinusObj.format === 'word') {
        $('#p2MinusWordText').text(buildP2MinusWordText(firstNumber, secondNumber));
    }
}

bindFormatPicker('p2MinusFormatPicker', 'p2MinusNumberDisplay', 'p2MinusWordText', p2MinusObj, addSuggestP2MinusValue);

addSuggestP2MinusValue();
