// ป.3, following ตัวชี้วัดและสาระการเรียนรู้แกนกลาง คณิตศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560).
// The builders that take a limit are shared with the grades above.

const THAI_PLACE_NAMES = ['หน่วย', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

function placeValueQuestion(number) {
    let digits = String(number).split('').map(Number);
    let filled = digits
        .map(function (digit, index) { return { digit: digit, place: digits.length - 1 - index }; })
        .filter(function (item) { return item.digit; });
    let chosen = pickOne(filled);

    return {
        text: `ในจำนวน ${commaNumber(number)} เลขโดด ${chosen.digit} ในหลัก${THAI_PLACE_NAMES[chosen.place]} มีค่าเท่าใด`,
        answer: chosen.digit * Math.pow(10, chosen.place),
    };
}

function expandedNumberQuestion(number) {
    let digits = String(number).split('').map(Number);
    let parts = digits
        .map(function (digit, index) { return digit * Math.pow(10, digits.length - 1 - index); })
        .filter(Boolean)
        .map(commaNumber);

    return { text: `${parts.join(' + ')} = □ จำนวนใน □ คือเท่าใด`, answer: number };
}

function numberCompareQuestion(smallest, largest) {
    let first = randomInt(smallest, largest);
    let spread = Math.ceil(largest / 100);
    let second = Math.random() < 0.15 ? first : Math.min(largest, Math.max(smallest, first + randomInt(-spread, spread)));

    return compareQuestion(`${commaNumber(first)} □ ${commaNumber(second)} เครื่องหมายใดเติมใน □ ได้ถูกต้อง`, first, second);
}

function numberOrderQuestion(largest) {
    let question = orderQuestion(largest);
    return choiceQuestion(question.text, question.answer, question.wrong);
}

function sumQuestion(largest) {
    let first = randomInt(Math.floor(largest / 100), largest - 1);
    let second = randomInt(1, largest - first);
    return { text: `${commaNumber(first)} + ${commaNumber(second)} = □ จำนวนใน □ คือเท่าใด`, answer: first + second };
}

function differenceQuestion(largest) {
    let first = randomInt(Math.floor(largest / 50), largest);
    let second = randomInt(1, first);
    return { text: `${commaNumber(first)} − ${commaNumber(second)} = □ จำนวนใน □ คือเท่าใด`, answer: first - second };
}

function productQuestion(firstMin, firstMax, secondMin, secondMax) {
    let first = randomInt(firstMin, firstMax), second = randomInt(secondMin, secondMax);
    return { text: `${commaNumber(first)} × ${commaNumber(second)} = □ จำนวนใน □ คือเท่าใด`, answer: first * second };
}

function exactDivisionQuestion(divisorMin, divisorMax, dividendMax) {
    let divisor = randomInt(divisorMin, divisorMax);
    let quotient = randomInt(Math.max(2, Math.ceil(dividendMax / divisor / 20)), Math.floor(dividendMax / divisor));
    return { text: `${commaNumber(divisor * quotient)} ÷ ${commaNumber(divisor)} = □ จำนวนใน □ คือเท่าใด`, answer: quotient };
}

function remainderDivisionQuestion(divisorMin, divisorMax, dividendMax) {
    let divisor = randomInt(divisorMin, divisorMax);
    let quotient = randomInt(Math.max(2, Math.ceil(dividendMax / divisor / 20)), Math.floor((dividendMax - divisor) / divisor));
    let remainder = randomInt(1, divisor - 1);

    return {
        text: `${commaNumber(divisor * quotient + remainder)} ÷ ${commaNumber(divisor)} ได้ผลหารและเศษเท่าใด`,
        fields: [{ label: 'ผลหาร', value: quotient }, { label: 'เศษ', value: remainder }],
    };
}

function missingAddendQuestion(largest) {
    let first = randomInt(Math.floor(largest / 100), largest - 1);
    let second = randomInt(1, largest - first);
    let total = commaNumber(first + second);

    if (Math.random() < 0.5) {
        return { text: `□ + ${commaNumber(second)} = ${total} จำนวนใน □ คือเท่าใด`, answer: first };
    }
    return { text: `${commaNumber(first)} − □ = ${commaNumber(first - Math.min(first, second))} จำนวนใน □ คือเท่าใด`, answer: Math.min(first, second) };
}

function missingFactorQuestion(firstMin, firstMax, secondMin, secondMax) {
    let first = randomInt(firstMin, firstMax), second = randomInt(secondMin, secondMax);
    return { text: `□ × ${commaNumber(second)} = ${commaNumber(first * second)} จำนวนใน □ คือเท่าใด`, answer: first };
}

function missingDivisionQuestion(divisorMin, divisorMax, quotientMin, quotientMax) {
    let divisor = randomInt(divisorMin, divisorMax), quotient = randomInt(quotientMin, quotientMax);

    if (Math.random() < 0.5) {
        return { text: `□ ÷ ${commaNumber(divisor)} = ${commaNumber(quotient)} จำนวนใน □ คือเท่าใด`, answer: divisor * quotient };
    }
    return { text: `${commaNumber(divisor * quotient)} ÷ □ = ${commaNumber(quotient)} จำนวนใน □ คือเท่าใด`, answer: divisor };
}

// Multiples and steps are chosen so that every line of working stays a whole number.
function mixedSumQuestion(scale) {
    let kind = randomInt(0, 3);
    let a, b, c;

    if (kind === 0) {
        c = randomInt(2, 50) * scale;
        b = randomInt(2, 50) * scale;
        a = c + randomInt(2, 50) * scale;
        return { text: `${commaNumber(a)} − ${commaNumber(c)} + ${commaNumber(b)} = □`, answer: a - c + b };
    }
    if (kind === 1) {
        a = randomInt(2, 90) * scale;
        b = randomInt(2, 9);
        c = randomInt(2, 90) * scale;
        return { text: `${commaNumber(a)} × ${b} + ${commaNumber(c)} = □`, answer: a * b + c };
    }
    if (kind === 2) {
        b = randomInt(2, 9);
        c = randomInt(2, 90) * b * scale;
        a = c / b + randomInt(2, 90) * scale;
        return { text: `${commaNumber(a)} − ${commaNumber(c)} ÷ ${b} = □`, answer: a - c / b };
    }

    a = randomInt(2, 40) * scale;
    b = randomInt(2, 40) * scale;
    c = randomInt(2, 9);
    return { text: `(${commaNumber(a)} + ${commaNumber(b)}) × ${c} = □`, answer: (a + b) * c };
}

function p3WordProblem() {
    let name = pickOne(wordNames);
    let templates = [
        function () {
            let count = randomInt(3, 9), each = randomInt(12, 95), extra = randomInt(10, 500);
            return { text: `${name}มีเงิน ${commaNumber(count * each + extra)} บาท ซื้อสมุด ${count} เล่ม เล่มละ ${each} บาท เหลือเงินกี่บาท`, answer: extra };
        },
        function () {
            let boxes = randomInt(3, 12), each = randomInt(4, 9) * 10, children = pickOne([2, 4, 5, 8, 10]);
            return { text: `มีดินสอ ${boxes} กล่อง กล่องละ ${each} แท่ง แบ่งให้นักเรียน ${children} ห้องเท่า ๆ กัน ได้ห้องละกี่แท่ง`, answer: boxes * each / children };
        },
        function () {
            let boys = randomInt(1200, 4800), girls = randomInt(1200, 4800), left = randomInt(100, 900);
            return { text: `งานวันเด็กมีเด็กชาย ${commaNumber(boys)} คน เด็กหญิง ${commaNumber(girls)} คน กลับบ้านไปแล้ว ${left} คน ยังเหลือเด็กในงานกี่คน`, answer: boys + girls - left };
        },
        function () {
            let first = randomInt(2100, 8900), more = randomInt(150, 980);
            return { text: `ร้านขายส้มวันแรกได้ ${commaNumber(first)} ผล วันที่สองขายได้มากกว่าวันแรก ${more} ผล สองวันขายส้มได้รวมกี่ผล`, answer: first + first + more };
        },
    ];

    return pickOne(templates)();
}

function fractionBarFigure(numerator, denominator) {
    let width = 280 / denominator;
    let cells = Array.from({ length: denominator }, function (unused, index) {
        return `<rect class="${index < numerator ? 'shape-fill' : 'shape-soft'}" x="${10 + index * width}" y="10" width="${width}" height="50" stroke="var(--card-bg)" stroke-width="2"/>`;
    }).join('');

    return `<svg viewBox="0 0 300 70" width="300" height="70" role="img" aria-label="แถบแบ่ง ${denominator} ส่วนเท่า ๆ กัน ระบายสี ${numerator} ส่วน">${cells}</svg>`;
}

function p3FractionPicture() {
    let denominator = randomInt(2, 10), numerator = randomInt(1, denominator);

    return {
        text: 'ส่วนที่ระบายสีคิดเป็นเศษส่วนเท่าใดของทั้งหมด',
        figure: fractionBarFigure(numerator, denominator),
        fields: [{ label: 'ตัวเศษ', value: numerator }, { label: 'ตัวส่วน', value: denominator }],
    };
}

function p3FractionCompare() {
    let numerator = randomInt(1, 6);
    let first = randomInt(Math.max(2, numerator), 12);
    let second = Math.random() < 0.15 ? first : randomInt(Math.max(2, numerator), 12);

    // with the tops equal, the fraction with fewer parts is the larger one
    return compareQuestion(`${numerator}/${first} □ ${numerator}/${second} เครื่องหมายใดเติมใน □ ได้ถูกต้อง`, second, first);
}

function p3FractionSum() {
    let denominator = randomInt(3, 12), first = randomInt(1, denominator - 1), second = randomInt(1, denominator - first);
    return Object.assign({ text: `${first}/${denominator} + ${second}/${denominator} เท่ากับเท่าใด` }, fractionFields(first + second, denominator));
}

function p3FractionDifference() {
    let denominator = randomInt(3, 12), first = randomInt(2, denominator), second = randomInt(1, first - 1);
    return Object.assign({ text: `${first}/${denominator} − ${second}/${denominator} เท่ากับเท่าใด` }, fractionFields(first - second, denominator));
}

function p3FractionWord() {
    let denominator = randomInt(4, 12);

    if (Math.random() < 0.5) {
        let first = randomInt(1, denominator - 1), second = randomInt(1, denominator - first);
        return Object.assign({ text: `แม่แบ่งเค้กให้พี่ ${first}/${denominator} ของก้อน และให้น้อง ${second}/${denominator} ของก้อน แบ่งให้ไปทั้งหมดกี่ส่วนของก้อน` }, fractionFields(first + second, denominator));
    }

    let first = randomInt(2, denominator - 1), second = randomInt(1, first - 1);
    return Object.assign({ text: `มีน้ำ ${first}/${denominator} ลิตร ใช้ไป ${second}/${denominator} ลิตร เหลือน้ำกี่ลิตร` }, fractionFields(first - second, denominator));
}

function equalStepPattern() {
    let step = pickOne([3, 4, 6, 7, 8, 9, 12, 15, 20, 25, 50, 100, 200, 500]);
    let start = randomInt(1, 40) * pickOne([1, 5, 10]);
    let terms = [0, 1, 2, 3, 4].map(function (index) { return start + step * index; });

    if (Math.random() < 0.5) {
        terms.reverse();
    }

    let missing = randomInt(1, 4);
    let answer = terms[missing];
    let shown = terms.map(function (term, index) { return index === missing ? '□' : commaNumber(term); });

    return { text: `${shown.join(', ')} จำนวนใน □ คือเท่าใด`, answer: answer };
}

const MONEY_PIECES = [
    { value: 500, name: 'ธนบัตร', unit: 'ใบ' }, { value: 100, name: 'ธนบัตร', unit: 'ใบ' },
    { value: 50, name: 'ธนบัตร', unit: 'ใบ' }, { value: 20, name: 'ธนบัตร', unit: 'ใบ' },
    { value: 10, name: 'เหรียญ', unit: 'เหรียญ' }, { value: 5, name: 'เหรียญ', unit: 'เหรียญ' },
];

function moneyCountQuestion() {
    let pieces = shuffleList(MONEY_PIECES).slice(0, 3)
        .sort(function (a, b) { return b.value - a.value; })
        .map(function (piece) { return Object.assign({ count: randomInt(1, 6) }, piece); });
    let total = pieces.reduce(function (sum, piece) { return sum + piece.value * piece.count; }, 0);
    let words = pieces.map(function (piece) { return `${piece.name} ${piece.value} บาท ${piece.count} ${piece.unit}`; });

    return { text: `${words.join(' ')} รวมเป็นเงินกี่บาท`, answer: total, unit: 'บาท' };
}

function moneyDotQuestion() {
    let baht = randomInt(2, 900), satang = pickOne([25, 50, 75]);
    return { text: `${baht} บาท ${satang} สตางค์ เขียนแบบใช้จุดได้อย่างไร`, answer: baht + satang / 100, unit: 'บาท' };
}

function moneyChangeQuestion() {
    let price = randomInt(11, 89) + pickOne([0.25, 0.5, 0.75]);
    return { text: `ซื้อขนมราคา ${price.toFixed(2)} บาท จ่ายด้วยธนบัตร 100 บาท ได้เงินทอนกี่บาท`, answer: 100 - price, unit: 'บาท' };
}

function moneyLedgerQuestion() {
    let got = randomInt(30, 90) * 10, food = randomInt(4, 14) * 5, book = randomInt(2, 12) * 10;
    let rows = [['แม่ให้เงิน', commaNumber(got), '-'], ['ค่าอาหาร', '-', food], ['ซื้อหนังสือ', '-', book]];

    return {
        text: 'จากบันทึกนี้ เหลือเงินกี่บาท',
        figure: lessonTable(['รายการ', 'รายรับ (บาท)', 'รายจ่าย (บาท)'], rows),
        answer: got - food - book,
        unit: 'บาท',
    };
}

function dotTime(hour, minute) {
    return `${hour}.${String(minute).padStart(2, '0')} น.`;
}

function p3TimeClock() {
    let hour = randomInt(6, 11), minute = randomInt(0, 11) * 5;

    return {
        text: 'ตอนเช้า นาฬิกาเรือนนี้บอกเวลาเท่าไร',
        figure: renderP2ClockSVG(hour, minute),
        fields: [{ label: 'นาฬิกา', value: hour }, { label: 'นาที', value: minute }],
    };
}

function p3TimeWrite() {
    let hour = randomInt(6, 20), minute = randomInt(1, 11) * 5;
    return choiceQuestion(`${hour} นาฬิกา ${minute} นาที เขียนแบบใช้จุดได้อย่างไร`, dotTime(hour, minute), [dotTime(hour + 1, minute), dotTime(hour, (minute + 10) % 60), dotTime(hour, (minute + 20) % 60)]);
}

function p3TimeDuration() {
    let start = randomInt(7, 14) * 60 + randomInt(0, 11) * 5;
    let length = randomInt(4, 40) * 5;
    let end = start + length;

    return {
        text: `เริ่มทำการบ้านเวลา ${dotTime(Math.floor(start / 60), start % 60)} ทำเสร็จเวลา ${dotTime(Math.floor(end / 60), end % 60)} ใช้เวลากี่ชั่วโมงกี่นาที`,
        fields: [{ label: 'ชั่วโมง', value: Math.floor(length / 60) }, { label: 'นาที', value: length % 60 }],
    };
}

function p3TimeConvert() {
    let hours = randomInt(1, 6), minutes = randomInt(1, 11) * 5;

    if (Math.random() < 0.5) {
        return { text: `${hours} ชั่วโมง ${minutes} นาที เท่ากับกี่นาที`, answer: hours * 60 + minutes, unit: 'นาที' };
    }
    return {
        text: `${hours * 60 + minutes} นาที เท่ากับกี่ชั่วโมงกี่นาที`,
        fields: [{ label: 'ชั่วโมง', value: hours }, { label: 'นาที', value: minutes }],
    };
}

function measureStep(pair) {
    return pair.step || (pair.rate === 10 ? 1 : (pair.rate === 100 ? 5 : 50));
}

function measureAmount(pair) {
    let step = measureStep(pair);
    let big = randomInt(1, 9), small = step * randomInt(1, pair.rate / step - 1);
    return { big: big, small: small, total: big * pair.rate + small };
}

function measureCompareQuestion(pairs) {
    let pair = pickOne(pairs);
    let amount = measureAmount(pair);
    let other = amount.total + measureStep(pair) * randomInt(-3, 3);

    return compareQuestion(`${amount.big} ${pair.big} ${amount.small} ${pair.small} □ ${commaNumber(other)} ${pair.small}`, amount.total, other);
}

function measureConvertQuestion(pairs) {
    let pair = pickOne(pairs);
    let amount = measureAmount(pair);

    if (Math.random() < 0.5) {
        return { text: `${amount.big} ${pair.big} ${amount.small} ${pair.small} เท่ากับกี่${pair.small}`, answer: amount.total, unit: pair.small };
    }
    return {
        text: `${commaNumber(amount.total)} ${pair.small} เท่ากับกี่${pair.big}กี่${pair.small}`,
        fields: [{ label: pair.big, value: amount.big }, { label: pair.small, value: amount.small }],
    };
}

function measureWordQuestion(pairs, addText, takeText) {
    let pair = pickOne(pairs);
    let first = measureAmount(pair), second = measureAmount(pair);
    let large = first.total > second.total ? first : second;
    let little = large === first ? second : first;
    let isAdd = Math.random() < 0.5;
    let answer = isAdd ? large.total + little.total : large.total - little.total;
    let write = function (amount) { return `${amount.big} ${pair.big} ${amount.small} ${pair.small}`; };

    return {
        text: (isAdd ? addText : takeText)(write(large), write(little)),
        fields: [{ label: pair.big, value: Math.floor(answer / pair.rate) }, { label: pair.small, value: answer % pair.rate }],
    };
}

function measurePickQuestion(list, ask) {
    let item = pickOne(list);
    return choiceQuestion(ask(item), item.answer, item.wrong);
}

const LENGTH_PAIRS = [
    { big: 'เซนติเมตร', small: 'มิลลิเมตร', rate: 10 },
    { big: 'เมตร', small: 'เซนติเมตร', rate: 100 },
    { big: 'กิโลเมตร', small: 'เมตร', rate: 1000 },
];

const LENGTH_TOOLS = [
    { thing: 'ความยาวของดินสอ', answer: 'ไม้บรรทัด', wrong: ['ตลับเมตร', 'สายวัดตัว'] },
    { thing: 'ความกว้างของห้องเรียน', answer: 'ตลับเมตร', wrong: ['ไม้บรรทัด', 'สายวัดตัว'] },
    { thing: 'รอบเอวของนักเรียน', answer: 'สายวัดตัว', wrong: ['ไม้บรรทัด', 'ไม้เมตร'] },
    { thing: 'ความสูงของประตู', answer: 'ตลับเมตร', wrong: ['ไม้บรรทัด', 'สายวัดตัว'] },
];

const LENGTH_GUESSES = [
    { thing: 'ดินสอ 1 แท่งยาว', answer: '18 เซนติเมตร', wrong: ['18 เมตร', '2 เซนติเมตร'] },
    { thing: 'ประตูห้องเรียนสูง', answer: '2 เมตร', wrong: ['20 เซนติเมตร', '20 เมตร'] },
    { thing: 'สมุด 1 เล่มกว้าง', answer: '20 เซนติเมตร', wrong: ['2 เมตร', '2 เซนติเมตร'] },
    { thing: 'รถบัส 1 คันยาว', answer: '10 เมตร', wrong: ['10 เซนติเมตร', '100 เมตร'] },
];

const WEIGHT_PAIRS = [
    { big: 'กิโลกรัม', small: 'ขีด', rate: 10 },
    { big: 'กิโลกรัม', small: 'กรัม', rate: 1000 },
    { big: 'เมตริกตัน', small: 'กิโลกรัม', rate: 1000 },
];

const WEIGHT_TOOLS = [
    { thing: 'น้ำหนักตัวของนักเรียน', answer: 'เครื่องชั่งน้ำหนักตัว', wrong: ['เครื่องชั่งสปริงในครัว', 'เครื่องชั่งรถบรรทุก'] },
    { thing: 'น้ำตาล 2 ขีด', answer: 'เครื่องชั่งสปริงในครัว', wrong: ['เครื่องชั่งน้ำหนักตัว', 'เครื่องชั่งรถบรรทุก'] },
    { thing: 'ข้าวสาร 5 เมตริกตัน', answer: 'เครื่องชั่งรถบรรทุก', wrong: ['เครื่องชั่งสปริงในครัว', 'เครื่องชั่งน้ำหนักตัว'] },
];

const WEIGHT_GUESSES = [
    { thing: 'ส้ม 1 ผล', answer: '2 ขีด', wrong: ['2 กิโลกรัม', '20 กิโลกรัม'] },
    { thing: 'นักเรียน ป.3 หนึ่งคน', answer: '30 กิโลกรัม', wrong: ['3 กิโลกรัม', '300 กิโลกรัม'] },
    { thing: 'ถุงข้าวสาร 1 ถุง', answer: '5 กิโลกรัม', wrong: ['5 ขีด', '50 ขีด'] },
];

const CAPACITY_PAIRS = [{ big: 'ลิตร', small: 'มิลลิลิตร', rate: 1000 }];

const CAPACITY_SPOONS = [
    { name: 'ช้อนชา', millilitres: 5 },
    { name: 'ช้อนโต๊ะ', millilitres: 15 },
    { name: 'ถ้วยตวง', millilitres: 240 },
];

const CAPACITY_TOOLS = [
    { thing: 'น้ำเชื่อม 2 ช้อนโต๊ะ', answer: 'ช้อนตวง', wrong: ['ถังน้ำ', 'เหยือกตวง 2 ลิตร'] },
    { thing: 'น้ำ 1 ลิตร', answer: 'เหยือกตวง', wrong: ['ช้อนตวง', 'หลอดหยด'] },
    { thing: 'ยาน้ำ 5 มิลลิลิตร', answer: 'ช้อนตวงยา', wrong: ['เหยือกตวง', 'ถังน้ำ'] },
];

const CAPACITY_GUESSES = [
    { thing: 'ขวดน้ำดื่มขวดใหญ่', answer: '1 ลิตร', wrong: ['1 มิลลิลิตร', '100 ลิตร'] },
    { thing: 'ถังน้ำในห้องน้ำ', answer: '20 ลิตร', wrong: ['20 มิลลิลิตร', '2,000 ลิตร'] },
    { thing: 'แก้วน้ำ 1 ใบ', answer: '250 มิลลิลิตร', wrong: ['250 ลิตร', '2 มิลลิลิตร'] },
];

function capacitySpoonQuestion() {
    let spoon = pickOne(CAPACITY_SPOONS), count = randomInt(2, 8);

    if (Math.random() < 0.5) {
        return { text: `น้ำ ${count} ${spoon.name} เท่ากับกี่มิลลิลิตร`, answer: count * spoon.millilitres, unit: 'มิลลิลิตร' };
    }
    return { text: `น้ำ ${commaNumber(count * spoon.millilitres)} มิลลิลิตร เท่ากับกี่${spoon.name}`, answer: count, unit: spoon.name };
}

function regularPolygonFigure(sides, label) {
    let points = Array.from({ length: sides }, function (unused, index) {
        let angle = -Math.PI / 2 + index * 2 * Math.PI / sides;
        return `${(60 + 52 * Math.cos(angle)).toFixed(1)},${(60 + 52 * Math.sin(angle)).toFixed(1)}`;
    });

    return `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="${label}"><polygon class="shape-fill" points="${points.join(' ')}"/></svg>`;
}

function polygonFigure(points, label) {
    return `<svg viewBox="0 0 130 120" width="130" height="120" role="img" aria-label="${label}"><polygon class="shape-fill" points="${points}"/></svg>`;
}

const SYMMETRY_SHAPES = [
    { name: 'รูปสี่เหลี่ยมจัตุรัส', axes: 4, figure: polygonFigure('15,10 115,10 115,110 15,110', 'รูปสี่เหลี่ยมจัตุรัส') },
    { name: 'รูปสี่เหลี่ยมผืนผ้า', axes: 2, figure: polygonFigure('5,25 125,25 125,95 5,95', 'รูปสี่เหลี่ยมผืนผ้า') },
    { name: 'รูปสี่เหลี่ยมขนมเปียกปูน', axes: 2, figure: polygonFigure('65,5 105,60 65,115 25,60', 'รูปสี่เหลี่ยมขนมเปียกปูน') },
    { name: 'รูปสี่เหลี่ยมด้านขนาน', axes: 0, figure: polygonFigure('40,30 125,30 90,95 5,95', 'รูปสี่เหลี่ยมด้านขนาน') },
    { name: 'รูปว่าว', axes: 1, figure: polygonFigure('65,5 100,45 65,115 30,45', 'รูปว่าว') },
    { name: 'รูปสี่เหลี่ยมคางหมูหน้าจั่ว', axes: 1, figure: polygonFigure('40,30 90,30 125,95 5,95', 'รูปสี่เหลี่ยมคางหมูหน้าจั่ว') },
    { name: 'รูปสามเหลี่ยมด้านเท่า', axes: 3, figure: regularPolygonFigure(3, 'รูปสามเหลี่ยมด้านเท่า') },
    { name: 'รูปสามเหลี่ยมหน้าจั่ว', axes: 1, figure: polygonFigure('65,5 100,110 30,110', 'รูปสามเหลี่ยมหน้าจั่ว') },
    { name: 'รูปสามเหลี่ยมด้านไม่เท่า', axes: 0, figure: polygonFigure('10,105 125,105 45,20', 'รูปสามเหลี่ยมด้านไม่เท่า') },
    { name: 'รูปห้าเหลี่ยมด้านเท่ามุมเท่า', axes: 5, figure: regularPolygonFigure(5, 'รูปห้าเหลี่ยมด้านเท่ามุมเท่า') },
    { name: 'รูปหกเหลี่ยมด้านเท่ามุมเท่า', axes: 6, figure: regularPolygonFigure(6, 'รูปหกเหลี่ยมด้านเท่ามุมเท่า') },
];

function symmetryCountQuestion() {
    let shape = pickOne(SYMMETRY_SHAPES);
    return { text: `${shape.name}นี้มีแกนสมมาตรกี่แกน`, figure: shape.figure, answer: shape.axes, unit: 'แกน' };
}

function symmetryHasQuestion() {
    let shape = pickOne(SYMMETRY_SHAPES);
    let answer = shape.axes ? 'มีแกนสมมาตร' : 'ไม่มีแกนสมมาตร';

    return { text: `${shape.name}นี้มีแกนสมมาตรหรือไม่`, figure: shape.figure, answer: answer, choices: ['มีแกนสมมาตร', 'ไม่มีแกนสมมาตร'] };
}

function pictographReadQuestion() {
    let question = buildPictographQuestion(pickOne([2, 5, 10]));
    return { text: question.text, figure: question.html, answer: question.expected };
}

function pictographDrawQuestion() {
    let topic = pickOne(pictographTopics);
    let perPicture = pickOne([2, 5, 10]), pictures = randomInt(2, 9);
    let label = pickOne(topic.categories);

    return { text: `ถ้า 1 รูป แทน ${perPicture} ${topic.unit} และ${label} ${topic.ask} ${pictures * perPicture} ${topic.unit} ต้องวาดกี่รูป`, answer: pictures, unit: 'รูป' };
}

function tableRows(largest) {
    let topic = pickOne(pictographTopics);
    let labels = shuffleList(topic.categories).slice(0, 4);
    let counts = shuffleList(Array.from({ length: largest }, function (unused, index) { return (index + 1) * 5; })).slice(0, 4);

    return { topic: topic, rows: labels.map(function (label, index) { return { label: label, count: counts[index] }; }) };
}

function oneWayTableQuestion() {
    let data = tableRows(12);
    let topic = data.topic, rows = data.rows;
    let figure = lessonTable([topic.title, `จำนวน (${topic.unit})`], rows.map(function (row) { return [row.label, row.count]; }));
    let sorted = rows.slice().sort(function (a, b) { return b.count - a.count; });
    let total = rows.reduce(function (sum, row) { return sum + row.count; }, 0);
    let questions = [
        { text: `รวมทั้งหมดกี่${topic.unit}`, answer: total, unit: topic.unit },
        { text: `${sorted[0].label}มากกว่า${sorted[3].label}กี่${topic.unit}`, answer: sorted[0].count - sorted[3].count, unit: topic.unit },
        { text: `${rows[0].label}และ${rows[1].label}รวมกันกี่${topic.unit}`, answer: rows[0].count + rows[1].count, unit: topic.unit },
    ];

    return Object.assign({ figure: figure }, pickOne(questions));
}

addLessons('p3', [
    {
        id: 'p3number', menu: 'จำนวนไม่เกิน 100,000', title: 'จำนวนไม่เกิน 100,000 (ป.3)', label: 'จำนวนไม่เกิน 100,000 (ป.3)',
        intro: 'อ่านและเขียนจำนวน รู้ค่าของเลขโดดในแต่ละหลัก', icon: 'bi-123', op: 'placevalue',
        modes: [
            { label: 'ตัวหนังสือ', build: function () { let n = randomInt(1000, 100000); return { text: `${thaiNumberWords(n)} เขียนเป็นตัวเลขได้อย่างไร`, answer: n }; } },
            { label: 'เลขไทย', build: function () { let n = randomInt(1000, 100000); return { text: `${toThaiDigits(n)} เขียนเป็นเลขฮินดูอารบิกได้อย่างไร`, answer: n }; } },
            { label: 'ค่าของเลขโดด', build: function () { return placeValueQuestion(randomInt(10000, 99999)); } },
            { label: 'รูปกระจาย', build: function () { return expandedNumberQuestion(randomInt(10000, 99999)); } },
        ],
        learn: [{
            label: 'ค่าของเลขโดด',
            title: 'ตัวอย่าง: 47,305',
            steps: [
                { say: 'ไล่หลักจากขวาไปซ้าย หน่วย สิบ ร้อย พัน หมื่น', show: learnColumn('47305', '', '', { head: ['หมื่น', 'พัน', 'ร้อย', 'สิบ', 'หน่วย'] }) },
                { say: 'เลขโดดแต่ละตัวมีค่าตามหลักที่มันอยู่ 4 อยู่หลักหมื่น จึงมีค่า 40,000', show: learnLines(['4 ในหลักหมื่น = 40,000', '7 ในหลักพัน = 7,000']) },
                { say: 'เขียนรวมกันได้เป็น<strong>รูปกระจาย</strong> ส่วนหลักที่เป็น 0 ไม่ต้องเขียน', show: learnLines(['40,000 + 7,000 + 300 + 5', '<strong>= 47,305</strong>']) },
            ],
        }],
    },
    {
        id: 'p3compare', menu: 'เปรียบเทียบและเรียงลำดับ', title: 'เปรียบเทียบและเรียงลำดับ (ป.3)', label: 'เปรียบเทียบจำนวน (ป.3)',
        intro: 'เปรียบเทียบและเรียงลำดับจำนวนไม่เกิน 100,000', icon: 'bi-arrow-left-right', op: 'compare',
        modes: [
            { label: 'เปรียบเทียบ', build: function () { return numberCompareQuestion(1000, 100000); } },
            { label: 'เรียงลำดับ', build: function () { return numberOrderQuestion(100000); } },
        ],
        learn: [{
            label: 'เปรียบเทียบ',
            title: 'ตัวอย่าง: 45,312 กับ 45,298',
            steps: [
                { say: 'นับจำนวนหลักก่อน จำนวนที่มีหลักมากกว่าจะมากกว่า ตัวอย่างนี้มี 5 หลักเท่ากัน', show: learnLines(['45,312', '45,298']) },
                { say: 'เทียบจากหลักซ้ายสุด หลักหมื่นและหลักพันเท่ากัน', show: learnLines(['<strong>45</strong>,312', '<strong>45</strong>,298']) },
                { say: 'ถึงหลักร้อย 3 มากกว่า 2 จึงตัดสินได้เลย', show: learnLines(['<strong>45,312 > 45,298</strong>']) },
            ],
        }],
    },
    {
        id: 'p3addsub', menu: 'บวกและลบ', title: 'บวกและลบ (ป.3)', label: 'บวกและลบ (ป.3)',
        intro: 'บวกและลบจำนวนไม่เกิน 100,000', icon: 'bi-plus-slash-minus', op: 'plus',
        modes: [
            { label: 'บวก', build: function () { return sumQuestion(100000); } },
            { label: 'ลบ', build: function () { return differenceQuestion(100000); } },
        ],
        learn: [{
            label: 'บวก',
            title: 'ตัวอย่าง: 2,475 + 1,358',
            steps: [
                { say: 'ตั้งเลขให้หลักตรงกัน แล้วเริ่มจากหลักหน่วย 5 + 8 = 13 เขียน 3 ทด 1', show: learnColumn('2475', '1358', '+', { on: 0, carry: ['', '', '1', ''], answer: '3' }) },
                { say: 'หลักสิบ 7 + 5 + 1 = 13 เขียน 3 ทด 1', show: learnColumn('2475', '1358', '+', { on: 1, carry: ['', '1', '1', ''], answer: '33' }) },
                { say: 'หลักร้อย 4 + 3 + 1 = 8 และหลักพัน 2 + 1 = 3', show: learnColumn('2475', '1358', '+', { answer: '3833' }) },
            ],
        }, {
            label: 'ลบ',
            title: 'ตัวอย่าง: 5,204 − 1,368',
            steps: [
                { say: 'หลักหน่วย 4 ลบ 8 ไม่พอ ต้องกระจายมาจากหลักที่อยู่ถัดไป หลักสิบเป็น 0 จึงต้องขอจากหลักร้อย', show: learnColumn('5204', '1368', '−', { on: 0 }) },
                { say: 'หลักร้อยเหลือ 1 หลักสิบเหลือ 9 หลักหน่วยเป็น 14 แล้ว 14 − 8 = 6', show: learnColumn('5204', '1368', '−', { on: 0, carry: ['', '1', '9', '14'], strike: [0, 1, 2], answer: '6' }) },
                { say: 'หลักสิบ 9 − 6 = 3 หลักร้อยต้องกระจายอีกครั้ง 11 − 3 = 8 หลักพัน 4 − 1 = 3', show: learnColumn('5204', '1368', '−', { answer: '3836' }) },
            ],
        }],
    },
    {
        id: 'p3multiply', menu: 'คูณ', title: 'คูณ (ป.3)', label: 'คูณ (ป.3)',
        intro: 'คูณจำนวน 1 หลักกับไม่เกิน 4 หลัก และ 2 หลักกับ 2 หลัก', icon: 'bi-x-circle-fill', op: 'multiply',
        modes: [
            { label: '4 หลัก × 1 หลัก', build: function () { return productQuestion(1000, 9999, 2, 9); } },
            { label: '2 หลัก × 2 หลัก', build: function () { return productQuestion(11, 99, 11, 99); } },
        ],
        learn: [{
            label: '2 หลัก × 2 หลัก',
            title: 'ตัวอย่าง: 23 × 14',
            steps: [
                { say: 'แยก 14 เป็น 4 กับ 10 แล้วคูณทีละส่วน', show: learnLines(['23 × 14 = (23 × 4) + (23 × 10)']) },
                { say: 'คูณแต่ละส่วนก่อน', show: learnLines(['23 × 4 = 92', '23 × 10 = 230']) },
                { say: 'เอาผลลัพธ์มาบวกกัน', show: learnLines(['92 + 230 = 322', '<strong>23 × 14 = 322</strong>']) },
            ],
        }],
    },
    {
        id: 'p3divide', menu: 'หาร', title: 'หาร (ป.3)', label: 'หาร (ป.3)',
        intro: 'หารยาวและหารสั้น ตัวตั้งไม่เกิน 4 หลัก ตัวหาร 1 หลัก', icon: 'bi-slash-circle-fill', op: 'divide',
        modes: [
            { label: 'หารลงตัว', build: function () { return exactDivisionQuestion(2, 9, 9999); } },
            { label: 'หารมีเศษ', build: function () { return remainderDivisionQuestion(2, 9, 9999); } },
        ],
        learn: [{
            label: 'หารทีละหลัก',
            title: 'ตัวอย่าง: 756 ÷ 4',
            steps: [
                { say: 'เริ่มจากหลักซ้ายสุด 7 ÷ 4 ได้ 1 เหลือ 3', show: learnLines(['7 ÷ 4 = 1 เศษ 3']) },
                { say: 'เอาเศษ 3 มารวมกับหลักถัดไปเป็น 35 แล้วหาร 4 ได้ 8 เหลือ 3', show: learnLines(['35 ÷ 4 = 8 เศษ 3']) },
                { say: 'เอาเศษ 3 มารวมกับ 6 เป็น 36 แล้วหาร 4 ได้ 9 พอดี', show: learnLines(['36 ÷ 4 = 9', '<strong>756 ÷ 4 = 189</strong>']) },
                { say: 'ตรวจคำตอบด้วยการคูณกลับ', show: learnLines(['189 × 4 = 756']) },
            ],
        }],
    },
    {
        id: 'p3mixed', menu: 'บวก ลบ คูณ หารระคน', title: 'บวก ลบ คูณ หารระคน (ป.3)', label: 'ระคน (ป.3)',
        intro: 'คิดให้ถูกลำดับ ทำในวงเล็บก่อน แล้วคูณหาร จึงบวกลบ', icon: 'bi-calculator-fill', op: 'average',
        modes: [{ label: 'ระคน', build: function () { return mixedSumQuestion(10); } }],
        learn: [{
            label: 'ลำดับการคิด',
            title: 'ตัวอย่าง: 350 − 240 ÷ 6',
            steps: [
                { say: 'มีทั้งลบและหาร ให้ทำ<strong>หารก่อน</strong>', show: learnLines(['240 ÷ 6 = 40']) },
                { say: 'เอาผลลัพธ์ไปทำต่อ', show: learnLines(['350 − 40 = 310', '<strong>ตอบ 310</strong>']) },
                { say: 'ถ้ามีวงเล็บ ให้ทำในวงเล็บก่อนเสมอ', show: learnLines(['(20 + 30) × 4', '50 × 4 = 200']) },
            ],
        }],
    },
    {
        id: 'p3missing', menu: 'หาตัวไม่ทราบค่า', title: 'หาตัวไม่ทราบค่า (ป.3)', label: 'ตัวไม่ทราบค่า (ป.3)',
        intro: 'หาจำนวนที่ใส่ใน □ แล้วทำให้ประโยคสัญลักษณ์เป็นจริง', icon: 'bi-question-square-fill', op: 'numberbond',
        modes: [
            { label: 'บวก ลบ', build: function () { return missingAddendQuestion(100000); } },
            { label: 'คูณ', build: function () { return missingFactorQuestion(100, 9999, 2, 9); } },
            { label: 'หาร', build: function () { return missingDivisionQuestion(2, 9, 10, 900); } },
        ],
        learn: [{
            label: 'ใช้การดำเนินการตรงข้าม',
            title: 'ตัวอย่าง: □ + 2,500 = 7,300',
            steps: [
                { say: 'บวกกับลบเป็นคู่ตรงข้ามกัน จึงย้ายมาหาคำตอบด้วยการลบ', show: learnLines(['□ = 7,300 − 2,500']) },
                { say: 'คิดผลลัพธ์', show: learnLines(['<strong>□ = 4,800</strong>']) },
                { say: 'ตรวจโดยแทนค่ากลับ ถ้าเท่ากันแปลว่าถูก คูณกับหารก็ใช้วิธีเดียวกัน', show: learnLines(['4,800 + 2,500 = 7,300']) },
            ],
        }],
    },
    {
        id: 'p3wordproblem', menu: 'โจทย์ปัญหา 2 ขั้นตอน', title: 'โจทย์ปัญหา 2 ขั้นตอน (ป.3)', label: 'โจทย์ปัญหา (ป.3)',
        intro: 'อ่านโจทย์ แล้วแบ่งการคิดเป็นสองขั้นตอน', icon: 'bi-journal-text', op: 'wordproblem',
        modes: [{ label: 'โจทย์ปัญหา', build: p3WordProblem }],
        learn: [{
            label: 'สองขั้นตอน',
            title: 'ตัวอย่าง: มีเงิน 500 บาท ซื้อสมุด 4 เล่ม เล่มละ 35 บาท เหลือเงินกี่บาท',
            steps: [
                { say: 'หาสิ่งที่โจทย์ถาม โจทย์ถามว่าเหลือเงินเท่าไร แต่ยังไม่รู้ว่าจ่ายไปเท่าไร', show: learnLines(['ต้องรู้ก่อน: จ่ายไปกี่บาท']) },
                { say: 'ขั้นที่ 1 หาเงินที่จ่ายไป', show: learnLines(['35 × 4 = 140 บาท']) },
                { say: 'ขั้นที่ 2 เอาเงินที่มีลบเงินที่จ่าย', show: learnLines(['500 − 140 = 360', '<strong>เหลือเงิน 360 บาท</strong>']) },
            ],
        }],
    },
    {
        id: 'p3fraction', menu: 'เศษส่วน', title: 'เศษส่วน (ป.3)', label: 'เศษส่วน (ป.3)',
        intro: 'อ่านเศษส่วนจากรูป และเปรียบเทียบเศษส่วนที่ตัวเศษเท่ากัน', icon: 'bi-slash-square', op: 'fraction',
        modes: [
            { label: 'จากรูป', build: p3FractionPicture },
            { label: 'เปรียบเทียบ', build: p3FractionCompare },
        ],
        learn: [{
            label: 'จากรูป',
            title: 'ตัวอย่าง: แถบแบ่ง 5 ส่วน ระบายสี 3 ส่วน',
            steps: [
                { say: '<strong>ตัวส่วน</strong>คือจำนวนส่วนที่แบ่งเท่า ๆ กันทั้งหมด', show: fractionBarFigure(3, 5) },
                { say: '<strong>ตัวเศษ</strong>คือจำนวนส่วนที่ระบายสี', show: learnLines([learnFraction(3, 5)]) },
            ],
        }, {
            label: 'เปรียบเทียบ',
            title: 'ตัวอย่าง: 2/3 กับ 2/5',
            steps: [
                { say: 'ตัวเศษเท่ากัน แปลว่าได้จำนวนชิ้นเท่ากัน', show: learnLines([`${learnFraction(2, 3)} กับ ${learnFraction(2, 5)}`]) },
                { say: 'ยิ่งตัวส่วนน้อย ยิ่งแบ่งน้อยชิ้น แต่ละชิ้นจึงใหญ่กว่า', show: fractionBarFigure(2, 3) + fractionBarFigure(2, 5) },
                { say: 'ดังนั้นเศษส่วนที่ตัวส่วนน้อยกว่าจะมากกว่า', show: learnLines([`<strong>${learnFraction(2, 3)} > ${learnFraction(2, 5)}</strong>`]) },
            ],
        }],
    },
    {
        id: 'p3fractionsum', menu: 'บวกและลบเศษส่วน', title: 'บวกและลบเศษส่วน (ป.3)', label: 'บวกลบเศษส่วน (ป.3)',
        intro: 'บวกและลบเศษส่วนที่ตัวส่วนเท่ากัน', icon: 'bi-plus-slash-minus', op: 'fraction',
        modes: [
            { label: 'บวก', build: p3FractionSum },
            { label: 'ลบ', build: p3FractionDifference },
            { label: 'โจทย์ปัญหา', build: p3FractionWord },
        ],
        learn: [{
            label: 'ตัวส่วนเท่ากัน',
            title: 'ตัวอย่าง: 2/7 + 3/7',
            steps: [
                { say: 'ตัวส่วนเท่ากัน แปลว่าแต่ละชิ้นมีขนาดเท่ากัน จึงนับรวมชิ้นได้เลย', show: learnLines([`${learnFraction(2, 7)} + ${learnFraction(3, 7)}`]) },
                { say: 'บวกตัวเศษ ส่วนตัวส่วนคงเดิม', show: learnLines([`${learnFraction('2 + 3', 7)} = <strong>${learnFraction(5, 7)}</strong>`]) },
                { say: 'การลบก็ทำแบบเดียวกัน คือลบตัวเศษ', show: learnLines([`${learnFraction(5, 7)} − ${learnFraction(2, 7)} = ${learnFraction(3, 7)}`]) },
            ],
        }],
    },
    {
        id: 'p3pattern', menu: 'แบบรูป', title: 'แบบรูป (ป.3)', label: 'แบบรูป (ป.3)',
        intro: 'หาจำนวนที่หายไปในแบบรูปที่เพิ่มหรือลดทีละเท่า ๆ กัน', icon: 'bi-list-ol', op: 'pattern',
        modes: [{ label: 'แบบรูป', build: equalStepPattern }],
        learn: [{
            label: 'หาค่าที่เปลี่ยน',
            title: 'ตัวอย่าง: 15, 22, 29, □, 43',
            steps: [
                { say: 'ดูคู่ที่อยู่ติดกัน ว่าเพิ่มหรือลดเท่าไร', show: learnLines(['22 − 15 = 7', '29 − 22 = 7']) },
                { say: 'แบบรูปนี้เพิ่มทีละ 7 จึงเอา 29 บวก 7', show: learnLines(['29 + 7 = 36', '<strong>□ = 36</strong>']) },
                { say: 'ตรวจกับจำนวนถัดไป 36 + 7 = 43 ตรงกับโจทย์', show: learnLines(['36 + 7 = 43']) },
            ],
        }],
    },
    {
        id: 'p3money', menu: 'เงิน', title: 'เงิน (ป.3)', label: 'เงิน (ป.3)',
        intro: 'นับเงิน เขียนจำนวนเงินแบบใช้จุด ทอนเงิน และอ่านบันทึกรายรับรายจ่าย', icon: 'bi-cash-coin', op: 'money',
        modes: [
            { label: 'นับเงิน', build: moneyCountQuestion },
            { label: 'ใช้จุด', build: moneyDotQuestion },
            { label: 'เงินทอน', build: moneyChangeQuestion },
            { label: 'รายรับรายจ่าย', build: moneyLedgerQuestion },
        ],
        learn: [{
            label: 'ใช้จุด',
            title: 'ตัวอย่าง: 25 บาท 50 สตางค์',
            steps: [
                { say: '100 สตางค์เท่ากับ 1 บาท ตัวเลขหน้าจุดคือบาท และหลังจุดสองตำแหน่งคือสตางค์', show: learnLines(['25 บาท 50 สตางค์', '<strong>25.50 บาท</strong>']) },
                { say: 'ถ้าสตางค์มีหลักเดียวต้องเติม 0 ให้ครบสองตำแหน่ง', show: learnLines(['8 บาท 5 สตางค์ = 8.05 บาท']) },
            ],
        }, {
            label: 'เงินทอน',
            title: 'ตัวอย่าง: ซื้อของ 37.50 บาท จ่าย 100 บาท',
            steps: [
                { say: 'เงินทอนคือเงินที่จ่ายลบราคาของ ตั้งลบให้จุดตรงกัน', show: learnLines(['100.00 − 37.50']) },
                { say: 'คิดเหมือนการลบปกติ แล้วใส่จุดไว้ตำแหน่งเดิม', show: learnLines(['<strong>= 62.50 บาท</strong>']) },
            ],
        }],
    },
    {
        id: 'p3time', menu: 'เวลา', title: 'เวลา (ป.3)', label: 'เวลา (ป.3)',
        intro: 'บอกเวลา เขียนเวลาแบบใช้จุด และหาระยะเวลา', icon: 'bi-clock-fill', op: 'time',
        modes: [
            { label: 'นาฬิกา', build: p3TimeClock },
            { label: 'เขียนเวลา', build: p3TimeWrite },
            { label: 'ระยะเวลา', build: p3TimeDuration },
            { label: 'เปลี่ยนหน่วย', build: p3TimeConvert },
        ],
        learn: [{
            label: 'ระยะเวลา',
            title: 'ตัวอย่าง: เริ่ม 8.40 น. เสร็จ 10.15 น.',
            steps: [
                { say: 'นับจากเวลาเริ่มไปให้ถึงชั่วโมงเต็มก่อน 8.40 น. ถึง 9.00 น. คือ 20 นาที', show: learnLines(['8.40 น. → 9.00 น. = 20 นาที']) },
                { say: 'จาก 9.00 น. ถึง 10.00 น. คือ 1 ชั่วโมง และถึง 10.15 น. อีก 15 นาที', show: learnLines(['9.00 น. → 10.00 น. = 1 ชั่วโมง', '10.00 น. → 10.15 น. = 15 นาที']) },
                { say: 'รวมกัน', show: learnLines(['20 + 15 = 35 นาที', '<strong>1 ชั่วโมง 35 นาที</strong>']) },
            ],
        }, {
            label: 'เปลี่ยนหน่วย',
            title: 'ตัวอย่าง: 2 ชั่วโมง 15 นาที',
            steps: [
                { say: '1 ชั่วโมงเท่ากับ 60 นาที จึงคูณด้วย 60', show: learnLines(['2 × 60 = 120 นาที']) },
                { say: 'แล้วบวกนาทีที่เหลือ', show: learnLines(['120 + 15 = <strong>135 นาที</strong>']) },
            ],
        }],
    },
    {
        id: 'p3length', menu: 'ความยาว', title: 'ความยาว (ป.3)', label: 'ความยาว (ป.3)',
        intro: 'เลือกเครื่องวัด คาดคะเน เปรียบเทียบ และแก้โจทย์ปัญหาความยาว', icon: 'bi-rulers', op: 'length',
        modes: [
            { label: 'เปลี่ยนหน่วย', build: function () { return measureConvertQuestion(LENGTH_PAIRS); } },
            { label: 'เปรียบเทียบ', build: function () { return measureCompareQuestion(LENGTH_PAIRS); } },
            { label: 'เครื่องวัด', build: function () { return measurePickQuestion(LENGTH_TOOLS, function (item) { return `ถ้าจะวัด${item.thing} ควรใช้เครื่องมือใด`; }); } },
            { label: 'คาดคะเน', build: function () { return measurePickQuestion(LENGTH_GUESSES, function (item) { return `${item.thing}ประมาณเท่าใด`; }); } },
            { label: 'โจทย์ปัญหา', build: function () {
                return measureWordQuestion(LENGTH_PAIRS,
                    function (first, second) { return `เส้นตรงเส้นแรกยาว ${first} เส้นที่สองยาว ${second} ต่อกันแล้วยาวเท่าใด`; },
                    function (first, second) { return `เส้นตรงยาว ${first} ตัดออกไป ${second} เหลือยาวเท่าใด`; });
            } },
        ],
        learn: [{
            label: 'เปลี่ยนหน่วย',
            title: 'ตัวอย่าง: 3 เมตร 40 เซนติเมตร',
            steps: [
                { say: 'จำความสัมพันธ์ของหน่วยให้ได้', show: learnLines(['1 เซนติเมตร = 10 มิลลิเมตร', '1 เมตร = 100 เซนติเมตร', '1 กิโลเมตร = 1,000 เมตร']) },
                { say: 'เปลี่ยน 3 เมตรเป็นเซนติเมตรด้วยการคูณ 100', show: learnLines(['3 × 100 = 300 เซนติเมตร']) },
                { say: 'บวกส่วนที่เหลือ', show: learnLines(['300 + 40 = <strong>340 เซนติเมตร</strong>']) },
            ],
        }],
    },
    {
        id: 'p3weight', menu: 'น้ำหนัก', title: 'น้ำหนัก (ป.3)', label: 'น้ำหนัก (ป.3)',
        intro: 'เลือกเครื่องชั่ง คาดคะเน เปรียบเทียบ และแก้โจทย์ปัญหาน้ำหนัก', icon: 'bi-basket-fill', op: 'weight',
        modes: [
            { label: 'เปลี่ยนหน่วย', build: function () { return measureConvertQuestion(WEIGHT_PAIRS); } },
            { label: 'เปรียบเทียบ', build: function () { return measureCompareQuestion(WEIGHT_PAIRS); } },
            { label: 'เครื่องชั่ง', build: function () { return measurePickQuestion(WEIGHT_TOOLS, function (item) { return `ถ้าจะชั่ง${item.thing} ควรใช้เครื่องชั่งใด`; }); } },
            { label: 'คาดคะเน', build: function () { return measurePickQuestion(WEIGHT_GUESSES, function (item) { return `${item.thing} หนักประมาณเท่าใด`; }); } },
            { label: 'โจทย์ปัญหา', build: function () {
                return measureWordQuestion(WEIGHT_PAIRS,
                    function (first, second) { return `ส้มหนัก ${first} มังคุดหนัก ${second} รวมหนักเท่าใด`; },
                    function (first, second) { return `มีน้ำตาลหนัก ${first} ใช้ไป ${second} เหลือน้ำตาลหนักเท่าใด`; });
            } },
        ],
        learn: [{
            label: 'เปลี่ยนหน่วย',
            title: 'ตัวอย่าง: 2 กิโลกรัม 350 กรัม',
            steps: [
                { say: 'จำความสัมพันธ์ของหน่วยให้ได้', show: learnLines(['1 กิโลกรัม = 10 ขีด', '1 กิโลกรัม = 1,000 กรัม', '1 เมตริกตัน = 1,000 กิโลกรัม']) },
                { say: 'เปลี่ยน 2 กิโลกรัมเป็นกรัมด้วยการคูณ 1,000', show: learnLines(['2 × 1,000 = 2,000 กรัม']) },
                { say: 'บวกส่วนที่เหลือ', show: learnLines(['2,000 + 350 = <strong>2,350 กรัม</strong>']) },
            ],
        }],
    },
    {
        id: 'p3capacity', menu: 'ปริมาตรและความจุ', title: 'ปริมาตรและความจุ (ป.3)', label: 'ปริมาตรและความจุ (ป.3)',
        intro: 'ใช้หน่วยลิตร มิลลิลิตร ช้อนชา ช้อนโต๊ะ และถ้วยตวง', icon: 'bi-droplet-fill', op: 'capacity',
        modes: [
            { label: 'เปลี่ยนหน่วย', build: function () { return measureConvertQuestion(CAPACITY_PAIRS); } },
            { label: 'ช้อนและถ้วย', build: capacitySpoonQuestion },
            { label: 'เครื่องตวง', build: function () { return measurePickQuestion(CAPACITY_TOOLS, function (item) { return `ถ้าจะตวง${item.thing} ควรใช้เครื่องตวงใด`; }); } },
            { label: 'คาดคะเน', build: function () { return measurePickQuestion(CAPACITY_GUESSES, function (item) { return `${item.thing} จุประมาณเท่าใด`; }); } },
            { label: 'โจทย์ปัญหา', build: function () {
                return measureWordQuestion(CAPACITY_PAIRS,
                    function (first, second) { return `น้ำส้มมี ${first} น้ำมะนาวมี ${second} ผสมกันได้เท่าใด`; },
                    function (first, second) { return `มีนม ${first} ดื่มไป ${second} เหลือนมเท่าใด`; });
            } },
        ],
        learn: [{
            label: 'เปลี่ยนหน่วย',
            title: 'ตัวอย่าง: 3 ถ้วยตวง',
            steps: [
                { say: 'จำความสัมพันธ์ของหน่วยให้ได้', show: learnLines(['1 ลิตร = 1,000 มิลลิลิตร', '1 ช้อนชา = 5 มิลลิลิตร', '1 ช้อนโต๊ะ = 15 มิลลิลิตร', '1 ถ้วยตวง = 240 มิลลิลิตร']) },
                { say: '1 ถ้วยตวงเท่ากับ 240 มิลลิลิตร จึงคูณด้วย 3', show: learnLines(['240 × 3 = <strong>720 มิลลิลิตร</strong>']) },
            ],
        }],
    },
    {
        id: 'p3symmetry', menu: 'แกนสมมาตร', title: 'แกนสมมาตร (ป.3)', label: 'แกนสมมาตร (ป.3)',
        intro: 'บอกว่ารูปใดมีแกนสมมาตร และมีกี่แกน', icon: 'bi-symmetry-vertical', op: 'shape',
        modes: [
            { label: 'มีหรือไม่', build: symmetryHasQuestion },
            { label: 'มีกี่แกน', build: symmetryCountQuestion },
        ],
        learn: [{
            label: 'พับครึ่ง',
            title: 'ตัวอย่าง: รูปสี่เหลี่ยมผืนผ้า',
            steps: [
                { say: '<strong>แกนสมมาตร</strong>คือเส้นที่พับรูปแล้วสองข้างทับกันสนิทพอดี', show: polygonFigure('5,25 125,25 125,95 5,95', 'รูปสี่เหลี่ยมผืนผ้า') },
                { say: 'พับตามแนวตั้งผ่านกึ่งกลาง สองข้างทับกันพอดี และพับตามแนวนอนก็เช่นกัน', show: learnLines(['แนวตั้ง 1 แกน', 'แนวนอน 1 แกน']) },
                { say: 'แต่พับตามเส้นทแยงมุมแล้วไม่ทับกัน จึงไม่นับ', show: learnLines(['<strong>มีแกนสมมาตร 2 แกน</strong>']) },
            ],
        }],
    },
    {
        id: 'p3chart', menu: 'แผนภูมิรูปภาพและตาราง', title: 'แผนภูมิรูปภาพและตาราง (ป.3)', label: 'แผนภูมิและตาราง (ป.3)',
        intro: 'อ่านและเขียนแผนภูมิรูปภาพ และอ่านตารางทางเดียว', icon: 'bi-table', op: 'barchart',
        modes: [
            { label: 'อ่านแผนภูมิ', build: pictographReadQuestion },
            { label: 'เขียนแผนภูมิ', build: pictographDrawQuestion },
            { label: 'ตารางทางเดียว', build: oneWayTableQuestion },
        ],
        learn: [{
            label: 'อ่านแผนภูมิ',
            title: 'ตัวอย่าง: 1 รูป แทน 5 คน',
            steps: [
                { say: 'ดูก่อนว่า 1 รูปแทนกี่หน่วย', show: renderPictograph(LEARN_PICTOGRAPH_TOPIC, LEARN_PICTOGRAPH_ROWS, 5) },
                { say: 'ส้มมี 4 รูป แต่ละรูปแทน 5 คน จึงคูณกัน', show: learnLines(['4 × 5 = <strong>20 คน</strong>']) },
            ],
        }],
    },
]);

lessonIndicators.p3 = [
    { code: 'ค 1.1 ป.3/1', text: 'อ่านและเขียนตัวเลขฮินดูอารบิก ตัวเลขไทย และตัวหนังสือ แสดงจำนวนนับไม่เกิน 100,000 และ 0', lesson: 'p3number' },
    { code: 'ค 1.1 ป.3/2', text: 'เปรียบเทียบและเรียงลำดับจำนวนนับไม่เกิน 100,000 จากสถานการณ์ต่าง ๆ', lesson: 'p3compare' },
    { code: 'ค 1.1 ป.3/3', text: 'บอก อ่าน และเขียนเศษส่วน แสดงปริมาณสิ่งต่าง ๆ และแสดงสิ่งต่าง ๆ ตามเศษส่วนที่กำหนด', lesson: 'p3fraction' },
    { code: 'ค 1.1 ป.3/4', text: 'เปรียบเทียบเศษส่วนที่ตัวเศษเท่ากัน โดยที่ตัวเศษน้อยกว่าหรือเท่ากับตัวส่วน', lesson: 'p3fraction' },
    { code: 'ค 1.1 ป.3/5', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์แสดงการบวกและการลบของจำนวนนับไม่เกิน 100,000 และ 0', lesson: 'p3missing', also: ['p3addsub'] },
    { code: 'ค 1.1 ป.3/6', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์แสดงการคูณของจำนวน 1 หลักกับจำนวนไม่เกิน 4 หลัก และจำนวน 2 หลักกับจำนวน 2 หลัก', lesson: 'p3multiply', also: ['p3missing'] },
    { code: 'ค 1.1 ป.3/7', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์แสดงการหารที่ตัวตั้งไม่เกิน 4 หลัก ตัวหาร 1 หลัก', lesson: 'p3divide', also: ['p3missing'] },
    { code: 'ค 1.1 ป.3/8', text: 'หาผลลัพธ์การบวก ลบ คูณ หารระคนของจำนวนนับไม่เกิน 100,000 และ 0', lesson: 'p3mixed' },
    { code: 'ค 1.1 ป.3/9', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหา 2 ขั้นตอนของจำนวนนับไม่เกิน 100,000 และ 0', lesson: 'p3wordproblem' },
    { code: 'ค 1.1 ป.3/10', text: 'หาผลบวกของเศษส่วนที่มีตัวส่วนเท่ากันและผลบวกไม่เกิน 1 และหาผลลบของเศษส่วนที่มีตัวส่วนเท่ากัน', lesson: 'p3fractionsum' },
    { code: 'ค 1.1 ป.3/11', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวกและการลบเศษส่วนที่มีตัวส่วนเท่ากัน', lesson: 'p3fractionsum' },
    { code: 'ค 1.2 ป.3/1', text: 'ระบุจำนวนที่หายไปในแบบรูปของจำนวนที่เพิ่มขึ้นหรือลดลงทีละเท่า ๆ กัน', lesson: 'p3pattern' },
    { code: 'ค 2.1 ป.3/1', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับเงิน', lesson: 'p3money' },
    { code: 'ค 2.1 ป.3/2', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับเวลาและระยะเวลา', lesson: 'p3time' },
    { code: 'ค 2.1 ป.3/3', text: 'เลือกใช้เครื่องวัดความยาวที่เหมาะสม วัดและบอกความยาวเป็นเซนติเมตรและมิลลิเมตร เมตรและเซนติเมตร', lesson: 'p3length' },
    { code: 'ค 2.1 ป.3/4', text: 'คาดคะเนความยาวเป็นเมตรและเป็นเซนติเมตร', lesson: 'p3length' },
    { code: 'ค 2.1 ป.3/5', text: 'เปรียบเทียบความยาวระหว่างเซนติเมตรกับมิลลิเมตร เมตรกับเซนติเมตร กิโลเมตรกับเมตร จากสถานการณ์ต่าง ๆ', lesson: 'p3length' },
    { code: 'ค 2.1 ป.3/6', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับความยาวที่มีหน่วยเป็นเซนติเมตรและมิลลิเมตร เมตรและเซนติเมตร กิโลเมตรและเมตร', lesson: 'p3length' },
    { code: 'ค 2.1 ป.3/7', text: 'เลือกใช้เครื่องชั่งที่เหมาะสม วัดและบอกน้ำหนักเป็นกิโลกรัมและขีด กิโลกรัมและกรัม', lesson: 'p3weight' },
    { code: 'ค 2.1 ป.3/8', text: 'คาดคะเนน้ำหนักเป็นกิโลกรัมและเป็นขีด', lesson: 'p3weight' },
    { code: 'ค 2.1 ป.3/9', text: 'เปรียบเทียบน้ำหนักระหว่างกิโลกรัมกับกรัม เมตริกตันกับกิโลกรัม จากสถานการณ์ต่าง ๆ', lesson: 'p3weight' },
    { code: 'ค 2.1 ป.3/10', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับน้ำหนักที่มีหน่วยเป็นกิโลกรัมกับกรัม เมตริกตันกับกิโลกรัม', lesson: 'p3weight' },
    { code: 'ค 2.1 ป.3/11', text: 'เลือกใช้เครื่องตวงที่เหมาะสม วัดและเปรียบเทียบปริมาตร ความจุเป็นลิตรและมิลลิลิตร', lesson: 'p3capacity' },
    { code: 'ค 2.1 ป.3/12', text: 'คาดคะเนปริมาตรและความจุเป็นลิตร', lesson: 'p3capacity' },
    { code: 'ค 2.1 ป.3/13', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับปริมาตรและความจุที่มีหน่วยเป็นลิตรและมิลลิลิตร ช้อนชา ช้อนโต๊ะ ถ้วยตวง', lesson: 'p3capacity' },
    { code: 'ค 2.2 ป.3/1', text: 'ระบุรูปเรขาคณิตสองมิติที่มีแกนสมมาตรและจำนวนแกนสมมาตร', lesson: 'p3symmetry' },
    { code: 'ค 3.1 ป.3/1', text: 'เขียนแผนภูมิรูปภาพ และใช้ข้อมูลจากแผนภูมิรูปภาพในการหาคำตอบของโจทย์ปัญหา', lesson: 'p3chart' },
    { code: 'ค 3.1 ป.3/2', text: 'เขียนตารางทางเดียวจากข้อมูลที่เป็นจำนวนนับ และใช้ข้อมูลจากตารางทางเดียวในการหาคำตอบของโจทย์ปัญหา', lesson: 'p3chart' },
];
