/* Reference-matched Technics-style details.
   Adds only parts visible on the top plate: start/stop, speed buttons, small utility buttons, pitch marks, and subtle engravings. */

(function () {
    const MARKER = 'turntableReferenceMatchApplied';

    function getDropZone() {
        return document.querySelector('#record-shelf-section .shelf-drop-zone');
    }

    function applyReferenceDetails() {
        const dropZone = getDropZone();
        if (!dropZone || dropZone.dataset[MARKER] === 'true') return false;
        dropZone.dataset[MARKER] = 'true';

        const underlay = `
            <svg class="reference-match-svg" viewBox="0 0 900 665" aria-hidden="true" focusable="false">
                <defs>
                    <linearGradient id="refMetalFace" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#ffffff"/>
                        <stop offset="0.32" stop-color="#d8dbd3"/>
                        <stop offset="0.68" stop-color="#aeb7ae"/>
                        <stop offset="1" stop-color="#777f78"/>
                    </linearGradient>
                    <linearGradient id="refDarkPlastic" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stop-color="#303833"/>
                        <stop offset="0.55" stop-color="#111514"/>
                        <stop offset="1" stop-color="#050606"/>
                    </linearGradient>
                    <filter id="refSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#000" flood-opacity="0.25"/>
                    </filter>
                </defs>

                <!-- reference-like start/stop area, kept below platter edge -->
                <g filter="url(#refSoftShadow)" opacity="0.88">
                    <rect x="57" y="500" width="93" height="62" rx="2" fill="#eef0e9" stroke="#1b211e" stroke-width="3"/>
                    <rect x="63" y="506" width="81" height="50" rx="1.5" fill="#f8faf2" stroke="#657067" stroke-width="1" opacity="0.92"/>
                    <text x="83" y="535" fill="#111514" font-size="8" font-family="Inter, Arial" font-weight="800" letter-spacing="1">start · stop</text>
                </g>

                <g filter="url(#refSoftShadow)" opacity="0.84">
                    <rect x="164" y="543" width="49" height="10" rx="1" fill="#eef0e9" stroke="#1b211e" stroke-width="1.5"/>
                    <rect x="220" y="543" width="49" height="10" rx="1" fill="#eef0e9" stroke="#1b211e" stroke-width="1.5"/>
                    <text x="178" y="540" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="800">33</text>
                    <text x="234" y="540" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="800">45</text>
                    <circle cx="155" cy="547" r="2" fill="#1DB954" opacity="0.72"/>
                    <circle cx="211" cy="547" r="2" fill="#9aa39b" opacity="0.62"/>
                </g>

                <!-- lower right cue buttons beside platter, as in reference photo -->
                <g filter="url(#refSoftShadow)" opacity="0.82">
                    <circle cx="604" cy="512" r="16" fill="url(#refMetalFace)" stroke="#485149" stroke-width="2"/>
                    <circle cx="623" cy="512" r="14" fill="#3a423c" stroke="#171c19" stroke-width="2"/>
                    <circle cx="604" cy="512" r="7" fill="#f4f6ef" opacity="0.7"/>
                    <circle cx="623" cy="512" r="5" fill="#8f9890" opacity="0.75"/>
                </g>

                <!-- small labels around start/speed area -->
                <g opacity="0.42">
                    <text x="76" y="486" fill="#111514" font-size="7" font-family="Inter, Arial" font-weight="700" letter-spacing="0.8">quartz</text>
                    <text x="75" y="494" fill="#111514" font-size="6" font-family="Inter, Arial" letter-spacing="0.7">lock</text>
                    <path d="M133 492 H144 M136 499 H147 M139 506 H150" stroke="#111514" stroke-width="1"/>
                </g>

                <!-- pitch slider numeric scale and subtle top plate engraving -->
                <g opacity="0.58">
                    <text x="775" y="329" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="800">+8</text>
                    <text x="774" y="590" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="800">-8</text>
                    <text x="778" y="608" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="700" letter-spacing="0.7">pitch adj.</text>
                    <path d="M756 356 H773 M762 383 H773 M756 410 H773 M762 437 H773 M756 464 H773 M762 491 H773 M756 518 H773 M762 545 H773" stroke="#111514" stroke-width="1"/>
                    <path d="M824 356 H842 M824 383 H836 M824 410 H842 M824 437 H836 M824 464 H842 M824 491 H836 M824 518 H842 M824 545 H836" stroke="#111514" stroke-width="1"/>
                </g>

                <!-- very subtle brand location, similar to photo but low contrast -->
                <g opacity="0.26">
                    <text x="596" y="550" fill="#111514" font-size="15" font-family="Georgia, serif" font-weight="700">Technics</text>
                    <text x="597" y="562" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="700" letter-spacing="0.7">quartz direct drive</text>
                </g>
            </svg>`;

        const overlay = `
            <svg class="reference-match-on-top-svg" viewBox="0 0 900 665" aria-hidden="true" focusable="false">
                <defs>
                    <filter id="refDustBlur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="0.22"/>
                    </filter>
                </defs>
                <!-- fixed, low-opacity vinyl scuffs only; avoids fake black bands -->
                <g opacity="0.16" filter="url(#refDustBlur)">
                    <path d="M174 218 C254 205 353 212 456 201" stroke="#ffffff" stroke-width="0.7" fill="none"/>
                    <path d="M154 395 C256 420 421 405 515 380" stroke="#ffffff" stroke-width="0.6" fill="none"/>
                    <path d="M306 172 C330 260 326 445 306 522" stroke="#ffffff" stroke-width="0.6" fill="none"/>
                    <circle cx="245" cy="287" r="1" fill="#ffffff"/>
                    <circle cx="418" cy="248" r="0.8" fill="#ffffff"/>
                    <circle cx="487" cy="438" r="0.8" fill="#ffffff"/>
                </g>
            </svg>`;

        const platter = dropZone.querySelector('.turntable-platter');
        if (platter) {
            platter.insertAdjacentHTML('beforebegin', underlay);
        } else {
            dropZone.insertAdjacentHTML('afterbegin', underlay);
        }
        dropZone.insertAdjacentHTML('beforeend', overlay);
        return true;
    }

    function boot() {
        if (applyReferenceDetails()) return;

        let tries = 0;
        const timer = window.setInterval(() => {
            tries += 1;
            if (applyReferenceDetails() || tries > 40) {
                window.clearInterval(timer);
            }
        }, 120);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
        boot();
    }
})();
