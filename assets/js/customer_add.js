function AddRowPH() {
    let a = $(`table[id=phNum]`).children()[0].getElementsByTagName("tr");
    let num = Number(a[a.length - 1].id.replace('phNum', "")) + 1;
    let row = $('<tr/>');
    row[0].id = 'phNum' + num;
    row.append($('<td/>').html(`<input type="number" name="phNum[]" min="1111111111" max="9999999999" placeholder="Enter Phone Number ...." required>`));
    row.append($('<td/>').html(`<button type="button" class="fas fa-trash" onclick="DeleteRow('phNum', ${num})"></button>`));
    $(`table[id=phNum]`).append(row);
}

function AddRowCO() {
    let a = $(`table[id=CO]`).children()[0].getElementsByTagName("tr");
    let num = Number(a[a.length - 1].id.replace('CO', "")) + 1;
    let row = $('<tr/>');
    row[0].id = 'CO' + num;
    row.append($('<td/>').html(`<input type="text" name="CO[]" placeholder="Enter Care Of ...." required>`));
    row.append($('<td/>').html(`<button type="button" class="fas fa-trash" onclick="DeleteRow('CO', ${num})"></button>`));
    $(`table[id=CO]`).append(row);
}

function AddRowDate() {
    let a = $(`table[id=impDates]`).children()[0].getElementsByTagName("tr");
    let num = Number(a[a.length - 1].id.replace('impDates', "")) + 1;
    let row = $('<tr/>');
    row[0].id = 'impDates' + num;
    row.append($('<td/>').html(`<input type="date" name="impDates[]" placeholder="Enter Phone Number ...." required>`));
    row.append($('<td/>').html(`<input type="text" name="remark[]" placeholder="Enter Remark ...." required>`));
    row.append($('<td/>').html(`<button type="button" class="fas fa-trash" onclick="DeleteRow('impDates', ${num})"></button>`));
    $(`table[id=impDates]`).append(row);
}

function DeleteRow(name, num) {
    $(`tr[id=${name+num}]`)[0].remove()
}