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


const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Lang = imports.lang;
const Mainloop = imports.mainloop
const St = imports.gi.St;

const PopupMenu = imports.ui.popupMenu;


const ColorInput = new Lang.Class({
    Name: 'ColorInput',
    Extends: PopupMenu.PopupBaseMenuItem,
    color: null,
    _type: null,
    _colorEntry: null,
    _colorPreview: null,
    _outputReader: null,
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
        this._colorEntry.clutter_text.connect('key-focus-out', Lang.bind(this, this._onActivate));
        this.actor.add(this._colorEntry);

        this.update(this.color);
    },

    _onActivate: function() {
        this.update(this._colorEntry.get_text());
        this._panel.updateContrastRatio();
    },

    _onClickPreview: function() {
        // We only pick a color if we have an external tool available
        let pickerPath = GLib.spawn_command_line_sync('which grabc')[1].
            toString().
            replace('\n', '');

        if (pickerPath !== '') {
            this._getTopMenu().toggle();
            Mainloop.timeout_add(200, Lang.bind(this, function() {
                let [res, pid, in_fd, out_fd, err_fd] = GLib.spawn_async_with_pipes(null, [pickerPath], null, 0, null);
                this._outputReader = new Gio.DataInputStream({
                    base_stream: new Gio.UnixInputStream({fd: out_fd})
                });
                this._outputReader.read_upto_async("", 0, 0, null, Lang.bind(this, this._getColorCallBack));
            }));
        };
    },

    _updatePreviewColor: function() {
        this._colorPreview.set_style('background-color: ' + this.color + ';');
    },

    _getColorCallBack: function(source_object, res) {
        let [color, length] = this._outputReader.read_upto_finish(res);
        this.update(color);
        this._panel.updateContrastRatio();
        Mainloop.timeout_add(200, Lang.bind(this, function() {
            this._getTopMenu().toggle();
        }));
    },

    _setColor: function(color) {
        let res, rgbaColor;
        [res, rgbaColor] = Clutter.Color.from_string(color);
        if (res) {
            // Remove alpha hex and normalize color to upper case
            this.color = rgbaColor.to_string().substr(0, 7).toUpperCase();
            this._colorEntry.set_text(this.color);
        };
    },

    update: function(color) {
        this._setColor(color);
        this._updatePreviewColor();
    }

});
