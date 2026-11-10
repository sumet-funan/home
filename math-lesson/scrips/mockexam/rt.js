// RT ป.1, the reading test, laid out as the 2568 papers are: reading for
// meaning in three parts, 50 points in 45 minutes (ตอนที่ 1 words, 10 items;
// ตอนที่ 2 telling a picture in a sentence, 5 items, then sentences, 10 items;
// ตอนที่ 3 short passages, 5 items), and reading aloud (20 words, then a passage
// marked in ten parts, 50 points). Questions have three choices, as the test's
// do. Every item is written here from word lists; none is from a real paper.
//
// Two parts cannot be marked by a page the way the test marks them. Reading
// aloud is heard by a grown-up, who taps each word or part the child read
// right, as the examiner does. The sentence from a picture is written in the
// test; here the child puts word cards in order, so a ป.1 child need not type,
// and it is marked to the test's rule: 2 for the whole sentence, 1 for one that
// gets the picture across only in part. mockexam/index.js runs the paper like
// the others.

// Things a ป.1 child reads, each with a picture that needs no download.
const RT_PICTURES = [
    ['ช้าง', '🐘'], ['ม้า', '🐴'], ['ปลา', '🐟'], ['ไก่', '🐔'], ['เป็ด', '🦆'], ['หมู', '🐷'],
    ['วัว', '🐮'], ['แมว', '🐱'], ['หมา', '🐶'], ['นก', '🐦'], ['ปู', '🦀'], ['กุ้ง', '🦐'],
    ['งู', '🐍'], ['ลิง', '🐒'], ['เสือ', '🐯'], ['หมี', '🐻'], ['กบ', '🐸'], ['เต่า', '🐢'],
    ['ผึ้ง', '🐝'], ['ผีเสื้อ', '🦋'], ['มด', '🐜'], ['กระต่าย', '🐰'], ['ไข่', '🥚'], ['นม', '🥛'],
    ['ข้าว', '🍚'], ['กล้วย', '🍌'], ['ส้ม', '🍊'], ['แตงโม', '🍉'], ['มะม่วง', '🥭'], ['องุ่น', '🍇'],
    ['ข้าวโพด', '🌽'], ['บ้าน', '🏠'], ['รถ', '🚗'], ['เรือ', '⛵'], ['รถไฟ', '🚆'], ['เครื่องบิน', '✈️'],
    ['จักรยาน', '🚲'], ['ร่ม', '☂️'], ['หนังสือ', '📖'], ['ดินสอ', '✏️'], ['กระเป๋า', '🎒'], ['นาฬิกา', '⏰'],
    ['ประตู', '🚪'], ['เตียง', '🛏️'], ['เก้าอี้', '🪑'], ['ดอกไม้', '🌸'], ['ต้นไม้', '🌳'], ['ดาว', '⭐'],
    ['ดวงจันทร์', '🌙'], ['ภูเขา', '⛰️'], ['ไฟ', '🔥'], ['ลูกบอล', '⚽'], ['หมวก', '👒'], ['รองเท้า', '👟'],
    ['เสื้อ', '👕'], ['มือ', '✋'], ['ฟัน', '🦷'], ['หู', '👂'],
    // and things done, and longer words, as the test asks for too
    ['ปลาวาฬ', '🐳'], ['ยีราฟ', '🦒'], ['เพนกวิน', '🐧'], ['ม้าลาย', '🦓'], ['ว่ายน้ำ', '🏊'], ['นอนหลับ', '😴'],
    ['เค้ก', '🎂'], ['ลูกโป่ง', '🎈'], ['รุ้งกินน้ำ', '🌈'], ['ไอศกรีม', '🍦'], ['ช้อน', '🥄'], ['จรวด', '🚀'],
    ['หุ่นยนต์', '🤖'], ['เต็นท์', '⛺'], ['ตำรวจ', '👮'], ['ไข่ดาว', '🍳'], ['ขี่จักรยาน', '🚴'], ['ปลูกต้นไม้', '🌱'],
];

