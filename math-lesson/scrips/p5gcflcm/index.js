var p5GcflcmObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstNumber: 12,
    secondNumber: 18,
    mode: 'hcf',
    expected: 6,
}

function gcfOf(a, b) {
    return b === 0 ? a : gcfOf(b, a % b);
}

function lcmOf(a, b) {
    return (a * b) / gcfOf(a, b);
}

function validateGcflcmResult() {
    if (focusFirstEmptyField(['gcflcmAnswerNumber'])) {
        return;
    }

    let answer = +$('#gcflcmAnswerNumber').val();
    let isCorrect = answer === p5GcflcmObj.expected;
    let textColor = "green";

    showFeedback('feedbackGcflcm', isCorrect);

    let label = p5GcflcmObj.mode === 'hcf' ? 'ห.ร.ม.' : 'ค.ร.น.';
    let expr = `${label} ของ ${p5GcflcmObj.firstNumber} และ ${p5GcflcmObj.secondNumber} = ${answer}`;

    if (isCorrect) {
        addResultGcflcmToItemList({ expr })
        $('#contentGcflcmResult').show();
        addSuggestGcflcmValue();
    }
    else {
        textColor = "red";
    }

    $('#contentGcflcmHistory').show();
    addResultGcflcmToHistoryList({ expr, color: textColor })
}

function addResultGcflcmToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5GcflcmObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultGcflcmList').append(elementItem)

    p5GcflcmObj.numRows++;
}

function addResultGcflcmToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</i>
            <span class="answer-index">${p5GcflcmObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyGcflcmList').append(elementItem)

    if (isCorrect) {
        p5GcflcmObj.numRowsHistory++;
    }
}

function addSuggestGcflcmValue() {
    let firstNumber = parseInt(Math.random() * 23) + 2;
    let secondNumber = parseInt(Math.random() * 23) + 2;
    let mode = Math.random() < 0.5 ? 'hcf' : 'lcm';

    let expected = mode === 'hcf' ? gcfOf(firstNumber, secondNumber) : lcmOf(firstNumber, secondNumber);

    p5GcflcmObj.firstNumber = firstNumber;
    p5GcflcmObj.secondNumber = secondNumber;
    p5GcflcmObj.mode = mode;
    p5GcflcmObj.expected = expected;

    $('#gcflcmLabel').text(mode === 'hcf' ? 'ห.ร.ม.' : 'ค.ร.น.');
    $('#gcflcmFirstNumber').text(firstNumber);
    $('#gcflcmSecondNumber').text(secondNumber);
    $('#gcflcmAnswerNumber').val('');
}

addSuggestGcflcmValue();
