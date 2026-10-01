<script>
import UMenuModal from "@/components/Menu/UMenuModal.vue";
import UMenuInput from "@/components/Menu/UMenuInput.vue";
import UMenuBtn from "@/components/Menu/UMenuBtn.vue";
import USettingsMenu from "../components/USettingsMenu.vue";

import menuOptions from "@/mixins/menuOptions";

let observer;

export default {
  name: "Home",
  components: {
    UMenuModal,
    UMenuInput,
    UMenuBtn,
    USettingsMenu,
  },
  mixins: [menuOptions],
  data() {
    return {
      isMounted: false,
      formError: "",
      copied: false,
      createRoomSoloForm: {
        username: "You",
        settings: {
          stacking: true,
          forcePlay: false,
          bluffing: false,
          drawToPlay: false,
          seven0: false,
          jumpIn: false,
          public: false,
          maxPlayers: 8,
        },
      },
      createRoomForm: {
        username: "",
        roomCode: "",
        settings: {
          stacking: true,
          forcePlay: false,
          bluffing: false,
          drawToPlay: false,
          seven0: false,
          jumpIn: false,
          public: false,
          maxPlayers: 8,
        },
      },
      joinRoomForm: {
        username: "",
        roomCode: "",
      },
      optionsWidth: 0,
      showCreateRoomSoloModal: false,
      showCreateRoomModal: false,
      showJoinRoomModal: false,
      showSettingsModal: false,
      showPublicRoomsModal: false,
      publicRooms: [],
      fetchingPublicRooms: false,
      isDev: process.env.NODE_ENV !== "production",
      gameAdsInterval: null,
      activeTab: "players",
      lobbyChatMsg: "",
    };
  },
  computed: {
    kicked() {
      return this.$store.state.kicked;
    },
    room() {
      return this.$store.state.room;
    },
    playersList() {
      if (this.room.players && this.room.players.length > 0) {
        return this.room.players;
      }
      const list = [];
      if (this.room.you && this.room.you.username) {
        list.push({ ...this.room.you, isHost: this.room.isHost });
      }
      const otherKeys = [
        "bottomRight",
        "right",
        "topRight",
        "top",
        "topLeft",
        "left",
        "bottomLeft",
      ];
      for (const key of otherKeys) {
        const p = this.room[key];
        if (p && p.username) {
          list.push({ ...p, isHost: p.id === this.room.host, bot: p.isBot });
        }
      }
      return list;
    },
    hostDisplayName() {
      const host = this.playersList.find((p) => p.isHost);
      if (!host) return "SunoS";
      if (host.id === this.room.you?.id) return "Dein";
      return `${host.username}'s`;
    },
    currentSettings() {
      return (
        this.room.settings || {
          stacking: true,
          forcePlay: false,
          drawToPlay: false,
          jumpIn: false,
          seven0: false,
          public: false,
          maxPlayers: 8,
        }
      );
    },
    canStartGame() {
      return this.room.isHost && this.playersList.length >= 2;
    },
    optionsScale() {
      return Math.min(this.$store.state.windowWidth / 1500, 1);
    },
    optionsOffsetLeft() {
      const windowWidth = this.$store.state.windowWidth;
      if (this.isMounted && windowWidth < this.optionsWidth) {
        return (windowWidth - this.optionsWidth) / 2;
      }

      return 0;
    },
    optionsOffsetTop() {
      const windowHeight = this.$store.state.windowHeight;
      if (this.isMounted && windowHeight < this.$refs.options.clientHeight)
        return (windowHeight - this.$refs.options.clientHeight) / 2 + 10;

      return 0;
    },
  },
  watch: {
    kicked() {
      if (!this.room.id) {
        this.currentLevel = "online";
      }
    },
    room(room) {
      const players = [room.you];

      if (room.bottomRight) players.push(room.bottomRight);
      if (room.right) players.push(room.right);
      if (room.topRight) players.push(room.topRight);
      if (room.top) players.push(room.top);
      if (room.topLeft) players.push(room.topLeft);
      if (room.left) players.push(room.left);
      if (room.bottomLeft) players.push(room.bottomLeft);

      const solo = [];
      for (let i = 0; i < players.length; i++) {
        const p = players[i];

        solo.push({
          action: `${p.id === room.host ? "♛ " : ""}${
            p.id === room.you.id ? "Du" : p.username
          }`,
          alwaysShowAction: true,
          graphic: require("@/assets/solo.jpg"),
          func: () => this.kickPlayer(i),
        });
      }

      if (solo.length < room.maxPlayers && room.isHost) {
        solo.push({
          action: "Bot hinzufügen",
          graphic: require("@/assets/plus.jpg"),
          func: () => this.addBot(),
        });
      }

      if (this.room.id) {
        this.options[this.currentLevel] = solo;
      }

      if (room.started) {
        if (this.$route.name !== "Game") this.$router.push({ name: "Game" });
      }

      // if (room.id === "") {
      //   this.currentLevel = "online";
      // }
    },
  },
  methods: {
    createRoom() {
      // validate form
      if (
        this.createRoomForm.username.length < 2 ||
        this.createRoomForm.username.length > 11
      )
        return (this.formError =
          "Username must be between 2 and 11 characters");
      if (
        this.createRoomForm.roomCode &&
        (this.createRoomForm.roomCode.length < 4 ||
          this.createRoomForm.roomCode.length > 12)
      )
        return (this.formError =
          "Room Code must be between 4 and 12 characters");

      this.currentLevel = "onlineRoom";
      this.showCreateRoomModal = false;
      this.formError = "";

      this.$store.state.socket.emit("create-room", this.createRoomForm);
    },
    createRoomSolo() {
      if (
        this.createRoomSoloForm.username.length < 2 ||
        this.createRoomSoloForm.username.length > 11
      )
        return (this.formError =
          "Username must be between 2 and 11 characters");

      this.currentLevel = "solo";
      this.showCreateRoomSoloModal = false;
      this.formError = "";

      this.$store.state.socket.emit("create-room", this.createRoomSoloForm);
    },
    joinRoom() {
      // validate form
      if (
        this.joinRoomForm.username.length < 2 ||
        this.joinRoomForm.username.length > 11
      )
        return (this.formError =
          "Username must be between 2 and 11 characters");
      if (
        this.joinRoomForm.roomCode.length < 4 ||
        this.joinRoomForm.roomCode.length > 13
      )
        return (this.formError =
          "Room Code must be between 4 and 12 characters");

      this.currentLevel = "onlineRoom";
      this.showJoinRoomModal = false;
      this.formError = "";

      this.$store.state.socket.emit("join-room", this.joinRoomForm);
    },
    addBot() {
      this.$store.state.socket.emit("add-bot");
    },
    kickPlayer(i) {
      switch (i) {
        case 1:
          this.$store.state.socket.emit("kick-player", this.room.bottomRight.id);
          break;
        case 2:
          this.$store.state.socket.emit("kick-player", this.room.right.id);
          break;
        case 3:
          this.$store.state.socket.emit("kick-player", this.room.topRight.id);
          break;
        case 4:
          this.$store.state.socket.emit("kick-player", this.room.top.id);
          break;
        case 5:
          this.$store.state.socket.emit("kick-player", this.room.topLeft.id);
          break;
        case 6:
          this.$store.state.socket.emit("kick-player", this.room.left.id);
          break;
        case 7:
          this.$store.state.socket.emit("kick-player", this.room.bottomLeft.id);
          break;
      }
    },
    backOptions() {
      this.options[this.currentLevel + "Back"]();
    },
    copyJoinRoomLink() {
      const link = `${window.location.origin}/?room=${encodeURI(this.room.id)}`;
      window.navigator.clipboard
        .writeText(link)
        .then(() => {
          this.copied = true
          setTimeout(() => this.copied = false, 2000)
        })
        .catch((err) =>
          alert(`Sorry we couldn't copy the link to the clipboard: ${err}`)
        );
    },
    closeJoinRoomModal() {
      this.showJoinRoomModal = false;
      this.formError = "";

      if (this.currentLevel === "main") {
        this.$router.replace({ query: null });
      }
    },
    fetchPublicRooms() {
      this.$store.state.socket.emit("get-public-rooms");
      this.fetchingPublicRooms = true;
    },
    gameadsClicked() {
      window.gameadsClicked();
    },
    toggleRule(key) {
      if (!this.room.isHost) return;
      const current = !!this.currentSettings[key];
      this.$store.state.socket.emit("update-settings", {
        [key]: !current,
      });
    },
    kickPlayerById(id) {
      if (!this.room.isHost) return;
      this.$store.state.socket.emit("kick-player", id);
    },
    startGame() {
      if (!this.room.isHost || !this.canStartGame) return;
      this.$store.state.socket.emit("start-game");
    },
    sendLobbyChat() {
      const text = (this.lobbyChatMsg || "").trim();
      if (!text || text.length > 300) return;
      const socket = this.$store.state.socket;
      if (!socket) return;
      socket.emit("room-send-message", {
        text,
        username: this.room.you?.username || "Spieler",
        id: this.room.you?.id || "",
        time: Date.now(),
      });
      this.lobbyChatMsg = "";
      this.$nextTick(() => {
        if (this.$refs.chatScroll) {
          this.$refs.chatScroll.scrollTop = this.$refs.chatScroll.scrollHeight;
        }
      });
    },
    getAvatarColor(name) {
      const colors = [
        "#e11d48",
        "#2563eb",
        "#16a34a",
        "#d97706",
        "#9333ea",
        "#0891b2",
        "#ea580c",
        "#4f46e5",
      ];
      let hash = 0;
      for (let i = 0; i < (name || "").length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    },
  },
  mounted() {
    this.isMounted = true;

    if (this.$refs.options) {
      observer = new ResizeObserver(() => {
        this.optionsWidth = this.$refs.options?.clientWidth || 0;
      });
      observer.observe(this.$refs.options);
    }

    const roomCode = this.$route.query.room || this.$route.query.lobby;
    const name = this.$route.query.name || this.$route.query.username;
    if (name) {
      this.joinRoomForm.username = name;
      this.createRoomForm.username = name;
    }
    if (roomCode && name) {
      this.currentLevel = "onlineRoom";
      this.showJoinRoomModal = false;
      const doJoin = () => {
        this.$store.state.socket.emit("join-or-create-room", {
          username: name,
          roomCode: roomCode,
        });
      };
      if (this.$store.state.isConnected) {
        doJoin();
      } else {
        const unwatch = this.$watch(
          () => this.$store.state.isConnected,
          (connected) => {
            if (connected) {
              doJoin();
              unwatch();
            }
          }
        );
      }
    } else if (roomCode) {
      this.joinRoomForm.roomCode = roomCode;
      this.createRoomForm.roomCode = roomCode;
      this.showJoinRoomModal = true;
    }

    this.$store.state.socket.on("recieve-public-rooms", (rooms) => {
      this.publicRooms = rooms;
      this.fetchingPublicRooms = false;
    });

    // if (window.innerWidth >= 900 && !this.$store.state.reloading) {
    //   window.GameAdsRenew("gameadsbanner");
    // }

    // this.gameAdsInterval = setInterval(() => {
    //   const scripts = Array.from(document.getElementsByTagName("script"));
    //   scripts.forEach((s) => {
    //     if (s.src.includes("https://n.gameads.io/getcode?")) s.remove();
    //   });

    //   if (window.innerWidth >= 900 && !this.$store.state.reloading) {
    //     window.GameAdsRenew("gameadsbanner");
    //   }
    // }, 17000);

    if (this.$route.params.playAgain) {
      this.currentLevel = "onlineRoom";
    }

    // request anchor ads
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.$store.state.adClient}`;
    script.id = "anchor-ads-script";

    if (!this.$store.state.reloading) document.body.appendChild(script);
  },
  beforeDestroy() {
    const script = document.getElementById("anchor-ads-script");
    if (script) script.remove();

    // destroy anchor ads
    const ads = Array.from(document.querySelectorAll(".adsbygoogle"));
    ads.forEach((a) => {
      if (!a.parentElement.classList.contains("ad")) {
        a.remove();
      }
    });
  },
  destroyed() {
    if (this.gameadsInterval) clearInterval(this.gameAdsInterval);

    if (observer) observer.disconnect();
    this.$store.state.socket.off("recieve-public-rooms");
  },
};
</script>

<template>
  <section class="home" v-if="!$store.state.reloading">

    <u-menu-modal
      v-if="showCreateRoomSoloModal"
      @close="
        showCreateRoomSoloModal = false;
        formError = '';
      "
      title="Create Solo Room"
    >
      <u-menu-input
        v-model="createRoomSoloForm.username"
        label="Username (required)"
        placeholder="Your username..."
      />

      <div class="rules">
        <u-menu-input
          v-model="createRoomSoloForm.settings.forcePlay"
          label="Force Play"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomSoloForm.settings.drawToPlay"
          label="Draw To Play"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomSoloForm.settings.stacking"
          label="Stacking"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomSoloForm.settings.jumpIn"
          label="Jump In"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomSoloForm.settings.seven0"
          label="7-0"
          type="checkbox"
          class="rule"
        />
      </div>

      <div v-if="formError" class="response error">
        <p>{{ formError }}</p>
      </div>

      <u-menu-btn @click="createRoomSolo">Create Room</u-menu-btn>
    </u-menu-modal>

    <u-menu-modal
      v-if="showCreateRoomModal"
      @close="
        showCreateRoomModal = false;
        formError = '';
      "
      title="Create Room"
    >
      <u-menu-input
        v-model="createRoomForm.username"
        label="Username (required)"
        placeholder="Your username..."
      />

      <u-menu-input
        v-model="createRoomForm.roomCode"
        label="Room Code (optional)"
        placeholder="Custom room code..."
      />

      <u-menu-input
        v-model="createRoomForm.settings.maxPlayers"
        :label="`Max Players (${createRoomForm.settings.maxPlayers})`"
        type="range"
      />

      <u-menu-input
        v-model="createRoomForm.settings.public"
        label="Public (shown in public rooms list)"
        type="checkbox"
      />

      <div class="rules">
        <u-menu-input
          v-model="createRoomForm.settings.forcePlay"
          label="Force Play"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomForm.settings.drawToPlay"
          label="Draw To Play"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomForm.settings.stacking"
          label="Stacking"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomForm.settings.jumpIn"
          label="Jump In"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomForm.settings.seven0"
          label="7-0"
          type="checkbox"
          class="rule"
        />
      </div>

      <div v-if="formError" class="response error">
        <p>{{ formError }}</p>
      </div>

      <u-menu-btn @click="createRoom">Create Room</u-menu-btn>
    </u-menu-modal>

    <u-menu-modal
      v-if="showJoinRoomModal"
      @close="closeJoinRoomModal"
      title="Join Room"
    >
      <u-menu-input
        v-model="joinRoomForm.username"
        label="Username (required)"
        placeholder="Your username..."
      />

      <u-menu-input
        v-model="joinRoomForm.roomCode"
        label="Room Code (required)"
        placeholder="Room code..."
      />

      <div v-if="formError" class="response error">
        <p>{{ formError }}</p>
      </div>

      <u-menu-btn @click="joinRoom()">Join Room</u-menu-btn>
    </u-menu-modal>

    <u-settings-menu
      v-if="showSettingsModal"
      title="Settings"
      class="settings-modal"
      @exit="backOptions"
      @close="backOptions"
    />

    <u-menu-modal
      v-if="showPublicRoomsModal"
      @close="showPublicRoomsModal = false"
      class="public-rooms-modal"
    >
      <div class="room rooms-header">
        <div>
          <p class="host">Host</p>
          <p class="code">Code</p>
        </div>

        <div>
          <p class="players">Players</p>
          <u-menu-btn class="join-btn" style="opacity: 0; pointer-events: none"
            >Join</u-menu-btn
          >
        </div>
      </div>
      <div class="rooms">
        <div class="room" v-for="room in publicRooms" :key="room.code">
          <div>
            <p class="host">{{ room.host }}</p>
            <p class="code">{{ room.code }}</p>
          </div>

          <div>
            <p class="players">
              {{ room.playerCount }} / {{ room.maxPlayers }}
            </p>
            <u-menu-btn
              class="join-btn"
              @click="
                joinRoomForm.roomCode = room.code;
                showPublicRoomsModal = false;
                showJoinRoomModal = true;
              "
            >
              Join
            </u-menu-btn>
          </div>
        </div>
      </div>
    </u-menu-modal>

    <!-- MODERN SCUFFED UNO ROOM LOBBY (MATCHING ORIGINAL SCUFFED UNO) -->
    <div class="scuffed-room-lobby">
      <!-- Top header bar for the room -->
      <div class="lobby-topbar">
        <div class="topbar-title">
          {{ hostDisplayName }} Raum
        </div>
        <div class="topbar-status">
          <span class="live-dot"></span>
          <span>Online ({{ playersList.length }}/{{ room.maxPlayers || 8 }})</span>
        </div>
      </div>

      <!-- Main lobby container -->
      <div class="lobby-card-container">
        <!-- Left Column: Settings, Mode & Start Game -->
        <aside class="lobby-sidebar">
          <div class="sidebar-header">
            <h2 class="sidebar-room-name">{{ hostDisplayName }} Raum</h2>
            <div class="players-counter-box">
              <span class="counter-label">SPIELER</span>
              <span class="counter-value">{{ playersList.length }}/{{ room.maxPlayers || 8 }}</span>
            </div>
          </div>

          <div class="mode-selector">
            <button class="mode-pill active">SOLO</button>
            <button class="mode-pill disabled" title="In dieser Version standardmäßig Jeder-gegen-Jeden">DUO</button>
            <button class="mode-pill disabled" title="In dieser Version standardmäßig Jeder-gegen-Jeden">TRIO</button>
          </div>

          <div class="rules-section">
            <div class="rules-header">
              <h3>Regeln</h3>
              <span class="rules-hint" v-if="room.isHost">(Klicken zum Umschalten)</span>
              <span class="rules-hint" v-else>(Vom Host festgelegt)</span>
            </div>

            <div class="rules-grid">
              <!-- Stacking -->
              <button
                class="rule-box"
                :class="{ active: currentSettings.stacking, disabled: !room.isHost }"
                @click="toggleRule('stacking')"
                :title="room.isHost ? 'Stacking umschalten' : 'Stacking: ' + (currentSettings.stacking ? 'Aktiv' : 'Aus')"
              >
                <div class="rule-icon-art stacking-art">
                  <div class="stacking-grid">
                    <span>+8</span><span>+6</span>
                    <span>+4</span><span>+2</span>
                  </div>
                </div>
                <span class="rule-label">Stacking</span>
              </button>

              <!-- Force Play -->
              <button
                class="rule-box"
                :class="{ active: currentSettings.forcePlay, disabled: !room.isHost }"
                @click="toggleRule('forcePlay')"
                :title="room.isHost ? 'Force Play umschalten' : 'Force Play: ' + (currentSettings.forcePlay ? 'Aktiv' : 'Aus')"
              >
                <div class="rule-icon-art card-art">
                  <span class="mini-card-icon">🎴</span>
                </div>
                <span class="rule-label">Force Play</span>
              </button>

              <!-- Draw To Play -->
              <button
                class="rule-box"
                :class="{ active: currentSettings.drawToPlay, disabled: !room.isHost }"
                @click="toggleRule('drawToPlay')"
                :title="room.isHost ? 'Draw To Play umschalten' : 'Draw To Play: ' + (currentSettings.drawToPlay ? 'Aktiv' : 'Aus')"
              >
                <div class="rule-icon-art fan-art">
                  <span class="mini-card-icon">🃏🃏</span>
                </div>
                <span class="rule-label">Draw To Play</span>
              </button>

              <!-- Jump In -->
              <button
                class="rule-box"
                :class="{ active: currentSettings.jumpIn, disabled: !room.isHost }"
                @click="toggleRule('jumpIn')"
                :title="room.isHost ? 'Jump In umschalten' : 'Jump In: ' + (currentSettings.jumpIn ? 'Aktiv' : 'Aus')"
              >
                <div class="rule-icon-art jump-art">
                  <span class="mini-card-icon">⚡ 1</span>
                </div>
                <span class="rule-label">Jump In</span>
              </button>

              <!-- 7-0 -->
              <button
                class="rule-box"
                :class="{ active: currentSettings.seven0, disabled: !room.isHost }"
                @click="toggleRule('seven0')"
                :title="room.isHost ? '7-0 umschalten' : '7-0: ' + (currentSettings.seven0 ? 'Aktiv' : 'Aus')"
              >
                <div class="rule-icon-art swap-art">
                  <span class="mini-card-icon">🔄</span>
                </div>
                <span class="rule-label">7-0</span>
              </button>

              <!-- Public -->
              <button
                class="rule-box"
                :class="{ active: currentSettings.public, disabled: !room.isHost }"
                @click="toggleRule('public')"
                :title="room.isHost ? 'Öffentlich umschalten' : 'Öffentlich: ' + (currentSettings.public ? 'Aktiv' : 'Aus')"
              >
                <div class="rule-icon-art globe-art">
                  <span class="mini-card-icon">🌐</span>
                </div>
                <span class="rule-label">Öffentlich</span>
              </button>
            </div>
          </div>

          <div class="sidebar-start-area">
            <button
              class="lobby-start-btn"
              :class="{ ready: canStartGame, disabled: !room.isHost || !canStartGame }"
              :disabled="!room.isHost || !canStartGame"
              @click="startGame"
            >
              <span v-if="room.isHost && canStartGame">🎮 Spiel starten</span>
              <span v-else-if="room.isHost">⏳ Mind. 2 Spieler oder 1 Bot</span>
              <span v-else>Warte auf Host...</span>
            </button>
          </div>
        </aside>

        <!-- Right Column: Player Cards & Chat Tabs -->
        <main class="lobby-main">
          <!-- Top Tabs -->
          <div class="lobby-tab-bar">
            <button
              class="lobby-tab-btn"
              :class="{ active: activeTab === 'players' }"
              @click="activeTab = 'players'"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>Spieler ({{ playersList.length }})</span>
            </button>

            <button
              class="lobby-tab-btn"
              :class="{ active: activeTab === 'chat' }"
              @click="activeTab = 'chat'"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span>Chat</span>
              <span v-if="room.chat && room.chat.length > 0" class="chat-tab-count">{{ room.chat.length }}</span>
            </button>
          </div>

          <!-- Players Grid Tab -->
          <div v-show="activeTab === 'players'" class="players-pane">
            <div class="players-grid">
              <!-- Player Cards -->
              <div
                v-for="p in playersList"
                :key="p.id"
                class="player-card"
                :class="{ 'is-you': p.id === room.you.id, 'is-bot': p.bot }"
              >
                <!-- Kick button if Host -->
                <button
                  v-if="room.isHost && p.id !== room.you.id"
                  class="player-kick-btn"
                  @click.stop="kickPlayerById(p.id)"
                  title="Spieler entfernen"
                >
                  ✕
                </button>

                <!-- Avatar Box -->
                <div class="player-avatar-box" :style="{ backgroundColor: getAvatarColor(p.username) }">
                  <span v-if="p.bot" class="avatar-bot-icon">🤖</span>
                  <div v-else class="avatar-pattern">
                    <span class="avatar-letter">{{ p.username ? p.username.charAt(0).toUpperCase() : '?' }}</span>
                  </div>
                </div>

                <!-- Username -->
                <div class="player-name-row" :title="p.username">
                  <span class="player-name">{{ p.username }}</span>
                </div>

                <!-- Badges -->
                <div class="player-badges">
                  <span v-if="p.isHost" class="badge badge-host">Host</span>
                  <span v-if="p.id === room.you.id" class="badge badge-you">Du</span>
                  <span v-if="p.bot" class="badge badge-bot">Bot</span>
                </div>
              </div>

              <!-- Add Bot Card -->
              <div
                v-if="playersList.length < (room.maxPlayers || 8) && room.isHost"
                class="add-bot-card"
                @click="addBot"
                title="Einen KI-Bot zur Runde hinzufügen"
              >
                <div class="add-bot-plus">+</div>
                <div class="add-bot-label">Bot hinzufügen</div>
              </div>
            </div>
          </div>

          <!-- Chat Tab -->
          <div v-show="activeTab === 'chat'" class="chat-pane">
            <div class="chat-messages-scroll" ref="chatScroll">
              <div v-if="!room.chat || room.chat.length === 0" class="chat-empty">
                Noch keine Nachrichten. Schreib die erste Begrüßung! 👋
              </div>
              <div
                v-for="(msg, idx) in room.chat"
                :key="idx"
                class="chat-bubble-row"
                :class="{ 'chat-own': msg.id === room.you.id }"
              >
                <div class="chat-bubble">
                  <div class="chat-sender" v-if="msg.id !== room.you.id">{{ msg.username }}</div>
                  <div class="chat-text">{{ msg.text }}</div>
                </div>
              </div>
            </div>

            <form class="chat-input-bar" @submit.prevent="sendLobbyChat">
              <input
                v-model="lobbyChatMsg"
                type="text"
                placeholder="Nachricht schreiben..."
                maxlength="300"
              />
              <button type="submit" :disabled="!lobbyChatMsg.trim()">Senden</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
$mobile: 900px;

.gameads-container {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  display: flex;
  flex-direction: row-reverse;
  align-items: center;

  @media screen and (max-width: $mobile) {
    display: none;
  }
}

.ad-home-left {
  @media screen and (max-height: 725px) {
    display: none;
  }

  &-wide {
    @media screen and (max-width: 1680px) {
      display: none;
    }
  }
}

.ad-home-right {
  display: block !important;
}

.watermark {
  color: white;
  opacity: 0.5;
  font-size: clamp(1rem, 2vw, 1.3rem);
  position: absolute;
  bottom: 1.5vh;
  right: 1.1vw;
  font-weight: bold;

  &.stats-link {
    left: 1.1vw;
    right: unset;
    text-decoration: underline;
  }

  span {
    text-decoration: underline;
  }
}

img {
  user-select: none;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

.home {
  width: 100%;
  height: 100%;
  color: white;
  display: flex;
  flex-direction: column;

  .header {
    width: 100%;
    height: MIN(18%, 120px);
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    .logo {
      margin-left: 10px;
      width: auto;
      height: 100%;
      user-select: none;
      -webkit-user-drag: none;
      transform: scale(0.9);

      &.back {
        cursor: pointer;
      }
    }

    .title {
      margin-left: clamp(5px, 2vw, 20px);
      font-size: clamp(1.7rem, 4vw, 2.5rem);
      font-weight: bold;
    }

    .header-ad {
      display: flex;
      flex-grow: 1;
      height: 100%;
    }
  }

  .options {
    margin: auto;
    display: flex;

    @media screen and (max-width: $mobile) {
      padding-top: 65px;
    }

    * {
      margin-right: -100px;

      &:hover {
        margin-right: 20px;
      }

      &:last-of-type {
        margin-right: 0;

        &:hover {
          margin-left: 120px;
        }
      }
    }
  }

  // .rules-title {
  //   font-size: 1.6rem;
  //   font-weight: bold;
  //   margin: 1rem auto 0.5rem 0;
  // }

  .rules {
    display: flex;
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;

    .rule {
      width: auto;
      align-items: center;
    }
  }

  .room-info {
    margin-left: auto;
    margin-right: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    .code {
      font-size: CLAMP(1.1rem, 2.5vw, 1.5rem);
      font-weight: bold;
      color: rgba(255, 255, 255, 0.6);
      padding: 4px 0;

      span {
        color: #fff;
      }

      .copy {
        text-decoration: underline;
        font-weight: bold;
        margin-left: MIN(1vw, 12px);
        color: #53a944;
        outline: none;
        transition: color 0.2s ease;

        &:hover,
        &:focus {
          color: #50ff31;
        }
      }
    }

    .start-game-btn {
      font-size: CLAMP(1.2rem, 3vw, 1.8rem);
      border: 4px solid white;
      padding: 0 3vw;
      height: 85%;
    }
  }

  .response {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    background-color: rgba(0, 255, 64, 0.459);
    border: 2px solid rgb(0, 255, 64);
    border-radius: 8px;
    color: rgb(0, 255, 64);
    font-weight: bold;
    font-size: 1.1em;
    margin-bottom: 25px;

    p {
      margin-left: 3%;
    }

    &.error {
      background-color: rgba(255, 0, 0, 0.459);
      border: 2px solid rgb(255, 0, 0);
      color: rgb(255, 0, 0);
    }
  }

  .settings-modal {
    background: transparent;
    z-index: 0;
  }

  .public-rooms-modal {
    .refresh-btn {
      font-size: 1.3rem;
      padding: 0.9rem;
    }

    .rooms {
      width: 100%;
      display: flex;
      flex-direction: column;
      height: 60vh;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        background: transparent;
        width: 7px;

        &::-webkit-scrollbar-thumb {
          border-radius: 3px;
          background-color: rgb(141, 141, 141);
        }
      }
    }

    .room {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1rem;
      height: 3rem;
      margin: 0.4rem 0;
      position: relative;

      &.rooms-header {
        width: 100%;
        font-weight: bold;

        .join-btn {
          opacity: 0;
          pointer-events: none;
        }

        .players {
          margin-left: -7px;
        }
      }

      div {
        display: flex;
        align-items: center;
      }

      .code {
        position: absolute;
        margin-left: 8rem;
      }

      .host {
        max-width: 6rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .players {
        margin-right: 1.2rem;
      }

      .join-btn {
        font-size: 1rem;
        padding: 0.6rem 1.2rem;
        width: auto;
        background-color: rgb(22, 179, 43);

        &:hover {
          background-color: rgb(54, 138, 65);
        }
      }
    }
  }
}

// ==========================================
// Modern Scuffed Uno Room Lobby
// ==========================================
.scuffed-room-lobby {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 20px 20px 20px;
  background: radial-gradient(circle at center, #9e1a1a 0%, #700f0f 100%);
  overflow-y: auto;
  position: relative;
  z-index: 10;

  .lobby-topbar {
    width: 100%;
    max-width: 1160px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    padding: 0 4px;

    .topbar-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      padding: 7px 14px;
      border-radius: 999px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.28);
        transform: translateX(-2px);
      }
    }

    .topbar-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      letter-spacing: -0.3px;
    }

    .topbar-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.3);
      padding: 6px 14px;
      border-radius: 999px;
      color: #f1f5f9;
      font-size: 0.88rem;
      font-weight: 600;

      .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #22c55e;
        box-shadow: 0 0 8px #22c55e;
      }
    }
  }

  .lobby-card-container {
    width: 100%;
    max-width: 1160px;
    min-height: 580px;
    max-height: calc(100vh - 80px);
    background: #ffffff;
    border-radius: 18px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
    display: flex;
    overflow: hidden;

    @media screen and (max-width: 900px) {
      flex-direction: column;
      max-height: none;
    }
  }

  // --- Sidebar ---
  .lobby-sidebar {
    width: 320px;
    min-width: 300px;
    background: #fdf4f5;
    border-right: 1.5px solid #fecdd3;
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow-y: auto;

    @media screen and (max-width: 900px) {
      width: 100%;
      min-width: 0;
      border-right: none;
      border-bottom: 1.5px solid #fecdd3;
    }

    .sidebar-header {
      text-align: center;
      margin-bottom: 16px;

      .sidebar-room-name {
        font-size: 1.45rem;
        font-weight: 800;
        color: #e11d48;
        margin: 0 0 10px 0;
        line-height: 1.2;
      }

      .players-counter-box {
        display: flex;
        flex-direction: column;
        align-items: center;

        .counter-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 1px;
        }

        .counter-value {
          font-size: 2.1rem;
          font-weight: 900;
          color: #1e293b;
          line-height: 1.1;
        }
      }
    }

    .mode-selector {
      display: flex;
      gap: 6px;
      justify-content: center;
      margin-bottom: 20px;

      .mode-pill {
        border: none;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 0.82rem;
        font-weight: 700;
        cursor: default;

        &.active {
          background: #e11d48;
          color: #ffffff;
          box-shadow: 0 2px 6px rgba(225, 29, 72, 0.35);
        }

        &.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          opacity: 0.7;
        }
      }
    }

    .rules-section {
      flex: 1;

      .rules-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 10px;

        h3 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #334155;
          margin: 0;
        }

        .rules-hint {
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 500;
        }
      }

      .rules-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 18px;

        .rule-box {
          border: none;
          background: #cbd5e1;
          border-radius: 12px;
          padding: 8px 4px 6px 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

          &.active {
            background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
            box-shadow: 0 4px 10px rgba(225, 29, 72, 0.3);

            .rule-icon-art {
              color: #ffffff;
            }

            .rule-label {
              color: #ffffff;
            }
          }

          &.disabled {
            cursor: not-allowed;
            opacity: 0.75;
          }

          &:hover:not(.disabled) {
            transform: translateY(-2px);
          }

          .rule-icon-art {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #475569;
            font-weight: 900;
            line-height: 1;

            .stacking-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2px;
              font-size: 0.75rem;
              text-align: center;
              font-weight: 900;
            }

            .mini-card-icon {
              font-size: 1.35rem;
            }
          }

          .rule-label {
            font-size: 0.68rem;
            font-weight: 700;
            color: #475569;
            margin-top: 4px;
            text-align: center;
            white-space: nowrap;
          }
        }
      }
    }

    .sidebar-start-area {
      margin-top: auto;
      padding-top: 14px;

      .lobby-start-btn {
        width: 100%;
        border: none;
        padding: 14px;
        border-radius: 12px;
        font-size: 1.15rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);

        &.ready {
          background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
          color: #ffffff;
          box-shadow: 0 6px 18px rgba(225, 29, 72, 0.4);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 22px rgba(225, 29, 72, 0.5);
          }
        }

        &.disabled {
          background: #e2e8f0;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }
      }
    }
  }

  // --- Right Main Panel ---
  .lobby-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    background: #ffffff;
    box-sizing: border-box;
    overflow: hidden;

    .lobby-tab-bar {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 1.5px solid #f1f5f9;
      padding-bottom: 14px;

      .lobby-tab-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: none;
        padding: 9px 20px;
        border-radius: 10px;
        font-size: 0.95rem;
        font-weight: 700;
        color: #64748b;
        background: #f1f5f9;
        cursor: pointer;
        transition: all 0.18s ease;

        &.active {
          background: #ffe4e6;
          color: #e11d48;
        }

        &:hover:not(.active) {
          background: #e2e8f0;
        }

        .chat-tab-count {
          background: #e11d48;
          color: white;
          font-size: 0.72rem;
          padding: 2px 7px;
          border-radius: 999px;
        }
      }
    }

    .players-pane {
      flex: 1;
      overflow-y: auto;
      padding-right: 4px;

      .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
        gap: 16px;

        .player-card {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 20px 14px 16px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);

          &:hover {
            transform: translateY(-2px);
            border-color: #cbd5e1;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          }

          &.is-you {
            border-color: #c4b5fd;
            background: #faf5ff;
          }

          .player-kick-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            border: none;
            background: #fee2e2;
            color: #dc2626;
            font-size: 0.85rem;
            font-weight: 800;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;

            &:hover {
              background: #ef4444;
              color: #ffffff;
            }
          }

          .player-avatar-box {
            width: 72px;
            height: 72px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            margin-bottom: 12px;

            .avatar-bot-icon {
              font-size: 2.2rem;
            }

            .avatar-pattern {
              display: flex;
              align-items: center;
              justify-content: center;

              .avatar-letter {
                font-size: 2rem;
                font-weight: 900;
                color: #ffffff;
              }
            }
          }

          .player-name-row {
            width: 100%;
            text-align: center;
            margin-bottom: 8px;

            .player-name {
              font-size: 1.05rem;
              font-weight: 800;
              color: #1e293b;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              display: block;
            }
          }

          .player-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            justify-content: center;

            .badge {
              font-size: 0.72rem;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: 6px;
              text-transform: uppercase;
              letter-spacing: 0.4px;

              &.badge-host {
                background: #f43f5e;
                color: #ffffff;
              }

              &.badge-you {
                background: #8b5cf6;
                color: #ffffff;
              }

              &.badge-bot {
                background: #3b82f6;
                color: #ffffff;
              }
            }
          }
        }

        .add-bot-card {
          min-height: 180px;
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: #e11d48;
            background: #fff1f2;
            transform: translateY(-2px);

            .add-bot-plus,
            .add-bot-label {
              color: #e11d48;
            }
          }

          .add-bot-plus {
            font-size: 3.2rem;
            font-weight: 300;
            color: #64748b;
            line-height: 1;
            margin-bottom: 4px;
            transition: color 0.18s ease;
          }

          .add-bot-label {
            font-size: 1.05rem;
            font-weight: 800;
            color: #475569;
            transition: color 0.18s ease;
          }
        }
      }
    }

    .chat-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .chat-messages-scroll {
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .chat-empty {
          margin: auto;
          color: #94a3b8;
          font-size: 0.95rem;
          font-style: italic;
        }

        .chat-bubble-row {
          display: flex;
          justify-content: flex-start;

          &.chat-own {
            justify-content: flex-end;

            .chat-bubble {
              background: #ffe4e6;
              border-color: #fecdd3;
              color: #9f1239;
            }
          }

          .chat-bubble {
            max-width: 75%;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 8px 14px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

            .chat-sender {
              font-size: 0.72rem;
              font-weight: 700;
              color: #64748b;
              margin-bottom: 2px;
            }

            .chat-text {
              font-size: 0.95rem;
              line-height: 1.35;
              word-break: break-word;
            }
          }
        }
      }

      .chat-input-bar {
        display: flex;
        gap: 10px;
        padding-top: 12px;
        border-top: 1.5px solid #f1f5f9;

        input {
          flex: 1;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.18s ease;

          &:focus {
            border-color: #e11d48;
          }
        }

        button {
          border: none;
          background: #e11d48;
          color: #ffffff;
          font-weight: 700;
          border-radius: 10px;
          padding: 0 20px;
          cursor: pointer;
          transition: all 0.18s ease;

          &:hover:not(:disabled) {
            background: #be123c;
          }

          &:disabled {
            background: #e2e8f0;
            color: #94a3b8;
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>