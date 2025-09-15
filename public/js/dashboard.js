window.addEventListener("load", function() {
  // console.log("Page fully loaded ✅"); // debug
  const loader = document.getElementById("loader");
  loader.style.display = "none";
  document.body.classList.remove("loading");
});