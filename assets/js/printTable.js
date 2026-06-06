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

function printTable(element, x) {
    let table = document.querySelectorAll("#" + element)[x];
    let win = window.open('', '_blank');
    let data =
`
<html>
    <head>
        <title>Print Table</title>
        <link rel="stylesheet" href="/assets/css/estimatePrint.css">
        <style>
            tbody tr:nth-child(odd) {
                background-color: rgba(232, 232, 232, 0.5);
            }
        </style>
    </head>
    <body>
        <div id="previewImg"></div>
        <div id="maindata">
            <center>
                ${getCurrentTime()}
                <br>`;
    if (typeof printArrHeader !== 'undefined') {
        for (let item of printArrHeader) {
            data += item;
            data += `<br>`;
        }
    }
    data += `
                <br>
                ${table.outerHTML.replaceAll(" hidden", "")}
            </center>
        </div>
    </body>
    <script>
        window.print();
    </script>
</html>
`;
    win.document.write(data);
    win.document.close();
    win.open();
}

function exportData(element) {
    let table = document.getElementById(element);
    var rows = [];
    var column = [];
    let count = table.rows[0].childElementCount;
    for (var i = 0, row; row = table.rows[i]; i++) {
        for (let j = 0; j < count; j++) {
            if (row.cells[j] != undefined)
                column[j] = row.cells[j].innerText;
        }
        rows.push(column);
        column = [];
    }
    csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(function (rowArray) {
        row = rowArray.join(",");
        csvContent += row + "\r\n";
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SiteData.csv");
    document.body.appendChild(link);
    link.click();
}