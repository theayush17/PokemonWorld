const searchInput = document.getElementById('search');
const pokemonCardsContainer = document.getElementById('pokemon-cards');
const filterBtn = document.getElementById('filter-btn');
const filterModal = document.getElementById('filter-modal');
const filterOverlay = document.getElementById('filter-overlay');
const filterClose = document.getElementById('filter-close');
const applyFiltersBtn = document.getElementById('apply-filters');
const clearFiltersBtn = document.getElementById('clear-filters-btn');

let allPokemonData = [];
const backToTopBtn = document.getElementById('back-to-top');
let activeRegions = new Set();
let activeTypes = new Set();

document.addEventListener('DOMContentLoaded', () => {
    fetchPokemonData();
    setupFilterUI();
    setupBackToTop();
});

function setupFilterUI() {
    // Collapse option groups initially
    document.querySelectorAll('.filter-options').forEach(panel => {
        panel.style.display = 'none';
    });

    // Ensure modal/overlay are hidden on load
    if (filterModal) filterModal.hidden = true;
    if (filterOverlay) filterOverlay.hidden = true;

    // Accordion behavior
    document.querySelectorAll('.filter-accordion').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.querySelector(btn.dataset.target);
            if (!target) return;
            target.style.display = target.style.display === 'none' ? 'grid' : 'none';
        });
    });

    // (All) logic for Region
    const regionAll = document.querySelector('input[name="region"][value="all"]');
    const regionSpecific = Array.from(document.querySelectorAll('input[name="region"]:not([value="all"])'));
    if (regionAll) {
        regionAll.addEventListener('change', () => {
            if (regionAll.checked) regionSpecific.forEach(el => (el.checked = false));
        });
    }
    regionSpecific.forEach(el => {
        el.addEventListener('change', () => {
            if (el.checked && regionAll) regionAll.checked = false;
        });
    });

    // (All) logic for Type
    const typeAll = document.querySelector('input[name="type"][value="all"]');
    const typeSpecific = Array.from(document.querySelectorAll('input[name="type"]:not([value="all"])'));
    if (typeAll) {
        typeAll.addEventListener('change', () => {
            if (typeAll.checked) typeSpecific.forEach(el => (el.checked = false));
        });
    }
    typeSpecific.forEach(el => {
        el.addEventListener('change', () => {
            if (el.checked && typeAll) typeAll.checked = false;
        });
    });

    const open = () => { if (filterModal) filterModal.hidden = false; if (filterOverlay) filterOverlay.hidden = false; };
    const close = () => { if (filterModal) filterModal.hidden = true; if (filterOverlay) filterOverlay.hidden = true; };

    filterBtn && filterBtn.addEventListener('click', open);
    filterClose && filterClose.addEventListener('click', close);
    filterOverlay && filterOverlay.addEventListener('click', close);

    applyFiltersBtn && applyFiltersBtn.addEventListener('click', () => {
        activeRegions = new Set(Array.from(document.querySelectorAll('input[name="region"]:checked')).map(el => el.value));
        activeTypes = new Set(Array.from(document.querySelectorAll('input[name="type"]:checked')).map(el => el.value));
        // If (All) selected, treat as no filter for that group
        if (activeRegions.has('all')) activeRegions.clear();
        if (activeTypes.has('all')) activeTypes.clear();
        close();
        applyFiltersAndRender();
    });

    clearFiltersBtn && clearFiltersBtn.addEventListener('click', () => {
        document.querySelectorAll('input[name="region"]:checked').forEach(el => (el.checked = false));
        document.querySelectorAll('input[name="type"]:checked').forEach(el => (el.checked = false));
        activeRegions.clear();
        activeTypes.clear();
        toggleClearButton();
        displayPokemon(allPokemonData);
        if (searchInput.value) applySearch();
    });
}

function toggleClearButton() {
    const has = activeRegions.size > 0 || activeTypes.size > 0;
    if (clearFiltersBtn) clearFiltersBtn.hidden = !has;
}

function applyFiltersAndRender() {
    const filtered = allPokemonData.filter(p => {
        const regionOk = activeRegions.size === 0 || activeRegions.has(p.region);
        const typeList = p.types.map(t => t.type.name);
        const typeOk = activeTypes.size === 0 || typeList.some(t => activeTypes.has(t));
        return regionOk && typeOk;
    });
    displayPokemon(filtered);
    if (searchInput.value) applySearch();
    toggleClearButton();
}

