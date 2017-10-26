'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const CONFIG_NAME = 'tabReplaceChar';

let g_config = vscode.workspace.getConfiguration(CONFIG_NAME);

// TODO: should put into a smaller scope
let g_langTable : object;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "tabconvertleftchar" is now active!');

    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(() => reloadConfiguration())
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('zh4ui.tabreplacechar', tabReplaceChar)
    );
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function reloadConfiguration() {
    g_config = vscode.workspace.getConfiguration(CONFIG_NAME);
}

function isConfigured(editor: vscode.TextEditor): boolean {
    if (!g_config.get<boolean>('enabled')) {
        return false;
    }
    let langId = editor.document.languageId;
    let langTable = g_config.get<object>('langConversionTable')[langId];
    if (langTable == null) {
        return false;
    }
    return true;
}
function getReplaceChar(inputChar: string): string {
    let replaceChar = g_langTable[inputChar]
    if (replaceChar == null) {
        replaceChar = inputChar;
    }
    return replaceChar;
}
function tabReplaceChar() {

    let activeTextEditor = vscode.window.activeTextEditor
    if (!activeTextEditor) return;

    let delegateToTabCommand = true;

    if (!isConfigured(activeTextEditor)) {
        // XXX bad smell of code
        vscode.commands.executeCommand("tab");
        return;
    }

    const { document, selections } = activeTextEditor

    activeTextEditor.edit((editBuilder) => {
        for (let selection of selections) {
            if (selection.start.character == 0) continue;
            let prevCharRange = new vscode.Range(selection.start.translate(0, -1), selection.start)
            let prevChar = document.getText(prevCharRange);
            let replaceChar = getReplaceChar(prevChar);
            if (prevChar != replaceChar) {
                delegateToTabCommand = false
                editBuilder.replace(prevCharRange, replaceChar);
            }
        }
    }).then(() => {
        console.log('Edit applied')
    }, (err) => {
        console.log('Edit rejected with error ', err)
    });

    if (delegateToTabCommand) {
        vscode.commands.executeCommand("tab");
    }
}

