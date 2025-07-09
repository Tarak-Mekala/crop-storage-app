let isTelugu = false;

function goToPage1() {
  showOnlyPage("page1");
}

function goToPage2() {
  showOnlyPage("page2");
  document.getElementById("error").innerText = "";
  document.getElementById("cropInput").value = "";
  document.getElementById("suggestions").innerHTML = "";
  document.getElementById("regionSelect").value = "";
  document.getElementById("result").innerHTML = "";
  document.getElementById("storageResults").innerHTML = "";
  document.getElementById("weatherCard").innerHTML = "";
  document.getElementById("listeningNote").innerText = "";
}

function goToPage3() {
  const cropInput = document.getElementById("cropInput").value.trim().toLowerCase();
  const region = document.getElementById("regionSelect").value;
  const errorDiv = document.getElementById("error");

  const match = cropData.find(item =>
    isTelugu ? item.telugu.toLowerCase() === cropInput : item.crop.toLowerCase() === cropInput
  );

  if (!match) {
    errorDiv.innerText = isTelugu ? "పంట లభ్యం కాలేదు." : "Crop not found.";
    return;
  }

  errorDiv.innerText = "";
  document.getElementById("cropTitle").innerText = isTelugu ? match.telugu : match.crop;

  document.getElementById("result").innerHTML = `
    <p><strong>${isTelugu ? "ఉష్ణోగ్రత" : "Temperature"}:</strong> ${match.temperature}</p>
    <p><strong>${isTelugu ? "ఆర్ద్రత" : "Humidity"}:</strong> ${match.humidity}</p>
    <p><strong>${isTelugu ? "గడువు" : "Storage"}:</strong> ${match.storage}</p>
    <p><strong>${isTelugu ? "ధర" : "Price/kg"}:</strong> ₹${match.price}</p>
  `;

  displayStorageCenters(region);
  fetchWeather(region);
  showOnlyPage("page3");
}

function showOnlyPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(pageId).style.display = "block";
}

function toggleLanguage() {
  isTelugu = !isTelugu;
  document.querySelector(".lang-toggle").innerText = isTelugu ? "🌐 English" : "🌐 తెలుగు";
  document.getElementById("regionSelect").innerHTML = "";
  populateDistrictDropdown();
}

function showSuggestions() {
  const input = document.getElementById("cropInput").value.toLowerCase();
  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  if (!input) return;

  const matches = cropData.filter(item =>
    (isTelugu ? item.telugu : item.crop).toLowerCase().startsWith(input)
  );

  matches.forEach(item => {
    const li = document.createElement("li");
    li.textContent = isTelugu ? item.telugu : item.crop;
    li.onclick = () => {
      document.getElementById("cropInput").value = li.textContent;
      suggestions.innerHTML = "";
    };
    suggestions.appendChild(li);
  });
}

function startVoiceSearch() {
  if (!('webkitSpeechRecognition' in window)) return alert("Voice search not supported");
  const recognition = new webkitSpeechRecognition();
  recognition.lang = isTelugu ? "te-IN" : "en-IN";
  recognition.start
