const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow()
{
    const win = new BrowserWindow({
        icon: path.join(__dirname, "icon.ico"),
        width: 800,
        height: 600,
        frame: false,
        fullscreen: true
    });

    if(process.env.NODE_ENV === "dev")
    {
        win.loadURL("http://localhost:8000");
    } 
    else if(process.env.NODE_ENV === "prod")
    {
        win.loadFile(path.join(__dirname, "dist/index.html"));
    }
}

app.whenReady().then(() =>
{
    createWindow();

    app.on("activate", () =>
    {
        if(BrowserWindow.getAllWindows().length === 0)
        {
            createWindow();
        }
    });
});

app.on("window-all-closed", () =>
{
    if(process.platform !== "darwin")
    {
        app.quit();
    }
});