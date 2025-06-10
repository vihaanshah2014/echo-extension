# Echo - AI Chat Assistant for VS Code

A powerful VS Code extension that provides a native sidebar chat interface for text summarization and AI assistance using the Echo AI service.

## Features

- **Native Sidebar Integration**: Built-in chat panel in VS Code's activity bar
- **Always Available**: Chat panel is always accessible from the sidebar
- **Context Menu Integration**: Right-click on selected text and summarize in chat
- **Command Palette**: Use `Ctrl+Shift+P` to access chat commands
- **Keyboard Shortcuts**: 
  - `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) to summarize selected text in chat
  - `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac) to send selected code to chat
  - `Ctrl+Shift+Alt+S` (or `Cmd+Shift+Alt+S` on Mac) to open text input dialog
  - `Enter` to send messages, `Shift+Enter` for new lines
- **Code Integration**: Send code snippets directly to chat for explanation
- **Smart UI**: Loading states, enter to send, disabled while processing
- **Enterprise Content Filtering**: Professional-grade profanity filtering using `bad-words` library
- **Persistent Chat**: Chat history is maintained during your session
- **VS Code Theme Integration**: Matches your current VS Code theme

## Installation

### From Source

1. Clone or download this extension
2. Open the `echo` folder in VS Code
3. Run `npm install` to install dependencies
4. Run `npm run compile` to compile TypeScript
5. Press `F5` to launch a new Extension Development Host window
6. Test the extension in the new window

### Installing as VSIX

1. Compile the extension: `npm run vscode:prepublish`
2. Package the extension: `vsce package` (requires `vsce` to be installed: `npm install -g vsce`)
3. Install the generated `.vsix` file in VS Code

## How to Use

### Access Echo Chat

1. Click the Echo AI icon (💬) in the Activity Bar on the left side of VS Code
2. The Echo AI chat panel will open in the sidebar
3. Type your questions or paste text to summarize
4. Chat with Echo AI in real-time

### Summarize Selected Text

1. Select any text in your editor
2. Right-click and choose "Echo: Summarize in Echo Chat" from the context menu
   - OR use the keyboard shortcut `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)
   - OR open Command Palette (`Ctrl+Shift+P`) and search for "Echo: Summarize in Echo Chat"
3. The chat panel will automatically open (if not already visible) and process your selected text
4. View the response in the chat interface

### Send Code to Chat

1. Select any code in your editor
2. Right-click and choose "Echo: Send Code to Chat" from the context menu
   - OR use the keyboard shortcut `Ctrl+Shift+C` (or `Cmd+Shift+C` on Mac)
   - OR open Command Palette (`Ctrl+Shift+P`) and search for "Echo: Send Code to Chat"
3. The code will be sent to chat with language context for explanation

### Use Text Input Dialog

1. Use the keyboard shortcut `Ctrl+Shift+Alt+S` (or `Cmd+Shift+Alt+S` on Mac)
   - OR open Command Palette (`Ctrl+Shift+P`) and search for "Echo: Summarize Text Input"
2. Enter or paste your text in the input dialog
3. The chat panel will automatically open (if not already visible) and process your text

## Requirements

- VS Code 1.60.0 or higher
- Internet connection (for API calls to Echo service)

## API Service

This extension uses the Echo AI service (echoyz.net) to provide intelligent AI assistance including text summarization, explanations, and more using advanced AI models.

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch
```

### Project Structure

```
echo/
├── src/
│   ├── extension.ts         # Main extension logic
│   ├── chatViewProvider.ts  # Native sidebar chat view
│   └── summarizer.ts        # API integration
├── package.json             # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── README.md               # This file
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License. 