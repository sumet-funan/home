// The grade indicators the final quiz is built from, in the words of the core
// curriculum (ตัวชี้วัดและสาระการเรียนรู้แกนกลาง กลุ่มสาระคณิตศาสตร์ ฉบับปรับปรุง พ.ศ. 2560).
// Each one names the lesson that teaches it and builds a question for it, and the
// parent section of the Progress page reads them too. `also` lists any other lessons
// that practise what the sentence names: they count on the Progress page, while the
// quiz keeps to `lesson`, which is the one its question is about. A question is
// { text, figure?, answer, wrong: [three others] }, and an answer is either plain
// text or { html, label } when it has to be drawn.
//
// ป.5 has 19 indicators and 17 are here: ค 2.2 ป.5/1 and ป.5/3 ask a child to draw
// with a ruler and protractor, which a tap cannot show.

function finalPlaces(number) {
    let text = String(number);
    return text.indexOf('.') === -1 ? 0 : text.length - text.indexOf('.') - 1;
}

// three wrong answers close enough to the right one to need working out
function nearbyNumbers(answer) {
    let places = finalPlaces(answer);
    let unit = Math.pow(10, -places);
    let steps = answer >= 100 ? [1, 2, 10, 20, 100] : (answer >= 20 ? [1, 2, 5, 10] : [1, 2, 3]);
    let found = [];

    shuffleList(steps).forEach(function (step) {
        [answer + step * unit, answer - step * unit].forEach(function (value) {
            let text = value.toFixed(places);
            if (value >= 0 && text !== answer.toFixed(places) && found.indexOf(text) === -1) {
                found.push(text);
            }
        });
    });

    // only the very smallest answers can run short of neighbours
    for (let extra = 4; found.length < 3; extra++) {
        found.push((answer + extra * unit).toFixed(places));
    }

    return shuffleList(found).slice(0, 3);
}

function numberQuestion(text, answer, figure) {
    return { text: text, figure: figure, answer: String(answer), wrong: nearbyNumbers(answer) };
}

function compareStatements(first, second, firstText, secondText) {
    let symbol = compareSymbolText[compareSymbolOf(first, second)];

    if (first === second) {
        return {
            text: 'ข้อใดถูกต้อง',
            answer: `${firstText} = ${secondText}`,
            wrong: [`${firstText} > ${secondText}`, `${firstText} < ${secondText}`, `${firstText} ≠ ${secondText}`],
        };
    }

    let opposite = symbol === '>' ? '<' : '>';

    return {
        text: 'ข้อใดถูกต้อง',
        answer: `${firstText} ${Math.random() < 0.25 ? '≠' : symbol} ${secondText}`,
        wrong: [`${firstText} ${opposite} ${secondText}`, `${firstText} = ${secondText}`, `${secondText} ${symbol} ${firstText}`],
    };
}

function orderQuestion(largest) {
    let count = randomInt(3, 5);
    let numbers = [];

    while (numbers.length < count) {
        let number = randomInt(0, largest);
        if (numbers.indexOf(number) === -1) {
            numbers.push(number);
        }
    }

    let ascending = Math.random() < 0.5;
    let sorted = numbers.slice().sort(function (a, b) { return ascending ? a - b : b - a; });
    let wrong = [];

    while (wrong.length < 3) {
        let text = shuffleList(sorted).join(', ');
        if (text !== sorted.join(', ') && wrong.indexOf(text) === -1) {
            wrong.push(text);
        }
    }

    return { text: `ข้อใดเรียง ${numbers.join(', ')} จาก${ascending ? 'น้อยไปมาก' : 'มากไปน้อย'}`, answer: sorted.join(', '), wrong: wrong };
}

function pictographQuestion(perPicture) {
    let question = buildPictographQuestion(perPicture);
    return numberQuestion(question.text, question.expected, question.html);
}

function shapeNameQuestion(text, figure, right, names) {
    return { text: text, figure: figure, answer: right, wrong: shuffleList(names.filter(function (name) { return name !== right; })).slice(0, 3) };
}

// ---------- ป.1 ----------

