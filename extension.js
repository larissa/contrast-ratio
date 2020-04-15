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
const Lang = imports.lang;
const St = imports.gi.St;
const Gio = imports.gi.Gio;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const ColorInput = Me.imports.colorInput.ColorInput;
const ContrastRatio = Me.imports.contrastRatio.ContrastRatio;


let contrastRatioPanel;

const ContrastRatioPanel = new Lang.Class({
    Name: 'ContrastRatioPanel',
    Extends: PanelMenu.Button,
    _backgroundColorInput: null,
    _textColorInput: null,
    _contrastRatio: null,

    _init: function() {
        this.parent(0.0, "Contrast Ratio", false);

        let icon = new St.Icon({
            style_class: 'system-status-icon'
        });
        icon.gicon = Gio.icon_new_for_string(Me.path + '/icons/contrast-ratio-symbolic.svg');

        this.actor.add_actor(icon);

        let backgroundColorLabel = new PopupMenu.PopupMenuItem('Background color', { reactive: false });
        this.menu.addMenuItem(backgroundColorLabel);
        this._backgroundColorInput = new ColorInput('background', '#FFFFFF', this);
        this.menu.addMenuItem(this._backgroundColorInput);

        let textColorLabel = new PopupMenu.PopupMenuItem('Text color', { reactive: false });
        this.menu.addMenuItem(textColorLabel);
        this._textColorInput = new ColorInput('text', '#000000', this);
        this.menu.addMenuItem(this._textColorInput);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        this._contrastRatio = new ContrastRatio('#FFFFFF', '#000000');
        this.menu.addMenuItem(this._contrastRatio);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let swapColorsButton = new PopupMenu.PopupMenuItem('Swap colors', { activate: false });
        swapColorsButton.actor.connect('button-release-event', Lang.bind(this, this._onSwapColors));
        this.menu.addMenuItem(swapColorsButton);
    },

    _onSwapColors: function() {
        let backgroundColor = this._backgroundColorInput.color;
        let textColor = this._textColorInput.color;
        this._backgroundColorInput.update(textColor);
        this._textColorInput.update(backgroundColor);
        this.updateContrastRatio();
    },

    updateContrastRatio: function() {
        let backgroundColor = this._backgroundColorInput.color;
        let textColor = this._textColorInput.color;
        this._contrastRatio.update(backgroundColor, textColor);
    },
});

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
    contrastRatioPanel = new ContrastRatioPanel();
    Main.panel.addToStatusArea("contrast_ratio", contrastRatioPanel, 0, "right");
}

function disable() {
    if (contrastRatioPanel) {
        Main.panel._rightBox.remove_actor(contrastRatioPanel.container);
        Main.panel.menuManager.removeMenu(contrastRatioPanel.menu);
        contrastRatioPanel.destroy();
        contrastRatioPanel = null;
    };
}
