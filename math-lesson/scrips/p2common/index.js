// Shared by the ป.2 lessons, which load after this file.
function p2RandomInt(min, max) {
    return min + parseInt(Math.random() * (max - min + 1));
}

function p2Pick(list) {
    return list[p2RandomInt(0, list.length - 1)];
}

function p2Shuffle(list) {
    let shuffled = list.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = p2RandomInt(0, i);
        let temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

var p2WordNames = ['แม่', 'พ่อ', 'น้อง', 'พี่', 'ฉัน', 'ครู'];
var p2WordItems = [
    { item: 'ส้ม', classifier: 'ผล' },
    { item: 'แอปเปิ้ล', classifier: 'ผล' },
    { item: 'ดินสอ', classifier: 'แท่ง' },
    { item: 'ลูกอม', classifier: 'เม็ด' },
    { item: 'หนังสือ', classifier: 'เล่ม' },
    { item: 'ดอกไม้', classifier: 'ดอก' },
    { item: 'ลูกโป่ง', classifier: 'ลูก' },
];

var p2SymbolText = { gt: '>', lt: '<', eq: '=' };

function p2CompareSymbol(first, second) {
    return first > second ? 'gt' : (first < second ? 'lt' : 'eq');
}

function p2BindSymbolPicker(pickerId, stateObj) {
    $(document).on('click', '#' + pickerId + ' .symbol-btn', function () {
        $('#' + pickerId + ' .symbol-btn').removeClass('selected');
        $(this).addClass('selected');
        stateObj.selectedSymbol = $(this).data('symbol');
    });
}