function regionFromId(id) {
    if (id >= 1 && id <= 151) return 'kanto';
    if (id <= 251) return 'johto';
    if (id <= 386) return 'hoenn';
    if (id <= 493) return 'sinnoh';
    if (id <= 649) return 'unova';
    if (id <= 721) return 'kalos';
    if (id <= 809) return 'alola';
    if (id <= 905) return 'galar';
    return 'paldea';
}

async function fetchPokemonData() {
    try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();

        const batchSize = 50;
        for (let i = 0; i < data.results.length; i += batchSize) {
            const batch = data.results.slice(i, i + batchSize);
            const details = await Promise.all(batch.map(item => fetch(item.url).then(res => res.json())));

            details.forEach(p => {
                p.region = regionFromId(p.id);
                allPokemonData.push(p);
            });

            appendPokemonList(details);
        }
    } catch (error) {
        console.error('Error fetching PokAcmon data:', error);
    }
}

function appendPokemonList(pokemonList) {
    const frag = document.createDocumentFragment();
    pokemonList.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        frag.appendChild(card);
    });
    pokemonCardsContainer.appendChild(frag);
    addCardEventListeners();
    if (searchInput.value) applySearch();
}
function displayPokemon(pokemonData) {
    pokemonCardsContainer.innerHTML = '';
    appendPokemonList(pokemonData);
}

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    const type = pokemon.types[0].type.name;
    card.className = `pokemon-card ${type}-type`;
    card.dataset.region = pokemon.region;
    card.dataset.name = pokemon.name;
    card.dataset.height = pokemon.height / 10 + 'm';
    card.dataset.weight = pokemon.weight / 10 + 'kg';
    card.dataset.type = pokemon.types.map(t => t.type.name).join('/');
    card.dataset.moves = pokemon.moves.slice(0, 5).map(m => m.move.name).join(', ');
    card.dataset.abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
    card.dataset.stats = pokemon.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join(', ');
    const homeImg = (pokemon.sprites.other && pokemon.sprites.other.home) ? pokemon.sprites.other.home.front_default : null;
    const artImg = (pokemon.sprites.other && pokemon.sprites.other['official-artwork']) ? pokemon.sprites.other['official-artwork'].front_default : null;
    const gridImage = homeImg || artImg || pokemon.sprites.front_default || 'img/pokemon-icon.png';
    // Use higher-res artwork for popup if available, otherwise fall back to grid image
    card.dataset.image = homeImg || artImg || gridImage;
    const cry = pokemon.cries.latest ? pokemon.cries.latest : '';
    card.dataset.cry = cry;
    card.dataset.evolutionChain = pokemon.species.url;
    const homeShiny = (pokemon.sprites.other && pokemon.sprites.other.home) ? pokemon.sprites.other.home.front_shiny : null;
    const artShiny = (pokemon.sprites.other && pokemon.sprites.other['official-artwork']) ? pokemon.sprites.other['official-artwork'].front_shiny : null;
    const shinyImage = homeShiny || artShiny || card.dataset.image;
    card.dataset.shinyImage = shinyImage;

    card.innerHTML = `
        <div class="card-image"><img loading="lazy" decoding="async" src="${gridImage}" alt="${pokemon.name}"></div>
        <h3>${pokemon.name}</h3>
        <h4>#${String(pokemon.id).padStart(3, '0')} <br> ${card.dataset.type.toUpperCase()}</h4>
    `;
    return card;
}

