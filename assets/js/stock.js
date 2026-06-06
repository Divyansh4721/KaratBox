function isMobile() {
    let userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let isUserAgentMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    return isUserAgentMobile || isTouchDevice;
}
let cameraInitialized = false;
async function checkCameraPermissionAndInit() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.getElementById('windowCapture').style.display = "none";
        console.warn("Camera access not available");
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: isMobile() ? { ideal: 'environment' } : undefined
            }
        });
        stream.getTracks().forEach(track => track.stop());
        await initializeCamera();
        cameraInitialized = true;
        document.getElementById('cameraSelect').parentNode.style.display = 'block';
    } catch (error) {
        if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
            addCameraActivationButton();
        } else {
            document.getElementById('windowCapture').style.display = "none";
            console.warn("Camera access not available:", error.message);
        }
    }
}
checkCameraPermissionAndInit();
let totalRowCount = 0;
function AddRow() {
    let row = `
        <div class="bg-[#272c35] rounded-lg border border-[#000000] shadow-sm shadow-[#708090]/20 p-4" id="${"TableRow" + totalRowCount}" onchange="ConvertWeightToCT(${totalRowCount});calculateWeight();">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-[#dfe1e4] flex items-center">
                    <i class="fas fa-diamond mr-2 text-[#01e8ee]"></i>
                    Stone ${totalRowCount + 1}
                </h3>
                <button type="button" onclick="DeleteRow('${"TableRow" + totalRowCount}');" class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors flex items-center text-sm">
                    <i class="fas fa-trash mr-1"></i>
                    Delete
                </button>
            </div>
            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-[#dfe1e4]">
                        Stone Type <span class="text-red-500">*</span>
                    </label>
                    <select name="stoneType[]" class="stoneTabletoneType w-full px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent hover:bg-[#c9cacc]" required>
                        <option value="">Select Stone Type...</option>`;
    for (let i of stoneTypeTable) {
        row += `<option value="${i._id}">${i.name}</option>`;
    }
    row += `
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-[#dfe1e4]">
                        Stone Dealer
                    </label>
                    <select name="stoneDealer[]" class="stoneTableStoneDealer w-full px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent hover:bg-[#c9cacc]">
                        <option value="">Select Stone Dealer...</option>`;
    for (let i of stoneDealerTable) {
        row += `<option value="${i._id}">${i.name}</option>`;
    }
    row += `
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-[#dfe1e4]">
                        Stone Weight <span class="text-red-500">*</span>
                    </label>
                    <div class="flex flex-row gap-2">
                        <input type="number" step="0.001" placeholder="Weight..." class="dummyStoneTableWeight flex-1 w-[70%] px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] placeholder-[#989797] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent hover:bg-[#c9cacc]" required>
                        <input type="number" step="0.001" name="stoneWeight[]" class="stoneTableWeight" required hidden>
                        <select class="selectWeight px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent w-[30%] hover:bg-[#c9cacc]">
                            <option value="1">Gram</option>
                            <option value="2" selected>Carat</option>
                        </select>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-[#dfe1e4]">
                        Purchase Rate
                    </label>
                    <div class="flex flex-row gap-2">
                        <input type="number" placeholder="Purchase Rate..." class="dummyStoneTablePurchaseRate flex-1 w-[70%] px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] placeholder-[#989797] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent hover:bg-[#c9cacc]">
                        <input type="number" name="purchaseRate[]" class="stoneTablePurchaseRate" hidden>
                        <select class="selectPurchaseRate px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent w-[30%] hover:bg-[#c9cacc]">
                            <option value="1">per Gram</option>
                            <option value="2" selected>per Carat</option>
                            <option value="3">Whole Price</option>
                        </select>
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-[#dfe1e4]">
                        Sell Rate <span class="text-red-500">*</span>
                    </label>
                    <div class="flex flex-row gap-2">
                        <input type="number" placeholder="Sell Rate..." class="dummyStoneTableSellRate flex-1 w-[70%] px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] placeholder-[#989797] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent hover:bg-[#c9cacc]" required>
                        <input type="number" name="sellRate[]" class="stoneTableSellRate" required hidden>
                        <select class="selectSellRate px-3 py-2 text-sm border border-[#000000] rounded-lg bg-[#dfe1e4] text-[#000000] focus:ring-2 focus:ring-[#01e8ee] focus:border-transparent w-[30%] hover:bg-[#c9cacc]">
                            <option value="1">per Gram</option>
                            <option value="2" selected>per Carat</option>
                            <option value="3">Whole Price</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    `;
    totalRowCount++;
    document.getElementById("stoneRow").insertAdjacentHTML('beforeend', row);
}
function DeleteRow(id) {
    document.getElementById(id).remove();
    calculateWeight();
}
let data = new FormData();
var dataTransfer = new DataTransfer();
function buildTable() {
    const container = document.getElementById('imagePreviews').querySelector('#tbody');
    container.innerHTML = "";
    for (let i = 0; i < dataTransfer.files.length; i++) {
        let reader = new FileReader();
        const imageRow = document.createElement('div');
        imageRow.className = 'flex items-center space-x-3 p-3 bg-[#272c35] rounded-lg border border-[#000000]';
        imageRow.innerHTML = `
            <span class="text-sm font-medium text-[#dfe1e4] w-8">${i + 1}</span>
            <div id="ImageRow${i}" class="flex-1">
                <img src="" class="w-20 h-20 object-cover rounded-lg border border-[#000000]">
            </div>
            <div class="flex space-x-2">
                <button type="button" onclick="ImageMove(${i},-1)" class="p-2 text-[#01e8ee] hover:bg-[#503ce8]/20 rounded-lg transition-colors" ${i === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button type="button" onclick="ImageMove(${i},1)" class="p-2 text-[#01e8ee] hover:bg-[#503ce8]/20 rounded-lg transition-colors" ${i === dataTransfer.files.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button type="button" onclick="ImageDel(${i})" class="p-2 text-red-600 hover:bg-red-600/20 rounded-lg transition-colors">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(imageRow);
        reader.onload = function (e) {
            document.getElementById(`ImageRow${i}`).querySelector('img').src = e.target.result;
        }
        reader.readAsDataURL(dataTransfer.files[i]);
    }
}
function AddImage() {
    let reader = new FileReader();
    reader.onload = function (loadEvent) {
        let img = new Image();
        img.onload = function () {
            let imgSize = Math.min(img.width, img.height);
            let startX = (img.width - imgSize) / 2;
            let startY = (img.height - imgSize) / 2;
            let canvas = document.getElementById('canvas');
            let context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, startX, startY, imgSize, imgSize, 0, 0, canvas.width, canvas.height);
            let dataUrl = canvas.toDataURL('image/png');
            let byteString = atob(dataUrl.split(',')[1]);
            let mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            let ab = new ArrayBuffer(byteString.length);
            let ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            let blob = new Blob([ab], {
                type: mimeString
            });
            let file = new File([blob], "video_frame.png", {
                type: "image/png"
            });
            dataTransfer.items.add(file);
            document.getElementById('stockImage').files = dataTransfer.files;
            buildTable();
        };
        img.src = loadEvent.target.result;
    };
    reader.readAsDataURL(document.getElementById('imageButton').files[0]);
}
function ImageMove(index, dir) {
    if (index === 0 && dir === -1) {
        return;
    } else if (index === dataTransfer.files.length - 1 && dir === 1) {
        return;
    } else {
        let temp = new DataTransfer();
        let x = Math.min(index, index + dir);
        for (let i = 0; i < dataTransfer.files.length; i++) {
            if (i === x) {
                temp.items.add(dataTransfer.files[i + 1]);
                temp.items.add(dataTransfer.files[i]);
                i++;
            } else {
                temp.items.add(dataTransfer.files[i]);
            }
        }
        dataTransfer = temp;
        document.getElementById('stockImage').files = dataTransfer.files;
        buildTable();
    }
}
function ImageDel(index) {
    dataTransfer.items.remove(index);
    document.getElementById('stockImage').files = dataTransfer.files;
    buildTable();
}
let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let captureButton = document.getElementById('capture');
let cameraSelect = document.getElementById('cameraSelect');
async function getAvailableCameras() {
    let devices = await navigator.mediaDevices.enumerateDevices();
    let cameras = devices.filter(device => device.kind === 'videoinput');
    return cameras;
}
async function setCamera(deviceId) {
    try {
        const constraints = {
            video: {
                deviceId: deviceId ? { exact: deviceId } : undefined,
                facingMode: isMobile() ? { ideal: 'environment' } : undefined,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        if (isMobile()) {
            video.setAttribute('playsinline', true);
            video.setAttribute('webkit-playsinline', true);
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        if (error.name === 'NotAllowedError') {
            alert('Camera access denied. Please allow camera permissions and refresh the page.');
        } else if (error.name === 'NotFoundError') {
            alert('No camera found on this device.');
        } else if (error.name === 'NotSupportedError') {
            alert('Camera not supported on this device.');
        } else {
            alert('Error accessing camera: ' + error.message);
        }
    }
}
async function populateCameraOptions() {
    let cameras = await getAvailableCameras();
    cameraSelect.innerHTML = '';
    cameras.forEach(camera => {
        let option = document.createElement('option');
        option.value = camera.deviceId;
        option.text = camera.label || `Camera ${cameraSelect.length + 1}`;
        cameraSelect.appendChild(option);
    });
}
async function initializeCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: isMobile() ? { ideal: 'environment' } : undefined
            }
        });
        stream.getTracks().forEach(track => track.stop());
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        if (cameras.length === 0) {
            throw new Error('No cameras found');
        }
        await populateCameraOptions();
        if (isMobile()) {
            const backCamera = cameras.find(camera =>
                camera.label.toLowerCase().includes('back') ||
                camera.label.toLowerCase().includes('rear') ||
                camera.label.toLowerCase().includes('environment')
            );
            await setCamera(backCamera ? backCamera.deviceId : cameras[0].deviceId);
        } else {
            await setCamera(cameraSelect.value);
        }
    } catch (error) {
        console.error('Error initializing camera:', error);
        if (error.name === 'NotAllowedError') {
            alert('Camera access denied. Please allow camera permissions in your browser settings and try again.');
        } else if (error.name === 'NotFoundError') {
            alert('No camera found on this device.');
        } else if (error.name === 'NotSupportedError') {
            alert('Camera not supported on this device.');
        } else {
            alert('Error accessing camera: ' + error.message);
        }
        throw error;
    }
}
cameraSelect.addEventListener('change', async () => {
    if (cameraInitialized) {
        await setCamera(cameraSelect.value);
    }
});
captureButton.addEventListener('click', () => {
    if (!cameraInitialized) {
        alert('Please enable camera first');
        return;
    }
    let imgSize = Math.min(video.videoWidth, video.videoHeight);
    let startX = (video.videoWidth - imgSize) / 2;
    let startY = (video.videoHeight - imgSize) / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, startX, startY, imgSize, imgSize, 0, 0, canvas.width, canvas.height);
    let dataUrl = canvas.toDataURL('image/png');
    let byteString = atob(dataUrl.split(',')[1]);
    let mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], {
        type: mimeString
    });
    let file = new File([blob], "camera_capture_" + Date.now() + ".png", {
        type: "image/png"
    });
    dataTransfer.items.add(file);
    document.getElementById('stockImage').files = dataTransfer.files;
    buildTable();
});
if (stock.tag) {
    let temp = indexTable.find(item => item.prefix === stock.prefix && item.ornament === stock.ornament);
    temp.available = temp.available.filter(obj => obj != stock.tag);
}
function makeTag() {
    let prefix = document.querySelector("select[name='prefix']").value;
    let ornament = document.querySelector("select[name='ornament']").value;
    if (ornament) {
        let availableArr = indexTable.find(item => item.prefix === prefix && item.ornament === ornament).available;
        let tagnumber = availableArr.length ? availableArr.length + 1 : 1;
        if (availableArr.length) {
            availableArr.sort((a, b) => a - b);
            for (let i = 1; i <= availableArr.length; i++) {
                if (availableArr[i - 1] !== i) {
                    tagnumber = i;
                    break;
                }
            }
        }
        document.querySelector("input[name='tag']").value = tagnumber;
    }
}
function calculateWeight() {
    let grossWt = document.querySelector("input[name='grossWt']").value;
    let stoneWeights = document.getElementsByClassName("stoneTableWeight");
    let totalWeight = 0;
    for (let i = 0; i < stoneWeights.length; i++) {
        totalWeight += (stoneWeights[i].value * 1);
    }
    document.querySelector("input[name='netWt']").value = (grossWt - (totalWeight / 5)).toFixed(3);
    document.querySelector("input[name='stoneWt']").value = (totalWeight / 5).toFixed(3);
}
function ConvertWeightToCT(x) {
    let wt = document.getElementsByClassName("dummyStoneTableWeight")[x];
    let option = document.getElementsByClassName("selectWeight")[x];
    if (option.value === "1")
        document.getElementsByClassName("stoneTableWeight")[x].value = (wt.value * 5).toFixed(3);
    else
        document.getElementsByClassName("stoneTableWeight")[x].value = wt.value;
    wt = document.getElementsByClassName("dummyStoneTablePurchaseRate")[x];
    option = document.getElementsByClassName("selectPurchaseRate")[x];
    if (option.value === "1")
        document.getElementsByClassName("stoneTablePurchaseRate")[x].value = (wt.value * (document.getElementsByClassName("stoneTableWeight")[x].value != 0 ? 5 : 1)).toFixed(0);
    else if (option.value === "2")
        document.getElementsByClassName("stoneTablePurchaseRate")[x].value = wt.value;
    else
        document.getElementsByClassName("stoneTablePurchaseRate")[x].value = (wt.value / (document.getElementsByClassName("stoneTableWeight")[x].value != 0 ? document.getElementsByClassName("stoneTableWeight")[x].value : 1)).toFixed(0);
    wt = document.getElementsByClassName("dummyStoneTableSellRate")[x];
    option = document.getElementsByClassName("selectSellRate")[x];
    if (option.value === "1")
        document.getElementsByClassName("stoneTableSellRate")[x].value = (wt.value * (document.getElementsByClassName("stoneTableWeight")[x].value != 0 ? 5 : 1)).toFixed(0);
    else if (option.value === "2")
        document.getElementsByClassName("stoneTableSellRate")[x].value = wt.value;
    else
        document.getElementsByClassName("stoneTableSellRate")[x].value = (wt.value / (document.getElementsByClassName("stoneTableWeight")[x].value != 0 ? document.getElementsByClassName("stoneTableWeight")[x].value : 1)).toFixed(0);
}
async function AddEditImage(url) {
  try {
    const img = await new Promise((resolve, reject) => {
      const temp = new Image();
      temp.crossOrigin = "anonymous";
      temp.onload = () => resolve(temp);
      temp.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      temp.src = url;
    });
    const imgSize = Math.min(img.width, img.height);
    const startX = (img.width - imgSize) / 2;
    const startY = (img.height - imgSize) / 2;
    const canvas = document.getElementById("canvas");
    if (!canvas) throw new Error("Canvas element with id 'canvas' not found.");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2D context not available on canvas.");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, startX, startY, imgSize, imgSize, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error("canvas.toBlob returned null"));
      }, "image/png");
    });
    const file = new File([blob], "video_frame.png", {
      type: "image/png"
    });
    dataTransfer.items.add(file);
    const stockInput = document.getElementById("stockImage");
    if (!stockInput) throw new Error("Input element with id 'stockImage' not found.");
    stockInput.files = dataTransfer.files;
    if (typeof buildTable === "function") {
      const result = buildTable();
      if (result instanceof Promise) {
        await result;
      }
    }
  } catch (err) {
    console.error("AddEditImage error:", err);
  }
}