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

const Color = {
    luminance: function(color) {
        let [r, g, b] = this._breakColorComponents(color);
        return (0.2126 * r + 0.7152 * g + 0.0722 * b);
    },

    _breakColorComponents: function(color) {
        let rgb = [
            parseInt(color.slice(1, 3), 16)/255,
            parseInt(color.slice(3, 5), 16)/255,
            parseInt(color.slice(5, 7), 16)/255
        ];
        for (let i = 0; i < rgb.length; i++) {
            if (rgb[i] < 0.03928) {
                rgb[i] /= 12.92;
            } else {
                rgb[i] = Math.pow((rgb[i] + 0.055) / 1.055, 2.4);
            }
        }
        return rgb;
    }
}
