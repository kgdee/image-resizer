const fileInput = document.getElementById("file-input");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const ratioInput = document.getElementById("ratio-input");
const preview = document.querySelector(".preview img");

let currentFile = null;
let originalImage = new Image();
let resizedImage = null;
let aspectRatio = 1;

function getFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  currentFile = file;
  originalImage.src = await getFileDataUrl(file);
});

originalImage.onload = () => {
  widthInput.value = originalImage.width;
  heightInput.value = originalImage.height;
  aspectRatio = originalImage.width / originalImage.height;
  preview.src = originalImage.src;
};

widthInput.addEventListener("input", () => {
  if (ratioInput.checked) {
    heightInput.value = Math.round(widthInput.value / aspectRatio);
  }
});

heightInput.addEventListener("input", () => {
  if (ratioInput.checked) {
    widthInput.value = Math.round(heightInput.value * aspectRatio);
  }
});

ratioInput.addEventListener("change", () => {
  if (!ratioInput.checked || !originalImage.src) return;

  heightInput.value = Math.round(widthInput.value / aspectRatio);
});

function resize() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = widthInput.value;
  canvas.height = heightInput.value;

  ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

  resizedImage = canvas.toDataURL("image/png");
  preview.src = resizedImage;
}

function download() {
  const link = document.createElement("a");
  link.download = `resized_${currentFile.name}`;
  link.href = resizedImage;
  link.click();
}
