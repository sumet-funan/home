// What each lesson teaches, keyed by its tab pane. A lesson is a list of topics
// (one worked example each, offered in a picker when there is more than one),
// and a topic is a list of steps: what to say, and what to show beside it.
// Every example uses the same kind of numbers the lesson's own questions do.

const LEARN_PLACE_HEAD = ['สิบ', 'หน่วย'];

// A written sum. `on` and `strike` count columns from the right, starting at 0;
// `carry` and `head` read left to right, like the digits they sit above.
function learnColumn(first, second, symbol, work) {
    work = work || {};
    let answer = work.answer || '';
    let carry = work.carry || [];
    let strike = work.strike || [];
    let columns = Math.max(first.length, second.length, answer.length, carry.length);

    function cells(values, rowClass, struck) {
        let html = '';
        for (let i = columns - 1; i >= 0; i--) {
            let value = values[values.length - 1 - i];
            let classes = 'lc-cell ' + rowClass;
            if (i === work.on) { classes += ' is-on'; }
            if (struck && strike.indexOf(i) !== -1) { classes += ' is-struck'; }
            if (value === '.') { classes += ' is-point'; }
            html += `<span class="${classes}">${value === undefined || value === '' ? '&nbsp;' : value}</span>`;
        }
        return html;
    }

    let head = work.head ? '<span class="lc-cell"></span>' + cells(work.head, 'lc-head') : '';

    return `<div class="learn-column" style="grid-template-columns: auto repeat(${columns}, auto);">`
        + head
        + '<span class="lc-cell"></span>' + cells(carry, 'lc-carry')
        + '<span class="lc-cell"></span>' + cells(first.split(''), '', true)
        + `<span class="lc-cell lc-symbol">${symbol}</span>` + cells(second.split(''), '')
        + '<span class="lc-cell lc-answer"></span>' + cells(answer.split(''), 'lc-answer')
        + '</div>';
}

function learnLines(lines) {
    return '<div class="learn-lines">' + lines.map(function (line) {
        return `<div>${line}</div>`;
    }).join('') + '</div>';
}

function learnFraction(numerator, denominator) {
    return `<span class="learn-frac"><span>${numerator}</span><span>${denominator}</span></span>`;
}

function learnMixed(whole, numerator, denominator) {
    return `<span class="learn-mixed">${whole}${learnFraction(numerator, denominator)}</span>`;
}

function learnDots(filled, empty) {
    let dots = '<span class="learn-dot is-filled"></span>'.repeat(filled) + '<span class="learn-dot"></span>'.repeat(empty);
    return `<div class="learn-dots">${dots}</div>`;
}

function learnSequence(terms, hop) {
    let items = terms.map(function (term, index) {
        let arrow = index === 0 ? '' : `<span class="learn-hop">${hop}</span>`;
        return `${arrow}<span class="learn-term">${term}</span>`;
    });
    return `<div class="learn-sequence">${items.join('')}</div>`;
}

function learnTensAndUnits(tens, units) {
    return `<div class="learn-blocks">
        <div class="learn-tens">${'<span></span>'.repeat(tens)}</div>
        <div class="learn-units">${'<span class="learn-dot is-filled"></span>'.repeat(units)}</div>
    </div>`;
}

function learnPlaceValue(tens, units, highlighted) {
    return `<div class="learn-places">
        <div class="${highlighted === 'tens' ? 'is-on' : ''}"><strong>${tens}</strong><span>หลักสิบ</span></div>
        <div class="${highlighted === 'units' ? 'is-on' : ''}"><strong>${units}</strong><span>หลักหน่วย</span></div>
    </div>`;
}

function learnCompareBars(rows) {
    let largest = Math.max.apply(null, rows.map(function (row) { return row.value; }));
    return '<div class="learn-bars">' + rows.map(function (row) {
        return `<div class="learn-bar-row">
            <span class="learn-bar-label">${row.label}</span>
            <span class="learn-bar-track"><span style="width: ${row.value / largest * 100}%;"></span></span>
            <span class="learn-bar-value">${row.value} ${row.unit}</span>
        </div>`;
    }).join('') + '</div>';
}

function learnBarChart(categories, values, picked) {
    let largest = Math.max.apply(null, values);
    let bars = categories.map(function (category, index) {
        return `<div class="bar-item${picked.indexOf(index) === -1 ? ' learn-bar-dim' : ''}">
            <span class="bar-value">${values[index]}</span>
            <div class="bar-fill" style="height: ${Math.round(values[index] / largest * 100)}%;"></div>
            <span class="bar-label">${category}</span>
        </div>`;
    });
    return `<div class="bar-chart learn-chart">${bars.join('')}</div>`;
}

function learnGrid(columns, rows) {
    return `<div class="learn-grid" style="grid-template-columns: repeat(${columns}, 1fr);">${'<span></span>'.repeat(columns * rows)}</div>`;
}

function learnRectangle(top, side) {
    return `<svg viewBox="0 0 220 130" width="220" height="130" role="img" aria-label="รูปสี่เหลี่ยม">
        <rect class="shape-fill" x="50" y="25" width="130" height="80" rx="4"/>
        <text class="learn-svg-text" x="115" y="17" text-anchor="middle">${top}</text>
        <text class="learn-svg-text" x="115" y="124" text-anchor="middle">${top}</text>
        <text class="learn-svg-text" x="44" y="70" text-anchor="end">${side}</text>
        <text class="learn-svg-text" x="186" y="70">${side}</text>
    </svg>`;
}

function learnTriangle(base, height) {
    return `<svg viewBox="0 0 220 140" width="220" height="140" role="img" aria-label="รูปสามเหลี่ยม">
        <polygon class="shape-fill" points="110,12 190,112 30,112"/>
        <line class="learn-svg-line" x1="110" y1="12" x2="110" y2="112"/>
        <text class="learn-svg-text" x="116" y="72">สูง ${height}</text>
        <text class="learn-svg-text" x="110" y="132" text-anchor="middle">ฐาน ${base}</text>
    </svg>`;
}

