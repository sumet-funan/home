var p2CompareObj = {
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

bindSymbolPicker('p2CompareSymbolPicker', p2CompareObj);

$(document).on('click', '#p2CompareOrderOptions .shape-option-btn', function () {
    let value = $(this).data('value');
    let position = p2CompareObj.picked.indexOf(value);

    if (position === -1) {
        p2CompareObj.picked.push(value);
    } else {
        p2CompareObj.picked.splice(position, 1);
    }

    renderP2ComparePicked();
});

function renderP2ComparePicked() {
    $('#p2CompareOrderOptions .shape-option-btn').each(function () {
        $(this).toggleClass('selected', p2CompareObj.picked.indexOf($(this).data('value')) !== -1);
    });
    $('#p2CompareOrderPicked').text(p2CompareObj.picked.join(', ') || 'แตะตัวเลขทีละตัวตามลำดับ');
}

function validateP2CompareResult() {
    let isCorrect, expr;

    if (p2CompareObj.mode !== 'order') {
        if (!p2CompareObj.selectedSymbol) {
            flagFieldRequired('p2CompareSymbolPicker');
            return;
        }

        let actual = compareSymbolOf(p2CompareObj.firstNumber, p2CompareObj.secondNumber);
        if (p2CompareObj.mode === 'equal' && actual !== 'eq') {
            actual = 'ne';
        }

        isCorrect = p2CompareObj.selectedSymbol === actual;
        expr = `${p2CompareObj.firstNumber} ${compareSymbolText[p2CompareObj.selectedSymbol]} ${p2CompareObj.secondNumber}`;
    } else {
        if (p2CompareObj.picked.length < p2CompareObj.numbers.length) {
            flagFieldRequired('p2CompareOrderOptions');
            return;
        }

        let sorted = p2CompareObj.numbers.slice().sort(function (a, b) {
            return p2CompareObj.ascending ? a - b : b - a;
        });

        isCorrect = p2CompareObj.picked.join() === sorted.join();
        expr = `${p2CompareObj.ascending ? 'น้อยไปมาก' : 'มากไปน้อย'}: ${p2CompareObj.picked.join(', ')}`;
    }

    showFeedback('feedbackP2Compare', isCorrect);

    if (isCorrect) {
        addResultP2CompareToItemList({ expr })
        $('#contentP2CompareResult').show();
        addSuggestP2CompareValue();
    }

    $('#contentP2CompareHistory').show();
    addResultP2CompareToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2CompareToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2CompareObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2CompareList').append(elementItem)

    p2CompareObj.numRows++;
}

function addResultP2CompareToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2CompareObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2CompareList').append(elementItem)

    recordHistoryAttempt('p2compare', isCorrect, 'historyP2CompareList');

    if (isCorrect) {
        p2CompareObj.numRowsHistory++;
    }
}

// Numbers from far apart are decided by the hundreds alone, so most pairs share
// them and the child has to look further along.
function addSuggestP2CompareValue() {
    let isOrder = p2CompareObj.mode === 'order';
    let isEqualMode = p2CompareObj.mode === 'equal';

    $('#p2CompareRow').toggle(!isOrder);
    $('#p2CompareOrder').toggle(isOrder);

    if (!isOrder) {
        let firstNumber = randomInt(100, 999);
        let secondNumber = randomInt(0, 1000);
        let closeness = Math.random();

        if (closeness < (isEqualMode ? 0.5 : 0.2)) {
            secondNumber = firstNumber;
        } else if (closeness < 0.7) {
            secondNumber = Math.floor(firstNumber / 100) * 100 + randomInt(0, 99);
        }

        p2CompareObj.firstNumber = firstNumber;
        p2CompareObj.secondNumber = secondNumber;
        p2CompareObj.selectedSymbol = null;

        showCompareSymbols('p2CompareSymbolPicker', isEqualMode);
        $('#p2CompareSymbolPicker .symbol-btn').removeClass('selected');
        $('#firstP2CompareNumber').text(firstNumber);
        $('#secondP2CompareNumber').text(secondNumber);
        return;
    }

    let count = randomInt(3, 5);
    let numbers = [];

    while (numbers.length < count) {
        let number = randomInt(0, 1000);
        if (numbers.indexOf(number) === -1) {
            numbers.push(number);
        }
    }

    p2CompareObj.numbers = numbers;
    p2CompareObj.ascending = Math.random() < 0.5;
    p2CompareObj.picked = [];

    let html = '';
    for (let i = 0; i < numbers.length; i++) {
        html += `<button type="button" class="shape-option-btn" data-value="${numbers[i]}">${numbers[i]}</button>`;
    }

    $('#p2CompareOrderQuestion').text(p2CompareObj.ascending ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย');
    $('#p2CompareOrderOptions').html(html);
    renderP2ComparePicked();
}

bindModePicker('p2CompareModePicker', p2CompareObj, addSuggestP2CompareValue);

addSuggestP2CompareValue();
