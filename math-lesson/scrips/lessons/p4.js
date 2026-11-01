// ป.4, following ตัวชี้วัดและสาระการเรียนรู้แกนกลาง คณิตศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560).

const ROUND_UNITS = [
    { size: 10, name: 'สิบ' }, { size: 100, name: 'ร้อย' },
    { size: 1000, name: 'พัน' }, { size: 10000, name: 'หมื่น' },
];

function roundTo(value, size) {
    return Math.round(value / size) * size;
}

function roundingQuestion() {
    let unit = pickOne(ROUND_UNITS);
    let number = randomInt(unit.size * 2, unit.size * 900);

    return { text: `ค่าประมาณเป็นจำนวนเต็ม${unit.name}ของ ${commaNumber(number)} คือเท่าใด`, answer: roundTo(number, unit.size) };
}

function estimateSumQuestion() {
    let size = pickOne([100, 1000, 10000]);
    let name = ROUND_UNITS.find(function (unit) { return unit.size === size; }).name;
    let first = randomInt(size * 12, size * 90), second = randomInt(size * 2, size * 10);

    if (Math.random() < 0.5) {
        return { text: `ปัดเป็นจำนวนเต็ม${name}ก่อน แล้วประมาณผลลัพธ์ของ ${commaNumber(first)} + ${commaNumber(second)}`, answer: roundTo(first, size) + roundTo(second, size) };
    }
    return { text: `ปัดเป็นจำนวนเต็ม${name}ก่อน แล้วประมาณผลลัพธ์ของ ${commaNumber(first)} − ${commaNumber(second)}`, answer: roundTo(first, size) - roundTo(second, size) };
}

function estimateProductQuestion() {
    let first = randomInt(12, 98), second = randomInt(12, 98);
    return { text: `ปัดเป็นจำนวนเต็มสิบก่อน แล้วประมาณผลลัพธ์ของ ${first} × ${second}`, answer: roundTo(first, 10) * roundTo(second, 10) };
}

function estimateQuotientQuestion() {
    let divisor = pickOne([2, 3, 4, 5, 6, 8]);
    let wholes = randomInt(2, 12) * divisor * 100;
    let dividend = wholes + randomInt(-40, 40);

    return { text: `ปัดตัวตั้งเป็นจำนวนเต็มร้อยก่อน แล้วประมาณผลลัพธ์ของ ${commaNumber(dividend)} ÷ ${divisor}`, answer: wholes / divisor };
}

function p4WordProblem() {
    let templates = [
        function () {
            let first = randomInt(120000, 480000), more = randomInt(12000, 98000);
            return { text: `โรงงานผลิตดินสอเดือนแรก ${commaNumber(first)} แท่ง เดือนที่สองผลิตมากกว่าเดือนแรก ${commaNumber(more)} แท่ง สองเดือนผลิตรวมกี่แท่ง`, answer: first + first + more };
        },
        function () {
            let men = randomInt(210000, 690000), women = randomInt(210000, 690000), moved = randomInt(11000, 99000);
            return { text: `จังหวัดหนึ่งมีผู้ชาย ${commaNumber(men)} คน ผู้หญิง ${commaNumber(women)} คน ย้ายออกไป ${commaNumber(moved)} คน เหลือประชากรกี่คน`, answer: men + women - moved };
        },
        function () {
            let bags = randomInt(1200, 9800), each = pickOne([5, 10, 25]), price = randomInt(21, 89);
            return { text: `มีข้าวสาร ${commaNumber(bags * each)} กิโลกรัม บรรจุถุงละ ${each} กิโลกรัม ขายถุงละ ${price} บาท ขายหมดได้เงินกี่บาท`, answer: bags * price };
        },
        function () {
            let cost = randomInt(11, 49) * 1000, count = randomInt(11, 39), have = cost * count + randomInt(1, 90) * 1000;
            return { text: `มีเงิน ${commaNumber(have)} บาท ซื้อคอมพิวเตอร์ ${count} เครื่อง เครื่องละ ${commaNumber(cost)} บาท เหลือเงินกี่บาท`, answer: have - cost * count };
        },
    ];

    return pickOne(templates)();
}

function fractionKindQuestion() {
    let denominator = randomInt(2, 12), kinds = ['เศษส่วนแท้', 'เศษเกิน', 'จำนวนคละ'];
    let kind = pickOne(kinds);

    if (kind === 'เศษส่วนแท้') {
        return { text: `${randomInt(1, denominator - 1)}/${denominator} เป็นจำนวนชนิดใด`, answer: kind, choices: kinds };
    }
    if (kind === 'เศษเกิน') {
        return { text: `${randomInt(denominator, denominator * 3)}/${denominator} เป็นจำนวนชนิดใด`, answer: kind, choices: kinds };
    }
    return { text: `${randomInt(1, 9)} ${randomInt(1, denominator - 1)}/${denominator} เป็นจำนวนชนิดใด`, answer: kind, choices: kinds };
}

function improperToMixedQuestion() {
    let denominator = randomInt(2, 12), whole = randomInt(1, 9), rest = randomInt(1, denominator - 1);
    let top = whole * denominator + rest;

    return {
        text: `${top}/${denominator} เขียนเป็นจำนวนคละได้อย่างไร`,
        fields: [{ label: 'จำนวนเต็ม', value: whole }, { label: 'ตัวเศษ', value: rest }, { label: 'ตัวส่วน', value: denominator }],
        fraction: { top: top, bottom: denominator },
        same: function (values) {
            return values[2] > 0 && values[1] < values[2] && (values[0] * values[2] + values[1]) * denominator === top * values[2];
        },
    };
}

function mixedToImproperQuestion() {
    let denominator = randomInt(2, 12), whole = randomInt(1, 9), rest = randomInt(1, denominator - 1);
    return Object.assign({ text: `${whole} ${rest}/${denominator} เขียนเป็นเศษเกินได้อย่างไร` }, fractionFields(whole * denominator + rest, denominator, true));
}

function fractionMultipleCompareQuestion() {
    let first = randomInt(2, 6), second = first * randomInt(2, 4);
    let top = randomInt(1, first - 1), other = randomInt(1, second - 1);

    return compareQuestion(`${top}/${first} □ ${other}/${second} เครื่องหมายใดเติมใน □ ได้ถูกต้อง`, top * second, other * first);
}

