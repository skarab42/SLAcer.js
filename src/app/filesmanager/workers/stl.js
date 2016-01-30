onmessage = function(e) {
    var binary = false;
    postMessage({ action: 'start', data: { binary: binary } });
    postMessage({ action: 'end' });
    close();
};
