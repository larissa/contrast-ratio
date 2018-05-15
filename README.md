# contrast-ratio extension for gnome-shell

Calculate contrast ratio for readability based on WCAG 2.0 recommendations. If
you have `grabc` installed, you can also capture color from your screen by
clicking on the color preview.

This extension has been tested on gnome-shell 3.26 and 3.28. If you're using
this extension in earlier versions of gnome-shell, please let me know so I can
officially add it to supported versions.

## Dependencies

If you want to capture color from a pixel on your screen, install `grabc`

    apt-get install grabc

Now you can grab a hex color code from a pixel on your screen by clicking on the
color box beside either the background color or text color.

## Installation from git

    git clone https://github.com/larissa/contrast-ratio.git ~/.local/share/gnome-shell/extensions/contrast-ratio@amadteaparty.org

Restart the shell and then enable the extension.


## Known issues

Picking a color from anywhere on screen is not supported on wayland for
security reasons, so `grabc` (and any other color picking tool) won't work if
you're using wayland.
