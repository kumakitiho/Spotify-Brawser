/* Disable broken shelf drag-and-drop.
   Shelf Mode now uses tap/click playback only. */

(function () {
    const MARKER = 'turntableNoDragApplied';

    function removeDragGhosts() {
        document.querySelectorAll('.drag-ghost-record').forEach((ghost) => ghost.remove());
        document.querySelector('#shelf-drop-zone')?.classList.remove('is-drag-over');
        document.querySelector('#record-shelf-section')?.classList.remove('is-dropping');
    }

    function patchDragCopy() {
        const helper = document.getElementById('shelf-helper-text');
        if (helper) {
            helper.textContent = 'ジャケットをタップして曲を切り替え。';
        }

        const dropZone = document.getElementById('shelf-drop-zone');
        if (dropZone) {
            dropZone.setAttribute('aria-label', '選択中のレコード表示');
        }

        const stateLabel = document.getElementById('shelf-state-label');
        if (stateLabel && /DROP|DRAG|RELEASE/.test(stateLabel.textContent || '')) {
            stateLabel.textContent = 'TAP A COVER TO PLAY';
        }

        const trackArtist = document.getElementById('shelf-track-artist');
        if (trackArtist && /中央のレコード|ドラッグ/.test(trackArtist.textContent || '')) {
            trackArtist.textContent = 'ジャケットをタップして再生';
        }

        document.querySelectorAll('#record-shelf-section p').forEach((node) => {
            const text = node.textContent || '';
            if (text.includes('上位曲をドラッグして中央のレコードへ')) {
                node.textContent = '上位曲をタップして次に再生';
            }
        });
    }

    function disableNativeDrag() {
        document.querySelectorAll('#record-shelf-list .shelf-track, #record-shelf-list .shelf-track *').forEach((node) => {
            node.setAttribute('draggable', 'false');
        });
    }

    function stopShelfDragStart(event) {
        const shelfTrack = event.target?.closest?.('#record-shelf-list .shelf-track');
        if (!shelfTrack) return;

        // Do not prevent default here. Let the browser still synthesize the normal click.
        event.stopImmediatePropagation();
        removeDragGhosts();
        patchDragCopy();
    }

    function stopShelfDragMove(event) {
        const shelfTrack = event.target?.closest?.('#record-shelf-list .shelf-track');
        if (!shelfTrack) return;

        event.stopImmediatePropagation();
        removeDragGhosts();
        patchDragCopy();
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
        if (!recordShelfList || recordShelfList.dataset[MARKER] === 'true') return false;

        recordShelfList.dataset[MARKER] = 'true';
        recordShelfList.addEventListener('pointerdown', stopShelfDragStart, true);
        recordShelfList.addEventListener('pointermove', stopShelfDragMove, true);
        recordShelfList.addEventListener('dragstart', preventNativeDrag, true);

        disableNativeDrag();
        removeDragGhosts();
        patchDragCopy();
        return true;
    }

    function installCleanupObserver() {
        const observer = new MutationObserver(() => {
            disableNativeDrag();
            removeDragGhosts();
            patchDragCopy();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
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
        window.setInterval(() => {
            bindNoDrag();
            removeDragGhosts();
            patchDragCopy();
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
