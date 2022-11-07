// noinspection SpellCheckingInspection

const cams = [
    { name: "cam_01", elId: "clapprPlayer" },
    { name: "cam_rr", elId: "clapprPlayerRR" },
    { name: "cam_rst", elId: "clapprPlayerRST" },
    { name: "cam_gorpark", elId: "clapprPlayerGorpark" },
]
for (const c in cams) {
    new Clappr.Player({
        source: "https://stream.ttnet.ru/" + cams[c].name + ".m3u8",
        width: 691,
        height: 390,
        hideVolumeBar: true,
        mute: true,
        poster: "https://stream.ttnet.ru/" + cams[c].name + "_poster.jpg",
        disableVideoTagContextMenu: true,
        watermark: "https://ttnet.ru/static/images/patriot/patriot_logo_md.png", position: 'top-right',
        watermarkLink: "https://ttnet.ru/patriot",
        parentId: "#" + cams[c].elId
    });
}
