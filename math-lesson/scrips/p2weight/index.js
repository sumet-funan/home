var p2WeightObj = {
    numRows: 1,
    numRowsHistory: 1,
    mode: "compare",
    firstValue: 0,
    secondValue: 0,
    firstText: '',
    secondText: '',
    selectedSymbol: null,
    text: '',
    unit: null,
    expectedKilograms: 0,
    expectedSmall: 0,
}

// A kilogram splits either into grams or into ขีด, never into both at once.
var p2WeightUnits = [
    { name: 'กรัม', perKilogram: 1000, step: 50 },
    { name: 'ขีด', perKilogram: 10, step: 1 },
];

p2BindSymbolPicker('p2WeightSymbolPicker', p2WeightObj);

function p2CompoundWeight(amount, unit) {
    let rest = amount % unit.perKilogram;
    return `${Math.floor(amount / unit.perKilogram)} กก.${rest ? ` ${rest} ${unit.name}` : ''}`;
}

function validateP2WeightResult() {
    let isCorrect, expr;

    if (p2WeightObj.mode === 'compare') {
        if (!p2WeightObj.selectedSymbol) {
            flagFieldRequired('p2WeightSymbolPicker');
            return;
        }

        isCorrect = p2WeightObj.selectedSymbol === p2CompareSymbol(p2WeightObj.firstValue, p2WeightObj.secondValue);
        expr = `${p2WeightObj.firstText} ${p2SymbolText[p2WeightObj.selectedSymbol]} ${p2WeightObj.secondText}`;
    } else {
        if (focusFirstEmptyField(['p2WeightKilogramsNumber', 'p2WeightSmallNumber'])) {
            return;
        }

        let kilograms = +$('#p2WeightKilogramsNumber').val();
        let small = +$('#p2WeightSmallNumber').val();

        isCorrect = kilograms === p2WeightObj.expectedKilograms && small === p2WeightObj.expectedSmall;
        expr = `${p2WeightObj.text} = ${kilograms} กิโลกรัม ${small} ${p2WeightObj.unit.name}`;
    }

    showFeedback('feedbackP2Weight', isCorrect);

    if (isCorrect) {
        addResultP2WeightToItemList({ expr })
        $('#contentP2WeightResult').show();
        addSuggestP2WeightValue();
        $('#p2WeightKilogramsNumber').filter(':visible').first().trigger('focus');
    }

    $('#contentP2WeightHistory').show();
    addResultP2WeightToHistoryList({ expr, color: isCorrect ? "green" : "red" })
}

function addResultP2WeightToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p2WeightObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultP2WeightList').append(elementItem)

    p2WeightObj.numRows++;
}

function addResultP2WeightToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p2WeightObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyP2WeightList').append(elementItem)

    recordHistoryAttempt('p2weight', isCorrect, 'historyP2WeightList');

    if (isCorrect) {
        p2WeightObj.numRowsHistory++;
    }
}

// The smaller unit never carries into kilograms, as with length.
function suggestP2WeightWord() {
    let unit = p2Pick(p2WeightUnits);
    let steps = unit.perKilogram / unit.step;
    let isAddition = Math.random() < 0.5;
    let firstKilograms = isAddition ? p2RandomInt(1, 5) : p2RandomInt(3, 9);
    let secondKilograms = isAddition ? p2RandomInt(1, 4) : p2RandomInt(1, firstKilograms - 1);
    let firstSmall = isAddition ? p2RandomInt(1, steps - 2) : p2RandomInt(2, steps - 1);
    let secondSmall = isAddition ? p2RandomInt(1, steps - 1 - firstSmall) : p2RandomInt(1, firstSmall);
    let first = `${firstKilograms} กิโลกรัม ${firstSmall * unit.step} ${unit.name}`;
    let second = `${secondKilograms} กิโลกรัม ${secondSmall * unit.step} ${unit.name}`;
    let templates = isAddition
        ? [
            `ข้าวสารหนัก ${first} ถั่วเขียวหนัก ${second} รวมกันหนักเท่าไร`,
            `แม่ซื้อเนื้อหมู ${first} และซื้อเนื้อไก่ ${second} แม่ซื้อเนื้อทั้งหมดหนักเท่าไร`,
        ]
        : [
            `น้ำตาลถุงหนึ่งหนัก ${first} แบ่งออกไป ${second} เหลือน้ำตาลหนักเท่าไร`,
            `แตงโมหนัก ${first} ฟักทองหนัก ${second} แตงโมหนักกว่าฟักทองเท่าไร`,
        ];

    p2WeightObj.unit = unit;
    p2WeightObj.text = p2Pick(templates);
    p2WeightObj.expectedKilograms = isAddition ? firstKilograms + secondKilograms : firstKilograms - secondKilograms;
    p2WeightObj.expectedSmall = (isAddition ? firstSmall + secondSmall : firstSmall - secondSmall) * unit.step;

    $('#p2WeightWordText').text(p2WeightObj.text);
    $('#p2WeightSmallLabel').text(unit.name);
    $('#p2WeightKilogramsNumber').val('');
    $('#p2WeightSmallNumber').val('');
}

function suggestP2WeightCompare() {
    let unit = p2Pick(p2WeightUnits);
    let steps = unit.perKilogram / unit.step;
    let firstSteps = p2RandomInt(steps + 6, steps * 6 - 1);
    let secondSteps = Math.random() < 0.2 ? firstSteps : firstSteps + p2RandomInt(-5, 5);
    let firstValue = firstSteps * unit.step;
    let secondValue = secondSteps * unit.step;
    let compoundFirst = Math.random() < 0.5;

    p2WeightObj.firstValue = firstValue;
    p2WeightObj.secondValue = secondValue;
    p2WeightObj.firstText = compoundFirst ? p2CompoundWeight(firstValue, unit) : `${firstValue} ${unit.name}`;
    p2WeightObj.secondText = compoundFirst ? `${secondValue} ${unit.name}` : p2CompoundWeight(secondValue, unit);
    p2WeightObj.selectedSymbol = null;

    $('#p2WeightSymbolPicker .symbol-btn').removeClass('selected');
    $('#firstP2WeightNumber').text(p2WeightObj.firstText);
    $('#secondP2WeightNumber').text(p2WeightObj.secondText);
}

function addSuggestP2WeightValue() {
    let isCompare = p2WeightObj.mode === 'compare';

    $('#p2WeightCompareArea').toggle(isCompare);
    $('#p2WeightWordArea').toggle(!isCompare);

    if (isCompare) {
        suggestP2WeightCompare();
    } else {
        suggestP2WeightWord();
    }
}

bindModePicker('p2WeightModePicker', p2WeightObj, addSuggestP2WeightValue);

addSuggestP2WeightValue();
