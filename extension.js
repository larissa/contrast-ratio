/*
This file is part of 'contrast-ratio-extension'.

'contrast-ratio-extension' is free software: you can redistribute it and/or
modify it under the terms of the GNU General Public License (version 3) as
published by the Free Software Foundation

'contrast-ratio-extension' is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for
more details.

You should have received a copy of the GNU General Public License
along with 'contrast-ratio-extension'.  If not, see <http://www.gnu.org/licenses/>.

Copyright (c) 2018 Larissa Reis <reiss.larissa@gmail.com>
*/


const St = imports.gi.St;
const Main = imports.ui.main;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


let contrast_ratio_panel;

const ColorInput = new Lang.Class({
    Name: 'ColorInput',
    Extends: PopupMenu.PopupBaseMenuItem,
    _type: null,
    _color: null,
    _colorEntry: null,
    _colorPreview: null,

    _init: function(type, color) {
        this.parent({ reactive: false });

        this._type = type;
        this._color = color;

        this._colorPreview = new Clutter.Actor();
        this._colorPreview.set_size(35, 35);
        this._updatePreviewColor();
        this.actor.add(this._colorPreview);

        this._colorEntry = new St.Entry({ name: type, text: color, can_focus: true, style_class: 'color-entry' });
        this._colorEntry.clutter_text.connect('activate', Lang.bind(this, this._onActivate));
        this.actor.add(this._colorEntry);
    },

    _onActivate: function() {
        global.log(this._colorEntry.get_text());
        this._color = this._colorEntry.get_text();
        this._updatePreviewColor();
    },

    _updatePreviewColor: function() {
        let res, rgba_color
        [res, rgba_color] = Clutter.Color.from_string(this._color);
        if (res) {
          this._colorPreview.set_background_color(rgba_color);
        }
    }
});

const ContrastRatioLabel = new Lang.Class({
    Name: 'ContrastRatioLabel',
    Extends: PopupMenu.PopupBaseMenuItem,
    _ratio: null,

    _init: function(ratio) {
        this.parent({ reactive: false });

        this._ratio = ratio;
        let ratio_label = new St.Label({ text: ratio.toString() })
        let score_label = new St.Label({ text: this._scoreFromRatio(ratio) })

        this.actor.add(score_label);
        this.actor.add(ratio_label, { align: St.Align.END });
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
        }
        return Object.keys(levels).find(function(key) {
            return ratio >= levels[key].lower && ratio < levels[key].upper;
        });
    },
});

const ContrastRatioPanel = new Lang.Class({
    Name: 'ContrastRatioPanel',
    Extends: PanelMenu.Button,
    _backgroundColor: '#FFFFFF',
    _textColor: '#000000',

    _init: function() {
       this.parent(0.0, "Contrast Ratio", false);

       let icon = new St.Icon({
           icon_name: 'color-select-symbolic',
           style_class: 'system-status-icon'
       });
       this.actor.add_actor(icon);

       let background_color_label = new PopupMenu.PopupMenuItem('Background color', { reactive: false });
       this.menu.addMenuItem(background_color_label);
       let background_color_input = new ColorInput('background', this._backgroundColor);
       this.menu.addMenuItem(background_color_input);

       let text_color_label = new PopupMenu.PopupMenuItem('Text color', { reactive: false });
       this.menu.addMenuItem(text_color_label);
       let text_color_input = new ColorInput('text', this._textColor);
       this.menu.addMenuItem(text_color_input);

       let contrast_ratio_label = new ContrastRatioLabel(5);
       this.menu.addMenuItem(contrast_ratio_label);

       let separator = new PopupMenu.PopupSeparatorMenuItem();
       this.menu.addMenuItem(separator);

       let swap_colors_button = new PopupMenu.PopupMenuItem('Swap colors');
       swap_colors_button.connect('activate', Lang.bind(this, this._onSwapColors));
       this.menu.addMenuItem(swap_colors_button);
    },

    _onSwapColors: function() {
        global.log("Swapping colors");
    }
});

function init() {
}

function enable() {
    contrast_ratio_panel = new ContrastRatioPanel();
    Main.panel.addToStatusArea("contrast_ratio", contrast_ratio_panel, 0, "right");
}

function disable() {
    if (contrast_ratio_panel) {
      Main.panel._rightBox.remove_actor(contrast_ratio_panel.container);
      Main.panel.menuManager.removeMenu(contrast_ratio_panel.menu);
      contrast_ratio_panel.destroy();
      contrast_ratio_panel = null;
    };
}
