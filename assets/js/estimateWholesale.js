function goldRateUpdate() {
    let rate = document.getElementById("goldrate").value;
    let purity = document.getElementById("goldratepurity").value;
    rate = Math.round(((rate / purity) * 100));
    if (Math.round(rate).length > 4) {
        window.alert("Gold Rate Not Correct!")
    } else {
        localStorage.setItem('goldrate', rate);
        buildTable();
    }
}
document.getElementById("grossweight").addEventListener("change", () => {
    document.getElementById("netweight").value = document.getElementById("grossweight").value
});
StartBilling();
document.getElementById("goldrate").value = localStorage.getItem("goldrate");
buildTable();
buildEditor();

function StartBilling() {
    let temp = [];
    for (let i = 0; i < stockTable.length; i++) {
        temp.push({
            "type": "type1",
            "prefix": stockTable[i].prefix.name,
            "ornament": stockTable[i].ornament.name,
            "tag": stockTable[i].tag,
            "purity": stockTable[i].purity.name + "$" +
                stockTable[i].purity.wholesaleMultiplier + "$" +
                stockTable[i].purity.retailMultiplier + "$" +
                stockTable[i].purity.wastage,
            "grossweight": stockTable[i].grossWt,
            "netweight": stockTable[i].netWt,
            "index": stockTable[i].index,
            "wastage": billTable.length ? billTable[i].tounch : 0,
            "labour": billTable.length ? billTable[i].labour : 0,
            "stoneTableLength": stockTable[i].stoneTable.length,
        });
        for (let j = 0; j < stockTable[i].stoneTable.length; j++) {
            temp.push({
                "type": "type2",
                "stonetype": stockTable[i].stoneTable[j].type.name,
                "stoneweight": stockTable[i].stoneTable[j].ctWeight,
                "stonerate": billTable.length ? billTable[i].rate[j] : stockTable[i].stoneTable[j].sellRate,
            });
        }
    }
    localStorage.setItem("goldrate", goldPrice);
    localStorage.setItem('billdata', JSON.stringify(temp));
}

function printTable() {
    let table = document.getElementById("table");
    if (table) {
        let win = window.open('', '_blank');
        win.document.write(
            `<html>
            <head>
                <title>Print Table</title>
                <link rel="stylesheet" href="/assets/css/estimateWholesalePrint.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
                    integrity="sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA=="
                    crossorigin="anonymous" referrerpolicy="no-referrer"></script>
            </head>
            
            <body>
            <center><div id="previewImg"></div></center>
            <div id="maindata">
                <center>${getCurrentTime()}</center>
                <center>Rought Estimate / Quotation</center>
                <center>GST 3% Applicable on Bill/Goods are not Delivered</center>
                <br>
                ${table.outerHTML}
            </div>
            <script>
                let element = document.getElementById("maindata");
                html2canvas(element).then(function (canvas) {
                    let anchorTag = document.createElement("a");
                    document.body.appendChild(anchorTag);
                    document.getElementById("previewImg").appendChild(canvas);
                    element.innerHTML = "";
                    anchorTag.download = "Image";
                    anchorTag.href = canvas.toDataURL();
                    anchorTag.target = '_blank';
                    anchorTag.click();
                    window.print();
                });
            </script>
            </body>
            
            </html>`);
        win.document.close();
        win.open();
    }
}

function getCurrentTime() {
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let now = new Date();
    let dayOfWeek = days[now.getDay()];
    let dayOfMonth = now.getDate();
    let month = months[now.getMonth()];
    let year = now.getFullYear();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let formattedTime = `${dayOfWeek} ${dayOfMonth}-${month}-${year} at ${hours}:${minutes}`;
    return formattedTime;
}

function itemForm(event) {
    event.preventDefault();
    let temp = {
        "type": "type1",
        "prefix": document.getElementById("prefix").value,
        "ornament": document.getElementById("ornament").value,
        "purity": document.getElementById("purity").value,
        "grossweight": document.getElementById("grossweight").value,
        "netweight": document.getElementById("netweight").value,
        "wastage": document.getElementById("wastage").value,
        "labour": document.getElementById("labour").value,
    }
    let data = localStorage.getItem('billdata');
    data = data ? JSON.parse(data) : JSON.parse("[]");
    data.push(temp);
    localStorage.setItem('billdata', JSON.stringify(data));
    buildTable();
    buildEditor();
    let form = document.getElementById("itemform");
    form.reset();
}