// More everyday words, for reading aloud.
const RT_WORDS = ['ไป', 'มา', 'กิน', 'นอน', 'ดู', 'ฟัง', 'อ่าน', 'เขียน', 'เล่น', 'วิ่ง', 'เดิน', 'ยิ้ม',
    'ดี', 'สวย', 'ใหญ่', 'เล็ก', 'ร้อน', 'หนาว', 'แม่', 'พ่อ', 'ครู', 'เพื่อน', 'โรงเรียน', 'ห้องเรียน',
    'ตลาด', 'ทะเล', 'น้ำ', 'ฟ้า', 'ขาว', 'เขียว', 'ช่วย', 'ขอบคุณ', 'สนาม', 'ดีใจ'];

const RT_NAMES = ['มะลิ', 'ภูผา', 'ใบบัว', 'นที', 'แก้วตา', 'ต้นข้าว'];
const RT_COLOURS = ['ขาว', 'ดำ', 'แดง', 'เหลือง', 'เขียว', 'ฟ้า'];
const RT_COUNTS = ['สอง', 'สาม', 'สี่', 'ห้า', 'หก'];

// The pictures in ตอนที่ 1 are lettered like the test's: twelve of them, two
// more than there are words, so the last answer is not left to guess.
const RT_BANK_LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ', 'ญ', 'ฎ', 'ฏ'];
const RT_CHOICE_LABELS = ['๑', '๒', '๓'];

// The Thai curriculum's reading and writing indicators the parts test.
const RT_INDICATORS = {
    'ท 1.1 ป.1/1': 'อ่านออกเสียงคำ คำคล้องจอง และข้อความสั้น ๆ',
    'ท 1.1 ป.1/2': 'บอกความหมายของคำ และข้อความที่อ่าน',
    'ท 1.1 ป.1/3': 'ตอบคำถามเกี่ยวกับเรื่องที่อ่าน',
    'ท 1.1 ป.1/5': 'คาดคะเนเหตุการณ์จากเรื่องที่อ่าน',
    'ท 1.1 ป.1/7': 'บอกความหมายของเครื่องหมาย หรือสัญลักษณ์สำคัญที่มักพบเห็นในชีวิตประจำวัน',
    'ท 2.1 ป.1/2': 'เขียนสื่อสารด้วยคำและประโยคง่าย ๆ',
};

const RT_ORDER_POINTS = 2;
const RT_ALOUD_WORD_POINTS = 1;
const RT_ALOUD_SENTENCE_POINTS = 3;     // the passage is marked in ten parts, 30 points

function rtPicture(emoji) {
    return `<span class="rt-emoji" aria-hidden="true">${emoji}</span>`;
}

function rtWord(word) {
    return `<span class="rt-word">${escapeLessonText(word)}</span>`;
}

// A question with three choices numbered ๑ ๒ ๓, as the test's are.
function rtChoice(text, figure, right, wrong, show) {
    let options = shuffleList([right].concat(wrong));
    return {
        text: text,
        figure: figure,
        options: options.map(function (option) { return option[0]; }),
        html: options.map(show),
        labels: RT_CHOICE_LABELS,
        correct: options.indexOf(right),
    };
}

function rtWords(text, figure, right, wrong) {
    return rtChoice(text, figure, [right], wrong.map(function (word) { return [word]; }), function (option) { return rtWord(option[0]); });
}

function rtOthers(list, right, count) {
    return shuffleList(list.filter(function (item) { return item !== right; })).slice(0, count);
}

// ตอนที่ 1: ten words to match to a sheet of twelve lettered pictures, the
// same sheet for every word.
function rtWordBank() {
    let bank = shuffleList(RT_PICTURES).slice(0, 12);
    return shuffleList(bank.slice()).slice(0, 10).map(function (pair) {
        return {
            text: 'คำนี้ตรงกับภาพใด',
            figure: rtWord(pair[0]),
            options: bank.map(function (each) { return each[0]; }),
            html: bank.map(function (each) { return rtPicture(each[1]); }),
            labels: RT_BANK_LETTERS,
            compact: true,
            correct: bank.indexOf(pair),
        };
    });
}

