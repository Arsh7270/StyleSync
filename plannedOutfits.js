import { saveToStorage, loadFromStorage } from "./utils/storageUtils.js";

const outfitPreview = document.querySelector(".outfit-preview");
const outfitContainer = document.querySelector("#outfit-container");
const deleteBtn = document.querySelector("#delete-btn");
const plannedOutfits = loadFromStorage("plannedOutfit");

document.addEventListener("DOMContentLoaded", function () {
  let currentEvent = null;

  // attach listener once
  deleteBtn.addEventListener("click", () => {
    if (!currentEvent) return;
    deleteAssignedOutfit({ event: currentEvent });
    currentEvent = null;
  });

  const calendarEl = document.getElementById("calendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    height: "auto",
    headerToolbar: {
      left: "prev today",
      center: "title",
      right: "next",
    },
    events: plannedOutfits.map((outfit) => ({
      id: outfit.id,
      title: outfit.name,
      start: outfit.date,
      extendedProps: {
        images: outfit.images,
        width: outfit.width,
        height: outfit.height,
      },
    })),

    eventContent: function (arg) {
      const event = arg.event;
      const container = document.createElement("div");
      container.style.overflow = "hidden";
      container.style.maxHeight = "70px";

      const titleEl = document.createElement("div");
      titleEl.textContent = event.title;
      titleEl.style.fontSize = "10px";
      titleEl.style.overflow = "hidden";
      titleEl.style.textOverflow = "ellipsis";
      titleEl.style.whiteSpace = "nowrap";
      container.appendChild(titleEl);

      const images = event.extendedProps.images;
      const maxVisible = 3;

      images.slice(0, maxVisible).forEach((img) => {
        const imgEl = document.createElement("img");
        imgEl.src = img.src;
        imgEl.style.width = "26px";
        imgEl.style.height = "26px";
        imgEl.style.borderRadius = "3px";
        imgEl.style.margin = "1px";
        imgEl.style.objectFit = "cover";
        container.appendChild(imgEl);
      });

      if (images.length > maxVisible) {
        const badge = document.createElement("span");
        badge.textContent = `+${images.length - maxVisible}`;
        badge.style.fontSize = "10px";
        badge.style.color = "#3a3a3a";
        badge.style.marginLeft = "6px";
        container.appendChild(badge);
      }

      return { domNodes: [container] };
    },

    eventClick: function (info) {
      currentEvent = info.event;
      outfitContainer.innerHTML = "";

      const titleEl = document.createElement("div");
      titleEl.textContent = info.event.title;
      titleEl.style.position = "absolute";
      titleEl.style.bottom = "5%";
      titleEl.style.left = "50%";
      titleEl.style.transform = "translateX(-50%)";
      titleEl.classList.add("outfit-name");
      outfitContainer.appendChild(titleEl);

      info.event.extendedProps.images.forEach((imgObj) => {
        const imgEl = document.createElement("img");
        imgEl.src = imgObj.src;
        imgEl.style.position = "absolute";
        imgEl.style.top = imgObj.top;
        imgEl.style.left = imgObj.left;
        imgEl.style.width = "150px";
        imgEl.style.height = "200px";
        imgEl.style.margin = "2px";
        outfitContainer.appendChild(imgEl);
      });

      const width = info.event.extendedProps.width;
      const height = info.event.extendedProps.height;
      outfitContainer.style.width = width + "px";
      outfitContainer.style.height = height + "px";

      const calendarRect = calendarEl.getBoundingClientRect();
      const eventRect = info.el.getBoundingClientRect();

      let top = eventRect.bottom + window.scrollY + 8;
      let left = eventRect.left + window.scrollX;

      outfitPreview.style.visibility = "hidden";
      outfitPreview.style.display = "block";

      const previewWidth = outfitPreview.offsetWidth;
      const previewHeight = outfitPreview.offsetHeight;

      outfitPreview.style.visibility = "";

      const calendarLeft = calendarRect.left + window.scrollX;
      const calendarRight = calendarRect.right + window.scrollX;

      left = Math.max(calendarLeft + 8, left);
      left = Math.min(left, calendarRight - previewWidth - 8);

      if (top + previewHeight > window.scrollY + window.innerHeight - 16) {
        top = eventRect.top + window.scrollY - previewHeight - 8;
      }

      outfitPreview.style.top = `${top}px`;
      outfitPreview.style.left = `${left}px`;
      outfitPreview.style.display = "block";
    },
  });

  document.addEventListener("click", (e) => {
    if (
      !outfitPreview.contains(e.target) &&
      !e.target.classList.contains("fc-event") &&
      !e.target.closest(".fc-event")
    ) {
      outfitPreview.style.display = "none";
    }
  });

  calendar.render();
});

function deleteAssignedOutfit(info) {
  const outfitTitle = info.event.title || "Unnamed";
  if (confirm(`Delete outfit ${outfitTitle}?`)) {
    const outfitId = parseInt(info.event.id);
    const indexToDelete = plannedOutfits.findIndex((o) => o.id === outfitId);

    if (indexToDelete > -1) {
      plannedOutfits.splice(indexToDelete, 1);
      saveToStorage("plannedOutfit", plannedOutfits);
    }

    info.event.remove();
    outfitPreview.style.display = "none";
  }
}