function fractionPair() {
    let small = randomInt(2, 6), large = small * randomInt(2, 4);
    let top = randomInt(1, small - 1), other = randomInt(1, large - 1);
    let isSmallFirst = Math.random() < 0.5;

    return {
        large: large,
        firstTop: isSmallFirst ? top * large / small : other,
        secondTop: isSmallFirst ? other : top * large / small,
        firstText: isSmallFirst ? `${top}/${small}` : `${other}/${large}`,
        secondText: isSmallFirst ? `${other}/${large}` : `${top}/${small}`,
    };
}

function fractionMultipleSum() {
    let pair = fractionPair();
    return Object.assign({ text: `${pair.firstText} + ${pair.secondText} เท่ากับเท่าใด (ตอบเป็นเศษส่วนหรือเศษเกิน)` }, fractionFields(pair.firstTop + pair.secondTop, pair.large));
}

function fractionMultipleDifference() {
    let pair = fractionPair();
    let isFirstLarger = pair.firstTop > pair.secondTop;

    if (pair.firstTop === pair.secondTop) {
        return fractionMultipleDifference();
    }

    let larger = isFirstLarger ? pair.firstText : pair.secondText;
    let smaller = isFirstLarger ? pair.secondText : pair.firstText;

    return Object.assign({ text: `${larger} − ${smaller} เท่ากับเท่าใด` }, fractionFields(Math.abs(pair.firstTop - pair.secondTop), pair.large));
}

function mixedMultipleSum() {
    let pair = fractionPair();
    let firstWhole = randomInt(1, 6), secondWhole = randomInt(1, 6);
    let top = (firstWhole + secondWhole) * pair.large + pair.firstTop + pair.secondTop;

    return Object.assign({ text: `${firstWhole} ${pair.firstText} + ${secondWhole} ${pair.secondText} เท่ากับเท่าใด (ตอบเป็นเศษเกิน)` }, fractionFields(top, pair.large));
}

function fractionMultipleWord() {
    let pair = fractionPair();
    let top = pair.firstTop + pair.secondTop;

    return Object.assign({ text: `วันแรกทาสีรั้วได้ ${pair.firstText} ของรั้ว วันที่สองทาได้ ${pair.secondText} ของรั้ว สองวันทาสีได้รวมกี่ส่วนของรั้ว` }, fractionFields(top, pair.large));
}

function decimalDigitWords(text) {
    return text.split('').map(function (digit) { return thaiDigitWords[+digit]; }).join('');
}

function decimalText(value, places) {
    return value.toFixed(places);
}

function randomDecimal(wholeMax, places) {
    // rounded, because 1 + 0.59 is stored as 1.5899999999999999
    return +(randomInt(0, wholeMax) + randomInt(1, Math.pow(10, places) - 1) / Math.pow(10, places)).toFixed(places);
}

function decimalWordsQuestion() {
    let places = randomInt(1, 3);
    let value = randomDecimal(99, places);
    let parts = decimalText(value, places).split('.');

    return { text: `${thaiNumberWords(+parts[0])}จุด${decimalDigitWords(parts[1])} เขียนเป็นทศนิยมได้อย่างไร`, answer: value };
}

function decimalPlaceQuestion() {
    let places = 3, value = randomInt(1, 9) + randomInt(111, 999) / 1000;
    let text = decimalText(value, places);
    let digits = text.split('.')[1].split('').map(Number);
    let chosen = pickOne([0, 1, 2].filter(function (index) { return digits[index]; }));
    let names = ['ส่วนสิบ', 'ส่วนร้อย', 'ส่วนพัน'];

    return { text: `ในทศนิยม ${text} เลขโดด ${digits[chosen]} ในหลัก${names[chosen]} มีค่าเท่าใด`, answer: +(digits[chosen] * Math.pow(10, -(chosen + 1))).toFixed(3) };
}

function decimalCompareQuestion() {
    let places = randomInt(1, 3), otherPlaces = randomInt(1, 3);
    let first = randomDecimal(9, places);
    let second = Math.random() < 0.15 ? first : +(first + pickOne([-1, 1]) * pickOne([0.1, 0.01, 0.05])).toFixed(otherPlaces);

    if (second <= 0) {
        return decimalCompareQuestion();
    }

    let secondText = second === first ? decimalText(first, places) : decimalText(second, otherPlaces);

    return compareQuestion(`${decimalText(first, places)} □ ${secondText} เครื่องหมายใดเติมใน □ ได้ถูกต้อง`, +decimalText(first, places), +secondText);
}

function decimalSumQuestion() {
    let first = randomDecimal(90, randomInt(1, 3)), second = randomDecimal(90, randomInt(1, 3));
    return { text: `${first} + ${second} เท่ากับเท่าใด`, answer: +(first + second).toFixed(3) };
}

function decimalDifferenceQuestion() {
    let first = randomDecimal(90, randomInt(1, 3)), second = randomDecimal(90, randomInt(1, 3));
    let larger = Math.max(first, second), smaller = Math.min(first, second);

    if (larger === smaller) {
        return decimalDifferenceQuestion();
    }
    return { text: `${larger} − ${smaller} เท่ากับเท่าใด`, answer: +(larger - smaller).toFixed(3) };
}

function decimalWordQuestion() {
    let name = pickOne(wordNames);
    let first = randomInt(120, 950) / 100, second = randomInt(120, 950) / 100, used = randomInt(50, 110) / 100;

    return { text: `${name}ซื้อน้ำตาล ${first} กิโลกรัม และแป้ง ${second} กิโลกรัม ใช้ทำขนมไป ${used} กิโลกรัม เหลือของหนักกี่กิโลกรัม`, answer: +(first + second - used).toFixed(3), unit: 'กิโลกรัม' };
}

const TIME_PAIRS = [
    { big: 'นาที', small: 'วินาที', rate: 60, step: 5 },
    { big: 'ชั่วโมง', small: 'นาที', rate: 60, step: 5 },
    { big: 'วัน', small: 'ชั่วโมง', rate: 24, step: 1 },
    { big: 'สัปดาห์', small: 'วัน', rate: 7, step: 1 },
    { big: 'ปี', small: 'เดือน', rate: 12, step: 1 },
];

