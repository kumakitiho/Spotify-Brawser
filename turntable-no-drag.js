/* Disable broken shelf drag-and-drop without blocking normal cover taps.
   Shelf Mode now uses tap/click playback only. */

(function () {
    const MARKER = 'turntableNoDragApplied';

    function setTextIfChanged(node, text) {
        if (node && node.textContent !== text) {
            node.textContent = text;
        }
    }

    function removeDragGhosts() {
        const ghosts = document.querySelectorAll('.drag-ghost-record');
        ghosts.forEach((ghost) => ghost.remove());
        document.querySelector('#shelf-drop-zone')?.classList.remove('is-drag-over');
        document.querySelector('#record-shelf-section')?.classList.remove('is-dropping');
    }

    function patchDragCopy() {
        const helper = document.getElementById('shelf-helper-text');
        setTextIfChanged(helper, 'ジャケットをタップして曲を切り替え。');

        const dropZone = document.getElementById('shelf-drop-zone');
        if (dropZone && dropZone.getAttribute('aria-label') !== '選択中のレコード表示') {
            dropZone.setAttribute('aria-label', '選択中のレコード表示');
        }

        const stateLabel = document.getElementById('shelf-state-label');
        if (stateLabel && /DROP|DRAG|RELEASE/.test(stateLabel.textContent || '')) {
            setTextIfChanged(stateLabel, 'TAP A COVER TO PLAY');
        }

        const trackArtist = document.getElementById('shelf-track-artist');
        if (trackArtist && /中央のレコード|ドラッグ/.test(trackArtist.textContent || '')) {
            setTextIfChanged(trackArtist, 'ジャケットをタップして再生');
        }

        document.querySelectorAll('#record-shelf-section p').forEach((node) => {
            const text = node.textContent || '';
            if (text.includes('上位曲をドラッグして中央のレコードへ')) {
                setTextIfChanged(node, '上位曲をタップして次に再生');
            }
        });
    }

    function disableNativeDrag() {
        document.querySelectorAll('#record-shelf-list .shelf-track, #record-shelf-list .shelf-track *').forEach((node) => {
            if (node.getAttribute('draggable') !== 'false') {
                node.setAttribute('draggable', 'false');
            }
        });
    }

    function cleanupPossibleDrag(event) {
        const shelfTrack = event.target?.closest?.('#record-shelf-list .shelf-track');
        if (!shelfTrack) return;

        // Important: do not stop pointer/click propagation here.
        // The app uses those events to select and play a cover.
        removeDragGhosts();
    }

    function preventNativeDrag(event) {
        const shelfTrack = event.target?.closest?.('#record-shelf-list .shelf-track');
        if (!shelfTrack) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        removeDragGhosts();
    }

    function bindNoDrag() {
        const recordShelfList = document.getElementById('record-shelf-list');
        if (!recordShelfList) return false;

        if (recordShelfList.dataset[MARKER] !== 'true') {
            recordShelfList.dataset[MARKER] = 'true';
            recordShelfList.addEventListener('pointerdown', cleanupPossibleDrag, true);
            recordShelfList.addEventListener('pointermove', cleanupPossibleDrag, true);
            recordShelfList.addEventListener('pointerup', cleanupPossibleDrag, true);
            recordShelfList.addEventListener('click', cleanupPossibleDrag, true);
            recordShelfList.addEventListener('dragstart', preventNativeDrag, true);
        }

        disableNativeDrag();
        removeDragGhosts();
        patchDragCopy();
        return true;
    }

    function installCleanupObserver() {
        if (document.body?.dataset.turntableNoDragObserver === 'true') return;
        if (document.body) document.body.dataset.turntableNoDragObserver = 'true';

        const observer = new MutationObserver(() => {
            window.requestAnimationFrame(() => {
                disableNativeDrag();
                removeDragGhosts();
                patchDragCopy();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function installStyles() {
        if (document.getElementById('turntable-no-drag-style')) return;

        const style = document.createElement('style');
        style.id = 'turntable-no-drag-style';
        style.textContent = `
            #record-shelf-list .shelf-track,
            #record-shelf-list .shelf-track * {
                -webkit-user-drag: none !important;
                user-select: none !important;
            }

            .drag-ghost-record {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function boot() {
        installStyles();
        bindNoDrag();
        installCleanupObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
