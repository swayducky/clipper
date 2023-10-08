; (async () => {
    const clipper = await import(chrome.runtime.getURL('core/clip.js'));
    await clipper.create()
})();
