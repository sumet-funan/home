// ป.6, following ตัวชี้วัดและสาระการเรียนรู้แกนกลาง คณิตศาสตร์ (ฉบับปรับปรุง พ.ศ. 2560).

function randomFraction() {
    let bottom = pickOne([2, 3, 4, 5, 6, 8, 10]);
    return { top: randomInt(1, bottom - 1), bottom: bottom };
}

function fractionWords(fraction) {
    return `${fraction.top}/${fraction.bottom}`;
}

function fractionPlus(first, second) {
    return { top: first.top * second.bottom + second.top * first.bottom, bottom: first.bottom * second.bottom };
}

function fractionMinus(first, second) {
    return { top: first.top * second.bottom - second.top * first.bottom, bottom: first.bottom * second.bottom };
}

function fractionTimes(first, second) {
    return { top: first.top * second.top, bottom: first.bottom * second.bottom };
}

function fractionOver(first, second) {
    return { top: first.top * second.bottom, bottom: first.bottom * second.top };
}

function isSameFraction(first, second) {
    return first.top * second.bottom === second.top * first.bottom;
}

function otherFraction(fraction) {
    let other = randomFraction();
    return isSameFraction(fraction, other) ? otherFraction(fraction) : other;
}

function fractionLcmCompareQuestion() {
    let first = randomFraction(), second = randomFraction();
    let firstWhole = randomInt(0, 3), secondWhole = Math.random() < 0.7 ? firstWhole : randomInt(0, 3);
    let write = function (whole, fraction) { return (whole ? whole + ' ' : '') + fractionWords(fraction); };
    let top = function (whole, fraction) { return whole * fraction.bottom + fraction.top; };

    return compareQuestion(`${write(firstWhole, first)} □ ${write(secondWhole, second)} เครื่องหมายใดเติมใน □ ได้ถูกต้อง`,
        top(firstWhole, first) * second.bottom, top(secondWhole, second) * first.bottom);
}

function fractionLcmOrderQuestion() {
    let list = [];

    while (list.length < 3) {
        let fraction = randomFraction();
        if (!list.some(function (item) { return isSameFraction(item, fraction); })) {
            list.push(fraction);
        }
    }

    let sorted = list.slice().sort(function (a, b) { return a.top * b.bottom - b.top * a.bottom; });
    let write = function (items) { return items.map(fractionWords).join(', '); };
    let ascending = Math.random() < 0.5;
    let order = ascending ? sorted : sorted.slice().reverse();

    return choiceQuestion(`ข้อใดเรียง ${write(list)} จาก${ascending ? 'น้อยไปมาก' : 'มากไปน้อย'}`, write(order), [
        write([order[1], order[0], order[2]]), write([order[0], order[2], order[1]]), write([order[2], order[1], order[0]]),
    ]);
}

function ratioFields(firstLabel, first, secondLabel, second) {
    return {
        fields: [{ label: firstLabel, value: first }, { label: secondLabel, value: second }],
        same: function (values) { return values[1] > 0 && values[0] * second === first * values[1]; },
    };
}

function ratioWriteQuestion() {
    let first = randomInt(2, 15), second = randomInt(2, 15);
    let item = pickOne([['ส้ม', 'มะม่วง', 'ผล'], ['ดินสอ', 'ปากกา', 'แท่ง'], ['นักเรียนชาย', 'นักเรียนหญิง', 'คน']]);

    return Object.assign({ text: `มี${item[0]} ${first} ${item[2]} และ${item[1]} ${second} ${item[2]} อัตราส่วนของ${item[0]}ต่อ${item[1]}เป็นเท่าใด` }, ratioFields('จำนวนแรก', first, 'จำนวนหลัง', second));
}

function ratioEqualQuestion() {
    let first = randomInt(2, 9), second = randomInt(2, 12), scale = randomInt(2, 12);

    if (Math.random() < 0.5) {
        return { text: `${first} : ${second} = □ : ${second * scale} จำนวนใน □ คือเท่าใด`, answer: first * scale };
    }
    return { text: `${first} : ${second} = ${first * scale} : □ จำนวนใน □ คือเท่าใด`, answer: second * scale };
}

function ratioWordQuestion() {
    let first = randomInt(2, 7), second = randomInt(2, 9), scale = randomInt(3, 20);
    let templates = [
        { text: `อัตราส่วนของแป้งต่อน้ำตาลเป็น ${first} : ${second} ถ้าใช้แป้ง ${first * scale} ถ้วย ต้องใช้น้ำตาลกี่ถ้วย`, answer: second * scale, unit: 'ถ้วย' },
        { text: `ห้องหนึ่งมีนักเรียนชายต่อหญิงเป็น ${first} : ${second} มีนักเรียนทั้งหมด ${(first + second) * scale} คน เป็นนักเรียนชายกี่คน`, answer: first * scale, unit: 'คน' },
    ];

    return pickOne(templates);
}

function mapScaleQuestion() {
    let scale = pickOne([10000, 20000, 50000, 100000]), centimetres = randomInt(2, 15);
    return { text: `แผนที่มาตราส่วน 1 : ${commaNumber(scale)} ระยะบนแผนที่ ${centimetres} เซนติเมตร เป็นระยะจริงกี่กิโลเมตร`, answer: scale * centimetres / 100000, unit: 'กิโลเมตร' };
}

function gcfOfList(list) {
    return list.reduce(function (result, number) { return gcfOf(result, number); });
}

function lcmOfList(list) {
    return list.reduce(function (result, number) { return lcmOf(result, number); });
}

