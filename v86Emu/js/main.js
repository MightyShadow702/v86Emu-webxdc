"use strict";

function onload()
{
    var emulator = window.emulator = new V86({
        wasm_path: "core/v86.wasm",
        memory_size: 128 * 1024 * 1024,
        vga_memory_size: 32 * 1024 * 1024,
        screen_container: document.getElementById("screen_container"),
        bios: {
            url: "bios/seabios.bin",
        },
        vga_bios: {
            url: "bios/vgabios.bin",
        },
        cdrom: {
            url: "linux.iso"
        },
        autostart: true
    });
}

//fit canvas to screen
setInterval(() => {
    var content = document.getElementById("screen_container");
    var scaleFactor = Math.min(window.innerWidth / content.clientWidth, window.innerHeight / content.clientHeight);
    if (scaleFactor === 1)
    {
        emulator.screen_set_scale(1,1);
    }
    content.style.transform = `scale(${scaleFactor})`;
}, 250);
