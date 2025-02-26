"use strict";

class vKeyboard
{
  holdKey(scanCode){
    this.engine.keyboard_send_scancodes([scanCode]);
  }

  freeKey(scanCode){
    this.engine.keyboard_send_scancodes([scanCode | 0x80]);
  }

  pressKey(keyCode)
  {
    //8: backspace, 13: return, 37: left 38: up, 39: right, 40: down
    if ((keyCode <= 47 || (keyCode >= 112 && keyCode <= 145)) && keyCode != 32 || keyCode == 93)
    {
      this.engine.keyboard_adapter.simulate_press(keyCode);
    }
  }

  putChar(char)
  {
    this.engine.keyboard_adapter.simulate_char(char);
  }

  toggle_button(obj, scanCode, value){
    if (value)
    {
      this.holdKey(scanCode);
      obj.style.backgroundColor = "rgb(22, 22, 22)";
      obj.style.color = "white";
    }
    else
    {
      this.freeKey(scanCode);
      obj.style.backgroundColor = "";
      obj.style.color = "black";
    }
  }

  paste_clipboard(){
    var buffer = prompt("Insert from clipboard");
    for (var i in buffer)
    {
      this.engine.keyboard_adapter.simulate_char(buffer[i]);
    }
  }

  new_button(text, trigger, id=null){
    var obj = document.createElement("button");
    obj.innerHTML = text;
    obj.onclick = function(){
      trigger(obj);
    }
    if (id != null)
    {
      obj.id = id;
    };
    return obj;
  }

  showSpecialKeys()
  {
    if (document.getElementById("vKeyboard_SpecialKeys"))
    {
      document.getElementById("vKeyboard_SpecialKeys").remove();
    }

    var SpecialKeys = document.createElement("div");
    SpecialKeys.id = "vKeyboard_SpecialKeys";
    document.body.appendChild(SpecialKeys);

    var close_bt = document.createElement("button");
    close_bt.id = "close";
    close_bt.innerHTML = "X";
    close_bt.onclick = () => {
      SpecialKeys.remove();
    }
    SpecialKeys.appendChild(close_bt);

    var content = document.createElement("div");
    content.id = "content";
    SpecialKeys.appendChild(content);

    var pressKey = this.pressKey.bind(this);
    // https://www.toptal.com/developers/keycode to check some more keycodes
    content.appendChild(this.new_button("Insert", () => pressKey(45)));
    content.appendChild(this.new_button("Del", () => pressKey(45)));
    content.appendChild(this.new_button("Pos1", () => pressKey(36)));
    content.appendChild(this.new_button("End", () => pressKey(35)));
    content.appendChild(this.new_button("PageUp", () => pressKey(33)));
    content.appendChild(this.new_button("PageDown", () => pressKey(34)));
    content.appendChild(this.new_button("Up", () => pressKey(38)));
    content.appendChild(this.new_button("Down", () => pressKey(40)));
    content.appendChild(this.new_button("Left", () => pressKey(37)));
    content.appendChild(this.new_button("Right", () => pressKey(39)));
    content.appendChild(this.new_button("ContextMenu", () => pressKey(93)));
    content.appendChild(this.new_button("Pause", () => pressKey(19)));
    content.appendChild(this.new_button("F1", () => pressKey(112)));
    content.appendChild(this.new_button("F2", () => pressKey(113)));
    content.appendChild(this.new_button("F3", () => pressKey(114)));
    content.appendChild(this.new_button("F4", () => pressKey(115)));
    content.appendChild(this.new_button("F5", () => pressKey(116)));
    content.appendChild(this.new_button("F6", () => pressKey(117)));
    content.appendChild(this.new_button("F7", () => pressKey(118)));
    content.appendChild(this.new_button("F8", () => pressKey(119)));
    content.appendChild(this.new_button("F9", () => pressKey(120)));
    content.appendChild(this.new_button("F10", () => pressKey(121)));
    content.appendChild(this.new_button("F11", () => pressKey(122)));
    content.appendChild(this.new_button("F12", () => pressKey(123)));
    content.appendChild(this.new_button("ESC", () => pressKey(27)));
  }

  new_input(text, id, type="password"){
    var user_input = document.createElement("input");
    user_input.id = id;
    user_input.type = type;
    user_input.placeholder = text;
    return user_input;
  }

  constructor(engine){
    this.alt = false;
    this.ctrl = false;
    this.engine = engine;

    //Menubar
    this.menubar = document.createElement("div");
    this.menubar.id = "vKeyboard_menubar";
    document.body.appendChild(this.menubar);

    //CTRL Key
    this.menubar.appendChild(this.new_button("CTRL", (o) => {
      this.ctrl = !this.ctrl;
      this.toggle_button(o, 0x1D, this.ctrl);
    }, "vKeyboard_ctrl"));

    //ALT Key
    this.menubar.appendChild(this.new_button("ALT", (o) => {
      this.alt = !this.alt;
      this.toggle_button(o, 0x38, this.alt);
    }, "vKeyboard_alt"));

    //TAB Key
    this.menubar.appendChild(this.new_button("TAB", () => this.engine.keyboard_adapter.simulate_press(9)));

    //Stdin
    this.stdin = this.new_input("Keyboard", "vKeyboard_stdin");
    this.stdin.onkeydown = (event) => this.pressKey(event.keyCode);
    this.stdin.oninput = (event) => this.putChar(event.data);
    this.stdin.onkeyup = () => this.stdin.value = "";
    this.menubar.appendChild(this.stdin);

    //Paste Key
    this.menubar.appendChild(this.new_button("Paste", this.paste_clipboard));

    //SpecialKeys Key
    this.menubar.appendChild(this.new_button("🔣", this.showSpecialKeys.bind(this)));
  }
  remove()
  {
    this.menubar.remove();
  }
}
