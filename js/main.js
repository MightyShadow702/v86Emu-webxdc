"use strict";
var vfs = new vFS();

function save_config()
{
  localStorage.memory_size = document.getElementById("memory_size").value;
  localStorage.vram_size = document.getElementById("vram_size").value;
  localStorage.disk_typ = document.getElementById("disk_typ").selectedIndex;
  localStorage.network_active = document.getElementById("network_active").checked ? "1" : "0";
  localStorage.acpi_active = document.getElementById("acpi_active").checked ? "1" : "0";
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
    var config = {
      mem: parseInt(mem_size)*1024*1024,
      vram: parseInt(mem_size)*1024*1024,
      acpi: document.getElementById("acpi_active").checked,
      vnet: document.getElementById("network_active").checked,
      onstop: () => {document.getElementById("Init").style.display = "block";},
      vfs: true
    };

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
    network_alt.innerHTML = "enabled";
  }
  else
  {
    network_alt.innerHTML = "disabled";
  }
  save_config();
}

function toggle_acpi()
{
  var acpi_alt = document.getElementById("acpi_alt");
  if (document.getElementById("acpi_active").checked)
  {
    acpi_alt.innerHTML = "enabled";
  }
  else
  {
    acpi_alt.innerHTML = "disabled";
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
      network_alt.innerHTML = "enabled";
    }
    else
    {
      network_alt.innerHTML = "disabled";
    }
  }
  if (localStorage.acpi_active)
  {
    var acpi_alt = document.getElementById("acpi_alt");
    document.getElementById("acpi_active").checked = localStorage.acpi_active == "1" ? true: false;
    if (document.getElementById("acpi_active").checked)
    {
      acpi_alt.innerHTML = "enabled";
    }
    else
    {
      acpi_alt.innerHTML = "disabled";
    }
  }
}
