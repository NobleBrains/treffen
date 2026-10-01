const rootPath = `{{.RootPath}}`;

Array.from(document.getElementsByClassName("number-input")).forEach(
    (number_input) => {
        const input = number_input.children.item(1);
        const decrement_button = number_input.children.item(0);
        decrement_button.addEventListener("click", function () {
            input.stepDown();
        });
        const increment_button = number_input.children.item(2);
        increment_button.addEventListener("click", function () {
            input.stepUp();
        });
    },
);

// Pre-fill username from URL query param or existing cookie
const urlParams = new URLSearchParams(window.location.search);
const usernameParam = urlParams.get("username") || urlParams.get("name");
const usernameInput = document.getElementById("username");
if (usernameInput) {
    if (usernameParam) {
        usernameInput.value = usernameParam;
    } else {
        const match = document.cookie.match(new RegExp('(^| )username=([^;]+)'));
        if (match) {
            usernameInput.value = decodeURIComponent(match[2]);
        }
    }
}

// Ensure public-check-box is always set
const lobbyCreateForm = document.getElementById("lobby-create");
if (lobbyCreateForm) {
    lobbyCreateForm.addEventListener("submit", (event) => {
        const check_box = document.getElementById("public-check-box");
        if (check_box) {
            check_box.value = (event.submitter && event.submitter.id === "create-public") ? "true" : "false";
        }
        return true;
    });
}

const lobby_list_placeholder = document.getElementById(
    "lobby-list-placeholder-text",
);
const lobby_list_loading_placeholder = document.getElementById(
    "lobby-list-placeholder-loading",
);
const lobby_list = document.getElementById("lobby-list");

if (lobby_list_placeholder) {
    lobby_list_placeholder.innerHTML =
        '<b>{{.Translation.Get "no-lobbies-yet"}}</b>';
}

const getLobbies = () => {
    return new Promise((resolve, reject) => {
        fetch(`${rootPath}/v1/lobby`)
            .then((response) => {
                response.json().then(resolve);
            })
            .catch(reject);
    });
};

const set_lobby_list_placeholder = (text, visible) => {
    if (visible) {
        lobby_list_placeholder.style.display = "flex";
        lobby_list_placeholder.innerHTML = "<b>" + text + "<b>";
    } else {
        lobby_list_placeholder.style.display = "none";
    }
};

const set_lobby_list_loading = (loading) => {
    if (loading) {
        set_lobby_list_placeholder("", false);
        lobby_list_loading_placeholder.style.display = "flex";
    } else {
        lobby_list_loading_placeholder.style.display = "none";
    }
};

const language_to_flag = (language) => {
    switch (language) {
        case "english":
            return "\u{1f1fa}\u{1f1f8}";
        case "english_gb":
            return "\u{1f1ec}\u{1f1e7}";
        case "german":
            return "\u{1f1e9}\u{1f1ea}";
        case "ukrainian":
            return "\u{1f1fa}\u{1f1e6}";
        case "russian":
            return "\u{1f1f7}\u{1f1fa}";
        case "italian":
            return "\u{1f1ee}\u{1f1f9}";
        case "french":
            return "\u{1f1eb}\u{1f1f7}";
        case "dutch":
            return "\u{1f1f3}\u{1f1f1}";
        case "polish":
            return "\u{1f1f5}\u{1f1f1}";
        case "hebrew":
            return "\u{1f1ee}\u{1f1f1}";
        case "indonesian":
            return "\u{1f1ee}\u{1f1e9}";
    }
};