function timetableQuestion() {
    let stops = shuffleList(['บางปะอิน', 'อยุธยา', 'สระบุรี', 'ลพบุรี', 'นครสวรรค์']).slice(0, 4);
    let start = randomInt(6, 12) * 60 + randomInt(0, 11) * 5;
    let times = [start];

    stops.slice(1).forEach(function () {
        times.push(times[times.length - 1] + randomInt(4, 15) * 5);
    });

    let from = randomInt(0, 2), to = randomInt(from + 1, 3);
    let rows = stops.map(function (stop, index) {
        return [stop, dotTime(Math.floor(times[index] / 60), times[index] % 60)];
    });

    return {
        text: `รถไฟออกจาก${stops[from]}ไปถึง${stops[to]} ใช้เวลากี่นาที`,
        figure: lessonTable(['สถานี', 'เวลา'], rows),
        answer: times[to] - times[from],
        unit: 'นาที',
    };
}

function angleEnd(degrees, length) {
    let radians = degrees * Math.PI / 180;
    return { x: 150 + length * Math.cos(radians), y: 100 - length * Math.sin(radians) };
}

function angleFigure(degrees, labels) {
    let end = angleEnd(degrees, 85), start = angleEnd(0, 85);
    let arcStart = angleEnd(0, 26), arcEnd = angleEnd(degrees, 26);
    let names = !labels ? '' : `<text x="150" y="126" text-anchor="middle" class="figure-text">${labels[1]}</text>
        <text x="${start.x + 12}" y="${start.y + 5}" class="figure-text">${labels[0]}</text>
        <text x="${angleEnd(degrees, 100).x}" y="${angleEnd(degrees, 100).y + 5}" text-anchor="middle" class="figure-text">${labels[2]}</text>`;

    return `<svg viewBox="0 0 300 200" width="300" height="200" role="img" aria-label="มุมขนาดหนึ่งบนจุดยอด">
        <path class="figure-arc" d="M ${arcStart.x} ${arcStart.y} A 26 26 0 ${degrees > 180 ? 1 : 0} 0 ${arcEnd.x} ${arcEnd.y}"/>
        <line class="figure-line" x1="150" y1="100" x2="${start.x}" y2="${start.y}"/>
        <line class="figure-line" x1="150" y1="100" x2="${end.x}" y2="${end.y}"/>
        ${names}
    </svg>`;
}

function protractorFigure(degrees) {
    let ticks = '';

    for (let mark = 0; mark <= 180; mark += 5) {
        let radians = mark * Math.PI / 180;
        let outer = 130, inner = mark % 10 ? 124 : 118;
        ticks += `<line class="figure-tick" x1="${150 + inner * Math.cos(radians)}" y1="${150 - inner * Math.sin(radians)}" x2="${150 + outer * Math.cos(radians)}" y2="${150 - outer * Math.sin(radians)}"/>`;
        if (mark % 30 === 0) {
            ticks += `<text class="figure-text" text-anchor="middle" x="${150 + 104 * Math.cos(radians)}" y="${155 - 104 * Math.sin(radians)}">${mark}</text>`;
        }
    }

    let radians = degrees * Math.PI / 180;

    return `<svg viewBox="0 0 300 165" width="300" height="165" role="img" aria-label="โพรแทรกเตอร์วัดมุม">
        <path class="figure-arc" d="M 20 150 A 130 130 0 0 1 280 150 Z"/>
        ${ticks}
        <line class="figure-line" x1="150" y1="150" x2="280" y2="150"/>
        <line class="figure-line" x1="150" y1="150" x2="${150 + 130 * Math.cos(radians)}" y2="${150 - 130 * Math.sin(radians)}"/>
    </svg>`;
}

function angleKind(degrees) {
    if (degrees < 90) { return 'มุมแหลม'; }
    if (degrees === 90) { return 'มุมฉาก'; }
    if (degrees < 180) { return 'มุมป้าน'; }
    if (degrees === 180) { return 'มุมตรง'; }
    return 'มุมกลับ';
}

function angleKindQuestion() {
    let degrees = pickOne([randomInt(3, 17) * 5, 90, randomInt(19, 35) * 5, 180, randomInt(37, 69) * 5]);
    let kinds = ['มุมแหลม', 'มุมฉาก', 'มุมป้าน', 'มุมตรง', 'มุมกลับ'];

    if (Math.random() < 0.5) {
        return { text: 'มุมในรูปนี้เป็นมุมชนิดใด', figure: angleFigure(degrees), answer: angleKind(degrees), choices: kinds };
    }
    return { text: `มุมขนาด ${degrees} องศา เป็นมุมชนิดใด`, answer: angleKind(degrees), choices: kinds };
}

function protractorQuestion() {
    let degrees = randomInt(2, 34) * 5;
    return { text: 'มุมในรูปนี้มีขนาดกี่องศา', figure: protractorFigure(degrees), answer: degrees, unit: 'องศา' };
}

function angleNameQuestion() {
    let names = shuffleList(['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ']).slice(0, 3);
    let degrees = randomInt(5, 30) * 5;
    let figure = angleFigure(degrees, names);

    if (Math.random() < 0.5) {
        return choiceQuestion('จุดใดเป็นจุดยอดของมุมในรูปนี้', names[1], [names[0], names[2]], figure);
    }
    return choiceQuestion('มุมในรูปนี้เขียนแทนด้วยสัญลักษณ์ใด', `∠${names[0]}${names[1]}${names[2]}`, [`∠${names[1]}${names[0]}${names[2]}`, `∠${names[0]}${names[2]}${names[1]}`], figure);
}

function rectangleFigure(width, height, unit) {
    return `<svg viewBox="0 0 260 150" width="260" height="150" role="img" aria-label="รูปสี่เหลี่ยมผืนผ้า กว้าง ${height} ยาว ${width} ${unit}">
        <rect class="shape-fill" x="50" y="20" width="170" height="90"/>
        <text class="figure-text" text-anchor="middle" x="135" y="132">${width} ${unit}</text>
        <text class="figure-text" text-anchor="end" x="44" y="70">${height} ${unit}</text>
    </svg>`;
}

function rectangleSides() {
    let height = randomInt(2, 30), width = height + randomInt(1, 30);
    return Object.assign({ width: width, height: height }, pickOne([{ unit: 'ซม.', area: 'ตารางเซนติเมตร' }, { unit: 'ม.', area: 'ตารางเมตร' }]));
}

function rectanglePerimeterQuestion() {
    let side = rectangleSides();
    return { text: 'รูปสี่เหลี่ยมผืนผ้านี้มีความยาวรอบรูปเท่าใด', figure: rectangleFigure(side.width, side.height, side.unit), answer: 2 * (side.width + side.height), unit: side.unit };
}

