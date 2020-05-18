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

	let createTag = vscode.commands.registerCommand("power-bi-thems-extension.CreateTag", async function () {
		dbConnector.createTag()
	});

	let changeTag = vscode.commands.registerCommand("power-bi-thems-extension.changeTag", async function () {
		dbConnector.changeTag()
	});

	let deleteTag = vscode.commands.registerCommand("power-bi-thems-extension.DeleteTag", async function () {
		dbConnector.deleteTag()
	});

	let saveFile = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.SaveFile", async function (editor) {
		dbConnector.saveFile(editor)
	})

	let addTag = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.AddTag",
		async function (editor) {
			dbConnector.addTag(editor)
		})

	let removeTag = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.RemoveTag", async function (editor) {
		dbConnector.removeTag(editor)
	})

	let deleteFile = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.DeleteFile",
		async function (editor) {
			dbConnector.deleteFile(editor)
		})

	let downloadFile = vscode.commands.registerCommand("power-bi-thems-extension.DownloadFile", async function(){
		dbConnector.downloadFile()
	})

	let showFileInformation = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.ShowFileInformation",
	async function (editor) {
		dbConnector.getInformationFromFile(editor)
	})

	let backToFileVersion = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.BackFileVersion",
	async function(editor){
		dbConnector.backToVersionFile(editor)
	})

	let changeMetadata = vscode.commands.registerTextEditorCommand("power-bi-thems-extension.changeMetadata", async function (editor, edit) {
		const text = editor.document.getText()
		var style = JSON.parse(text)
		if (!style.hasOwnProperty("visualStyles")) {
			style["visualStyles"] = {
				"[18FA64C3-45E0-488A-ADB7-A4D37842CB93]": dbConnector.metadata
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
		let normativePath = vscode.workspace.getConfiguration('power-bi-thems-extension').get("NormativeTestPath")
		let customPath = vscode.workspace.getConfiguration('power-bi-thems-extension').get("CustomTestPath")

		let customPathFlag = false
		let normativePathFlag = false
		
		let answer = await vscode.window.showQuickPick(["Normative", "Custom", "Both"], {placeHolder : "What test do you like to open?"})

		if(answer == "Normative")
			normativePathFlag = true
		if(answer == "Custom")
			customPathFlag = true
		if(answer == "Both"){
			normativePathFlag = true
			customPathFlag = true
		}

		if(customPathFlag){
			if(customPath == ""){
				var inputPath = await vscode.window.showOpenDialog({
					filters: {
						"Power BI": ['pbix']
					},
					openLabel: "Open custom test"
				})

				customPath = inputPath[0].path.substring(1, inputPath[0].path.length)
			}

			cp.exec('"' + customPath + '"', function (err) {
				if (err) {
					console.log(err)
					vscode.window.showErrorMessage("Something wrong with your custom path, try again.")
				}
			})
		}

		if(normativePathFlag){
			if(normativePath == ""){
				var inputPath = await vscode.window.showOpenDialog({
					filters: {
						"Power BI": ['pbix']
					},
					openLabel: "Open normative test"
				})

				normativePath = inputPath[0].path.substring(1, inputPath[0].path.length)
			}

			cp.exec('"' + normativePath + '"', function (err) {
				if (err) {
					console.log(err)
					vscode.window.showErrorMessage("Something wrong with your normative path, try again.")
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
	context.subscriptions.push(addTag)
	context.subscriptions.push(removeTag)
	context.subscriptions.push(deleteFile)
	context.subscriptions.push(downloadFile)
	context.subscriptions.push(showFileInformation)
	context.subscriptions.push(backToFileVersion)
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
