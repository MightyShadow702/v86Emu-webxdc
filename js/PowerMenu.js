"use strict";

class PowerMenu
{
  remove()
  {
    if(document.getElementById("PowerMenu_menu"))
    {
      document.getElementById("PowerMenu_menu").remove();
    }
    this.object.remove();
  }
  add_button(name, trigger, cl=null)
  {
    var bt = document.createElement("button");
    bt.innerHTML = name;
    if (cl != null)
    {
      bt.classList.add(cl);
    }
    bt.onclick = trigger;
    return bt;
  }
  show_menu()
  {
    if (document.getElementById("PowerMenu_menu"))
    {
      document.getElementById("PowerMenu_menu").remove();
    }
    var menu = document.createElement("div");
    menu.id = "PowerMenu_menu";
    document.body.appendChild(menu);

    var emulator = this.emulator;

    menu.appendChild(this.add_button("Stop", () => {
      emulator.stop();
    }, "danger"));
    menu.appendChild(this.add_button("Reboot", () => {
      emulator.restart();
    }, "danger"));
    menu.appendChild(this.add_button("Cancel", () => document.getElementById("PowerMenu_menu").remove()));
  }
  constructor(emu)
  {
    this.emulator = emu;

    var bt = document.createElement("button");
    this.object = bt;
    bt.id = "PowerMenu_button";
    var icon = document.createElement("img");
    icon.src = "assets/pause.svg";
    bt.appendChild(icon);
    document.body.appendChild(bt);
    bt.onclick = this.show_menu.bind(this);
  }
}
