var p1PlaceValueObj = {
    numRows: 1,
    numRowsHistory: 1,
    currentNumber: 0,
}

function validatePlaceValueResult() {
    let tensRaw = $('#placeValueTensNumber').val();
    let unitsRaw = $('#placeValueUnitsNumber').val();

    if (tensRaw === '' || unitsRaw === '') {
        Swal.fire({
            title: 'แจ้งเตือน!',
            text: 'กรุณาใส่ตัวเลขให้ครบ',
            icon: 'info',
            confirmButtonText: 'ตกลง'
        })
        return;
    }

    let tens = +tensRaw;
    let units = +unitsRaw;
    let expectedTens = Math.floor(p1PlaceValueObj.currentNumber / 10);
    let expectedUnits = p1PlaceValueObj.currentNumber % 10;
    let isCorrect = tens === expectedTens && units === expectedUnits;
    let textColor = "green";

    if (isCorrect) {
        Swal.fire({
            icon: "success",
            title: "ถูกต้อง!",
            showConfirmButton: false,
            timer: 1500
        });
    }
    else {
        Swal.fire({
            title: 'ยังไม่ถูก!',
            text: 'ลองดูอีกครั้งนะ',
            icon: 'error',
            confirmButtonText: 'ตกลง'
        })
        textColor = "red";
    }

    let expr = `${p1PlaceValueObj.currentNumber} = หลักสิบ ${tens} หลักหน่วย ${units}`;

    if (isCorrect) {
        addResultPlaceValueToItemList({ expr })
        $('#contentPlaceValueResult').show();
        addSuggestPlaceValueValue();
    }

    $('#contentPlaceValueHistory').show();
    addResultPlaceValueToHistoryList({ expr, color: textColor })
}

function addResultPlaceValueToItemList(item) {
    elementItem = `<div class="answer-chip">
            <span class="answer-index">${p1PlaceValueObj.numRows}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#resultPlaceValueList').append(elementItem)

    p1PlaceValueObj.numRows++;
}

function addResultPlaceValueToHistoryList(item) {
    let isCorrect = item.color == "green";
    elementItem = `<div class="answer-chip ${isCorrect ? 'is-correct' : 'is-incorrect'}">
            <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
            <span class="answer-index">${p1PlaceValueObj.numRowsHistory}</span>
            <span class="answer-expr">${item.expr}</span>
        </div>`
    $('#historyPlaceValueList').append(elementItem)

    if (isCorrect) {
        p1PlaceValueObj.numRowsHistory++;
    }
}

function addSuggestPlaceValueValue() {
    let number = parseInt(Math.random() * 90) + 10;

    p1PlaceValueObj.currentNumber = number;
    $('#placeValueNumber').text(number);
    $('#placeValueTensNumber').val('');
    $('#placeValueUnitsNumber').val('');
}

addSuggestPlaceValueValue();
