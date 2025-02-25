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

    var ctrl_pressed = false;
    var alt_pressed = false;

    var emulator_view = document.createElement("div");
    emulator_view.id = "EmulatorView";
    document.body.appendChild(emulator_view);

    //Screen
    var screen = this.screen = document.createElement("div");
    screen.id = "screen_container";
    //For Text-mode
    var screen_textout = document.createElement("div");
    screen_textout.style = "white-space: pre; font: 12px monospace; line-height: 14px";
    screen_textout.classList.add("emulator_screen");
    screen.appendChild(screen_textout);

    //For Graphical-mode
    var screen_display = document.createElement("canvas");
    screen_display.style.display = "none";
    screen_display.classList.add("emulator_screen");
    screen.appendChild(screen_display);
    emulator_view.appendChild(screen);

    screen_display.onclick = function(){
      engine.lock_mouse();
      screen.focus();
    }

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

    function scaleEmulator(){
      var container = screen;
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

    // Menubar
    var keyboard_menu = document.createElement("div");
    keyboard_menu.id = "keyboard_menu";

    //ctrl key
    var ctrl_bt = document.createElement("button");
    ctrl_bt.innerHTML = "CTRL";
    ctrl_bt.onclick = function()
    {
      ctrl_pressed = !ctrl_pressed;
      if (ctrl_pressed)
      {
        ctrl_bt.style.backgroundColor = "black";
        ctrl_bt.style.color = "white";
      }
      else
      {
        ctrl_bt.style.backgroundColor = "";
        ctrl_bt.style.color = "black";
      }
    }
    keyboard_menu.appendChild(ctrl_bt);

    //alt key
    var alt_bt = document.createElement("button");
    alt_bt.innerHTML = "ALT";
    alt_bt.onclick = function()
    {
      alt_pressed = !alt_pressed;
      if (alt_pressed)
      {
        alt_bt.style.backgroundColor = "black";
        alt_bt.style.color = "white";
      }
      else
      {
        alt_bt.style.backgroundColor = "";
        alt_bt.style.color = "black";
      }
    }
    keyboard_menu.appendChild(alt_bt);

    //Input handling for mobile devices
    var user_input = document.createElement("input");
    user_input.id = "EmulatorInput";
    user_input.type = "password";
    user_input.placeholder = "Keyboard";
    user_input.onkeydown = function(event)
    {
      //8: backspace, 13: return, 37: left 38: up, 39: right, 40: down
      if (event.keyCode <= 47 && event.keyCode != 32)
      {
        engine.keyboard_adapter.simulate_press(event.keyCode);
      }
      else
      {
        window.emu.engine.keyboard_send_keys(event);
      }
    }

    user_input.oninput = function(event)
    {
      engine.keyboard_adapter.simulate_char(event.data);
    }

    user_input.onkeyup = function()
    {
      user_input.value = "";
    }
    keyboard_menu.appendChild(user_input);

    var clipboardbt = document.createElement("button");
    clipboardbt.innerHTML = "Paste";
    clipboardbt.onclick = function()
    {
      var buffer = prompt("Insert from clipboard");
      for (var i in buffer)
      {
        engine.keyboard_adapter.simulate_char(buffer[i]);
      }
    }
    keyboard_menu.appendChild(clipboardbt);

    document.body.appendChild(keyboard_menu);

    //Power menu

    var powermenubt = document.createElement("button");
    var powermenubt_icon = document.createElement("img");
    powermenubt_icon.src = "assets/pause.svg";
    powermenubt.appendChild(powermenubt_icon);
    powermenubt.id ="pwmenubt";
    powermenubt.onclick = function(){
      if(document.getElementById("PowerMenu"))
      {
        document.getElementById("PowerMenu").remove();
      }
      var powermenu = document.createElement("div");
      powermenu.id = "PowerMenu";

      var stopbt = document.createElement("button");
      stopbt.innerHTML = "Stop";
      stopbt.id = "stop";
      stopbt.onclick = function(){
        engine.stop().then(_ => {
          emulator_view.remove();
          powermenu.remove();
          powermenubt.remove();
          keyboard_menu.remove();
          document.getElementById("Init").style.display = "block";
        })
      }

      powermenu.appendChild(stopbt);
      var resetbt = document.createElement("button");
      resetbt.innerHTML = "Restart";
      resetbt.id = "restart";
      resetbt.onclick = function(){
        engine.restart();
        powermenu.remove();
      }
      powermenu.appendChild(resetbt);

      var cancelbt = document.createElement("button");
      cancelbt.innerHTML = "Cancel";
      cancelbt.onclick = function(){
        powermenu.remove();
      }
      powermenu.appendChild(cancelbt);
      document.body.appendChild(powermenu);
    }
    document.body.appendChild(powermenubt);

    if (window.webxdc.joinRealtimeChannel !== undefined && document.getElementById("network_active").checked)
    {
      const realtimeChannel = window.webxdc.joinRealtimeChannel();
      window.RTC = realtimeChannel;
      realtimeChannel.setListener((data) => {
        console.log("net recieve", data);
        engine.bus.send("net0-receive", data);
      });
      engine.add_listener("net0-send", function(packet){
        console.log("net send", packet);
        realtimeChannel.send(packet);
      })
    }
  }
}

