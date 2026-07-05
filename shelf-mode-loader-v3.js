/* Shelf Mode loader v3. */
(function () {
    const stateKey = '__shelfModeLoaderStateV3';
    if (window[stateKey]?.started) return;
    window[stateKey] = { started: true, errors: [] };

    function hasScript(key) {
        return document.querySelector(`script[data-shelf-mode-script="${key}"]`);
    }

    function hasStyle(key) {
        return document.querySelector(`link[data-shelf-mode-skin="${key}"]`);
    }

    function appendStyle(asset) {
        if (!asset?.href || !asset?.key || hasStyle(asset.key)) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = asset.href;
        link.dataset.shelfModeSkin = asset.key;
        document.head.appendChild(link);
    }

    function appendScript(asset) {
        if (!asset?.src || !asset?.key || hasScript(asset.key)) return Promise.resolve(false);
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = asset.src;
            script.defer = true;
            script.dataset.shelfModeScript = asset.key;
            script.onload = () => resolve(true);
            script.onerror = () => {
                window[stateKey].errors.push(asset.src);
                resolve(false);
            };
            document.head.appendChild(script);
        });
    }

    async function run() {
        await appendScript({ src: 'shelf-mode-assets.js?v=20260705-assets-v3', key: 'shelf-mode-assets-v3' });
        const manifest = window.ShelfModeAssets;
        if (!manifest) return;
        (manifest.stylesheets || []).forEach(appendStyle);
        for (const asset of manifest.scripts || []) {
            await appendScript(asset);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
        run();
    }
})();
