/* Cleanup/polish layer after arm-detail.
   - Replaces the oversized silver headshell with a smaller black Technics-style headshell.
   - Softens busy fixed tonearm-base details so the pivot reads as one metal mechanism. */

(function () {
    const MARKER = 'turntablePolishApplied';

    function getSvg() {
        return document.querySelector('#record-shelf-section .turntable-svg-arm');
    }

    function hidePreviousHeadshells(armGroup) {
        Array.from(armGroup.querySelectorAll('g')).forEach((group) => {
            const transform = group.getAttribute('transform') || '';
            if (transform.includes('translate(492 571)') || transform.includes('translate(507 586)')) {
                group.setAttribute('opacity', '0');
            }
        });
    }

    function softenBaseDetail(svg) {
        const staticGroup = svg.querySelector('.turntable-svg-arm-detail-static');
        if (!staticGroup) return;

        staticGroup.setAttribute('opacity', '0.74');
        staticGroup.querySelectorAll('text').forEach((text) => {
            text.setAttribute('opacity', '0.32');
        });

        // The translucent board outline was reading as a HUD panel; keep it barely visible.
        Array.from(staticGroup.children).slice(0, 2).forEach((node) => {
            node.setAttribute('opacity', '0.14');
        });
    }

    function injectBlackHeadshell(armGroup) {
        if (armGroup.querySelector('.turntable-polished-headshell')) return;

        const markup = `
            <g class="turntable-polished-headshell" transform="translate(505 584) rotate(-25) scale(0.64)" pointer-events="none">
                <path d="M-9 6 L11 -10 H72 Q83 -10 88 1 L78 42 Q75 53 63 54 H1 Q-9 54 -12 43 Z" fill="#151a18" stroke="#020303" stroke-width="3"/>
                <path d="M-2 11 H22 Q28 11 27 18 L23 35 Q22 41 15 41 H-2 Q-7 41 -6 35 L-1 16 Q0 11 6 11" fill="#050706" stroke="#778078" stroke-width="1.8" opacity="0.94"/>
                <path d="M49 10 H71 Q77 10 76 17 L72 34 Q71 41 64 41 H48 Q43 41 44 35 L48 16 Q49 10 55 10" fill="#050706" stroke="#778078" stroke-width="1.8" opacity="0.94"/>
                <path d="M9 -6 H70" stroke="#ffffff" stroke-width="2" opacity="0.12"/>
                <path d="M-7 45 H75" stroke="#59635c" stroke-width="1.7" opacity="0.34"/>
                <circle cx="35" cy="18" r="5" fill="#ccd1c8" stroke="#060807" stroke-width="1.8"/>
                <circle cx="38" cy="36" r="5" fill="#ccd1c8" stroke="#060807" stroke-width="1.8"/>
                <circle cx="35" cy="18" r="1.8" fill="#222824"/>
                <circle cx="38" cy="36" r="1.8" fill="#222824"/>
                <text x="0" y="51" fill="#d8ddd4" font-size="7" font-family="Inter, Arial" font-weight="800" opacity="0.76">Technics</text>
                <rect x="-5" y="46" width="42" height="14" rx="3" fill="#272e2a" stroke="#0d1110" stroke-width="1.6"/>
                <rect x="4" y="57" width="27" height="9" rx="2" fill="#b9a27e" stroke="#554a3a" stroke-width="1.2"/>
                <path class="turntable-svg-needle" d="M16 65 L42 75" stroke="#1DB954" stroke-width="3" stroke-linecap="round" filter="url(#svgNeedleGlow)"/>
                <circle class="turntable-svg-needle" cx="42" cy="75" r="3" fill="#1DB954" filter="url(#svgNeedleGlow)"/>
            </g>`;

        armGroup.insertAdjacentHTML('beforeend', markup);
    }

    function applyPolish() {
        const svg = getSvg();
        if (!svg || svg.dataset[MARKER] === 'true') return false;

        const armGroup = svg.querySelector('.turntable-svg-moving-arm');
        if (!armGroup) return false;

        svg.dataset[MARKER] = 'true';
        hidePreviousHeadshells(armGroup);
        softenBaseDetail(svg);
        injectBlackHeadshell(armGroup);
        return true;
    }

    function boot() {
        if (applyPolish()) return;

        let tries = 0;
        const timer = window.setInterval(() => {
            tries += 1;
            if (applyPolish() || tries > 40) {
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