// ตอนที่ 2, first half: what the picture shows, as cards to put in order.
const RT_SCENES = [
    ['🐱 🐟', ['แมว', 'กิน', 'ปลา']],
    ['🐦 ☁️', ['นก', 'บิน', 'บน', 'ฟ้า']],
    ['🧒 📖', ['น้อง', 'อ่าน', 'หนังสือ']],
    ['🐶 🦴', ['หมา', 'กิน', 'กระดูก']],
    ['🐸 💧', ['กบ', 'กระโดด', 'ลง', 'น้ำ']],
    ['👧 🚲', ['พี่', 'ขี่', 'จักรยาน']],
    ['🐟 🌊', ['ปลา', 'ว่าย', 'ใน', 'ทะเล']],
    ['🐔 🥚', ['แม่ไก่', 'ออก', 'ไข่']],
    ['🐒 🍌', ['ลิง', 'กิน', 'กล้วย']],
    ['🧒 ⚽', ['น้อง', 'เตะ', 'ลูกบอล']],
    ['🐢', ['เต่า', 'เดิน', 'ช้า']],
    ['🐝 🌸', ['ผึ้ง', 'ตอม', 'ดอกไม้']],
    ['🐮 🌿', ['วัว', 'กิน', 'หญ้า']],
    ['🧒 ☂️', ['ฉัน', 'กาง', 'ร่ม']],
];

function rtOrderItem(scene) {
    let words = scene[1];
    let cards = shuffleList(words.map(function (word, position) { return position; }));

    // never hand the cards over already in order
    if (cards.every(function (card, position) { return card === position; })) {
        cards.push(cards.shift());
    }
    return {
        text: 'ดูภาพ แล้วแตะบัตรคำเรียงเป็นประโยค',
        figure: rtPicture(scene[0]),
        cards: cards.map(function (position) { return words[position]; }),
        // the card positions in the order that makes the sentence
        correct: words.map(function (word, position) { return cards.indexOf(position); }),
    };
}

