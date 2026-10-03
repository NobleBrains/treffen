// ==========================================================================
// Party-Hub State, Dynamic Multi-Tab Presence & Data
// ==========================================================================

const AVATAR_POOL = [
    { name: "Lukas", avatar: "🐶", color: "#6366f1" },
    { name: "Sarah", avatar: "🦊", color: "#f97316" },
    { name: "Tom", avatar: "🐱", color: "#06b6d4" },
    { name: "Anna", avatar: "🐼", color: "#ec4899" },
    { name: "Ben", avatar: "🐸", color: "#10b981" },
    { name: "Mia", avatar: "🐰", color: "#8b5cf6" },
    { name: "Leo", avatar: "🦁", color: "#eab308" },
    { name: "Emma", avatar: "🦄", color: "#f43f5e" },
    { name: "Felix", avatar: "🐧", color: "#3b82f6" },
    { name: "Mila", avatar: "🐻", color: "#d97706" }
];

const ALL_AVATARS = [
    "🐶", "🦊", "🐱", "🐼", "🐸", "🐰", "🦁", "🦄",
    "🐧", "🐻", "🐵", "🐙", "🚀", "👑", "👻", "⚡", "🍕", "🎮"
];

// Generate a clean 6-character alphanumeric party code (avoiding ambiguous characters 0, O, 1, I)
function generatePartyCode(len = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < len; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Read room code from URL ?room=... or ?code=..., or generate a random 6-character code
const urlParams = new URLSearchParams(window.location.search);
let rawCode = (urlParams.get("room") || urlParams.get("code") || "").trim().toUpperCase();

if (!rawCode) {
    rawCode = generatePartyCode(6);
    // Keep URL synchronized without full page reload so copying the link from address bar always preserves the code
    try {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("room", rawCode);
        window.history.replaceState({ room: rawCode }, "", newUrl.toString());
    } catch (e) {
        console.warn("Could not update URL state:", e);
    }
}

const ROOM_CODE = rawCode;

const STORAGE_KEY_PLAYERS = `partyhub_roster_${ROOM_CODE}`;
const STORAGE_KEY_USER = `partyhub_user_${ROOM_CODE}`;
const STORAGE_KEY_JOINED = `partyhub_joined_${ROOM_CODE}`;
const STORAGE_KEY_VOTES = `partyhub_votes_${ROOM_CODE}`;

// Native cross-tab broadcast bus
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(`partyhub_bus_${ROOM_CODE}`) : null;

function broadcast(msg) {
    if (channel) {
        try {
            channel.postMessage(msg);
        } catch (e) {
            console.error("Broadcast error:", e);
        }
    }
}

const partyState = {
    roomCode: ROOM_CODE,
    isHost: false,
    currentUser: null,
    players: [],
    games: {
        skribbol: {
            id: "skribbol",
            title: "skribbl",
            icon: "🎨",
            minPlayers: 2,
            maxPlayers: 12,
            desc: "Kreatives Zeichnen und Erraten im Freundeskreis. Durch unser neues Framework könnt ihr spannende Custom Modes wählen!",
            embedUrl: "http://localhost:8080/"
        },
        uno: {
            id: "uno",
            title: "UNO",
            icon: "🃏",
            minPlayers: 2,
            maxPlayers: 8,
            desc: "Der fiese Kartenklassiker ohne Werbung. Ziehe 4, Aussetzen und Farbwünsche sorgen für beste Schadenfreude.",
            embedUrl: "http://localhost:8085/"
        },
        codenames: {
            id: "codenames",
            title: "Codenames",
            icon: "🕵️‍♂️",
            minPlayers: 2,
            maxPlayers: 12,
            desc: "Zwei Geheimdienstchefs geben geheime Ein-Wort-Hinweise. Welches Agenten-Team entschlüsselt zuerst alle eigenen Wörter?",
            embedUrl: "http://localhost:5005/"
        },
        price_guess: {
            id: "price_guess",
            title: "Guess The Price",
            icon: "🏷️",
            minPlayers: 1,
            maxPlayers: 12,
            desc: "Errate die Preise von echten Produkten! Klassischer Schätzmodus, Höher oder Niedriger (This or That) und Echtzeit-Mehrspieler mit Freunden.",
            embedUrl: "http://localhost:8088/"
        }
    },
    isVotingActive: false,
    votes: {
        skribbol: 0,
        uno: 0,
        codenames: 0,
        price_guess: 0
    },
    userVotedGame: null,
    activeModalGameId: null
};

let tempSelectedAvatar = null;
let tempJoinAvatar = null;

// ==========================================================================
// Multi-Tab Presence & Session Management
// ==========================================================================

function initUserSession() {
    // Room info in UI
    const roomCodeEl = document.getElementById("roomCodeDisplay");
    if (roomCodeEl) roomCodeEl.innerText = ROOM_CODE;

    const hudRoomCode = document.getElementById("hudRoomCode");
    if (hudRoomCode) hudRoomCode.innerText = ROOM_CODE;

    const shareModalCode = document.getElementById("shareModalCodeDisplay");
    if (shareModalCode) shareModalCode.innerText = ROOM_CODE;

    const qrFallbackText = document.getElementById("qrFallbackText");
    if (qrFallbackText) qrFallbackText.innerText = ROOM_CODE;

    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${ROOM_CODE}`;
    const shareUrlInput = document.getElementById("shareUrlInput");
    if (shareUrlInput) {
        shareUrlInput.value = shareUrl;
    }

    const qrImg = document.getElementById("qrCodeImg");
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;
        qrImg.onload = () => {
            qrImg.style.display = "block";
            if (qrFallbackText) qrFallbackText.style.display = "none";
        };
        qrImg.onerror = () => {
            qrImg.style.display = "none";
            if (qrFallbackText) qrFallbackText.style.display = "block";
        };
    }

    const isJoined = sessionStorage.getItem(STORAGE_KEY_JOINED) === "true";
    let savedUser = null;
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY_USER);
        if (stored) savedUser = JSON.parse(stored);
    } catch (e) {}

    if (isJoined && savedUser) {
        partyState.currentUser = savedUser;
        partyState.isHost = savedUser.isHost;
        updateHeaderUserBadge();
        syncPresence();
    } else {
        // Tab has not confirmed nickname yet -> show welcome modal
        showJoinModal();
        syncPresence();
    }
}

function showJoinModal() {
    const modal = document.getElementById("joinModal");
    const input = document.getElementById("joinNicknameInput");
    const picker = document.getElementById("joinAvatarPicker");
    if (!modal) return;

    let roster = getRosterFromStorage();
    const activePlayerNames = Object.values(roster).map(p => p.name);

    // Pick first unused preset recommendation
    let chosenPreset = AVATAR_POOL.find(p => !activePlayerNames.includes(p.name));
    if (!chosenPreset) {
        const num = Object.keys(roster).length + 1;
        chosenPreset = {
            name: `Spieler ${num}`,
            avatar: ALL_AVATARS[num % ALL_AVATARS.length],
            color: "#6366f1"
        };
    }

    tempJoinAvatar = chosenPreset.avatar;
    if (input) {
        input.value = "";
        setTimeout(() => {
            input.focus();
        }, 150);
    }

    if (picker) {
        picker.innerHTML = "";
        ALL_AVATARS.forEach(emoji => {
            const item = document.createElement("div");
            item.className = `avatar-pick-item ${emoji === tempJoinAvatar ? 'selected' : ''}`;
            item.innerText = emoji;
            item.onclick = () => {
                document.querySelectorAll("#joinAvatarPicker .avatar-pick-item").forEach(el => el.classList.remove("selected"));
                item.classList.add("selected");
                tempJoinAvatar = emoji;
            };
            picker.appendChild(item);
        });
    }

    modal.style.display = "flex";
}

window.handleJoinSubmit = function(e) {
    if (e) e.preventDefault();

    const input = document.getElementById("joinNicknameInput");
    const nickname = input && input.value.trim() ? input.value.trim() : "Gast";
    const avatar = tempJoinAvatar || "🐶";

    let roster = getRosterFromStorage();
    const hasActiveHost = Object.values(roster).some(p => p.isHost);
    const isHost = !hasActiveHost || Object.keys(roster).length === 0;

    const preset = AVATAR_POOL.find(p => p.name.toLowerCase() === nickname.toLowerCase() || p.avatar === avatar);
    const color = preset ? preset.color : "#6366f1";

    const newUser = {
        id: "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
        name: nickname,
        avatar: avatar,
        color: color,
        isHost: isHost,
        status: "Bereit",
        isReady: true,
        joinedAt: Date.now(),
        lastSeen: Date.now()
    };

    try {
        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        sessionStorage.setItem(STORAGE_KEY_JOINED, "true");
    } catch (err) {}

    partyState.currentUser = newUser;
    partyState.isHost = newUser.isHost;

    const modal = document.getElementById("joinModal");
    if (modal) modal.style.display = "none";

    updateHeaderUserBadge();
    syncPresence();
    broadcast({ type: "PRESENCE_PING" });

    showToast(`Willkommen bei Treffen, ${newUser.name}! 🎉`);
};

function getRosterFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        const now = Date.now();
        const active = {};
        // Prune players that haven't sent a heartbeat in 5 seconds
        for (const [id, p] of Object.entries(parsed)) {
            if (p && now - (p.lastSeen || 0) < 5000) {
                active[id] = p;
            }
        }
        return active;
    } catch (e) {
        return {};
    }
}

function syncPresence() {
    let roster = getRosterFromStorage();
    const isJoined = sessionStorage.getItem(STORAGE_KEY_JOINED) === "true";

    if (partyState.currentUser && isJoined) {
        // Check if there is an active host among others
        const otherPlayers = Object.values(roster).filter(p => p.id !== partyState.currentUser.id);
        const otherHost = otherPlayers.find(p => p.isHost);

        if (!otherHost && !partyState.currentUser.isHost) {
            // Oldest active player inherits host
            const all = [...otherPlayers, partyState.currentUser].sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
            if (all.length > 0 && all[0].id === partyState.currentUser.id) {
                partyState.currentUser.isHost = true;
                try {
                    sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(partyState.currentUser));
                } catch (e) {}
            }
        }

        partyState.currentUser.lastSeen = Date.now();
        roster[partyState.currentUser.id] = partyState.currentUser;

        try {
            localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(roster));
        } catch (e) {}

        partyState.isHost = partyState.currentUser.isHost;
        updateHeaderUserBadge();
    }

    // Sort players by joinedAt so host / first arrivals remain in consistent order
    partyState.players = Object.values(roster).sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));

    renderPlayerRoster();

    if (partyState.activeModalGameId) {
        renderModalReadiness();
    }
}

function updateHeaderUserBadge() {
    if (!partyState.currentUser) return;
    const avatarEl = document.getElementById("userAvatar");
    const nameEl = document.getElementById("userNameDisplay");
    const roleEl = document.getElementById("userRoleDisplay");

    if (avatarEl) avatarEl.innerText = partyState.currentUser.avatar;
    if (nameEl) nameEl.innerText = partyState.currentUser.name;
    if (roleEl) {
        if (partyState.currentUser.isHost) {
            roleEl.innerText = "👑 Party-Host";
            roleEl.className = "user-role host";
        } else {
            roleEl.innerText = "🎮 Mitspieler";
            roleEl.className = "user-role";
        }
    }
}

function renderPlayerRoster() {
    const rosterEl = document.getElementById("playerRoster");
    const countBadge = document.getElementById("playerCountBadge");
    if (!rosterEl) return;

    const count = partyState.players.length;
    if (countBadge) {
        countBadge.innerText = count === 1 ? "1 Freund" : `${count} Freunde`;
    }

    rosterEl.innerHTML = "";

    partyState.players.forEach(p => {
        const isMe = p.id === partyState.currentUser.id;
        const card = document.createElement("div");
        card.className = `player-card ${p.isHost ? 'is-host' : ''}`;
        
        card.innerHTML = `
            <div class="player-card-avatar" style="background: ${p.color || '#6366f1'}22; border: 2.5px solid ${p.color || '#6366f1'};">
                ${p.avatar}
                <span class="status-dot"></span>
            </div>
            <div class="player-card-details">
                <span class="player-card-name">
                    ${p.name} ${p.isHost ? '👑' : ''} ${isMe ? '<small style="opacity:0.75; font-size:0.8em;">(Du)</small>' : ''}
                </span>
                <span class="player-card-tag">${p.status || 'Bereit'}</span>
            </div>
        `;
        rosterEl.appendChild(card);
    });
}

// ==========================================================================
// Profile Modal (Change Name & Avatar)
// ==========================================================================

window.openProfileModal = function() {
    const modal = document.getElementById("profileModal");
    const nameInput = document.getElementById("profileNameInput");
    const picker = document.getElementById("profileAvatarPicker");
    if (!modal) return;

    tempSelectedAvatar = partyState.currentUser.avatar;
    if (nameInput) nameInput.value = partyState.currentUser.name;

    if (picker) {
        picker.innerHTML = "";
        ALL_AVATARS.forEach(emoji => {
            const item = document.createElement("div");
            item.className = `avatar-pick-item ${emoji === tempSelectedAvatar ? 'selected' : ''}`;
            item.innerText = emoji;
            item.onclick = () => {
                document.querySelectorAll(".avatar-pick-item").forEach(el => el.classList.remove("selected"));
                item.classList.add("selected");
                tempSelectedAvatar = emoji;
            };
            picker.appendChild(item);
        });
    }

    modal.style.display = "flex";
};

window.closeProfileModal = function() {
    const modal = document.getElementById("profileModal");
    if (modal) modal.style.display = "none";
};

window.saveProfileModal = function() {
    const nameInput = document.getElementById("profileNameInput");
    const newName = nameInput ? nameInput.value.trim() : "";
    if (newName) {
        partyState.currentUser.name = newName;
    }
    if (tempSelectedAvatar) {
        partyState.currentUser.avatar = tempSelectedAvatar;
    }

    try {
        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(partyState.currentUser));
    } catch (e) {}

    syncPresence();
    broadcast({ type: "PRESENCE_PING" });

    closeProfileModal();
    showToast(`Profil gespeichert: ${partyState.currentUser.name} ${partyState.currentUser.avatar}`);
};

// ==========================================================================
// Cross-Tab Broadcast Listener
// ==========================================================================

function setupChannelListener() {
    if (!channel) return;

    channel.onmessage = (event) => {
        const data = event.data;
        if (!data) return;

        switch (data.type) {
            case "PRESENCE_PING":
            case "PLAYER_LEFT":
                syncPresence();
                break;

            case "OPEN_GAME_MODAL":
                if (data.gameId && partyState.games[data.gameId]) {
                    showModalUI(data.gameId);
                    if (data.initiatedBy && data.initiatedBy !== partyState.currentUser.name) {
                        showToast(`🔔 ${data.initiatedBy} lädt zu ${partyState.games[data.gameId].title} ein!`);
                    }
                }
                break;

            case "CLOSE_GAME_MODAL":
                const modal = document.getElementById("gameModal");
                if (modal) modal.style.display = "none";
                partyState.activeModalGameId = null;
                break;

            case "READY_STATE_CHANGED":
                if (data.playerId) {
                    const p = partyState.players.find(x => x.id === data.playerId);
                    if (p) p.isReady = data.isReady;
                    renderModalReadiness();
                }
                break;

            case "LAUNCH_GAME":
                if (data.gameId && partyState.games[data.gameId]) {
                    executeCountdownAndLaunch(partyState.games[data.gameId]);
                }
                break;

            case "EXIT_GAME":
                doExitGameView();
                break;

            case "VOTE_UPDATE":
                partyState.votes = data.votes || partyState.votes;
                partyState.isVotingActive = !!data.isVotingActive;
                applyVoteStateUI();
                break;
        }
    };
}

// Clean up on tab close
window.addEventListener("beforeunload", () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
        if (raw) {
            const roster = JSON.parse(raw);
            delete roster[partyState.currentUser.id];
            localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(roster));
        }
        broadcast({ type: "PLAYER_LEFT", id: partyState.currentUser.id });
    } catch (e) {}
});

// ==========================================================================
// DOM Initialization & Setup
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    initUserSession();
    syncPresence();
    setupFilters();
    setupEventListeners();
    setupChannelListener();
    initThemeSystem();
    loadVotesFromStorage();

    // Heartbeat every 1.5 seconds to refresh presence and prune dead tabs
    setInterval(syncPresence, 1500);
});

function setupFilters() {
    const filterButtons = document.querySelectorAll(".filter-pill");
    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;
            const cards = document.querySelectorAll(".game-card");
            cards.forEach(card => {
                if (filter === "all") {
                    card.style.display = "flex";
                } else {
                    const cat = card.dataset.category || "";
                    if (cat.includes(filter)) {
                        card.style.display = "flex";
                    } else {
                        card.style.display = "none";
                    }
                }
            });
        });
    });
}

function setupEventListeners() {
    const copyLinkBtn = document.getElementById("copyLinkBtn");
    if (copyLinkBtn) copyLinkBtn.addEventListener("click", copyShareUrl);

    const qrCodeBtn = document.getElementById("qrCodeBtn");
    if (qrCodeBtn) qrCodeBtn.addEventListener("click", openShareModal);

    const changeRoomBtn = document.getElementById("changeRoomBtn");
    if (changeRoomBtn) changeRoomBtn.addEventListener("click", openCodeModal);

    document.getElementById("toggleVoteBtn").addEventListener("click", toggleVoteMode);
    document.getElementById("closeVoteBtn").addEventListener("click", toggleVoteMode);
    document.getElementById("backToHubBtn").addEventListener("click", exitActiveGame);
    
    // User profile badge click
    const userBadge = document.getElementById("currentUserBadge");
    if (userBadge) {
        userBadge.addEventListener("click", openProfileModal);
    }

    // Keyboard shortcut 'T' to quickly cycle themes (when not typing in an input)
    document.addEventListener("keydown", (e) => {
        if (e.key === "t" || e.key === "T") {
            const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
            if (tag !== "input" && tag !== "textarea") {
                cycleTheme();
            }
        }
    });
}

// ==========================================================================
// Modular Multi-Theme System
// ==========================================================================

const THEMES = [
    {
        id: "doodle",
        name: "Doodle Skizze",
        icon: "✏️",
        desc: "Klassischer Skribbl-Stil auf kariertem Notizpapier",
        swatches: ["#ffffff", "#3b82f6", "#1e293b"]
    },
    {
        id: "cyber-arcade",
        name: "Cyber Arcade",
        icon: "🕹️",
        desc: "Dunkle Cyber-Lounge mit Neon-Cyan & Magenta Glows",
        swatches: ["#080a12", "#00f0ff", "#ff007f"]
    },
    {
        id: "glassmorphism",
        name: "Modern Glass",
        icon: "✨",
        desc: "Elegante Milchglas-Karten mit sanftem Farbnebel",
        swatches: ["#0b0f19", "#6366f1", "#ec4899"]
    },
    {
        id: "cozy-lounge",
        name: "Cozy Lounge",
        icon: "🪵",
        desc: "Warmer Kaminabend mit Mahagoni, Bernstein & Gold",
        swatches: ["#171310", "#d97706", "#fef3c7"]
    },
    {
        id: "retro-arcade",
        name: "Retro Pop Art",
        icon: "👾",
        desc: "Knallige 90er-Jahre Arcade mit mutigen Kontrasten",
        swatches: ["#1e1b4b", "#facc15", "#38bdf8"]
    },
    {
        id: "clean-light",
        name: "Nordic Clean",
        icon: "☀️",
        desc: "Minimalistischer, aufgeräumter Studio-Look",
        swatches: ["#f8fafc", "#2563eb", "#ffffff"]
    }
];

function initThemeSystem() {
    const savedTheme = localStorage.getItem("partyhub_theme") || "cyber-arcade";
    applyTheme(savedTheme, false);

    const dropdownBtn = document.getElementById("themeDropdownBtn");
    const dropdownMenu = document.getElementById("themeDropdownMenu");
    const optionsContainer = document.getElementById("themeOptionsList");

    if (optionsContainer) {
        optionsContainer.innerHTML = "";
        THEMES.forEach(t => {
            const item = document.createElement("div");
            item.className = `theme-option-item ${t.id === savedTheme ? "active" : ""}`;
            item.dataset.themeId = t.id;
            item.innerHTML = `
                <div class="theme-option-info">
                    <span class="theme-option-icon">${t.icon}</span>
                    <div class="theme-option-text">
                        <span class="theme-option-name">${t.name}</span>
                        <span class="theme-option-desc">${t.desc}</span>
                    </div>
                </div>
                <div class="theme-swatches">
                    ${t.swatches.map(c => `<span class="theme-swatch" style="background: ${c};"></span>`).join("")}
                </div>
            `;
            item.addEventListener("click", (e) => {
                e.stopPropagation();
                applyTheme(t.id, true);
                closeThemeDropdown();
            });
            optionsContainer.appendChild(item);
        });
    }

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const isOpen = dropdownMenu.classList.contains("show");
            if (isOpen) {
                closeThemeDropdown();
            } else {
                openThemeDropdown();
            }
        });

        // Close on click outside
        document.addEventListener("click", (e) => {
            const wrapper = document.getElementById("themePickerWrapper");
            if (wrapper && !wrapper.contains(e.target)) {
                closeThemeDropdown();
            }
        });
    }
}

function openThemeDropdown() {
    const btn = document.getElementById("themeDropdownBtn");
    const menu = document.getElementById("themeDropdownMenu");
    if (btn) btn.classList.add("open");
    if (menu) menu.classList.add("show");
}

function closeThemeDropdown() {
    const btn = document.getElementById("themeDropdownBtn");
    const menu = document.getElementById("themeDropdownMenu");
    if (btn) btn.classList.remove("open");
    if (menu) menu.classList.remove("show");
}

function applyTheme(themeId, notify = true) {
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    document.documentElement.setAttribute("data-theme", theme.id);
    localStorage.setItem("partyhub_theme", theme.id);

    const iconEl = document.getElementById("currentThemeIcon");
    const nameEl = document.getElementById("currentThemeName");
    if (iconEl) iconEl.innerText = theme.icon;
    if (nameEl) nameEl.innerText = theme.name;

    // Update active highlight in menu
    document.querySelectorAll(".theme-option-item").forEach(el => {
        if (el.dataset.themeId === theme.id) {
            el.classList.add("active");
        } else {
            el.classList.remove("active");
        }
    });

    if (notify) {
        showToast(`Design aktiviert: ${theme.icon} ${theme.name}`);
    }
}

// Quick Cycle (z. B. per Tastatur 'T' oder Shortcut)
window.cycleTheme = function() {
    const currentThemeId = document.documentElement.getAttribute("data-theme") || "cyber-arcade";
    const currentIndex = THEMES.findIndex(t => t.id === currentThemeId);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    applyTheme(THEMES[nextIndex].id, true);
};

// ==========================================================================
function ensureCurrentUser() {
    if (!partyState.currentUser) {
        let saved = null;
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY_USER);
            if (stored) saved = JSON.parse(stored);
        } catch (e) {}

        if (!saved) {
            try {
                const storedLocal = localStorage.getItem(STORAGE_KEY_USER);
                if (storedLocal) saved = JSON.parse(storedLocal);
            } catch (e) {}
        }

        if (saved) {
            partyState.currentUser = saved;
            partyState.isHost = saved.isHost;
        } else {
            partyState.currentUser = {
                id: "p_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6),
                name: "Spieler",
                avatar: "🐶",
                color: "#6366f1",
                isHost: true,
                status: "Bereit",
                isReady: true,
                joinedAt: Date.now(),
                lastSeen: Date.now()
            };
            partyState.isHost = true;
            try {
                sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(partyState.currentUser));
                sessionStorage.setItem(STORAGE_KEY_JOINED, "true");
            } catch (e) {}
        }
    }
}

window.openGameModal = function(gameId) {
    ensureCurrentUser();
    showModalUI(gameId);
    broadcast({
        type: "OPEN_GAME_MODAL",
        gameId: gameId,
        initiatedBy: partyState.currentUser ? partyState.currentUser.name : "Spieler"
    });
};

function showModalUI(gameId) {
    ensureCurrentUser();
    const game = partyState.games[gameId];
    if (!game) return;

    partyState.activeModalGameId = gameId;

    const iconEl = document.getElementById("modalIcon");
    const titleEl = document.getElementById("modalTitle");
    const metaEl = document.getElementById("modalMeta");
    const descEl = document.getElementById("modalDesc");
    const modalEl = document.getElementById("gameModal");

    if (iconEl) iconEl.innerText = game.icon;
    if (titleEl) titleEl.innerText = game.title;
    if (metaEl) metaEl.innerText = `👥 ${game.minPlayers}–${game.maxPlayers} Spieler`;
    if (descEl) descEl.innerText = game.desc;

    // Reset user readiness to ready
    if (partyState.currentUser) {
        partyState.currentUser.isReady = true;
        try {
            sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(partyState.currentUser));
        } catch (e) {}
    }

    const btn = document.getElementById("toggleReadyBtn");
    if (btn) {
        btn.className = "ready-toggle-btn ready";
        btn.innerHTML = `<span>✅</span> <span>Ich bin bereit!</span>`;
    }

    syncPresence();
    renderModalReadiness();

    if (modalEl) modalEl.style.display = "flex";
}

window.closeGameModal = function() {
    const modalEl = document.getElementById("gameModal");
    if (modalEl) modalEl.style.display = "none";
    partyState.activeModalGameId = null;
    broadcast({ type: "CLOSE_GAME_MODAL" });
};

window.renderModalReadiness = function() {
    ensureCurrentUser();
    const miniContainer = document.getElementById("modalMiniAvatars");
    if (!miniContainer) return;
    miniContainer.innerHTML = "";

    let readyCount = 0;
    const currentId = partyState.currentUser ? partyState.currentUser.id : null;
    partyState.players.forEach(p => {
        const isReady = p.isReady !== false;
        if (isReady) readyCount++;

        const isMe = p.id === currentId;
        const item = document.createElement("div");
        item.className = "mini-player-item";
        item.innerHTML = `
            <div class="mini-avatar ${isReady ? 'is-ready' : ''}" style="border-color: ${p.color || '#6366f1'};">
                ${p.avatar}
                <span class="mini-ready-check">${isReady ? '✓' : '…'}</span>
            </div>
            <span class="mini-player-name">${p.name} ${isMe ? '(Du)' : ''}</span>
        `;
        miniContainer.appendChild(item);
    });

    const statusEl = document.getElementById("readinessStatus");
    if (statusEl) {
        statusEl.innerText = `${readyCount} von ${partyState.players.length} bereit`;
    }

    const launchBtn = document.getElementById("launchGameBtn");
    if (launchBtn) {
        const game = partyState.games[partyState.activeModalGameId];
        const title = game ? game.title : "Spiel";
        launchBtn.innerText = `🚀 ${title} starten`;
        launchBtn.disabled = false;
        launchBtn.style.opacity = "1";
        launchBtn.style.cursor = "pointer";
        launchBtn.title = "Klicke zum Starten der Runde";
    }
};

window.toggleMyReadyState = function() {
    partyState.currentUser.isReady = !partyState.currentUser.isReady;
    try {
        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(partyState.currentUser));
    } catch (e) {}

    const btn = document.getElementById("toggleReadyBtn");
    if (btn) {
        if (partyState.currentUser.isReady) {
            btn.className = "ready-toggle-btn ready";
            btn.innerHTML = `<span>✅</span> <span>Ich bin bereit!</span>`;
        } else {
            btn.className = "ready-toggle-btn not-ready";
            btn.innerHTML = `<span>⏳</span> <span>Noch nicht bereit</span>`;
        }
    }

    syncPresence();
    broadcast({
        type: "READY_STATE_CHANGED",
        playerId: partyState.currentUser.id,
        isReady: partyState.currentUser.isReady
    });

    renderModalReadiness();
};

window.launchCurrentGame = function() {
    const gameId = partyState.activeModalGameId;
    const game = partyState.games[gameId];
    if (!game) return;

    broadcast({ type: "LAUNCH_GAME", gameId: gameId });
    executeCountdownAndLaunch(game);
};

function executeCountdownAndLaunch(game) {
    const gameModal = document.getElementById("gameModal");
    if (gameModal) gameModal.style.display = "none";

    const countdownEl = document.getElementById("countdownOverlay");
    const numEl = document.getElementById("countdownNumber");
    const titleEl = document.getElementById("countdownTitle");
    const iconEl = document.getElementById("countdownIcon");

    iconEl.innerText = game.icon;
    titleEl.innerText = `${game.title} startet...`;

    countdownEl.style.display = "flex";
    let count = 3;
    numEl.innerText = count;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.innerText = count;
        } else {
            clearInterval(interval);
            countdownEl.style.display = "none";
            startGameView(game);
        }
    }, 800);
}

function getGameUrl(game) {
    const userName = partyState.currentUser ? partyState.currentUser.name : "Gast";
    if (game.id === "skribbol") {
        return `/skribbl/?username=${encodeURIComponent(userName)}`;
    } else if (game.id === "uno") {
        return `/uno/?lobby=${encodeURIComponent(ROOM_CODE)}&name=${encodeURIComponent(userName)}`;
    } else if (game.id === "codenames") {
        return `/codenames/g/${encodeURIComponent(ROOM_CODE)}?name=${encodeURIComponent(userName)}`;
    } else if (game.id === "monopoly") {
        return `/monopoly/?name=${encodeURIComponent(userName)}`;
    } else if (game.id === "price_guess") {
        return `/price-guess/`;
    }
    return game.embedUrl;
}

function startGameView(game) {
    const overlay = document.getElementById("activeGameOverlay");
    const iframe = document.getElementById("gameIframe");
    const hudTitle = document.getElementById("hudGameTitle");
    const hudIcon = document.getElementById("hudGameIcon");

    hudIcon.innerText = game.icon;
    hudTitle.innerText = `${game.title} • Party-Raum`;

    if (game.id === "skribbol" || game.id === "uno" || game.id === "codenames" || game.id === "monopoly" || game.id === "price_guess") {
        iframe.src = getGameUrl(game);
    } else {
        iframe.srcdoc = `
            <!DOCTYPE html>
            <html style="background: #111827; color: white; font-family: sans-serif; height: 100%;">
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; margin: 0; text-align: center;">
                <div style="font-size: 5rem; margin-bottom: 20px;">${game.icon}</div>
                <h1 style="font-size: 2.5rem; margin: 0 0 10px 0;">${game.title}</h1>
                <p style="color: #94a3b8; font-size: 1.2rem; max-width: 500px;">
                    👥 Synchron verbunden mit ${partyState.players.length} Freunden • Spielbereit
                </p>
            </body>
            </html>
        `;
    }

    overlay.classList.add("active");
}

function exitActiveGame() {
    broadcast({ type: "EXIT_GAME" });
    doExitGameView();
}

function doExitGameView() {
    const overlay = document.getElementById("activeGameOverlay");
    const iframe = document.getElementById("gameIframe");
    overlay.classList.remove("active");
    iframe.src = "about:blank";
    showToast("Zurück im Wohnzimmer!");
}

// ==========================================================================
// Voting Mode & Democracy Feature (Synchronized Across Tabs)
// ==========================================================================

function loadVotesFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_VOTES);
        if (raw) {
            const data = JSON.parse(raw);
            partyState.votes = data.votes || partyState.votes;
            partyState.isVotingActive = !!data.isVotingActive;
            applyVoteStateUI();
        }
    } catch (e) {}
}

function saveVotesToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY_VOTES, JSON.stringify({
            votes: partyState.votes,
            isVotingActive: partyState.isVotingActive
        }));
    } catch (e) {}
}

function toggleVoteMode() {
    partyState.isVotingActive = !partyState.isVotingActive;
    saveVotesToStorage();
    broadcast({
        type: "VOTE_UPDATE",
        votes: partyState.votes,
        isVotingActive: partyState.isVotingActive
    });
    applyVoteStateUI();

    if (partyState.isVotingActive) {
        showToast("🗳️ Abstimmung gestartet! Klicke auf dein Wunschspiel.");
    }
}

function applyVoteStateUI() {
    const banner = document.getElementById("voteBanner");
    const toggleBtn = document.getElementById("toggleVoteBtn");

    if (partyState.isVotingActive) {
        if (banner) banner.style.display = "block";
        if (toggleBtn) {
            toggleBtn.classList.add("active");
            toggleBtn.innerText = "✕ Abstimmung aktiv";
        }
        enableCardVoting();
    } else {
        if (banner) banner.style.display = "none";
        if (toggleBtn) {
            toggleBtn.classList.remove("active");
            toggleBtn.innerText = "🗳️ Abstimmung";
        }
        disableCardVoting();
    }
}

function enableCardVoting() {
    Object.keys(partyState.games).forEach(gameId => {
        const counter = document.getElementById(`vote-${gameId}`);
        if (counter) {
            counter.style.display = "block";
            counter.querySelector(".vote-count").innerText = partyState.votes[gameId] || 0;
        }

        const card = document.querySelector(`[data-game-id="${gameId}"]`);
        if (card) {
            const actions = card.querySelector(".card-actions");
            let voteBtn = actions.querySelector(".vote-card-btn");
            if (!voteBtn) {
                voteBtn = document.createElement("button");
                voteBtn.className = "vote-card-btn";
                voteBtn.innerText = "✋ Stimme abgeben";
                voteBtn.onclick = (e) => {
                    e.stopPropagation();
                    castVote(gameId);
                };
                actions.appendChild(voteBtn);
            }
            voteBtn.style.display = "block";
            if (partyState.userVotedGame === gameId) {
                voteBtn.classList.add("voted");
                voteBtn.innerText = "✅ Deine Stimme";
            } else {
                voteBtn.classList.remove("voted");
                voteBtn.innerText = "✋ Stimme abgeben";
            }
        }
    });
}

function disableCardVoting() {
    Object.keys(partyState.games).forEach(gameId => {
        const counter = document.getElementById(`vote-${gameId}`);
        if (counter) counter.style.display = "none";

        const card = document.querySelector(`[data-game-id="${gameId}"]`);
        if (card) {
            const voteBtn = card.querySelector(".vote-card-btn");
            if (voteBtn) voteBtn.style.display = "none";
        }
    });
}

function castVote(gameId) {
    if (partyState.userVotedGame === gameId) {
        partyState.votes[gameId] = Math.max(0, (partyState.votes[gameId] || 0) - 1);
        partyState.userVotedGame = null;
    } else {
        if (partyState.userVotedGame) {
            partyState.votes[partyState.userVotedGame] = Math.max(0, (partyState.votes[partyState.userVotedGame] || 0) - 1);
        }
        partyState.votes[gameId] = (partyState.votes[gameId] || 0) + 1;
        partyState.userVotedGame = gameId;
    }

    saveVotesToStorage();
    broadcast({
        type: "VOTE_UPDATE",
        votes: partyState.votes,
        isVotingActive: partyState.isVotingActive
    });
    applyVoteStateUI();

    showToast(`Stimme erfasst für ${partyState.games[gameId].title}!`);
}

// ==========================================================================
// Roulette (Random Game Picker)
// ==========================================================================

window.spinRoulette = function() {
    const available = ["skribbol", "uno", "codenames", "price_guess"];
    const pick = available[Math.floor(Math.random() * available.length)];
    const chosenGame = partyState.games[pick];

    const card = document.querySelector(`[data-game-id="${pick}"]`);
    if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.transform = "scale(1.06)";
        card.style.borderColor = "#ec4899";
        setTimeout(() => {
            card.style.transform = "";
            card.style.borderColor = "";
            openGameModal(pick);
        }, 600);
    }
    showToast(`🎰 Das Schicksal hat entschieden: ${chosenGame.title}!`);
};

// ==========================================================================
// Share & Code Modals
// ==========================================================================

window.openShareModal = function() {
    const modal = document.getElementById("shareModal");
    if (modal) modal.style.display = "flex";
};

window.closeShareModal = function() {
    const modal = document.getElementById("shareModal");
    if (modal) modal.style.display = "none";
};

window.openCodeModal = function() {
    const modal = document.getElementById("codeModal");
    if (modal) {
        modal.style.display = "flex";
        const input = document.getElementById("joinCodeInput");
        if (input) {
            input.value = "";
            setTimeout(() => input.focus(), 50);
        }
    }
};

window.closeCodeModal = function() {
    const modal = document.getElementById("codeModal");
    if (modal) modal.style.display = "none";
};

window.handleCodeSubmit = function(e) {
    if (e) e.preventDefault();
    const input = document.getElementById("joinCodeInput");
    const code = (input ? input.value : "").trim().toUpperCase();
    if (code) {
        const targetUrl = new URL(window.location.origin + window.location.pathname);
        targetUrl.searchParams.set("room", code);
        window.location.href = targetUrl.toString();
    }
};

window.generateNewRoomCode = function() {
    const newCode = generatePartyCode(6);
    const targetUrl = new URL(window.location.origin + window.location.pathname);
    targetUrl.searchParams.set("room", newCode);
    window.location.href = targetUrl.toString();
};

window.copyShareUrl = function() {
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${ROOM_CODE}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast(`📋 Code ${ROOM_CODE} & Link kopiert!`);
        }).catch(() => {
            fallbackCopy(shareUrl);
        });
    } else {
        fallbackCopy(shareUrl);
    }
    closeShareModal();
};

function fallbackCopy(text) {
    const input = document.getElementById("shareUrlInput");
    if (input) {
        input.value = text;
        input.select();
        try {
            document.execCommand("copy");
            showToast(`📋 Code ${ROOM_CODE} & Link kopiert!`);
        } catch (e) {
            showToast(`Party-Code: ${ROOM_CODE}`);
        }
    }
}

function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.innerText = msg;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}
