function onRun(context) {
    var urlString = "https://buymeacoffee.com/whiteuistore";
    var url = NSURL.URLWithString(urlString);
    
    if (!NSWorkspace.sharedWorkspace().openURL(url)) {
        console.log("Failed to open URL");
    }
}