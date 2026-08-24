var p1NumberBondObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "10",
    target: 10,
    known: 0,
    expected: 0,
    blankFirst: false,
}

function validateNumberBondResult() {
    if (focusFirstEmptyField(['numberBondAnswerNumber'])) {
        return;
    }

    let answer = +$('#numberBondAnswerNumber').val();
    let isCorrect = answer === p1NumberBondObj.expected;
    let textColor = "green";

    showFeedback('feedbackNumberBond', isCorrect);

    // written the way the child saw it, with their number in the blank
    let expr = p1NumberBondObj.blankFirst
        ? answer + ' + ' + p1NumberBondObj.known + ' = ' + p1NumberBondObj.target
        : p1NumberBondObj.known + ' + ' + answer + ' = ' + p1NumberBondObj.target;

    if (isCorrect) {
        addResultNumberBondToItemList({ expr })
        $('#contentNumberBondResult').show();
        addSuggestNumberBondValue();
    }
    else {
        textColor = "red";
    }

    $('#contentNumberBondHistory').show();
    addResultNumberBondToHistoryList({ expr, color: textColor })
}

function addResultNumberBondToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1NumberBondObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultNumberBondList').append(elementItem)

    p1NumberBondObj.numRows++;
}

function addResultNumberBondToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1NumberBondObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyNumberBondList').append(elementItem)

    recordHistoryAttempt('p1numberbond', isCorrect, 'historyNumberBondList');

    if (isCorrect) {
        p1NumberBondObj.numRowsHistory++;
    }
}

function addSuggestNumberBondValue() {
    let target = +p1NumberBondObj.mode;

    // 0 and the target itself are excluded: "0 + ? = 10" teaches nothing, and a
    // child can answer it without knowing the bond at all
    let known = 1 + parseInt(Math.random() * (target - 1));
    let blankFirst = Math.random() < 0.5;

    p1NumberBondObj.target = target;
    p1NumberBondObj.known = known;
    p1NumberBondObj.expected = target - known;
    p1NumberBondObj.blankFirst = blankFirst;

    // Which side is blank varies, so the child works out a missing part rather
    // than always reading left to right -- that is the whole point of bonds.
    $('#numberBondKnownFirst').text(blankFirst ? '' : known).toggle(!blankFirst);
    $('#numberBondKnownSecond').text(blankFirst ? known : '').toggle(blankFirst);
    $('#numberBondTarget').text(target);
    $('#numberBondAnswerNumber')
        .val('')
        .toggleClass('bond-answer-first', blankFirst)
        .toggleClass('bond-answer-second', !blankFirst);

    // move the input to whichever side is blank
    let $slot = blankFirst ? $('#numberBondSlotFirst') : $('#numberBondSlotSecond');
    $slot.append($('#numberBondAnswerNumber'));

    $('#numberBondTotalHint').text('รวมกันได้ ' + target);
}

bindModePicker('numberBondModePicker', p1NumberBondObj, addSuggestNumberBondValue);

addSuggestNumberBondValue();