function stoneForm(event) {
    event.preventDefault();
    let temp = {
        "type": "type2",
        "stonetype": document.getElementById("stonetype").value,
        "stoneweight": document.getElementById("stoneweight").value,
        "stonerate": document.getElementById("stonerate").value,
    }
    let data = localStorage.getItem('billdata');
    data = data ? JSON.parse(data) : JSON.parse("[]");
    data.push(temp);
    localStorage.setItem('billdata', JSON.stringify(data));
    buildTable();
    buildEditor();
    let form = document.getElementById("stoneform");
    form.reset();
}

function submitEditor(event) {
    event.preventDefault();
    let table = document.getElementById("editor");
    let rows = table.getElementsByTagName("tr");
    let ele = table.getElementsByTagName("td");
    let json = [];
    let tempind = 0;
    for (let i = 1; i < rows.length; i++) {
        if (rows[i].id === "type1") {
            json.push({
                "type": "type1",
                "prefix": ele[tempind++].getElementsByTagName("select")[0].value,
                "ornament": ele[tempind++].getElementsByTagName("select")[0].value,
                "tag": ele[tempind++].getElementsByTagName("input")[0].value,
                "purity": ele[tempind++].getElementsByTagName("select")[0].value,
                "grossweight": ele[tempind++].getElementsByTagName("input")[0].value,
                "netweight": ele[tempind++].getElementsByTagName("input")[0].value,
                "wastage": ele[tempind++].getElementsByTagName("input")[0].value,
                "labour": ele[tempind++].getElementsByTagName("input")[0].value,
                "index": ele[tempind++].getElementsByTagName("input")[0].value,
                "stoneTableLength": ele[tempind++].getElementsByTagName("input")[0].value,
            })
            tempind++;
        } else if (rows[i].id === "type2") {
            tempind++;
            json.push({
                "type": "type2",
                "stonetype": ele[tempind++].getElementsByTagName("select")[0].value,
                "stoneweight": ele[tempind++].getElementsByTagName("input")[0].value,
                "stonerate": ele[tempind++].getElementsByTagName("input")[0].value
            })
            tempind++;
            tempind++;
            tempind++;
            tempind++;
        }
    }
    localStorage.setItem('billdata', JSON.stringify(json));
    buildTable();
}

