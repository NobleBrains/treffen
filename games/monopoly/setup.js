// ==========================================================================
// Amogolie Modern Setup & Player Color / Token Selection Controller
// ==========================================================================

const AMOGOLIE_PALETTE = [
    { name: "Rot", hex: "#ef4444" },
    { name: "Blau", hex: "#2563eb" },
    { name: "Grün", hex: "#10b981" },
    { name: "Gelb", hex: "#eab308" },
    { name: "Lila", hex: "#8b5cf6" },
    { name: "Orange", hex: "#f97316" },
    { name: "Türkis", hex: "#06b6d4" },
    { name: "Pink", hex: "#ec4899" },
    { name: "Limette", hex: "#84cc16" },
    { name: "Schwarz", hex: "#1e293b" }
];

const AMOGOLIE_TOKENS = [
    "🎩", "🚀", "🚗", "🐶", "🐱", "🦖", "🛸", "👑", "⛵", "⚡", "🍕", "💎"
];

const DEFAULT_PLAYERS = [
    { name: "Spieler 1", color: "#ef4444", token: "🎩" },
    { name: "Spieler 2", color: "#2563eb", token: "🚀" },
    { name: "Spieler 3", color: "#10b981", token: "🚗" },
    { name: "Spieler 4", color: "#eab308", token: "🐶" },
    { name: "Spieler 5", color: "#8b5cf6", token: "🐱" },
    { name: "Spieler 6", color: "#f97316", token: "🦖" },
    { name: "Spieler 7", color: "#06b6d4", token: "🛸" },
    { name: "Spieler 8", color: "#ec4899", token: "👑" }
];

function initModernSetupUI() {
    const grid = document.getElementById("playerCardsGrid");
    if (!grid) return;

    // Check URL parameters for custom prefilled name (e.g. from PartyHub ?name=Lukas)
    const urlParams = new URLSearchParams(window.location.search);
    const passedName = urlParams.get("name") || urlParams.get("player");

    grid.innerHTML = "";

    for (let i = 1; i <= 8; i++) {
        const def = DEFAULT_PLAYERS[i - 1];
        const initialName = (i === 1 && passedName) ? passedName : def.name;

        const card = document.createElement("div");
        card.id = `player${i}input`;
        card.className = "player-card player-input";
        card.dataset.player = i;
        card.style.borderColor = def.color;
        card.style.boxShadow = `0 4px 14px ${def.color}25`;

        // Hidden fields for 100% compatibility with monopoly.js
        card.innerHTML = `
            <input type="hidden" id="player${i}color" value="${def.color}" />
            <input type="hidden" id="player${i}token" value="${def.token}" />
            <input type="hidden" id="player${i}ai" value="0" />

            <div class="player-card-header">
                <span class="player-badge" id="player${i}badge" style="background: ${def.color}18; color: ${def.color}; border: 1.5px solid ${def.color};">
                    Spieler ${i}
                </span>
                <div class="ai-toggle-group">
                    <button type="button" class="ai-pill active" id="player${i}btnHuman" onclick="setPlayerAI(${i}, '0')">
                        👤 Mensch
                    </button>
                    <button type="button" class="ai-pill" id="player${i}btnAI" onclick="setPlayerAI(${i}, '1')">
                        🤖 KI
                    </button>
                </div>
            </div>

            <div class="player-main-row">
                <div class="token-picker-anchor" style="position: relative;">
                    <div class="player-token-avatar" id="player${i}tokenPreview" 
                         style="background-color: ${def.color};" 
                         onclick="toggleTokenPicker(${i}, event)" 
                         title="Klicke, um deine Spielfigur zu wählen">
                        ${def.token}
                    </div>
                    <div class="token-picker-popover" id="player${i}tokenPopover">
                        ${AMOGOLIE_TOKENS.map(t => `
                            <button type="button" class="token-pick-option ${t === def.token ? 'active' : ''}" 
                                    onclick="setPlayerToken(${i}, '${t}', event)">
                                ${t}
                            </button>
                        `).join("")}
                    </div>
                </div>
                <div class="player-name-wrapper">
                    <input type="text" id="player${i}name" class="player-name-input" maxlength="16" 
                           value="${initialName}" placeholder="Name..." />
                </div>
            </div>

            <div class="color-palette-title">
                <span>Farbe:</span>
                <span class="color-name-label" id="player${i}colorLabel" style="color: ${def.color}; font-weight: 700;">
                    ${getPaletteName(def.color)}
                </span>
            </div>

            <div class="color-palette" id="player${i}palette">
                ${AMOGOLIE_PALETTE.map(c => `
                    <button type="button" class="color-swatch ${c.hex === def.color ? 'active' : ''}" 
                            data-hex="${c.hex}"
                            data-name="${c.name}"
                            style="background-color: ${c.hex};" 
                            onclick="setPlayerColor(${i}, '${c.hex}')" 
                            title="${c.name}">
                        ${c.hex === def.color ? '✓' : ''}
                    </button>
                `).join("")}
            </div>
            <div class="color-conflict-notice" id="player${i}conflict" style="display: none;"></div>
        `;

        grid.appendChild(card);
    }

    // Set initial player count from select or default 4
    const select = document.getElementById("playernumber");
    const count = select ? parseInt(select.value, 10) || 4 : 4;
    setPlayerCount(count);

    // Close any token picker when clicking outside
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".token-picker-anchor")) {
            document.querySelectorAll(".token-picker-popover").forEach(el => el.style.display = "none");
        }
    });
}

