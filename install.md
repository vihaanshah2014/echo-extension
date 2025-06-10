# Installation Instructions

## Quick Start

1. **Open the extension folder in VS Code:**
   ```bash
   cd echo
   code .
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Compile the TypeScript:**
   ```bash
   npm run compile
   ```

4. **Test the extension:**
   - Press `F5` to launch a new Extension Development Host window
   - The extension will be loaded and ready to test

## Commands to try:

1. **Access the chat panel:**
   - Look for the Echo AI icon (💬) in the Activity Bar on the left side
   - Click it to open the Echo AI chat panel in the sidebar
   - You can start chatting with Echo immediately

2. **Test with selected text:**
   - Open any file in the Extension Development Host
   - Select some text
   - Right-click and choose "Echo: Summarize in Echo Chat"
   - Or use `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
   - The chat panel will automatically focus and process your text

3. **Test with input text:**
   - Use `Ctrl+Shift+Alt+S` (or `Cmd+Shift+Alt+S` on Mac)
   - Or open Command Palette (`Ctrl+Shift+P`) and search for "Echo: Summarize Text Input"
   - Enter text in the dialog box
   - The chat panel will automatically focus and process your text

## Package for distribution:

1. **Install VSCE (VS Code Extension manager):**
   ```bash
   npm install -g vsce
   ```

2. **Package the extension:**
   ```bash
   vsce package
   ```

3. **Install the .vsix file:**
   - In VS Code, go to Extensions view (`Ctrl+Shift+X`)
   - Click the "..." menu and select "Install from VSIX..."
   - Choose the generated `.vsix` file

## Troubleshooting

- If you get compilation errors, make sure all dependencies are installed: `npm install`
- If the API doesn't work, check your internet connection
- Check the VS Code Developer Console (`Help > Toggle Developer Tools`) for error messages 