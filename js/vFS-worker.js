var vFS_blob = {

}

var vFSroot = {
  "fsroot": [],
  "size": 0,
  "version": 2
}

self.addEventListener('install', event => {
  console.log('vFS-worker init…');
});

self.addEventListener('activate', event => {
  console.log('vFS online...');
});

self.addEventListener('message', (event) => {
  if (event.data.mode === "add_file") {
    vFSroot.fsroot.push([event.data.name, 4, event.data.mtime, event.data.size, 1000, 1000])
    vFSroot.size += event.data.size;
    vFS_blob[event.data.name] = {data: event.data.data, type: event.data.type};
  }
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin == location.origin)
  {
    if (url.pathname == '/vFS.json')
    {
      event.respondWith(
        new Response(JSON.stringify(vFSroot, null, 2), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })
      );
    }
    else if (url.pathname.substr(0, 10) == "/vFS_blob/")
    {
      var filename = url.pathname.substr(10);
      if (filename in vFS_blob)
      {
        var file = vFS_blob[filename];
        event.respondWith(
          new Response(file.data, {
            status: 200,
            headers: { 'Content-Type': file.type }
          })
        );
      }
    }
  }
});
