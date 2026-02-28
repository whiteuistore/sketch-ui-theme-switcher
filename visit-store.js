function onRun(context) {
    var urlString = "https://www.whiteui.store";
    var url = NSURL.URLWithString(urlString);
    
    if (!NSWorkspace.sharedWorkspace().openURL(url)) {
        console.log("Failed to open URL");
    }
}