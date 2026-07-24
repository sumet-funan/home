var p5FractionObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstNumerator: 1,
    secondNumerator: 2,
    denominator: 4,
    symbol: "+",
}

function validateFractionResult() {
    if (focusFirstEmptyField(['fractionAnswerNumerator'])) {
        return;
    }

    let answer = +$('#fractionAnswerNumerator').val();
    let expected = p5FractionObj.symbol === "+"
        ? p5FractionObj.firstNumerator + p5FractionObj.secondNumerator
        : p5FractionObj.firstNumerator - p5FractionObj.secondNumerator;
    let isCorrect = answer === expected;
    let textColor = "green";

    showFeedback('feedbackFraction', isCorrect);

    let expr = `${p5FractionObj.firstNumerator}/${p5FractionObj.denominator} ${p5FractionObj.symbol} ${p5FractionObj.secondNumerator}/${p5FractionObj.denominator} = ${answer}/${p5FractionObj.denominator}`;

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
    let denominator = denominators[parseInt(Math.random() * denominators.length)];
    let symbol = Math.random() < 0.5 ? "+" : "-";

    let firstNumerator = parseInt(Math.random() * (denominator - 1)) + 1;
    let secondNumerator;
    if (symbol === "-") {
        secondNumerator = parseInt(Math.random() * firstNumerator) + 1;
    } else {
        secondNumerator = parseInt(Math.random() * (denominator - 1)) + 1;
    }

    p5FractionObj.firstNumerator = firstNumerator;
    p5FractionObj.secondNumerator = secondNumerator;
    p5FractionObj.denominator = denominator;
    p5FractionObj.symbol = symbol;

    $('#firstFractionNumerator').text(firstNumerator);
    $('#firstFractionDenominator').text(denominator);
    $('#secondFractionNumerator').text(secondNumerator);
    $('#secondFractionDenominator').text(denominator);
    $('#resultFractionDenominator').text(denominator);
    $('#fractionSymbol').text(symbol);
    $('#fractionAnswerNumerator').val('');
}

addSuggestFractionValue();