function buildEditor() {
    let data = localStorage.getItem('billdata');
    data = data ? JSON.parse(data) : JSON.parse("[]");
    document.getElementById("editor").innerHTML = "";
    let tempHTML =
        `<tr class="backgroundDark">
            <th>Prefix</th>
            <th>Ornament</th>
            <th>Purity</th>
            <th>Gross Wt</th>
            <th>Net Wt</th>
            <th>Wastage</th>
            <th>Labour</th>
            <th>Delete</th>
        </tr>`;
    data.forEach(in1 => {
        if (in1.type === "type1") {
            tempHTML +=
                `<tr id="type1">
                <td>
                    <select id="prefix">`;
            for (let i of prefixTable) {
                tempHTML += `<option ${in1.prefix===i.name ?"selected":""} value="${ i.name }">${ i.name ? i.name : "Select Prefix ..." }</option>`;
            }
            tempHTML += `
                    </select>
                </td>
                <td>
                    <select id="ornament" required>
                        <option value="">Select Ornament ...</option>`;
            for (let i of ornamentTable) {
                tempHTML += `<option ${in1.ornament===i.name ?"selected":""} value="${ i.name }">${ i.name }</option>`;
            }
            tempHTML += `
                    </select>
                </td>
                <td hidden><input value="${in1.tag?in1.tag:''}" type="number" id="tag" placeholder="Tag" step="0.001"></td>
                <td>
                    <select id="purity" required>
                        <option value="">Select Purity ...</option>`;
            for (let i of purityTable) {
                tempHTML += `<option ${in1.purity===(i.name + '$'+ i.wholesaleMultiplier + '$'+ i.retailMultiplier + '$'+ i.wastage) ?"selected":""} value="${ i.name + '$'+ i.wholesaleMultiplier + '$'+ i.retailMultiplier + '$'+ i.wastage }">${ i.name + " | "+ i.wholesaleMultiplier + " | "+ i.retailMultiplier + " | "+ i.wastage }</option>`;
            }
            tempHTML += `
                    </select>
                </td>
                <td><input value="${in1.grossweight}" type="number" id="grossweight" placeholder="Gross Weight" step="0.001" required></td>
                <td><input value="${in1.netweight}" type="number" id="netweight" placeholder="Net Weight" step="0.001" required></td>
                <td><input type="number" id="wastage" placeholder="Wastage" value="${in1.wastage}" step="0.001" required></td>
                <td><input type="number" id="labour" placeholder="Labour" value="${in1.labour}" step="0.001" required></td>
                <td hidden><input id="index" type="checkbox" value="${in1.index}"></td>
                <td hidden><input id="stoneTableLength" type="checkbox" value="${in1.stoneTableLength}"></td>
                <td><button type="button" id="deletebutton" onclick="deleteRow(this)">Delete</button></td>
            </tr>`;
        } else {
            tempHTML +=
                `<tr id="type2">
                <td></td>
                <td>
                    <select id="stonetype" required>
                        <option value="">Select Stone Type ...</option>`;
            for (let i of stoneTypeTable) {
                tempHTML += `<option ${in1.stonetype===i.name ?"selected":""} value="${ i.name }">${ i.name }</option>`;
            }
            tempHTML += `
                    </select>
                </td>
                <td><input value="${in1.stoneweight}" type="number" id="stoneweight" placeholder="Stone Weight" step="0.001" required></td>
                <td><input value="${in1.stonerate}" type="number" id="stonerate" placeholder="Stone Rate" step="0.01" required></td>
                <td></td>
                <td></td>
                <td></td>
                <td><button type="button" id="deletebutton" onclick="deleteRow(this)">Delete</button></td>
            </tr>`;
        }
    });
    document.getElementById("editor").innerHTML = tempHTML;
}

