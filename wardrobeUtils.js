import { clothingItems, saveToStorage } from "./storageUtils.js";
import { outfits } from "./storageUtils.js";

let filteredItems;
let currentArray = clothingItems;

export function handleEmptyGrid(grid, array = clothingItems) {
  if (array.length === 0) {
    const box = document.createElement("div");
    //this condition checks for clothes in general
    if (array === clothingItems) {
      box.innerText =
        "Your Wadrobe is empty – Add some clothes to get started!";
    }
    //this condition check for when you filtered items
    else if (array === filteredItems) {
      box.innerText = "You don't have any items matching that category.";
    }
    //this condition check for outfits in saved Outfits page
    else if (array === outfits) {
      box.innerText =
        "You have no outfits saved – Create and save some outfits to get started!";
    } else {
      /*since I am calling renderWardrobe for three main arary the last one 
      remaining is array being passed while search so this checks for it */
      /*this one also works for when you call this function in renderOutfits and search for 
      outfits in search outfit page */
      box.innerText = "You don't have any items matching that keyword.";
    }
    box.classList.add("empty-message");
    grid.innerHTML = "";
    grid.appendChild(box);
    return true;
  }
  return false;
}

export const renderWardrobe = (grid, array = clothingItems) => {
  //this keeps track of which array being passed
  currentArray = array;
  if (handleEmptyGrid(grid, array)) return;

  let wardrobeHTML = "";

  array.forEach((item, index) => {
    const itemKey = `item_${item.id}`;
    wardrobeHTML += `
      <div class="item-container" data-item-key="${itemKey}" data-array-index="${index}"> 
        <img class="clothing-image" src="${item.image}" alt="saved clothe">
        <div class="edit-wrapper">
          <p class="item-name">${item.name}</p>
          <button class="edit-name-btn"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></button>
        </div>
        <div class="item-controls">
          <button class="delete-btn"> <i class="fa-solid fa-trash"></i></button>
          <input style="display: none;" type="file" name="" id="change-image-${index}"" accept="image/jpeg, image/png, image/jpg">
          <label for="change-image-${index}" class="edit-image"><i class="fa-solid fa-image"></i></label>
        </div>
      </div>
      `;
  });
  grid.innerHTML = wardrobeHTML;
};

export const wardrobeEvents = (grid, reapplyFilterCallback = null) => {
  let currentImage;
  let currentIndex = null;

  grid.addEventListener("click", (e) => {
    const container = e.target.closest(".item-container");
    if (!container) return;

    const itemKey = container.dataset.itemKey;
    if (!itemKey) return;

    const itemId = itemKey.split('_')[1];
    const item = currentArray.find(item => item.id == itemId);
    if (!item) return;

    //for deleting the item from wardrobe
    if (e.target.closest(".delete-btn")) {
      const mainIndex = clothingItems.findIndex(ci => ci.id == itemId);

      if (mainIndex > -1) {
        clothingItems.splice(mainIndex, 1);
        saveToStorage("items", clothingItems);

        if (currentArray === clothingItems) {
          renderWardrobe(grid, clothingItems);
        } else if (reapplyFilterCallback) {
          reapplyFilterCallback();
        } else {
          renderWardrobe(grid, clothingItems);
        }
      }
    }

    //for editing the item in wardrobe
    else if (e.target.closest(".edit-image")) {
      currentImage = container.querySelector("img");

      currentIndex = clothingItems.findIndex(ci => ci.id == itemId);
    }

    //for editing name of item
    else if (
      e.target.classList.contains("edit-name-btn") ||
      e.target.closest(".edit-name-btn")
    ) {
      const wrapper = e.target.closest(".edit-wrapper");
      const currentP = wrapper.querySelector(".item-name");
      const currentName = currentP.innerText;

      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("edit-name-input");
      input.value = currentName;

      wrapper.replaceChild(input, currentP);
      input.focus();

      function saveName() {
        const newName = input.value.trim() || currentName;

        const newP = document.createElement("p");
        newP.innerText = newName;
        newP.classList.add("item-name");

        wrapper.replaceChild(newP, input);

        const mainIndex = clothingItems.findIndex(
          (ci) => ci.id == itemId
        );
        if (mainIndex > -1) {
          clothingItems[mainIndex].name = newName;
          saveToStorage("items", clothingItems);
        }
      }

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          saveName();
        }
      });
      input.addEventListener("blur", saveName);
    }
  });

  grid.addEventListener("change", (e) => {
    if (e.target.type === "file") {
      const file = e.target.files[0];
      if (!file || !currentImage) return;

      const reader = new FileReader();
      reader.onload = () => {
        currentImage.src = reader.result;
        clothingItems[currentIndex].image = reader.result;
        saveToStorage("items", clothingItems);
      };
      reader.readAsDataURL(file);
    }
  });
};

//to view clothing items according to the category in which they were saved
export const filters = (filterButtons, grid) => {
  let currentFilter = "all";
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedFilter = button.dataset.category;
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class only to the clicked one
      button.classList.add("active");

      currentFilter = selectedFilter;

      if (selectedFilter === "all") {
        filteredItems = clothingItems;
      } else {
        filteredItems = clothingItems.filter(
          (item) => item.category === selectedFilter
        );
      }
      renderWardrobe(grid, filteredItems);
    });
  });

  return () => {
    if (currentFilter === "all") {
      renderWardrobe(grid, clothingItems);
    } else {
      const refiltered = clothingItems.filter(
        (item) => item.category === currentFilter
      );
      renderWardrobe(grid, refiltered);
    }
  };
};

// function to search for specific itmes/outfits
export const search = (inputElement, array, renderFunc) => {
  inputElement.addEventListener("input", (e) => {
    const value = e.target.value.trim().toLowerCase();

    const filteredItems = array.filter((item) =>
      item.name.toLowerCase().includes(value)
    );
    renderFunc(filteredItems);
  });
};
