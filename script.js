function goToPage1() {
  showOnlyPage("page1");
}

function goToPage2() {
  showOnlyPage("page2");
  document.getElementById("error").innerText = "";
  document.getElementById("cropInput").value = "";
  document.getElementById("suggestions").innerHTML = "";
}

function goToPage3() {
  const cropInput = document.getElementById("cropInput").value.trim().toLowerCase();
  const errorDiv = document.getElementById("error");
  const match = cropData.find(item => item.crop === cropInput);

  if (!match) {
    errorDiv.innerText = "Crop not found. Please check spelling.";
    return;
  }

  document.getElementById("cropTitle").innerText = match.crop.toUpperCase();
  document.getElementById("result").innerHTML = `
    <p><strong>Ideal Temperature:</strong> ${match.temperature}</p>
    <p><strong>Ideal Humidity:</strong> ${match.humidity}</p>
    <p><strong>Max Storage Period:</strong> ${match.storage}</p>
  `;
  showOnlyPage("page3");
}

function showOnlyPage(pageId) {
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "none";
  document.getElementById("page3").style.display = "none";
  document.getElementById(pageId).style.display = "block";
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const matches = cropData
    .filter(item => item.crop.startsWith(input))
    .map(item => item.crop);

  matches.forEach(crop => {
    const li = document.createElement("li");
    li.textContent = crop;
    li.onclick = () => {
      document.getElementById("cropInput").value = crop;
      suggestions.innerHTML = "";
    };
    suggestions.appendChild(li);
  });
}

const cropData = [
  { crop: "wheat", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months" },
  { crop: "rice", temperature: "10–15°C", humidity: "65–70%", storage: "6–12 months" },
  { crop: "maize", temperature: "0–4°C", humidity: "80–85%", storage: "6–12 months" },
  { crop: "potato", temperature: "4–7°C", humidity: "90–95%", storage: "90 days" },
  { crop: "onion", temperature: "0–2°C", humidity: "65–70%", storage: "150 days" },
  { crop: "tomato", temperature: "12–15°C", humidity: "85–90%", storage: "14 days" },
  { crop: "chillies", temperature: "8–10°C", humidity: "70–75%", storage: "20 days" },
  { crop: "mango", temperature: "10–13°C", humidity: "85–90%", storage: "28 days" },
  { crop: "banana", temperature: "13–14°C", humidity: "85–95%", storage: "18–22 days" },
  { crop: "sugarcane", temperature: "12–14°C", humidity: "70–75%", storage: "3–5 months" },
  { crop: "groundnut", temperature: "6–10°C", humidity: "70–80%", storage: "3–6 months" },
  { crop: "cotton", temperature: "10–15°C", humidity: "65–75%", storage: "6–8 months" },
  { crop: "pulses", temperature: "5–10°C", humidity: "65–75%", storage: "6–12 months" },
  { crop: "cabbage", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months" },
  { crop: "cauliflower", temperature: "0–1°C", humidity: "90–95%", storage: "2–3 months" }
];
