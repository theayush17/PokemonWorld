//sorting function for every card according to region
function sortPokemon() {
    const selectedRegion = document.getElementById("sort").value;
    const cards = document.querySelectorAll(".pokemon-card");

    cards.forEach(card => {
        if (selectedRegion === "All" || card.dataset.region === selectedRegion) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}
function applySearch() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const cards = document.querySelectorAll(".pokemon-card");
  
    cards.forEach(card => {
      const cardName = card.querySelector("h3").textContent.toLowerCase();
  
      if (cardName.includes(searchInput)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
}
//searching function for every card
document.getElementById("search").addEventListener("input", applySearch);
//Pop function for every card
document.querySelectorAll('.pokemon-card').forEach(card => {
  card.addEventListener('click', function() {
      // Get data from the clicked card
      const pokemonName = card.dataset.name;
      const pokemonHeight = card.dataset.height;
      const pokemonWeight = card.dataset.weight;
      const pokemonType = card.dataset.type;
      const pokemonMoves = card.dataset.moves.split(',').join(', ');
      // Create popup container
      const popup = document.createElement('div');
      popup.className = 'pokemon-popup';
      document.body.appendChild(popup);
      // Left section for details
      const details = document.createElement('div');
      details.className = 'pokemon-details';
      details.innerHTML = `
          <h3>${pokemonName}</h3>
          <p>Height: ${pokemonHeight}</p>
          <p>Weight: ${pokemonWeight}</p>
          <p>Type: ${pokemonType}</p>
          <div class="moves-list">
              <h4>Moves:</h4>
              <p>${pokemonMoves}</p>
          </div>
      `;
      popup.appendChild(details);
      // Right section for the fixed image
      const imageContainer = document.createElement('div');
      imageContainer.className = 'pokemon-image';
      // Correct way to clone image and ensure src is copied
      const img = document.createElement('img');
      img.src = card.querySelector('img').getAttribute('src');
      imageContainer.appendChild(img);
      popup.appendChild(imageContainer);
      // Add smooth transition by setting the active class after appending
 
      setTimeout(() => {
        popup.classList.add('active');
      }, 10); // Slight delay to trigger the transition

      // Right section for the fixed image
      const overlay = document.createElement('div');
      overlay.className = 'overlay';
      document.body.appendChild(overlay);
      setTimeout(() => {
          overlay.classList.add('active');
      }, 5); // Same delay for overlay fade-in effect

      overlay.addEventListener('click', function() {
          popup.classList.remove('active');
          overlay.classList.remove('active');
          setTimeout(() => {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
          },200); // Wait for the fade-out transition to finish
      });
  });
});
// Add the closePhotoOnEsc function to handle the 'Esc' key
function closePhotoOnEsc(event) {
  if (event.key === "Escape") {
      const popup = document.querySelector('.pokemon-popup');
      const overlay = document.querySelector('.overlay');
      if (popup) {
          popup.classList.remove('active');
          if (overlay) {
              overlay.classList.remove('active');
          }
          setTimeout(() => {
              if (popup) document.body.removeChild(popup);
              if (overlay) document.body.removeChild(overlay);
          }, 200); // Wait for the fade-out transition to finish
      }
  }
}
// Attach the event listener to the whole document
document.addEventListener('keydown', closePhotoOnEsc);





