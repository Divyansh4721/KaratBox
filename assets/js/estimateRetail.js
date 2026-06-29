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
            "isKDM": stockTable[i].isKDM,
            "index": stockTable[i].index,
            "wastage": stockTable[i].purity.wastage,
        });
        for (let j = 0; j < stockTable[i].stoneTable.length; j++) {
            temp.push({
                "type": "type2",
                "stonetype": stockTable[i].stoneTable[j].type.name,
                "stoneweight": stockTable[i].stoneTable[j].ctWeight,
                "stonerate": stockTable[i].stoneTable[j].sellRate,
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
        win.document.write(`
<html>
<head>
    <title>Print Table</title>
    <link rel="stylesheet" href="/assets/css/estimateRetailPrint.css">
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" defer></script>
    
    <script defer>
        // This function will execute after the libraries above are loaded
        function generatePDF() {
            const loadingIndicator = document.getElementById('loadingIndicator');
            loadingIndicator.style.display = 'block';
            const downloadBtn = document.querySelector('.download-btn');
            downloadBtn.style.display = 'none';
            const element = document.getElementById('maindata');
            
            html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                allowTaint: true
            }).then(canvas => {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                    compress: true
                });
                const pdfWidth = 210;
                const pdfHeight = 297;
                const aspectRatio = canvas.width / canvas.height;
                const margin = 5;
                const contentWidth = pdfWidth - (margin * 2);
                let imgWidth = contentWidth;
                let imgHeight = imgWidth / aspectRatio;
                const xMargin = (pdfWidth - imgWidth) / 2;
                pdf.addImage(
                    canvas.toDataURL('image/jpeg', 1.0),
                    'JPEG',
                    xMargin,
                    5,
                    imgWidth,
                    imgHeight
                );
                const filename = 'Quotation_' + new Date().toLocaleDateString().replace(/\\//g, '-') + '.pdf';
                pdf.save(filename);
                downloadBtn.style.display = 'block';
                loadingIndicator.style.display = 'none';
            }).catch(error => {
                console.error('Error generating PDF:', error);
                alert('Error generating PDF. Please try again.');
                downloadBtn.style.display = 'block';
                loadingIndicator.style.display = 'none';
            });
        }
    </script>
</head>

<body>
    <div id="maindata">
        <div class="invoice-header">
            <div class="date">${getCurrentTime()}</div> <div class="title">Rough Estimate / Quotation</div>
            <div class="note">GST 3% Applicable on Bill/Goods are not Delivered</div>
        </div>
        <div class="table-container">
            ${table.outerHTML}
        </div>
        <div class="actions">
            <button class="download-btn" onclick="generatePDF()">Download as A4 Portrait PDF</button>
        </div>
    </div>
    <div id="loadingIndicator" style="display:none;">Generating PDF...</div>
</body>
</html>
`);
        win.document.close(); // Finalize the document writing
        win.focus();          // Bring the new window to the front (replaces the incorrect win.open())
    }
}

function printTable2() {
    let table = document.getElementById("table");
    if (table) {
        let win = window.open('', '_blank');
        win.document.write(
            `<html>
            <head>
                <title>Print Table</title>
                <link rel="stylesheet" href="/assets/css/estimateRetailPrint.css">
            </head>
            <body>
            <div id="maindata">
                <div class="invoice-header">
                    <div class="date">${getCurrentTime()}</div> <div class="title">Rough Estimate / Quotation</div>
                    <div class="note">GST 3% Applicable on Bill/Goods are not Delivered</div>
                </div>
                <div class="table-container">
                    ${table.outerHTML}
                </div>
            </div>
            <script>
                window.print();
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
                "isKDM": ele[tempind++].getElementsByTagName("input")[0].checked,
                "index": ele[tempind++].getElementsByTagName("input")[0].value,
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
        `<tr class="bold backgroundDark">
            <th>Prefix</th>
            <th>Ornament</th>
            <th>Purity</th>
            <th>Gross Wt</th>
            <th>Net Wt</th>
            <th>Wastage</th>
            <th>Is KDM</th>
            <th>Delete</th>
        </tr>`;
    data.forEach(in1 => {
        if (in1.type === "type1") {
            tempHTML +=
                `<tr id="type1">
                <td>
                    <select id="prefix">`;
            for (let i of prefixTable) {
                tempHTML += `<option ${in1.prefix === i.name ? "selected" : ""} value="${i.name}">${i.name ? i.name : "Select Prefix ..."}</option>`;
            }
            tempHTML += `
                    </select>
                </td>
                <td>
                    <select id="ornament" required>
                        <option value="">Select Ornament ...</option>`;
            for (let i of ornamentTable) {
                tempHTML += `<option ${in1.ornament === i.name ? "selected" : ""} value="${i.name}">${i.name}</option>`;
            }
            tempHTML += `
                    </select>
                </td>
                <td hidden><input value="${in1.tag}" type="number" id="tag" placeholder="Tag" step="0.001"></td>
                <td>
                    <select id="purity" required>
                        <option value="">Select Purity ...</option>`;
            for (let i of purityTable) {
                tempHTML += `<option ${in1.purity === (i.name + '$' + i.wholesaleMultiplier + '$' + i.retailMultiplier + '$' + i.wastage) ? "selected" : ""} value="${i.name + '$' + i.wholesaleMultiplier + '$' + i.retailMultiplier + '$' + i.wastage}">${i.name + " | " + i.wholesaleMultiplier + " | " + i.retailMultiplier + " | " + i.wastage}</option>`;
            }
            tempHTML += `
                    </select>
                </td>
                <td><input value="${in1.grossweight}" type="number" id="grossweight" placeholder="Gross Weight" step="0.001" required></td>
                <td><input value="${in1.netweight}" type="number" id="netweight" placeholder="Net Weight" step="0.001" required></td>
                <td><input type="number" id="wastage" placeholder="Wastage" value="${in1.wastage}" step="0.001" required></td>
                <td><input id="isKDM" type="checkbox" ${in1.isKDM ? "checked" : ""}></td>
                <td hidden><input id="index" type="checkbox" value="${in1.index}"></td>
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
                tempHTML += `<option ${in1.stonetype === i.name ? "selected" : ""} value="${i.name}">${i.name}</option>`;
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
        `<tr class="bold backgroundDark">
            <th>S. No</th>
            <th>SKU</th>
            <th>Ornament</th>
            <th>Stone<br>Wt<br>(ct)</th>
            <th>Carat</th>
            <th>Gross<br>Wt<br>(gms)</th>
            <th>Net<br>Wt<br>(gms)</th>
            <th>Wastage<br>(gms)</th>
            <th>Charged<br>Wt<br>(gms)</th>
            <th>Gold<br>Rate</th>
            <th>KDM<br>Rate</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>With<br>GST<br>(3%)</th>
        </tr>`;
    for (let i = 0; i < data.length; i++) {
        if (data[i].type === "type1") {
            data[i].carat = data[i].purity.split("$")[0];
            data[i].retailMultiplier = data[i].purity.split("$")[2];
            data[i].purity = data[i].purity.split("$")[1];
            data[i].kdmrate = "";
            if (data[i].isKDM)
                data[i].kdmrate = (goldrate * data[i].retailMultiplier / 100) / 10;
            data[i].rate = goldrate * data[i].retailMultiplier / 100;
            if (data[i].isKDM)
                data[i].rate = goldrate * data[i].retailMultiplier / 100 * 1.10;
            let row = returnRow([
                i + 1,
                data[i].index === undefined || data[i].index === "undefined" ? "" : data[i].index,
                data[i].prefix + " " + data[i].ornament + (data[i].tag ? (" - " + data[i].tag) : ""),
                "",
                data[i].carat,
                (data[i].grossweight * 1).toFixed(3),
                (data[i].netweight * 1).toFixed(3),
                (data[i].netweight * data[i].wastage / 100).toFixed(3),
                ((data[i].netweight * 1) + (data[i].netweight * data[i].wastage / 100)).toFixed(3),
                ((goldrate * data[i].retailMultiplier / 100) * 1).toFixed(0),
                data[i].kdmrate ? data[i].kdmrate.toFixed(0) : 0,
                (data[i].rate * 1).toFixed(0),
                new Intl.NumberFormat('en-IN').format((((data[i].netweight * 1) + (data[i].netweight * data[i].wastage / 100)) * (data[i].rate * 1)).toFixed(0)),
            ]);
            row.attr("id", "type1");
            table = $("#table");
            table.append(row);
        } else {
            let row = "";
            row = returnRow([
                i + 1, "",
                data[i].stonetype,
                (data[i].stoneweight * 1).toFixed(3),
                "", "", "", "", "", "", "",
                data[i].stonerate,
                new Intl.NumberFormat('en-IN').format((((data[i].stoneweight * 1) ? data[i].stoneweight : 1) * data[i].stonerate).toFixed(0))
            ]);
            row.attr("id", "type2");
            table = $("#table");
            table.append(row);
        }
    }
    //Section Total
    {
        let wstg = 0,
            grosswt = 0,
            netwt = 0,
            stonewt = 0,
            chwt = 0,
            amt = 0;
        data.forEach((item) => {
            wstg += ((item.wastage ? (item.netweight * item.wastage / 100) : 0) * 1);
            grosswt += ((item.grossweight ? item.grossweight : 0) * 1);
            netwt += ((item.netweight ? item.netweight : 0) * 1);
            chwt += item.netweight ? (((item.netweight * 1) + (item.netweight * item.wastage / 100))) : 0;
            stonewt += ((item.stoneweight ? item.stoneweight : 0) * 1)
            if (item.type === "type1")
                amt += ((item.netweight * 1) + (item.netweight * item.wastage / 100)) * (item.rate * 1);
            else
                amt += ((item.stoneweight * 1) ? item.stoneweight : 1) * item.stonerate;
        });
        let row = returnRow(["Total", "", "", stonewt.toFixed(3), "", grosswt.toFixed(3),
            netwt.toFixed(3), wstg.toFixed(3), chwt.toFixed(3), "", "", "",
            new Intl.NumberFormat('en-IN').format((amt * 1).toFixed(0)),
            new Intl.NumberFormat('en-IN').format((amt * 1.03).toFixed(0))
        ]);
        row.attr("class", "bold backgroundDark");
        table = $("#table");
        table.append(row);
    }
}

function returnRow(arr) {
    let row = $('<tr/>');
    for (let i = 0; i < arr.length; i++) {
        row.append($('<td/>').html(arr[i]));
    }
    return row;
}

function deleteRow(input) {
    let table = document.getElementById("editor");
    table.deleteRow(input.parentElement.parentElement.rowIndex);
}