function getPaletteName(hex) {
    const item = AMOGOLIE_PALETTE.find(c => c.hex.toLowerCase() === hex.toLowerCase());
    return item ? item.name : "Individuell";
}

window.setPlayerCount = function(count) {
    const select = document.getElementById("playernumber");
    if (select) {
        select.value = count;
        if (typeof playernumber_onchange === "function") {
            playernumber_onchange();
        }
    }

    document.querySelectorAll(".count-pill").forEach(pill => {
        const c = parseInt(pill.getAttribute("data-count"), 10);
        if (c === count) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });

    checkColorConflicts();
};

window.setPlayerColor = function(playerIndex, hex) {
    const colorInput = document.getElementById(`player${playerIndex}color`);
    if (colorInput) colorInput.value = hex;

    const tokenPreview = document.getElementById(`player${playerIndex}tokenPreview`);
    if (tokenPreview) tokenPreview.style.backgroundColor = hex;

    const card = document.getElementById(`player${playerIndex}input`);
    if (card) {
        card.style.borderColor = hex;
        card.style.boxShadow = `0 4px 14px ${hex}25`;
    }

    const badge = document.getElementById(`player${playerIndex}badge`);
    if (badge) {
        badge.style.background = `${hex}18`;
        badge.style.color = hex;
        badge.style.borderColor = hex;
    }

    const label = document.getElementById(`player${playerIndex}colorLabel`);
    if (label) {
        label.innerText = getPaletteName(hex);
        label.style.color = hex;
    }

    const palette = document.getElementById(`player${playerIndex}palette`);
    if (palette) {
        palette.querySelectorAll(".color-swatch").forEach(swatch => {
            if (swatch.getAttribute("data-hex").toLowerCase() === hex.toLowerCase()) {
                swatch.classList.add("active");
                swatch.innerText = "✓";
            } else {
                swatch.classList.remove("active");
                swatch.innerText = "";
            }
        });
    }

    checkColorConflicts();
};

window.toggleTokenPicker = function(playerIndex, event) {
    if (event) event.stopPropagation();
    const popover = document.getElementById(`player${playerIndex}tokenPopover`);
    if (!popover) return;

    const isVisible = popover.style.display === "grid";
    document.querySelectorAll(".token-picker-popover").forEach(el => el.style.display = "none");
    popover.style.display = isVisible ? "none" : "grid";
};

window.setPlayerToken = function(playerIndex, token, event) {
    if (event) event.stopPropagation();

    const tokenInput = document.getElementById(`player${playerIndex}token`);
    if (tokenInput) tokenInput.value = token;

    const tokenPreview = document.getElementById(`player${playerIndex}tokenPreview`);
    if (tokenPreview) tokenPreview.innerText = token;

    const popover = document.getElementById(`player${playerIndex}tokenPopover`);
    if (popover) {
        popover.querySelectorAll(".token-pick-option").forEach(opt => {
            if (opt.innerText.trim() === token) {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
        popover.style.display = "none";
    }
};

window.setPlayerAI = function(playerIndex, aiValue) {
    const aiInput = document.getElementById(`player${playerIndex}ai`);
    if (aiInput) aiInput.value = aiValue;

    const nameInput = document.getElementById(`player${playerIndex}name`);
    const btnHuman = document.getElementById(`player${playerIndex}btnHuman`);
    const btnAI = document.getElementById(`player${playerIndex}btnAI`);

    if (aiValue === "1") {
        if (btnHuman) btnHuman.classList.remove("active");
        if (btnAI) btnAI.classList.add("active");
        if (nameInput) {
            nameInput.disabled = true;
            nameInput.dataset.original = nameInput.value;
            nameInput.value = `KI-Spieler ${playerIndex}`;
            nameInput.style.opacity = "0.75";
        }
    } else {
        if (btnHuman) btnHuman.classList.add("active");
        if (btnAI) btnAI.classList.remove("active");
        if (nameInput) {
            nameInput.disabled = false;
            nameInput.value = nameInput.dataset.original || `Spieler ${playerIndex}`;
            nameInput.style.opacity = "1";
        }
    }
};

function checkColorConflicts() {
    const select = document.getElementById("playernumber");
    const count = select ? parseInt(select.value, 10) || 4 : 4;

    const colorMap = {};
    for (let i = 1; i <= count; i++) {
        const colorInput = document.getElementById(`player${i}color`);
        const color = colorInput ? colorInput.value.toLowerCase() : "";
        if (!colorMap[color]) colorMap[color] = [];
        colorMap[color].push(i);
    }

    for (let i = 1; i <= count; i++) {
        const colorInput = document.getElementById(`player${i}color`);
        const color = colorInput ? colorInput.value.toLowerCase() : "";
        const notice = document.getElementById(`player${i}conflict`);
        if (notice) {
            if (colorMap[color] && colorMap[color].length > 1) {
                const others = colorMap[color].filter(x => x !== i);
                notice.innerText = `⚠️ Gleiche Farbe wie Spieler ${others.join(", ")}`;
                notice.style.display = "block";
            } else {
                notice.style.display = "none";
            }
        }
    }
}

// Initialize on DOM ready
$(document).ready(function() {
    initModernSetupUI();
});
