// ==UserScript==
// @name         LessWrong 2.0 Anti-Kibitzer
// @namespace    mherreshoff
// @version      0.1
// @description  Hides usernames and scores on LessWrong.
// @author       Marello Herreshoff
// @match        *://www.lesswrong.com/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// ==/UserScript==

'use strict';
/* global $ */ // Reassures the linter that jQuery exists.
var censorship_on = true; // We start with censorship turned on (the user can't unlook.)

function colorful_censor_bar(name) {
    if (!(name in colorful_censor_bar.cache)) {
        var t = '_'.repeat(4 + Math.floor(26*Math.random()));
            // Some filler text so the bars have different lengths.
        var r = 255*Math.random();
        var g = 255*Math.random();
        var b = 255*Math.random();
        var c = `rgb(${r},${g},${b})` // A random color for the censor bar.
        var s = `<div style="background:${c};color:${c}">${t}</div>`;
        colorful_censor_bar.cache[name] = s;
    }
    return colorful_censor_bar.cache[name];
}
colorful_censor_bar.cache = {}


function vote_censor_bar(votes) { return '<span style="color:black">█</span>'; }

function notification_censor_bar(content) {
  var m = content.match(/^(.*)( has created .*)$/);
  if (!m) return content;
  return colorful_censor_bar(m[1]) + m[2];
}


function censorship_sweep() {
    function update_censor_text(selector, f, might_change) {
        $(selector).each((idx, elem) => {
            var data = $(elem).data("censor");
            var detected = $(elem).html();
            if (!data) {
                data = {'original': detected, 'bar': f(detected)}
            }
            if (might_change && detected != data.original && detected != data.bar) {
                data = {'original': detected, 'bar': f(detected)}
            }
            $(elem).html(censorship_on ? data.bar : data.original);
            $(elem).data("censor", data);
        });
    }
    update_censor_text(".UsersNameDisplay-userName", colorful_censor_bar, false);
    update_censor_text(".NotificationsItem-notificationLabel", notification_censor_bar, false);
    update_censor_text(".PostsVote-voteScore", vote_censor_bar, true);
    update_censor_text(".CommentsVote-voteScore", vote_censor_bar, true);
}

var censorship_sweeper = setInterval(censorship_sweep, 100);

function censorship_toggle() {
    censorship_on = !censorship_on;
    $("#censorship_toggle").html(
        "Turn Censorship " + (censorship_on ? "Off" : "On"));
}

$(".Header-rightHeaderItems").prepend(
    `<button type="button" style="border:1.5px solid black;border-radius:8px;"id="censorship_toggle">
Turn Censorship Off
</button>`);

$("#censorship_toggle").click(censorship_toggle);
