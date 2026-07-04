/* Fine photoreal SVG details for Shelf Mode turntable. */

(function () {
    const MARKER = 'turntablePhotoFinishApplied';

    function getDropZone() {
        return document.querySelector('#record-shelf-section .shelf-drop-zone');
    }

    function applyPhotoFinish() {
        const dropZone = getDropZone();
        if (!dropZone || dropZone.dataset[MARKER] === 'true') return false;
        dropZone.dataset[MARKER] = 'true';

        const underlay = `
            <svg class="turntable-photo-underlay" viewBox="0 0 900 665" aria-hidden="true" focusable="false">
                <defs>
                    <filter id="photoSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.28"/>
                    </filter>
                    <linearGradient id="photoFrontLip" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#2c332f"/>
                        <stop offset="0.45" stop-color="#101514"/>
                        <stop offset="1" stop-color="#050606"/>
                    </linearGradient>
                    <radialGradient id="photoRubber" cx="45%" cy="22%" r="82%">
                        <stop offset="0" stop-color="#333a36"/>
                        <stop offset="0.55" stop-color="#101412"/>
                        <stop offset="1" stop-color="#020303"/>
                    </radialGradient>
                </defs>

                <!-- front thickness and rubber feet, to stop the deck looking paper-flat -->
                <path d="M35 590 H865 V625 Q865 640 850 640 H50 Q35 640 35 625 Z" fill="url(#photoFrontLip)" opacity="0.66"/>
                <ellipse cx="116" cy="637" rx="42" ry="22" fill="url(#photoRubber)" opacity="0.78"/>
                <ellipse cx="805" cy="637" rx="42" ry="22" fill="url(#photoRubber)" opacity="0.78"/>
                <path d="M82 629 H150 M770 629 H838" stroke="#455049" stroke-width="1" stroke-dasharray="2 3" opacity="0.40"/>

                <!-- platter bevel shadows under the vinyl -->
                <circle cx="338" cy="335" r="305" fill="none" stroke="#f8faf0" stroke-width="3" opacity="0.24"/>
                <circle cx="338" cy="335" r="298" fill="none" stroke="#0a0d0c" stroke-width="9" opacity="0.42"/>
                <circle cx="338" cy="335" r="264" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.08"/>

                <!-- subtle engraved deck seams -->
                <path d="M606 84 H842 Q852 84 852 94 V295" fill="none" stroke="#6f7770" stroke-width="1.5" opacity="0.28"/>
                <path d="M746 315 H832" stroke="#727b73" stroke-width="1" opacity="0.32"/>
                <path d="M62 580 H840" stroke="#ffffff" stroke-width="1" opacity="0.22"/>
            </svg>`;

        const overlay = `
            <svg class="turntable-photo-svg" viewBox="0 0 900 665" aria-hidden="true" focusable="false">
                <defs>
                    <filter id="photoTinyBlur" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="0.28"/>
                    </filter>
                    <linearGradient id="photoScratch" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
                        <stop offset="0.45" stop-color="#fff" stop-opacity="0.22"/>
                        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
                    </linearGradient>
                    <radialGradient id="photoDust" cx="50%" cy="50%" r="50%">
                        <stop offset="0" stop-color="#fff" stop-opacity="0.78"/>
                        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
                    </radialGradient>
                </defs>

                <!-- camera/vignette and plinth reflections -->
                <rect x="35" y="28" width="830" height="612" rx="22" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.18"/>
                <path d="M64 42 H820" stroke="#ffffff" stroke-width="4" opacity="0.20"/>
                <path d="M48 618 H854" stroke="#080a09" stroke-width="18" opacity="0.18"/>
                <path d="M40 44 C250 92 590 42 858 82" fill="none" stroke="#ffffff" stroke-width="18" opacity="0.045"/>
                <path d="M45 529 C290 575 570 540 848 590" fill="none" stroke="#000" stroke-width="28" opacity="0.05"/>

                <!-- fine hairline scratches on metal deck -->
                <g opacity="0.18" filter="url(#photoTinyBlur)">
                    <path d="M82 122 H518" stroke="url(#photoScratch)" stroke-width="1"/>
                    <path d="M94 151 H576" stroke="url(#photoScratch)" stroke-width="0.8"/>
                    <path d="M612 116 H834" stroke="url(#photoScratch)" stroke-width="0.8"/>
                    <path d="M666 415 H826" stroke="url(#photoScratch)" stroke-width="1"/>
                    <path d="M92 560 H420" stroke="url(#photoScratch)" stroke-width="0.9"/>
                    <path d="M492 552 H822" stroke="url(#photoScratch)" stroke-width="0.8"/>
                </g>

                <!-- vinyl dust and hairline scuffs; fixed to camera, not spinning -->
                <g opacity="0.28" filter="url(#photoTinyBlur)">
                    <path d="M196 229 C258 217 344 226 420 215" stroke="#ffffff" stroke-width="0.8" opacity="0.26" fill="none"/>
                    <path d="M169 374 C247 391 386 388 491 372" stroke="#ffffff" stroke-width="0.7" opacity="0.20" fill="none"/>
                    <path d="M260 504 C334 532 441 515 512 484" stroke="#ffffff" stroke-width="0.7" opacity="0.18" fill="none"/>
                    <path d="M315 178 C330 236 331 444 319 503" stroke="#ffffff" stroke-width="0.6" opacity="0.20" fill="none"/>
                    <path d="M390 182 C407 248 398 430 380 500" stroke="#ffffff" stroke-width="0.55" opacity="0.18" fill="none"/>
                    <circle cx="214" cy="289" r="1.1" fill="url(#photoDust)"/>
                    <circle cx="294" cy="211" r="0.9" fill="url(#photoDust)"/>
                    <circle cx="470" cy="322" r="1.0" fill="url(#photoDust)"/>
                    <circle cx="401" cy="468" r="0.9" fill="url(#photoDust)"/>
                    <circle cx="173" cy="420" r="0.8" fill="url(#photoDust)"/>
                    <circle cx="526" cy="390" r="0.9" fill="url(#photoDust)"/>
                </g>

                <!-- start/stop and speed button engraving, subtle so it does not fight the UI -->
                <g opacity="0.56">
                    <rect x="70" y="495" width="92" height="56" rx="2" fill="none" stroke="#111514" stroke-width="3"/>
                    <rect x="76" y="501" width="80" height="44" rx="2" fill="#f0f2ea" opacity="0.24"/>
                    <text x="91" y="528" fill="#111514" font-size="8" font-family="Inter, Arial" font-weight="800" letter-spacing="1.2">start · stop</text>
                    <rect x="176" y="538" width="42" height="8" rx="1" fill="none" stroke="#1c211f" stroke-width="1.4"/>
                    <rect x="226" y="538" width="42" height="8" rx="1" fill="none" stroke="#1c211f" stroke-width="1.4"/>
                    <text x="185" y="536" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="700">33</text>
                    <text x="237" y="536" fill="#111514" font-size="6" font-family="Inter, Arial" font-weight="700">45</text>
                </g>

                <!-- pitch slider engraving -->
                <g opacity="0.68">
                    <text x="770" y="342" fill="#101514" font-size="7" font-family="Inter, Arial" font-weight="800">+8</text>
                    <text x="770" y="614" fill="#101514" font-size="7" font-family="Inter, Arial" font-weight="800">-8</text>
                    <text x="785" y="628" fill="#101514" font-size="7" font-family="Inter, Arial" font-weight="800" letter-spacing="0.8">pitch adj.</text>
                    <path d="M755 378 H773 M755 416 H768 M755 454 H773 M755 492 H768 M755 530 H773" stroke="#111514" stroke-width="1"/>
                    <path d="M815 378 H833 M820 416 H833 M815 454 H833 M820 492 H833 M815 530 H833" stroke="#111514" stroke-width="1"/>
                </g>

                <!-- brand/deck micro markings -->
                <g opacity="0.42">
                    <text x="590" y="548" fill="#101514" font-size="18" font-family="Georgia, serif" font-weight="700">Technics</text>
                    <text x="591" y="563" fill="#101514" font-size="7" font-family="Inter, Arial" font-weight="700" letter-spacing="0.7">quartz direct drive turntable system</text>
                    <text x="592" y="573" fill="#101514" font-size="6" font-family="Inter, Arial" letter-spacing="0.8">SL-1200 UI EDITION</text>
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
        if (applyPhotoFinish()) return;

        let tries = 0;
        const timer = window.setInterval(() => {
            tries += 1;
            if (applyPhotoFinish() || tries > 40) {
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
