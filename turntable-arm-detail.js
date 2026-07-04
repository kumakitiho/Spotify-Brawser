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
                <!-- recessed tonearm board cut line -->
                <path d="M626 92 H825 Q842 92 842 109 V278 Q842 295 825 295 H636 Q619 295 619 278 V109 Q619 92 636 92" fill="none" stroke="#707a72" stroke-width="2" opacity="0.42"/>
                <path d="M632 98 H819 Q835 98 835 114 V272 Q835 288 819 288 H642 Q626 288 626 272 V114 Q626 98 642 98" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.26"/>

                <!-- knurled circular VTA base below the pivot -->
                <g filter="url(#svgSmallShadow)">
                    <circle cx="710" cy="172" r="104" fill="#080a09" opacity="0.28"/>
                    <circle cx="710" cy="172" r="88" fill="none" stroke="#101514" stroke-width="11" stroke-dasharray="1.5 3.2" opacity="0.82"/>
                    <circle cx="710" cy="172" r="78" fill="none" stroke="#d8dbd2" stroke-width="1.2" opacity="0.36"/>
                    <path d="M648 229 A88 88 0 0 0 777 221" fill="none" stroke="#dfe2d9" stroke-width="1.2" stroke-dasharray="2 8" opacity="0.48"/>
                    <text x="661" y="246" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700" opacity="0.58">tone arm height</text>
                </g>

                <!-- rear counterweight with calibration scale -->
                <g transform="translate(724 70)" filter="url(#svgSmallShadow)">
                    <rect x="-35" y="-16" width="74" height="34" rx="9" fill="url(#svgArmMetal)" stroke="#343c36" stroke-width="4"/>
                    <path d="M-30 -6 H34 M-30 4 H34 M-30 14 H34" stroke="#566058" stroke-width="1.5" opacity="0.55"/>
                    <path d="M-21 -17 V-7 M-5 -17 V-10 M11 -17 V-7 M27 -17 V-10" stroke="#1e2521" stroke-width="1" opacity="0.72"/>
                    <text x="-18" y="-20" fill="#29302c" font-size="6" font-family="Inter, Arial" font-weight="800">1.5</text>
                    <text x="12" y="-20" fill="#29302c" font-size="6" font-family="Inter, Arial" font-weight="800">0</text>
                    <path d="M-27 -13 H31" stroke="#ffffff" stroke-width="2" opacity="0.38"/>
                    <rect x="-13" y="18" width="27" height="34" rx="6" fill="url(#svgArmMetal)" stroke="#4e5450" stroke-width="3"/>
                    <path d="M-8 23 H9 M-8 30 H9 M-8 37 H9" stroke="#626b64" stroke-width="1" opacity="0.68"/>
                </g>

                <!-- anti-skate / lateral balance dial -->
                <g transform="translate(796 142)" filter="url(#svgSmallShadow)">
                    <circle cx="0" cy="0" r="32" fill="#0c0f0e" stroke="#485149" stroke-width="4"/>
                    <circle cx="0" cy="0" r="26" fill="none" stroke="#0a0d0c" stroke-width="2" stroke-dasharray="1 2.4" opacity="0.9"/>
                    <circle cx="0" cy="0" r="23" fill="none" stroke="#d8dbd2" stroke-width="1.5" opacity="0.45"/>
                    <circle cx="0" cy="0" r="15" fill="#1f2622" stroke="#778079" stroke-width="2"/>
                    <path d="M0 -22 L0 -15 M16 -16 L11 -11 M22 0 L15 0 M16 16 L11 11 M0 22 L0 15 M-16 16 L-11 11 M-22 0 L-15 0 M-16 -16 L-11 -11" stroke="#d9ddd4" stroke-width="1.2" opacity="0.58"/>
                    <path d="M0 0 L14 -8" stroke="#f4f6ef" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="0" cy="0" r="4" fill="#cbd0c8"/>
                    <text x="-13" y="-27" fill="#f4f6ef" font-size="6" font-family="Inter, Arial" font-weight="700" opacity="0.72">anti</text>
                    <text x="9" y="-20" fill="#f4f6ef" font-size="5" font-family="Inter, Arial" font-weight="700" opacity="0.62">skate</text>
                    <text x="-27" y="5" fill="#f4f6ef" font-size="5" font-family="Inter, Arial" opacity="0.62">0</text>
                    <text x="20" y="6" fill="#f4f6ef" font-size="5" font-family="Inter, Arial" opacity="0.62">3</text>
                </g>

                <!-- height tower / bearing post behind pivot -->
                <g filter="url(#svgSmallShadow)">
                    <rect x="694" y="96" width="34" height="88" rx="13" fill="#5f6962" stroke="#1d231f" stroke-width="3"/>
                    <rect x="700" y="101" width="22" height="78" rx="9" fill="url(#svgArmMetal)" opacity="0.9"/>
                    <path d="M704 108 H720 M704 118 H720 M704 128 H720 M704 138 H720 M704 148 H720" stroke="#37413b" stroke-width="1.5" opacity="0.56"/>
                    <path d="M707 101 V177" stroke="#ffffff" stroke-width="2" opacity="0.25"/>
                    <path d="M728 119 C741 125 748 136 748 151" fill="none" stroke="#151a18" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
                </g>

                <!-- Technics-like U gimbal yoke and bearing bridge -->
                <g filter="url(#svgSmallShadow)">
                    <path d="M663 150 L683 123 Q710 108 737 124 L758 152 L748 168 L727 145 Q710 135 692 145 L673 169 Z" fill="url(#svgArmMetal)" stroke="#38413b" stroke-width="3" opacity="0.94"/>
                    <path d="M681 138 H740" stroke="#ffffff" stroke-width="3" opacity="0.42"/>
                    <path d="M668 158 C678 132 700 122 722 129 C743 135 754 152 751 174" fill="none" stroke="#e6e8df" stroke-width="8" stroke-linecap="round" opacity="0.72"/>
                    <path d="M671 159 C682 140 699 133 719 137 C737 141 745 154 743 171" fill="none" stroke="#59635c" stroke-width="5" stroke-linecap="round" opacity="0.72"/>
                    <rect x="672" y="153" width="23" height="19" rx="5" fill="url(#svgArmMetal)" stroke="#303833" stroke-width="2"/>
                    <rect x="725" y="154" width="23" height="19" rx="5" fill="url(#svgArmMetal)" stroke="#303833" stroke-width="2"/>
                    <circle cx="683" cy="163" r="4" fill="#111514" stroke="#dce0d7" stroke-width="1.5"/>
                    <circle cx="736" cy="164" r="4" fill="#111514" stroke="#dce0d7" stroke-width="1.5"/>
                    <circle cx="710" cy="172" r="25" fill="none" stroke="#1f2622" stroke-width="3" opacity="0.54"/>
                    <circle cx="710" cy="172" r="18" fill="none" stroke="#ffffff" stroke-width="1.4" opacity="0.34"/>
                    <path d="M697 179 H723" stroke="#222923" stroke-width="7" stroke-linecap="round" opacity="0.45"/>
                </g>

                <!-- azimuth / bearing screw cluster -->
                <g filter="url(#svgSmallShadow)">
                    <circle cx="681" cy="205" r="10" fill="#202723" stroke="#828b83" stroke-width="2"/>
                    <path d="M676 205 H686" stroke="#dce0d7" stroke-width="1.5"/>
                    <circle cx="738" cy="209" r="10" fill="#202723" stroke="#828b83" stroke-width="2"/>
                    <path d="M733 209 H743" stroke="#dce0d7" stroke-width="1.5"/>
                    <path d="M690 206 C704 216 720 217 730 209" fill="none" stroke="#6f7971" stroke-width="4" stroke-linecap="round" opacity="0.74"/>
                    <circle cx="710" cy="212" r="5" fill="#101514" stroke="#cbd0c8" stroke-width="1"/>
                </g>

                <!-- cue lift platform, arm rest fork, and lift lever -->
                <g filter="url(#svgSmallShadow)">
                    <path d="M756 223 L795 274" stroke="#111514" stroke-width="10" stroke-linecap="round" opacity="0.78"/>
                    <path d="M760 224 L792 268" stroke="#8c958d" stroke-width="3" stroke-linecap="round" opacity="0.58"/>
                    <path d="M753 245 C764 234 782 237 791 251" fill="none" stroke="#dce0d7" stroke-width="5" stroke-linecap="round" opacity="0.78"/>
                    <path d="M766 249 L782 251" stroke="#111514" stroke-width="7" stroke-linecap="round"/>
                    <path d="M775 207 C790 213 797 226 795 243" fill="none" stroke="#dfe2d9" stroke-width="4" stroke-linecap="round" opacity="0.88"/>
                    <circle cx="776" cy="206" r="4" fill="#1c211f" stroke="#dfe2d9" stroke-width="1"/>
                </g>

                <!-- calibration ticks around the pivot well -->
                <g opacity="0.76">
                    <path d="M642 171 A68 68 0 0 1 752 124" fill="none" stroke="#eef1ea" stroke-width="1" stroke-dasharray="2 7" opacity="0.42"/>
                    <text x="646" y="168" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">0</text>
                    <text x="673" y="128" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">1</text>
                    <text x="723" y="124" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">2</text>
                    <text x="750" y="151" fill="#eef1ea" font-size="6" font-family="Inter, Arial" font-weight="700">3</text>
                    <path d="M624 197 H642 M632 213 H649 M646 229 H666" stroke="#eef1ea" stroke-width="1" opacity="0.26"/>
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
                <circle cx="710" cy="172" r="31" fill="none" stroke="#0d1110" stroke-width="5" opacity="0.55"/>
                <circle cx="710" cy="172" r="23" fill="none" stroke="#eef1ea" stroke-width="2" opacity="0.45"/>
                <circle cx="710" cy="172" r="16" fill="none" stroke="#6e7870" stroke-width="2" opacity="0.62"/>
                <path d="M690 158 L707 172 L690 186" fill="none" stroke="#dce0d7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.74"/>
                <path d="M731 157 L713 172 L731 187" fill="none" stroke="#5c665f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity="0.74"/>
                <rect x="646" y="392" width="28" height="18" rx="6" fill="url(#svgArmMetal)" stroke="#303833" stroke-width="2" transform="rotate(12 660 401)"/>
                <path d="M648 401 H672" stroke="#f4f6ef" stroke-width="1.5" opacity="0.5" transform="rotate(12 660 401)"/>
                <path d="M642 418 C633 453 615 501 588 538" fill="none" stroke="#1b201e" stroke-width="3" stroke-linecap="round" opacity="0.44"/>

                <!-- headshell screw slots and cartridge wires -->
                <path d="M514 583 C501 599 493 612 488 628" fill="none" stroke="#aeb7b0" stroke-width="2" opacity="0.58"/>
                <path d="M519 588 C506 604 498 618 494 634" fill="none" stroke="#1db954" stroke-width="2" opacity="0.62"/>
                <path d="M525 593 C513 609 506 623 502 639" fill="none" stroke="#d65b4d" stroke-width="1.8" opacity="0.54"/>
                <circle cx="532" cy="594" r="3" fill="#dce0d7" stroke="#1c211f" stroke-width="1"/>
                <circle cx="547" cy="602" r="3" fill="#dce0d7" stroke="#1c211f" stroke-width="1"/>
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
