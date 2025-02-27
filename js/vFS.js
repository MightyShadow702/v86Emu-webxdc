var vFSroot = {
  "fsroot": [],
  "size": 0,
  "version": 3
}

var vFSblob = {

}

class vFS_XMLHttpRequest extends XMLHttpRequest
{
  open(method, url, async, user, password)
  {
    this._vfs_mode = "default";
    if (method.toUpperCase() == "GET")
    {
      if (url == "/vFS.json")
      {
        this._vfs_mode = "metadata";
      }
      else if (url.substr(0, 9) == "/vFSblob/")
        {
          this._vfs_mode = "blob";
          this._vfs_path = url.substr(9);
        }
    }

    super.open(method, url, async, user, password);
  }
  send(body)
  {
    if (this._vfs_mode == "metadata")
    {
      console.log("vFS metadata");
      Object.defineProperty(this, "readyState", { value: 4 });
      Object.defineProperty(this, "status", { value: 200 });
      Object.defineProperty(this, "responseText", { value: JSON.stringify(vFSroot) });
      Object.defineProperty(this, "headers", { "Content-Type": "application/json" });
      this.onload();
    }
    else if (this._vfs_mode == "blob")
    {
      if (this._vfs_path in vFSblob)
      {
        var file = vFSblob[this._vfs_path];
        console.log("vFS open", this._vfs_path);
        Object.defineProperty(this, "readyState", { value: 4 });
        Object.defineProperty(this, "status", { value: 200 });
        Object.defineProperty(this, "responseText", { value: file.data });
        Object.defineProperty(this, "headers", { "Content-Type": file.type });
        this.onload();
      }
      else
      {
        super.send(body);
      }
    }
    else
    {
      super.send(body);
    }
  }
}

function importFile(fs)
{
  window.webxdc.importFiles({multiple: true}).then(files => {
    for (var i in files)
    {
      fs.addFile(files[i]);
    }
  })
}

function download(url)
{
  const xhr = new vFS_XMLHttpRequest();
  xhr.open("GET", url, true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log("Response:", xhr.responseText);
    } else {
      console.error("Error:", xhr.status);
    }
  };

  xhr.onerror = function () {
    console.error("Network Error!");
  };

  xhr.send();
}


class vFS
{
  async addFile(file)
  {
    await crypto.subtle.digest("SHA-256", await file.arrayBuffer()).then((hash) => {
      var hash_str = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("").substr(0, 8) + ".bin";
      vFSroot.fsroot.push([
        file.name,
        file.size,
        file.lastModified,
        33188,
        1000,
        1000,
        hash_str
      ]);
      vFSblob[file.name] = {
        data: file,
        type: file.type
      };
      vFSroot.size += file.size;
    });
  }
  async addVirtualFile(name, data, type="text/plain")
  {
    var blob = new Blob([data], { type: type });
    await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()).then((hash) => {
      var hash_str = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("").substr(0, 8) + ".bin";
      vFSroot.fsroot.push([
        name,
        data.length,
        new Date().getTime(),
        33188,
        1000,
        1000,
        hash_str
      ]);
      vFSblob[name] = {
        data: blob,
        type: type
      };
      vFSroot.size += data.length;
    });
  }
  removeFile(name)
  {
    var index = vFSroot.fsroot.map(x => x[0] == name).indexOf(true);
    if (index >= 0)
    {
      vFSroot.size -= vFSroot.fsroot[index][1];
      delete vFSroot.fsroot.pop(index);
      delete vFSblob[name];
    }
  }
  constructor()
  {

  }
}

window.XMLHttpRequest = vFS_XMLHttpRequest;