function rectangleAreaQuestion() {
    let side = rectangleSides();
    return { text: 'รูปสี่เหลี่ยมผืนผ้านี้มีพื้นที่เท่าใด', figure: rectangleFigure(side.width, side.height, side.unit), answer: side.width * side.height, unit: side.area };
}

function rectangleMissingSideQuestion() {
    let side = rectangleSides();

    if (Math.random() < 0.5) {
        return { text: `รูปสี่เหลี่ยมผืนผ้ามีพื้นที่ ${side.width * side.height} ${side.area} กว้าง ${side.height} ${side.unit} ยาวเท่าใด`, answer: side.width, unit: side.unit };
    }
    return { text: `รูปสี่เหลี่ยมผืนผ้ามีความยาวรอบรูป ${2 * (side.width + side.height)} ${side.unit} ยาว ${side.width} ${side.unit} กว้างเท่าใด`, answer: side.height, unit: side.unit };
}

function rectangleWordQuestion() {
    let side = rectangleSides();
    let price = randomInt(3, 12) * 50;

    if (Math.random() < 0.5) {
        return { text: `ห้องกว้าง ${side.height} เมตร ยาว ${side.width} เมตร ปูพื้นตารางเมตรละ ${price} บาท เสียเงินกี่บาท`, answer: side.width * side.height * price, unit: 'บาท' };
    }
    return { text: `สวนกว้าง ${side.height} เมตร ยาว ${side.width} เมตร ล้อมรั้วรอบสวนเมตรละ ${price} บาท เสียเงินกี่บาท`, answer: 2 * (side.width + side.height) * price, unit: 'บาท' };
}

function twoWayTableQuestion() {
    let rooms = ['ป.4/1', 'ป.4/2', 'ป.4/3'];
    let rows = rooms.map(function (room) { return { room: room, boys: randomInt(12, 25), girls: randomInt(12, 25) }; });
    let figure = lessonTable(['ห้อง', 'ชาย (คน)', 'หญิง (คน)', 'รวม (คน)'], rows.map(function (row) {
        return [row.room, row.boys, row.girls, row.boys + row.girls];
    }));
    let picked = pickOne(rows);
    let boys = rows.reduce(function (sum, row) { return sum + row.boys; }, 0);
    let girls = rows.reduce(function (sum, row) { return sum + row.girls; }, 0);
    let questions = [
        { text: `ห้อง ${picked.room} มีนักเรียนหญิงกี่คน`, answer: picked.girls },
        { text: 'ทั้งสามห้องมีนักเรียนชายรวมกี่คน', answer: boys },
        { text: 'ทั้งสามห้องมีนักเรียนหญิงรวมกี่คน', answer: girls },
        { text: `ห้อง ${picked.room} มีนักเรียนชายมากกว่าหรือน้อยกว่าหญิงกี่คน`, answer: Math.abs(picked.boys - picked.girls) },
    ];

    return Object.assign({ figure: figure, unit: 'คน' }, pickOne(questions));
}

