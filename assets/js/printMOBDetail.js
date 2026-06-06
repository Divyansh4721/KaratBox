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

function printTableDetail(element) {
    let table = document.getElementById(element);
    let win = window.open('', '_blank');
    win.document.write(
        `
<html>
    <head>
        <title>Print Table</title>
        <link rel="stylesheet" href="/assets/css/estimatePrint.css">
        <style>
            #heading {
                font-weight: bold;
                font-size: 2vw !important;
            }
            #detailList {
                width:100%;
            }
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
                <br>
                List Date : ${$(".PageDate")[0].innerHTML}
                <br>
                <br>
                ${table.outerHTML.replaceAll(" hidden", "")}
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