function finalP1WordProblem() {
    let name = pickOne(wordNames), itemObj = pickOne(wordItems);

    if (Math.random() < 0.5) {
        let first = randomInt(10, 60), second = randomInt(5, 100 - first);
        return numberQuestion(`${name}มี${itemObj.item} ${first} ${itemObj.classifier} ซื้อเพิ่มอีก ${second} ${itemObj.classifier} ${name}มี${itemObj.item}ทั้งหมดกี่${itemObj.classifier}`, first + second);
    }

    let first = randomInt(20, 100), second = randomInt(5, first);
    return numberQuestion(`${name}มี${itemObj.item} ${first} ${itemObj.classifier} ให้เพื่อนไป ${second} ${itemObj.classifier} ${name}เหลือ${itemObj.item}กี่${itemObj.classifier}`, first - second);
}

function finalP1Pattern() {
    if (Math.random() < 0.5) {
        let step = pickOne([1, 10, -1, -10]);
        let start = step > 0 ? randomInt(0, 100 - step * 4) : randomInt(-step * 4, 100);
        let terms = [0, 1, 2, 3].map(function (index) { return start + step * index; });
        return numberQuestion(`จำนวนถัดไปของแบบรูปนี้คือจำนวนใด: ${terms.join(', ')}, □`, start + step * 4);
    }

    let types = shuffleList(Object.keys(patternShapeLabels));
    let missingAt = randomInt(2, 5);
    let cells = [0, 1, 2, 3, 4, 5].map(function (index) {
        return index === missingAt
            ? '<span class="pattern-shape is-missing">?</span>'
            : `<span class="pattern-shape">${renderPatternShape(types[index % 2])}</span>`;
    });
    let option = function (type) {
        return { html: renderPatternShape(type), label: patternShapeLabels[type] };
    };

    return {
        text: 'รูปใดหายไปจากแบบรูปนี้',
        figure: `<div class="pattern-shapes">${cells.join('')}</div>`,
        answer: option(types[missingAt % 2]),
        wrong: [option(types[(missingAt + 1) % 2]), option(types[2]), option(types[3])],
    };
}

function finalP1Shape() {
    let type = pickOne(Object.keys(shapeLabels));
    return shapeNameQuestion('รูปนี้มีชื่อว่าอะไร', renderShapeSVG(type), shapeLabels[type], Object.values(shapeLabels));
}

// ---------- ป.2 ----------

function finalP2Number() {
    let number = randomInt(0, 1000);
    if (Math.random() < 0.5) {
        return numberQuestion(`${numberToThaiWords(number)} เขียนเป็นตัวเลขได้อย่างไร`, number);
    }
    return numberQuestion(`${toThaiDigits(number)} เขียนเป็นเลขฮินดูอารบิกได้อย่างไร`, number);
}

function finalP2Divide() {
    let divisor = randomInt(2, 9), quotient = randomInt(1, 9), remainder = randomInt(0, divisor - 1);
    let dividend = divisor * quotient + remainder;

    if (remainder && Math.random() < 0.5) {
        return numberQuestion(`${dividend} ÷ ${divisor} = ${quotient} เศษ □ จำนวนใน □ คือข้อใด`, remainder);
    }
    if (remainder) {
        return numberQuestion(`${dividend} ÷ ${divisor} = □ เศษ ${remainder} จำนวนใน □ คือข้อใด`, quotient);
    }
    return numberQuestion(`${dividend} ÷ ${divisor} = □ จำนวนใน □ คือข้อใด`, quotient);
}

function finalMissing(builder) {
    let question = builder();
    return numberQuestion(`${question.text} จำนวนใน □ คือข้อใด`, question.expected);
}

function finalP2Time() {
    if (Math.random() < 0.5) {
        let question = buildP2TimeWord();
        return numberQuestion(question.text, question.expected);
    }

    let hour = randomInt(1, 12), minute = randomInt(0, 11) * 5;
    let time = function (h, m) { return `${h} นาฬิกา ${m} นาที`; };

    return {
        text: 'นาฬิกาเรือนนี้บอกเวลาเท่าไร',
        figure: renderP2ClockSVG(hour, minute),
        answer: time(hour, minute),
        wrong: [time(hour % 12 + 1, minute), time(hour, (minute + 15) % 60), time(hour % 12 + 1, (minute + 30) % 60)],
    };
}

