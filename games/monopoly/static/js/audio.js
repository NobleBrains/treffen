/**
 * Monopoly Web Edition - Audio System (Authentic ROM Sounds & BGM Lounge Music)
 * Spielt die originalen Soundeffekte und BGM-Tracks aus der Monopoly ROM ab.
 */

(function(window) {
    'use strict';

    let isMuted = false;
    let isMusicEnabled = false;
    try {
        isMuted = localStorage.getItem('monopoly_muted') === 'true';
        isMusicEnabled = localStorage.getItem('monopoly_bgm_enabled') === 'true';
    } catch(e) {}

    const resolveUrl = function(path) {
        if (window.MonopolyAssets && window.MonopolyAssets.resolveUrl) {
            return window.MonopolyAssets.resolveUrl(path);
        }
        let p = window.location.pathname;
        if (!p.endsWith('/')) p = p.substring(0, p.lastIndexOf('/') + 1);
        return p + (path.startsWith('/') ? path.substring(1) : path);
    };

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
        chat: 'static/assets/audio/chat_nachricht.wav',
        swipe: 'static/assets/audio/wischen.wav'
    };

    const tokenSounds = {
        dog: 'static/assets/audio/figur_hund_laufen.wav',
        car: 'static/assets/audio/figur_auto_fahren.wav',
        ship: 'static/assets/audio/figur_schiff_fahren.wav',
        boot: 'static/assets/audio/figur_schuh_ziehen.wav',
        iron: 'static/assets/audio/figur_buegeleisen_ziehen.wav',
        thimble: 'static/assets/audio/figur_fingerhut_ziehen.wav',
        wheelbarrow: 'static/assets/audio/figur_schubkarre_ziehen.wav',
        hat: 'static/assets/audio/figur_zylinder_ziehen.wav'
    };

    const bgmTracks = [
        'static/assets/audio/music/monopoly_theme_lounge_m1.mp3',
        'static/assets/audio/music/monopoly_theme_smooth_m2.mp3',
        'static/assets/audio/music/monopoly_theme_swing_m3.mp3'
    ];

    let currentBgmAudio = null;
    let currentBgmIndex = 0;

    function playAudioFile(relPath, volume = 0.8) {
        if (isMuted) return;
        try {
            const audio = new Audio(resolveUrl(relPath));
            audio.volume = Math.max(0, Math.min(1, volume));
            const p = audio.play();
            if (p && p.catch) {
                p.catch(() => {});
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

    function initOrUpdateBgm() {
        if (!isMusicEnabled) {
            if (currentBgmAudio) {
                currentBgmAudio.pause();
                currentBgmAudio = null;
            }
            return;
        }

        if (currentBgmAudio) {
            if (currentBgmAudio.paused) {
                currentBgmAudio.play().catch(() => {});
            }
            return;
        }

        try {
            const trackPath = bgmTracks[currentBgmIndex % bgmTracks.length];
            currentBgmAudio = new Audio(resolveUrl(trackPath));
            currentBgmAudio.volume = 0.28;
            currentBgmAudio.loop = true;
            currentBgmAudio.play().catch(() => {
                // Browser user interaction required
            });
        } catch (e) {}
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

        isMusicEnabled: function() {
            return isMusicEnabled;
        },

        toggleMusic: function() {
            isMusicEnabled = !isMusicEnabled;
            try {
                localStorage.setItem('monopoly_bgm_enabled', isMusicEnabled);
            } catch(e) {}
            initOrUpdateBgm();
            return isMusicEnabled;
        },

        nextMusicTrack: function() {
            if (currentBgmAudio) {
                currentBgmAudio.pause();
                currentBgmAudio = null;
            }
            currentBgmIndex = (currentBgmIndex + 1) % bgmTracks.length;
            if (isMusicEnabled) {
                initOrUpdateBgm();
            }
        },

        startMusicIfEnabled: function() {
            if (isMusicEnabled && (!currentBgmAudio || currentBgmAudio.paused)) {
                initOrUpdateBgm();
            }
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

        // Token Movement SFX (Specific per Token)
        playTokenMove: function(tokenType) {
            if (isMuted) return;
            if (tokenType && tokenSounds[tokenType]) {
                playAudioFile(tokenSounds[tokenType], 0.75);
            } else {
                Sound.playHop();
            }
        },

        // Token step hop sound (synthesized fallback)
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
        },

        playSwipe: function() {
            if (isMuted) return;
            playAudioFile(soundFiles.swipe, 0.5);
        }
    };

    // Try starting music on first interaction if enabled
    function onFirstUserInteraction() {
        Sound.startMusicIfEnabled();
        window.removeEventListener('click', onFirstUserInteraction);
        window.removeEventListener('touchstart', onFirstUserInteraction);
    }
    window.addEventListener('click', onFirstUserInteraction);
    window.addEventListener('touchstart', onFirstUserInteraction);

    window.MonopolySound = Sound;
})(window);
