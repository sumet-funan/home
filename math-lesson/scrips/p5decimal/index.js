var p5DecimalObj = {
    numRows: 1,
    numRowsHistory: 1,
    symbol: "+",
    mode: "all",
}

function validateDecimalResult() {
    if (focusFirstEmptyField(['firstDecimalNumber', 'secondDecimalNumber', 'resultDecimalNumber'])) {
        return;
    }

    let firstNumber = $('#firstDecimalNumber').val();
    let secondNumber = $('#secondDecimalNumber').val();
    let resultNumber = $('#resultDecimalNumber').val();
    let symbol = p5DecimalObj.symbol;

    let firstTenths = Math.round(+firstNumber * 10);
    let secondTenths = Math.round(+secondNumber * 10);
    let resultTenths = Math.round(+resultNumber * 10);

    let expectedTenths;
    if (symbol === "+") {
        expectedTenths = firstTenths + secondTenths;
    } else if (symbol === "-") {
        expectedTenths = firstTenths - secondTenths;
    } else if (symbol === "*") {
        expectedTenths = Math.round(firstTenths * secondTenths / 10);
    } else {
        expectedTenths = Math.round(firstTenths * 10 / secondTenths);
    }

    let isCorrect = resultTenths === expectedTenths;
    let textColor = "green";

    showFeedback('feedbackDecimal', isCorrect);

    if (isCorrect) {
        addResultDecimalToItemList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber })
        $('#contentDecimalResult').show();
        addSuggestDecimalValue();
    }
    else {
        textColor = "red"
    }

    $('#contentDecimalHistory').show();
    addResultDecimalToHistoryList({ "symbol": symbol, "firstNumber": firstNumber, "secondNumber": secondNumber, "resultNumber": resultNumber, "color": textColor })
}

function addResultDecimalToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5DecimalObj.numRows}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#resultDecimalList').append(elementItem)

    clearDecimalValue()

    p5DecimalObj.numRows++;
}

function addResultDecimalToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5DecimalObj.numRowsHistory}</span>
            <span class="answer-expr">${item.firstNumber} ${item.symbol} ${item.secondNumber} = ${item.resultNumber}</span>
        </div>`
    $('#historyDecimalList').append(elementItem)

    if (isCorrect) {
        p5DecimalObj.numRowsHistory++;
    }
}

function clearDecimalValue() {
    $('#firstDecimalNumber').val('');
    $('#secondDecimalNumber').val('');
    $('#resultDecimalNumber').val('');
}

function addSuggestDecimalValue() {
    let symbols = ["+", "-", "*", "/"];
    let symbol = p5DecimalObj.mode === "all" ? symbols[parseInt(Math.random() * symbols.length)] : p5DecimalObj.mode;
    p5DecimalObj.symbol = symbol;

    if (symbol === "/") {
        let divisor = parseInt(Math.random() * 8) + 2;
        let quotientTenths = parseInt(Math.random() * 490) + 10;
        let dividendTenths = quotientTenths * divisor;
        $('#firstDecimalNumber').val((dividendTenths / 10).toFixed(1));
        $('#secondDecimalNumber').val(divisor);
        $('#decimalSymbol').text('÷');
        return;
    }

    let firstTenths = parseInt(Math.random() * 490) + 10;
    $('#firstDecimalNumber').val((firstTenths / 10).toFixed(1));

    if (symbol === "*") {
        let multiplier = parseInt(Math.random() * 8) + 2;
        $('#secondDecimalNumber').val(multiplier);
        $('#decimalSymbol').text('×');
    } else if (symbol === "-") {
        let secondTenths = parseInt(Math.random() * (firstTenths + 1));
        $('#secondDecimalNumber').val((secondTenths / 10).toFixed(1));
        $('#decimalSymbol').text('-');
    } else {
        let secondTenths = parseInt(Math.random() * 490) + 10;
        $('#secondDecimalNumber').val((secondTenths / 10).toFixed(1));
        $('#decimalSymbol').text('+');
    }
}

bindModePicker('decimalModePicker', p5DecimalObj, addSuggestDecimalValue);

addSuggestDecimalValue();