// ตอนที่ 2, second half: a sentence and a question on it. Some ask what it
// says; some ask what it shows about the child in it, as the test does; and
// some are signs to read.
function rtSentenceItem(kind) {
    let name = pickOne(RT_NAMES);
    let sentence = function (text) { return `<div class="rt-sentence">${escapeLessonText(text)}</div>`; };

    if (kind === 'eat') {
        let pair = pickOne([['ลิง', 'กล้วย'], ['แมว', 'ปลา'], ['กระต่าย', 'แครอท'], ['วัว', 'หญ้า'], ['หมา', 'กระดูก'], ['ไก่', 'ข้าวโพด']]);
        return rtWords(`${pair[0]}ชอบกินอะไร`, sentence(`${pair[0]}ชอบกิน${pair[1]}`), pair[1], rtOthers(['กล้วย', 'ปลา', 'แครอท', 'หญ้า', 'กระดูก', 'ข้าวโพด'], pair[1], 2));
    }
    if (kind === 'ride') {
        let ways = ['จักรยาน', 'รถไฟ', 'เรือ', 'รถเมล์'], way = pickOne(ways);
        return rtWords(`${name}ไปโรงเรียนด้วยอะไร`, sentence(`${name}ไปโรงเรียนด้วย${way}`), way, rtOthers(ways, way, 2));
    }
    if (kind === 'colour') {
        let pet = pickOne(['แมว', 'หมา', 'กระต่าย', 'นก']), colour = pickOne(RT_COLOURS);
        return rtWords(`${pet}ของ${name}สีอะไร`, sentence(`${name}มี${pet}สี${colour}`), 'สี' + colour, rtOthers(RT_COLOURS, colour, 2).map(function (other) { return 'สี' + other; }));
    }
    if (kind === 'count') {
        let fruit = pickOne(['ส้ม', 'แตงโม', 'มะม่วง']), count = pickOne(RT_COUNTS);
        return rtWords(`แม่ซื้อ${fruit}มากี่ลูก`, sentence(`แม่ซื้อ${fruit}มา${count}ลูก`), count + 'ลูก', rtOthers(RT_COUNTS, count, 2).map(function (other) { return other + 'ลูก'; }));
    }
    if (kind === 'who') {
        let friends = shuffleList(RT_NAMES);
        return rtWords('ใครเป็นคนให้ดินสอ', sentence(`${friends[0]}ให้ดินสอแก่${friends[1]}`), friends[0], [friends[1], friends[2]]);
    }
    if (kind === 'value') {
        // [what the child does, the question, what it shows, two that it does not]
        let value = pickOne([
            ['ทำการบ้านเสร็จก่อนไปเล่นทุกวัน', 'เป็นเด็กอย่างไร', 'มีความรับผิดชอบ', ['ประหยัด', 'ซื่อสัตย์']],
            ['เก็บกระเป๋าเงินได้ แล้วนำไปคืนครู', 'เป็นเด็กอย่างไร', 'ซื่อสัตย์', ['ประหยัด', 'ตรงต่อเวลา']],
            ['แบ่งขนมให้เพื่อนที่ไม่ได้นำขนมมา', 'เป็นเด็กอย่างไร', 'มีน้ำใจ', ['ตรงต่อเวลา', 'ประหยัด']],
            ['หยอดเงินค่าขนมที่เหลือลงกระปุกออมสินทุกวัน', 'เป็นเด็กอย่างไร', 'ประหยัด', ['มีน้ำใจ', 'ตรงต่อเวลา']],
            ['ไปถึงโรงเรียนก่อนเข้าแถวทุกวัน', 'เป็นเด็กอย่างไร', 'ตรงต่อเวลา', ['ประหยัด', 'ซื่อสัตย์']],
            ['นอนดึกจนตื่นสาย ไปโรงเรียนไม่ทันเข้าแถว', 'ควรฝึกเรื่องใด', 'ความตรงต่อเวลา', ['ความประหยัด', 'ความมีน้ำใจ']],
            ['เล่นของเล่นแล้วไม่เก็บเข้าที่ แม่ต้องเก็บให้ทุกวัน', 'ควรฝึกเรื่องใด', 'ความรับผิดชอบ', ['ความประหยัด', 'ความซื่อสัตย์']],
        ]);
        let item = rtWords(name + value[1], sentence(name + value[0]), value[2], value[3]);
        item.code = 'ท 1.1 ป.1/2';
        return item;
    }
    if (kind === 'sign') {
        let signs = [
            ['🚭', 'ไม่สูบบุหรี่ที่นี่'], ['🚯', 'ไม่ทิ้งขยะที่นี่'], ['🚳', 'ไม่ขี่จักรยานที่นี่'],
            ['📵', 'ไม่ใช้โทรศัพท์ที่นี่'], ['🔇', 'ไม่ส่งเสียงดังที่นี่'], ['🚷', 'ไม่เดินผ่านทางนี้'], ['🚱', 'ไม่ดื่มน้ำนี้'],
        ];
        let sign = pickOne(signs);
        let item = rtWords('เมื่อเห็นป้ายนี้ ควรทำอย่างไร', `<span class="rt-sign">${rtPicture(sign[0])}</span>`, sign[1],
            rtOthers(signs, sign, 2).map(function (other) { return other[1]; }));
        item.code = 'ท 1.1 ป.1/7';
        return item;
    }

    // which sentence the picture shows: the right one beside ones with the
    // animal or the place changed
    let animals = [['แมว', '🐱'], ['หมา', '🐶'], ['กระต่าย', '🐰'], ['ลิง', '🐒'], ['เป็ด', '🦆']];
    let places = [['เตียง', '🛏️'], ['เก้าอี้', '🪑'], ['ต้นไม้', '🌳']];
    let animal = pickOne(animals), place = pickOne(places);
    let otherAnimal = pickOne(animals.filter(function (a) { return a !== animal; }));
    let otherPlace = pickOne(places.filter(function (p) { return p !== place; }));
    let says = function (a, p) { return `${a[0]}อยู่บน${p[0]}`; };

    return rtWords('ข้อใดตรงกับภาพ', rtPicture(animal[1] + ' ' + place[1]), says(animal, place), [says(otherAnimal, place), says(animal, otherPlace)]);
}

// Ten sentence items: what sentences say, what they show about a child, signs.
const RT_SENTENCE_MIX = ['value', 'value', 'sign', 'sign'];
const RT_SENTENCE_KINDS = ['eat', 'ride', 'colour', 'count', 'who', 'picture'];

