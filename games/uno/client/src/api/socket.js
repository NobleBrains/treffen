import store from "@/store";
import io from "socket.io-client";
const SERVER_URL =
  typeof window !== "undefined" && window.location && window.location.origin
    ? window.location.origin
    : "http://localhost:8085";

const socket = io(SERVER_URL);
store.commit("SET_SOCKET", socket);

// track connection status
socket.on("connect", () => store.commit("SET_IS_CONNECTED", true));
socket.on("disconnect", () => store.commit("SET_IS_CONNECTED", false));

socket.on("state", (room) => store.commit("SET_ROOM", room));

socket.on("kicked", () => {
  store.commit("RESET_ROOM");
  store.commit("KICKED");
});