function threeNumbersQuestion() {
    let base = randomInt(2, 12);
    let list = shuffleList([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).map(function (factor) { return base * factor; });

    if (Math.random() < 0.5) {
        return { text: `ห.ร.ม. ของ ${list.join(', ')} คือเท่าใด`, answer: gcfOfList(list) };
    }

    let small = shuffleList([2, 3, 4, 5, 6, 8, 9, 10, 12, 15]).slice(0, 3);
    return { text: `ค.ร.น. ของ ${small.join(', ')} คือเท่าใด`, answer: lcmOfList(small) };
}

function factorWordQuestion() {
    let size = randomInt(2, 9) * 5, firstCount = randomInt(2, 9), secondCount = firstCount + randomInt(1, 8);
    let first = randomInt(2, 6), second = first + randomInt(1, 6);
    let templates = [
        function () {
            let answer = gcfOf(size * firstCount, size * secondCount);
            return { text: `ผ้าสองผืนยาว ${size * firstCount} และ ${size * secondCount} เมตร ตัดให้ยาวเท่ากันทุกชิ้นโดยไม่เหลือเศษ แต่ละชิ้นยาวได้มากที่สุดกี่เมตร`, answer: answer, unit: 'เมตร' };
        },
        function () {
            return { text: `ไฟดวงแรกกะพริบทุก ${first} วินาที ดวงที่สองทุก ${second} วินาที ถ้าเพิ่งกะพริบพร้อมกัน อีกกี่วินาทีจะกะพริบพร้อมกันอีก`, answer: lcmOf(first, second), unit: 'วินาที' };
        },
    ];

    return pickOne(templates)();
}

function fractionMixedOperationQuestion() {
    let a = randomFraction(), b = randomFraction(), c = randomFraction();
    let templates = [
        { text: `${fractionWords(a)} + ${fractionWords(b)} × ${fractionWords(c)}`, value: fractionPlus(a, fractionTimes(b, c)) },
        { text: `(${fractionWords(a)} + ${fractionWords(b)}) × ${fractionWords(c)}`, value: fractionTimes(fractionPlus(a, b), c) },
        { text: `${fractionWords(a)} ÷ ${fractionWords(b)} + ${fractionWords(c)}`, value: fractionPlus(fractionOver(a, b), c) },
        { text: `${fractionWords(a)} × ${fractionWords(b)} ÷ ${fractionWords(c)}`, value: fractionOver(fractionTimes(a, b), c) },
    ];
    let question = pickOne(templates);

    return Object.assign({ text: `${question.text} เท่ากับเท่าใด (ตอบเป็นเศษส่วนหรือเศษเกิน)` }, fractionFields(question.value.top, question.value.bottom));
}

function fractionLcmSumQuestion() {
    let a = randomFraction(), b = otherFraction(a);
    let isSum = Math.random() < 0.5;

    if (isSum) {
        let sum = fractionPlus(a, b);
        return Object.assign({ text: `${fractionWords(a)} + ${fractionWords(b)} เท่ากับเท่าใด (ตอบเป็นเศษส่วนหรือเศษเกิน)` }, fractionFields(sum.top, sum.bottom));
    }

    let isFirstLarger = fractionMinus(a, b).top > 0;
    let larger = isFirstLarger ? a : b, smaller = isFirstLarger ? b : a;
    let difference = fractionMinus(larger, smaller);

    return Object.assign({ text: `${fractionWords(larger)} − ${fractionWords(smaller)} เท่ากับเท่าใด` }, fractionFields(difference.top, difference.bottom));
}

function fractionWordQuestion() {
    let name = pickOne(wordNames);
    let spent = pickOne([2, 3, 4, 5]), then = pickOne([2, 3, 4]);
    let money = randomInt(1, 5) * 720;
    let after = money - money / spent;

    return { text: `${name}มีเงิน ${commaNumber(money)} บาท ใช้ซื้อของ 1/${spent} ของเงินที่มี แล้วนำเงินที่เหลือไปออม 1/${then} เหลือเงินกี่บาท`, answer: after - after / then, unit: 'บาท' };
}

function decimalDivideQuestion() {
    let divisor, quotient;

    if (Math.random() < 0.5) {
        divisor = randomInt(2, 9) / 10;
        quotient = randomInt(11, 95) / 10;
    } else {
        divisor = randomInt(11, 49) / 100;
        quotient = randomInt(2, 9);
    }
    return { text: `${+(divisor * quotient).toFixed(3)} ÷ ${divisor} เท่ากับเท่าใด`, answer: quotient };
}

function decimalThreeStepQuestion() {
    let flourKilos = randomInt(2, 5), flourPrice = randomInt(205, 455) / 10;
    let sugarKilos = randomInt(2, 5), sugarPrice = randomInt(205, 455) / 10;
    let paid = 500;
    let total = flourKilos * flourPrice + sugarKilos * sugarPrice;

    return { text: `ซื้อแป้ง ${flourKilos} กิโลกรัม กิโลกรัมละ ${flourPrice.toFixed(2)} บาท และน้ำตาล ${sugarKilos} กิโลกรัม กิโลกรัมละ ${sugarPrice.toFixed(2)} บาท จ่ายเงิน ${paid} บาท ได้เงินทอนกี่บาท`, answer: +(paid - total).toFixed(2), unit: 'บาท' };
}

function exchangeQuestion() {
    let rate = randomInt(320, 360) / 10, dollars = randomInt(2, 40) * 5;

    if (Math.random() < 0.5) {
        return { text: `ถ้า 1 ดอลลาร์สหรัฐ เท่ากับ ${rate.toFixed(2)} บาท เงิน ${dollars} ดอลลาร์ เท่ากับกี่บาท`, answer: +(rate * dollars).toFixed(2), unit: 'บาท' };
    }
    return { text: `ถ้า 1 ดอลลาร์สหรัฐ เท่ากับ ${rate.toFixed(2)} บาท เงิน ${commaNumber(+(rate * dollars).toFixed(2))} บาท แลกได้กี่ดอลลาร์`, answer: dollars, unit: 'ดอลลาร์' };
}

function percentDiscountQuestion() {
    let price = randomInt(4, 40) * 100, off = pickOne([5, 10, 15, 20, 25, 30, 40, 50]);
    let pay = pickOne([1000, 5000]);
    let net = price - price * off / 100;

    if (pay < net) {
        pay = 5000;
    }
    return { text: `สินค้าติดราคา ${commaNumber(price)} บาท ลดราคาร้อยละ ${off} จ่ายด้วยเงิน ${commaNumber(pay)} บาท ได้เงินทอนกี่บาท`, answer: pay - net, unit: 'บาท' };
}

function percentProfitQuestion() {
    let cost = randomInt(4, 60) * 50, rate = pickOne([10, 20, 25, 30, 40, 50]);
    return { text: `ซื้อสินค้ามา ${commaNumber(cost)} บาท ขายได้กำไรร้อยละ ${rate} ขายไปกี่บาท`, answer: cost + cost * rate / 100, unit: 'บาท' };
}

function percentFindQuestion() {
    let total = pickOne([20, 25, 40, 50, 80, 200, 400]);
    let percent = randomInt(1, 19) * 5;
    let got = total * percent / 100;

    if (got !== Math.floor(got)) {
        return percentFindQuestion();
    }
    return { text: `สอบได้ ${got} คะแนน จากคะแนนเต็ม ${total} คะแนน คิดเป็นร้อยละเท่าใด`, answer: percent };
}

function percentInterestQuestion() {
    let money = randomInt(2, 50) * 1000, rate = randomInt(1, 5), years = randomInt(2, 3);
    return { text: `ฝากเงิน ${commaNumber(money)} บาท ได้ดอกเบี้ยร้อยละ ${rate} ต่อปี แบบไม่ทบต้น ฝาก ${years} ปี ได้เงินรวมดอกเบี้ยกี่บาท`, answer: money + money * rate * years / 100, unit: 'บาท' };
}

function patternSequenceQuestion() {
    let kind = randomInt(0, 2);
    let first = randomInt(2, 5);
    let terms = [0, 1, 2, 3, 4].map(function (index) {
        if (kind === 0) {
            return (index + first) * (index + first);
        }
        if (kind === 1) {
            return first * Math.pow(2, index);
        }
        return first + index * (index + 1) / 2 * 2;
    });

    return { text: `${terms.slice(0, 4).join(', ')}, □ จำนวนใน □ คือเท่าใด`, answer: terms[4] };
}

function patternStickQuestion() {
    let start = pickOne([3, 4, 5, 6]), add = pickOne([2, 3, 4, 5]);
    let term = pickOne([10, 12, 15, 20, 25, 30]);
    let rows = [1, 2, 3].map(function (number) { return [`รูปที่ ${number}`, start + add * (number - 1)]; });

    return { text: `จากแบบรูปนี้ รูปที่ ${term} ใช้ไม้กี่ก้าน`, figure: lessonTable(['รูป', 'จำนวนไม้ (ก้าน)'], rows), answer: start + add * (term - 1), unit: 'ก้าน' };
}

function compositeVolumeQuestion() {
    let rows = [0, 1].map(function () { return [randomInt(2, 12), randomInt(2, 12), randomInt(2, 12)]; });
    let volume = function (row) { return row[0] * row[1] * row[2]; };
    let figure = lessonTable(['ก้อน', 'กว้าง (ซม.)', 'ยาว (ซม.)', 'สูง (ซม.)'], rows.map(function (row, index) { return [`ก้อนที่ ${index + 1}`].concat(row); }));

    return { text: 'รูปเรขาคณิตสามมิติประกอบด้วยทรงสี่เหลี่ยมมุมฉากสองก้อนนี้ มีปริมาตรรวมกี่ลูกบาศก์เซนติเมตร', figure: figure, answer: volume(rows[0]) + volume(rows[1]), unit: 'ลบ.ซม.' };
}

function hollowVolumeQuestion() {
    let width = randomInt(6, 15), length = randomInt(6, 15), height = randomInt(6, 15);
    let holeWidth = randomInt(2, width - 3), holeLength = randomInt(2, length - 3);

    return { text: `ทรงสี่เหลี่ยมมุมฉากกว้าง ${width} ยาว ${length} สูง ${height} ซม. เจาะช่องทะลุจากบนลงล่าง กว้าง ${holeWidth} ยาว ${holeLength} ซม. เหลือปริมาตรกี่ลูกบาศก์เซนติเมตร`, answer: (width * length - holeWidth * holeLength) * height, unit: 'ลบ.ซม.' };
}

function triangleAreaFigure(base, height) {
    return `<svg viewBox="0 0 260 160" width="260" height="160" role="img" aria-label="รูปสามเหลี่ยม ฐาน ${base} สูง ${height} เซนติเมตร">
        <polygon class="shape-fill" points="40,120 220,120 90,20"/>
        <line class="figure-height" x1="90" y1="20" x2="90" y2="120"/>
        <text class="figure-text" text-anchor="middle" x="130" y="142">ฐาน ${base} ซม.</text>
        <text class="figure-text" x="2" y="44">สูง ${height} ซม.</text>
    </svg>`;
}

function triangleAreaQuestion() {
    let base = randomInt(2, 20) * 2, height = randomInt(3, 25);
    return { text: 'รูปสามเหลี่ยมนี้มีพื้นที่เท่าใด', figure: triangleAreaFigure(base, height), answer: base * height / 2, unit: 'ตารางเซนติเมตร' };
}

function polygonPerimeterQuestion() {
    let sides = Array.from({ length: randomInt(3, 6) }, function () { return randomInt(3, 25); });
    return { text: `รูปหลายเหลี่ยมมีด้านยาว ${sides.join(', ')} เซนติเมตร มีความยาวรอบรูปเท่าใด`, answer: sides.reduce(function (sum, side) { return sum + side; }, 0), unit: 'เซนติเมตร' };
}

function polygonAngleQuestion() {
    let sides = randomInt(3, 8);
    let names = { 3: 'สามเหลี่ยม', 4: 'สี่เหลี่ยม', 5: 'ห้าเหลี่ยม', 6: 'หกเหลี่ยม', 7: 'เจ็ดเหลี่ยม', 8: 'แปดเหลี่ยม' };
    return { text: `รูป${names[sides]} มีผลรวมของมุมภายในกี่องศา`, answer: (sides - 2) * 180, unit: 'องศา' };
}

function polygonCompositeQuestion() {
    let width = randomInt(2, 15) * 2, height = randomInt(3, 15), roof = randomInt(2, 12);
    return { text: `รูปบ้านประกอบด้วยรูปสี่เหลี่ยมผืนผ้ากว้าง ${width} ซม. สูง ${height} ซม. และรูปสามเหลี่ยมฐาน ${width} ซม. สูง ${roof} ซม. มีพื้นที่รวมเท่าใด`, answer: width * height + width * roof / 2, unit: 'ตารางเซนติเมตร' };
}

function circleRadius() {
    return randomInt(1, 10) * 7;
}

function circleCircumferenceQuestion() {
    let radius = circleRadius();
    return { text: `วงกลมรัศมี ${radius} เซนติเมตร มีความยาวรอบวงเท่าใด (ใช้ π ≈ 22/7)`, answer: 2 * radius / 7 * 22, unit: 'เซนติเมตร' };
}

function circleAreaQuestion() {
    let radius = circleRadius();
    return { text: `วงกลมรัศมี ${radius} เซนติเมตร มีพื้นที่เท่าใด (ใช้ π ≈ 22/7)`, answer: radius * radius / 7 * 22, unit: 'ตารางเซนติเมตร' };
}

function circleRadiusQuestion() {
    let radius = circleRadius();
    return { text: `วงกลมยาวรอบวง ${2 * radius / 7 * 22} เซนติเมตร มีรัศมีเท่าใด (ใช้ π ≈ 22/7)`, answer: radius, unit: 'เซนติเมตร' };
}

function circleWordQuestion() {
    let radius = circleRadius(), turns = randomInt(5, 50) * 2;
    return { text: `ล้อจักรยานรัศมี ${radius} เซนติเมตร หมุน ${turns} รอบ เคลื่อนที่ได้กี่เซนติเมตร (ใช้ π ≈ 22/7)`, answer: 2 * radius / 7 * 22 * turns, unit: 'เซนติเมตร' };
}

function triangleBySidesQuestion() {
    let kinds = ['รูปสามเหลี่ยมด้านเท่า', 'รูปสามเหลี่ยมหน้าจั่ว', 'รูปสามเหลี่ยมด้านไม่เท่า'];
    let list = pickOne([
        function () { let a = randomInt(3, 12); return [a, a, a, 0]; },
        function () { let a = randomInt(4, 12), b = randomInt(2, a + 3); return b === a ? [a, a, a, 0] : [a, a, b, 1]; },
        function () { return [4, 5, 6, 2]; },
        function () { return [5, 6, 7, 2]; },
        function () { return [3, 4, 5, 2]; },
        function () { return [6, 8, 10, 2]; },
    ])();

    return { text: `รูปสามเหลี่ยมมีด้านยาว ${list[0]}, ${list[1]} และ ${list[2]} เซนติเมตร เป็นรูปสามเหลี่ยมชนิดใด`, answer: kinds[list[3]], choices: kinds };
}

function triangleByAnglesQuestion() {
    let kinds = ['รูปสามเหลี่ยมมุมแหลม', 'รูปสามเหลี่ยมมุมฉาก', 'รูปสามเหลี่ยมมุมป้าน'];
    let largest = pickOne([randomInt(13, 17) * 5, 90, randomInt(19, 26) * 5]);
    let rest = 180 - largest;
    let first = 5 * randomInt(Math.ceil(Math.max(5, rest - largest) / 5), Math.floor(Math.min(rest - 5, largest) / 5));
    let angles = shuffleList([largest, first, rest - first]);
    let kind = largest < 90 ? kinds[0] : (largest === 90 ? kinds[1] : kinds[2]);

    return { text: `รูปสามเหลี่ยมมีมุม ${angles.join(', ')} องศา เป็นรูปสามเหลี่ยมชนิดใด`, answer: kind, choices: kinds };
}

function triangleMissingAngleQuestion() {
    let first = randomInt(4, 20) * 5, second = randomInt(4, 20) * 5;

    if (first + second >= 175) {
        return triangleMissingAngleQuestion();
    }
    return { text: `รูปสามเหลี่ยมมีมุมสองมุมขนาด ${first} และ ${second} องศา มุมที่เหลือมีขนาดกี่องศา`, answer: 180 - first - second, unit: 'องศา' };
}

const SOLID_NAMES = ['ทรงกลม', 'ทรงกระบอก', 'กรวย', 'พีระมิด', 'ปริซึม'];

const SOLID_FACTS = [
    { text: 'มีฐานเป็นวงกลม 2 ฐานที่เท่ากันและขนานกัน', answer: 'ทรงกระบอก' },
    { text: 'มีฐานเป็นวงกลม 1 ฐาน และมียอดแหลม', answer: 'กรวย' },
    { text: 'ทุกจุดบนผิวอยู่ห่างจากจุดศูนย์กลางเท่ากัน', answer: 'ทรงกลม' },
    { text: 'มีหน้าข้างเป็นรูปสามเหลี่ยมมาบรรจบกันที่ยอด', answer: 'พีระมิด' },
    { text: 'มีฐานสองฐานเป็นรูปหลายเหลี่ยมที่เท่ากันทุกประการ และหน้าข้างเป็นรูปสี่เหลี่ยมมุมฉาก', answer: 'ปริซึม' },
];

function netFigure(body, label) {
    return `<svg viewBox="0 0 240 200" width="240" height="200" role="img" aria-label="${label}">${body}</svg>`;
}

const SOLID_NETS = [
    { answer: 'ทรงกระบอก', figure: netFigure('<rect class="shape-fill" x="40" y="65" width="160" height="70"/><circle class="shape-soft" cx="120" cy="35" r="30"/><circle class="shape-soft" cx="120" cy="165" r="30"/>', 'รูปคลี่มีรูปสี่เหลี่ยมผืนผ้า 1 รูป และวงกลม 2 วง') },
    { answer: 'กรวย', figure: netFigure('<path class="shape-fill" d="M 120 10 L 40 120 A 100 100 0 0 0 200 120 Z"/><circle class="shape-soft" cx="120" cy="175" r="24"/>', 'รูปคลี่มีรูปเสี้ยววงกลม 1 รูป และวงกลม 1 วง') },
    { answer: 'พีระมิด', figure: netFigure('<rect class="shape-soft" x="90" y="70" width="60" height="60"/><polygon class="shape-fill" points="90,70 150,70 120,15"/><polygon class="shape-fill" points="90,130 150,130 120,185"/><polygon class="shape-fill" points="90,70 90,130 35,100"/><polygon class="shape-fill" points="150,70 150,130 205,100"/>', 'รูปคลี่มีรูปสี่เหลี่ยมจัตุรัส 1 รูป และรูปสามเหลี่ยม 4 รูป') },
    { answer: 'ปริซึม', figure: netFigure('<rect class="shape-fill" x="30" y="70" width="60" height="70"/><rect class="shape-fill" x="90" y="70" width="60" height="70"/><rect class="shape-fill" x="150" y="70" width="60" height="70"/><polygon class="shape-soft" points="90,70 150,70 120,20"/><polygon class="shape-soft" points="90,140 150,140 120,190"/>', 'รูปคลี่มีรูปสี่เหลี่ยมผืนผ้า 3 รูป และรูปสามเหลี่ยม 2 รูป') },
];

function solidFactQuestion() {
    let fact = pickOne(SOLID_FACTS);
    return { text: `รูปเรขาคณิตสามมิติชนิดใด${fact.text}`, answer: fact.answer, choices: SOLID_NAMES };
}

function solidNetQuestion() {
    let net = pickOne(SOLID_NETS);
    return { text: 'รูปคลี่นี้ประกอบเป็นรูปเรขาคณิตสามมิติชนิดใด', figure: net.figure, answer: net.answer, choices: SOLID_NAMES.slice(1) };
}

const PIE_COLOURS = ['var(--plus)', 'var(--multiply)', 'var(--minus)', 'var(--fraction)'];

function pieFigure(rows) {
    let start = -90;
    let slices = rows.map(function (row, index) {
        let end = start + row.percent * 3.6;
        let point = function (degrees, radius) {
            let radians = degrees * Math.PI / 180;
            return `${(110 + radius * Math.cos(radians)).toFixed(1)} ${(110 + radius * Math.sin(radians)).toFixed(1)}`;
        };
        let middle = (start + end) / 2;
        let slice = `<path d="M 110 110 L ${point(start, 100)} A 100 100 0 ${row.percent > 50 ? 1 : 0} 1 ${point(end, 100)} Z" fill="${PIE_COLOURS[index]}" stroke="var(--card-bg)" stroke-width="2"/>
            <text class="figure-pie-label" text-anchor="middle" x="${point(middle, 62).split(' ')[0]}" y="${+point(middle, 62).split(' ')[1] + 5}">${row.percent}%</text>`;
        start = end;
        return slice;
    }).join('');
    let legend = rows.map(function (row, index) {
        return `<span class="lesson-legend-item"><span style="background: ${PIE_COLOURS[index]}"></span>${row.label} ${row.percent}%</span>`;
    }).join('');

    return `<div class="lesson-pie"><svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="${rows.map(function (row) { return `${row.label} ร้อยละ ${row.percent}`; }).join(' ')}">${slices}</svg><div class="lesson-legend">${legend}</div></div>`;
}

function pieRows() {
    let labels = shuffleList(['ฟุตบอล', 'ว่ายน้ำ', 'แบดมินตัน', 'วิ่ง', 'ปิงปอง']).slice(0, 4);
    let first = randomInt(6, 9) * 5, second = randomInt(3, 5) * 5, third = randomInt(1, 3) * 5;

    return [first, second, third, 100 - first - second - third].map(function (percent, index) {
        return { label: labels[index], percent: percent };
    });
}

function pieChartQuestion() {
    let rows = pieRows();
    let total = pickOne([200, 400, 500, 800, 1000]);
    let picked = pickOne(rows), others = rows.filter(function (row) { return row !== picked; });
    let other = pickOne(others);
    let larger = picked.percent > other.percent ? picked : other, smaller = larger === picked ? other : picked;
    let count = function (row) { return total * row.percent / 100; };
    let questions = [
        { text: `นักเรียน ${total} คน เลือกกีฬาที่ชอบ มีคนชอบ${picked.label}กี่คน`, answer: count(picked), unit: 'คน' },
        { text: `นักเรียน ${total} คน เลือกกีฬาที่ชอบ คนชอบ${larger.label}มากกว่า${smaller.label}กี่คน`, answer: count(larger) - count(smaller), unit: 'คน' },
        { text: `คนชอบ${picked.label}และ${other.label}รวมกันคิดเป็นร้อยละเท่าใด`, answer: picked.percent + other.percent },
    ];

    return Object.assign({ figure: pieFigure(rows) }, pickOne(questions));
}

addLessons('p6', [
    {
        id: 'p6fraction', menu: 'เปรียบเทียบเศษส่วน', title: 'เปรียบเทียบเศษส่วน (ป.6)', label: 'เปรียบเทียบเศษส่วน (ป.6)',
        intro: 'เปรียบเทียบและเรียงลำดับเศษส่วนและจำนวนคละด้วย ค.ร.น.', icon: 'bi-arrow-left-right', op: 'fraction',
        modes: [
            { label: 'เปรียบเทียบ', build: fractionLcmCompareQuestion },
            { label: 'เรียงลำดับ', build: fractionLcmOrderQuestion },
        ],
        learn: [{
            label: 'ใช้ ค.ร.น.',
            title: 'ตัวอย่าง: 3/4 กับ 5/6',
            steps: [
                { say: 'หา ค.ร.น. ของตัวส่วน 4 และ 6', show: learnLines(['ค.ร.น. ของ 4 และ 6 = 12']) },
                { say: 'ทำตัวส่วนให้เป็น 12 ทั้งคู่', show: learnLines(['3/4 = 9/12', '5/6 = 10/12']) },
                { say: 'ตัวส่วนเท่ากันแล้ว เทียบตัวเศษ', show: learnLines(['9/12 < 10/12', '<strong>3/4 < 5/6</strong>']) },
            ],
        }],
    },
    {
        id: 'p6ratio', menu: 'อัตราส่วนและมาตราส่วน', title: 'อัตราส่วนและมาตราส่วน (ป.6)', label: 'อัตราส่วน (ป.6)',
        intro: 'เขียนอัตราส่วน หาอัตราส่วนที่เท่ากัน และแก้โจทย์ปัญหา', icon: 'bi-percent', op: 'percentage',
        modes: [
            { label: 'เขียนอัตราส่วน', build: ratioWriteQuestion },
            { label: 'อัตราส่วนเท่ากัน', build: ratioEqualQuestion },
            { label: 'โจทย์ปัญหา', build: ratioWordQuestion },
            { label: 'มาตราส่วน', build: mapScaleQuestion },
        ],
        learn: [{
            label: 'อัตราส่วนเท่ากัน',
            title: 'ตัวอย่าง: 3 : 4 = □ : 20',
            steps: [
                { say: 'ดูว่า 4 คูณอะไรได้ 20', show: learnLines(['4 × 5 = 20']) },
                { say: 'คูณจำนวนหน้าด้วยจำนวนเดียวกัน อัตราส่วนจึงเท่าเดิม', show: learnLines(['3 × 5 = 15', '<strong>3 : 4 = 15 : 20</strong>']) },
            ],
        }, {
            label: 'มาตราส่วน',
            title: 'ตัวอย่าง: 1 : 50,000 ระยะบนแผนที่ 4 เซนติเมตร',
            steps: [
                { say: '1 เซนติเมตรบนแผนที่เท่ากับ 50,000 เซนติเมตรของจริง', show: learnLines(['4 × 50,000 = 200,000 เซนติเมตร']) },
                { say: '1 กิโลเมตรเท่ากับ 100,000 เซนติเมตร จึงหารด้วย 100,000', show: learnLines(['200,000 ÷ 100,000 = <strong>2 กิโลเมตร</strong>']) },
            ],
        }],
    },
    { moved: 'menu_p5_gcflcm' },
    {
        id: 'p6factor', menu: 'โจทย์ ห.ร.ม. และ ค.ร.น.', title: 'โจทย์ ห.ร.ม. และ ค.ร.น. (ป.6)', label: 'โจทย์ ห.ร.ม. ค.ร.น. (ป.6)',
        intro: 'หา ห.ร.ม. และ ค.ร.น. ของ 3 จำนวน และแก้โจทย์ปัญหา', icon: 'bi-intersect', op: 'gcflcm',
        modes: [
            { label: '3 จำนวน', build: threeNumbersQuestion },
            { label: 'โจทย์ปัญหา', build: factorWordQuestion },
        ],
        learn: [{
            label: 'แยกให้ออก',
            title: 'โจทย์แบบไหนใช้อะไร',
            steps: [
                { say: 'ถ้าแบ่งให้<strong>เท่ากันและมากที่สุด</strong> ใช้ ห.ร.ม.', show: learnLines(['ผ้ายาว 24 และ 36 เมตร ตัดให้ยาวเท่ากันมากที่สุด', 'ห.ร.ม. ของ 24 และ 36 = 12 เมตร']) },
                { say: 'ถ้าถามว่า<strong>เมื่อไรจะตรงกันอีก</strong> ใช้ ค.ร.น.', show: learnLines(['ไฟกะพริบทุก 4 และ 6 วินาที', 'ค.ร.น. ของ 4 และ 6 = 12 วินาที']) },
            ],
        }],
    },
    {
        id: 'p6fractionops', menu: 'บวก ลบ คูณ หารเศษส่วน', title: 'บวก ลบ คูณ หารเศษส่วน (ป.6)', label: 'ระคนเศษส่วน (ป.6)',
        intro: 'หาผลลัพธ์ระคนของเศษส่วน และแก้โจทย์ปัญหา 2-3 ขั้นตอน', icon: 'bi-calculator-fill', op: 'fraction',
        modes: [
            { label: 'บวก ลบ', build: fractionLcmSumQuestion },
            { label: 'ระคน', build: fractionMixedOperationQuestion },
            { label: 'โจทย์ปัญหา', build: fractionWordQuestion },
        ],
        learn: [{
            label: 'ลำดับการคิด',
            title: 'ตัวอย่าง: 1/2 + 1/3 × 3/4',
            steps: [
                { say: 'ทำคูณก่อนบวก คูณบนกับบน ล่างกับล่าง', show: learnLines(['1/3 × 3/4 = 3/12']) },
                { say: 'ทำตัวส่วนให้เท่ากัน', show: learnLines(['1/2 = 6/12']) },
                { say: 'แล้วบวกตัวเศษ', show: learnLines(['6/12 + 3/12 = <strong>9/12</strong>']) },
            ],
        }, {
            label: 'โจทย์ปัญหา',
            title: 'ตัวอย่าง: มีเงิน 720 บาท ใช้ 1/3 แล้วออม 1/2 ของที่เหลือ',
            steps: [
                { say: 'หาเงินที่ใช้ไปก่อน', show: learnLines(['720 ÷ 3 = 240 บาท', 'เหลือ 720 − 240 = 480 บาท']) },
                { say: 'โจทย์พูดถึงเงิน<strong>ที่เหลือ</strong> จึงคิดจาก 480 ไม่ใช่ 720', show: learnLines(['480 ÷ 2 = 240 บาท', '<strong>เหลือเงิน 240 บาท</strong>']) },
            ],
        }],
    },
    {
        id: 'p6decimal', menu: 'หารทศนิยม', title: 'หารทศนิยม (ป.6)', label: 'หารทศนิยม (ป.6)',
        intro: 'หารด้วยทศนิยม แก้โจทย์ 3 ขั้นตอน และแลกเงินต่างประเทศ', icon: 'bi-slash-circle-fill', op: 'decimal',
        modes: [
            { label: 'หาร', build: decimalDivideQuestion },
            { label: 'โจทย์ปัญหา', build: decimalThreeStepQuestion },
            { label: 'แลกเงิน', build: exchangeQuestion },
        ],
        learn: [{
            label: 'ทำตัวหารเป็นจำนวนนับ',
            title: 'ตัวอย่าง: 3.6 ÷ 0.4',
            steps: [
                { say: 'เขียนเป็นเศษส่วน แล้วคูณทั้งเศษและส่วนด้วย 10 ให้ตัวหารเป็นจำนวนนับ', show: learnLines(['3.6 ÷ 0.4 = 36 ÷ 4']) },
                { say: 'หารตามปกติ', show: learnLines(['36 ÷ 4 = <strong>9</strong>']) },
                { say: 'ตรวจด้วยการคูณกลับ', show: learnLines(['9 × 0.4 = 3.6']) },
            ],
        }],
    },
    {
        id: 'p6percent', menu: 'ร้อยละ', title: 'ร้อยละ (ป.6)', label: 'ร้อยละ (ป.6)',
        intro: 'แก้โจทย์ปัญหาร้อยละ 2-3 ขั้นตอน', icon: 'bi-percent', op: 'percentage',
        modes: [
            { label: 'ลดราคา', build: percentDiscountQuestion },
            { label: 'กำไร', build: percentProfitQuestion },
            { label: 'หาร้อยละ', build: percentFindQuestion },
            { label: 'ดอกเบี้ย', build: percentInterestQuestion },
        ],
        learn: [{
            label: 'ลดราคา',
            title: 'ตัวอย่าง: ราคา 800 บาท ลดร้อยละ 15 จ่าย 1,000 บาท',
            steps: [
                { say: 'หาส่วนลด ร้อยละ 15 คือ 15 ส่วนจาก 100', show: learnLines(['800 × 15 ÷ 100 = 120 บาท']) },
                { say: 'หาราคาที่ต้องจ่าย', show: learnLines(['800 − 120 = 680 บาท']) },
                { say: 'หาเงินทอน', show: learnLines(['1,000 − 680 = <strong>320 บาท</strong>']) },
            ],
        }, {
            label: 'หาร้อยละ',
            title: 'ตัวอย่าง: ได้ 18 คะแนน จาก 40',
            steps: [
                { say: 'ทำให้คะแนนเต็มเป็น 100 ด้วยการคูณ 100 แล้วหารด้วยคะแนนเต็ม', show: learnLines(['18 × 100 ÷ 40 = <strong>45</strong>']) },
                { say: 'คิดเป็นร้อยละ 45', show: learnLines(['ร้อยละ 45']) },
            ],
        }],
    },
    {
        id: 'p6pattern', menu: 'แบบรูป', title: 'แบบรูป (ป.6)', label: 'แบบรูป (ป.6)',
        intro: 'หาความสัมพันธ์ในแบบรูป แล้วใช้หาคำตอบ', icon: 'bi-list-ol', op: 'pattern',
        modes: [
            { label: 'แบบรูปจำนวน', build: patternSequenceQuestion },
            { label: 'รูปที่เท่าไร', build: patternStickQuestion },
        ],
        learn: [{
            label: 'หาความสัมพันธ์',
            title: 'ตัวอย่าง: รูปที่ 1 ใช้ 4 ก้าน รูปที่ 2 ใช้ 7 ก้าน รูปที่ 3 ใช้ 10 ก้าน',
            steps: [
                { say: 'แต่ละรูปเพิ่มขึ้นครั้งละ 3 ก้าน', show: learnLines(['4, 7, 10, ...']) },
                { say: 'รูปที่ 20 เพิ่มจากรูปแรก 19 ครั้ง', show: learnLines(['19 × 3 = 57']) },
                { say: 'บวกจำนวนเริ่มต้น', show: learnLines(['4 + 57 = <strong>61 ก้าน</strong>']) },
            ],
        }],
    },
    {
        id: 'p6volume', menu: 'ปริมาตร', title: 'ปริมาตร (ป.6)', label: 'ปริมาตร (ป.6)',
        intro: 'หาปริมาตรของรูปที่ประกอบด้วยทรงสี่เหลี่ยมมุมฉาก', icon: 'bi-box', op: 'volume',
        modes: [
            { label: 'รวมปริมาตร', build: compositeVolumeQuestion },
            { label: 'เจาะช่อง', build: hollowVolumeQuestion },
        ],
        learn: [{
            label: 'แยกเป็นก้อน',
            title: 'ตัวอย่าง: สองก้อนประกอบกัน',
            steps: [
                { say: 'แยกรูปเป็นทรงสี่เหลี่ยมมุมฉาก แล้วหาปริมาตรทีละก้อนด้วย กว้าง × ยาว × สูง', show: learnLines(['ก้อนแรก 2 × 3 × 4 = 24', 'ก้อนที่สอง 5 × 2 × 3 = 30']) },
                { say: 'บวกกัน ถ้าเป็นการเจาะออกให้ลบแทน', show: learnLines(['24 + 30 = <strong>54 ลูกบาศก์เซนติเมตร</strong>']) },
            ],
        }],
    },
    {
        id: 'p6polygon', menu: 'รูปหลายเหลี่ยม', title: 'รูปหลายเหลี่ยม (ป.6)', label: 'รูปหลายเหลี่ยม (ป.6)',
        intro: 'หาความยาวรอบรูป พื้นที่ และมุมภายในของรูปหลายเหลี่ยม', icon: 'bi-pentagon', op: 'geometry',
        modes: [
            { label: 'รอบรูป', build: polygonPerimeterQuestion },
            { label: 'พื้นที่สามเหลี่ยม', build: triangleAreaQuestion },
            { label: 'พื้นที่รวม', build: polygonCompositeQuestion },
            { label: 'มุมภายใน', build: polygonAngleQuestion },
        ],
        learn: [{
            label: 'พื้นที่สามเหลี่ยม',
            title: 'ตัวอย่าง: ฐาน 10 ซม. สูง 6 ซม.',
            steps: [
                { say: 'รูปสามเหลี่ยมมีพื้นที่ครึ่งหนึ่งของรูปสี่เหลี่ยมที่ฐานและสูงเท่ากัน', show: triangleAreaFigure(10, 6) },
                { say: 'จึงใช้ ½ × ฐาน × สูง', show: learnLines(['½ × 10 × 6 = <strong>30 ตารางเซนติเมตร</strong>']) },
            ],
        }, {
            label: 'มุมภายใน',
            title: 'ตัวอย่าง: รูปหกเหลี่ยม',
            steps: [
                { say: 'แบ่งรูป n เหลี่ยมจากมุมเดียวได้ n − 2 รูปสามเหลี่ยม', show: learnLines(['6 − 2 = 4 รูปสามเหลี่ยม']) },
                { say: 'แต่ละรูปสามเหลี่ยมมีมุมรวม 180 องศา', show: learnLines(['4 × 180 = <strong>720 องศา</strong>']) },
            ],
        }],
    },
    {
        id: 'p6circle', menu: 'วงกลม', title: 'วงกลม (ป.6)', label: 'วงกลม (ป.6)',
        intro: 'หาความยาวรอบวงและพื้นที่ของวงกลม', icon: 'bi-circle', op: 'geometry',
        modes: [
            { label: 'รอบวง', build: circleCircumferenceQuestion },
            { label: 'พื้นที่', build: circleAreaQuestion },
            { label: 'หารัศมี', build: circleRadiusQuestion },
            { label: 'โจทย์ปัญหา', build: circleWordQuestion },
        ],
        learn: [{
            label: 'รอบวงและพื้นที่',
            title: 'ตัวอย่าง: รัศมี 7 เซนติเมตร',
            steps: [
                { say: 'ความยาวรอบวงคือ 2 × π × รัศมี ใช้ π ≈ 22/7', show: learnLines(['2 × 22/7 × 7 = <strong>44 เซนติเมตร</strong>']) },
                { say: 'พื้นที่คือ π × รัศมี × รัศมี', show: learnLines(['22/7 × 7 × 7 = <strong>154 ตารางเซนติเมตร</strong>']) },
            ],
        }],
    },
    {
        id: 'p6triangle', menu: 'รูปสามเหลี่ยม', title: 'รูปสามเหลี่ยม (ป.6)', label: 'รูปสามเหลี่ยม (ป.6)',
        intro: 'จำแนกรูปสามเหลี่ยมจากด้านและมุม', icon: 'bi-triangle', op: 'shape',
        modes: [
            { label: 'ตามด้าน', build: triangleBySidesQuestion },
            { label: 'ตามมุม', build: triangleByAnglesQuestion },
            { label: 'หามุม', build: triangleMissingAngleQuestion },
        ],
        learn: [{
            label: 'จำแนก',
            title: 'แบ่งตามด้านและมุม',
            steps: [
                { say: 'ตามด้าน ดูว่ามีด้านเท่ากันกี่ด้าน', show: learnLines(['เท่ากัน 3 ด้าน = ด้านเท่า', 'เท่ากัน 2 ด้าน = หน้าจั่ว', 'ไม่เท่าเลย = ด้านไม่เท่า']) },
                { say: 'ตามมุม ดูมุมที่ใหญ่ที่สุด', show: learnLines(['น้อยกว่า 90 องศา = มุมแหลม', '90 องศา = มุมฉาก', 'มากกว่า 90 องศา = มุมป้าน']) },
                { say: 'มุมภายในทั้งสามรวมกันได้ 180 องศาเสมอ', show: learnLines(['60 + 70 + □ = 180', '□ = 50 องศา']) },
            ],
        }],
    },
    {
        id: 'p6solid', menu: 'รูปเรขาคณิตสามมิติ', title: 'รูปเรขาคณิตสามมิติ (ป.6)', label: 'รูปสามมิติ (ป.6)',
        intro: 'บอกลักษณะของรูปสามมิติ และรู้จักรูปคลี่', icon: 'bi-box-fill', op: 'volume',
        modes: [
            { label: 'ลักษณะ', build: solidFactQuestion },
            { label: 'รูปคลี่', build: solidNetQuestion },
        ],
        learn: [{
            label: 'รูปคลี่',
            title: 'ตัวอย่าง: ทรงกระบอก',
            steps: [
                { say: 'รูปคลี่คือการคลี่ผิวของรูปสามมิติออกเป็นแผ่นเรียบ', show: SOLID_NETS[0].figure },
                { say: 'ฐานคือวงกลม 2 วง ส่วนผิวข้างคลี่ออกเป็นรูปสี่เหลี่ยมผืนผ้า', show: learnLines(['<strong>ประกอบแล้วได้ทรงกระบอก</strong>']) },
            ],
        }],
    },
    {
        id: 'p6piechart', menu: 'แผนภูมิรูปวงกลม', title: 'แผนภูมิรูปวงกลม (ป.6)', label: 'แผนภูมิรูปวงกลม (ป.6)',
        intro: 'อ่านแผนภูมิรูปวงกลมเพื่อตอบคำถาม', icon: 'bi-pie-chart-fill', op: 'barchart',
        modes: [{ label: 'แผนภูมิรูปวงกลม', build: pieChartQuestion }],
        learn: [{
            label: 'จากร้อยละเป็นจำนวน',
            title: 'ตัวอย่าง: นักเรียน 400 คน ชอบฟุตบอลร้อยละ 35',
            steps: [
                { say: 'ทั้งวงกลมคือร้อยละ 100 แต่ละส่วนบอกเป็นร้อยละของทั้งหมด', show: pieFigure([{ label: 'ฟุตบอล', percent: 35 }, { label: 'ว่ายน้ำ', percent: 30 }, { label: 'แบดมินตัน', percent: 20 }, { label: 'วิ่ง', percent: 15 }]) },
                { say: 'เปลี่ยนร้อยละเป็นจำนวนคน', show: learnLines(['400 × 35 ÷ 100 = <strong>140 คน</strong>']) },
            ],
        }],
    },
]);

lessonIndicators.p6 = [
    { code: 'ค 1.1 ป.6/1', text: 'เปรียบเทียบ เรียงลำดับเศษส่วนและจำนวนคละ จากสถานการณ์ต่าง ๆ', lesson: 'p6fraction' },
    { code: 'ค 1.1 ป.6/2', text: 'เขียนอัตราส่วนแสดงการเปรียบเทียบปริมาณ 2 ปริมาณ จากข้อความหรือสถานการณ์', lesson: 'p6ratio' },
    { code: 'ค 1.1 ป.6/3', text: 'หาอัตราส่วนที่เท่ากับอัตราส่วนที่กำหนดให้', lesson: 'p6ratio' },
    { code: 'ค 1.1 ป.6/4', text: 'หา ห.ร.ม. ของจำนวนนับไม่เกิน 3 จำนวน', lesson: 'p5gcflcm', also: ['p6factor'] },
    { code: 'ค 1.1 ป.6/5', text: 'หา ค.ร.น. ของจำนวนนับไม่เกิน 3 จำนวน', lesson: 'p5gcflcm', also: ['p6factor'] },
    { code: 'ค 1.1 ป.6/6', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาโดยใช้ความรู้เกี่ยวกับ ห.ร.ม. และ ค.ร.น.', lesson: 'p6factor' },
    { code: 'ค 1.1 ป.6/7', text: 'หาผลลัพธ์ของการบวก ลบ คูณ หารระคนของเศษส่วนและจำนวนคละ', lesson: 'p6fractionops' },
    { code: 'ค 1.1 ป.6/8', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเศษส่วนและจำนวนคละ 2-3 ขั้นตอน', lesson: 'p6fractionops' },
    { code: 'ค 1.1 ป.6/9', text: 'หาผลหารของทศนิยมที่ตัวหารและผลหารเป็นทศนิยมไม่เกิน 3 ตำแหน่ง', lesson: 'p6decimal' },
    { code: 'ค 1.1 ป.6/10', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวก การลบ การคูณ การหารทศนิยม 3 ขั้นตอน', lesson: 'p6decimal' },
    { code: 'ค 1.1 ป.6/11', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาอัตราส่วน', lesson: 'p6ratio' },
    { code: 'ค 1.1 ป.6/12', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาร้อยละ 2-3 ขั้นตอน', lesson: 'p6percent' },
    { code: 'ค 1.2 ป.6/1', text: 'แสดงวิธีคิดและหาคำตอบของปัญหาเกี่ยวกับแบบรูป', lesson: 'p6pattern' },
    { code: 'ค 2.1 ป.6/1', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับปริมาตรของรูปเรขาคณิตสามมิติที่ประกอบด้วยทรงสี่เหลี่ยมมุมฉาก', lesson: 'p6volume' },
    { code: 'ค 2.1 ป.6/2', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับความยาวรอบรูปและพื้นที่ของรูปหลายเหลี่ยม', lesson: 'p6polygon' },
    { code: 'ค 2.1 ป.6/3', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับความยาวรอบรูปและพื้นที่ของวงกลม', lesson: 'p6circle' },
    { code: 'ค 2.2 ป.6/1', text: 'จำแนกรูปสามเหลี่ยมโดยพิจารณาจากสมบัติของรูป', lesson: 'p6triangle' },
    { code: 'ค 2.2 ป.6/3', text: 'บอกลักษณะของรูปเรขาคณิตสามมิติชนิดต่าง ๆ', lesson: 'p6solid' },
    { code: 'ค 2.2 ป.6/4', text: 'ระบุรูปเรขาคณิตสามมิติที่ประกอบจากรูปคลี่ และระบุรูปคลี่ของรูปเรขาคณิตสามมิติ', lesson: 'p6solid' },
    { code: 'ค 3.1 ป.6/1', text: 'ใช้ข้อมูลจากแผนภูมิรูปวงกลมในการหาคำตอบของโจทย์ปัญหา', lesson: 'p6piechart' },
];

finalQuizNotCovered.p6 = 'ยังมีอีก 1 ตัวชี้วัด คือ ค 2.2 ป.6/2 การสร้างรูปสามเหลี่ยม ซึ่งต้องใช้ไม้บรรทัดและวงเวียน เว็บนี้จึงฝึกให้ไม่ได้';
