var p1MoneyObj = {
    numRows: 1,
    numRowsHistory: 1,
    items: [1, 5, 10],
    expected: 16,
}

var moneyDenominations = [1, 2, 5, 10, 20, 50, 100];
var moneyCoinSet = [1, 2, 5, 10];

function renderMoneyItems(items) {
    let html = '';

    for (let i = 0; i < items.length; i++) {
        let value = items[i];
        let isCoin = moneyCoinSet.indexOf(value) !== -1;
        html += '<div class="money-item ' + (isCoin ? 'money-coin' : 'money-note') + '">' + value + '<br>บาท</div>';
    }

    return html;
}

function validateMoneyResult() {
    if (focusFirstEmptyField(['moneyAnswerNumber'])) {
        return;
    }

    let answer = +$('#moneyAnswerNumber').val();
    let isCorrect = answer === p1MoneyObj.expected;
    let textColor = "green";

    showFeedback('feedbackMoney', isCorrect);

    let expr = `${p1MoneyObj.items.join(' + ')} = ${answer} บาท`;

    if (isCorrect) {
        addResultMoneyToItemList({ expr })
        $('#contentMoneyResult').show();
        addSuggestMoneyValue();
    }
    else {
        textColor = "red";
    }

    $('#contentMoneyHistory').show();
    addResultMoneyToHistoryList({ expr, color: textColor })
}

function addResultMoneyToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1MoneyObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultMoneyList').append(elementItem)

    p1MoneyObj.numRows++;
}

function addResultMoneyToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1MoneyObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyMoneyList').append(elementItem)

    if (isCorrect) {
        p1MoneyObj.numRowsHistory++;
    }
}

function addSuggestMoneyValue() {
    let n = 2 + parseInt(Math.random() * 3);
    let items = [];
    let sum = 0;

    for (let i = 0; i < n; i++) {
        let value = moneyDenominations[parseInt(Math.random() * moneyDenominations.length)];
        items.push(value);
        sum += value;
    }

    p1MoneyObj.items = items;
    p1MoneyObj.expected = sum;

    $('#moneyItemsDisplay').html(renderMoneyItems(items));
    $('#moneyAnswerNumber').val('');
}

addSuggestMoneyValue();
