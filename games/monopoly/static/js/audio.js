/**
 * Monopoly Web Edition - Audio System (Authentic ROM Sounds & Web Audio Fallback)
 * Spielt die originalen Soundeffekte aus der Monopoly ROM ab.
 */

(function(window) {
    'use strict';

    let isMuted = false;
    try {
        isMuted = localStorage.getItem('monopoly_muted') === 'true';
    } catch(e) {}

    // Preloaded HTML5 Audio objects for zero-latency playback
    const soundFiles = {
        diceRoll1: 'static/assets/audio/wuerfeln_1.wav',
        diceRoll2: 'static/assets/audio/wuerfeln_2.wav',
        diceRoll3: 'static/assets/audio/wuerfeln_3.wav',
        diceRoll4: 'static/assets/audio/wuerfeln_4.wav',
        diceRoll5: 'static/assets/audio/wuerfeln_5.wav',
        diceLand1: 'static/assets/audio/wuerfel_landen_1.wav',
        diceLand2: 'static/assets/audio/wuerfel_landen_2.wav',
        moneyGain: 'static/assets/audio/geld_erhalten.wav',
        moneyLose: 'static/assets/audio/geld_verloren.wav',
        passGo: 'static/assets/audio/gehe_ueber_los.wav',
        buyProp: 'static/assets/audio/grundstueck_kaufen.wav',
        buildHouse: 'static/assets/audio/haus_bauen.wav',
        jail: 'static/assets/audio/ins_gefaengnis.wav',
        jailLeave: 'static/assets/audio/gefaengnis_verlassen.wav',
        card: 'static/assets/audio/karte_ziehen.wav',
        win: 'static/assets/audio/spiel_gewonnen.wav',
        lose: 'static/assets/audio/spiel_verloren.wav',
        confirm: 'static/assets/audio/klick_bestaetigen.wav',
        select: 'static/assets/audio/klick_auswaehlen.wav',
        chat: 'static/assets/audio/chat_nachricht.wav'
    };

    const audioCache = {};

    function playAudioFile(url, volume = 0.8) {
        if (isMuted) return;
        try {
            const audio = new Audio(url);
            audio.volume = Math.max(0, Math.min(1, volume));
            const p = audio.play();
            if (p && p.catch) {
                p.catch(() => {
                    // Browser autoplay policy might block before interaction
                });
            }
        } catch (e) {}
    }

    // Synthesizer Web Audio context for instant fallback / hop click
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    const Sound = {
        isMuted: function() {
            return isMuted;
        },

        toggleMute: function() {
            isMuted = !isMuted;
            try {
                localStorage.setItem('monopoly_muted', isMuted);
            } catch(e) {}
            return isMuted;
        },

        // Authentic Dice Roll sound
        playDiceRoll: function() {
            if (isMuted) return;
            const r = Math.floor(Math.random() * 5) + 1;
            playAudioFile(`static/assets/audio/wuerfeln_${r}.wav`, 0.85);
            setTimeout(() => {
                const land = Math.random() > 0.5 ? 1 : 2;
                playAudioFile(`static/assets/audio/wuerfel_landen_${land}.wav`, 0.7);
            }, 600);
        },

        // Token step hop sound
        playHop: function() {
            if (isMuted) return;
            const ctx = getAudioContext();
            if (!ctx) return;
            try {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(420, now);
                osc.frequency.exponentialRampToValueAtTime(180, now + 0.06);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.07);
            } catch(e) {}
        },

        // Money gain / Passed GO
        playMoney: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.moneyGain, 0.9);
        },

        playMoneyLose: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.moneyLose, 0.85);
        },

        playPassGo: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.passGo, 0.9);
        },

        playBuy: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.buyProp, 0.9);
        },

        playCard: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.card, 0.85);
        },

        playJail: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.jail, 0.9);
        },

        playJailLeave: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.jailLeave, 0.85);
        },

        playBuild: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.buildHouse, 0.9);
        },

        playWin: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.win, 1.0);
        },

        playLose: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.lose, 0.9);
        },

        playClick: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.select, 0.5);
        },

        playChat: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.chat, 0.6);
        }
    };

    window.MonopolySound = Sound;
})(window);
