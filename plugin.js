// ==UserScript==
// @name         Callsign Enhancer Plugin
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Changes GeoFS multiplayer labels to format: "acid | callsign"
// @author       rico949
// @match        https://*.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    const waitForGeoFS = setInterval(() => {
        if (typeof geofs !== "undefined" &&
            geofs.api &&
            geofs.api.addLabel &&
            typeof multiplayer !== "undefined" &&
            multiplayer.User &&
            multiplayer.User.prototype.addCallsign &&
            typeof ui !== "undefined" &&
            ui.chat) {

            clearInterval(waitForGeoFS);


            const originalAddCallsign = multiplayer.User.prototype.addCallsign;

            multiplayer.User.prototype.addCallsign = function(callsign, labelType) {
                let acid = this.acid || 0;
                let safeCallsign = geofs.api.makeLabelTextSafe(callsign || "");
                let formattedLabel = `${acid} | ${safeCallsign}`;

                this.label = geofs.api.addLabel(formattedLabel, null, multiplayer.labelOptions[labelType]);

                if (multiplayer.iconOptions[labelType]) {
                    let iconOptions = Object.assign({}, multiplayer.iconOptions[labelType], {
                        pixelOffset: new Cesium.Cartesian2(-(4 * formattedLabel.length + 5), 2)
                    });
                    this.icon = new geofs.api.billboard(null, null, iconOptions);
                }
            };


            ui.chat.publish = function(e) {
                if (geofs.preferences.chat) {
                    const t = decodeURIComponent(e.msg);
                    ui.chat.$container = ui.chat.$container || $(".geofs-chat-messages");

                    let labelClass = "";
                    let formattedCallsign = "";

                    if (e.acid == geofs.userRecord.id) {
                        labelClass = "myself";
                        formattedCallsign = e.cs;
                    } else {
                        formattedCallsign = `${e.acid} | ${e.cs}`;
                    }

                    ui.chat.$container.prepend(
                        `<div class="geofs-chat-message ${e.rs}">
                            <b class="label ${labelClass}" data-player="${e.uid}" acid="${e.acid}" callsign="${e.cs}">
                                ${formattedCallsign}:
                            </b> ${t}
                        </div>`
                    );

                    ui.chat.$container.find(".geofs-chat-message").each(function(i, msg) {
                        $(msg).css("opacity", (ui.chat.maxNumberMessages - i) / ui.chat.maxNumberMessages);
                    }).eq(ui.chat.maxNumberMessages).remove();
                }
            };

            console.log("Callsign Enhancer Plugin initialized successfully!");
        }
    }, 250);
})();
