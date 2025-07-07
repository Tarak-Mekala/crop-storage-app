function checkStorageConditions() {
  const crop = document.getElementById("crop").value.toLowerCase();
  const result = document.getElementById("result");

  let message = "";
  if (crop === "wheat") {
    message = "Wheat should be stored at 10–15°C with low humidity.";
  } else if (crop === "tomato") {
    message = "Tomatoes require 12–15°C in cold storage.";
  } else {
    message = "Storage info not available. Please consult local experts.";
  }

  result.innerHTML = `<strong>Storage Advice:</strong><br>${message}`;
}

function showStorageCenters() {
  const region = document.getElementById("region").value;
  const storageOutput = document.getElementById("storage-centers");

  const centers = {
    "Nizamabad": [
      "SLNS Cold Storage, Munipally (V), Nizamabad",
      "Sridevi Hi-Tech Cold Storage, Algur (V), Armoor (M)",
      "Sri Balaji Cold Storage, Bodhan"
    ],
    "ADILABAD": [
      "GMR Warehouse, Ashok Kumar Gadewar, Adilabad",
      "Ladda Agro Godowns, Jainad"
    ],
    "HYDERABAD": [
      "Hyderabad Cold Storage, Kukatpally",
      "Govt Cold Storage, Erragadda"
    ]
  };

  if (centers[region]) {
    storageOutput.innerHTML = `<strong>Nearby Storage Centers in ${region}:</strong><ul>` +
      centers[region].map(unit => `<li>${unit}</li>`).join("") + "</ul>";
  } else {
    storageOutput.innerHTML = "";
  }
}
