{
    function makeEle(data) {
        const title = `${data.prefix.name} ${data.ornament.name} ${data.tag ? `-${data.tag}` : ""}`;
        const stockTypeChip = `<span class="inline-block bg-gray-600 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">${data.stockType.name}</span>`;
        const trashColor = data.isInStock ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 opacity-70 cursor-not-allowed';
        return `
      <div class="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-indigo-500/40 flex flex-col transition duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer">
        <div class="slideshow-container relative w-full aspect-square bg-gray-700">
          <div class="slideshow absolute inset-0">
            ${data.stockImage && data.stockImage.length > 0
                ? data.stockImage.map((img, index) =>
                    `<img src="/uploads/${img.fileName}" alt="${title}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === 0 ? 'opacity-100' : 'opacity-0'}" loading="lazy">`
                ).join('')
                : `<div class="w-full h-full bg-gray-700 flex items-center justify-center"><i class="fa-solid fa-image text-5xl text-gray-500"></i></div>`
            }
          </div>
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
            <a href="/delFromCart/${data._id}" class="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-full text-white text-lg ${trashColor}">
              <i class="fa-solid fa-trash"></i>
            </a>
          </div>
        </div>
      </div>`;
    }

    function LoadTable() {
        const tableContainer = document.getElementById("stockTable");
        if (stockTable.length > 0) {
            tableContainer.innerHTML = stockTable.map(item => makeEle(item)).join('');
        } else {
            tableContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 py-16 text-lg">Your cart is empty.</p>`;
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
}