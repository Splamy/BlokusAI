#!/bin/bash
base="www/"

function upload() {
    md5res="$(md5sum $base$1)"
    if [ ! -f "$base$1.md5" ] || [ "$(cat $base$1.md5)" != "$md5res" ]; then
        echo "File changed: $base$1"
        echo "$md5res" > "$base$1.md5"
        scp "$base$1" "splamy:~/blokus/$1"
    fi
}

upload "index.html"
upload "style.css"
upload "js/game.js"