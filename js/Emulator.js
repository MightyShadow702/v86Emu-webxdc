"use strict";

class Emulator
{
  stop()
  {
    this.engine.destroy()
    clearInterval(this._id);
    this.PowerMenu.remove();
    this.vKeyboard.remove();
    this.display.remove();
    if (this.onStop)
    {
      this.onStop();
    }
  }
  restart()
  {
    this.engine.restart();
  }
  constructor({ mem=128*1024*1024, vram=32*1024*1024, cdrom=null, hda=null, fda=null, acpi=true, vnet=true, onstop=undefined, vfs=false } = {})
  {
    this.onStop = onstop;

    var screen_container = document.createElement("div");
    screen_container.id = "screen_container";
    document.body.appendChild(screen_container);
    this.display = screen_container;

    //For Text-mode
    var screen_textout = document.createElement("div");
    screen_textout.style = "white-space: pre; font: 12px monospace; line-height: 14px";
    screen_textout.classList.add("emulator_screen");
    screen_container.appendChild(screen_textout);

    //For Graphical-mode
    var screen_display = document.createElement("canvas");
    screen_display.style.display = "none";
    screen_display.classList.add("emulator_screen");

    //Capture mouse
    screen_display.onclick = function(){
      engine.lock_mouse();
      screen_container.focus();
    }

    screen_container.appendChild(screen_display);

    //default config
    var config = {
      wasm_path: "core/v86.wasm",
      memory_size: mem,
      vga_memory_size: vram,
      screen_container: screen_container,
      bios: {
          url: "bios/seabios.bin",
      },
      vga_bios: {
          url: "bios/vgabios.bin",
      },
      acpi: acpi,
      autostart: true
    };

    if (cdrom != null)
    {
      config["cdrom"] = typeof cdrom == "string" ? {url: cdrom} : {buffer: cdrom};
    }
    if (hda != null)
    {
      config["hda"] = typeof hda == "string" ? {url: hda} : {buffer: hda};
    }
    if (fda != null)
    {
      config["fda"] = typeof fda == "string" ? {url: fda} : {buffer: fda};
    }

    if (vfs)
    {
      config["filesystem"] = {
        basefs: "/vFS.json",
        baseurl: "/vFS_blob/"
      }
    }

    this.config = config;

    var engine = new V86(config);
    this.engine = engine;

    //Autoscale
    function scaleEmulator(){
      var container = screen_container;
      var emulator = screen_display.style.display == "none" ? screen_textout : screen_display;
      if (! emulator)
      {
        return;
      }
      var scaleX = container.clientWidth / emulator.clientWidth;
      var scaleY = container.clientHeight / emulator.clientHeight;
      var scale = Math.min(scaleX, scaleY);
      emulator.style.transform = `scale(${scale})`;
    }

    window.addEventListener("resize", scaleEmulator);

    this._id = setInterval(scaleEmulator, 100);

    this.vKeyboard = new vKeyboard(engine);
    this.PowerMenu = new PowerMenu(this);

    if (window.webxdc.joinRealtimeChannel !== undefined && vnet)
    {
      const RTC = window.webxdc.joinRealtimeChannel();
      RTC.setListener((data) => {
        console.log("net recieve", data);
        engine.bus.send("net0-receive", data);
      });
      engine.add_listener("net0-send", function(packet){
        console.log("net send", packet);
        RTC.send(packet);
      });
    }
  }
}