function finalP2LengthCompare() {
    let first = randomInt(135, 895), second = first + randomInt(-30, 30);
    return compareStatements(first, second, p2CompoundLength(first), `${second} ซม.`);
}

function finalP2LengthWord() {
    let question = buildP2LengthWord();
    let text = function (metres, centimetres) { return `${metres} เมตร ${centimetres} เซนติเมตร`; };
    let metres = question.expectedMetres, centimetres = question.expectedCentimetres;

    return {
        text: question.text,
        answer: text(metres, centimetres),
        wrong: [text(metres + 1, centimetres), text(metres, (centimetres + 10) % 100), text(metres + 1, (centimetres + 10) % 100)],
    };
}

function finalP2WeightCompare() {
    let unit = pickOne(p2WeightUnits);
    let steps = unit.perKilogram / unit.step;
    let first = randomInt(steps + 6, steps * 6 - 1), second = first + randomInt(-5, 5);
    return compareStatements(first, second, p2CompoundWeight(first * unit.step, unit), `${second * unit.step} ${unit.name}`);
}

function finalP2WeightWord() {
    let question = buildP2WeightWord();
    let shift = question.unit.step * 2;
    let text = function (kilograms, small) { return `${kilograms} กิโลกรัม ${small} ${question.unit.name}`; };
    let kilograms = question.expectedKilograms, small = question.expectedSmall;
    let otherSmall = (small + shift) % question.unit.perKilogram;

    return {
        text: question.text,
        answer: text(kilograms, small),
        wrong: [text(kilograms + 1, small), text(kilograms, otherSmall), text(kilograms + 1, otherSmall)],
    };
}

function finalP2Capacity() {
    let first = randomInt(1, 100), second = Math.random() < 0.2 ? first : randomInt(1, 100);
    return compareStatements(first, second, `${first} ลิตร`, `${second} ลิตร`);
}

function finalP2Shape() {
    let type = pickOne(['3', '4', '5', '6', 'circle']);
    return shapeNameQuestion('รูปนี้มีชื่อว่าอะไร', renderP2ShapeSVG(type), p2ShapeLabels[type], Object.values(p2ShapeLabels));
}

// ---------- ป.5 ----------

function fractionText(numerator, denominator) {
    let divisor = gcfOf(numerator, denominator);
    let top = numerator / divisor, bottom = denominator / divisor;
    let whole = Math.floor(top / bottom), rest = top - whole * bottom;

    if (!rest) {
        return String(whole);
    }
    return whole ? `${whole} ${rest}/${bottom}` : `${rest}/${bottom}`;
}

// wrong answers keep the right answer's denominator, which is how the mistakes
// a child really makes tend to look
function fractionChoices(text, numerator, denominator) {
    let divisor = gcfOf(numerator, denominator);
    let top = numerator / divisor, bottom = denominator / divisor;
    let answer = fractionText(top, bottom);
    let wrong = [];

    for (let offset = 1; wrong.length < 3; offset++) {
        [top + offset, top + offset * bottom, top - offset].forEach(function (other) {
            let option = other > 0 ? fractionText(other, bottom) : answer;
            if (option !== answer && wrong.indexOf(option) === -1 && wrong.length < 3) {
                wrong.push(option);
            }
        });
    }

    return { text: text, answer: answer, wrong: wrong };
}

function finalP5FractionSum(symbols) {
    let denominators = [2, 3, 4, 5, 6, 8, 10, 12];
    let first = pickOne(denominators), second = pickOne(denominators);
    let firstTop = randomInt(1, first * 2), secondTop = randomInt(1, second * 2);
    let symbol = pickOne(symbols);
    let top, bottom;

    if (symbol === '×') {
        top = firstTop * secondTop;
        bottom = first * second;
    } else if (symbol === '÷') {
        top = firstTop * second;
        bottom = first * secondTop;
    } else {
        // the larger goes first, so that a subtraction cannot go below nothing
        if (symbol === '−' && firstTop * second <= secondTop * first) {
            return finalP5FractionSum(symbols);
        }
        top = symbol === '+' ? firstTop * second + secondTop * first : firstTop * second - secondTop * first;
        bottom = first * second;
    }

    return fractionChoices(`${fractionText(firstTop, first)} ${symbol} ${fractionText(secondTop, second)} เท่ากับข้อใด`, top, bottom);
}