addLessons('p4', [
    {
        id: 'p4number', menu: 'จำนวนที่มากกว่า 100,000', title: 'จำนวนที่มากกว่า 100,000 (ป.4)', label: 'จำนวนมากกว่า 100,000 (ป.4)',
        intro: 'อ่านและเขียนจำนวน รู้ค่าประจำหลักถึงหลักล้าน', icon: 'bi-123', op: 'placevalue',
        modes: [
            { label: 'ตัวหนังสือ', build: function () { let n = randomInt(100001, 9999999); return { text: `${thaiNumberWords(n)} เขียนเป็นตัวเลขได้อย่างไร`, answer: n }; } },
            { label: 'เลขไทย', build: function () { let n = randomInt(100001, 9999999); return { text: `${toThaiDigits(n)} เขียนเป็นเลขฮินดูอารบิกได้อย่างไร`, answer: n }; } },
            { label: 'ค่าของเลขโดด', build: function () { return placeValueQuestion(randomInt(1000000, 9999999)); } },
            { label: 'รูปกระจาย', build: function () { return expandedNumberQuestion(randomInt(100000, 9999999)); } },
        ],
        learn: [{
            label: 'อ่านจำนวนใหญ่',
            title: 'ตัวอย่าง: 3,405,062',
            steps: [
                { say: 'เรียงชื่อหลักจากขวาไปซ้าย หน่วย สิบ ร้อย พัน หมื่น แสน ล้าน', show: learnColumn('3405062', '', '', { head: ['ล้าน', 'แสน', 'หมื่น', 'พัน', 'ร้อย', 'สิบ', 'หน่วย'] }) },
                { say: 'อ่านทีละหลัก หลักที่เป็น 0 ข้ามไป', show: learnLines(['สามล้านสี่แสนห้าพันหกสิบสอง']) },
                { say: 'เลขโดดมีค่าตามหลัก 4 อยู่หลักแสน จึงมีค่า 400,000', show: learnLines(['3,000,000 + 400,000 + 5,000 + 60 + 2']) },
            ],
        }],
    },
    {
        id: 'p4compare', menu: 'เปรียบเทียบและค่าประมาณ', title: 'เปรียบเทียบและค่าประมาณ (ป.4)', label: 'เปรียบเทียบและค่าประมาณ (ป.4)',
        intro: 'เปรียบเทียบ เรียงลำดับ และหาค่าประมาณของจำนวนนับ', icon: 'bi-arrow-left-right', op: 'compare',
        modes: [
            { label: 'เปรียบเทียบ', build: function () { return numberCompareQuestion(100000, 10000000); } },
            { label: 'เรียงลำดับ', build: function () { return numberOrderQuestion(10000000); } },
            { label: 'ค่าประมาณ', build: roundingQuestion },
        ],
        learn: [{
            label: 'ค่าประมาณ',
            title: 'ตัวอย่าง: ค่าประมาณเป็นจำนวนเต็มร้อยของ 3,461',
            steps: [
                { say: 'ดูหลักที่ถัดจากหลักร้อยลงไป คือหลักสิบ', show: learnLines(['3,4<strong>6</strong>1']) },
                { say: 'ถ้าเป็น 5 ขึ้นไปให้ปัดขึ้น ถ้าน้อยกว่า 5 ให้ปัดลง 6 จึงปัดขึ้น', show: learnLines(['3,461 ≈ <strong>3,500</strong>']) },
            ],
        }],
    },
    {
        id: 'p4estimate', menu: 'ประมาณผลลัพธ์', title: 'ประมาณผลลัพธ์ (ป.4)', label: 'ประมาณผลลัพธ์ (ป.4)',
        intro: 'ปัดจำนวนก่อน แล้วคิดผลลัพธ์อย่างรวดเร็ว', icon: 'bi-speedometer2', op: 'compare',
        modes: [
            { label: 'บวก ลบ', build: estimateSumQuestion },
            { label: 'คูณ', build: estimateProductQuestion },
            { label: 'หาร', build: estimateQuotientQuestion },
        ],
        learn: [{
            label: 'ปัดก่อนคิด',
            title: 'ตัวอย่าง: 38 × 52',
            steps: [
                { say: 'ปัดแต่ละจำนวนเป็นจำนวนเต็มสิบ', show: learnLines(['38 ≈ 40', '52 ≈ 50']) },
                { say: 'คูณจำนวนที่ปัดแล้ว ซึ่งคิดในใจได้ง่าย', show: learnLines(['40 × 50 = <strong>2,000</strong>']) },
                { say: 'ค่าจริงคือ 1,976 ใกล้เคียงมาก จึงใช้ตรวจคำตอบได้ว่าคิดถูกทางหรือไม่', show: learnLines(['38 × 52 = 1,976']) },
            ],
        }],
    },
    {
        id: 'p4addsub', menu: 'บวกและลบ', title: 'บวกและลบ (ป.4)', label: 'บวกและลบ (ป.4)',
        intro: 'บวกและลบจำนวนที่มากกว่า 100,000', icon: 'bi-plus-slash-minus', op: 'plus',
        modes: [
            { label: 'บวก', build: function () { return sumQuestion(10000000); } },
            { label: 'ลบ', build: function () { return differenceQuestion(10000000); } },
        ],
        learn: [{
            label: 'ตั้งบวก',
            title: 'ตัวอย่าง: 452,780 + 136,450',
            steps: [
                { say: 'ตั้งเลขให้หลักตรงกัน แล้วคิดจากหลักหน่วยไปทางซ้าย', show: learnColumn('452780', '136450', '+') },
                { say: 'ถ้าผลรวมถึงสิบ ให้ทดไปหลักถัดไป เหมือนจำนวนเล็ก', show: learnColumn('452780', '136450', '+', { carry: ['', '', '1', '1', '', ''], answer: '589230' }) },
            ],
        }],
    },
    {
        id: 'p4muldiv', menu: 'คูณและหาร', title: 'คูณและหาร (ป.4)', label: 'คูณและหาร (ป.4)',
        intro: 'คูณจำนวนหลายหลัก และหารด้วยตัวหารไม่เกิน 2 หลัก', icon: 'bi-x-circle-fill', op: 'multiply',
        modes: [
            { label: 'คูณ', build: function () { return productQuestion(101, 999, 11, 99); } },
            { label: 'หารลงตัว', build: function () { return exactDivisionQuestion(11, 99, 99999); } },
            { label: 'หารมีเศษ', build: function () { return remainderDivisionQuestion(11, 99, 99999); } },
        ],
        learn: [{
            label: 'หารด้วย 2 หลัก',
            title: 'ตัวอย่าง: 1,512 ÷ 24',
            steps: [
                { say: 'ลองประมาณว่า 24 เข้า 151 ได้กี่ครั้ง 24 × 6 = 144 ใกล้ที่สุด', show: learnLines(['151 − 144 = 7']) },
                { say: 'ดึงหลักถัดไปลงมาเป็น 72 แล้วหาร 24 ต่อ', show: learnLines(['24 × 3 = 72']) },
                { say: 'ไม่เหลือเศษ ได้ผลหาร 63 ตรวจด้วยการคูณกลับ', show: learnLines(['<strong>1,512 ÷ 24 = 63</strong>', '63 × 24 = 1,512']) },
            ],
        }],
    },
    {
        id: 'p4mixed', menu: 'บวก ลบ คูณ หารระคน', title: 'บวก ลบ คูณ หารระคน (ป.4)', label: 'ระคน (ป.4)',
        intro: 'คิดให้ถูกลำดับกับจำนวนที่ใหญ่ขึ้น', icon: 'bi-calculator-fill', op: 'average',
        modes: [{ label: 'ระคน', build: function () { return mixedSumQuestion(1000); } }],
        learn: [{
            label: 'ลำดับการคิด',
            title: 'ตัวอย่าง: (24,000 + 16,000) × 3',
            steps: [
                { say: 'ทำในวงเล็บก่อน', show: learnLines(['24,000 + 16,000 = 40,000']) },
                { say: 'แล้วคูณ ถ้าไม่มีวงเล็บให้ทำคูณหารก่อนบวกลบ', show: learnLines(['40,000 × 3 = <strong>120,000</strong>']) },
            ],
        }],
    },
    {
        id: 'p4missing', menu: 'หาตัวไม่ทราบค่า', title: 'หาตัวไม่ทราบค่า (ป.4)', label: 'ตัวไม่ทราบค่า (ป.4)',
        intro: 'หาจำนวนใน □ ของประโยคสัญลักษณ์ที่จำนวนใหญ่ขึ้น', icon: 'bi-question-square-fill', op: 'numberbond',
        modes: [
            { label: 'บวก ลบ', build: function () { return missingAddendQuestion(10000000); } },
            { label: 'คูณ', build: function () { return missingFactorQuestion(101, 9999, 11, 99); } },
            { label: 'หาร', build: function () { return missingDivisionQuestion(11, 99, 100, 9999); } },
        ],
        learn: [{
            label: 'ใช้การดำเนินการตรงข้าม',
            title: 'ตัวอย่าง: □ × 25 = 7,500',
            steps: [
                { say: 'การคูณกับการหารเป็นคู่ตรงข้ามกัน จึงหาคำตอบด้วยการหาร', show: learnLines(['□ = 7,500 ÷ 25']) },
                { say: 'คิดผลลัพธ์', show: learnLines(['<strong>□ = 300</strong>']) },
                { say: 'แทนค่ากลับเพื่อตรวจ', show: learnLines(['300 × 25 = 7,500']) },
            ],
        }],
    },
    {
        id: 'p4wordproblem', menu: 'โจทย์ปัญหา 2 ขั้นตอน', title: 'โจทย์ปัญหา 2 ขั้นตอน (ป.4)', label: 'โจทย์ปัญหา (ป.4)',
        intro: 'แก้โจทย์ปัญหาของจำนวนที่มากกว่า 100,000', icon: 'bi-journal-text', op: 'wordproblem',
        modes: [{ label: 'โจทย์ปัญหา', build: p4WordProblem }],
        learn: [{
            label: 'สองขั้นตอน',
            title: 'ตัวอย่าง: ข้าวสาร 50,000 กิโลกรัม บรรจุถุงละ 5 กิโลกรัม ขายถุงละ 40 บาท',
            steps: [
                { say: 'ขั้นที่ 1 หาว่าได้กี่ถุง', show: learnLines(['50,000 ÷ 5 = 10,000 ถุง']) },
                { say: 'ขั้นที่ 2 หาเงินที่ขายได้', show: learnLines(['10,000 × 40 = <strong>400,000 บาท</strong>']) },
            ],
        }],
    },
    {
        id: 'p4fraction', menu: 'เศษส่วนและจำนวนคละ', title: 'เศษส่วนและจำนวนคละ (ป.4)', label: 'เศษส่วนและจำนวนคละ (ป.4)',
        intro: 'รู้จักเศษส่วนแท้ เศษเกิน จำนวนคละ และเปรียบเทียบ', icon: 'bi-slash-square', op: 'fraction',
        modes: [
            { label: 'ชนิด', build: fractionKindQuestion },
            { label: 'เศษเกินเป็นคละ', build: improperToMixedQuestion },
            { label: 'คละเป็นเศษเกิน', build: mixedToImproperQuestion },
            { label: 'เปรียบเทียบ', build: fractionMultipleCompareQuestion },
        ],
        learn: [{
            label: 'เศษเกินเป็นคละ',
            title: 'ตัวอย่าง: 17/5',
            steps: [
                { say: 'เส้นเศษส่วนคือการหาร จึงเอา 17 หารด้วย 5', show: learnLines(['17 ÷ 5 = 3 เศษ 2']) },
                { say: 'ผลหารเป็นจำนวนเต็ม เศษเป็นตัวเศษ ตัวส่วนคงเดิม', show: learnLines([`<strong>${learnMixed(3, 2, 5)}</strong>`]) },
            ],
        }, {
            label: 'เปรียบเทียบ',
            title: 'ตัวอย่าง: 3/4 กับ 5/8',
            steps: [
                { say: 'ทำตัวส่วนให้เท่ากันก่อน 8 เป็นพหุคูณของ 4 จึงคูณทั้งบนและล่างด้วย 2', show: learnLines(['3/4 = 6/8']) },
                { say: 'ตัวส่วนเท่ากันแล้ว เทียบตัวเศษได้เลย', show: learnLines(['6/8 > 5/8', '<strong>3/4 > 5/8</strong>']) },
            ],
        }],
    },
    {
        id: 'p4fractionsum', menu: 'บวกและลบเศษส่วน', title: 'บวกและลบเศษส่วน (ป.4)', label: 'บวกลบเศษส่วน (ป.4)',
        intro: 'บวกลบเศษส่วนและจำนวนคละ ที่ตัวส่วนตัวหนึ่งเป็นพหุคูณของอีกตัว', icon: 'bi-plus-slash-minus', op: 'fraction',
        modes: [
            { label: 'บวก', build: fractionMultipleSum },
            { label: 'ลบ', build: fractionMultipleDifference },
            { label: 'จำนวนคละ', build: mixedMultipleSum },
            { label: 'โจทย์ปัญหา', build: fractionMultipleWord },
        ],
        learn: [{
            label: 'ทำตัวส่วนให้เท่ากัน',
            title: 'ตัวอย่าง: 1/3 + 2/9',
            steps: [
                { say: 'ตัวส่วนต่างกันบวกตรง ๆ ไม่ได้ 9 เป็นพหุคูณของ 3 จึงเปลี่ยน 1/3 ให้ตัวส่วนเป็น 9', show: learnLines(['1/3 = 3/9']) },
                { say: 'ตัวส่วนเท่ากันแล้ว บวกตัวเศษ', show: learnLines(['3/9 + 2/9 = <strong>5/9</strong>']) },
            ],
        }],
    },
    {
        id: 'p4decimal', menu: 'ทศนิยม', title: 'ทศนิยม (ป.4)', label: 'ทศนิยม (ป.4)',
        intro: 'อ่าน เขียน รู้ค่าของเลขโดด และเปรียบเทียบทศนิยมไม่เกิน 3 ตำแหน่ง', icon: 'bi-record-circle', op: 'decimal',
        modes: [
            { label: 'อ่านเขียน', build: decimalWordsQuestion },
            { label: 'ค่าของเลขโดด', build: decimalPlaceQuestion },
            { label: 'เปรียบเทียบ', build: decimalCompareQuestion },
        ],
        learn: [{
            label: 'ค่าของเลขโดด',
            title: 'ตัวอย่าง: 3.456',
            steps: [
                { say: 'หลังจุดอ่านทีละตัว สามจุดสี่ห้าหก', show: learnLines(['3.456']) },
                { say: 'หลังจุดตำแหน่งแรกคือหลักส่วนสิบ ถัดไปส่วนร้อย และส่วนพัน', show: learnLines(['4 มีค่า 0.4', '5 มีค่า 0.05', '6 มีค่า 0.006']) },
            ],
        }, {
            label: 'เปรียบเทียบ',
            title: 'ตัวอย่าง: 0.4 กับ 0.35',
            steps: [
                { say: 'เติม 0 ท้ายทศนิยมให้ตำแหน่งเท่ากัน ค่าไม่เปลี่ยน', show: learnLines(['0.40', '0.35']) },
                { say: 'เทียบทีละหลักจากซ้าย ส่วนสิบ 4 มากกว่า 3', show: learnLines(['<strong>0.4 > 0.35</strong>']) },
            ],
        }],
    },
    {
        id: 'p4decimalsum', menu: 'บวกและลบทศนิยม', title: 'บวกและลบทศนิยม (ป.4)', label: 'บวกลบทศนิยม (ป.4)',
        intro: 'บวกลบทศนิยมไม่เกิน 3 ตำแหน่ง และแก้โจทย์ปัญหา', icon: 'bi-plus-slash-minus', op: 'decimal',
        modes: [
            { label: 'บวก', build: decimalSumQuestion },
            { label: 'ลบ', build: decimalDifferenceQuestion },
            { label: 'โจทย์ปัญหา', build: decimalWordQuestion },
        ],
        learn: [{
            label: 'จุดตรงกัน',
            title: 'ตัวอย่าง: 12.5 + 3.27',
            steps: [
                { say: 'ตั้งให้<strong>จุดตรงกัน</strong> แล้วเติม 0 ให้ตำแหน่งเท่ากัน', show: learnColumn('12.50', '3.27', '+') },
                { say: 'บวกเหมือนจำนวนนับ แล้วใส่จุดไว้ตำแหน่งเดิม', show: learnColumn('12.50', '3.27', '+', { answer: '15.77' }) },
            ],
        }],
    },
    {
        id: 'p4time', menu: 'เวลา', title: 'เวลา (ป.4)', label: 'เวลา (ป.4)',
        intro: 'เปลี่ยนหน่วยเวลา อ่านตารางเวลา และแก้โจทย์ปัญหา', icon: 'bi-clock-fill', op: 'time',
        modes: [
            { label: 'เปลี่ยนหน่วย', build: function () { return measureConvertQuestion(TIME_PAIRS); } },
            { label: 'ตารางเวลา', build: timetableQuestion },
            { label: 'โจทย์ปัญหา', build: function () {
                return measureWordQuestion(TIME_PAIRS.slice(1, 2),
                    function (first, second) { return `ทำงานช่วงเช้า ${first} ช่วงบ่าย ${second} ทำงานรวมนานเท่าใด`; },
                    function (first, second) { return `งานหนึ่งใช้เวลา ${first} ทำไปแล้ว ${second} เหลือเวลาอีกเท่าใด`; });
            } },
        ],
        learn: [{
            label: 'เปลี่ยนหน่วย',
            title: 'ตัวอย่าง: 3 สัปดาห์ 4 วัน',
            steps: [
                { say: 'จำความสัมพันธ์ของหน่วยให้ได้', show: learnLines(['1 นาที = 60 วินาที', '1 ชั่วโมง = 60 นาที', '1 วัน = 24 ชั่วโมง', '1 สัปดาห์ = 7 วัน', '1 ปี = 12 เดือน']) },
                { say: 'เปลี่ยนสัปดาห์เป็นวัน แล้วบวกวันที่เหลือ', show: learnLines(['3 × 7 = 21 วัน', '21 + 4 = <strong>25 วัน</strong>']) },
            ],
        }],
    },
    {
        id: 'p4angle', menu: 'มุม', title: 'มุม (ป.4)', label: 'มุม (ป.4)',
        intro: 'จำแนกชนิดของมุม วัดด้วยโพรแทรกเตอร์ และเขียนสัญลักษณ์', icon: 'bi-triangle', op: 'angle',
        modes: [
            { label: 'ชนิดของมุม', build: angleKindQuestion },
            { label: 'วัดมุม', build: protractorQuestion },
            { label: 'ชื่อมุม', build: angleNameQuestion },
        ],
        learn: [{
            label: 'ชนิดของมุม',
            title: 'แบ่งตามขนาด',
            steps: [
                { say: 'มุมฉากมีขนาด 90 องศา ใช้เป็นตัวเทียบ', show: angleFigure(90) },
                { say: 'เล็กกว่ามุมฉากคือมุมแหลม ใหญ่กว่ามุมฉากแต่ไม่ถึง 180 คือมุมป้าน', show: learnLines(['มุมแหลม น้อยกว่า 90 องศา', 'มุมป้าน มากกว่า 90 แต่น้อยกว่า 180 องศา']) },
                { say: '180 องศาพอดีคือมุมตรง และมากกว่านั้นคือมุมกลับ', show: learnLines(['มุมตรง 180 องศา', 'มุมกลับ มากกว่า 180 แต่น้อยกว่า 360 องศา']) },
            ],
        }, {
            label: 'วัดมุม',
            title: 'ตัวอย่าง: อ่านโพรแทรกเตอร์',
            steps: [
                { say: 'วางจุดศูนย์กลางที่จุดยอดมุม และวางแขนข้างหนึ่งทับเส้น 0', show: protractorFigure(60) },
                { say: 'อ่านตัวเลขที่แขนอีกข้างชี้ แต่ละขีดยาวห่างกัน 10 องศา', show: learnLines(['<strong>มุมนี้มีขนาด 60 องศา</strong>']) },
            ],
        }],
    },
    {
        id: 'p4rectangle', menu: 'รูปสี่เหลี่ยมมุมฉาก', title: 'รูปสี่เหลี่ยมมุมฉาก (ป.4)', label: 'รูปสี่เหลี่ยมมุมฉาก (ป.4)',
        intro: 'หาความยาวรอบรูปและพื้นที่ของรูปสี่เหลี่ยมมุมฉาก', icon: 'bi-aspect-ratio', op: 'geometry',
        modes: [
            { label: 'รอบรูป', build: rectanglePerimeterQuestion },
            { label: 'พื้นที่', build: rectangleAreaQuestion },
            { label: 'หาด้าน', build: rectangleMissingSideQuestion },
            { label: 'โจทย์ปัญหา', build: rectangleWordQuestion },
        ],
        learn: [{
            label: 'รอบรูปและพื้นที่',
            title: 'ตัวอย่าง: กว้าง 4 เมตร ยาว 7 เมตร',
            steps: [
                { say: '<strong>รอบรูป</strong>คือการเดินรอบรูปหนึ่งรอบ จึงบวกทุกด้าน', show: learnLines(['2 × (7 + 4) = 22 เมตร']) },
                { say: '<strong>พื้นที่</strong>คือจำนวนช่องที่ปูเต็มรูป จึงเอากว้างคูณยาว', show: learnLines(['4 × 7 = 28 ตารางเมตร']) },
            ],
        }],
    },
    { moved: 'menu_p5_barchart' },
    {
        id: 'p4table', menu: 'ตารางสองทาง', title: 'ตารางสองทาง (ป.4)', label: 'ตารางสองทาง (ป.4)',
        intro: 'อ่านข้อมูลจากตารางสองทางเพื่อตอบคำถาม', icon: 'bi-table', op: 'barchart',
        modes: [{ label: 'ตารางสองทาง', build: twoWayTableQuestion }],
        learn: [{
            label: 'อ่านแถวและคอลัมน์',
            title: 'ตัวอย่าง: นักเรียนแต่ละห้อง',
            steps: [
                { say: 'ตารางสองทางแยกข้อมูลทั้งแนวนอนและแนวตั้ง หาแถวที่ถามก่อน', show: lessonTable(['ห้อง', 'ชาย', 'หญิง'], [['ป.4/1', 18, 20], ['ป.4/2', 21, 17]]) },
                { say: 'แล้วดูคอลัมน์ที่ถาม ช่องที่ตัดกันคือคำตอบ', show: learnLines(['ป.4/2 นักเรียนหญิง = <strong>17 คน</strong>']) },
            ],
        }],
    },
]);

