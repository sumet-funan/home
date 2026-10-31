var p1CompareObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "compare",
    firstNumber: 0,
    secondNumber: 0,
    selectedSymbol: null,
    numbers: [],
    ascending: true,
    picked: [],
}

bindSymbolPicker('compareSymbolPicker', p1CompareObj);

$(document).on('click', '#compareOrderOptions .shape-option-btn', function () {
    let value = $(this).data('value');
    let position = p1CompareObj.picked.indexOf(value);

    if (position === -1) {
        p1CompareObj.picked.push(value);
    } else {
        p1CompareObj.picked.splice(position, 1);
    }

    renderComparePicked();
});

function renderComparePicked() {
    $('#compareOrderOptions .shape-option-btn').each(function () {
        $(this).toggleClass('selected', p1CompareObj.picked.indexOf($(this).data('value')) !== -1);
    });
    $('#compareOrderPicked').text(p1CompareObj.picked.join(', ') || 'แตะตัวเลขทีละตัวตามลำดับ');
}

function validateCompareResult() {
    let isCorrect, expr;

    if (p1CompareObj.mode === 'order') {
        if (p1CompareObj.picked.length < p1CompareObj.numbers.length) {
            flagFieldRequired('compareOrderOptions');
            return;
        }

        let sorted = p1CompareObj.numbers.slice().sort(function (a, b) {
            return p1CompareObj.ascending ? a - b : b - a;
        });

        isCorrect = p1CompareObj.picked.join() === sorted.join();
        expr = `${p1CompareObj.ascending ? 'น้อยไปมาก' : 'มากไปน้อย'}: ${p1CompareObj.picked.join(', ')}`;
    } else {
        if (!p1CompareObj.selectedSymbol) {
            flagFieldRequired('compareSymbolPicker');
            return;
        }

        let actual = compareSymbolOf(p1CompareObj.firstNumber, p1CompareObj.secondNumber);
        if (p1CompareObj.mode === 'equal' && actual !== 'eq') {
            actual = 'ne';
        }

        isCorrect = p1CompareObj.selectedSymbol === actual;
        expr = `${p1CompareObj.firstNumber} ${compareSymbolText[p1CompareObj.selectedSymbol]} ${p1CompareObj.secondNumber}`;
    }

    showFeedback('feedbackCompare', isCorrect);

    if (isCorrect) {
        addResultCompareToItemList({ expr })
        $('#contentCompareResult').show();
        addSuggestCompareValue();
    }

    $('#contentCompareHistory').show();
    addResultCompareToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultCompareToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1CompareObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultCompareList').append(elementItem)

    p1CompareObj.numRows++;
}

function addResultCompareToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1CompareObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyCompareList').append(elementItem)

    recordHistoryAttempt('p1compare', isCorrect, 'historyCompareList');

    if (isCorrect) {
        p1CompareObj.numRowsHistory++;
    }
}

function suggestCompareOrder() {
    let count = randomInt(3, 5);
    let numbers = [];

    while (numbers.length < count) {
        let number = randomInt(0, 100);
        if (numbers.indexOf(number) === -1) {
            numbers.push(number);
        }
    }

    p1CompareObj.numbers = numbers;
    p1CompareObj.ascending = Math.random() < 0.5;
    p1CompareObj.picked = [];

    let html = '';
    for (let i = 0; i < numbers.length; i++) {
        html += `<button type="button" class="shape-option-btn" data-value="${numbers[i]}">${numbers[i]}</button>`;
    }

    $('#compareOrderQuestion').text(p1CompareObj.ascending ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย');
    $('#compareOrderOptions').html(html);
    renderComparePicked();
}

function addSuggestCompareValue() {
    let isOrder = p1CompareObj.mode === 'order';

    $('#compareRowArea').toggle(!isOrder);
    $('#compareOrderArea').toggle(isOrder);

    if (isOrder) {
        suggestCompareOrder();
        return;
    }

    let isEqualMode = p1CompareObj.mode === 'equal';
    let firstNumber = randomInt(0, 100);
    let secondNumber = Math.random() < (isEqualMode ? 0.5 : 0.2) ? firstNumber : randomInt(0, 100);

    p1CompareObj.firstNumber = firstNumber;
    p1CompareObj.secondNumber = secondNumber;
    p1CompareObj.selectedSymbol = null;

    showCompareSymbols('compareSymbolPicker', isEqualMode);
    $('#compareSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstCompareNumber').text(firstNumber);
    $('#secondCompareNumber').text(secondNumber);
}

bindModePicker('compareModePicker', p1CompareObj, addSuggestCompareValue);

addSuggestCompareValue();
