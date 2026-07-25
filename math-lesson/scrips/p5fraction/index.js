var p5FractionObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstNumerator: 1,
    firstDenominator: 4,
    secondNumerator: 2,
    secondDenominator: 3,
    symbol: "+",
    trueNumerator: 0,
    trueDenominator: 1,
}

function validateFractionResult() {
    if (focusFirstEmptyField(['fractionAnswerNumerator', 'fractionAnswerDenominator'])) {
        return;
    }

    let answerNumerator = +$('#fractionAnswerNumerator').val();
    let answerDenominator = +$('#fractionAnswerDenominator').val();
    let isCorrect = answerDenominator > 0
        && answerNumerator * p5FractionObj.trueDenominator === p5FractionObj.trueNumerator * answerDenominator;
    let textColor = "green";

    showFeedback('feedbackFraction', isCorrect);

    let expr = `${p5FractionObj.firstNumerator}/${p5FractionObj.firstDenominator} ${p5FractionObj.symbol} ${p5FractionObj.secondNumerator}/${p5FractionObj.secondDenominator} = ${answerNumerator}/${answerDenominator}`;

    if (isCorrect) {
        addResultFractionToItemList({ expr })
        $('#contentFractionResult').show();
        addSuggestFractionValue();
    }
    else {
        textColor = "red";
    }

    $('#contentFractionHistory').show();
    addResultFractionToHistoryList({ expr, color: textColor })
}

function addResultFractionToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5FractionObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultFractionList').append(elementItem)

    p5FractionObj.numRows++;
}

function addResultFractionToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5FractionObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyFractionList').append(elementItem)

    if (isCorrect) {
        p5FractionObj.numRowsHistory++;
    }
}

function addSuggestFractionValue() {
    let denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    let symbols = ["+", "-", "×", "÷"];
    let symbol = symbols[parseInt(Math.random() * symbols.length)];

    let firstDenominator, secondDenominator, firstNumerator, secondNumerator;
    let trueNumerator, trueDenominator;

    do {
        firstDenominator = denominators[parseInt(Math.random() * denominators.length)];
        secondDenominator = denominators[parseInt(Math.random() * denominators.length)];
        firstNumerator = parseInt(Math.random() * (firstDenominator - 1)) + 1;
        secondNumerator = parseInt(Math.random() * (secondDenominator - 1)) + 1;

        if (symbol === "+") {
            trueNumerator = firstNumerator * secondDenominator + secondNumerator * firstDenominator;
            trueDenominator = firstDenominator * secondDenominator;
        } else if (symbol === "-") {
            trueNumerator = firstNumerator * secondDenominator - secondNumerator * firstDenominator;
            trueDenominator = firstDenominator * secondDenominator;
        } else if (symbol === "×") {
            trueNumerator = firstNumerator * secondNumerator;
            trueDenominator = firstDenominator * secondDenominator;
        } else {
            trueNumerator = firstNumerator * secondDenominator;
            trueDenominator = firstDenominator * secondNumerator;
        }
    } while (trueNumerator < 0);

    p5FractionObj.firstNumerator = firstNumerator;
    p5FractionObj.firstDenominator = firstDenominator;
    p5FractionObj.secondNumerator = secondNumerator;
    p5FractionObj.secondDenominator = secondDenominator;
    p5FractionObj.symbol = symbol;
    p5FractionObj.trueNumerator = trueNumerator;
    p5FractionObj.trueDenominator = trueDenominator;

    $('#firstFractionNumerator').text(firstNumerator);
    $('#firstFractionDenominator').text(firstDenominator);
    $('#secondFractionNumerator').text(secondNumerator);
    $('#secondFractionDenominator').text(secondDenominator);
    $('#fractionSymbol').text(symbol);
    $('#fractionAnswerNumerator').val('');
    $('#fractionAnswerDenominator').val('');
}

addSuggestFractionValue();
