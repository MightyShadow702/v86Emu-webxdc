class vFS
{
  addFile(file)
  {
    if ("serviceWorker" in navigator)
    {
      //[name, mode, mtime, size, uid, gid, target]
      navigator.serviceWorker.controller.postMessage({
        mode: "add_file",
        mtime: file.lastModified,
        name: file.name,
        data: file,
        type: file.type,
        size: file.size
      });
    }
  }
  addVirtualFile(name, content, type="plain/text")
  {
    if ("serviceWorker" in navigator)
    {
      //[name, mode, mtime, size, uid, gid, target]
      navigator.serviceWorker.controller.postMessage({
        mode: "add_file",
        mtime: new Date().getTime(),
        name: name,
        data: content,
        type: type,
        size: content.length
      });
    }
  }
  constructor()
  {
    if ("serviceWorker" in navigator)
    {
      navigator.serviceWorker.register('/js/vFS-worker.js').catch(err => console.log('vFS-worker can not start...', err));
    }
  }
}
