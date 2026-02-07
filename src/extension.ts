import * as vscode from 'vscode';
import { SocraticProvider } from './socraticProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('LogicLock IDE is now active!');

    const socraticProvider = new SocraticProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            SocraticProvider.viewType,
            socraticProvider
        )
    );

    // Command to manually open the sidebar
    context.subscriptions.push(
        vscode.commands.registerCommand('logiclock.startSocraticChat', () => {
            vscode.commands.executeCommand('workbench.view.extension.logiclock-sidebar');
        })
    );

    // Intercept Pastes and High-Velocity Text Changes
    vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || event.document !== editor.document) return;

        event.contentChanges.forEach((change) => {
            const lineCount = change.text.split('\n').length;
            const charCount = change.text.length;

            // Requirement: > 5 lines or > 200 characters
            if (lineCount > 5 || charCount > 200) {
                // Undo the paste immediately
                vscode.commands.executeCommand('undo');

                // Warning Message
                vscode.window.showWarningMessage(
                    '🚨 LogicLock: High-Velocity Paste detected! Large code blocks are blocked to encourage active learning.',
                    'Ask Socratic Coach'
                ).then(selection => {
                    if (selection === 'Ask Socratic Coach') {
                        // Pass context to the provider
                        const fileContent = editor.document.getText();
                        const blockedPaste = change.text;

                        socraticProvider.handleBlockedPaste(fileContent, blockedPaste);
                        vscode.commands.executeCommand('workbench.view.extension.logiclock-sidebar');
                    }
                });
            }
        });
    });
}

export function deactivate() { }
