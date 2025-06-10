import * as vscode from 'vscode';
import { Summarizer } from './summarizer';
import { EchoChatViewProvider } from './chatViewProvider';

let summarizer: Summarizer;
let chatProvider: EchoChatViewProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('Echo AI Assistant extension is now active!');
    
    // Initialize the summarizer
    summarizer = new Summarizer();
    
    // Create and register the webview view provider
    chatProvider = new EchoChatViewProvider(context.extensionUri, summarizer);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('echo.chatView', chatProvider, {
            webviewOptions: {
                retainContextWhenHidden: true
            }
        })
    );

    // Register command for clearing chat
    let clearChat = vscode.commands.registerCommand('echo.clearChat', () => {
        chatProvider.clearChat();
    });

    // Register command for refreshing
    let refresh = vscode.commands.registerCommand('echo.refresh', () => {
        chatProvider.refresh();
    });

    // Register command for summarizing selected text
    let summarizeSelection = vscode.commands.registerCommand('echo.summarizeSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText.trim()) {
            vscode.window.showErrorMessage('No text selected. Please select some text to summarize.');
            return;
        }

        // Ensure the Echo view is visible
        await vscode.commands.executeCommand('echo.chatView.focus');
        
        // Send the selected text to chat
        chatProvider.addUserMessage(`Summarize this: ${selectedText}`);
    });

    // Register command for sending code to chat
    let sendCodeToChat = vscode.commands.registerCommand('echo.sendCodeToChat', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        
        if (!selectedText.trim()) {
            vscode.window.showErrorMessage('No code selected. Please select some code to send to chat.');
            return;
        }

        // Get the language of the current file
        const languageId = editor.document.languageId;

        // Ensure the Echo view is visible
        await vscode.commands.executeCommand('echo.chatView.focus');
        
        // Send the selected code to chat with language context
        chatProvider.addUserMessage(`Here's some ${languageId} code:\n\n\`\`\`${languageId}\n${selectedText}\n\`\`\`\n\nCan you explain what this code does?`);
    });

    // Register command for summarizing input text
    let summarizeInput = vscode.commands.registerCommand('echo.summarizeInput', async () => {
        const inputText = await vscode.window.showInputBox({
            prompt: 'Enter text to summarize',
            placeHolder: 'Paste your text here...',
            ignoreFocusOut: true
        });

        if (!inputText || !inputText.trim()) {
            vscode.window.showErrorMessage('No text provided for summarization.');
            return;
        }

        // Ensure the Echo view is visible
        await vscode.commands.executeCommand('echo.chatView.focus');
        
        // Send the input text to chat
        chatProvider.addUserMessage(`Summarize this: ${inputText}`);
    });

    context.subscriptions.push(clearChat, refresh, summarizeSelection, sendCodeToChat, summarizeInput);
}

export function deactivate() {
    console.log('Echo AI Assistant extension is now deactivated');
} 