function save_config()
{
  localStorage.memory_size = document.getElementById("memory_size").value;
  localStorage.vram_size = document.getElementById("vram_size").value;
  localStorage.disk_typ = document.getElementById("disk_typ").selectedIndex;
  localStorage.network_active = document.getElementById("network_active").checked ? "1" : "0";
}

function load_image()
{
  var disk_image = document.getElementById("disk_image").files[0];
  var mem_size = document.getElementById("memory_size").value;
  var vram_size = document.getElementById("vram_size").value;
  var disk_typ = document.getElementById("disk_typ").selectedIndex;
  if (!isNaN(mem_size) && !isNaN(vram_size) && disk_image !== undefined)
  {
    document.getElementById("Init").style.display = "none";
    var config = {mem: parseInt(mem_size)*1024*1024, vram: parseInt(mem_size)*1024*1024};
    if (disk_typ == 1)
    {
      config["hda"] = disk_image;
    }
    else if (disk_typ == 2)
    {
      config["cdrom"] = disk_image;
    }
    else if (disk_typ == 0)
    {
      config["fda"] = disk_image;
    }
    window.emu = new Emulator(config);
  }
}

function toggle_network()
{
  var network_alt = document.getElementById("network_alt");
  if (document.getElementById("network_active").checked)
  {
    network_alt.innerHTML = "active";
  }
  else
  {
    network_alt.innerHTML = "disabled";
  }
  save_config();
}

function autodetect_image(elem)
{
  var ext = elem.files[0].name.split(".").at(-1).toLowerCase();
  if (elem.files[0].size == 1474560 && ext == "img")
  {
    document.getElementById("disk_typ").selectedIndex = 0;
  }
  else if (ext == "img")
  {
    document.getElementById("disk_typ").selectedIndex = 1;
  }
  else if (ext == "iso")
  {
    document.getElementById("disk_typ").selectedIndex = 2;
  }
}

function onload()
{
  if (window.webxdc.joinRealtimeChannel === undefined)
  {
    document.getElementById("network_settings").style.display = "none";
  }
  if (localStorage.memory_size)
  {
     document.getElementById("memory_size").value = localStorage.memory_size;
  }
  if (localStorage.vram_size)
  {
     document.getElementById("vram_size").value = localStorage.vram_size;
  }
  if (localStorage.disk_typ)
  {
     document.getElementById("disk_typ").selectedIndex = localStorage.disk_typ;
  }
  if (localStorage.network_active)
  {
    var network_alt = document.getElementById("network_alt");
    document.getElementById("network_active").checked = localStorage.network_active == "1" ? true: false;
    if (document.getElementById("network_active").checked)
    {
      network_alt.innerHTML = "active";
    }
    else
    {
      network_alt.innerHTML = "disabled";
    }
  }
}
