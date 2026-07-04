/* Extra mechanical detailing for the SVG tonearm layer. */

(function () {
    const DETAIL_MARKER = 'turntableArmDetailApplied';

    function getSvg() {
        return document.querySelector('#record-shelf-section .turntable-svg-arm');
    }

    function applyStaticDetail(svg) {
        if (!svg || svg.dataset[DETAIL_MARKER] === 'true') return;
        svg.dataset[DETAIL_MARKER] = 'true';

        const detailMarkup = `
            <g class="turntable-svg-arm-detail-static" pointer-events="none">
                <!-- anti-skate / lateral balance dial -->
                <g transform="translate(796 142)" filter="url(#svgSmallShadow)">
                    <circle cx="0" cy="0" r="31" fill="#0c0f0e" stroke="#485149" stroke-width="4"/>
                    <circle cx="0" cy="0" r="23" fill="none" stroke="#d8dbd2" stroke-width="1.5" opacity="0.45"/>
                    <circle cx="0" cy="0" r="15" fill="#1f2622" stroke="#778079" stroke-width="2"/>
                    <path d="M0 -22 L0 -15 M16 -16 L11 -11 M22 0 L15 0 M16 16 L11 11 M0 22 L0 15 M-16 16 L-11 11 M-22 0 L-15 0 M-16 -16 L-11 -11" stroke="#d9ddd4" stroke-width="1.2" opacity="0.58"/>
                    <path d="M0 0 L14 -8" stroke="#f4f6ef" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="0" cy="0" r="4" fill="#cbd0c8"/>
                    <text x="-13" y="-27" fill="#f4f6ef" font-size="6" font-family="Inter, Arial" font-weight="700" opacity="0.72">anti</text>
                    <text x="9" y="-20" fill="#f4f6ef" font-size="5" font-family="Inter, Arial" font-weight="700" opacity="0.62">skate</text>
                </g>

                <!-- height tower / bearing post behind pivot -->
                <g filter="url(#svgSmallShadow)">
                    <rect x="694" y="96" width="34" height="88" rx="13" fill="#5f6962" stroke="#1d231f" stroke-width="3"/>
                    <rect x="700" y="101" width="22" height="78" rx="9" fill="url(#svgArmMetal)" opacity="0.9"/>
                    <path d="M704 108 H720 M704 118 H720 M704 128 H720 M704 138 H720" stroke="#37413b" stroke-width="1.5" opacity="0.56"/>
                    <path d="M707 101 V177" stroke="#ffffff" stroke-width="2" opacity="0.25"/>
                </g>

                <!-- gimbal yoke and bearing bridge -->
                <g filter="url(#svgSmallShadow)">
                    <path d="M668 158 C678 132 700 122 722 129 C743 135 754 152 751 174" fill="none" stroke="#e6e8df" stroke-width="10" stroke-linecap="round" opacity="0.82"/>
                    <path d="M671 159 C682 140 699 133 719 137 C737 141 745 154 743 171" fill="none" stroke="#59635c" stroke-width="5" stroke-linecap="round" opacity="0.72"/>
                    <rect x="672" y="153" width="23" height="19" rx="5" fill="url(#svgArmMetal)" stroke="#303833" stroke-width="2"/>
                    <rect x="725" y="154" width="23" height="19" rx="5" fill="url(#svgArmMetal)" stroke="#303833" stroke-width="2"/>
                    <circle cx="683" cy="163" r="4" fill="#111514" stroke="#dce0d7" stroke-width="1.5"/>
                    <circle cx="736" cy="164" r="4" fill="#111514" stroke="#dce0d7" stroke-width="1.5"/>
                    <circle cx="710" cy="172" r="25" fill="none" stroke="#1f2622" stroke-width="3" opacity="0.54"/>
                    <circle cx="710" cy="172" r="18" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.34"/>
                </g>

                <!-- azimuth / bearing screw cluster -->
                <g filter="url(#svgSmallShadow)">
                    <circle cx="681" cy="205" r="10" fill="#202723" stroke="#828b83" stroke-width="2"/>
                    <path d="M676 205 H686" stroke="#dce0d7" stroke-width="1.5"/>
                    <circle cx="738" cy="209" r="10" fill="#202723" stroke="#828b83" stroke-width="2"/>
                    <path d="M733 209 H743" stroke="#dce0d7" stroke-width="1.5"/>
                    <path d="M690 206 C704 216 720 217 730 209" fill="none" stroke="#6f7971" stroke-width="4" stroke-linecap="round" opacity="0.74"/>
                </g>

                <!-- cue lift platform and rubber rest fork -->
                <g filter="url(#svgSmallShadow)">
                    <path d="M756 223 L795 274" stroke="#111514" stroke-width="10" stroke-linecap="round" opacity="0.78"/>
                    <path d="M760 224 L792 268" stroke="#8c958d" stroke-width="3" stroke-linecap="round" opacity="0.58"/>
                    <path d="M753 245 C764 234 782 237 791 251" fill="none" stroke="#dce0d7" stroke-width="5" stroke-linecap="round" opacity="0.78"/>
                    <path d="M766 249 L782 251" stroke="#111514" stroke-width="7" stroke-linecap="round"/>
                </g>

                <!-- calibration ticks around the pivot well -->
                <g opacity="0.72">
                    <path d="M642 171 A68 68 0 0 1 752 124" fill="none" stroke="#eef1ea" stroke-width="1" stroke-dasharray="2 7" opacity="0.42"/>
                    <text x="646" y="168" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">0</text>
                    <text x="673" y="128" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">1</text>
                    <text x="723" y="124" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">2</text>
                    <text x="750" y="151" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">3</text>
                </g>
            </g>`;

        svg.insertAdjacentHTML('beforeend', detailMarkup);
    }

    function applyMovingDetail(svg) {
        const armGroup = svg?.querySelector('.turntable-svg-moving-arm');
        if (!armGroup || armGroup.dataset[DETAIL_MARKER] === 'true') return;
        armGroup.dataset[DETAIL_MARKER] = 'true';

        const movingMarkup = `
            <g class="turntable-svg-arm-detail-moving" pointer-events="none">
                <!-- pivot collar and lock ring that move with the arm -->
                <circle cx="710" cy="172" r="29" fill="none" stroke="#111514" stroke-width="4" opacity="0.48"/>
                <circle cx="710" cy="172" r="21" fill="none" stroke="#eef1ea" stroke-width="2" opacity="0.45"/>
                <path d="M690 158 L707 172 L690 186" fill="none" stroke="#dce0d7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.74"/>
                <path d="M731 157 L713 172 L731 187" fill="none" stroke="#5c665f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.74"/>
                <rect x="646" y="392" width="28" height="18" rx="6" fill="url(#svgArmMetal)" stroke="#303833" stroke-width="2" transform="rotate(12 660 401)"/>
                <path d="M648 401 H672" stroke="#f4f6ef" stroke-width="1.5" opacity="0.5" transform="rotate(12 660 401)"/>
                <path d="M642 418 C633 453 615 501 588 538" fill="none" stroke="#1b201e" stroke-width="3" stroke-linecap="round" opacity="0.44"/>
            </g>`;

        armGroup.insertAdjacentHTML('afterbegin', movingMarkup);
    }

    function applyDetail() {
        const svg = getSvg();
        if (!svg) return false;
        applyStaticDetail(svg);
        applyMovingDetail(svg);
        return true;
    }

    function boot() {
        if (applyDetail()) return;

        let tries = 0;
        const timer = window.setInterval(() => {
            tries += 1;
            if (applyDetail() || tries > 40) {
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
