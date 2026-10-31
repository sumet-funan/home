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

    let expected;
    if (symbol === "+") {
        expected = +firstNumber + +secondNumber;
    } else if (symbol === "-") {
        expected = firstNumber - secondNumber;
    } else if (symbol === "*") {
        expected = firstNumber * secondNumber;
    } else {
        expected = firstNumber / secondNumber;
    }

    let isCorrect = isSameNumber(+resultNumber, expected);
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

    recordHistoryAttempt('p5decimal', isCorrect, 'historyDecimalList');

    if (isCorrect) {
        p5DecimalObj.numRowsHistory++;
    }
}

function clearDecimalValue() {
    $('#firstDecimalNumber').val('');
    $('#secondDecimalNumber').val('');
    $('#resultDecimalNumber').val('');
}

// Money in a word problem stops at two places, since nobody pays part of a satang.
function suggestDecimalNumbers(symbol) {
    let isWord = p5DecimalObj.format === 'word';
    let places = isWord ? 2 : randomInt(1, 3);
    let scale = Math.pow(10, places);
    let scaled = randomInt(scale, 50 * scale);

    if (symbol === "/") {
        let divisor = randomInt(2, 9);
        return { first: (scaled * divisor / scale).toFixed(places), second: divisor };
    }

    if (symbol === "*") {
        let firstPlaces = isWord ? 2 : randomInt(1, 2);
        let wholeMultiplier = isWord || Math.random() < 0.5;
        return {
            first: (scaled / scale).toFixed(firstPlaces),
            second: wholeMultiplier ? randomInt(2, 9) : (randomInt(1, 9) / 10).toFixed(1),
        };
    }

    return {
        first: (scaled / scale).toFixed(places),
        second: ((symbol === "-" ? randomInt(0, scaled) : randomInt(scale, 50 * scale)) / scale).toFixed(places),
    };
}

function addSuggestDecimalValue() {
    let symbols = ["+", "-", "*", "/"];
    let symbol = p5DecimalObj.mode === "all" ? pickOne(symbols) : p5DecimalObj.mode;
    let numbers = suggestDecimalNumbers(symbol);

    p5DecimalObj.symbol = symbol;

    $('#firstDecimalNumber').val(numbers.first);
    $('#secondDecimalNumber').val(numbers.second);
    $('#resultDecimalNumber').val('');
    $('#decimalSymbol').text({ "+": '+', "-": '-', "*": '×', "/": '÷' }[symbol]);

    if (p5DecimalObj.format === 'word') {
        $('#decimalWordText').text(buildDecimalWordText(numbers.first, numbers.second, symbol));
    }
}

bindModePicker('decimalModePicker', p5DecimalObj, addSuggestDecimalValue);
bindFormatPicker('decimalFormatPicker', 'decimalNumberDisplay', 'decimalWordText', p5DecimalObj, addSuggestDecimalValue);

addSuggestDecimalValue();
