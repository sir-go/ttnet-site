function onYouTubeIframeAPIReady() {
    var
        player_el = document.getElementById("youtube-audio"),
        trigger = document.createElement("img"),
        a = document.createElement("div")
    ;

    trigger.setAttribute("id", "youtube-icon");
    trigger.style.cssText = "cursor:pointer;cursor:hand";

    player_el.appendChild(trigger);

    a.setAttribute("id", "youtube-player");
    player_el.appendChild(a);

    var set_icon_played = function (e) {
        var a = e ? "IDzX9gL.png" : "quyUPXN.png";
        trigger.setAttribute("src", "https://i.imgur.com/" + a)
    };

    player_el.onclick = function () {
        if (r.getPlayerState() === YT.PlayerState.PLAYING || r.getPlayerState() === YT.PlayerState.BUFFERING) {
            r.pauseVideo();
            set_icon_played(!1)
        } else {
            r.playVideo();
            set_icon_played(!0)
        }
    };

    var r = new YT.Player("youtube-player", {
        height: "0",
        width: "0",
        videoId: player_el.dataset.video,
        playerVars: {
            autoplay: player_el.dataset.autoplay,
            loop: player_el.dataset.loop
        },
        events: {
            onReady: function (e) {
                r.setPlaybackQuality("small");
                set_icon_played(r.getPlayerState() !== YT.PlayerState.CUED)
            },
            onStateChange: function (e) {
                e.data === YT.PlayerState.ENDED && set_icon_played(!1)
            }
        }
    })
}
