function calculateTotal() {
    let arr = document.querySelectorAll('.eachLineStone');
    let Total = 0;
    for (let i = 0; i < arr.length; i++) {
        let rate = arr[i].querySelector("#rate").value;
        let type = arr[i].querySelector("#rateType").value;
        let weight = arr[i].querySelector("#weight").value;
        weight = (weight * 1) === 0 ? 1 : weight;
        weight = type === "1" ? weight / 5 : type === "2" ? weight : 1;
        let temp = rate * weight;
        Total += ((temp * 1).toFixed(0) * 1);
        temp = new Intl.NumberFormat('en-IN').format((temp * 1).toFixed(0));
        arr[i].querySelector("#totalLinePrice").innerText = "₹ " + temp + " /-";
    }
    arr = document.querySelectorAll('.eachLineStock');
    let totalCHWt = 0;
    for (let i = 0; i < arr.length; i++) {
        let netWt = arr[i].querySelector("#netWt");
        let goldrate = inputGoldRate.value;
        let inputTounch = arr[i].querySelector("#inputTounch");
        let inputLabour = arr[i].querySelector("#inputLabour");
        let wholesaleMultiplier = arr[i].querySelector("#wholesaleMultiplier");
        let totalFine = arr[i].querySelector("#totalFine");
        let total = arr[i].querySelector("#total");
        tounchWt += inputTounch.value * netWt.value / 100;

        let tempFine = ((wholesaleMultiplier.value * 1) + (inputTounch.value * 1)) * netWt.value / 100;
        totalFine.innerText = (tempFine).toFixed(3) + " gm";
        totalCHWt += tempFine;
        let tempTotal = (goldrate * tempFine) + (inputLabour.value * netWt.value);
        total.innerText = (tempTotal).toFixed(0);
        Total += tempTotal;
        total.innerText = "₹ " + new Intl.NumberFormat('en-IN').format((total.innerText * 1).toFixed(0)) + " /-";
    }
    let netWtSum = 0;
    for (let i = 0; i < stockTable.length; i++) {
        netWtSum += stockTable[i].netWt;
    }
    document.getElementById('totalNetWt').innerText = new Intl.NumberFormat('en-IN').format((netWtSum * 1).toFixed(3)) + ' gm';
    document.getElementById('totalChargedWt').innerText = new Intl.NumberFormat('en-IN').format((totalCHWt * 1).toFixed(3)) + ' gm';
    document.getElementById('totalRate').innerText = '₹ ' + new Intl.NumberFormat('en-IN').format((Total * 1).toFixed(0)) + ' /-';
    document.getElementById('inputTotalWt').value = (totalCHWt * 1).toFixed(3);
    document.getElementById('inputTotalCash').value = (Total * 1).toFixed(0);
}
calculateTotal();
document.querySelector('form').addEventListener('submit', function () {
    let data = [];
    const rows = document.querySelectorAll('.eachLineStock, .eachLineStone');
    for (let row of rows) {
        let tounch = row.querySelector('input[name="tounch"]') && row.querySelector('input[name="tounch"]').value ? row.querySelector('input[name="tounch"]').value : 0;
        let labour = row.querySelector('input[name="labour"]') && row.querySelector('input[name="labour"]').value ? row.querySelector('input[name="labour"]').value : 0;
        let rate = row.querySelector('input[name="rate"]') && row.querySelector('input[name="rate"]').value ? row.querySelector('input[name="rate"]').value : 0;
        if (row.classList.contains('eachLineStock')) {
            data.push({ tounch, labour, rate: [] });
        } else if (data.length) {
            data[data.length - 1].rate.push(rate);
        }
    }
    document.querySelector('input[name="stoneTable"]').value = JSON.stringify(data);
});