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

const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;


let contrast_ratio_panel;

const ContrastRatioPanel = new Lang.Class({
    Name: 'ContrastRatioPanel',
    Extends: PanelMenu.Button,
    text: null,

    _init: function() {
       this.parent(0.0, "Contrast Ratio", false);

       let icon = new St.Icon({
           icon_name: 'color-select-symbolic',
           style_class: 'system-status-icon'
       });
       this.actor.add_actor(icon);

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
