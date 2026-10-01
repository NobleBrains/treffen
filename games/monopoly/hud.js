// ==========================================================================
// Amogolie Desktop HUD: Banknotes, Property Hand & Tabletop Cockpit
// ==========================================================================

(function() {
    'use strict';

    const BANKNOTE_CONFIG = [
        { denom: 500, label: "500", color: "#d97706", bg: "#fef3c7", border: "#b45309" },
        { denom: 100, label: "100", color: "#b45309", bg: "#ffedd5", border: "#9a3412" },
        { denom: 50,  label: "50",  color: "#2563eb", bg: "#dbeafe", border: "#1d4ed8" },
        { denom: 20,  label: "20",  color: "#059669", bg: "#d1fae5", border: "#047857" },
        { denom: 10,  label: "10",  color: "#ca8a04", bg: "#fef9c3", border: "#a16207" },
        { denom: 5,   label: "5",   color: "#e11d48", bg: "#ffe4e6", border: "#be123c" },
        { denom: 1,   label: "1",   color: "#475569", bg: "#f1f5f9", border: "#334155" }
    ];

    let lastKnownMoney = {};
    let isLogDockCollapsed = true;
    let isPlayersDockCollapsed = false;

    // Calculate realistic banknote breakdown for any money amount
    function calculateBanknotes(amount) {
        if (!amount || amount <= 0) return {};
        const breakdown = {};
        let rem = Math.max(0, Math.floor(amount));
        
        for (const note of BANKNOTE_CONFIG) {
            const count = Math.floor(rem / note.denom);
            if (count > 0) {
                breakdown[note.denom] = count;
                rem -= count * note.denom;
            }
        }
        return breakdown;
    }

    // Render the visual banknote stacks
    function renderBanknotesTray(amount) {
        const tray = document.getElementById("banknotesTray");
        if (!tray) return;

        const breakdown = calculateBanknotes(amount);
        const hasNotes = Object.keys(breakdown).length > 0;

        if (!hasNotes) {
            tray.innerHTML = `<span class="no-notes-text">Keine Scheine (0 DM)</span>`;
            return;
        }

        let html = "";
        for (const note of BANKNOTE_CONFIG) {
            const count = breakdown[note.denom];
            if (count && count > 0) {
                html += `
                    <div class="banknote-stack" style="--note-color: ${note.color}; --note-bg: ${note.bg}; --note-border: ${note.border};" title="${count}x ${note.denom} DM-Schein (${count * note.denom} DM)">
                        <div class="banknote-card">
                            <span class="note-watermark">DM</span>
                            <span class="note-denom">${note.label}</span>
                        </div>
                        <span class="note-count">×${count}</span>
                    </div>
                `;
            }
        }
        tray.innerHTML = html;
    }

    let currentCardViewMode = "groups";
    window.playerCustomCardOrder = {};

    window.setCardViewMode = function(mode) {
        currentCardViewMode = mode;
        const btnGroups = document.getElementById("btnViewGroups");
        const btnFree = document.getElementById("btnViewFree");
        if (btnGroups) btnGroups.classList.toggle("active", mode === "groups");
        if (btnFree) btnFree.classList.toggle("active", mode === "free");
        if (typeof turn !== "undefined") {
            renderPropertyInventory(turn);
        }
    };

    // Render Property Tray (Karten-Inventar & Tisch-Ablage) for current player
    function renderPropertyInventory(playerIdx) {
        const tray = document.getElementById("propertyCardsTray");
        const countBadge = document.getElementById("inventoryCount");
        if (!tray) return;

        if (typeof square === "undefined" || !playerIdx || !player[playerIdx]) {
            tray.innerHTML = "";
            return;
        }

        const ownedSquares = [];
        for (let i = 0; i < 40; i++) {
            if (square[i] && square[i].owner === playerIdx) {
                ownedSquares.push({ index: i, sq: square[i] });
            }
        }

        const pObj = player[playerIdx];
        const specialCards = [];
        if (pObj) {
            if (pObj.communityChestJailCard) {
                specialCards.push({
                    type: "chest",
                    name: "🎟️ Gefängnis-Frei",
                    group: "Gemeinschaft",
                    color: "#f59e0b",
                    desc: pObj.jail ? "⚡ Sofort einsetzen!" : "Schützt vor Knast"
                });
            }
            if (pObj.chanceJailCard) {
                specialCards.push({
                    type: "chance",
                    name: "🎟️ Gefängnis-Frei",
                    group: "Ereigniskarte",
                    color: "#ef4444",
                    desc: pObj.jail ? "⚡ Sofort einsetzen!" : "Schützt vor Knast"
                });
            }
        }

        if (countBadge) {
            const countText = [];
            if (ownedSquares.length > 0) {
                countText.push(`${ownedSquares.length} Straße${ownedSquares.length === 1 ? '' : 'n'}`);
            }
            if (specialCards.length > 0) {
                countText.push(`${specialCards.length}x 🎟️ Frei`);
            }
            countBadge.innerText = countText.length > 0 ? countText.join(" • ") : "0 Karten";
        }

        if (ownedSquares.length === 0 && specialCards.length === 0) {
            tray.innerHTML = `
                <div class="empty-inventory-notice">
                    <span>🏠 Noch keine Grundstücke oder Sonderkarten.</span>
                    <small>Ziehe über das Spielfeld, um Straßen & Bahnhöfe zu erwerben!</small>
                </div>
            `;
            return;
        }

        // Color group total counts on the Monopoly board
        const GROUP_TOTALS = {
            1: 2, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 2,
            railroad: 4, utility: 2
        };

        const GROUP_NAMES = {
            1: "Braun", 2: "Hellblau", 3: "Pink", 4: "Orange",
            5: "Rot", 6: "Gelb", 7: "Grün", 8: "Dunkelblau",
            railroad: "Bahnhöfe", utility: "Versorgung"
        };

        function renderSingleCard(item) {
            const s = item.sq;
            const idx = item.index;
            const isMortgaged = !!s.mortgage;
            const colorBar = s.color || "#1e293b";

            let houseBadge = "";
            if (s.hotel === 1) {
                houseBadge = `<span class="prop-badge hotel">🏨 Hotel</span>`;
            } else if (s.house > 0) {
                houseBadge = `<span class="prop-badge house">🏠 ${s.house}</span>`;
            }

            let mortgageBadge = isMortgaged ? `<span class="prop-badge mortgage">🏦 Belastet</span>` : "";

            let rentText = "";
            if (isMortgaged) {
                rentText = "Keine Miete";
            } else if (s.hotel === 1) {
                rentText = `Miete: ${s.rent5} DM`;
            } else if (s.house > 0) {
                rentText = `Miete: ${s['rent' + s.house]} DM`;
            } else {
                rentText = `Miete: ${s.baserent} DM`;
            }

            return `
                <div class="property-deed-card ${isMortgaged ? 'is-mortgaged' : ''}" 
                     draggable="${currentCardViewMode === 'free' ? 'true' : 'false'}"
                     data-index="${idx}"
                     onclick="openPropertyDeedModal(${idx})" 
                     title="${s.name} (Klicke für Besitzurkunde & Ausbau)">
                    <div class="deed-header-stripe" style="background-color: ${colorBar};"></div>
                    <div class="deed-body">
                        <div class="deed-name">${s.name}</div>
                        <div class="deed-status-row">
                            ${houseBadge}
                            ${mortgageBadge}
                        </div>
                        <div class="deed-rent">${rentText}</div>
                    </div>
                </div>
            `;
        }

        function renderSpecialCard(item) {
            return `
                <div class="property-deed-card special-card ${item.type === 'chance' ? 'chance-card' : ''}" 
                     onclick="window.onSpecialCardClick('${item.type}', ${playerIdx})" 
                     title="${item.group}: ${item.name} (${item.desc})">
                    <div class="deed-header-stripe" style="background-color: ${item.color};"></div>
                    <div class="deed-body">
                        <div class="deed-name">${item.name}</div>
                        <div class="deed-status-row">
                            <span class="prop-badge ${item.type === 'chance' ? 'chance-badge' : 'chest-badge'}">${item.group}</span>
                        </div>
                        <div class="deed-rent">${item.desc}</div>
                    </div>
                </div>
            `;
        }

        if (currentCardViewMode === "free") {
            // Free layout: custom user arrangement
            let customOrder = window.playerCustomCardOrder[playerIdx];
            if (!customOrder) {
                customOrder = ownedSquares.map(o => o.index);
                window.playerCustomCardOrder[playerIdx] = customOrder;
            } else {
                // Ensure all current owned squares are included
                const currentIdxs = ownedSquares.map(o => o.index);
                customOrder = customOrder.filter(i => currentIdxs.includes(i));
                currentIdxs.forEach(i => {
                    if (!customOrder.includes(i)) customOrder.push(i);
                });
                window.playerCustomCardOrder[playerIdx] = customOrder;
            }

            const orderedSquares = customOrder
                .map(i => ownedSquares.find(o => o.index === i))
                .filter(Boolean);

            let html = `<div class="free-cards-rack" id="freeCardsRack">`;
            if (specialCards.length > 0) {
                html += specialCards.map(s => renderSpecialCard(s)).join("");
            }
            orderedSquares.forEach(item => {
                html += renderSingleCard(item);
            });
            html += `</div>`;
            tray.innerHTML = html;

            setupCardDragAndDrop(playerIdx);

        } else {
            // Groups mode: Organized by color sets on the tabletop
            const groupsMap = {};
            ownedSquares.forEach(item => {
                const grpKey = item.sq.groupNumber || item.sq.type || "other";
                if (!groupsMap[grpKey]) groupsMap[grpKey] = [];
                groupsMap[grpKey].push(item);
            });

            let html = `<div class="tabletop-sets-container">`;

            if (specialCards.length > 0) {
                html += `
                    <div class="tabletop-group-pile set-completed" style="border-color: #f59e0b; background: #fffbeb;">
                        <div class="tabletop-group-header">
                            <span class="set-color-indicator" style="background-color: #f59e0b;"></span>
                            <span class="set-title">Ereigniskarten (${specialCards.length})</span>
                            <span class="set-complete-badge" style="background: #fef3c7; color: #b45309;">Sonderkarte</span>
                        </div>
                        <div class="tabletop-group-cards">
                            ${specialCards.map(s => renderSpecialCard(s)).join("")}
                        </div>
                    </div>
                `;
            }

            Object.entries(groupsMap).forEach(([grpKey, items]) => {
                const totalInSet = GROUP_TOTALS[grpKey] || items.length;
                const isComplete = (items.length >= totalInSet);
                const grpName = GROUP_NAMES[grpKey] || "Grundstücke";
                const firstColor = items[0].sq.color || "#3b82f6";

                html += `
                    <div class="tabletop-group-pile ${isComplete ? 'set-completed' : ''}">
                        <div class="tabletop-group-header">
                            <span class="set-color-indicator" style="background-color: ${firstColor};"></span>
                            <span class="set-title">${grpName} (${items.length}/${totalInSet})</span>
                            ${isComplete ? '<span class="set-complete-badge" title="Monopol! Doppelte Miete & Häuser bauen möglich">★ Vollständig</span>' : ''}
                        </div>
                        <div class="tabletop-group-cards">
                            ${items.map(item => renderSingleCard(item)).join("")}
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
            tray.innerHTML = html;
        }
    }

    // HTML5 drag and drop for free tabletop arrangement
    function setupCardDragAndDrop(playerIdx) {
        const rack = document.getElementById("freeCardsRack");
        if (!rack) return;

        let draggedEl = null;

        rack.querySelectorAll(".property-deed-card").forEach(card => {
            card.addEventListener("dragstart", function(e) {
                draggedEl = this;
                this.classList.add("dragging");
                e.dataTransfer.effectAllowed = "move";
            });

            card.addEventListener("dragend", function() {
                this.classList.remove("dragging");
                draggedEl = null;

                // Save new custom order
                const newOrder = [];
                rack.querySelectorAll(".property-deed-card").forEach(c => {
                    const idx = parseInt(c.getAttribute("data-index"), 10);
                    if (!isNaN(idx)) newOrder.push(idx);
                });
                window.playerCustomCardOrder[playerIdx] = newOrder;
            });

            card.addEventListener("dragover", function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (draggedEl && draggedEl !== this) {
                    const bounding = this.getBoundingClientRect();
                    const offset = e.clientX - bounding.left - bounding.width / 2;
                    if (offset > 0) {
                        this.after(draggedEl);
                    } else {
                        this.before(draggedEl);
                    }
                }
            });
        });
    }

    // Render Players Tabletop Dock (Right Side)
    function renderPlayersDock() {
        const list = document.getElementById("hudPlayersList");
        if (!list || typeof pcount === "undefined" || !player) return;

        let html = "";
        for (let i = 1; i <= pcount; i++) {
            const p = player[i];
            if (!p) continue;

            const isCurrentTurn = (typeof turn !== "undefined" && turn === i);
            const isBankrupt = p.money < 0;
            const isInJail = !!p.jail;

            // Property group dots
            const groupDots = [];
            const ownedInGroup = {};
            for (let s = 0; s < 40; s++) {
                if (square[s] && square[s].owner === i && square[s].groupNumber) {
                    const g = square[s].groupNumber;
                    ownedInGroup[g] = (ownedInGroup[g] || 0) + 1;
                }
            }

            // Group colors
            const GROUP_COLORS = {
                1: "#8B4513", 2: "#87CEEB", 3: "#ec4899", 4: "#f97316",
                5: "#ef4444", 6: "#eab308", 7: "#10b981", 8: "#2563eb",
                railroad: "#1e293b", utility: "#64748b"
            };

            let dotsHtml = "";
            Object.entries(ownedInGroup).forEach(([grp, count]) => {
                const color = GROUP_COLORS[grp] || "#3b82f6";
                dotsHtml += `<span class="group-dot" style="background: ${color};" title="${count} Grundstück(e)">${count}</span>`;
            });

            const hasJailCard = !!(p.communityChestJailCard || p.chanceJailCard);

            html += `
                <div class="hud-player-item ${isCurrentTurn ? 'active-turn' : ''} ${isBankrupt ? 'bankrupt' : ''}">
                    <div class="hud-player-avatar" style="background-color: ${p.color || '#3b82f6'}; border-color: ${p.color || '#3b82f6'};">
                        <span class="hud-token-icon">${p.tokenIcon || '♟️'}</span>
                        ${isCurrentTurn ? '<span class="turn-pulse"></span>' : ''}
                    </div>
                    <div class="hud-player-info">
                        <div class="hud-player-top">
                            <span class="hud-player-name">${p.name} ${isCurrentTurn ? '👑' : ''}</span>
                            ${hasJailCard ? '<span class="status-pill jail-free" title="Besitzt Gefängnis-Frei-Karte">🎟️ Frei</span>' : ''}
                            ${isInJail ? '<span class="status-pill jail">🚨 Knast</span>' : ''}
                            ${isBankrupt ? '<span class="status-pill bankrupt">💀 Pleite</span>' : ''}
                        </div>
                        <div class="hud-player-money">
                            <span class="money-icon">💵</span>
                            <strong>${p.money} DM</strong>
                        </div>
                        <div class="hud-player-properties">
                            ${dotsHtml || '<small style="opacity: 0.6; font-size: 0.72rem;">Keine Karten</small>'}
                        </div>
                    </div>
                </div>
            `;
        }

        list.innerHTML = html;
    }

    // Cash transaction visual animation
    function showCashChangeAnimation(amountDiff) {
        if (!amountDiff || amountDiff === 0) return;
        const container = document.getElementById("cashAnimationContainer");
        if (!container) return;

        const isPositive = amountDiff > 0;
        const pill = document.createElement("div");
        pill.className = `cash-float-pill ${isPositive ? 'plus' : 'minus'}`;
        pill.innerText = `${isPositive ? '+' : ''}${amountDiff} DM`;

        container.appendChild(pill);
        setTimeout(() => {
            if (pill.parentElement) pill.parentElement.removeChild(pill);
        }, 2200);
    }

    // Update the entire Cockpit and HUD
    window.updateDesktopHUD = function() {
        const hud = document.getElementById("game-hud");
        if (hud && hud.style.display === "none" && typeof turn !== "undefined" && turn > 0) {
            hud.style.display = "flex";
        }

        if (typeof turn === "undefined" || !player || !player[turn]) return;

        const currentP = player[turn];

        // Cash change detection
        const prevMoney = lastKnownMoney[turn];
        if (typeof prevMoney === "number" && prevMoney !== currentP.money) {
            showCashChangeAnimation(currentP.money - prevMoney);
        }
        lastKnownMoney[turn] = currentP.money;

        // Update player tag & token
        const tokenEl = document.getElementById("cockpitToken");
        const nameEl = document.getElementById("cockpitPlayerName");
        const cashTotal = document.getElementById("cockpitTotalCash");

        if (tokenEl) {
            tokenEl.innerText = currentP.tokenIcon || "♟️";
            tokenEl.style.backgroundColor = currentP.color || "#3b82f6";
        }
        if (nameEl) nameEl.innerText = currentP.name;
        if (cashTotal) {
            cashTotal.innerHTML = `${currentP.money.toLocaleString('de-DE')} <span class="currency-unit">DM</span>`;
            if (currentP.money < 0) {
                cashTotal.classList.add("debt");
            } else {
                cashTotal.classList.remove("debt");
            }
        }

        // Banknotes
        renderBanknotesTray(currentP.money);

        // Property Hand
        renderPropertyInventory(turn);

        // Right Players Dock
        renderPlayersDock();

        // Check if landed on an unowned street to show dedicated buy card
        updateLandedPrompt();
    };

    function updateLandedPrompt() {
        const promptBox = document.getElementById("landed-action-box");
        const landedEl = document.getElementById("landed");
        if (!promptBox || !landedEl) return;

        const hasLandedContent = landedEl.innerHTML.trim().length > 0;
        if (hasLandedContent && landedEl.style.display !== "none") {
            promptBox.style.display = "block";
        } else {
            promptBox.style.display = "none";
        }
    }

    // Property deed modal / quick action
    window.openPropertyDeedModal = function(squareIdx) {
        if (typeof showdeed === "function") {
            showdeed(squareIdx);
        }
    };

    // Toggle live alert log / history dock collapse
    window.toggleLogDock = function() {
        isLogDockCollapsed = !isLogDockCollapsed;
        const dock = document.getElementById("hudLeftDock");
        const arrow = document.getElementById("leftDockTabArrow");
        if (dock) {
            dock.classList.toggle("collapsed", isLogDockCollapsed);
        }
        if (arrow) {
            arrow.innerText = isLogDockCollapsed ? "⮞" : "⮜";
        }
    };
    window.toggleLogCollapse = window.toggleLogDock;

    // Toggle players list side drawer collapse
    window.togglePlayersDock = function() {
        isPlayersDockCollapsed = !isPlayersDockCollapsed;
        const dock = document.getElementById("hudRightDock");
        const arrow = document.getElementById("rightDockTabArrow");
        if (dock) {
            dock.classList.toggle("collapsed", isPlayersDockCollapsed);
        }
        if (arrow) {
            arrow.innerText = isPlayersDockCollapsed ? "⮜" : "⮞";
        }
    };

    // Special Event Cards (Gefängnis frei) click handler
    window.onSpecialCardClick = function(type, pIdx) {
        if (typeof player === "undefined" || !player[pIdx]) return;
        const p = player[pIdx];
        if (p.jail) {
            if (typeof useJailCard === "function") {
                useJailCard();
                if (typeof updateDesktopHUD === "function") updateDesktopHUD();
            }
        } else {
            if (typeof popup === "function") {
                popup("<div style='text-align: center; padding: 12px;'><h3>🎟️ Du kommst aus dem Gefängnis frei</h3><p style='margin: 10px 0;'>Diese Karte bewahrt dich davor, im Gefängnis zu sitzen oder 50 DM Strafe zahlen zu müssen.<br/><br/>Du kannst die Karte behalten oder im <strong>Handel (🤝)</strong> an andere Spieler verkaufen!</p></div>");
            }
        }
    };

    // Modular Monopoly Board Graphic Skin Support
    window.setBoardGraphic = function(imagePath) {
        const board = document.getElementById("board");
        if (!board) return;
        if (imagePath) {
            board.classList.add("use-board-image");
            board.style.setProperty("--board-bg-image", "url('" + imagePath + "')");
        } else {
            board.classList.remove("use-board-image");
            board.style.removeProperty("--board-bg-image");
        }
    };

    // Formatted stream of game alerts
    window.onGameAlert = function(alertText) {
        const log = document.getElementById("hudAlertContent");
        if (!log) return;

        const item = document.createElement("div");
        item.className = "hud-alert-item";

        let icon = "🎲";
        if (alertText.includes("landet") || alertText.includes("landed")) icon = "📍";
        if (alertText.includes("Miete") || alertText.includes("rent")) icon = "💸";
        if (alertText.includes("Gehalt") || alertText.includes("erhalten") || alertText.includes("zieht 200 DM") || alertText.includes("salary")) icon = "💵";
        if (alertText.includes("Gefängnis") || alertText.includes("Kaution") || alertText.includes("jail")) icon = "🚨";
        if (alertText.includes("gekauft") || alertText.includes("ersteigert") || alertText.includes("Haus") || alertText.includes("Hotel") || alertText.includes("bought")) icon = "🏠";
        if (alertText.includes("Hypothek") || alertText.includes("mortgage")) icon = "🏦";
        if (alertText.includes("Handel") || alertText.includes("trade")) icon = "🤝";
        if (alertText.includes("bankrott") || alertText.includes("bankrupt")) icon = "💀";
        if (alertText.includes("gewonnen") || alertText.includes("won")) icon = "🏆";
        if (alertText.includes("Pasch") || alertText.includes("gewürfelt")) icon = "🎲";

        item.innerHTML = `<span class="alert-icon">${icon}</span> <span class="alert-text">${alertText}</span>`;
        log.appendChild(item);

        log.scrollTop = log.scrollHeight;
    };

    // Open trade dialog
    window.openTradeDialog = function() {
        const tradeModal = document.getElementById("trade");
        if (tradeModal) {
            tradeModal.style.display = tradeModal.style.display === "block" ? "none" : "block";
        }
    };

    // Open stats modal
    window.showStatsModal = function() {
        const stats = document.getElementById("stats");
        if (stats) {
            stats.style.display = stats.style.display === "block" ? "none" : "block";
        }
    };

})();