addFinalQuiz('p4', [
    { code: 'ค 1.1 ป.4/1', text: 'อ่านและเขียนตัวเลขฮินดูอารบิก ตัวเลขไทย และตัวหนังสือแสดงจำนวนนับที่มากกว่า 100,000', lesson: 'p4number' },
    { code: 'ค 1.1 ป.4/2', text: 'เปรียบเทียบและเรียงลำดับจำนวนนับที่มากกว่า 100,000 จากสถานการณ์ต่าง ๆ', lesson: 'p4compare', ask: ['เปรียบเทียบ', 'เรียงลำดับ'] },
    { code: 'ค 1.1 ป.4/3', text: 'บอก อ่าน และเขียนเศษส่วน จำนวนคละ แสดงปริมาณสิ่งต่าง ๆ และแสดงสิ่งต่าง ๆ ตามเศษส่วน จำนวนคละที่กำหนด', lesson: 'p4fraction', ask: ['ชนิด', 'เศษเกินเป็นคละ', 'คละเป็นเศษเกิน'] },
    { code: 'ค 1.1 ป.4/4', text: 'เปรียบเทียบ เรียงลำดับเศษส่วนและจำนวนคละที่ตัวส่วนตัวหนึ่งเป็นพหุคูณของอีกตัวหนึ่ง', lesson: 'p4fraction', ask: ['เปรียบเทียบ'] },
    { code: 'ค 1.1 ป.4/5', text: 'อ่านและเขียนทศนิยมไม่เกิน 3 ตำแหน่ง แสดงปริมาณของสิ่งต่าง ๆ และแสดงสิ่งต่าง ๆ ตามทศนิยมที่กำหนด', lesson: 'p4decimal', ask: ['อ่านเขียน', 'ค่าของเลขโดด'] },
    { code: 'ค 1.1 ป.4/6', text: 'เปรียบเทียบและเรียงลำดับทศนิยมไม่เกิน 3 ตำแหน่งจากสถานการณ์ต่าง ๆ', lesson: 'p4decimal', ask: ['เปรียบเทียบ'] },
    { code: 'ค 1.1 ป.4/7', text: 'ประมาณผลลัพธ์ของการบวก การลบ การคูณ การหาร จากสถานการณ์ต่าง ๆ อย่างสมเหตุสมผล', lesson: 'p4estimate' },
    { code: 'ค 1.1 ป.4/8', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์แสดงการบวกและการลบของจำนวนนับที่มากกว่า 100,000 และ 0', lesson: 'p4missing', also: ['p4addsub'], ask: ['บวก ลบ'] },
    { code: 'ค 1.1 ป.4/9', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์แสดงการคูณของจำนวนหลายหลัก 2 จำนวน ที่มีผลคูณไม่เกิน 6 หลัก และการหารที่ตัวตั้งไม่เกิน 6 หลัก ตัวหารไม่เกิน 2 หลัก', lesson: 'p4muldiv', also: ['p4missing'] },
    { code: 'ค 1.1 ป.4/10', text: 'หาผลลัพธ์การบวก ลบ คูณ หารระคนของจำนวนนับ และ 0', lesson: 'p4mixed' },
    { code: 'ค 1.1 ป.4/11', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหา 2 ขั้นตอนของจำนวนนับที่มากกว่า 100,000 และ 0', lesson: 'p4wordproblem' },
    { code: 'ค 1.1 ป.4/13', text: 'หาผลบวก ผลลบของเศษส่วนและจำนวนคละที่ตัวส่วนตัวหนึ่งเป็นพหุคูณของอีกตัวหนึ่ง', lesson: 'p4fractionsum', ask: ['บวก', 'ลบ', 'จำนวนคละ'] },
    { code: 'ค 1.1 ป.4/14', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวกและการลบเศษส่วนและจำนวนคละที่ตัวส่วนตัวหนึ่งเป็นพหุคูณของอีกตัวหนึ่ง', lesson: 'p4fractionsum', ask: ['โจทย์ปัญหา'] },
    { code: 'ค 1.1 ป.4/15', text: 'หาผลบวก ผลลบของทศนิยมไม่เกิน 3 ตำแหน่ง', lesson: 'p4decimalsum', ask: ['บวก', 'ลบ'] },
    { code: 'ค 1.1 ป.4/16', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวก การลบ 2 ขั้นตอนของทศนิยมไม่เกิน 3 ตำแหน่ง', lesson: 'p4decimalsum', ask: ['โจทย์ปัญหา'] },
    { code: 'ค 2.1 ป.4/1', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับเวลา', lesson: 'p4time' },
    { code: 'ค 2.1 ป.4/2', text: 'วัดและสร้างมุม โดยใช้โพรแทรกเตอร์', lesson: 'p4angle', ask: ['วัดมุม'] },
    { code: 'ค 2.1 ป.4/3', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับความยาวรอบรูปและพื้นที่ของรูปสี่เหลี่ยมมุมฉาก', lesson: 'p4rectangle' },
    { code: 'ค 2.2 ป.4/1', text: 'จำแนกชนิดของมุม บอกชื่อมุม ส่วนประกอบของมุมและเขียนสัญลักษณ์แสดงมุม', lesson: 'p4angle', ask: ['ชนิดของมุม', 'ชื่อมุม'] },
    { code: 'ค 3.1 ป.4/1', text: 'ใช้ข้อมูลจากแผนภูมิแท่ง ตารางสองทางในการหาคำตอบของโจทย์ปัญหา', lesson: 'p4table', also: ['p5barchart'] },
]);

finalQuizNotCovered.p4 = 'ยังมีอีก 2 ตัวชี้วัด คือ ค 1.1 ป.4/12 การสร้างโจทย์ปัญหา และ ค 2.2 ป.4/2 การสร้างรูปสี่เหลี่ยมมุมฉาก ซึ่งต้องเขียนหรือวาดเอง เว็บนี้จึงฝึกให้ไม่ได้ ส่วน ค 2.1 ป.4/2 ฝึกได้เฉพาะการวัดมุม';
