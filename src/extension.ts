'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "markdown-punctrans" is now active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('tabConvertLeftChar', tabConvertLeftChar)
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}

// TODO: read from a configuration file
function getReplaceChar(inputChar: string): string {
    switch (inputChar) {
        case "。": return ".";
        case "，": return ",";
        case "；": return ";";
        case "·": return "`";
        case "【": return "[";
        case "】": return "]";
        default: return inputChar;
    }
}
function tabConvertLeftChar() {
    let activeTextEditor = vscode.window.activeTextEditor
    if (!activeTextEditor) return;

    const { document, selections } = activeTextEditor

    let delegateToNormalTab = true;

    activeTextEditor.edit((editBuilder) => {
        for (let selection of selections) {
            if (selection.start.character == 0) continue;
            let prevCharRange = new vscode.Range(selection.start.translate(0, -1), selection.start)
            let prevChar = document.getText(prevCharRange);
            let replaceChar = getReplaceChar(prevChar);
            if (prevChar != replaceChar) {
                delegateToNormalTab = false
                editBuilder.replace(prevCharRange, replaceChar);
            }
        }
    }).then(() => {
        console.log('Edit applied')
    }, (err) => {
        console.log('Edit rejected with error ', err)
    });

    if (delegateToNormalTab) {
        vscode.commands.executeCommand("tab");
    }
}

