export function loadFromStorage(key) {
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
}

export function saveToStorage(key, item) {
  localStorage.setItem(key, JSON.stringify(item));
}

export const clothingItems = loadFromStorage("items").map(item => {
  if (!item.id) {
    item.id = Date.now() + Math.random(); 
  }
  return item;
});

if (clothingItems.some(item => item.id)) {
  saveToStorage("items", clothingItems);
}
export const outfits = loadFromStorage("outfit");

function getPlannedOutfitId() {
  return JSON.parse(localStorage.getItem("plannedOutfitId")) || 0;
}

/*the planned outfit array is being updated in two places so to get proper id 
w/o any duplicates, need to have the same logic of setting ids in both places */
export function incrementPlannedOutfitId() {
  let id = getPlannedOutfitId();
  id++;
  localStorage.setItem("plannedOutfitId", JSON.stringify(id));
  return id;
}
