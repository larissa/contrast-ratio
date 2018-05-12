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


const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Mainloop = imports.mainloop
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


let contrast_ratio_panel;

const ColorInput = new Lang.Class({
    Name: 'ColorInput',
    Extends: PopupMenu.PopupBaseMenuItem,
    color: null,
    _type: null,
    _colorEntry: null,
    _colorPreview: null,
    _output_reader: null,
    _panel: null,

    _init: function(type, color, parentMenu) {
        this.parent({ reactive: false });

        this.color = color;
        this._type = type;
        this._panel = parentMenu;

        this._colorPreview = new St.Widget({ reactive: true, style_class: 'color-preview' });
        this._colorPreview.connect('button-release-event', Lang.bind(this, this._onClickPreview));
        this.actor.add(this._colorPreview);

        this._colorEntry = new St.Entry({ name: type, can_focus: true, style_class: 'color-entry' });
        this._colorEntry.clutter_text.connect('activate', Lang.bind(this, this._onActivate));
        this.actor.add(this._colorEntry);

        this.update(this.color);
    },

    _onActivate: function() {
        this.update(this._colorEntry.get_text());
        this._panel.updateContrastRatio();
    },

    _onClickPreview: function() {
        // We only pick a color if we have an external tool available
        let picker_path = GLib.spawn_command_line_sync('which grabc')[1].
            toString().
            replace('\n', '');

        if (picker_path !== '') {
            this._getTopMenu().toggle();
            Mainloop.timeout_add(200, Lang.bind(this, function() {
                let [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(null, [picker_path], null, 0, null);
                this._output_reader = new Gio.DataInputStream({
                    base_stream: new Gio.UnixInputStream({fd: out_fd})
                });
                this._output_reader.read_upto_async("", 0, 0, null, Lang.bind(this, this._getColorCallBack));
            }));
        };
    },

    _updatePreviewColor: function() {
        this._colorPreview.set_style('background-color: ' + this.color + ';');
    },

    _getColorCallBack: function(source_object, res) {
        let [color, length] = this._output_reader.read_upto_finish(res);
        this.update(color);
        this._panel.updateContrastRatio();
        Mainloop.timeout_add(200, Lang.bind(this, function() {
            this._getTopMenu().toggle();
        }));
    },

    _set_color: function(color) {
        let res, rgba_color;
        [res, rgba_color] = Clutter.Color.from_string(color);
        if (res) {
            // Remove alpha hex and normalize color to upper case
            this.color = rgba_color.to_string().substr(0, 7).toUpperCase();
            this._colorEntry.set_text(this.color);
        };
    },

    update: function(color) {
        this._set_color(color);
        this._updatePreviewColor();
    }

});

const ContrastRatio = new Lang.Class({
    Name: 'ContrastRatio',
    Extends: PopupMenu.PopupBaseMenuItem,
    _ratio_label: null,
    _score_label: null,

    _init: function(background_color, text_color) {
        this.parent({ reactive: false, style_class: 'contrast-ratio' });

        this._ratio_label = new St.Label()
        this._score_label = new St.Label()

        this.actor.add(this._score_label, { expand: true, x_align: St.Align.START });
        this.actor.add(this._ratio_label, { expand: true, x_align: St.Align.END });

        this.update(background_color, text_color);
    },

    _calculateContrastRatio: function(background_color, text_color) {
        // TODO: actually calculate contrast ratio
        return 5;
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

    update: function(background_color, text_color) {
        let ratio = this._calculateContrastRatio(background_color, text_color);
        let score = this._scoreFromRatio(ratio);

        this._ratio_label.set_text(ratio.toString());
        this._score_label.set_text(score);

        this.actor.set_style('background-color: ' + background_color + '; color: ' + text_color + ';');
    },
});

const ContrastRatioPanel = new Lang.Class({
    Name: 'ContrastRatioPanel',
    Extends: PanelMenu.Button,
    _background_color_input: null,
    _text_color_input: null,
    _contrast_ratio: null,

    _init: function() {
        this.parent(0.0, "Contrast Ratio", false);

        let icon = new St.Icon({
            icon_name: 'color-select-symbolic',
            style_class: 'system-status-icon'
        });
        this.actor.add_actor(icon);

        let background_color_label = new PopupMenu.PopupMenuItem('Background color', { reactive: false });
        this.menu.addMenuItem(background_color_label);
        this._background_color_input = new ColorInput('background', '#FFFFFF', this);
        this.menu.addMenuItem(this._background_color_input);

        let text_color_label = new PopupMenu.PopupMenuItem('Text color', { reactive: false });
        this.menu.addMenuItem(text_color_label);
        this._text_color_input = new ColorInput('text', '#000000', this);
        this.menu.addMenuItem(this._text_color_input);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._contrast_ratio = new ContrastRatio('#FFFFFF', '#000000');
        this.menu.addMenuItem(this._contrast_ratio);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let swap_colors_button = new PopupMenu.PopupMenuItem('Swap colors', { activate: false });
        swap_colors_button.actor.connect('button-release-event', Lang.bind(this, this._onSwapColors));
        this.menu.addMenuItem(swap_colors_button);
    },

    _onSwapColors: function() {
        let background_color = this._background_color_input.color;
        let text_color = this._text_color_input.color;
        this._background_color_input.update(text_color);
        this._text_color_input.update(background_color);
        this.updateContrastRatio();
    },

    updateContrastRatio: function() {
        let background_color = this._background_color_input.color;
        let text_color = this._text_color_input.color;
        this._contrast_ratio.update(background_color, text_color);
    },
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
