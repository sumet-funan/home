var p5WordProblemObj = {
    numRows: 1,
    numRowsHistory: 1,
    expected: 0,
    isDecimal: false,
    text: '',
}

var wordProblemP5Names = ['สมชาย', 'สมหญิง', 'มานี', 'มานะ', 'ครูใหญ่', 'แม่ค้า'];
var wordProblemP5Items = ['กระเป๋า', 'รองเท้า', 'เสื้อ', 'หนังสือ', 'ของเล่น', 'นาฬิกา'];

function pickWordProblemP5(arr) {
    return arr[parseInt(Math.random() * arr.length)];
}

function generateMoneyAddScenario() {
    let name = pickWordProblemP5(wordProblemP5Names);
    let item1 = pickWordProblemP5(wordProblemP5Items);
    let item2 = pickWordProblemP5(wordProblemP5Items);
    let price1Tenths = parseInt(Math.random() * 990) + 10;
    let price2Tenths = parseInt(Math.random() * 990) + 10;
    let price1 = (price1Tenths / 10).toFixed(1);
    let price2 = (price2Tenths / 10).toFixed(1);
    let expected = ((price1Tenths + price2Tenths) / 10).toFixed(1);
    let text = `${name}ซื้อ${item1}ราคา ${price1} บาท และซื้อ${item2}ราคา ${price2} บาท ${name}ต้องจ่ายเงินทั้งหมดกี่บาท`;
    return { text, expected: +expected, isDecimal: true };
}

function generateMoneyChangeScenario() {
    let name = pickWordProblemP5(wordProblemP5Names);
    let item = pickWordProblemP5(wordProblemP5Items);
    let priceTenths = parseInt(Math.random() * 490) + 10;
    let extraTenths = parseInt(Math.random() * 500) + 10;
    let moneyTenths = priceTenths + extraTenths;
    let price = (priceTenths / 10).toFixed(1);
    let money = (moneyTenths / 10).toFixed(1);
    let expected = (extraTenths / 10).toFixed(1);
    let text = `${name}มีเงิน ${money} บาท ซื้อ${item}ราคา ${price} บาท ${name}จะเหลือเงินกี่บาท`;
    return { text, expected: +expected, isDecimal: true };
}

function generatePercentDiscountScenario() {
    let item = pickWordProblemP5(wordProblemP5Items);
    let percentOptions = [5, 10, 20, 25, 50];
    let percent = pickWordProblemP5(percentOptions);
    let divisor = 100 / percent;
    let multiplier = parseInt(Math.random() * 20) + 2;
    let price = divisor * multiplier;
    let discount = price * percent / 100;
    let expected = price - discount;
    let text = `${item}ราคา ${price} บาท ลดราคาร้อยละ ${percent} ราคาหลังลดเหลือกี่บาท`;
    return { text, expected, isDecimal: false };
}

function generatePercentPortionScenario() {
    let percentOptions = [5, 10, 20, 25, 50];
    let percent = pickWordProblemP5(percentOptions);
    let divisor = 100 / percent;
    let multiplier = parseInt(Math.random() * 20) + 1;
    let total = divisor * multiplier;
    let expected = multiplier;
    let text = `ในโรงเรียนมีนักเรียน ${total} คน เป็นนักเรียนหญิงร้อยละ ${percent} มีนักเรียนหญิงกี่คน`;
    return { text, expected, isDecimal: false };
}

function generateAreaScenario() {
    let width = parseInt(Math.random() * 15) + 3;
    let length = parseInt(Math.random() * 15) + 3;
    let expected = width * length;
    let text = `สวนรูปสี่เหลี่ยมผืนผ้ากว้าง ${width} เมตร ยาว ${length} เมตร มีพื้นที่กี่ตารางเมตร`;
    return { text, expected, isDecimal: false };
}

function generateVolumeScenario() {
    let w = parseInt(Math.random() * 10) + 2;
    let l = parseInt(Math.random() * 10) + 2;
    let h = parseInt(Math.random() * 10) + 2;
    let expected = w * l * h;
    let text = `กล่องใบหนึ่งกว้าง ${w} ซม. ยาว ${l} ซม. สูง ${h} ซม. มีปริมาตรกี่ลูกบาศก์เซนติเมตร`;
    return { text, expected, isDecimal: false };
}

function generateAverageScenario() {
    let name = pickWordProblemP5(wordProblemP5Names);
    let n = 3 + parseInt(Math.random() * 2);
    let avg = parseInt(Math.random() * 41) + 10;
    let scores, last;

    do {
        scores = [];
        let sum = 0;
        for (let i = 0; i < n - 1; i++) {
            let offset = parseInt(Math.random() * 21) - 10;
            let value = avg + offset;
            if (value < 1) value = 1;
            scores.push(value);
            sum += value;
        }
        last = avg * n - sum;
    } while (last < 1);

    scores.push(last);

    let text = `${name}สอบ ${n} วิชา ได้คะแนน ${scores.join(', ')} คะแนน เฉลี่ยแล้วได้กี่คะแนน`;
    return { text, expected: avg, isDecimal: false };
}

function validateWordProblemP5Result() {
    if (focusFirstEmptyField(['wordProblemP5AnswerNumber'])) {
        return;
    }

    let answer = +$('#wordProblemP5AnswerNumber').val();
    let expected = p5WordProblemObj.expected;
    let isCorrect = p5WordProblemObj.isDecimal
        ? Math.round(answer * 10) === Math.round(expected * 10)
        : answer === expected;
    let textColor = "green";

    showFeedback('feedbackWordProblemP5', isCorrect);

    let expr = `${p5WordProblemObj.text} = ${answer}`;

    if (isCorrect) {
        addResultWordProblemP5ToItemList({ expr })
        $('#contentWordProblemP5Result').show();
        addSuggestWordProblemP5Value();
    }
    else {
        textColor = "red";
    }

    $('#contentWordProblemP5History').show();
    addResultWordProblemP5ToHistoryList({ expr, color: textColor })
}

function addResultWordProblemP5ToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p5WordProblemObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultWordProblemP5List').append(elementItem)

    p5WordProblemObj.numRows++;
}

function addResultWordProblemP5ToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p5WordProblemObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyWordProblemP5List').append(elementItem)

    recordHistoryAttempt('p5wordproblem', isCorrect, 'historyWordProblemP5List');

    if (isCorrect) {
        p5WordProblemObj.numRowsHistory++;
    }
}

function addSuggestWordProblemP5Value() {
    let generators = [
        generateMoneyAddScenario, generateMoneyChangeScenario,
        generatePercentDiscountScenario, generatePercentPortionScenario,
        generateAreaScenario, generateVolumeScenario, generateAverageScenario
    ];
    let generator = generators[parseInt(Math.random() * generators.length)];
    let scenario = generator();

    p5WordProblemObj.text = scenario.text;
    p5WordProblemObj.expected = scenario.expected;
    p5WordProblemObj.isDecimal = scenario.isDecimal;

    $('#wordProblemP5Text').text(scenario.text);
    $('#wordProblemP5AnswerNumber').val('');
}

addSuggestWordProblemP5Value();
