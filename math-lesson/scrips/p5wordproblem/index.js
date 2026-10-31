var p5WordProblemObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "fraction",
    expected: 0,
    text: '',
}

var wordProblemP5Names = ['สมชาย', 'สมหญิง', 'มานี', 'มานะ'];
var wordProblemP5Items = ['กระเป๋า', 'รองเท้า', 'เสื้อ', 'หนังสือ', 'ของเล่น', 'นาฬิกา'];

var wordProblemP5Builders = {
    // every amount is chosen so that each fraction of it comes out whole
    fraction: [
        function (name) {
            let first = pickOne([[1, 2], [1, 3], [1, 4], [2, 5], [3, 10]]);
            let second = pickOne([[1, 4], [1, 5], [1, 10]]);
            let total = first[1] * second[1] * randomInt(1, 4) * 2;
            let given = total * first[0] / first[1], gained = total * second[0] / second[1];
            return { text: `${name}มีส้ม ${total} ผล ให้พี่ ${first[0]}/${first[1]} ของทั้งหมด และให้น้อง ${second[0]}/${second[1]} ของทั้งหมด ${name}เหลือส้มกี่ผล`, expected: total - given - gained };
        },
        function (name) {
            let first = pickOne([[1, 2], [1, 3], [1, 4], [1, 5]]);
            let second = pickOne([[1, 2], [1, 3], [1, 4]]);
            let rest = second[1] * (first[1] - first[0]) * randomInt(1, 4) * 10;
            let total = rest * first[1] / (first[1] - first[0]);
            let left = rest - rest * second[0] / second[1];
            return { text: `${name}มีเงิน ${total} บาท ใช้ไป ${first[0]}/${first[1]} ของเงินทั้งหมด แล้วใช้อีก ${second[0]}/${second[1]} ของเงินที่เหลือ ${name}เหลือเงินกี่บาท`, expected: left };
        },
    ],
    decimal: [
        function (name) {
            let first = randomInt(40, 1000) * 25, second = randomInt(40, 1000) * 25;
            let paid = (Math.floor((first + second) / 10000) + 1) * 10000;
            return { text: `${name}ซื้อ${pickOne(wordProblemP5Items)}ราคา ${(first / 100).toFixed(2)} บาท และซื้อ${pickOne(wordProblemP5Items)}ราคา ${(second / 100).toFixed(2)} บาท จ่ายเงิน ${paid / 100} บาท จะได้เงินทอนกี่บาท`, expected: (paid - first - second) / 100 };
        },
        function (name) {
            let count = randomInt(2, 6), price = randomInt(40, 400) * 25;
            let paid = (Math.floor(count * price / 10000) + 1) * 10000;
            return { text: `${name}ซื้อ${pickOne(wordProblemP5Items)} ${count} ชิ้น ชิ้นละ ${(price / 100).toFixed(2)} บาท จ่ายเงิน ${paid / 100} บาท จะได้เงินทอนกี่บาท`, expected: (paid - count * price) / 100 };
        },
        function (name) {
            let pieces = randomInt(3, 8), each = randomInt(10, 90) * 5, used = randomInt(2, pieces - 1);
            return { text: `${name}มีเชือกยาว ${(pieces * each / 100).toFixed(2)} เมตร ตัดเป็น ${pieces} เส้น ยาวเท่าๆ กัน แล้วใช้ไป ${used} เส้น ใช้เชือกไปกี่เมตร`, expected: used * each / 100 };
        },
    ],
    percent: [
        function () {
            let percent = pickOne([5, 10, 20, 25, 50]), price = 100 / percent * randomInt(2, 21) * 10;
            return { text: `${pickOne(wordProblemP5Items)}ราคา ${price} บาท ลดราคาร้อยละ ${percent} ราคาหลังลดเหลือกี่บาท`, expected: price - price * percent / 100 };
        },
        function () {
            let percent = pickOne([5, 10, 20, 25, 50]), total = 100 / percent * randomInt(1, 20);
            return { text: `ในโรงเรียนมีนักเรียน ${total} คน เป็นนักเรียนหญิงร้อยละ ${percent} มีนักเรียนหญิงกี่คน`, expected: total * percent / 100 };
        },
        function (name) {
            let percent = pickOne([5, 10, 20, 25, 50]), cost = 100 / percent * randomInt(2, 21) * 10;
            return { text: `${name}ซื้อ${pickOne(wordProblemP5Items)}มาราคา ${cost} บาท ขายได้กำไรร้อยละ ${percent} ${name}ขายไปกี่บาท`, expected: cost + cost * percent / 100 };
        },
    ],
    volume: [
        function () {
            let width = randomInt(2, 11), length = randomInt(2, 11), height = randomInt(2, 11);
            return { text: `กล่องใบหนึ่งกว้าง ${width} ซม. ยาว ${length} ซม. สูง ${height} ซม. มีปริมาตรกี่ลูกบาศก์เซนติเมตร`, expected: width * length * height };
        },
        function () {
            let width = randomInt(2, 6) * 10, length = randomInt(2, 6) * 10, height = randomInt(2, 6) * 10;
            let litres = width * length * height / 1000, filled = randomInt(1, litres - 1);
            return { text: `ถังทรงสี่เหลี่ยมมุมฉากกว้าง ${width} ซม. ยาว ${length} ซม. สูง ${height} ซม. มีน้ำอยู่ ${filled} ลิตร ต้องเติมน้ำอีกกี่ลิตรจึงจะเต็มถัง`, expected: litres - filled };
        },
    ],
};

function validateWordProblemP5Result() {
    if (focusFirstEmptyField(['wordProblemP5AnswerNumber'])) {
        return;
    }

    let answer = +$('#wordProblemP5AnswerNumber').val();
    let isCorrect = isSameNumber(answer, p5WordProblemObj.expected);
    let expr = `${p5WordProblemObj.text} = ${answer}`;

    showFeedback('feedbackWordProblemP5', isCorrect);

    if (isCorrect) {
        addResultWordProblemP5ToItemList({ expr })
        $('#contentWordProblemP5Result').show();
        addSuggestWordProblemP5Value();
    }

    $('#contentWordProblemP5History').show();
    addResultWordProblemP5ToHistoryList({ expr, color: isCorrect ? "green" : "red" })
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
    let question = pickOne(wordProblemP5Builders[p5WordProblemObj.mode])(pickOne(wordProblemP5Names));

    p5WordProblemObj.text = question.text;
    p5WordProblemObj.expected = question.expected;

    $('#wordProblemP5Text').text(question.text);
    $('#wordProblemP5AnswerNumber').val('');
}

bindModePicker('wordProblemP5ModePicker', p5WordProblemObj, addSuggestWordProblemP5Value);

addSuggestWordProblemP5Value();
