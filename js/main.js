"use strict";

var emulator = null;

class Emulator
{
  Stop()
  {
    clearInterval(this._id);
  }
  constructor({ mem=128*1024*1024, vram=32*1024*1024, cdrom=null, hda=null, fda=null } = {})
  {
    var engine;

    var emulator_view = document.createElement("div");
    emulator_view.id = "EmulatorView";
    var emulator_screenarea = document.createElement("div");
    emulator_screenarea.id = "EmulatorScreenarea"

    //Screen
    var screen = this.screen = document.createElement("div");
    screen.id = "screen_container";
    //For Text-mode
    var screen_textout = document.createElement("div");
    screen_textout.style = "white-space: pre; font: 12px monospace; line-height: 14px";
    screen.appendChild(screen_textout);

    //For Graphical-mode
    var screen_display = document.createElement("canvas");
    screen_display.style.display = "none";
    screen.appendChild(screen_display);
    emulator_screenarea.appendChild(screen);

    emulator_view.appendChild(emulator_screenarea);

    var user_input = document.createElement("input");
    user_input.id = "EmulatorInput";
    user_input.placeholder = "Keyboard";

    user_input.onchange = function()
    {
      for (var i in user_input.value)
      {
        engine.keyboard_adapter.simulate_char(user_input.value[i]);
      }
      engine.keyboard_adapter.simulate_press(13);
      user_input.value = null;
    }

    user_input.onkeydown = function(event)
    {
      if (event.keyCode == 13)
      {
        engine.keyboard_adapter.simulate_press(13);
      }
      else if (event.keyCode == 8)
      {
        engine.keyboard_adapter.simulate_press(8);
      }
    }

    emulator_view.appendChild(user_input);
    document.body.appendChild(emulator_view);

    var config = {
      wasm_path: "core/v86.wasm",
      memory_size: mem,
      vga_memory_size: vram,
      screen_container: screen,
      bios: {
          url: "bios/seabios.bin",
      },
      vga_bios: {
          url: "bios/vgabios.bin",
      },
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
    this.config = config;

    engine = new V86(config);
    this.engine = engine;

    this._id = setInterval(function(){
      var scaleFactor = Math.min(window.innerWidth / screen.clientWidth, (window.innerHeight-50) / screen.clientHeight);
      if (scaleFactor === 1)
      {
          engine.screen_set_scale(0.1,0.1);
      }
      screen.style.transform = `scale(${scaleFactor})`;
    }, 100);
  }
}

function load_image()
{
  var disk_image = document.getElementById("disk_image").files[0];
  var mem_size = document.getElementById("memory_size").value;
  var vram_size = document.getElementById("vram_size").value;
  if (!isNaN(mem_size) && !isNaN(vram_size) && disk_image !== undefined)
  {
    document.getElementById("Init").style.display = "none";
    window.emu = new Emulator({cdrom: disk_image, mem: parseInt(mem_size)*1024*1024, vram: parseInt(mem_size)*1024*1024});
  }
}
