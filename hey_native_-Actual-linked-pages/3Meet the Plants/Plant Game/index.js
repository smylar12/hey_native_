let gridContainer;
let cards = [];
let allPlants = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let timerInterval;
let startTime;
let totalMatches = 0;
let matchesFound = 0;

document.addEventListener("DOMContentLoaded", () => {
  gridContainer = document.querySelector(".grid-container");
  const scoreElement = document.querySelector(".score");
  if (!gridContainer || !scoreElement) {
    console.error("Missing .grid-container or .score element. Make sure the script runs after the HTML loads.");
    return;
  }

  scoreElement.textContent = score;
  startTimer();

  fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
      allPlants = data;
      selectRandomPlants();
      shuffleCards();
      generateCards();
    })
    .catch((error) => {
      console.error("Failed to load cards.json:", error);
    });
});

function selectRandomPlants() {
  const selectedPlants = allPlants.sort(() => Math.random() - 0.5).slice(0, 8);
  cards = [...selectedPlants, ...selectedPlants];
}

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  totalMatches = cards.length / 2;
  matchesFound = 0;
  for (let card of cards) {
    const cardWrapper = document.createElement("div");
    cardWrapper.classList.add("card-wrapper");
    
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);
    cardElement.innerHTML = `
      <div class="front">
        <img class="front-image" src=${card.image} />
        <div class="front-text">${formatPlantName(card.name)}</div>
      </div>
      <div class="back"></div>
    `;
    
    cardWrapper.appendChild(cardElement);
    gridContainer.appendChild(cardWrapper);
    cardElement.addEventListener("click", flipCard);
  }
}

function formatPlantName(camelCaseName) {
  return camelCaseName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function flipCard() {
  if (lockBoard) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    return;
  }

  secondCard = this;
  score++;
  document.querySelector(".score").textContent = score;
  lockBoard = true;

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  
  matchesFound++;
  if (matchesFound === totalMatches) {
    stopTimer();
    setTimeout(() => {
      showCongratsModal();
    }, 300);
  }

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  resetBoard();
  stopTimer();
  selectRandomPlants();
  shuffleCards();
  score = 0;
  matchesFound = 0;
  document.querySelector(".score").textContent = score;
  document.querySelector(".timer").textContent = "0:00";
  gridContainer.innerHTML = "";
  generateCards();
  startTimer();
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  document.querySelector(".timer").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function showCongratsModal() {
  const finalTime = document.querySelector(".timer").textContent;
  document.getElementById("finalTime").textContent = finalTime;
  document.getElementById("congratsModal").style.display = "block";
}

function closeCongratsModal() {
  document.getElementById("congratsModal").style.display = "none";
  restart();
}