const set_lobbies = (lobbies, visible) => {
    const new_lobby_nodes = lobbies.map((lobby) => {
        const lobby_list_item = document.createElement("div");
        lobby_list_item.className = "lobby-list-item";

        const language_flag = document.createElement("span");
        language_flag.className = "language-flag";
        language_flag.setAttribute("title", lobby.wordpack);
        language_flag.setAttribute("english", lobby.wordpack);
        language_flag.innerText = language_to_flag(lobby.wordpack);

        const lobby_list_rows = document.createElement("div");
        lobby_list_rows.className = "lobby-list-rows";

        const lobby_list_row_a = document.createElement("div");
        lobby_list_row_a.className = "lobby-list-row";

        const new_custom_tag = (text) => {
            const tag = document.createElement("span");
            tag.className = "custom-tag";
            tag.innerText = text;
            return tag;
        };
        if (lobby.customWords) {
            lobby_list_row_a.appendChild(
                new_custom_tag('{{.Translation.Get "custom-words"}}'),
            );
        }
        if (lobby.state === "ongoing") {
            lobby_list_row_a.appendChild(
                new_custom_tag('{{.Translation.Get "ongoing"}}'),
            );
        }
        if (lobby.state === "gameover") {
            lobby_list_row_a.appendChild(
                new_custom_tag('{{.Translation.Get "game-over-lobby"}}'),
            );
        }

        if (lobby.scoring === "chill") {
            lobby_list_row_a.appendChild(
                new_custom_tag('{{.Translation.Get "chill"}}'),
            );
        } else if (lobby.scoring === "competitive") {
            lobby_list_row_a.appendChild(
                new_custom_tag('{{.Translation.Get "competitive"}}'),
            );
        }

        const lobby_list_row_b = document.createElement("div");
        lobby_list_row_b.className = "lobby-list-row";

        const create_info_pair = (icon, text) => {
            const element = document.createElement("div");
            element.className = "lobby-list-item-info-pair";

            const image = document.createElement("img");
            image.className = "lobby-list-item-icon lobby-list-icon-loading";
            image.setAttribute("loading", "lazy");
            image.addEventListener("load", function () {
                image.classList.remove("lobby-list-icon-loading");
            });
            image.setAttribute("src", icon);

            const span = document.createElement("span");
            span.innerText = text;

            element.replaceChildren(image, span);
            return element;
        };
        const user_pair = create_info_pair(
            `{{.RootPath}}/resources/{{.WithCacheBust "user.svg"}}`,
            `${lobby.playerCount}/${lobby.maxPlayers}`,
        );
        const round_pair = create_info_pair(
            `{{.RootPath}}/resources/{{.WithCacheBust "round.svg"}}`,
            `${lobby.round}/${lobby.rounds}`,
        );
        const time_pair = create_info_pair(
            `{{.RootPath}}/resources/{{.WithCacheBust "clock.svg"}}`,
            `${lobby.drawingTime}`,
        );

        lobby_list_row_b.replaceChildren(user_pair, round_pair, time_pair);

        lobby_list_rows.replaceChildren(lobby_list_row_a, lobby_list_row_b);

        const join_button = document.createElement("button");
        join_button.className = "join-button";
        join_button.innerText = '{{.Translation.Get "join"}}';
        join_button.addEventListener("click", () => {
            window.location.href = `{{.RootPath}}/lobby/${lobby.lobbyId}`;
        });

        lobby_list_item.replaceChildren(
            language_flag,
            lobby_list_rows,
            join_button,
        );

        return lobby_list_item;
    });
    lobby_list.replaceChildren(...new_lobby_nodes);

    if (lobbies && lobbies.length > 0 && visible) {
        lobby_list.style.display = "flex";
        set_lobby_list_placeholder("", false);
    } else {
        lobby_list.style.display = "none";
        set_lobby_list_placeholder(
            '{{.Translation.Get "no-lobbies-yet"}}',
            true,
        );
    }
};

const refresh_lobby_list = () => {
    set_lobbies([], false);
    set_lobby_list_loading(true);

    getLobbies()
        .then((data) => {
            set_lobbies(data, true);
        })
        .catch((err) => {
            set_lobby_list_placeholder(err, true);
        })
        .finally(() => {
            set_lobby_list_loading(false);
        });
};

const refreshBtn = document.getElementById("refresh-lobby-list-button");
if (refreshBtn && lobby_list) {
    refresh_lobby_list();
    refreshBtn.addEventListener("click", refresh_lobby_list);

    // Makes sure, that navigating back after creating a lobby also shows it in the list.
    window.addEventListener("pageshow", (event) => {
        if (event.persisted) {
            refresh_lobby_list();
        }
    });
}