function buildTable() {
    if (!localStorage.getItem('billdata')) {
        return;
    }
    let data = localStorage.getItem('billdata');
    data = data ? JSON.parse(data) : JSON.parse("[]");
    let goldrate = localStorage.getItem('goldrate') ? localStorage.getItem('goldrate') : 0;
    document.getElementById("table").innerHTML =
        `<tr class="backgroundDark">
            <th colspan="4" class="border-right">Design</th>
            <th colspan="9" class="border-right">Metal</th>
            <th colspan="5" class="border-right">Stone</th>
            <th colspan="2" class="border-right">Labour</th>
            <th colspan="1">Total</th>
        </tr>
        <tr class="backgroundDark border-bottom">
            <th>S. No</th>
            <th>Image</th>
            <th>SKU</th>
            <th class="border-right">Ornament</th>
            <th>Purity</th>
            <th>Tounch</th>
            <th>Gross Wt<br>(gms)</th>
            <th>Net Wt<br>(gms)</th>
            <th>Pure Wt<br>(gms)</th>
            <th>Wastage<br>(gms)</th>
            <th>Charged Wt<br>(gms)</th>
            <th>Rate<br>(per gm)</th>
            <th class="border-right">Amount</th>
            <th>Type</th>
            <th>Weight<br>(ct)</th>
            <th>Weight<br>(gm)</th>
            <th>Rate<br>(per ct)</th>
            <th class="border-right">Amount</th>
            <th>Rate<br>(per gm)</th>
            <th class="border-right">Amount</th>
            <th>Amount</th>
        </tr>`;
    for (let i = 0, k = 1; i < data.length; i++) {
        if (data[i].type === "type1") {
            data[i].Total = 0;
            data[i].Total += ((data[i].netweight * data[i].purity.split("$")[1] / 100) + (data[i].netweight * data[i].wastage / 100)) * goldrate;
            data[i].Total += data[i].netweight * data[i].labour;
            for (let j = i + 1; j < data.length; j++) {
                if (data[j].type === "type2")
                    data[i].Total += (data[j].stoneweight * 1 ? data[j].stoneweight : 1) * data[j].stonerate;
                else
                    break;
            }
            data[i].Total += 0;
            data[i].Total += 0;
            data[i].Total += 0;
            data[i].Total += 0;
            data[i].Total = "₹ " + new Intl.NumberFormat('en-IN').format((data[i].Total * 1).toFixed(0));
            let row = returnRow([
                k++,
                `<img id="tableImage" src="${"/uploads/" + data[i].index + "-1.png"}">`,
                data[i].index === undefined || data[i].index === "undefined" ? "" : data[i].index,
                data[i].prefix + " " + data[i].ornament + (data[i].tag ? (" - " + data[i].tag) : ""),
                data[i].purity.split("$")[0],
                data[i].purity.split("$")[1],
                (data[i].grossweight * 1).toFixed(3),
                (data[i].netweight * 1).toFixed(3),
                (data[i].netweight * data[i].purity.split("$")[1] / 100).toFixed(3),
                (data[i].netweight * data[i].wastage / 100).toFixed(3),
                ((data[i].netweight * data[i].purity.split("$")[1] / 100) + (data[i].netweight * data[i].wastage / 100)).toFixed(3),
                "₹ " + new Intl.NumberFormat('en-IN').format(goldrate),
                "₹ " + new Intl.NumberFormat('en-IN').format((((data[i].netweight * data[i].purity.split("$")[1] / 100) + (data[i].netweight * data[i].wastage / 100)) * goldrate).toFixed(0)),
                data[i + 1] && data[i + 1].type === "type2" ? data[i + 1].stonetype : "",
                data[i + 1] && data[i + 1].type === "type2" ? (data[i + 1].stoneweight * 1).toFixed(3) : "",
                data[i + 1] && data[i + 1].type === "type2" ? (data[i + 1].stoneweight / 5).toFixed(3) : "",
                data[i + 1] && data[i + 1].type === "type2" ? "₹ " + new Intl.NumberFormat('en-IN').format(data[i + 1].stonerate) : "",
                data[i + 1] && data[i + 1].type === "type2" ? "₹ " + new Intl.NumberFormat('en-IN').format(((data[i + 1].stoneweight * 1 ? data[i + 1].stoneweight : 1) * data[i + 1].stonerate).toFixed(0)) : "",
                "₹ " + new Intl.NumberFormat('en-IN').format(data[i].labour),
                "₹ " + new Intl.NumberFormat('en-IN').format((data[i].netweight * data[i].labour).toFixed(0)),
                data[i].Total,
            ]);
            row.attr("id", "type1");
            if (data[i + 1] && data[i + 1].type === "type2") {
                data[i + 1].type = "";
                if (data[i + 2] && data[i + 2].type === "type1") {
                    row.attr("class", "border-bottom");
                }
            } else {
                row.attr("class", "border-bottom");
            }
            table = $("#table");
            table.append(row);
        } else if (data[i].type === "type2") {
            let ti = tableImage.length ? tableImage[tableImage.length - 1] : tableImage;
            ti.parentElement.rowSpan += 1;
            let row = returnRow([
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                data[i].stonetype,
                (data[i].stoneweight * 1).toFixed(3),
                (data[i].stoneweight / 5).toFixed(3),
                "₹ " + new Intl.NumberFormat('en-IN').format(data[i].stonerate),
                "₹ " + new Intl.NumberFormat('en-IN').format(((data[i].stoneweight * 1 ? data[i].stoneweight : 1) * data[i].stonerate).toFixed(0)),
                "",
                "",
                "",
            ]);
            row.attr("id", "type2");
            if (data[i + 1] && data[i + 1].type === "type2") {} else {
                row.attr("class", "border-bottom");
            }
            table = $("#table");
            table = $("#table");
            table.append(row);
        }
    }
    //Section Total
    {
        let grosswt = 0,
            netwt = 0,
            purewt = 0,
            wastage = 0,
            chwt = 0,
            gamt = 0,
            stonewtct = 0,
            stonewtgm = 0,
            samt = 0,
            lamt = 0,
            tamt = 0;
        let stoneTableData = {};
        for (let i = 0; i < stoneTypeTable.length; i++) {
            stoneTableData[stoneTypeTable[i].name] = {
                ctWeight: 0,
                gmWeight: 0,
                total: 0,
            };
        }
        data.forEach((item) => {
            if (item.type === "type1") {
                grosswt += (item.grossweight * 1);
                netwt += (item.netweight * 1);
                purewt += (item.netweight * item.purity.split("$")[1] / 100);
                wastage += (item.netweight * item.wastage / 100);
                chwt += ((item.netweight * item.purity.split("$")[1] / 100) + (item.netweight * item.wastage / 100));
                gamt += (((item.netweight * item.purity.split("$")[1] / 100) + (item.netweight * item.wastage / 100)) * goldrate);
                lamt += (item.netweight * item.labour);
                tamt += (item.netweight * item.labour);
                tamt += (((item.netweight * item.purity.split("$")[1] / 100) + (item.netweight * item.wastage / 100)) * goldrate);
            } else {
                stoneTableData[item.stonetype].ctWeight += (item.stoneweight * 1);
                stoneTableData[item.stonetype].gmWeight += (item.stoneweight / 5);
                stoneTableData[item.stonetype].total += ((item.stoneweight * 1 ? item.stoneweight : 1) * item.stonerate);
                stonewtct += (item.stoneweight * 1);
                stonewtgm += (item.stoneweight / 5);
                samt += ((item.stoneweight * 1 ? item.stoneweight : 1) * item.stonerate);
                tamt += ((item.stoneweight * 1 ? item.stoneweight : 1) * item.stonerate);
            }
        });
        let row = returnRow([
            "Total",
            "",
            "",
            "",
            "",
            "",
            (grosswt * 1).toFixed(3),
            (netwt * 1).toFixed(3),
            (purewt * 1).toFixed(3),
            (wastage * 1).toFixed(3),
            (chwt * 1).toFixed(3),
            "",
            "₹ " + new Intl.NumberFormat('en-IN').format((gamt * 1).toFixed(0)),
            "",
            (stonewtct * 1).toFixed(3),
            (stonewtgm * 1).toFixed(3),
            "",
            "₹ " + new Intl.NumberFormat('en-IN').format((samt * 1).toFixed(0)),
            "",
            "₹ " + new Intl.NumberFormat('en-IN').format((lamt * 1).toFixed(0)),
            "₹ " + new Intl.NumberFormat('en-IN').format((tamt * 1).toFixed(0)),
        ]);
        row.attr("class", "bold backgroundDark border-bottom border-top");
        table = $("#table");
        table.append(row);
        row = $('<tr/>');
        row.append($('<td/>').html("Metal Summary").attr("colspan", "4").attr("class", "bold border-right border-bottom backgroundDark"));
        row.append($('<td/>').html("Stone Summary").attr("colspan", "5").attr("class", "bold border-right border-bottom backgroundDark"));
        row.append($('<td/>').html("Total Summary").attr("colspan", "4").attr("class", "bold border-right border-bottom backgroundDark"));
        table = $("#table");
        table.append(row);
        row = $('<tr/>');
        // td1
        {
            let tempTable = $('<table/>').attr("style", "width:100%;");
            let tempRow = $('<tr/>');
            tempRow.append($('<th/>').html("Pure Gold (24 ct)"));
            tempRow.append($('<th/>').html(""));
            tempRow.append($('<th/>').html((purewt * 1).toFixed(3) + " gm"));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<th/>').html("Wastage (24 ct)"));
            tempRow.append($('<th/>').html(""));
            tempRow.append($('<th/>').html((wastage * 1).toFixed(3) + " gm"));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<th/>').html("Charged Gold (24 ct)"));
            tempRow.append($('<th/>').html(""));
            tempRow.append($('<th/>').html((chwt * 1).toFixed(3) + " gm"));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<th/>').html("Gold Price"));
            tempRow.append($('<th/>').html(""));
            tempRow.append($('<th/>').html("₹ " + new Intl.NumberFormat('en-IN').format(((goldrate) * 1).toFixed(0))));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<th/>').html("Gold Amount"));
            tempRow.append($('<th/>').html(""));
            tempRow.append($('<th/>').html("₹ " + new Intl.NumberFormat('en-IN').format((gamt * 1).toFixed(0))));
            tempTable.append(tempRow);
            row.append($('<td/>').append(tempTable).attr("class", "border-right").attr("colspan", "4"));
        }
        // td2
        {
            let tempTable = $('<table/>').attr("style", "width:100%;");
            let tempRow = $('<tr/>').attr("class", "backgroundDark");
            tempRow.append($('<th/>').html("Type"));
            tempRow.append($('<th/>').html("Weight"));
            tempRow.append($('<th/>').html("Total"));
            tempTable.append(tempRow);
            let keys = Object.keys(stoneTableData);
            for (let i = 0; i < keys.length; i++) {
                if (stoneTableData[keys[i]].ctWeight || stoneTableData[keys[i]].gmWeight || stoneTableData[keys[i]].total) {
                    tempRow = $('<tr/>');
                    tempRow.append($('<td/>').html(keys[i]));
                    tempRow.append($('<td/>').html((stoneTableData[keys[i]].ctWeight * 1).toFixed(3) + " ct"));
                    tempRow.append($('<td/>').html("₹ " + new Intl.NumberFormat('en-IN').format((stoneTableData[keys[i]].total * 1).toFixed(0))));
                    tempTable.append(tempRow);
                }
            }
            tempRow = $('<tr/>').attr("class", "backgroundDark");
            tempRow.append($('<th/>').html("Total"));
            tempRow.append($('<th/>').html((stonewtct * 1).toFixed(3) + " ct"));
            tempRow.append($('<th/>').html("₹ " + new Intl.NumberFormat('en-IN').format((samt * 1).toFixed(0))));
            tempTable.append(tempRow);
            row.append($('<td/>').append(tempTable).attr("class", "border-right").attr("colspan", "5"));
        }
        // td3
        {
            let tempTable = $('<table/>').attr("style", "width:100%;");
            let tempRow = $('<tr/>');
            tempRow.append($('<td/>').html("Fine Gold (24 ct)"));
            tempRow.append($('<td/>').html(""));
            tempRow.append($('<td/>').html((chwt * 1).toFixed(3) + " gm"));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<td/>').html("Gold Price"));
            tempRow.append($('<td/>').html(""));
            tempRow.append($('<td/>').html("₹ " + new Intl.NumberFormat('en-IN').format(((goldrate) * 1).toFixed(0))));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<td/>').html("Gold Amount"));
            tempRow.append($('<td/>').html(""));
            tempRow.append($('<td/>').html("₹ " + new Intl.NumberFormat('en-IN').format((gamt * 1).toFixed(0))));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<td/>').html("Labour"));
            tempRow.append($('<td/>').html(""));
            tempRow.append($('<td/>').html("₹ " + new Intl.NumberFormat('en-IN').format((lamt * 1).toFixed(0))));
            tempTable.append(tempRow);
            tempRow = $('<tr/>');
            tempRow.append($('<td/>').html("Stone Amount"));
            tempRow.append($('<td/>').html(""));
            tempRow.append($('<td/>').html("₹ " + new Intl.NumberFormat('en-IN').format((samt * 1).toFixed(0))));
            tempTable.append(tempRow);
            tempRow = $('<tr/>').attr("class", "backgroundDark");
            tempRow.append($('<th/>').html("Total Amount"));
            tempRow.append($('<th/>').html(""));
            tempRow.append($('<th/>').html("₹ " + new Intl.NumberFormat('en-IN').format((tamt * 1).toFixed(0))));
            tempTable.append(tempRow);
            row.append($('<td/>').append(tempTable).attr("class", "border-right").attr("colspan", "4"));
        }
        table = $("#table");
        table.append(row);
    }
}

function returnRow(arr) {
    let row = $('<tr/>');
    let temp = [];
    if (arr.length === 21)
        temp = [3, 12, 17, 19];
    else
        temp = [2, 11, 16, 18];
    for (let i = 0; i < arr.length; i++) {
        if (temp.includes(i))
            row.append($('<td/>').html(arr[i]).attr("class", "border-right"));
        else
            row.append($('<td/>').html(arr[i]));
    }
    return row;
}

function deleteRow(input) {
    let table = document.getElementById("editor");
    table.deleteRow(input.parentElement.parentElement.rowIndex);
}