import {
  outfits,
  saveToStorage,
  loadFromStorage,
} from "./utils/storageUtils.js";
import { handleEmptyGrid, search } from "./utils/wardrobeUtils.js";
import { incrementPlannedOutfitId } from "./utils/storageUtils.js";

const outfitsgrid = document.querySelector(".outfits-grid");
const searchInput = document.querySelector("#search");
let currentArray = outfits;

function showAssignPopup(message) {
  const popup = document.querySelector(".assign-popup");
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}

const renderOutfits = (array) => {
  currentArray = array;
  if (handleEmptyGrid(outfitsgrid, array)) return;

  let outfitHTML = "";

  array.forEach((outfit, index) => {
    outfitHTML += `
  <div class="outfit-container"
    data-outfit-id="${outfit.id}"
    data-outfit-index="${index}"
    style="width:${outfit.width}px; height:${outfit.height}px;">
`;
    outfit.images.forEach((img) => {
      outfitHTML += `
      <img class="image" src="${img.src}"
        style="position:absolute; top:${img.top}; left:${img.left};"
        alt="saved outfit"
      >
    `;
    });
    outfitHTML += `
      <p class="outfit-name">${outfit.name}</p>
     <div class="button-container">
         <button class="outfit-delete-btn"><i class="fa-solid fa-trash"></i></button>
         <button class="assign-btn"><i class="fa-solid fa-calendar-check"></i></button>

         <div class="modal">
            <input class="calendarInput" type="text" placeholder="Select a date">
            <button class="closeModal-btn">Close</button>
         </div>
      </div>
    </div>`;
  });

  outfitsgrid.innerHTML = outfitHTML;
};

renderOutfits(outfits);
search(searchInput, outfits, renderOutfits);

outfitsgrid.addEventListener("click", (e) => {
  const outfitContainer = e.target.closest(".outfit-container");
  if (!outfitContainer) return;

  const outfitId = parseInt(outfitContainer.dataset.outfitId);
  const outfit = currentArray.find(o => o.id === outfitId);
  
  if (!outfit) return;

  if (e.target.closest(".outfit-delete-btn")) {
    const outfitIndexInMain = outfits.findIndex((o) => o.id === outfitId);
    if (outfitIndexInMain > -1) {
      outfits.splice(outfitIndexInMain, 1);
      saveToStorage("outfit", outfits);
      
      if (currentArray === outfits) {
        renderOutfits(outfits);
      } else {
        const searchValue = document.querySelector("#search").value.trim().toLowerCase();
        if (searchValue) {
          const filteredArray = outfits.filter((outfit) =>
            outfit.name.toLowerCase().includes(searchValue)
          );
          renderOutfits(filteredArray);
        } else {
          renderOutfits(outfits);
        }
      }
    }
  }

  if (e.target.closest(".assign-btn")) {
    const buttonContainer = e.target.closest(".button-container");
    const modal = buttonContainer.querySelector(".modal");
    const calendarInput = modal.querySelector(".calendarInput");
    modal.classList.add("show");
    flatpickr(calendarInput, {
      dateFormat: "d-m-Y",
      onChange: function (selectedDates) {
        const outfitDiv = e.target.closest(".outfit-container");
        const outfitName = outfitDiv.querySelector(".outfit-name").innerHTML;

        const images = [...outfitDiv.querySelectorAll(".image")].map((img) => ({
          src: img.src,
          top: img.style.top,
          left: img.style.left,
        }));
        const plannedOutfits = loadFromStorage("plannedOutfit");
        const dateStr = selectedDates[0].toISOString().split("T")[0];
        const outfitsOnDate = plannedOutfits.filter(
          (o) => new Date(o.date).toISOString().split("T")[0] === dateStr
        );
        const formattedDate = flatpickr.formatDate(selectedDates[0], "d-m-Y");

        if (outfitsOnDate.length >= 3) {
          showAssignPopup("You’ve assigned maximum outfits for this date");
          modal.classList.remove("show");
          return;
        }

        plannedOutfits.push({
          id: incrementPlannedOutfitId(),
          name: outfitName,
          images: images,
          date: selectedDates[0],
        });

        saveToStorage("plannedOutfit", plannedOutfits);
        modal.classList.remove("show");
        showAssignPopup(`Outfit Assigned to ${formattedDate}`);
      },
    });
  }

  if (e.target.classList.contains("closeModal-btn")) {
    const buttonContainer = e.target.closest(".button-container");
    const modal = buttonContainer.querySelector(".modal");
    modal.classList.remove("show");
  }
});
