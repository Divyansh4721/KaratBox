function makePrintTable(stockTable) {
    let data = `<table border="1" id="printTable" hidden>
<thead>
    <tr class="bold backgroundDark">
        <td>S. No</td>
        <td>SKU</td>
        <td>Tag No</td>
        <td>Purity</td>
        <td>Gross Wt</td>
        <td>Net Wt</td>
        <td>Stone Wt<br>(In gms)</td>
        <td>Stone Wt<br>(In ct)</td>
        <td>Stock<br>Type</td>
    </tr>
</thead>
<tbody>
`;
    for (let i = 0; i < stockTable.length; i++) {
        data += `
    <tr>
        <td>${(i + 1)}</td>
        <td>${stockTable[i].index}</td>
        <td>${stockTable[i].prefix.name + " " + stockTable[i].ornament.name + (stockTable[i].tag ? ("-" + stockTable[i].tag) : "")}</td>
        <td>${stockTable[i].purity.name}</td>
        <td>${stockTable[i].grossWt.toFixed(3)}</td>
        <td>${stockTable[i].netWt.toFixed(3)}</td>
        <td>${stockTable[i].stoneWt.toFixed(3)}</td>
        <td>${(stockTable[i].stoneWt * 5).toFixed(3)}</td>
        <td>${stockTable[i].stockType.name}</td>
    </tr>
`;
    }
    data += `
    <tr class="bold backgroundDark">
        <td>${stockTable.length}</td>
        <td></td>
        <td>Total</td>
        <td></td>
        <td>${(stockTable.reduce((total, item) => total + (item.grossWt * 1), 0)).toFixed(3)}</td>
        <td>${(stockTable.reduce((total, item) => total + (item.netWt * 1), 0)).toFixed(3)}</td>
        <td>${(stockTable.reduce((total, item) => total + (item.stoneWt * 1), 0)).toFixed(3)}</td>
        <td>${(stockTable.reduce((total, item) => total + (item.stoneWt * 5), 0)).toFixed(3)}</td>
        <td></td>
    </tr>
        <tr>
            <td colspan="3" style="vertical-align: top;">
                <table border="1" style="width: 100%;" hidden>
                    <tr>
                        <th colspan="3">Stone Summary</th>
                    </tr>
                    <tr>
                        <th>Type</th>
                        <th>Gram</th>
                        <th>Carat</th>
                    </tr>
`;
    let stoneTableData = {};
    for (let item of stockTable) {
        for (let stone of item.stoneTable) {
            stoneTableData[stone.type.name] = {
                ctWeight: 0,
                gmWeight: 0,
            };
        }
    }
    stoneTableData["Total"] = {
        ctWeight: 0,
        gmWeight: 0,
    };
    for (let item of stockTable) {
        for (let stone of item.stoneTable) {
            stoneTableData[stone.type.name].ctWeight += (stone.ctWeight * 1);
            stoneTableData[stone.type.name].gmWeight += (stone.ctWeight / 5);
            stoneTableData["Total"].ctWeight += (stone.ctWeight * 1);
            stoneTableData["Total"].gmWeight += (stone.ctWeight / 5);
        }
    }
    let keys = Object.keys(stoneTableData);
    for (let i of keys) {
        data += `
                    <tr>
                        <td>${i}</td>
                        <td>${stoneTableData[i].gmWeight.toFixed(3)}</td>
                        <td>${stoneTableData[i].ctWeight.toFixed(3)}</td>
                    </tr>
    `;
    }
    data += `
                </table>
            </td>
            <td colspan="4" style="vertical-align: top;">
                <table border="1" style="width: 100%;" hidden>
                    <tr>
                        <th colspan="4">Item Summary</th>
                    </tr>
                    <tr>
                        <th>Item</th>
                        <th>Count</th>
                        <th>Item</th>
                        <th>Count</th>
                    </tr>
`;
    let itemTable = {};
    for (let item of stockTable) {
        itemTable[item.stockType.name] = 0;
    }
    for (let item of stockTable) {
        itemTable[item.stockType.name]++;
    }
    keys = Object.keys(itemTable);
    for (let i = 0; i < keys.length; i += 2) {
        data += `
                    <tr>
                        <td>${keys[i]}</td>
                        <td>${itemTable[keys[i]]}</td>
                        <td>${(keys[i + 1]) ? keys[i + 1] : ""}</td>
                        <td>${(itemTable[keys[i + 1]]) ? itemTable[keys[i + 1]] : ""}</td>
                    </tr>
    `;
    }
    data += `
                </table>
            </td>
        </tr>
    </tbody>
</table>
`;
    $("#printTable")[0].outerHTML = data;
}
function makeEle(data) {
    const title = `${data.prefix.name} ${data.ornament.name} ${data.tag ? `-${data.tag}` : ""}`;
    const stockTypeChip = `<span class="inline-block bg-gray-600 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">${data.stockType.name}</span>`;
    const cartButtonBg = data.isInStock ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 cursor-not-allowed opacity-50';
    const cartIcon = data.isInStock ? '<i class="fa-solid fa-cart-plus"></i>' : '<i class="fa-solid fa-times"></i>';
    const cartAction = data.isInStock ? `onclick="event.stopPropagation(); AddToCart('${data._id}')"` : 'disabled';
    let imagesHTML = '';
    if (data.stockImage && data.stockImage.length > 0) {
        imagesHTML = data.stockImage.map((img, index) =>
            `<img src="/uploads/${img.fileName}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}" loading="lazy">`
        ).join('');
    } else {
        imagesHTML = `<div class="w-full h-full bg-gray-700 flex items-center justify-center"><i class="fa-solid fa-image text-5xl text-gray-500"></i></div>`;
    }
    return `
            <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/40 flex flex-col transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer" onclick="window.location.href = '/stock/${data._id}';">
                <div class="slideshow-container relative w-full aspect-square bg-gray-700">
                    <div class="slideshow absolute inset-0">${imagesHTML}</div>
                </div>
                <div class="p-4 flex flex-col flex-grow">
                    <div class="flex-grow">
                        <div class="flex justify-between items-start gap-2">
                            <h3 class="font-bold text-gray-100 flex-1" title="${title}">${title}</h3>
                            ${stockTypeChip}
                        </div>
                        <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-400">
                            <span>Gross Wt:</span> <span class="text-right font-medium text-gray-300">${(data.grossWt * 1).toFixed(3)}g</span>
                            <span>Net Wt:</span> <span class="text-right font-medium text-gray-300">${(data.netWt * 1).toFixed(3)}g</span>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center gap-4">
                        <div class="text-xl font-bold text-indigo-400">
                            ₹ ${new Intl.NumberFormat('en-IN').format(Math.round(data.sellingPrice))}
                        </div>
                        <button type="button" ${cartAction} class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full text-white text-lg ${cartButtonBg} transition-all">
                            ${cartIcon}
                        </button>
                    </div>
                </div>
            </div>`;
}
function AddToCart(id) {
    $.ajax({
        type: 'get',
        url: '/addToCart?index=' + id,
        success: function (data) {
            new Noty({
                theme: 'nest',
                text: data.message,
                type: data.status,
                layout: 'topCenter',
                timeout: 1500
            }).show();
        },
        error: function (err) {
            console.error(err.responseText);
        }
    });
}
function sortByProperty(property, n) {
    return function (a, b) {
        if (a[property] > b[property]) return n * 1;
        else if (a[property] < b[property]) return n * -1;
        return 0;
    }
}
function LoadTable() {
    let data = [...stockTable];
    if (document.getElementById("checkbox").checked) {
        data = data.filter(item => item.isInStock);
    }
    data.forEach(item => item.stockType1 = item.stockType.name);
    const sortValue = document.getElementById("sortOrder").value;
    data.sort(sortByProperty(sortValue, 1));
    makePrintTable(data);
    const tableContainer = document.getElementById("stockTable");
    if (data.length > 0) {
        tableContainer.innerHTML = data.map(item => makeEle(item)).join('');
    } else {
        tableContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 py-16 text-lg">No items found matching your criteria.</p>`;
    }
}
function SlideShow() {
    const slideshows = document.querySelectorAll(".slideshow");
    slideshows.forEach(slideshow => {
        if (slideshow._intervalId) clearInterval(slideshow._intervalId);
    });
    slideshows.forEach(slideshow => {
        const images = slideshow.querySelectorAll("img");
        if (images.length > 1) {
            let currentIndex = 0;
            slideshow._intervalId = setInterval(() => {
                images[currentIndex].classList.remove('opacity-100');
                images[currentIndex].classList.add('opacity-0');
                currentIndex = (currentIndex + 1) % images.length;
                images[currentIndex].classList.remove('opacity-0');
                images[currentIndex].classList.add('opacity-100');
            }, 3000);
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    LoadTable();
    SlideShow();
});