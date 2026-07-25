var p5MixedNumberObj = {
    numRows: 1,
    numRowsHistory: 1,
    numerator: 11,
    denominator: 4,
}

function validateMixedNumberResult() {
    if (focusFirstEmptyField(['mixedWholeNumber', 'mixedFractionNumerator'])) {
        return;
    }

    let whole = +$('#mixedWholeNumber').val();
    let numerator = +$('#mixedFractionNumerator').val();
    let expectedWhole = Math.floor(p5MixedNumberObj.numerator / p5MixedNumberObj.denominator);
    let expectedNumerator = p5MixedNumberObj.numerator % p5MixedNumberObj.denominator;
    let isCorrect = whole === expectedWhole && numerator === expectedNumerator;
    let textColor = "green";

    showFeedback('feedbackMixedNumber', isCorrect);

    let expr = `${p5MixedNumberObj.numerator}/${p5MixedNumberObj.denominator} = ${whole} ${numerator}/${p5MixedNumberObj.denominator}`;

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

    if (isCorrect) {
        p5MixedNumberObj.numRowsHistory++;
    }
}

function addSuggestMixedNumberValue() {
    let denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    let denominator = denominators[parseInt(Math.random() * denominators.length)];
    let whole = parseInt(Math.random() * 6) + 1;
    let remainder = parseInt(Math.random() * denominator);
    let numerator = whole * denominator + remainder;

    p5MixedNumberObj.numerator = numerator;
    p5MixedNumberObj.denominator = denominator;

    $('#mixedNumeratorDisplay').text(numerator);
    $('#mixedDenominatorDisplay').text(denominator);
    $('#mixedFractionDenominator').text(denominator);
    $('#mixedWholeNumber').val('');
    $('#mixedFractionNumerator').val('');
}

addSuggestMixedNumberValue();