// ตอนที่ 3: short passages, each with a picture and its own question; most ask
// what will happen next, some why. [picture, passage, question, answer, two
// wrong, indicator]
function rtPassages() {
    let name = pickOne(RT_NAMES);
    return [
        ['🥛', `${name}เทน้ำใส่แก้วจนเต็มแล้ว แต่ยังเทต่อไปอีก`, 'จะเกิดอะไรขึ้นต่อไป', 'น้ำล้นแก้ว', ['แก้วแตก', 'น้ำหายไป'], 'ท 1.1 ป.1/5'],
        ['🌧️ 👕', `ฝนตกหนัก ${name}ลืมเก็บเสื้อที่ตากไว้หน้าบ้าน`, 'จะเกิดอะไรขึ้นกับเสื้อ', 'เสื้อเปียก', ['เสื้อแห้ง', 'เสื้อขาด'], 'ท 1.1 ป.1/5'],
        ['💧 🏃', `${name}วิ่งเล่นบนพื้นที่เปียกน้ำโดยไม่ระวัง`, 'จะเกิดอะไรขึ้นกับ' + name, 'อาจลื่นหกล้ม', ['ได้รางวัล', 'ตัวแห้ง'], 'ท 1.1 ป.1/5'],
        ['🦷 🍬', `${name}ชอบกินขนมหวาน แต่ไม่แปรงฟันก่อนนอน`, 'จะเกิดอะไรขึ้นกับ' + name, 'ฟันผุ', ['ตัวสูงขึ้น', 'ผมยาวขึ้น'], 'ท 1.1 ป.1/5'],
        ['🌱 💧', `${name}ปลูกต้นไม้ไว้ข้างบ้าน และรดน้ำให้ทุกวัน`, 'ต้นไม้จะเป็นอย่างไร', 'ต้นไม้เติบโตงอกงาม', ['ต้นไม้เหี่ยวตาย', 'ต้นไม้หายไป'], 'ท 1.1 ป.1/5'],
        ['🐜 🍪', `${name}ลืมปิดกล่องขนมไว้บนโต๊ะ มีมดเดินมาเป็นแถว`, 'จะเกิดอะไรขึ้นต่อไป', 'มดมากินขนม', ['ขนมมากขึ้น', 'มดหนีไป'], 'ท 1.1 ป.1/5'],
        ['📖 ✏️', `${name}ตั้งใจอ่านหนังสือทบทวนทุกวันก่อนสอบ`, 'จะเกิดอะไรขึ้นกับ' + name, 'สอบได้คะแนนดี', ['สอบไม่ผ่าน', 'ลืมไปสอบ'], 'ท 1.1 ป.1/5'],
        ['🎈 😢', `${name}ปล่อยเชือกลูกโป่งหลุดมือ ลูกโป่งลอยขึ้นไปบนฟ้า ${name}จึงร้องไห้`, name + 'ร้องไห้เพราะอะไร', 'ลูกโป่งลอยหายไป', ['หกล้ม', 'หิวข้าว'], 'ท 1.1 ป.1/3'],
        ['🐶 🌧️', `ฝนตกหนัก ${name}เห็นลูกหมาตัวสั่นอยู่หน้าบ้าน จึงนำผ้ามาเช็ดตัวให้`, name + 'นำผ้ามาทำอะไร', 'เช็ดตัวให้ลูกหมา', ['ห่มให้ตัวเอง', 'เช็ดโต๊ะ'], 'ท 1.1 ป.1/3'],
    ];
}

// Reading aloud, the second part: a passage of ten short sentences, each one of
// the ten parts the examiner marks.
function rtAloudStory() {
    let name = pickOne(RT_NAMES);
    let stories = [
        [`${name}ตื่นนอนแต่เช้า`, `${name}ล้างหน้าและแปรงฟัน`, 'แม่ทำไข่เจียวให้กิน', `${name}กินข้าวจนหมดจาน`,
            `พ่อขี่รถพา${name}ไปโรงเรียน`, 'ที่โรงเรียนมีเพื่อนมากมาย', `${name}เล่นกับเพื่อนที่สนาม`,
            'คุณครูสอนให้อ่านหนังสือ', `ตอนเย็น${name}กลับบ้านกับพ่อ`, `วันนี้${name}มีความสุขมาก`],
        [`วันหยุด${name}ไปทะเลกับพ่อแม่`, 'ทะเลมีน้ำสีฟ้าสวยงาม', `${name}เล่นทรายที่ชายหาด`, 'พ่อช่วยก่อปราสาททราย',
            'แม่นั่งอยู่ใต้ร่มใหญ่', `${name}เห็นปูเดินอยู่ริมน้ำ`, 'ปูตัวเล็กเดินไปข้าง ๆ', `${name}หัวเราะชอบใจ`,
            'ตอนเย็นทุกคนกินข้าวด้วยกัน', `${name}อยากมาทะเลอีก`],
        [`ยายของ${name}มีสวนผัก`, 'ในสวนมีผักหลายอย่าง', `${name}ไปช่วยยายรดน้ำผัก`, 'ยายเก็บผักใส่ตะกร้า',
            'มีผีเสื้อบินอยู่ในสวน', `${name}วิ่งตามผีเสื้อ`, 'ยายบอกให้ระวังหกล้ม', `${name}ช่วยยายถือตะกร้า`,
            'ยายทำแกงจืดให้กิน', `${name}รักยายมาก`],
    ];
    return pickOne(stories);
}

