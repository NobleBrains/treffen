/**
 * Amogolie - 2D, 2.5D & 3D Board View Controller
 * - Desktop: Full 3D tabletop orbit (360° pitch & yaw + wheel zoom) & flat 2D chess view.
 * - Mobile: Streamlined 2.5D isometric view (fixed comfortable 36° tilt, horizontal swipe turntable rotation)
 *   and pure flat 2D mode, auto-scaled to fit screen width with zero horizontal scrolling.
 */

(function() {
    'use strict';

    let currentMode = '2d'; // '2d' or '3d' (acts as 2.5D on mobile)
    let rotX = 50;          // Pitch angle (degrees)
    let rotZ = -12;         // Yaw angle (degrees)
    let zoomScale = 1.0;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startRotX = 50;
    let startRotZ = -12;
    let hasDragged = false;

    function isMobile() {
        return window.innerWidth <= 850;
    }

    function getStage() {
        return document.getElementById('board-stage');
    }

    function getContainer() {
        return document.getElementById('board-container');
    }

    function syncControlPlacement() {
        const control = document.getElementById('control');
        if (!control) return;

        // Never place controls inside the 3D board container,
        // so the 3D board remains completely clean and unoccluded.
        if (control.parentElement !== document.body) {
            document.body.appendChild(control);
        }
    }
    window.syncControlPlacement = syncControlPlacement;

    function getBaseScale() {
        if (!isMobile()) {
            return zoomScale;
        }
        // Available width (with 12px margin)
        const availableW = window.innerWidth - 12;
        // Available height: top ~48% of screen
        const availableH = window.innerHeight * 0.48;
        const scaleW = availableW / 886;
        const scaleH = availableH / 886;
        // Fit within both width and height so no rows are clipped
        const autoScale = Math.min(scaleW, scaleH);
        return Math.min(0.65, Math.max(0.35, autoScale)) * zoomScale;
    }

    function applyTransform(withTransition = true) {
        const container = getContainer();
        if (!container) return;

        syncControlPlacement();

        if (withTransition) {
            container.style.transition = 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)';
        } else {
            container.style.transition = 'none';
        }

        const scale = getBaseScale();

        if (currentMode === '2d') {
            container.style.transform = `scale(${scale})`;
        } else {
            // In 2.5D (mobile) pitch is locked at 36° to prevent clunky vertical tilting
            const pitch = isMobile() ? 36 : rotX;
            const tiltScale = isMobile() ? (scale * 0.94) : scale;
            container.style.transform = `scale(${tiltScale}) rotateX(${pitch}deg) rotateZ(${rotZ}deg)`;
        }
    }
    window.applyBoardTransform = applyTransform;

    window.setBoardView = function(mode) {
        currentMode = mode;
        try {
            localStorage.setItem('amogolie_view_mode', mode);
        } catch(e) {}

        const container = getContainer();
        const stage = getStage();
        const btn2d = document.getElementById('btn-view-2d');
        const btn3d = document.getElementById('btn-view-3d');
        const sub3d = document.getElementById('sub-3d-controls');
        const mobRotate = document.getElementById('btn-mobile-rotate');

        if (mode === '3d') {
            if (btn3d) btn3d.classList.add('active');
            if (btn2d) btn2d.classList.remove('active');
            if (sub3d && !isMobile()) sub3d.style.display = 'flex';
            if (mobRotate && isMobile()) mobRotate.style.display = 'inline-block';
            if (container) {
                container.classList.remove('mode-2d');
                container.classList.add('mode-3d');
            }
            if (stage) stage.classList.add('stage-3d');
            rotX = isMobile() ? 36 : 50;
            rotZ = -12;
        } else {
            if (btn2d) btn2d.classList.add('active');
            if (btn3d) btn3d.classList.remove('active');
            if (sub3d) sub3d.style.display = 'none';
            if (mobRotate) mobRotate.style.display = 'none';
            if (container) {
                container.classList.remove('mode-3d');
                container.classList.add('mode-2d');
            }
            if (stage) stage.classList.remove('stage-3d');
            rotX = 0;
            rotZ = 0;
        }

        applyTransform(true);
    };

    window.rotateBoard3D = function(deltaDeg) {
        if (currentMode !== '3d') {
            window.setBoardView('3d');
        }
        rotZ = (rotZ + deltaDeg);
        applyTransform(true);
    };

    window.resetBoard3D = function() {
        rotX = isMobile() ? 36 : 50;
        rotZ = -12;
        zoomScale = 1.0;
        applyTransform(true);
    };

    window.adjustBoardZoom = function(delta) {
        zoomScale = Math.max(0.65, Math.min(1.4, zoomScale + delta));
        applyTransform(true);
    };

    function initOrbitControls() {
        const stage = getStage();
        if (!stage) return;

        function isInteractive(target) {
            return target.closest('#control, button, input, select, a, #deed, #moneybarwrap, .view-controls, #popupwrap, #statswrap, #trade');
        }

        // Mouse Drag Handler (Desktop)
        stage.addEventListener('mousedown', function(e) {
            if (currentMode !== '3d') return;
            if (isInteractive(e.target)) return;

            isDragging = true;
            hasDragged = false;
            startX = e.clientX;
            startY = e.clientY;
            startRotX = rotX;
            startRotZ = rotZ;
            stage.classList.add('is-dragging');
        });

        window.addEventListener('mousemove', function(e) {
            if (!isDragging || currentMode !== '3d') return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                hasDragged = true;
            }

            rotZ = startRotZ + dx * 0.45;
            rotX = Math.max(20, Math.min(78, startRotX - dy * 0.35));

            applyTransform(false);
        });

        window.addEventListener('mouseup', function(e) {
            if (isDragging) {
                isDragging = false;
                stage.classList.remove('is-dragging');
                applyTransform(true);
            }
        });

        // Mouse Wheel Zoom
        stage.addEventListener('wheel', function(e) {
            if (isInteractive(e.target)) return;
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.05 : -0.05;
            window.adjustBoardZoom(delta);
        }, { passive: false });

        // Touch Gestures (Mobile 2.5D Horizontal Turntable Swipe)
        let touchStartX = 0;
        let touchStartY = 0;

        stage.addEventListener('touchstart', function(e) {
            if (currentMode !== '3d') return;
            if (isInteractive(e.target)) return;

            if (e.touches.length === 1) {
                isDragging = true;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                startRotZ = rotZ;
                startRotX = rotX;
            }
        }, { passive: true });

        stage.addEventListener('touchmove', function(e) {
            if (currentMode !== '3d' || !isDragging) return;

            if (e.touches.length === 1) {
                const dx = e.touches[0].clientX - touchStartX;
                const dy = e.touches[0].clientY - touchStartY;

                // Mobile 2.5D: Horizontal-only turntable swipe (locked pitch)
                if (isMobile()) {
                    rotZ = startRotZ + dx * 0.55;
                } else {
                    rotZ = startRotZ + dx * 0.45;
                    rotX = Math.max(20, Math.min(78, startRotX - dy * 0.35));
                }
                applyTransform(false);
            }
        }, { passive: true });

        stage.addEventListener('touchend', function() {
            if (isDragging) {
                isDragging = false;
                applyTransform(true);
            }
        });

        // Auto-recalculate scale on resize / orientation change
        window.addEventListener('resize', function() {
            const sub3d = document.getElementById('sub-3d-controls');
            const mobRotate = document.getElementById('btn-mobile-rotate');
            if (isMobile()) {
                if (sub3d) sub3d.style.display = 'none';
                if (mobRotate && currentMode === '3d') mobRotate.style.display = 'inline-block';
            } else {
                if (mobRotate) mobRotate.style.display = 'none';
                if (sub3d && currentMode === '3d') sub3d.style.display = 'flex';
            }
            applyTransform(false);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initOrbitControls();
        syncControlPlacement();

        let savedMode = '2d';
        try {
            savedMode = localStorage.getItem('amogolie_view_mode') || (isMobile() ? '2d' : '3d');
        } catch(e) {}

        window.setBoardView(savedMode);
    }
})();
