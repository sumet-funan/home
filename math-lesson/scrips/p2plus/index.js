var p2PlusObj = {
    numRows: 1,
    numRowsHistory: 1,
    format: "number",
}

function buildP2PlusWordText(firstNumber, secondNumber) {
    let name = pickOne(wordNames);
    let itemObj = pickOne(wordItems);
    let templates = [
        `${name}มี${itemObj.item} ${firstNumber} ${itemObj.classifier} ซื้อเพิ่มอีก ${secondNumber} ${itemObj.classifier} ${name}มี${itemObj.item}ทั้งหมดกี่${itemObj.classifier}`,
        `${name}เก็บ${itemObj.item}ได้ ${firstNumber} ${itemObj.classifier} เพื่อนให้อีก ${secondNumber} ${itemObj.classifier} ${name}มี${itemObj.item}รวมกี่${itemObj.classifier}`,
    ];
    return pickOne(templates);
}

function validateP2PlusResult() {
    if (focusFirstEmptyField(['firstP2PlusNumber', 'secondP2PlusNumber', 'resultP2PlusNumber'])) {
        return;
    }

    let firstNumber = +$('#firstP2PlusNumber').val();
    let secondNumber = +$('#secondP2PlusNumber').val();
    let resultNumber = +$('#resultP2PlusNumber').val();
    let isCorrect = validateResult(firstNumber, secondNumber, resultNumber, "+").status;
    let expr = `${firstNumber} + ${secondNumber} = ${resultNumber}`;

    showFeedback('feedbackP2Plus', isCorrect);

    if (isCorrect) {
        addResultP2PlusToItemList({ expr })
        $('#contentP2PlusResult').show();
        addSuggestP2PlusValue();
    }

    $('#contentP2PlusHistory').show();
    addResultP2PlusToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2PlusToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2PlusObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2PlusList').append(elementItem)

    p2PlusObj.numRows++;
}

function addResultP2PlusToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2PlusObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2PlusList').append(elementItem)

    recordHistoryAttempt('p2plus', isCorrect, 'historyP2PlusList');

    if (isCorrect) {
        p2PlusObj.numRowsHistory++;
    }
}

function addSuggestP2PlusValue() {
    let firstNumber = randomInt(100, 900);
    let secondNumber = randomInt(10, 1000 - firstNumber);

    $('#firstP2PlusNumber').val(firstNumber);
    $('#secondP2PlusNumber').val(secondNumber);
    $('#resultP2PlusNumber').val('');

    if (p2PlusObj.format === 'word') {
        $('#p2PlusWordText').text(buildP2PlusWordText(firstNumber, secondNumber));
    }
}

bindFormatPicker('p2PlusFormatPicker', 'p2PlusNumberDisplay', 'p2PlusWordText', p2PlusObj, addSuggestP2PlusValue);

addSuggestP2PlusValue();