// Thai speech for a grown-up checking a word, where the device has it.
function rtCanSpeak() {
    return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function';
}

function rtSpeak(text) {
    if (!rtCanSpeak()) {
        return;
    }
    let utterance = new SpeechSynthesisUtterance(text);
    let voice = window.speechSynthesis.getVoices().find(function (v) { return /^th/i.test(v.lang); });

    utterance.lang = 'th-TH';
    utterance.rate = 0.8;
    if (voice) {
        utterance.voice = voice;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// The whole paper, in the order of the parts in MOCK_EXAMS.rt1.
function buildReadingTest() {
    let items = [];
    let add = function (part, kind, points, code, item) {
        items.push(Object.assign({ code: code }, item, { part: part, kind: kind, points: points }));
    };

    rtWordBank().forEach(function (item) {
        add(0, 'choice', 1, 'ท 1.1 ป.1/2', item);
    });
    shuffleList(RT_SCENES).slice(0, 5).forEach(function (scene) {
        add(1, 'order', RT_ORDER_POINTS, 'ท 2.1 ป.1/2', rtOrderItem(scene));
    });
    let kinds = shuffleList(RT_SENTENCE_MIX.concat(shuffleList(RT_SENTENCE_KINDS).slice(0, 10 - RT_SENTENCE_MIX.length)));
    kinds.forEach(function (kind) {
        add(2, 'choice', 2, 'ท 1.1 ป.1/2', rtSentenceItem(kind));
    });
    shuffleList(rtPassages()).slice(0, 5).forEach(function (passage) {
        let figure = `${rtPicture(passage[0])}<div class="rt-passage">${escapeLessonText(passage[1])}</div>`;
        add(3, 'choice', 2, passage[5], rtWords(passage[2], figure, passage[3], passage[4]));
    });

    let words = shuffleList(RT_PICTURES.map(function (pair) { return pair[0]; }).concat(RT_WORDS)).slice(0, 20);
    add(4, 'aloud', 20, 'ท 1.1 ป.1/1', {
        text: 'ให้นักเรียนอ่านออกเสียงทีละคำ อ่านทั้งคำโดยไม่สะกด ผู้ปกครองหรือครูแตะคำที่อ่านถูก แตะอีกครั้งถ้าอ่านผิด อ่านทวนได้อีก 1 ครั้ง',
        figure: '', lines: words, each: RT_ALOUD_WORD_POINTS,
    });
    add(5, 'aloud', 30, 'ท 1.1 ป.1/1', {
        text: 'ให้นักเรียนอ่านออกเสียงทีละประโยค ประโยคที่อ่านถูกทุกคำต่อเนื่องโดยไม่สะกดให้แตะว่าถูก แตะอีกครั้งถ้าอ่านผิด อ่านทวนได้อีก 1 ครั้ง',
        figure: '', lines: rtAloudStory(), each: RT_ALOUD_SENTENCE_POINTS, sentences: true,
    });
    return items;
}

// The test gives 2 for a sentence that tells the picture in full, and 1 for one
// that gets it across only in part, like "ว่ายน้ำ" for "ฉันว่ายน้ำ": here, the
// cards after the sentence's first word laid down together and in order.
function markReadingOrder(item, answer) {
    if (!answer || !answer.length) {
        return 0;
    }
    let whole = item.correct;
    if (answer.length === whole.length && answer.every(function (card, position) { return card === whole[position]; })) {
        return item.points;
    }
    let rest = whole.slice(1);
    let from = answer.indexOf(rest[0]);
    return from !== -1 && rest.every(function (card, k) { return answer[from + k] === card; }) ? 1 : 0;
}

function markReadingAloud(item, answer) {
    return answer.filter(function (mark) { return mark === true; }).length * item.each;
}
