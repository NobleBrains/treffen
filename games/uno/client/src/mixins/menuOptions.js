export default {
  data() {
    return {
      currentLevel: "onlineRoom",
      options: {
        mainTitle: "Hauptmenü",
        main: [
          {
            action: "Gegen Bots",
            graphic: require("@/assets/solo.jpg"),
            func: () => (this.showCreateRoomSoloModal = true),
          },
          {
            action: "Online spielen",
            graphic: require("@/assets/online.jpg"),
            level: "online",
          },
          {
            action: "Einstellungen",
            graphic: require("@/assets/settings.jpg"),
            level: "settings",
            func: () => (this.showSettingsModal = true),
          },
        ],
        soloTitle: "Gegen Bots",
        soloBack: () => {
          this.$store.state.socket.emit("leave-room");
          this.currentLevel = "main";
        },
        solo: [],

        onlineTitle: "Online-Spiele",
        onlineBack: () => (this.currentLevel = "main"),
        online: [
          {
            action: "Raum beitreten",
            graphic: require("@/assets/arrow.jpg"),
            func: () => (this.showJoinRoomModal = true),
          },
          {
            action: "Raum erstellen",
            graphic: require("@/assets/plus.jpg"),
            func: () => (this.showCreateRoomModal = true),
          },
          {
            action: "Öffentliche Räume",
            graphic: require("@/assets/rooms.jpg"),
            func: () => {
              this.showPublicRoomsModal = true;
              this.fetchPublicRooms();
            },
          },
        ],
        onlineRoomTitle: "Lobby",
        onlineRoomBack: () => {
          this.$store.state.socket.emit("leave-room");
          this.currentLevel = "online";
        },
        onlineRoom: [],
        settingsTitle: "Einstellungen",
        settingsBack: () => {
          this.currentLevel = "main";
          this.showSettingsModal = false;
        },
        settings: [],
      },
    };
  },
};