function finalWordProblem(builders) {
    let question = pickOne(builders)(pickOne(wordProblemP5Names));
    return numberQuestion(question.text, +question.expected.toFixed(3));
}

function finalDecimal(symbol, show) {
    let numbers = suggestDecimalNumbers(symbol === '×' ? '*' : '/');
    let result = symbol === '×' ? numbers.first * numbers.second : numbers.first / numbers.second;
    return numberQuestion(`${numbers.first} ${show} ${numbers.second} เท่ากับข้อใด`, +result.toFixed(3));
}

function finalMeasure(builders) {
    let question = pickOne(builders)();
    return numberQuestion(`${question.text} เป็นกี่${question.unit}`, question.expected);
}

function finalVolume() {
    if (Math.random() < 0.5) {
        let width = randomInt(2, 11), length = randomInt(2, 11), height = randomInt(2, 11);
        return numberQuestion(`กล่องทรงสี่เหลี่ยมมุมฉาก กว้าง ${width} ซม. ยาว ${length} ซม. สูง ${height} ซม. มีปริมาตรกี่ลูกบาศก์เซนติเมตร`, width * length * height);
    }

    let width = randomInt(1, 6) * 10, length = randomInt(1, 6) * 10, height = randomInt(1, 6) * 10;
    return numberQuestion(`ถังทรงสี่เหลี่ยมมุมฉาก กว้าง ${width} ซม. ยาว ${length} ซม. สูง ${height} ซม. จุน้ำกี่ลิตร`, width * length * height / 1000);
}

function finalQuadArea() {
    let mode = pickOne(['perimeter', 'area']);
    let question = pickOne(quadAreaBuilders[mode])();
    let asked = mode === 'area' ? 'มีพื้นที่กี่ตารางเซนติเมตร' : 'มีความยาวรอบรูปกี่เซนติเมตร';
    return numberQuestion(`${question.text} ${asked}`, question.expected, renderQuadrilateralSVG(question.type));
}

function finalQuadrilateral() {
    let type = pickOne(Object.keys(quadrilaterals));
    let names = Object.keys(quadrilaterals).map(function (key) { return quadrilaterals[key].label; });

    if (Math.random() < 0.5) {
        return shapeNameQuestion('รูปนี้เป็นรูปสี่เหลี่ยมชนิดใด', renderQuadrilateralSVG(type), quadrilaterals[type].label, names);
    }
    return shapeNameQuestion(`รูปสี่เหลี่ยมที่${quadrilaterals[type].rule} คือรูปใด`, null, quadrilaterals[type].label, names);
}

function finalPrism() {
    let question = buildPrismQuestion();
    return numberQuestion(question.text, question.expected, renderPrismSVG(question.sides));
}

function finalLineGraph() {
    let question = buildLineGraphQuestion();
    return numberQuestion(question.text, question.expected, `<div class="line-graph">${question.figure}</div>`);
}

function finalBarWrite() {
    let scale = pickOne([2, 5, 10]), height = randomInt(1, 8);
    let category = pickOne(barWriteCategories);
    return numberQuestion(`เขียนแผนภูมิแท่งโดยให้ 1 ช่องแทน ${scale} คน ถ้ามีคนชอบ${category} ${height * scale} คน แท่งของ${category}ต้องสูงกี่ช่อง`, height);
}

// said to parents under the list, so the count there is not taken for all of them
var finalQuizNotCovered = {
    p5: 'ยังมีอีก 2 ตัวชี้วัด คือ ค 2.2 ป.5/1 และ ป.5/3 ซึ่งเป็นการสร้างรูปด้วยไม้บรรทัดและไม้โปรแทรกเตอร์ เว็บนี้จึงฝึกให้ไม่ได้',
};

