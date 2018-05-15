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