function applySearch() {
    const searchInputText = searchInput.value.toLowerCase();
    const cards = document.querySelectorAll(".pokemon-card");
  
    cards.forEach(card => {
      const cardName = card.dataset.name.toLowerCase();
      if (cardName.includes(searchInputText)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
}

// Debounce search input for smoother typing
let __searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(__searchTimer);
  __searchTimer = setTimeout(applySearch, 150);
});

function addCardEventListeners() {
    document.querySelectorAll('.pokemon-card').forEach(card => {
        if (card.dataset.listenerAttached === '1') return;
        card.dataset.listenerAttached = '1';
        card.addEventListener('click', function() {
            const pokemonName = card.dataset.name;
            const pokemonHeight = card.dataset.height;
            const pokemonWeight = card.dataset.weight;
            const pokemonType = card.dataset.type;
            const pokemonMoves = card.dataset.moves;
            const pokemonAbilities = card.dataset.abilities;
            const pokemonStats = card.dataset.stats;
            const pokemonImage = card.dataset.image;
            const pokemonCry = card.dataset.cry;
            const evolutionChainUrl = card.dataset.evolutionChain;
            const shinyImage = card.dataset.shinyImage;
            const animatedImage = card.dataset.animatedImage;

            const popup = document.createElement('div');
            popup.className = 'pokemon-popup';
            document.body.appendChild(popup);

            const details = document.createElement('div');
            details.className = 'pokemon-details';
            details.innerHTML = `
                <span class="close-popup-btn">X</span>
                <h3>${pokemonName}</h3>
                <p>Height: ${pokemonHeight}</p>
                <p>Weight: ${pokemonWeight}</p>
                <p>Type: ${pokemonType}</p>
                <div class="moves-list">
                    <h4>Moves:</h4>
                    <p>${pokemonMoves}</p>
                </div>
                <div class="abilities-list">
                    <h4>Abilities:</h4>
                    <p>${pokemonAbilities}</p>
                </div>
                <div class="stats-list">
                    <h4>Base Stats:</h4>
                    <p>${pokemonStats.replace(/, /g, '<br>')}</p>
                </div>
                <button id="play-cry">Play Cry</button>
                <button id="show-evolution">Show Evolution</button>
                <button id="show-shiny">Show Shiny</button>
                <div id="evolution-chain"></div>
            `;
            popup.appendChild(details);

            const imageContainer = document.createElement('div');
            imageContainer.className = 'pokemon-image';
            const img = document.createElement('img');
            img.src = pokemonImage;
            imageContainer.appendChild(img);
            popup.appendChild(imageContainer);

            const closePopupBtn = popup.querySelector('.close-popup-btn');
            closePopupBtn.addEventListener('click', () => {
                popup.classList.remove('active');
                overlay.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(popup);
                    document.body.removeChild(overlay);
                }, 200);
            });

            document.getElementById('play-cry').addEventListener('click', () => {
                const cry = new Audio(pokemonCry);
                cry.play();
            });

            document.getElementById('show-evolution').addEventListener('click', async () => {
                const evolutionChainContainer = document.getElementById('evolution-chain');
                evolutionChainContainer.innerHTML = 'Loading evolution chain...';
                try {
                    const speciesResponse = await fetch(evolutionChainUrl);
                    const speciesData = await speciesResponse.json();
                    const evolutionChainResponse = await fetch(speciesData.evolution_chain.url);
                    const evolutionChainData = await evolutionChainResponse.json();
                    let chain = evolutionChainData.chain;
                    let evolutionHtml = '';
                    do {
                        const pokemonName = chain.species.name;
                        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
                        const pokemonData = await pokemonResponse.json();
                        evolutionHtml += `<img src="${pokemonData.sprites.other['official-artwork'].front_default}" alt="${pokemonName}" style="width: 50px; height: 50px;">`;
                        if (chain.evolves_to.length > 0) {
                            evolutionHtml += ' -> ';
                        }
                        chain = chain.evolves_to[0];
                    } while (chain);
                    evolutionChainContainer.innerHTML = evolutionHtml;
                } catch (error) {
                    console.error('Error fetching evolution chain:', error);
                    evolutionChainContainer.innerHTML = 'Could not load evolution chain.';
                }
            });

            let isShiny = false;
            document.getElementById('show-shiny').addEventListener('click', () => {
                isShiny = !isShiny;
                img.src = isShiny ? shinyImage : pokemonImage;
            });

            setTimeout(() => {
                popup.classList.add('active');
            }, 10);

            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            document.body.appendChild(overlay);
            setTimeout(() => {
                overlay.classList.add('active');
            }, 5);

            overlay.addEventListener('click', function() {
                popup.classList.remove('active');
                overlay.classList.remove('active');
                setTimeout(() => {
                    document.body.removeChild(popup);
                    document.body.removeChild(overlay);
                }, 200);
            });
        });
    });
}

document.addEventListener('keydown', (event) => {
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
            }, 200);
        }
    }
});

function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    const toggleBtn = () => {
        if (window.scrollY > 400) btn.hidden = false; else btn.hidden = true;
    };
    window.addEventListener('scroll', toggleBtn, { passive: true });
    toggleBtn();
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}



