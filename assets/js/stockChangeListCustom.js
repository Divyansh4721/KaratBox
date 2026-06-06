function buildTable() {
    let data = JSON.parse(JSON.stringify(fullList));
    let table = $('#fullList')[0];
    let HTMLContent = `
    <thead>
        <tr class="bold backgroundDark">
            <td></td>
            <td colspan="3">Opening</td>
            <td colspan="3">Day Arrival</td>
            <td colspan="3">Day Sale</td>
            <td colspan="3">Day Delete</td>
            <td colspan="3">Approval</td>
            <td colspan="3">Closing</td>
            <td colspan="3">Total</td>
        </tr>
        <tr class="bold backgroundDark">
            <td>Item</td>
            <td>No.</td>
            <td>St. Wt</td>
            <td>Gross Wt.</td>
            <td>No.</td>
            <td>St. Wt</td>
            <td>Gross Wt.</td>
            <td>No.</td>
            <td>St. Wt</td>
            <td>Gross Wt.</td>
            <td>No.</td>
            <td>St. Wt</td>
            <td>Gross Wt.</td>
            <td>No.</td>
            <td>St. Wt</td>
            <td>Gross Wt.</td>
            <td>No.</td>
            <td>St. Wt</td>
            <td>Gross Wt.</td>
            <td>No.</td>
            <td>St. Wt</td>
            <td>Gross Wt.</td>
        </tr>
    </thead>
    <tbody>
    `;

    let temp = `{"name": "Total", "flag": true,
            "opening": {"total": 0, "stoneWt": 0, "grossWt": 0},
            "arrival": {"total": 0, "stoneWt": 0, "grossWt": 0},
            "sold": {"total": 0, "stoneWt": 0, "grossWt": 0},
            "delete": {"total": 0, "stoneWt": 0, "grossWt": 0},
            "approval": {"total": 0, "stoneWt": 0, "grossWt": 0},
            "closing": {"total": 0, "stoneWt": 0, "grossWt": 0},
            "total": {"total": 0, "stoneWt": 0, "grossWt": 0}}`;
    let tempTotal = JSON.parse(temp);
    let Total = JSON.parse(JSON.stringify(tempTotal));
    Total.name = "Grand Total";
    for (let i of data) {
        if (i.flag) {
            tempTotal.opening.total += i.opening ? i.opening.total : 0;
            tempTotal.opening.stoneWt += i.opening ? i.opening.stoneWt : 0;
            tempTotal.opening.grossWt += i.opening ? i.opening.grossWt : 0;
            tempTotal.arrival.total += i.arrival ? i.arrival.total : 0;
            tempTotal.arrival.stoneWt += i.arrival ? i.arrival.stoneWt : 0;
            tempTotal.arrival.grossWt += i.arrival ? i.arrival.grossWt : 0;
            tempTotal.sold.total += i.sold ? i.sold.total : 0;
            tempTotal.sold.stoneWt += i.sold ? i.sold.stoneWt : 0;
            tempTotal.sold.grossWt += i.sold ? i.sold.grossWt : 0;
            tempTotal.delete.total += i.delete ? i.delete.total : 0;
            tempTotal.delete.stoneWt += i.delete ? i.delete.stoneWt : 0;
            tempTotal.delete.grossWt += i.delete ? i.delete.grossWt : 0;
            tempTotal.approval.total += i.approval ? i.approval.total : 0;
            tempTotal.approval.stoneWt += i.approval ? i.approval.stoneWt : 0;
            tempTotal.approval.grossWt += i.approval ? i.approval.grossWt : 0;
            tempTotal.closing.total += i.closing ? i.closing.total : 0;
            tempTotal.closing.stoneWt += i.closing ? i.closing.stoneWt : 0;
            tempTotal.closing.grossWt += i.closing ? i.closing.grossWt : 0;
            tempTotal.total.total += i.total ? i.total.total : 0;
            tempTotal.total.stoneWt += i.total ? i.total.stoneWt : 0;
            tempTotal.total.grossWt += i.total ? i.total.grossWt : 0;
        }
        Total.opening.total += i.opening ? i.opening.total : 0;
        Total.opening.stoneWt += i.opening ? i.opening.stoneWt : 0;
        Total.opening.grossWt += i.opening ? i.opening.grossWt : 0;
        Total.arrival.total += i.arrival ? i.arrival.total : 0;
        Total.arrival.stoneWt += i.arrival ? i.arrival.stoneWt : 0;
        Total.arrival.grossWt += i.arrival ? i.arrival.grossWt : 0;
        Total.sold.total += i.sold ? i.sold.total : 0;
        Total.sold.stoneWt += i.sold ? i.sold.stoneWt : 0;
        Total.sold.grossWt += i.sold ? i.sold.grossWt : 0;
        Total.delete.total += i.delete ? i.delete.total : 0;
        Total.delete.stoneWt += i.delete ? i.delete.stoneWt : 0;
        Total.delete.grossWt += i.delete ? i.delete.grossWt : 0;
        Total.approval.total += i.approval ? i.approval.total : 0;
        Total.approval.stoneWt += i.approval ? i.approval.stoneWt : 0;
        Total.approval.grossWt += i.approval ? i.approval.grossWt : 0;
        Total.closing.total += i.closing ? i.closing.total : 0;
        Total.closing.stoneWt += i.closing ? i.closing.stoneWt : 0;
        Total.closing.grossWt += i.closing ? i.closing.grossWt : 0;
        Total.total.total += i.total ? i.total.total : 0;
        Total.total.stoneWt += i.total ? i.total.stoneWt : 0;
        Total.total.grossWt += i.total ? i.total.grossWt : 0;
    }
    data.push(tempTotal);
    data.push(Total);
    for (let i of data) {
        if (i.flag === undefined) i.flag = false;
        if (!i.flag) continue;
        HTMLContent += `
        <tr>
            <td>${ i.name }</td>
            <td>${ i.opening && i.opening.total ? i.opening.total : "" }</td>
            <td>${ i.opening && i.opening.stoneWt ? (i.opening.stoneWt * 1).toFixed(3) : "" }</td>
            <td>${ i.opening && i.opening.grossWt ? (i.opening.grossWt * 1).toFixed(3) : "" }</td>
            <td>${ i.arrival && i.arrival.total ? i.arrival.total : "" }</td>
            <td>${ i.arrival && i.arrival.stoneWt ? (i.arrival.stoneWt * 1).toFixed(3) : "" }</td>
            <td>${ i.arrival && i.arrival.grossWt ? (i.arrival.grossWt * 1).toFixed(3) : "" }</td>
            <td>${ i.sold && i.sold.total ? i.sold.total : "" }</td>
            <td>${ i.sold && i.sold.stoneWt ? (i.sold.stoneWt * 1).toFixed(3) : "" }</td>
            <td>${ i.sold && i.sold.grossWt ? (i.sold.grossWt * 1).toFixed(3) : "" }</td>
            <td>${ i.delete && i.delete.total ? i.delete.total : "" }</td>
            <td>${ i.delete && i.delete.stoneWt ? (i.delete.stoneWt * 1).toFixed(3) : "" }</td>
            <td>${ i.delete && i.delete.grossWt ? (i.delete.grossWt * 1).toFixed(3) : "" }</td>
            <td>${ i.approval && i.approval.total ? i.approval.total : "" }</td>
            <td>${ i.approval && i.approval.stoneWt ? (i.approval.stoneWt * 1).toFixed(3) : "" }</td>
            <td>${ i.approval && i.approval.grossWt ? (i.approval.grossWt * 1).toFixed(3) : "" }</td>
            <td>${ i.closing && i.closing.total ? i.closing.total : "" }</td>
            <td>${ i.closing && i.closing.stoneWt ? (i.closing.stoneWt * 1).toFixed(3) : "" }</td>
            <td>${ i.closing && i.closing.grossWt ? (i.closing.grossWt * 1).toFixed(3) : "" }</td>
            <td>${ i.total && i.total.total ? i.total.total : "" }</td>
            <td>${ i.total && i.total.stoneWt ? (i.total.stoneWt * 1).toFixed(3) : "" }</td>
            <td>${ i.total && i.total.grossWt ? (i.total.grossWt * 1).toFixed(3) : "" }</td>
        </tr>
        `;
    }

    HTMLContent += `
    </tbody>
    `;
    table.innerHTML = HTMLContent;
}
buildTable();

function updateTable(ele) {
    for (let i of fullList) {
        if (i.name === ele.value)
            i.flag = ele.checked;
    }
    buildTable();
}