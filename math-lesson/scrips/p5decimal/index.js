var p5DecimalObj = {
    numRows: 1,
    numRowsHistory: 1,
    symbol: "+",
    mode: "all",
    format: "number",
}

var wordProblemDecimalNames = ['สมชาย', 'สมหญิง', 'มานี', 'มานะ'];
var wordProblemDecimalItems = ['กระเป๋า', 'รองเท้า', 'เสื้อ', 'หนังสือ', 'ของเล่น', 'นาฬิกา'];

function buildDecimalWordText(firstNumber, secondNumber, symbol) {
    let name = wordProblemDecimalNames[parseInt(Math.random() * wordProblemDecimalNames.length)];
    let item = wordProblemDecimalItems[parseInt(Math.random() * wordProblemDecimalItems.length)];
    let item2 = wordProblemDecimalItems[parseInt(Math.random() * wordProblemDecimalItems.length)];

    if (symbol === "+") {
        return `${name}ซื้อ${item}ราคา ${firstNumber} บาท และซื้อ${item2}ราคา ${secondNumber} บาท ${name}ต้องจ่ายเงินทั้งหมดกี่บาท`;
    } else if (symbol === "-") {
        return `${name}มีเงิน ${firstNumber} บาท ซื้อ${item}ราคา ${secondNumber} บาท ${name}จะเหลือเงินกี่บาท`;
    } else if (symbol === "*") {
        return `${name}ซื้อ${item}ชิ้นละ ${firstNumber} บาท จำนวน ${secondNumber} ชิ้น ${name}ต้องจ่ายเงินทั้งหมดกี่บาท`;
    } else {
        return `${name}มีเงิน ${firstNumber} บาท แบ่งซื้อ${item} ${secondNumber} ชิ้นเท่าๆกัน แต่ละชิ้นราคากี่บาท`;
    }
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

    let firstNumber, secondNumber;

    if (symbol === "/") {
        let divisor = parseInt(Math.random() * 8) + 2;
        let quotientTenths = parseInt(Math.random() * 490) + 10;
        let dividendTenths = quotientTenths * divisor;
        firstNumber = (dividendTenths / 10).toFixed(1);
        secondNumber = divisor;
        $('#firstDecimalNumber').val(firstNumber);
        $('#secondDecimalNumber').val(secondNumber);
        $('#decimalSymbol').text('÷');
    } else {
        let firstTenths = parseInt(Math.random() * 490) + 10;
        firstNumber = (firstTenths / 10).toFixed(1);
        $('#firstDecimalNumber').val(firstNumber);

        if (symbol === "*") {
            let multiplier = parseInt(Math.random() * 8) + 2;
            secondNumber = multiplier;
            $('#secondDecimalNumber').val(secondNumber);
            $('#decimalSymbol').text('×');
        } else if (symbol === "-") {
            let secondTenths = parseInt(Math.random() * (firstTenths + 1));
            secondNumber = (secondTenths / 10).toFixed(1);
            $('#secondDecimalNumber').val(secondNumber);
            $('#decimalSymbol').text('-');
        } else {
            let secondTenths = parseInt(Math.random() * 490) + 10;
            secondNumber = (secondTenths / 10).toFixed(1);
            $('#secondDecimalNumber').val(secondNumber);
            $('#decimalSymbol').text('+');
        }
    }

    if (p5DecimalObj.format === 'word') {
        $('#decimalWordText').text(buildDecimalWordText(firstNumber, secondNumber, symbol));
    }
}

bindModePicker('decimalModePicker', p5DecimalObj, addSuggestDecimalValue);
bindFormatPicker('decimalFormatPicker', 'decimalNumberDisplay', 'decimalWordText', p5DecimalObj, addSuggestDecimalValue);

addSuggestDecimalValue();
