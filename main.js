import { renderWardrobe, wardrobeEvents } from "./utils/wardrobeUtils.js";
import { clothingItems, saveToStorage } from "./utils/storageUtils.js";

const uploadImage = document.getElementById("upload-image");
const imagePreview = document.getElementById("image-preview");
const clothingNameInput = document.querySelector("#clothing-name-input");
const clothingNameDisplay = document.querySelector(".clothing-name-display");
const addImageBtn = document.getElementById("add-image-btn");
const wardrobePreviewGrid = document.querySelector(".wardrobe-grid");
const category = document.getElementById("category-bar");

let imageUploaded = false;

renderWardrobe(wardrobePreviewGrid, clothingItems);
wardrobeEvents(wardrobePreviewGrid);

const handleImageUpload = (file) => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function () {
    imagePreview.src = reader.result;
    imageUploaded = true;
    clothingNameInput.value = "";
    clothingNameDisplay.innerText = "";
    category.value = "";
    clothingNameInput.focus();
    addImageBtn.disabled = false;
  };

  reader.readAsDataURL(file);
};

const addToArray = () => {
  //using unshift as to show recently added clothes first
  const newItem = {
    id: Date.now() + Math.random(), 
    image: imagePreview.src,
    name: clothingNameDisplay.innerText || "unnamed",
    category: category.value,
  };
  clothingItems.unshift(newItem);
};

const resetClothingEntry = () => {
  clothingNameInput.value = "";
  clothingNameDisplay.innerText = "";
  uploadImage.value = "";
  imagePreview.src = "";
  category.value = "";
  imageUploaded = false;
  addImageBtn.disabled = true;
};

//add clothes to wardobe & show some of clothes on the main page
const addToWardrobe = () => {
  if (!imagePreview.src.startsWith("data:image/")) return;

  addToArray();
  resetClothingEntry();

  saveToStorage("items", clothingItems);
  renderWardrobe(wardrobePreviewGrid, clothingItems);
  wardrobeEvents(wardrobePreviewGrid);
};

// runs a function whenever user choose a file
uploadImage.addEventListener("change", () => {
  const clothingImage = uploadImage.files[0];
  handleImageUpload(clothingImage);
});

clothingNameInput.addEventListener("input", () => {
  if (imageUploaded) {
    clothingNameDisplay.innerText = clothingNameInput.value.trim();
  }
});

addImageBtn.addEventListener("click", addToWardrobe);

