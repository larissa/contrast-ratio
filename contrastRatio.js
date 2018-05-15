/*
This file is part of 'contrast-ratio-extension'.

'contrast-ratio-extension' is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License (version 3) as
published by the Free Software Foundation

'contrast-ratio-extension' is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
more details.

You should have received a copy of the GNU General Public License along with
'contrast-ratio-extension'.  If not, see <http://www.gnu.org/licenses/>.

Copyright (c) 2018 Larissa Reis <reiss.larissa@gmail.com>
*/


const Lang = imports.lang;
const St = imports.gi.St;

const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Color = Me.imports.color.Color;


const ContrastRatio = new Lang.Class({
    Name: 'ContrastRatio',
    Extends: PopupMenu.PopupBaseMenuItem,
    _ratioLabel: null,
    _scoreLabel: null,

    _init: function(backgroundColor, textColor) {
        this.parent({ reactive: false, style_class: 'contrast-ratio' });

        this._ratioLabel = new St.Label()
        this._scoreLabel = new St.Label()

        this.actor.add(this._scoreLabel, { expand: true, x_align: St.Align.START });
        this.actor.add(this._ratioLabel, { expand: true, x_align: St.Align.END });

        this.update(backgroundColor, textColor);
    },

    _calculateContrastRatio: function(backgroundColor, textColor) {
        let ratio = (Color.luminance(backgroundColor) + 0.05) / (Color.luminance(textColor) + 0.05);
        if (ratio < 1) {
            ratio = 1/ratio;
        }
        // floor with 2 decimal places
        return Math.floor(ratio * 100)/100;
    },

    _scoreFromRatio: function(ratio) {
        let levels = {
            "Fail": {
                lower: 0,
                upper: 3
            },
            "AA-Large": {
                lower: 3,
                upper: 4.5
            },
            "AA": {
                lower: 4.5,
                upper: 7
            },
            "AAA": {
                lower: 7,
                upper: 22
            }
        };
        return Object.keys(levels).find(function(key) {
            return ratio >= levels[key].lower && ratio < levels[key].upper;
        });
    },

    update: function(backgroundColor, textColor) {
        let ratio = this._calculateContrastRatio(backgroundColor, textColor);
        let score = this._scoreFromRatio(ratio);

        this._ratioLabel.set_text(ratio.toString());
        this._scoreLabel.set_text(score);

        this.actor.set_style('background-color: ' + backgroundColor + '; color: ' + textColor + ';');
    },
});

