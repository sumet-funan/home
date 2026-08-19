var p5MixedNumberObj = {
    numRows: 1,
    numRowsHistory: 1,
    firstWhole: 2,
    firstNumerator: 1,
    firstDenominator: 4,
    secondWhole: 1,
    secondNumerator: 2,
    secondDenominator: 3,
    symbol: "+",
    trueNumerator: 0,
    trueDenominator: 1,
    mode: "all",
}

function validateMixedNumberResult() {
    if (focusFirstEmptyField(['mixedAnswerWhole', 'mixedAnswerNumerator', 'mixedAnswerDenominator'])) {
        return;
    }

    let answerWhole = +$('#mixedAnswerWhole').val();
    let answerNumerator = +$('#mixedAnswerNumerator').val();
    let answerDenominator = +$('#mixedAnswerDenominator').val();
    let answerImproperNumerator = answerWhole * answerDenominator + answerNumerator;
    let isCorrect = answerDenominator > 0
        && answerImproperNumerator * p5MixedNumberObj.trueDenominator === p5MixedNumberObj.trueNumerator * answerDenominator;
    let textColor = "green";

    showFeedback('feedbackMixedNumber', isCorrect);

    let expr = `${p5MixedNumberObj.firstWhole} ${p5MixedNumberObj.firstNumerator}/${p5MixedNumberObj.firstDenominator} ${p5MixedNumberObj.symbol} ${p5MixedNumberObj.secondWhole} ${p5MixedNumberObj.secondNumerator}/${p5MixedNumberObj.secondDenominator} = ${answerWhole} ${answerNumerator}/${answerDenominator}`;

    if (isCorrect) {
        addResultMixedNumberToItemList({ expr })
        $('#contentMixedNumberResult').show();
        addSuggestMixedNumberValue();
    }
    else {
        textColor = "red";
    }

    $('#contentMixedNumberHistory').show();
    addResultMixedNumberToHistoryList({ expr, color: textColor })
}

function addResultMixedNumberToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5MixedNumberObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultMixedNumberList').append(elementItem)

    p5MixedNumberObj.numRows++;
}

function addResultMixedNumberToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5MixedNumberObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyMixedNumberList').append(elementItem)

    recordHistoryAttempt('p5mixednumber', isCorrect, 'historyMixedNumberList');

    if (isCorrect) {
        p5MixedNumberObj.numRowsHistory++;
    }
}

function addSuggestMixedNumberValue() {
    let denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    let symbols = ["+", "-", "×", "÷"];
    let symbol = p5MixedNumberObj.mode === "all" ? symbols[parseInt(Math.random() * symbols.length)] : p5MixedNumberObj.mode;

    let firstWhole, firstDenominator, firstNumerator, firstImproperNumerator;
    let secondWhole, secondDenominator, secondNumerator, secondImproperNumerator;
    let trueNumerator, trueDenominator;

    do {
        firstWhole = parseInt(Math.random() * 5) + 1;
        firstDenominator = denominators[parseInt(Math.random() * denominators.length)];
        firstNumerator = parseInt(Math.random() * (firstDenominator - 1)) + 1;
        firstImproperNumerator = firstWhole * firstDenominator + firstNumerator;

        secondWhole = parseInt(Math.random() * 5) + 1;
        secondDenominator = denominators[parseInt(Math.random() * denominators.length)];
        secondNumerator = parseInt(Math.random() * (secondDenominator - 1)) + 1;
        secondImproperNumerator = secondWhole * secondDenominator + secondNumerator;

        if (symbol === "+") {
            trueNumerator = firstImproperNumerator * secondDenominator + secondImproperNumerator * firstDenominator;
            trueDenominator = firstDenominator * secondDenominator;
        } else if (symbol === "-") {
            trueNumerator = firstImproperNumerator * secondDenominator - secondImproperNumerator * firstDenominator;
            trueDenominator = firstDenominator * secondDenominator;
        } else if (symbol === "×") {
            trueNumerator = firstImproperNumerator * secondImproperNumerator;
            trueDenominator = firstDenominator * secondDenominator;
        } else {
            trueNumerator = firstImproperNumerator * secondDenominator;
            trueDenominator = firstDenominator * secondImproperNumerator;
        }
    } while (trueNumerator < 0);

    p5MixedNumberObj.firstWhole = firstWhole;
    p5MixedNumberObj.firstNumerator = firstNumerator;
    p5MixedNumberObj.firstDenominator = firstDenominator;
    p5MixedNumberObj.secondWhole = secondWhole;
    p5MixedNumberObj.secondNumerator = secondNumerator;
    p5MixedNumberObj.secondDenominator = secondDenominator;
    p5MixedNumberObj.symbol = symbol;
    p5MixedNumberObj.trueNumerator = trueNumerator;
    p5MixedNumberObj.trueDenominator = trueDenominator;

    $('#firstMixedWhole').text(firstWhole);
    $('#firstMixedNumerator').text(firstNumerator);
    $('#firstMixedDenominator').text(firstDenominator);
    $('#secondMixedWhole').text(secondWhole);
    $('#secondMixedNumerator').text(secondNumerator);
    $('#secondMixedDenominator').text(secondDenominator);
    $('#mixedSymbol').text(symbol);
    $('#mixedAnswerWhole').val('');
    $('#mixedAnswerNumerator').val('');
    $('#mixedAnswerDenominator').val('');
}

bindModePicker('mixedNumberModePicker', p5MixedNumberObj, addSuggestMixedNumberValue);

addSuggestMixedNumberValue();