// `total` is 90 or 180; A sits against the base line and B fills the rest
function learnAngle(total, angleA) {
    function point(degrees, radius) {
        let rad = degrees * Math.PI / 180;
        return [(110 + radius * Math.cos(rad)).toFixed(1), (120 - radius * Math.sin(rad)).toFixed(1)];
    }

    let ray = point(angleA, 100);
    let end = point(total, 100);
    let labelA = point(angleA / 2, 44);
    let labelB = point(angleA + (total - angleA) / 2, 44);

    return `<svg viewBox="0 0 220 136" width="220" height="136" role="img" aria-label="มุม A และมุม B">
        <line class="learn-svg-line" x1="110" y1="120" x2="210" y2="120"/>
        <line class="learn-svg-line" x1="110" y1="120" x2="${end[0]}" y2="${end[1]}"/>
        <line class="learn-svg-line is-accent" x1="110" y1="120" x2="${ray[0]}" y2="${ray[1]}"/>
        <text class="learn-svg-text" x="${labelA[0]}" y="${labelA[1]}" text-anchor="middle">A</text>
        <text class="learn-svg-text" x="${labelB[0]}" y="${labelB[1]}" text-anchor="middle">B</text>
    </svg>`;
}

var learnLessons = {
    content_speedquiz: [{
        title: 'วิธีเล่นแบบฝึกคำนวณเร็ว',
        steps: [
            { say: 'เลือกเครื่องหมายที่อยากฝึก แล้วเลือกโหมด <strong>ทำให้ครบ</strong> หรือ <strong>จับเวลา 1 นาที</strong>' },
            { say: 'กดเริ่มทำโจทย์ เวลาจะเริ่มเดินทันที แล้วพิมพ์คำตอบทีละข้อ' },
            { say: 'กดปุ่ม Return บนแป้นพิมพ์เพื่อไปข้อถัดไป ข้อไหนคิดไม่ออกให้ข้ามไปก่อน แล้วค่อยกลับมาทำ' },
            { say: 'ทำเสร็จแล้วดูคำตอบอีกครั้ง แล้วกดส่งคำตอบ เมื่อส่งแล้วจะแก้ไม่ได้' },
        ],
    }],

    content_p1_plus: [{
        label: 'ไม่มีทด',
        title: 'ตัวอย่าง: 23 + 14',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก หลักหน่วยตรงกับหลักหน่วย หลักสิบตรงกับหลักสิบ', show: learnColumn('23', '14', '+', { head: LEARN_PLACE_HEAD }) },
            { say: 'เริ่มบวกที่หลักหน่วยก่อนเสมอ 3 + 4 = 7', show: learnColumn('23', '14', '+', { head: LEARN_PLACE_HEAD, on: 0, answer: '7' }) },
            { say: 'แล้วบวกหลักสิบ 2 + 1 = 3', show: learnColumn('23', '14', '+', { head: LEARN_PLACE_HEAD, on: 1, answer: '37' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>23 + 14 = 37</strong>']) },
        ],
    }, {
        label: 'มีทด',
        title: 'ตัวอย่าง: 47 + 25',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลักเหมือนเดิม', show: learnColumn('47', '25', '+', { head: LEARN_PLACE_HEAD }) },
            { say: 'บวกหลักหน่วย 7 + 5 = 12 ได้เกิน 9 จึงเขียน 2 แล้ว<strong>ทด 1</strong> ไปไว้หลักสิบ', show: learnColumn('47', '25', '+', { head: LEARN_PLACE_HEAD, on: 0, carry: ['1', ''], answer: '2' }) },
            { say: 'บวกหลักสิบ อย่าลืมรวมตัวทดด้วย 4 + 2 + 1 = 7', show: learnColumn('47', '25', '+', { head: LEARN_PLACE_HEAD, on: 1, carry: ['1', ''], answer: '72' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>47 + 25 = 72</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'แม่มีส้ม 12 ผล ซื้อเพิ่มอีก 5 ผล แม่มีส้มทั้งหมดกี่ผล',
        steps: [
            { say: 'หาว่าโจทย์บอกอะไร และถามอะไร', show: learnLines(['มีส้ม 12 ผล', 'ซื้อเพิ่ม 5 ผล', 'ถามว่าทั้งหมดกี่ผล']) },
            { say: 'คำว่า <strong>เพิ่ม</strong> และ <strong>ทั้งหมด</strong> บอกให้เราบวก', show: learnLines(['12 + 5']) },
            { say: 'บวกแล้วตอบพร้อมบอกหน่วย', show: learnLines(['12 + 5 = 17', '<strong>ตอบ 17 ผล</strong>']) },
        ],
    }],

    content_p1_minus: [{
        label: 'ไม่กระจาย',
        title: 'ตัวอย่าง: 58 − 23',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก เอาจำนวนที่มากกว่าไว้ข้างบน', show: learnColumn('58', '23', '−', { head: LEARN_PLACE_HEAD }) },
            { say: 'เริ่มลบที่หลักหน่วยก่อน 8 − 3 = 5', show: learnColumn('58', '23', '−', { head: LEARN_PLACE_HEAD, on: 0, answer: '5' }) },
            { say: 'แล้วลบหลักสิบ 5 − 2 = 3', show: learnColumn('58', '23', '−', { head: LEARN_PLACE_HEAD, on: 1, answer: '35' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>58 − 23 = 35</strong>']) },
        ],
    }, {
        label: 'มีกระจาย',
        title: 'ตัวอย่าง: 52 − 27',
        steps: [
            { say: 'ตั้งเลขให้ตรงหลัก แล้วดูหลักหน่วย 2 ลบ 7 ไม่พอ', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, on: 0 }) },
            { say: '<strong>ขอจากหลักสิบ 1 สิบ</strong> เลข 5 จึงเหลือ 4 และหลักหน่วยจาก 2 กลายเป็น 12', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, carry: ['4', '12'], strike: [0, 1] }) },
            { say: 'ลบหลักหน่วย 12 − 7 = 5', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, on: 0, carry: ['4', '12'], strike: [0, 1], answer: '5' }) },
            { say: 'ลบหลักสิบ 4 − 2 = 2', show: learnColumn('52', '27', '−', { head: LEARN_PLACE_HEAD, on: 1, carry: ['4', '12'], strike: [0, 1], answer: '25' }) },
            { say: 'ได้คำตอบแล้ว', show: learnLines(['<strong>52 − 27 = 25</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'พี่มีดินสอ 15 แท่ง ให้เพื่อนไป 4 แท่ง พี่เหลือดินสอกี่แท่ง',
        steps: [
            { say: 'หาว่าโจทย์บอกอะไร และถามอะไร', show: learnLines(['มีดินสอ 15 แท่ง', 'ให้เพื่อนไป 4 แท่ง', 'ถามว่าเหลือกี่แท่ง']) },
            { say: 'คำว่า <strong>ให้ไป</strong> และ <strong>เหลือ</strong> บอกให้เราลบ', show: learnLines(['15 − 4']) },
            { say: 'ลบแล้วตอบพร้อมบอกหน่วย', show: learnLines(['15 − 4 = 11', '<strong>ตอบ 11 แท่ง</strong>']) },
        ],
    }],

    content_p1_compare: [{
        label: 'หลักสิบต่างกัน',
        title: 'เปรียบเทียบ 47 กับ 52',
        steps: [
            { say: 'รู้จักเครื่องหมายก่อน ด้านที่อ้ากว้างจะหันไปหาจำนวนที่มากกว่าเสมอ', show: learnLines(['&gt; มากกว่า', '&lt; น้อยกว่า', '= เท่ากับ']) },
            { say: 'ดูหลักสิบก่อน 47 มี 4 สิบ ส่วน 52 มี 5 สิบ', show: learnTensAndUnits(4, 7) + learnTensAndUnits(5, 2) },
            { say: '4 สิบน้อยกว่า 5 สิบ ดังนั้น 47 น้อยกว่า 52', show: learnLines(['<strong>47 &lt; 52</strong>']) },
        ],
    }, {
        label: 'หลักสิบเท่ากัน',
        title: 'เปรียบเทียบ 36 กับ 31',
        steps: [
            { say: 'ดูหลักสิบก่อน ทั้งสองจำนวนมี 3 สิบเท่ากัน', show: learnLines(['<strong>3</strong>6 กับ <strong>3</strong>1']) },
            { say: 'หลักสิบเท่ากัน ให้ไปดูหลักหน่วย 6 มากกว่า 1', show: learnLines(['3<strong>6</strong> กับ 3<strong>1</strong>']) },
            { say: 'ดังนั้น 36 มากกว่า 31 ถ้าหลักหน่วยเท่ากันด้วย ให้เลือกเครื่องหมาย =', show: learnLines(['<strong>36 &gt; 31</strong>']) },
        ],
    }, {
        label: 'จำนวนหลักต่างกัน',
        title: 'เปรียบเทียบ 9 กับ 12',
        steps: [
            { say: 'นับว่าแต่ละจำนวนมีกี่หลัก 9 มี 1 หลัก ส่วน 12 มี 2 หลัก', show: learnLines(['9 → 1 หลัก', '12 → 2 หลัก']) },
            { say: 'จำนวนที่มีหลักมากกว่าจะมีค่ามากกว่าเสมอ', show: learnLines(['<strong>9 &lt; 12</strong>']) },
        ],
    }],

    content_p1_numberbond: [{
        title: 'ตัวอย่าง: 7 + ? = 10',
        steps: [
            { say: 'โจทย์อยากให้รวมกันได้ 10 ตอนนี้เรามีอยู่แล้ว 7', show: learnDots(7, 3) },
            { say: 'นับต่อจาก 7 ไปจนถึง 10 ได้ 8, 9, 10 นับไปทั้งหมด 3 ครั้ง', show: learnDots(10, 0) },
            { say: 'หรือใช้การลบก็ได้ เอาจำนวนรวมลบจำนวนที่มี', show: learnLines(['10 − 7 = 3']) },
            { say: 'ตรวจคำตอบด้วยการบวกกลับ ถ้าช่องว่างอยู่ข้างหน้า เช่น ? + 7 = 10 ก็ทำวิธีเดียวกัน', show: learnLines(['<strong>7 + 3 = 10</strong>']) },
        ],
    }],

    content_p1_pattern: [{
        label: 'เพิ่มขึ้น',
        title: 'ตัวอย่าง: 5, 10, 15, 20, ?',
        steps: [
            { say: 'ดูตัวเลข 2 ตัวแรก จาก 5 ไป 10 เพิ่มขึ้น 5', show: learnSequence([5, 10], '+5') },
            { say: 'ตรวจคู่ถัดไป ทุกคู่เพิ่มขึ้นทีละ 5 เหมือนกัน นี่คือแบบรูปของชุดนี้', show: learnSequence([5, 10, 15, 20], '+5') },
            { say: 'เอาตัวสุดท้ายบวกเพิ่มอีก 5 ก็ได้คำตอบ', show: learnLines(['20 + 5 = <strong>25</strong>']) },
        ],
    }, {
        label: 'ลดลง',
        title: 'ตัวอย่าง: 20, 18, 16, 14, ?',
        steps: [
            { say: 'ดูตัวเลข 2 ตัวแรก จาก 20 ไป 18 ลดลง 2', show: learnSequence([20, 18], '−2') },
            { say: 'ตรวจคู่ถัดไป ทุกคู่ลดลงทีละ 2 เหมือนกัน', show: learnSequence([20, 18, 16, 14], '−2') },
            { say: 'เอาตัวสุดท้ายลบออกอีก 2 ก็ได้คำตอบ', show: learnLines(['14 − 2 = <strong>12</strong>']) },
        ],
    }],

    content_p1_placevalue: [{
        title: 'ตัวอย่าง: 47',
        steps: [
            { say: 'เลขตัวขวาสุดคือ<strong>หลักหน่วย</strong> ของ 47 คือ 7', show: learnPlaceValue('4', '7', 'units') },
            { say: 'เลขตัวถัดไปทางซ้ายคือ<strong>หลักสิบ</strong> ของ 47 คือ 4', show: learnPlaceValue('4', '7', 'tens') },
            { say: 'แปลว่า 47 มี 4 สิบ กับอีก 7 หน่วย', show: learnTensAndUnits(4, 7) + learnLines(['40 + 7 = 47']) },
            { say: 'ถ้าหลักหน่วยเป็น 0 ก็ตอบ 0 ได้เลย เช่น 60 มีหลักสิบ 6 และหลักหน่วย 0', show: learnPlaceValue('6', '0', 'units') },
        ],
    }],

    content_p1_shape: [{
        title: 'รู้จักรูปเรขาคณิต 4 แบบ',
        steps: [
            { say: '<strong>วงกลม</strong> กลมทั้งรูป ไม่มีด้านตรงและไม่มีมุม', show: renderShapeSVG('circle') },
            { say: '<strong>สามเหลี่ยม</strong> มี 3 ด้าน และ 3 มุม', show: renderShapeSVG('triangle') },
            { say: '<strong>สี่เหลี่ยมจัตุรัส</strong> มี 4 ด้าน และทุกด้านยาวเท่ากัน', show: renderShapeSVG('square') },
            { say: '<strong>สี่เหลี่ยมผืนผ้า</strong> มี 4 ด้าน ด้านยาว 2 ด้าน และด้านสั้น 2 ด้าน', show: renderShapeSVG('rectangle') },
        ],
    }],

    content_p1_length: [{
        title: 'เปรียบเทียบ 45 ซม. กับ 62 ซม.',
        steps: [
            { say: 'ดูว่าหน่วยเหมือนกัน ทั้งสองเส้นวัดเป็นเซนติเมตร (ซม.) จึงเทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'เส้นแรก', value: 45, unit: 'ซม.' }, { label: 'เส้นที่สอง', value: 62, unit: 'ซม.' }]) },
            { say: 'เทียบหลักสิบก่อน 4 สิบน้อยกว่า 6 สิบ เส้นแรกจึงสั้นกว่า', show: learnLines(['<strong>45 ซม. &lt; 62 ซม.</strong>']) },
            { say: 'ถ้าตัวเลขเท่ากัน แสดงว่ายาวเท่ากัน ให้เลือกเครื่องหมาย =' },
        ],
    }],

    content_p1_weight: [{
        title: 'เปรียบเทียบ 13 กก. กับ 8 กก.',
        steps: [
            { say: 'ดูว่าหน่วยเหมือนกัน ทั้งสองถุงชั่งเป็นกิโลกรัม (กก.) จึงเทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'ถุงแรก', value: 13, unit: 'กก.' }, { label: 'ถุงที่สอง', value: 8, unit: 'กก.' }]) },
            { say: '13 มากกว่า 8 ถุงแรกจึงหนักกว่า', show: learnLines(['<strong>13 กก. &gt; 8 กก.</strong>']) },
            { say: 'ถ้าตัวเลขเท่ากัน แสดงว่าหนักเท่ากัน ให้เลือกเครื่องหมาย =' },
        ],
    }],

    content_p1_capacity: [{
        title: 'เปรียบเทียบ 7 ลิตร กับ 12 ลิตร',
        steps: [
            { say: 'ดูว่าหน่วยเหมือนกัน ทั้งสองขวดตวงเป็นลิตร จึงเทียบตัวเลขได้เลย', show: learnCompareBars([{ label: 'ขวดแรก', value: 7, unit: 'ลิตร' }, { label: 'ขวดที่สอง', value: 12, unit: 'ลิตร' }]) },
            { say: '7 น้อยกว่า 12 ขวดแรกจึงจุน้อยกว่า', show: learnLines(['<strong>7 ลิตร &lt; 12 ลิตร</strong>']) },
            { say: 'ถ้าตัวเลขเท่ากัน แสดงว่าจุเท่ากัน ให้เลือกเครื่องหมาย =' },
        ],
    }],

    content_p1_time: [{
        title: 'ดูนาฬิกาบอกเวลา',
        steps: [
            { say: 'หน้าปัดมี 12 ขีด ขีดบนสุดคือเลข 12 แล้วนับไปทางขวาเป็น 1, 2, 3 ไปเรื่อยๆ', show: renderClockSVG(12) },
            { say: 'ดูว่าเข็มชี้ที่ขีดไหน เข็มนี้ชี้ไปทางขวาตรงๆ นับจากบนสุดได้ 1, 2, 3', show: renderClockSVG(3) },
            { say: 'จึงเป็นเวลา <strong>3 นาฬิกา</strong>' },
            { say: 'จำจุดง่ายๆ ไว้ บนสุด 12 ขวา 3 ล่างสุด 6 ซ้าย 9 เข็มนี้ชี้ล่างสุด จึงเป็น 6 นาฬิกา', show: renderClockSVG(6) },
        ],
    }],

    content_p1_money: [{
        title: 'รวมเงินทั้งหมด',
        steps: [
            { say: 'ดูตัวเลขบนเหรียญและธนบัตรแต่ละอันว่ามีค่ากี่บาท', show: `<div class="money-items">${renderMoneyItems([20, 10, 5, 2])}</div>` },
            { say: 'เริ่มบวกจากค่ามากก่อน จะคิดง่ายกว่า', show: learnLines(['20 + 10 = 30']) },
            { say: 'เอาผลที่ได้บวกกับอันต่อไป', show: learnLines(['30 + 5 = 35']) },
            { say: 'บวกจนครบทุกอัน แล้วตอบเป็นบาท', show: learnLines(['35 + 2 = 37', '<strong>ตอบ 37 บาท</strong>']) },
        ],
    }],

    content_p1_wordproblem: [{
        label: 'โจทย์บวก',
        title: 'น้องเก็บดอกไม้ได้ 34 ดอก เพื่อนให้อีก 25 ดอก น้องมีดอกไม้ทั้งหมดกี่ดอก',
        steps: [
            { say: 'อ่านโจทย์แล้วหาตัวเลขและสิ่งที่ถาม', show: learnLines(['เก็บได้ 34 ดอก', 'เพื่อนให้อีก 25 ดอก', 'ถามว่าทั้งหมดกี่ดอก']) },
            { say: 'ของ<strong>เพิ่มขึ้น</strong> คำว่า อีก เพิ่ม ทั้งหมด รวม บอกให้บวก', show: learnLines(['34 + 25']) },
            { say: 'คำนวณแล้วตรวจว่าตอบตรงกับที่ถาม', show: learnLines(['34 + 25 = 59', '<strong>ตอบ 59 ดอก</strong>']) },
        ],
    }, {
        label: 'โจทย์ลบ',
        title: 'พ่อมีลูกโป่ง 48 ลูก ให้เพื่อนไป 13 ลูก พ่อเหลือลูกโป่งกี่ลูก',
        steps: [
            { say: 'อ่านโจทย์แล้วหาตัวเลขและสิ่งที่ถาม', show: learnLines(['มีลูกโป่ง 48 ลูก', 'ให้เพื่อนไป 13 ลูก', 'ถามว่าเหลือกี่ลูก']) },
            { say: 'ของ<strong>ลดลง</strong> คำว่า ให้ไป ใช้ไป เหลือ บอกให้ลบ', show: learnLines(['48 − 13']) },
            { say: 'คำนวณแล้วตรวจว่าตอบตรงกับที่ถาม', show: learnLines(['48 − 13 = 35', '<strong>ตอบ 35 ลูก</strong>']) },
        ],
    }],

    content_p5_decimal: [{
        label: '+',
        title: 'ตัวอย่าง: 12.5 + 3.8',
        steps: [
            { say: 'ตั้งเลขให้<strong>จุดทศนิยมตรงกัน</strong> เลขทุกหลักจะตรงกันเอง', show: learnColumn('12.5', ' 3.8', '+') },
            { say: 'บวกจากขวาสุด 5 + 8 = 13 เขียน 3 แล้วทด 1', show: learnColumn('12.5', ' 3.8', '+', { on: 0, carry: ['', '1', '', ''], answer: '.3' }) },
            { say: 'บวกหลักหน่วย 2 + 3 + 1 = 6 แล้วบวกหลักสิบ 1', show: learnColumn('12.5', ' 3.8', '+', { on: 2, carry: ['', '1', '', ''], answer: '16.3' }) },
            { say: 'ใส่จุดทศนิยมให้ตรงกับข้างบน', show: learnLines(['<strong>12.5 + 3.8 = 16.3</strong>']) },
        ],
    }, {
        label: '−',
        title: 'ตัวอย่าง: 15.4 − 3.7',
        steps: [
            { say: 'ตั้งเลขให้<strong>จุดทศนิยมตรงกัน</strong>', show: learnColumn('15.4', ' 3.7', '−') },
            { say: '4 ลบ 7 ไม่พอ ขอจากเลข 5 ทำให้ 5 เหลือ 4 และ 4 กลายเป็น 14', show: learnColumn('15.4', ' 3.7', '−', { on: 0, carry: ['', '4', '', '14'], strike: [0, 2] }) },
            { say: 'ลบจากขวาไปซ้าย 14 − 7 = 7 ต่อมา 4 − 3 = 1 และหลักสิบเหลือ 1', show: learnColumn('15.4', ' 3.7', '−', { carry: ['', '4', '', '14'], strike: [0, 2], answer: '11.7' }) },
            { say: 'ใส่จุดทศนิยมให้ตรงกับข้างบน', show: learnLines(['<strong>15.4 − 3.7 = 11.7</strong>']) },
        ],
    }, {
        label: '×',
        title: 'ตัวอย่าง: 4.6 × 3',
        steps: [
            { say: 'ลืมจุดทศนิยมไปก่อน แล้วคูณเหมือนจำนวนเต็ม', show: learnLines(['46 × 3 = 138']) },
            { say: 'นับว่าตัวตั้งมีทศนิยมกี่ตำแหน่ง 4.6 มี 1 ตำแหน่ง', show: learnLines(['4<strong>.6</strong> → 1 ตำแหน่ง']) },
            { say: 'ใส่จุดในคำตอบให้มีทศนิยมเท่ากัน นับจากขวามา 1 ตำแหน่ง', show: learnLines(['138 → 13.8', '<strong>4.6 × 3 = 13.8</strong>']) },
        ],
    }, {
        label: '÷',
        title: 'ตัวอย่าง: 12.6 ÷ 3',
        steps: [
            { say: 'ตัวหารเป็นจำนวนเต็ม จึงลืมจุดของตัวตั้งไปก่อน แล้วหารเหมือนจำนวนเต็ม', show: learnLines(['126 ÷ 3 = 42']) },
            { say: 'จุดในคำตอบอยู่ตรงกับจุดของตัวตั้ง 12.6 มีทศนิยม 1 ตำแหน่ง คำตอบจึงมี 1 ตำแหน่ง', show: learnLines(['42 → 4.2']) },
            { say: 'ตรวจคำตอบด้วยการคูณกลับ', show: learnLines(['4.2 × 3 = 12.6', '<strong>12.6 ÷ 3 = 4.2</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'มานีซื้อกระเป๋าราคา 45.5 บาท และซื้อเสื้อราคา 20.2 บาท มานีจ่ายเงินทั้งหมดกี่บาท',
        steps: [
            { say: 'หาตัวเลขและสิ่งที่ถาม', show: learnLines(['กระเป๋า 45.5 บาท', 'เสื้อ 20.2 บาท', 'ถามว่าจ่ายทั้งหมดกี่บาท']) },
            { say: 'คำว่า <strong>ทั้งหมด</strong> บอกให้บวก แล้วตั้งจุดให้ตรงกัน', show: learnColumn('45.5', '20.2', '+', { answer: '65.7' }) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 65.7 บาท</strong>']) },
        ],
    }],

    content_p5_percentage: [{
        label: 'คิดด้วยเศษส่วน',
        title: 'ตัวอย่าง: ร้อยละ 25 ของ 80',
        steps: [
            { say: 'ร้อยละ 25 แปลว่า 25 ส่วนใน 100 ส่วน', show: learnLines([`ร้อยละ 25 = ${learnFraction(25, 100)}`]) },
            { say: 'คำว่า <strong>ของ</strong> แปลว่าคูณ', show: learnLines([`${learnFraction(25, 100)} × 80`]) },
            { say: 'คูณก่อนแล้วค่อยหารด้วย 100', show: learnLines(['25 × 80 = 2000', '2000 ÷ 100 = 20', '<strong>ร้อยละ 25 ของ 80 = 20</strong>']) },
        ],
    }, {
        label: 'ทางลัด',
        title: 'จำทางลัดของร้อยละที่เจอบ่อย',
        steps: [
            { say: 'ร้อยละเหล่านี้หารได้เลย ไม่ต้องคูณ', show: learnLines(['ร้อยละ 50 → ÷ 2', 'ร้อยละ 25 → ÷ 4', 'ร้อยละ 20 → ÷ 5', 'ร้อยละ 10 → ÷ 10', 'ร้อยละ 5 → ÷ 20']) },
            { say: 'เช่น ร้อยละ 25 ของ 80 เอา 80 หารด้วย 4 ก็ได้คำตอบเลย', show: learnLines(['80 ÷ 4 = <strong>20</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'ในโรงเรียนมีนักเรียน 200 คน เป็นนักเรียนหญิงร้อยละ 20 มีนักเรียนหญิงกี่คน',
        steps: [
            { say: 'หาว่าร้อยละนี้เป็นของจำนวนอะไร', show: learnLines(['ร้อยละ 20 ของ 200 คน']) },
            { say: 'ใช้ทางลัด ร้อยละ 20 คือหารด้วย 5', show: learnLines(['200 ÷ 5 = 40']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 40 คน</strong>']) },
        ],
    }],

    content_p5_fraction: [{
        label: '+',
        title: `ตัวอย่าง: ${learnFraction(1, 4)} + ${learnFraction(2, 3)}`,
        steps: [
            { say: 'ตัวส่วนไม่เท่ากัน บวกทันทีไม่ได้ ต้องทำให้ตัวส่วนเท่ากันก่อน หา ค.ร.น. ของ 4 และ 3 ได้ 12', show: learnLines(['ส่วนร่วม = 12']) },
            { say: 'เปลี่ยนเศษส่วนให้มีตัวส่วนเป็น 12 คูณทั้งเศษและส่วนด้วยจำนวนเดียวกัน', show: learnLines([`${learnFraction(1, 4)} = ${learnFraction('1 × 3', '4 × 3')} = ${learnFraction(3, 12)}`, `${learnFraction(2, 3)} = ${learnFraction('2 × 4', '3 × 4')} = ${learnFraction(8, 12)}`]) },
            { say: 'บวกเฉพาะตัวเศษ ตัวส่วนคงเดิม', show: learnLines([`${learnFraction(3, 12)} + ${learnFraction(8, 12)} = <strong>${learnFraction(11, 12)}</strong>`]) },
        ],
    }, {
        label: '−',
        title: `ตัวอย่าง: ${learnFraction(3, 4)} − ${learnFraction(1, 6)}`,
        steps: [
            { say: 'ทำตัวส่วนให้เท่ากันก่อน ค.ร.น. ของ 4 และ 6 คือ 12', show: learnLines(['ส่วนร่วม = 12']) },
            { say: 'เปลี่ยนเศษส่วนให้มีตัวส่วนเป็น 12', show: learnLines([`${learnFraction(3, 4)} = ${learnFraction('3 × 3', '4 × 3')} = ${learnFraction(9, 12)}`, `${learnFraction(1, 6)} = ${learnFraction('1 × 2', '6 × 2')} = ${learnFraction(2, 12)}`]) },
            { say: 'ลบเฉพาะตัวเศษ ตัวส่วนคงเดิม', show: learnLines([`${learnFraction(9, 12)} − ${learnFraction(2, 12)} = <strong>${learnFraction(7, 12)}</strong>`]) },
        ],
    }, {
        label: '×',
        title: `ตัวอย่าง: ${learnFraction(2, 3)} × ${learnFraction(3, 4)}`,
        steps: [
            { say: 'การคูณไม่ต้องทำตัวส่วนให้เท่ากัน เอาเศษคูณเศษ และส่วนคูณส่วนได้เลย', show: learnLines([`${learnFraction('2 × 3', '3 × 4')} = ${learnFraction(6, 12)}`]) },
            { say: 'ทำให้เป็นเศษส่วนอย่างต่ำ หารทั้งเศษและส่วนด้วย 6', show: learnLines([`${learnFraction('6 ÷ 6', '12 ÷ 6')} = <strong>${learnFraction(1, 2)}</strong>`]) },
            { say: 'แอปนี้นับ 6/12 ว่าถูกเหมือนกัน แต่ควรฝึกทำให้เป็นอย่างต่ำไว้เสมอ' },
        ],
    }, {
        label: '÷',
        title: `ตัวอย่าง: ${learnFraction(3, 4)} ÷ ${learnFraction(2, 5)}`,
        steps: [
            { say: 'เปลี่ยนหารเป็นคูณ แล้ว<strong>กลับเศษเป็นส่วน</strong>ของตัวหลัง', show: learnLines([`${learnFraction(3, 4)} × ${learnFraction(5, 2)}`]) },
            { say: 'เอาเศษคูณเศษ และส่วนคูณส่วน', show: learnLines([`${learnFraction('3 × 5', '4 × 2')} = <strong>${learnFraction(15, 8)}</strong>`]) },
            { say: 'ตัวเศษมากกว่าตัวส่วนได้ เรียกว่าเศษเกิน ตอบแบบนี้ได้เลย' },
        ],
    }],

    content_p5_gcflcm: [{
        label: 'ห.ร.ม.',
        title: 'หา ห.ร.ม. ของ 12 และ 18',
        steps: [
            { say: '<strong>ห.ร.ม.</strong> คือตัวหารร่วมที่มากที่สุด เริ่มจากหาจำนวนที่หารแต่ละตัวได้ลงตัว', show: learnLines(['12 → 1, 2, 3, 4, 6, 12', '18 → 1, 2, 3, 6, 9, 18']) },
            { say: 'เลือกตัวที่อยู่ทั้งสองแถว นี่คือตัวหารร่วม', show: learnLines(['1, 2, 3, 6']) },
            { say: 'ตัวที่มากที่สุดคือคำตอบ', show: learnLines(['<strong>ห.ร.ม. = 6</strong>']) },
        ],
    }, {
        label: 'ค.ร.น.',
        title: 'หา ค.ร.น. ของ 4 และ 6',
        steps: [
            { say: '<strong>ค.ร.น.</strong> คือตัวคูณร่วมที่น้อยที่สุด เริ่มจากเขียนผลคูณของแต่ละจำนวน', show: learnLines(['4 → 4, 8, 12, 16, 20, 24', '6 → 6, 12, 18, 24, 30']) },
            { say: 'เลือกตัวที่อยู่ทั้งสองแถว นี่คือตัวคูณร่วม', show: learnLines(['12, 24']) },
            { say: 'ตัวที่น้อยที่สุดคือคำตอบ', show: learnLines(['<strong>ค.ร.น. = 12</strong>']) },
        ],
    }, {
        label: 'ตั้งหาร',
        title: 'หาทั้งสองค่าของ 12 และ 18 ด้วยการตั้งหาร',
        steps: [
            { say: 'หาจำนวนที่หารทั้งสองตัวลงตัว เช่น 2 แล้วเขียนผลหารไว้ข้างล่าง', show: learnLines(['2 ) 12, 18', '&nbsp;&nbsp;&nbsp;&nbsp;6, 9']) },
            { say: 'หารต่อไปจนไม่มีจำนวนไหนหารทั้งคู่ลงตัว นอกจาก 1', show: learnLines(['2 ) 12, 18', '3 ) 6, 9', '&nbsp;&nbsp;&nbsp;&nbsp;2, 3']) },
            { say: '<strong>ห.ร.ม.</strong> เอาตัวหารด้านซ้ายมาคูณกัน', show: learnLines(['2 × 3 = <strong>6</strong>']) },
            { say: '<strong>ค.ร.น.</strong> เอาตัวหารด้านซ้ายคูณกับเลขแถวล่างสุดทุกตัว', show: learnLines(['2 × 3 × 2 × 3 = <strong>36</strong>']) },
        ],
    }],

    content_p5_mixednumber: [{
        label: '+',
        title: `ตัวอย่าง: ${learnMixed(2, 1, 4)} + ${learnMixed(1, 1, 2)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน เอาจำนวนเต็มคูณตัวส่วน แล้วบวกตัวเศษ', show: learnLines([`${learnMixed(2, 1, 4)} = ${learnFraction('(2 × 4) + 1', 4)} = ${learnFraction(9, 4)}`, `${learnMixed(1, 1, 2)} = ${learnFraction('(1 × 2) + 1', 2)} = ${learnFraction(3, 2)}`]) },
            { say: 'ทำตัวส่วนให้เท่ากัน แล้วบวกตัวเศษ', show: learnLines([`${learnFraction(9, 4)} + ${learnFraction(6, 4)} = ${learnFraction(15, 4)}`]) },
            { say: 'เปลี่ยนกลับเป็นจำนวนคละ 15 ÷ 4 = 3 เศษ 3', show: learnLines([`<strong>${learnMixed(3, 3, 4)}</strong>`]) },
        ],
    }, {
        label: '−',
        title: `ตัวอย่าง: ${learnMixed(3, 1, 2)} − ${learnMixed(1, 1, 4)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน', show: learnLines([`${learnMixed(3, 1, 2)} = ${learnFraction(7, 2)}`, `${learnMixed(1, 1, 4)} = ${learnFraction(5, 4)}`]) },
            { say: 'ทำตัวส่วนให้เท่ากัน แล้วลบตัวเศษ', show: learnLines([`${learnFraction(14, 4)} − ${learnFraction(5, 4)} = ${learnFraction(9, 4)}`]) },
            { say: 'เปลี่ยนกลับเป็นจำนวนคละ 9 ÷ 4 = 2 เศษ 1 ถ้าคำตอบไม่ถึง 1 ให้ใส่ 0 ในช่องจำนวนเต็ม', show: learnLines([`<strong>${learnMixed(2, 1, 4)}</strong>`]) },
        ],
    }, {
        label: '×',
        title: `ตัวอย่าง: ${learnMixed(1, 1, 2)} × ${learnMixed(2, 1, 3)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน', show: learnLines([`${learnFraction(3, 2)} × ${learnFraction(7, 3)}`]) },
            { say: 'เอาเศษคูณเศษ และส่วนคูณส่วน', show: learnLines([`${learnFraction('3 × 7', '2 × 3')} = ${learnFraction(21, 6)}`]) },
            { say: 'เปลี่ยนกลับเป็นจำนวนคละ 21 ÷ 6 = 3 เศษ 3 และ 3/6 ทำให้เป็นอย่างต่ำได้ 1/2', show: learnLines([`<strong>${learnMixed(3, 1, 2)}</strong>`]) },
        ],
    }, {
        label: '÷',
        title: `ตัวอย่าง: ${learnMixed(2, 1, 2)} ÷ ${learnMixed(1, 1, 4)}`,
        steps: [
            { say: 'เปลี่ยนจำนวนคละเป็นเศษเกินก่อน', show: learnLines([`${learnFraction(5, 2)} ÷ ${learnFraction(5, 4)}`]) },
            { say: 'เปลี่ยนหารเป็นคูณ แล้วกลับเศษเป็นส่วนของตัวหลัง', show: learnLines([`${learnFraction(5, 2)} × ${learnFraction(4, 5)} = ${learnFraction(20, 10)}`]) },
            { say: '20 ÷ 10 = 2 พอดี ถ้าไม่มีเศษ ให้ใส่จำนวนเต็ม 2 ตัวเศษ 0 และตัวส่วน 1', show: learnLines(['<strong>2</strong>']) },
        ],
    }],

    content_p5_geometry: [{
        label: 'พื้นที่สี่เหลี่ยม',
        title: 'สี่เหลี่ยมผืนผ้า กว้าง 5 หน่วย ยาว 8 หน่วย',
        steps: [
            { say: 'พื้นที่คือจำนวนช่องตารางที่อยู่ข้างในรูป รูปนี้มี 5 แถว แถวละ 8 ช่อง', show: learnGrid(8, 5) },
            { say: 'ไม่ต้องนับทีละช่อง ใช้สูตรคูณได้เลย', show: learnLines(['พื้นที่ = กว้าง × ยาว', '5 × 8 = <strong>40 ตารางหน่วย</strong>']) },
            { say: 'ถ้าเป็นสี่เหลี่ยมจัตุรัส ทุกด้านยาวเท่ากัน เอาด้านคูณด้าน เช่น ด้านยาว 6 หน่วย', show: learnLines(['6 × 6 = <strong>36 ตารางหน่วย</strong>']) },
        ],
    }, {
        label: 'รอบรูป',
        title: 'สี่เหลี่ยมผืนผ้า กว้าง 5 หน่วย ยาว 8 หน่วย',
        steps: [
            { say: 'ความยาวรอบรูปคือระยะทางเดินรอบรูปจนครบ เอาทุกด้านมาบวกกัน', show: learnRectangle('ยาว 8', 'กว้าง 5') },
            { say: 'มีด้านกว้าง 2 ด้าน และด้านยาว 2 ด้าน จึงบวกกันแล้วคูณ 2', show: learnLines(['2 × (5 + 8)', '2 × 13 = <strong>26 หน่วย</strong>']) },
            { say: 'ถ้าเป็นสี่เหลี่ยมจัตุรัส มี 4 ด้านเท่ากัน เอาด้านคูณ 4 เช่น ด้านยาว 6 หน่วย', show: learnLines(['4 × 6 = <strong>24 หน่วย</strong>']) },
        ],
    }, {
        label: 'พื้นที่สามเหลี่ยม',
        title: 'สามเหลี่ยม ฐานยาว 10 หน่วย สูง 7 หน่วย',
        steps: [
            { say: 'หาฐานและความสูง ความสูงคือเส้นตรงจากยอดตั้งฉากลงมาที่ฐาน', show: learnTriangle(10, 7) },
            { say: 'สามเหลี่ยมมีพื้นที่ครึ่งหนึ่งของสี่เหลี่ยมที่ฐานและสูงเท่ากัน จึงคูณแล้วหารด้วย 2', show: learnLines(['พื้นที่ = ฐาน × สูง ÷ 2']) },
            { say: 'แทนค่าแล้วคำนวณ', show: learnLines(['10 × 7 = 70', '70 ÷ 2 = <strong>35 ตารางหน่วย</strong>']) },
        ],
    }],

    content_p5_volume: [{
        title: 'กล่องกว้าง 3 ยาว 4 สูง 2',
        steps: [
            { say: 'ปริมาตรคือจำนวนลูกบาศก์ที่จุอยู่ในกล่อง ใช้สูตรนี้', show: learnLines(['ปริมาตร = กว้าง × ยาว × สูง']) },
            { say: 'วางลูกบาศก์ชั้นล่างก่อน กว้าง 3 ยาว 4 ชั้นหนึ่งจึงมี 12 ลูก', show: learnGrid(4, 3) + learnLines(['3 × 4 = 12']) },
            { say: 'กล่องสูง 2 จึงมี 2 ชั้น เอาจำนวนต่อชั้นคูณจำนวนชั้น', show: learnLines(['12 × 2 = 24']) },
            { say: 'ตอบเป็นลูกบาศก์หน่วย', show: learnLines(['<strong>3 × 4 × 2 = 24 ลูกบาศก์หน่วย</strong>']) },
        ],
    }],

    content_p5_angle: [{
        label: 'มุมประกอบมุมฉาก',
        title: 'มุม A มีขนาด 35 องศา เป็นมุมประกอบมุมฉากกับมุม B',
        steps: [
            { say: '<strong>มุมฉาก</strong> มีขนาด 90 องศา มุม A กับมุม B จึงรวมกันได้ 90 องศา', show: learnAngle(90, 35) },
            { say: 'เอา 90 ลบด้วยมุมที่รู้แล้ว', show: learnLines(['มุม B = 90 − 35', '<strong>มุม B = 55 องศา</strong>']) },
            { say: 'ตรวจคำตอบด้วยการบวกกลับ', show: learnLines(['35 + 55 = 90']) },
        ],
    }, {
        label: 'มุมประกอบมุมตรง',
        title: 'มุม A มีขนาด 120 องศา เป็นมุมประกอบมุมตรงกับมุม B',
        steps: [
            { say: '<strong>มุมตรง</strong> มีขนาด 180 องศา มุม A กับมุม B จึงรวมกันได้ 180 องศา', show: learnAngle(180, 120) },
            { say: 'เอา 180 ลบด้วยมุมที่รู้แล้ว', show: learnLines(['มุม B = 180 − 120', '<strong>มุม B = 60 องศา</strong>']) },
            { say: 'ตรวจคำตอบด้วยการบวกกลับ', show: learnLines(['120 + 60 = 180']) },
        ],
    }],

    content_p5_average: [{
        label: 'ตัวเลข',
        title: 'หาค่าเฉลี่ยของ 12, 15, 18, 15',
        steps: [
            { say: 'ค่าเฉลี่ยคือการเกลี่ยทุกจำนวนให้เท่ากัน ใช้สูตรนี้', show: learnLines(['ค่าเฉลี่ย = ผลรวม ÷ จำนวนข้อมูล']) },
            { say: 'บวกทุกจำนวนเข้าด้วยกัน', show: learnLines(['12 + 15 + 18 + 15 = 60']) },
            { say: 'นับว่ามีข้อมูลกี่ตัว ชุดนี้มี 4 ตัว แล้วเอาผลรวมหารด้วย 4', show: learnLines(['60 ÷ 4 = <strong>15</strong>']) },
        ],
    }, {
        label: 'โจทย์ปัญหา',
        title: 'มานะสอบ 4 วิชา ได้คะแนน 20, 25, 30, 25 คะแนน เฉลี่ยวิชาละกี่คะแนน',
        steps: [
            { say: 'คำว่า <strong>เฉลี่ย</strong> บอกให้รวมแล้วหาร เริ่มจากรวมคะแนน', show: learnLines(['20 + 25 + 30 + 25 = 100']) },
            { say: 'โจทย์บอกว่ามี 4 วิชา จึงหารด้วย 4', show: learnLines(['100 ÷ 4 = 25']) },
            { say: 'ตอบพร้อมบอกหน่วย', show: learnLines(['<strong>ตอบ 25 คะแนน</strong>']) },
        ],
    }],

    content_p5_barchart: [{
        title: 'แผนภูมิแสดงจำนวนนักเรียนที่ชอบผลไม้แต่ละชนิด',
        steps: [
            { say: 'แต่ละแท่งคือผลไม้ 1 ชนิด ตัวเลขบนแท่งบอกจำนวนนักเรียน <strong>ส้มมี 15 คน</strong>', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [2]) },
            { say: 'ถ้าถามว่ามากที่สุด ให้หาแท่งที่สูงที่สุด กล้วยมี <strong>35 คน</strong>', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [1]) },
            { say: 'ถ้าถามว่าทั้งหมดกี่คน ให้บวกทุกแท่ง', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [0, 1, 2, 3]) + learnLines(['20 + 35 + 15 + 30 = <strong>100 คน</strong>']) },
            { say: 'ถ้าถามผลต่าง ให้เอาแท่งมากที่สุดลบแท่งน้อยที่สุด', show: learnBarChart(['แอปเปิ้ล', 'กล้วย', 'ส้ม', 'มะม่วง'], [20, 35, 15, 30], [1, 2]) + learnLines(['35 − 15 = <strong>20 คน</strong>']) },
        ],
    }],

    content_p5_wordproblem: [{
        label: 'เงินทอน',
        title: 'มานีมีเงิน 100.0 บาท ซื้อกระเป๋าราคา 45.5 บาท มานีจะเหลือเงินกี่บาท',
        steps: [
            { say: 'อ่านโจทย์แล้วหาตัวเลขและสิ่งที่ถาม', show: learnLines(['มีเงิน 100.0 บาท', 'จ่ายไป 45.5 บาท', 'ถามว่าเหลือกี่บาท']) },
            { say: 'คำว่า <strong>เหลือ</strong> บอกให้ลบ ตั้งจุดทศนิยมให้ตรงกัน', show: learnLines(['100.0 − 45.5']) },
            { say: 'คำนวณแล้วตอบพร้อมบอกหน่วย', show: learnLines(['100.0 − 45.5 = 54.5', '<strong>ตอบ 54.5 บาท</strong>']) },
        ],
    }, {
        label: 'ส่วนลด',
        title: 'เสื้อราคา 200 บาท ลดราคาร้อยละ 25 ราคาหลังลดเหลือกี่บาท',
        steps: [
            { say: 'โจทย์นี้มี 2 ขั้น หาส่วนลดก่อน ร้อยละ 25 คือหารด้วย 4', show: learnLines(['200 ÷ 4 = 50 บาท']) },
            { say: 'โจทย์ถามราคาหลังลด จึงเอาราคาเต็มลบส่วนลด', show: learnLines(['200 − 50 = 150']) },
            { say: 'ระวังอย่าตอบแค่ส่วนลด อ่านคำถามอีกครั้งก่อนตอบ', show: learnLines(['<strong>ตอบ 150 บาท</strong>']) },
        ],
    }, {
        label: 'พื้นที่',
        title: 'สวนรูปสี่เหลี่ยมผืนผ้ากว้าง 6 เมตร ยาว 9 เมตร มีพื้นที่กี่ตารางเมตร',
        steps: [
            { say: 'โจทย์ถาม<strong>พื้นที่</strong> ของรูปสี่เหลี่ยมผืนผ้า จึงใช้สูตรกว้างคูณยาว', show: learnLines(['พื้นที่ = กว้าง × ยาว']) },
            { say: 'แทนค่าจากโจทย์แล้วคำนวณ', show: learnLines(['6 × 9 = 54']) },
            { say: 'พื้นที่ตอบเป็นตารางเมตร', show: learnLines(['<strong>ตอบ 54 ตารางเมตร</strong>']) },
        ],
    }],
};
