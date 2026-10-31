var p2CapacityObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "compare",
    firstValue: 0,
    secondValue: 0,
    selectedSymbol: null,
    text: '',
    expected: 0,
}

p2BindSymbolPicker('p2CapacitySymbolPicker', p2CapacityObj);

function validateP2CapacityResult() {
    let isCorrect, expr;

    if (p2CapacityObj.mode === 'compare') {
        if (!p2CapacityObj.selectedSymbol) {
            flagFieldRequired('p2CapacitySymbolPicker');
            return;
        }

        isCorrect = p2CapacityObj.selectedSymbol === p2CompareSymbol(p2CapacityObj.firstValue, p2CapacityObj.secondValue);
        expr = `${p2CapacityObj.firstValue} ลิตร ${p2SymbolText[p2CapacityObj.selectedSymbol]} ${p2CapacityObj.secondValue} ลิตร`;
    } else {
        if (focusFirstEmptyField(['p2CapacityAnswerNumber'])) {
            return;
        }

        let answer = +$('#p2CapacityAnswerNumber').val();

        isCorrect = answer === p2CapacityObj.expected;
        expr = `${p2CapacityObj.text} = ${answer} ลิตร`;
    }

    showFeedback('feedbackP2Capacity', isCorrect);

    if (isCorrect) {
        addResultP2CapacityToItemList({ expr })
        $('#contentP2CapacityResult').show();
        addSuggestP2CapacityValue();
    }

    $('#contentP2CapacityHistory').show();
    addResultP2CapacityToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2CapacityToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2CapacityObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2CapacityList').append(elementItem)

    p2CapacityObj.numRows++;
}

function addResultP2CapacityToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2CapacityObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2CapacityList').append(elementItem)

    recordHistoryAttempt('p2capacity', isCorrect, 'historyP2CapacityList');

    if (isCorrect) {
        p2CapacityObj.numRowsHistory++;
    }
}

function suggestP2CapacityWord() {
    let bigger = p2RandomInt(20, 100);
    let smaller = p2RandomInt(5, bigger - 5);
    let bottles = p2RandomInt(2, 9);
    let perBottle = p2RandomInt(2, 12);
    let questions = [
        { text: `ถังใบแรกจุน้ำ ${bigger} ลิตร ถังใบที่สองจุน้ำ ${smaller} ลิตร ถังใบแรกจุมากกว่ากี่ลิตร`, expected: bigger - smaller },
        { text: `ในถังมีน้ำ ${bigger} ลิตร ใช้ไป ${smaller} ลิตร เหลือน้ำกี่ลิตร`, expected: bigger - smaller },
        { text: `เติมน้ำลงในโอ่ง ${bigger} ลิตร แล้วเติมอีก ${smaller} ลิตร โอ่งมีน้ำทั้งหมดกี่ลิตร`, expected: bigger + smaller },
        { text: `มีขวดน้ำ ${bottles} ขวด ขวดละ ${perBottle} ลิตร มีน้ำทั้งหมดกี่ลิตร`, expected: bottles * perBottle },
    ];
    let question = p2Pick(questions);

    p2CapacityObj.text = question.text;
    p2CapacityObj.expected = question.expected;

    $('#p2CapacityWordText').text(question.text);
    $('#p2CapacityAnswerNumber').val('');
}

function suggestP2CapacityCompare() {
    let firstValue = p2RandomInt(1, 100);
    let secondValue = Math.random() < 0.2 ? firstValue : p2RandomInt(1, 100);

    p2CapacityObj.firstValue = firstValue;
    p2CapacityObj.secondValue = secondValue;
    p2CapacityObj.selectedSymbol = null;

    $('#p2CapacitySymbolPicker .symbol-btn').removeClass('selected');
    $('#firstP2CapacityNumber').text(firstValue + ' ลิตร');
    $('#secondP2CapacityNumber').text(secondValue + ' ลิตร');
}

function addSuggestP2CapacityValue() {
    let isCompare = p2CapacityObj.mode === 'compare';

    $('#p2CapacityCompareArea').toggle(isCompare);
    $('#p2CapacityWordArea').toggle(!isCompare);

    if (isCompare) {
        suggestP2CapacityCompare();
    } else {
        suggestP2CapacityWord();
    }
}

bindModePicker('p2CapacityModePicker', p2CapacityObj, addSuggestP2CapacityValue);

addSuggestP2CapacityValue();
