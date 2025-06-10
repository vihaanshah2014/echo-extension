import * as vscode from 'vscode';
import { Summarizer } from './summarizer';

const Filter = require('bad-words');

export class EchoChatViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'echo.chatView';
    private _view?: vscode.WebviewView;
    private _summarizer: Summarizer;
    private _chatHistory: Array<{type: 'user' | 'assistant', content: string, timestamp: Date}> = [];
    private _isProcessing: boolean = false;
    private _profanityFilter: any;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        summarizer: Summarizer
    ) {
        this._summarizer = summarizer;
        this._profanityFilter = new Filter();
        
        // Configure for enterprise use
        this._profanityFilter.removeWords('damn', 'hell'); // Remove mild words that might be acceptable in enterprise
        this.addCustomFilters(); // Setup any custom enterprise filters
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.command) {
                case 'summarize':
                    await this.handleSummarizeMessage(data.text);
                    break;
                case 'clear':
                    this.clearChat();
                    break;
                case 'copy':
                    await vscode.env.clipboard.writeText(data.text);
                    vscode.window.showInformationMessage('Copied to clipboard!');
                    break;
            }
        });
    }

    public addUserMessage(text: string) {
        if (this._view && !this._isProcessing) {
            // Filter bad words using professional library
            const filteredText = this._profanityFilter.clean(text);
            
            this._chatHistory.push({
                type: 'user',
                content: filteredText,
                timestamp: new Date()
            });
            
            this._view.webview.postMessage({
                command: 'addUserMessage',
                content: filteredText
            });
            
            this.handleSummarizeMessage(filteredText, false);
        }
    }

    private async handleSummarizeMessage(text: string, addToHistory: boolean = true) {
        if (!this._view || this._isProcessing) {
            return;
        }

        this._isProcessing = true;

        // Add user message if not already added
        if (addToHistory) {
            const filteredText = this._profanityFilter.clean(text);
            this._chatHistory.push({
                type: 'user',
                content: filteredText,
                timestamp: new Date()
            });
        }

        // Send thinking state
        this._view.webview.postMessage({
            command: 'thinking'
        });

        try {
            const summary = await this._summarizer.summarizeText(text);
            
            // Filter AI response for inappropriate content
            const filteredSummary = this._profanityFilter.clean(summary);
            
            this._chatHistory.push({
                type: 'assistant',
                content: filteredSummary,
                timestamp: new Date()
            });

            this._view.webview.postMessage({
                command: 'addMessage',
                type: 'assistant',
                content: filteredSummary
            });

        } catch (error) {
            const errorMessage = `Sorry, I couldn't process your request: ${error instanceof Error ? error.message : 'Unknown error'}`;
            
            this._chatHistory.push({
                type: 'assistant',
                content: errorMessage,
                timestamp: new Date()
            });

            this._view.webview.postMessage({
                command: 'addMessage',
                type: 'error',
                content: errorMessage
            });
        } finally {
            this._isProcessing = false;
        }
    }

    private checkForProfanity(text: string): boolean {
        // Additional check to see if content contains profanity
        return this._profanityFilter.isProfane(text);
    }

    private addCustomFilters(): void {
        // Add enterprise-specific words or phrases to filter
        // this._profanityFilter.addWords('inappropriate', 'enterprise', 'terms');
        
        // You can also remove words that might be too restrictive for your context
        // this._profanityFilter.removeWords('mild', 'words');
    }

    public clearChat() {
        this._chatHistory = [];
        if (this._view) {
            this._view.webview.postMessage({
                command: 'clearChat'
            });
        }
    }

    public refresh() {
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Echo AI</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            background: var(--vscode-sideBar-background);
            color: var(--vscode-sideBar-foreground);
            margin: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .messages {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .message {
            padding: 8px 12px;
            border-radius: 8px;
            max-width: 90%;
            word-wrap: break-word;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .message.user {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            align-self: flex-end;
        }
        
        .message.assistant {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            color: var(--vscode-input-foreground);
            align-self: flex-start;
        }
        
        .message.thinking {
            background: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            color: var(--vscode-descriptionForeground);
            align-self: flex-start;
            font-style: italic;
            opacity: 0.8;
        }
        
        .message.error {
            background: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            color: var(--vscode-inputValidation-errorForeground);
            align-self: flex-start;
        }
        
        .input-container {
            border-top: 1px solid var(--vscode-panel-border);
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .input-area {
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 8px;
            font-family: inherit;
            font-size: 12px;
            resize: none;
            outline: none;
            min-height: 60px;
        }
        
        .send-btn {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            align-self: flex-end;
            transition: opacity 0.2s;
        }
        
        .send-btn:hover:not(:disabled) {
            background: var(--vscode-button-hoverBackground);
        }
        
        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .welcome {
            text-align: center;
            padding: 20px 12px;
            color: var(--vscode-descriptionForeground);
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="messages" id="messages">
        <div class="welcome">
            <strong>Welcome to Echo AI!</strong><br>
            I can help you summarize text, explain concepts, and answer questions.
        </div>
    </div>
    
    <div class="input-container">
        <textarea 
            class="input-area" 
            id="messageInput" 
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            rows="3"
        ></textarea>
        <button class="send-btn" id="sendBtn" onclick="sendMessage()">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        let isProcessing = false;

        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text || isProcessing) return;
            
            hideWelcome();
            addUserMessage(text);
            messageInput.value = '';
            setProcessingState(true);
            
            vscode.postMessage({
                command: 'summarize',
                text: text
            });
        }

        function addUserMessage(text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user';
            messageDiv.textContent = text;
            messagesContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function addAssistantMessage(content, type = 'assistant') {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${type}\`;
            messageDiv.textContent = content;
            messagesContainer.appendChild(messageDiv);
            scrollToBottom();
        }

        function showThinking() {
            const thinkingDiv = document.createElement('div');
            thinkingDiv.className = 'message thinking';
            thinkingDiv.id = 'thinking-indicator';
            thinkingDiv.textContent = '🤖 Echo is thinking...';
            messagesContainer.appendChild(thinkingDiv);
            scrollToBottom();
        }

        function hideThinking() {
            const thinkingDiv = document.getElementById('thinking-indicator');
            if (thinkingDiv) {
                thinkingDiv.remove();
            }
        }

        function setProcessingState(processing) {
            isProcessing = processing;
            sendBtn.disabled = processing;
            messageInput.disabled = processing;
            
            if (processing) {
                sendBtn.textContent = 'Sending...';
            } else {
                sendBtn.textContent = 'Send';
            }
        }

        function hideWelcome() {
            const welcome = document.querySelector('.welcome');
            if (welcome) {
                welcome.style.display = 'none';
            }
        }

        function scrollToBottom() {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Enter to send, Shift+Enter for new line
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'addUserMessage':
                    hideWelcome();
                    addUserMessage(message.content);
                    break;
                case 'addMessage':
                    hideThinking();
                    setProcessingState(false);
                    addAssistantMessage(message.content, message.type);
                    break;
                case 'thinking':
                    showThinking();
                    break;
                case 'clearChat':
                    setProcessingState(false);
                    messagesContainer.innerHTML = '<div class="welcome"><strong>Welcome to Echo AI!</strong><br>I can help you summarize text, explain concepts, and answer questions.</div>';
                    break;
            }
        });
    </script>
</body>
</html>`;
    }
} 