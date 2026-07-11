/* Shelf Mode asset manifest.
   This file owns the runtime load order for the turntable skin.
   Feature modules must be safe when disabled by their own runtime flags. */

(function () {
    window.ShelfModeAssets = {
        stylesheets: [
            {
                href: 'turntable-realism.css?v=20260705-photoreal-turntable',
                key: 'photoreal-turntable'
            },
            {
                href: 'turntable-cover-boost.css?v=20260705-cover-boost',
                key: 'record-cover-boost'
            },
            {
                href: 'turntable-physics.css?v=20260705-physics-v8',
                key: 'turntable-physics'
            },
            {
                href: 'turntable-reference-match.css?v=20260705-reference-match-v7',
                key: 'turntable-reference-match'
            },
            {
                href: 'cinematic-deck.css?v=20260712-cinematic-v1',
                key: 'cinematic-deck'
            },
            {
                href: 'cinematic-deck-themes.css?v=20260712-cinematic-v1',
                key: 'cinematic-deck-themes'
            },
            {
                href: 'cinematic-deck-fixes.css?v=20260712-cinematic-v1',
                key: 'cinematic-deck-fixes'
            }
        ],
        scripts: [
            {
                src: 'turntable-physics.js?v=20260705-physics-v8',
                key: 'turntable-physics'
            },
            {
                src: 'turntable-arm-detail.js?v=20260705-arm-detail-v4',
                key: 'turntable-arm-detail'
            },
            {
                src: 'turntable-polish.js?v=20260705-polish-v1',
                key: 'turntable-polish'
            },
            {
                src: 'turntable-reference-match.js?v=20260705-reference-match-v7',
                key: 'turntable-reference-match'
            },
            {
                src: 'turntable-no-drag.js?v=20260705-no-drag-v3',
                key: 'turntable-no-drag'
            },
            {
                src: 'turntable-state-guard.js?v=20260705-state-guard-v1',
                key: 'turntable-state-guard'
            },
            {
                src: 'cinematic-deck.js?v=20260712-cinematic-v1',
                key: 'cinematic-deck'
            },
            {
                src: 'cinematic-deck-guard.js?v=20260712-cinematic-v1',
                key: 'cinematic-deck-guard'
            }
        ],
        experimentalScripts: [
            {
                src: 'turntable-live-controls.js?v=20260705-live-controls-flagged-v6',
                key: 'turntable-live-controls'
            }
        ]
    };
})();
