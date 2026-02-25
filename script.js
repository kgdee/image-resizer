const projectName = "image-resizer";
const fileInput = document.getElementById("file-input");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const unitSelect = document.querySelector(".unit-select select");
const ratioInput = document.getElementById("ratio-input");
const preview = document.querySelector(".preview img");

let currentFile = null;
let originalImage = new Image();
let resizedImage = null;
let aspectRatio = 1;
let selectedUnit = load("selectedUnit", "px");
let lockRatio = load("lockRatio", true);

document.addEventListener("DOMContentLoaded", () => {
  unitSelect.value = selectedUnit;
  ratioInput.checked = lockRatio;
});

unitSelect.addEventListener("change", () => {
  selectedUnit = unitSelect.value;
  save("selectedUnit", selectedUnit);

  if (!currentFile) return;

  const originalWidth = originalImage.naturalWidth;
  const originalHeight = originalImage.naturalHeight;
  let width = parseFloat(widthInput.value || originalWidth);
  let height = parseFloat(heightInput.value || originalHeight);

  if (selectedUnit === "%") {
    // Convert px → %
    widthInput.value = ((width / originalWidth) * 100).toFixed(0);
    heightInput.value = ((height / originalHeight) * 100).toFixed(0);
  } else if (selectedUnit === "px") {
    // Convert % → px
    widthInput.value = ((width / 100) * originalWidth).toFixed(0);
    heightInput.value = ((height / 100) * originalHeight).toFixed(0);
  }
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  currentFile = file;
  originalImage.src = await getFileDataUrl(file);
});

originalImage.onload = () => {
  aspectRatio = originalImage.width / originalImage.height;
  preview.src = originalImage.src;

  if (selectedUnit === "px") {
    widthInput.value = originalImage.naturalWidth;
    heightInput.value = originalImage.naturalHeight;
  } else if (selectedUnit === "%") {
    widthInput.value = 100;
    heightInput.value = 100;
  }
};

widthInput.addEventListener("input", () => {
  adjustHeight();
});

heightInput.addEventListener("input", () => {
  adjustWidth();
});

ratioInput.addEventListener("change", () => {
  lockRatio = ratioInput.checked;
  save("lockRatio", lockRatio);

  adjustHeight();
});

function adjustWidth() {
  if (!ratioInput.checked || !originalImage.src) return;

  if (selectedUnit === "px") {
    widthInput.value = Math.round(heightInput.value * aspectRatio);
  } else if (selectedUnit === "%") {
    widthInput.value = heightInput.value;
  }
}

function adjustHeight() {
  if (!ratioInput.checked || !originalImage.src) return;

  if (selectedUnit === "px") {
    heightInput.value = Math.round(widthInput.value / aspectRatio);
  } else if (selectedUnit === "%") {
    heightInput.value = widthInput.value;
  }
}

function resize() {
  if (!currentFile) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const unit = unitSelect.value; // "px" or "%"
  let newWidth, newHeight;

  if (unit === "px") {
    // Direct pixel values
    newWidth = parseInt(widthInput.value, 10);
    newHeight = parseInt(heightInput.value, 10);
  } else if (unit === "%") {
    // Percentage based on original image size
    const percentWidth = parseFloat(widthInput.value) / 100;
    const percentHeight = parseFloat(heightInput.value) / 100;

    newWidth = originalImage.naturalWidth * percentWidth;
    newHeight = originalImage.naturalHeight * percentHeight;
  }

  canvas.width = newWidth;
  canvas.height = newHeight;

  ctx.drawImage(originalImage, 0, 0, newWidth, newHeight);

  resizedImage = canvas.toDataURL("image/png");
  preview.src = resizedImage;
}

async function download() {
  if (!currentFile || !resizedImage) return;

  const a = document.createElement("a");
  a.href = resizedImage;
  a.download = `resized_${currentFile.name}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(resizedImage);
}
