const vscode = require('vscode');
const dbConnector = require('./dataBaseConnector')
var cp = require('child_process');

const alternativeVisualizersLinks = {
	"Theme Generator": 'https://powerbi.tips/tools/report-theme-generator-v3/',
	"THEME BUILDER": 'https://senturus.com/power-bi-theme-builder/',
	"Palette": 'https://themes.powerbi.tips'
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "power-bi-thems-extension" is now active!');


	let disposable = vscode.commands.registerCommand('power-bi-thems-extension.AlternativeVisualizers', async function () {
		vscode.window.showInformationMessage('Helpfull links, which can help with your thems creation.\n',
			"Theme Generator",
			"THEME BUILDER",
			"Palette")
			.then(selection => {
				let selectionResult = alternativeVisualizersLinks[selection]
				vscode.env.openExternal(vscode.Uri.parse(selectionResult));
			});
	});

	let connect = vscode.commands.registerCommand("power-bi-thems-extension.DbConnection", async function () {
		var name = vscode.workspace.getConfiguration("power-bi-thems-extension").get("UserName")
		if (name == "") {
			name = await vscode.window.showInputBox({
				placeHolder: "Input your user name here",
				ignoreFocusOut: true
			})
			vscode.workspace.getConfiguration("power-bi-thems-extension").update("UserName", String(name))
			vscode.window.showInformationMessage("Your username successfully saved")
		}
		let pass = await vscode.window.showInputBox({
			placeHolder: "Input your password here",
			ignoreFocusOut: true,
			password: true
		})
		dbConnector.createConnection(name, pass)
	});

	let createTag = vscode.commands.registerCommand("power-bi-thems-extension.AddTag", async function () {
		dbConnector.createTag()
	});

	let changeTag = vscode.commands.registerCommand("power-bi-thems-extension.changeTag", async function () {
		dbConnector.changeTag()
	});

	let deleteTag = vscode.commands.registerCommand("power-bi-thems-extension.DeleteTag", async function () {
		dbConnector.deleteTag()
	});

	let saveFile = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.SaveFile", async function(editor) {
		dbConnector.saveFile(editor)
	})

	let changeMetadata = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.changeMetadata", async function(editor, edit) {
		const text = editor.document.getText()
		var style = JSON.parse(text)
		if (!style.hasOwnProperty("visualStyles")) {
			style["visualStyles"] = {
				"[18FA64C3-45E0-488A-ADB7-A4D37842CB93]" : dbConnector.metadata
			};
		}
		else {
			style.visualStyles["[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"] = dbConnector.metadata
		}
		const newText = JSON.stringify(style, null, '\t')
   		var firstLine = editor.document.lineAt(0);
    	var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
    	var textRange = new vscode.Range(0,
        firstLine.range.start.character,
        editor.document.lineCount - 1,
        lastLine.range.end.character);
    	edit.replace(textRange, newText)
	})

	let visualize = vscode.commands.registerCommand("power-bi-thems-extension.Visualize", async function () {
		const pathConfig = vscode.workspace.getConfiguration('power-bi-thems-extension').get("PowerBiPath")
		if (pathConfig == "") {
			const input = vscode.window.showOpenDialog({
				filters: {
					"Power BI": ['pbix']
				},
				openLabel: "Open Test"
			})

			Promise.resolve(input).then(function (inputPath) {
				cp.exec('"' + inputPath[0].path.substring(1, inputPath[0].path.length) + '"', function (err) {
					if (err) {
						console.log(err)
						vscode.window.showErrorMessage("Something wrong with your path, try again")
					}
					else
						vscode.window.showInformationMessage("If you want set default path for test file," +
							" you can do it in settings!")

				})
			})
		}
		else {
			cp.exec('"' + pathConfig + '"', function (err) {
				if (err) {
					console.log(err)
					vscode.window.showErrorMessage("Something wrong with your path, try again")
				}
			})
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(connect)
	context.subscriptions.push(createTag)
	context.subscriptions.push(changeTag)
	context.subscriptions.push(deleteTag)
	context.subscriptions.push(visualize)
	context.subscriptions.push(saveFile)
	context.subscriptions.push(changeMetadata)
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
