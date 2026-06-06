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

function printTable(element) {
    let table = document.getElementById(element);
    let win = window.open('', '_blank');
    win.document.write(
        `
<html>
    <head>
        <title>Print Table</title>
        <link rel="stylesheet" href="/assets/css/estimatePrint.css">
        <style>
            table {
                font-size: 0.9vw !important;
            }
            tbody tr td:nth-child(1) {
                font-weight: bold;
                background-color: rgba(211, 211, 211, 0.5);
            }
            tbody tr:nth-last-child(1) {
                font-weight: bold;
                background-color: rgba(211, 211, 211, 0.5);
            }
            tbody tr:nth-child(even) {
                background-color: rgba(232, 232, 232, 0.5);
            }
            tbody tr td:nth-child(2),
            tbody tr td:nth-child(5),
            tbody tr td:nth-child(8),
            tbody tr td:nth-child(11),
            tbody tr td:nth-child(14),
            tbody tr td:nth-child(17),
            tbody tr td:nth-child(20),
            tbody tr td:nth-child(23) {
                border-left-width: 2px;
            }
        </style>
    </head>
    <body>
        <div id="previewImg"></div>
        <div id="maindata">
            <center>
                ${getCurrentTime()}
                <br>
                List Date : ${$(".PageDate")[0].innerHTML}
                <br>
                <br>
                ${table.outerHTML.replace(" hidden", "")}
            </center>
        </div>
    </body>
    <script>
        window.print();
    </script>
</html>
    `);
    win.document.close();
    win.open();
}