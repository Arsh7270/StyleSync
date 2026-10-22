import { filters, renderWardrobe } from "./utils/wardrobeUtils.js";
import {
  outfits,
  saveToStorage,
  loadFromStorage,
  incrementPlannedOutfitId,
} from "./utils/storageUtils.js";

const wardrobeGrid = document.querySelector(".wardrobe-grid");
const outfitCanvas = document.querySelector(".outfit-canvas");
const saveBtn = document.querySelector("#save-btn");
const filterButtons = document.querySelectorAll("#filter-buttons button");
const outfitName = document.querySelector(".outfit-name");
const assignBtn = document.querySelector("#assign-btn");
const calendarInput = document.getElementById("calendarInput");
const modal = document.getElementById("calendarModal");
const closeModalBtn = document.getElementById("closeModal-btn");
const clearCanvasButton = document.getElementById("clear-canvas-btn");

let outfitId = JSON.parse(localStorage.getItem("outfitId")) || 1;

renderWardrobe(wardrobeGrid);
filters(filterButtons, wardrobeGrid);

function addImageToCanvas(src, canvas) {
  const container = document.createElement("div");
  container.classList.add("canvas-image-container");

  const newImg = document.createElement("img");
  newImg.src = src;
  newImg.classList.add("canvas-image");

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = `<i class="fa fa-trash"></i>`;
  deleteButton.classList.add("canvas-delete-btn");

  container.appendChild(newImg);
  container.appendChild(deleteButton);
  canvas.appendChild(container);

  const canvasRect = canvas.getBoundingClientRect();
  const maxLeft = canvasRect.width - newImg.offsetWidth - 20;
  const maxTop = canvasRect.height - newImg.offsetHeight - 20;

  container.style.top = Math.random() * maxTop + "px";
  container.style.left = Math.random() * maxLeft + "px";

  deleteButton.addEventListener("click", () => {
    container.remove();
  });
}

function dragCloth(e) {
  if (e.target.closest(".canvas-delete-btn")) {
    return;
  }
  
  if (e.target.closest(".canvas-image-container")) {
    const container = e.target.closest(".canvas-image-container");

    const canvasPosition = outfitCanvas.getBoundingClientRect();

    const startX = e.clientX - container.offsetLeft;
    const startY = e.clientY - container.offsetTop;

    function mouseMove(e) {
      let newX = e.clientX - startX;
      let newY = e.clientY - startY;

      //for images to not go out of outfit canvas while dragging
      if (newX < 0) newX = 0;
      if (newY < 0) newTop = 0;
      if (newX + container.offsetWidth > canvasPosition.width) {
        newX = canvasPosition.width - container.offsetWidth - 20;
      }
      if (newY + container.offsetHeight > canvasPosition.height) {
        newY = canvasPosition.height - container.offsetHeight - 20;
      }

      container.style.left = newX + "px";
      container.style.top = newY + "px";
    }
    function mouseUp() {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    }
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  }
}

function getCanvasImages() {
  return [...outfitCanvas.querySelectorAll(".canvas-image-container")].map(
    (container) => {
      const img = container.querySelector("img");
      return {
        src: img.src,
        top: container.style.top,
        left: container.style.left,
      };
    }
  );
}

function showAssignPopup(message) {
  const popup = document.querySelector(".assign-popup");
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 2000);
}

//Add that clothe to canvas from wardrobe which you clicked
wardrobeGrid.addEventListener("click", (e) => {
  if (e.target.tagName === "IMG") {
    addImageToCanvas(e.target.src, outfitCanvas);
  }
});

outfitCanvas.addEventListener("mousedown", (e) => {
  dragCloth(e);
});

//for saving created outfits
saveBtn.addEventListener("click", () => {
  if (outfitCanvas.querySelectorAll(".canvas-image").length === 0) {
    showAssignPopup(
      "Your outfit canvas is empty. Add some clothes before saving an outfit."
    );
    return;
  }

  const images = getCanvasImages();
  const outfitContainerWidth = outfitCanvas.offsetWidth;
  const outfitContainerHeight = outfitCanvas.offsetHeight;

  outfits.push({
    id: outfitId++,
    name: outfitName.value,
    images: images,
    width: outfitContainerWidth,
    height: outfitContainerHeight,
  });

  saveToStorage("outfit", outfits);
  localStorage.setItem("outfitId", JSON.stringify(outfitId));
  outfitCanvas.innerHTML = "";
  outfitCanvas.appendChild(clearCanvasButton);
  outfitName.value = "";
});

//Assign the created outfits to a specific date
assignBtn.addEventListener("click", () => {
  modal.classList.add("show");

  flatpickr(calendarInput, {
    dateFormat: "d-m-Y",
    onChange: function (selectedDates) {
      if (outfitCanvas.querySelectorAll(".canvas-image").length === 0) {
        showAssignPopup(
          "Your outfit canvas is empty. Add some clothes before assigning an outfit."
        );
        modal.classList.remove("show");
        return;
      }

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

      const images = getCanvasImages();

      const outfitContainerWidth = outfitCanvas.offsetWidth;
      const outfitContainerHeight = outfitCanvas.offsetHeight;

      plannedOutfits.push({
        id: incrementPlannedOutfitId(),
        name: outfitName.value,
        images: images,
        date: selectedDates[0],
        width: outfitContainerWidth,
        height: outfitContainerHeight,
      });

      saveToStorage("plannedOutfit", plannedOutfits);
      modal.classList.remove("show");
      showAssignPopup(`Outfit Assigned to ${formattedDate}`);
    },
  });
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.remove("show");
});

clearCanvasButton.addEventListener("click", () => {
  outfitCanvas.innerHTML = "";
  outfitCanvas.appendChild(clearCanvasButton);
});
