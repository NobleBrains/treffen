<script>
import Card from "@/components/Card.vue";

export default {
  name: "UGameOtherCards",
  components: {
    Card,
  },
  props: {
    room: {
      type: Object,
      default() {
        return {};
      },
    },
    swap: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  methods: {
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
};
</script>

<template>
  <div class="other-cards-container">
    <!-- Bottom Right -->
    <div
      v-if="room.bottomRight"
      class="player-station bottomRight"
      :class="{ swap: swap.bottomRight, 'is-turn': room.turn === room.bottomRight.id }"
    >
      <div class="player-info-tag">
        <div class="name-pill">
          <span class="player-name">{{ room.bottomRight.username }}</span>
        </div>
        <div class="avatar-and-stats">
          <div class="avatar-badge" :style="{ backgroundColor: getAvatarColor(room.bottomRight.username) }">
            <span v-if="room.bottomRight.isBot" class="bot-emoji">🤖</span>
            <div v-else class="dots-grid">
              <span v-for="d in 9" :key="d" class="dot"></span>
            </div>
          </div>
          <div class="count-badge">
            <span class="card-num">{{ room.bottomRight.count }}</span>
            <span class="signal-bars">
              <i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="cards-fan" :style="{ '--count': `${room.bottomRight.count}` }">
        <Card
          v-for="i in room.bottomRight.count"
          :key="i + 'bottomRight'"
          back
          :style="{ zIndex: i }"
        />
      </div>
    </div>

    <!-- Right -->
    <div
      v-if="room.right"
      class="player-station right"
      :class="{ swap: swap.right, 'is-turn': room.turn === room.right.id }"
    >
      <div class="player-info-tag">
        <div class="name-pill">
          <span class="player-name">{{ room.right.username }}</span>
        </div>
        <div class="avatar-and-stats">
          <div class="avatar-badge" :style="{ backgroundColor: getAvatarColor(room.right.username) }">
            <span v-if="room.right.isBot" class="bot-emoji">🤖</span>
            <div v-else class="dots-grid">
              <span v-for="d in 9" :key="d" class="dot"></span>
            </div>
          </div>
          <div class="count-badge">
            <span class="card-num">{{ room.right.count }}</span>
            <span class="signal-bars">
              <i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="cards-fan" :style="{ '--count': `${room.right.count}` }">
        <Card
          v-for="i in room.right.count"
          :key="i + 'right'"
          back
          :style="{ zIndex: i }"
        />
      </div>
    </div>

    <!-- Top Right -->
    <div
      v-if="room.topRight"
      class="player-station topRight"
      :class="{ swap: swap.topRight, 'is-turn': room.turn === room.topRight.id }"
    >
      <div class="player-info-tag">
        <div class="name-pill">
          <span class="player-name">{{ room.topRight.username }}</span>
        </div>
        <div class="avatar-and-stats">
          <div class="avatar-badge" :style="{ backgroundColor: getAvatarColor(room.topRight.username) }">
            <span v-if="room.topRight.isBot" class="bot-emoji">🤖</span>
            <div v-else class="dots-grid">
              <span v-for="d in 9" :key="d" class="dot"></span>
            </div>
          </div>
          <div class="count-badge">
            <span class="card-num">{{ room.topRight.count }}</span>
            <span class="signal-bars">
              <i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="cards-fan" :style="{ '--count': `${room.topRight.count}` }">
        <Card
          v-for="i in room.topRight.count"
          :key="i + 'topRight'"
          back
          :style="{ zIndex: i }"
        />
      </div>
    </div>

    <!-- Top -->
    <div
      v-if="room.top"
      class="player-station top"
      :class="{ swap: swap.top, 'is-turn': room.turn === room.top.id }"
    >
      <div class="player-info-tag">
        <div class="name-pill">
          <span class="player-name">{{ room.top.username }}</span>
        </div>
        <div class="avatar-and-stats">
          <div class="avatar-badge" :style="{ backgroundColor: getAvatarColor(room.top.username) }">
            <span v-if="room.top.isBot" class="bot-emoji">🤖</span>
            <div v-else class="dots-grid">
              <span v-for="d in 9" :key="d" class="dot"></span>
            </div>
          </div>
          <div class="count-badge">
            <span class="card-num">{{ room.top.count }}</span>
            <span class="signal-bars">
              <i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="cards-fan" :style="{ '--count': `${room.top.count}` }">
        <Card
          v-for="i in room.top.count"
          :key="i + 'top'"
          back
          :style="{ zIndex: i }"
        />
      </div>
    </div>

    <!-- Top Left -->
    <div
      v-if="room.topLeft"
      class="player-station topLeft"
      :class="{ swap: swap.topLeft, 'is-turn': room.turn === room.topLeft.id }"
    >
      <div class="player-info-tag">
        <div class="name-pill">
          <span class="player-name">{{ room.topLeft.username }}</span>
        </div>
        <div class="avatar-and-stats">
          <div class="avatar-badge" :style="{ backgroundColor: getAvatarColor(room.topLeft.username) }">
            <span v-if="room.topLeft.isBot" class="bot-emoji">🤖</span>
            <div v-else class="dots-grid">
              <span v-for="d in 9" :key="d" class="dot"></span>
            </div>
          </div>
          <div class="count-badge">
            <span class="card-num">{{ room.topLeft.count }}</span>
            <span class="signal-bars">
              <i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="cards-fan" :style="{ '--count': `${room.topLeft.count}` }">
        <Card
          v-for="i in room.topLeft.count"
          :key="i + 'topLeft'"
          back
          :style="{ zIndex: i }"
        />
      </div>
    </div>

    <!-- Left -->
    <div
      v-if="room.left"
      class="player-station left"
      :class="{ swap: swap.left, 'is-turn': room.turn === room.left.id }"
    >
      <div class="player-info-tag">
        <div class="name-pill">
          <span class="player-name">{{ room.left.username }}</span>
        </div>
        <div class="avatar-and-stats">
          <div class="avatar-badge" :style="{ backgroundColor: getAvatarColor(room.left.username) }">
            <span v-if="room.left.isBot" class="bot-emoji">🤖</span>
            <div v-else class="dots-grid">
              <span v-for="d in 9" :key="d" class="dot"></span>
            </div>
          </div>
          <div class="count-badge">
            <span class="card-num">{{ room.left.count }}</span>
            <span class="signal-bars">
              <i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="cards-fan" :style="{ '--count': `${room.left.count}` }">
        <Card
          v-for="i in room.left.count"
          :key="i + 'left'"
          back
          :style="{ zIndex: i }"
        />
      </div>
    </div>

    <!-- Bottom Left -->
    <div
      v-if="room.bottomLeft"
      class="player-station bottomLeft"
      :class="{ swap: swap.bottomLeft, 'is-turn': room.turn === room.bottomLeft.id }"
    >
      <div class="player-info-tag">
        <div class="name-pill">
          <span class="player-name">{{ room.bottomLeft.username }}</span>
        </div>
        <div class="avatar-and-stats">
          <div class="avatar-badge" :style="{ backgroundColor: getAvatarColor(room.bottomLeft.username) }">
            <span v-if="room.bottomLeft.isBot" class="bot-emoji">🤖</span>
            <div v-else class="dots-grid">
              <span v-for="d in 9" :key="d" class="dot"></span>
            </div>
          </div>
          <div class="count-badge">
            <span class="card-num">{{ room.bottomLeft.count }}</span>
            <span class="signal-bars">
              <i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>
            </span>
          </div>
        </div>
      </div>
      <div class="cards-fan" :style="{ '--count': `${room.bottomLeft.count}` }">
        <Card
          v-for="i in room.bottomLeft.count"
          :key="i + 'bottomLeft'"
          back
          :style="{ zIndex: i }"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$mobile: 900px;

.other-cards-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}

.player-station {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: auto;
  transition: transform 0.3s ease, filter 0.3s ease;

  .player-info-tag {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 8px;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
    transition: transform 0.2s ease;

    .name-pill {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.92) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 999px;
      padding: 3px 12px;
      margin-bottom: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);

      .player-name {
        color: #ffffff;
        font-weight: 800;
        font-size: 0.84rem;
        letter-spacing: -0.2px;
        white-space: nowrap;
        max-width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
      }
    }

    .avatar-and-stats {
      display: flex;
      align-items: center;
      gap: 6px;

      .avatar-badge {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1.5px solid rgba(255, 255, 255, 0.4);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);

        .bot-emoji {
          font-size: 1.1rem;
        }

        .dots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5px;
          padding: 3px;

          .dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background-color: #ffffff;
          }
        }
      }

      .count-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 6px;
        padding: 3px 7px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);

        .card-num {
          font-size: 0.88rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
        }

        .signal-bars {
          display: inline-flex;
          align-items: flex-end;
          gap: 1.5px;
          height: 11px;

          .bar {
            width: 2.5px;
            background-color: #22c55e;
            border-radius: 1px;

            &.b1 { height: 4px; }
            &.b2 { height: 7.5px; }
            &.b3 { height: 11px; }
          }
        }
      }
    }
  }

  &.is-turn {
    .player-info-tag {
      transform: scale(1.08);

      .name-pill {
        background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
        border-color: #fde047;
        box-shadow: 0 0 14px rgba(251, 191, 36, 0.8);
      }
    }
  }

  .cards-fan {
    display: flex;
    -webkit-box-reflect: below 2px linear-gradient(transparent 55%, rgba(0, 0, 0, 0.22));

    .card {
      margin-left: max(calc(-5.5px * var(--count)), -105px);

      @media screen and (max-width: $mobile) {
        margin-left: max(calc(-2.75px * var(--count)), -52.5px);
      }
    }
  }

  // --- Natural Circular 3D Orientations facing table center ---
  &.bottomRight {
    right: 8%;
    bottom: 25%;
    transform-origin: center right;
    transform: rotate(24deg) rotateY(38deg) rotateX(16deg) scale(0.72);

    @media screen and (max-width: $mobile) {
      right: 2%;
      transform: scale(0.5);
    }
  }

  &.right {
    right: 8%;
    top: 42%;
    transform-origin: center right;
    transform: rotate(18deg) rotateY(34deg) rotateX(14deg) scale(0.68);

    @media screen and (max-width: $mobile) {
      right: 2%;
      transform: scale(0.48);
    }
  }

  &.topRight {
    right: 20%;
    top: 22%;
    transform-origin: center center;
    transform: rotate(16deg) rotateY(25deg) rotateX(18deg) scale(0.68);

    @media screen and (max-width: $mobile) {
      right: 12%;
      transform: scale(0.46);
    }
  }

  &.top {
    left: 50%;
    top: 10%;
    transform-origin: top center;
    transform: translateX(-50%) rotateX(15deg) scale(0.66);

    @media screen and (max-width: $mobile) {
      transform: translateX(-50%) scale(0.46);
    }
  }

  &.topLeft {
    left: 20%;
    top: 22%;
    transform-origin: center center;
    transform: rotate(-16deg) rotateY(-25deg) rotateX(18deg) scale(0.68);

    @media screen and (max-width: $mobile) {
      left: 12%;
      transform: scale(0.46);
    }
  }

  &.left {
    left: 8%;
    top: 42%;
    transform-origin: center left;
    transform: rotate(-18deg) rotateY(-34deg) rotateX(14deg) scale(0.68);

    @media screen and (max-width: $mobile) {
      left: 2%;
      transform: scale(0.48);
    }
  }

  &.bottomLeft {
    left: 8%;
    bottom: 25%;
    transform-origin: center left;
    transform: rotate(-24deg) rotateY(-38deg) rotateX(16deg) scale(0.72);

    @media screen and (max-width: $mobile) {
      left: 2%;
      transform: scale(0.5);
    }
  }
}
</style>