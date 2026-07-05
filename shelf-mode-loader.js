/* Shelf Mode loader.
   Loads turntable skin assets after the base app has parsed so config.js stays low-risk. */

(function () {
    const MANIFEST_SRC = 'shelf-mode-assets.js?v=20260705-assets-v1';
    const MANIFEST_KEY = 'shelf-mode-assets';
    const LOADER_STATE_KEY = '__shelfModeLoaderState';

    if (window[LOADER_STATE_KEY]?.started) {
        return;
    }

    window[LOADER_STATE_KEY] = {
        started: true,
        manifestLoaded: false,
        assetsApplied: false,
        errors: []
    };

    function appendScript({ src, key, defer = true }) {
        if (!src || !key) return Promise.resolve(false);
        if (document.querySelector(`script[data-shelf-mode-script="${key}"]`)) {
            return Promise.resolve(false);
        }

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = defer;
            script.dataset.shelfModeScript = key;
            script.onload = () => resolve(true);
            script.onerror = () => {
                const error = `Failed to load script: ${src}`;
                console.warn(error);
                window[LOADER_STATE_KEY].errors.push(error);
                resolve(false);
            };
            document.head.appendChild(script);
        });
    }

    function appendStylesheet({ href, key }) {
        if (!href || !key) return false;
        if (document.querySelector(`link[data-shelf-mode-skin="${key}"]`)) return false;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.dataset.shelfModeSkin = key;
        document.head.appendChild(link);
        return true;
    }

    async function loadManifest() {
        if (window.ShelfModeAssets) {
            window[LOADER_STATE_KEY].manifestLoaded = true;
            return window.ShelfModeAssets;
        }

        await appendScript({ src: MANIFEST_SRC, key: MANIFEST_KEY, defer: true });
        window[LOADER_STATE_KEY].manifestLoaded = Boolean(window.ShelfModeAssets);
        return window.ShelfModeAssets;
    }

    async function applyAssets() {
        const manifest = await loadManifest();
        if (!manifest) {
            const error = 'ShelfModeAssets manifest is missing.';
            console.warn(error);
            window[LOADER_STATE_KEY].errors.push(error);
            return false;
        }

        (manifest.stylesheets || []).forEach(appendStylesheet);
        for (const script of manifest.scripts || []) {
            await appendScript(script);
        }

        window[LOADER_STATE_KEY].assetsApplied = true;
        return true;
    }

    function boot() {
        applyAssets();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