var finalQuizIndicators = {
    p1: [
        { code: 'ค 1.1 ป.1/1', text: 'บอกจำนวน อ่านและเขียนตัวเลขฮินดูอารบิกและตัวเลขไทย ไม่เกิน 100 และ 0', lesson: 'p1number', also: ['p1placevalue'], build: function () {
            let number = randomInt(0, 100);
            if (number && number < 100 && Math.random() < 0.5) {
                return numberQuestion('รูปนี้แสดงจำนวนใด', number, renderNumberBlocks(number));
            }
            return numberQuestion(`${toThaiDigits(number)} เขียนเป็นเลขฮินดูอารบิกได้อย่างไร`, number);
        } },
        { code: 'ค 1.1 ป.1/2', text: 'เปรียบเทียบจำนวนนับไม่เกิน 100 และ 0 โดยใช้เครื่องหมาย = ≠ > <', lesson: 'p1compare', build: function () {
            let first = randomInt(0, 100), second = Math.random() < 0.2 ? first : randomInt(0, 100);
            return compareStatements(first, second, String(first), String(second));
        } },
        { code: 'ค 1.1 ป.1/3', text: 'เรียงลำดับจำนวนนับไม่เกิน 100 และ 0 ตั้งแต่ 3 ถึง 5 จำนวน', lesson: 'p1compare', build: function () { return orderQuestion(100); } },
        { code: 'ค 1.1 ป.1/4', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์การบวกและการลบ', lesson: 'p1missing', also: ['p1plus', 'p1minus', 'p1numberbond'], build: function () { return finalMissing(p1MissingBuilders[pickOne(['add', 'sub'])]); } },
        { code: 'ค 1.1 ป.1/5', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวกและการลบ', lesson: 'p1wordproblem', build: finalP1WordProblem },
        { code: 'ค 1.2 ป.1/1', text: 'ระบุจำนวนที่หายไปในแบบรูปทีละ 1 และทีละ 10 และรูปที่หายไปในแบบรูปซ้ำ', lesson: 'p1pattern', build: finalP1Pattern },
        { code: 'ค 2.1 ป.1/1', text: 'วัดและเปรียบเทียบความยาวเป็นเซนติเมตร เป็นเมตร', lesson: 'p1length', build: function () {
            let unit = pickOne([['ซม.', 100], ['ม.', 20]]);
            let first = randomInt(1, unit[1]), second = randomInt(1, unit[1]);
            return compareStatements(first, second, `${first} ${unit[0]}`, `${second} ${unit[0]}`);
        } },
        { code: 'ค 2.1 ป.1/2', text: 'วัดและเปรียบเทียบน้ำหนักเป็นกิโลกรัม เป็นขีด', lesson: 'p1weight', build: function () {
            let unit = pickOne([['กก.', 20], ['ขีด', 10]]);
            let first = randomInt(1, unit[1]), second = randomInt(1, unit[1]);
            return compareStatements(first, second, `${first} ${unit[0]}`, `${second} ${unit[0]}`);
        } },
        { code: 'ค 2.2 ป.1/1', text: 'จำแนกรูปสามเหลี่ยม รูปสี่เหลี่ยม วงกลม วงรี ทรงสี่เหลี่ยมมุมฉาก ทรงกลม ทรงกระบอก และกรวย', lesson: 'p1shape', build: finalP1Shape },
        { code: 'ค 3.1 ป.1/1', text: 'ใช้ข้อมูลจากแผนภูมิรูปภาพเมื่อ 1 รูปแทน 1 หน่วย', lesson: 'p1pictograph', build: function () { return pictographQuestion(1); } },
    ],
    p2: [
        { code: 'ค 1.1 ป.2/1', text: 'อ่านและเขียนตัวเลขฮินดูอารบิก ตัวเลขไทย ตัวหนังสือ แสดงจำนวนนับไม่เกิน 1,000 และ 0', lesson: 'p2placevalue', build: finalP2Number },
        { code: 'ค 1.1 ป.2/2', text: 'เปรียบเทียบจำนวนนับไม่เกิน 1,000 และ 0 โดยใช้เครื่องหมาย = ≠ > <', lesson: 'p2compare', build: function () {
            let first = randomInt(100, 999), second = Math.floor(first / 100) * 100 + randomInt(0, 99);
            return compareStatements(first, second, String(first), String(second));
        } },
        { code: 'ค 1.1 ป.2/3', text: 'เรียงลำดับจำนวนนับไม่เกิน 1,000 และ 0 ตั้งแต่ 3 ถึง 5 จำนวน', lesson: 'p2compare', build: function () { return orderQuestion(1000); } },
        { code: 'ค 1.1 ป.2/4', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์การบวกและการลบ', lesson: 'p2missing', also: ['p2plus', 'p2minus'], build: function () { return finalMissing(pickOne(p2MissingBuilders.addsub)); } },
        { code: 'ค 1.1 ป.2/5', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์การคูณของจำนวน 1 หลักกับจำนวนไม่เกิน 2 หลัก', lesson: 'p2multiply', also: ['p2missing'], build: function () { return finalMissing(p2MissingBuilders.muldiv[0]); } },
        { code: 'ค 1.1 ป.2/6', text: 'หาค่าของตัวไม่ทราบค่าในประโยคสัญลักษณ์การหาร ทั้งหารลงตัวและหารไม่ลงตัว', lesson: 'p2divide', also: ['p2missing'], build: finalP2Divide },
        { code: 'ค 1.1 ป.2/7', text: 'หาผลลัพธ์การบวก ลบ คูณ หารระคน', lesson: 'p2mixed', build: function () {
            let question = pickOne(p2MixedBuilders[pickOne(['addsub', 'all'])])();
            return numberQuestion(`${question.text} เท่ากับข้อใด`, question.expected);
        } },
        { code: 'ค 1.1 ป.2/8', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหา 2 ขั้นตอน', lesson: 'p2wordproblem', build: function () {
            let itemObj = pickOne(wordItems);
            let question = pickOne(p2WordProblemBuilders)(pickOne(wordNames), itemObj.item, itemObj.classifier);
            return numberQuestion(question.text, question.expected);
        } },
        { code: 'ค 2.1 ป.2/1', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับเวลาที่มีหน่วยเดี่ยวและเป็นหน่วยเดียวกัน', lesson: 'p2time', build: finalP2Time },
        { code: 'ค 2.1 ป.2/2', text: 'วัดและเปรียบเทียบความยาวเป็นเมตรและเซนติเมตร', lesson: 'p2length', build: finalP2LengthCompare },
        { code: 'ค 2.1 ป.2/3', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวก การลบเกี่ยวกับความยาว', lesson: 'p2length', build: finalP2LengthWord },
        { code: 'ค 2.1 ป.2/4', text: 'วัดและเปรียบเทียบน้ำหนักเป็นกิโลกรัมและกรัม กิโลกรัมและขีด', lesson: 'p2weight', build: finalP2WeightCompare },
        { code: 'ค 2.1 ป.2/5', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาการบวก การลบเกี่ยวกับน้ำหนัก', lesson: 'p2weight', build: finalP2WeightWord },
        { code: 'ค 2.1 ป.2/6', text: 'วัดและเปรียบเทียบปริมาตรและความจุเป็นลิตร', lesson: 'p2capacity', build: finalP2Capacity },
        { code: 'ค 2.2 ป.2/1', text: 'จำแนกและบอกลักษณะของรูปหลายเหลี่ยมและวงกลม', lesson: 'p2shape', build: finalP2Shape },
        { code: 'ค 3.1 ป.2/1', text: 'ใช้ข้อมูลจากแผนภูมิรูปภาพเมื่อ 1 รูปแทน 2, 5 หรือ 10 หน่วย', lesson: 'p2pictograph', build: function () { return pictographQuestion(pickOne([2, 5, 10])); } },
    ],
    p5: [
        { code: 'ค 1.1 ป.5/1', text: 'เขียนเศษส่วนที่มีตัวส่วนเป็นตัวประกอบของ 10, 100 หรือ 1,000 ในรูปทศนิยม', lesson: 'p5fractiondecimal', build: function () {
            let denominator = pickOne(fractionDecimalDenominators), numerator = randomInt(1, denominator - 1);
            return numberQuestion(`${numerator}/${denominator} เขียนเป็นทศนิยมได้อย่างไร`, +(numerator / denominator).toFixed(3));
        } },
        { code: 'ค 1.1 ป.5/2', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาโดยใช้บัญญัติไตรยางศ์', lesson: 'p5proportion', build: function () {
            let question = pickOne(proportionBuilders)();
            return numberQuestion(question.text, question.expected);
        } },
        { code: 'ค 1.1 ป.5/3', text: 'หาผลบวก ผลลบของเศษส่วนและจำนวนคละ', lesson: 'p5fraction', also: ['p5mixednumber'], build: function () { return finalP5FractionSum(['+', '−']); } },
        { code: 'ค 1.1 ป.5/4', text: 'หาผลคูณ ผลหารของเศษส่วนและจำนวนคละ', lesson: 'p5fraction', also: ['p5mixednumber'], build: function () { return finalP5FractionSum(['×', '÷']); } },
        { code: 'ค 1.1 ป.5/5', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเศษส่วน 2 ขั้นตอน', lesson: 'p5wordproblem', build: function () { return finalWordProblem(wordProblemP5Builders.fraction); } },
        { code: 'ค 1.1 ป.5/6', text: 'หาผลคูณของทศนิยมที่ผลคูณเป็นทศนิยมไม่เกิน 3 ตำแหน่ง', lesson: 'p5decimal', build: function () { return finalDecimal('×', '×'); } },
        { code: 'ค 1.1 ป.5/7', text: 'หาผลหารที่ตัวตั้งเป็นจำนวนนับหรือทศนิยมไม่เกิน 3 ตำแหน่ง และตัวหารเป็นจำนวนนับ', lesson: 'p5decimal', build: function () { return finalDecimal('÷', '÷'); } },
        { code: 'ค 1.1 ป.5/8', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาทศนิยม 2 ขั้นตอน', lesson: 'p5wordproblem', build: function () { return finalWordProblem(wordProblemP5Builders.decimal); } },
        { code: 'ค 1.1 ป.5/9', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาร้อยละไม่เกิน 2 ขั้นตอน', lesson: 'p5wordproblem', also: ['p5percentage'], build: function () { return finalWordProblem(wordProblemP5Builders.percent); } },
        { code: 'ค 2.1 ป.5/1', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับความยาวที่มีการเปลี่ยนหน่วยและเขียนในรูปทศนิยม', lesson: 'p5measure', build: function () { return finalMeasure(measureBuilders.length); } },
        { code: 'ค 2.1 ป.5/2', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับน้ำหนักที่มีการเปลี่ยนหน่วยและเขียนในรูปทศนิยม', lesson: 'p5measure', build: function () { return finalMeasure(measureBuilders.weight); } },
        { code: 'ค 2.1 ป.5/3', text: 'แสดงวิธีหาคำตอบของโจทย์ปัญหาเกี่ยวกับปริมาตรและความจุของทรงสี่เหลี่ยมมุมฉาก', lesson: 'p5volume', build: finalVolume },
        { code: 'ค 2.1 ป.5/4', text: 'แสดงวิธีหาคำตอบเกี่ยวกับความยาวรอบรูปของรูปสี่เหลี่ยม และพื้นที่ของรูปสี่เหลี่ยมด้านขนานและขนมเปียกปูน', lesson: 'p5quadarea', build: finalQuadArea },
        { code: 'ค 2.2 ป.5/2', text: 'จำแนกรูปสี่เหลี่ยมโดยพิจารณาจากสมบัติของรูป', lesson: 'p5quadrilateral', build: finalQuadrilateral },
        { code: 'ค 2.2 ป.5/4', text: 'บอกลักษณะของปริซึม', lesson: 'p5prism', build: finalPrism },
        { code: 'ค 3.1 ป.5/1', text: 'ใช้ข้อมูลจากกราฟเส้นในการหาคำตอบของโจทย์ปัญหา', lesson: 'p5linegraph', build: finalLineGraph },
        { code: 'ค 3.1 ป.5/2', text: 'เขียนแผนภูมิแท่งจากข้อมูลที่เป็นจำนวนนับ', lesson: 'p5barwrite', build: finalBarWrite },
    ],
};
