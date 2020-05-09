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
		let name = await vscode.window.showInputBox({
			placeHolder: "Input your user name here",
			ignoreFocusOut: true
		})
		let pass = await vscode.window.showInputBox({
			placeHolder: "Input your password here",
			ignoreFocusOut: true,
			password: true
		})
		dbConnector.createConnection(name, pass)
	});

	let addTag = vscode.commands.registerCommand("power-bi-thems-extension.AddTag", async function () {
		let input = await vscode.window.showInputBox({
			placeHolder: "Add tag name",
			ignoreFocusOut: true
		})
		dbConnector.addTag(input)
	});

	let renameTag = vscode.commands.registerCommand("power-bi-thems-extension.RenameTag", async function () {
		dbConnector.renameTag()
	});

	let deleteTag = vscode.commands.registerCommand("power-bi-thems-extension.DeleteTag", async function () {
		dbConnector.deleteTag()
	});

	let visualize = vscode.commands.registerCommand("power-bi-thems-extension.Visualize", async function(){
		const pathConfig = vscode.workspace.getConfiguration('power-bi-thems-extension').get("PowerBiPath")
		if(pathConfig == "")
		{
			const input = vscode.window.showOpenDialog({
				filters : {
					"Power BI" : ['pbix']
				},
				openLabel : "Open Test"
			})

			Promise.resolve(input).then(function(inputPath){
				cp.exec(inputPath[0].path.substring(1, inputPath[0].path.length), function(err){
					if(err)
					{
						console.log(err)
						vscode.window.showErrorMessage("Your path should be with ASCII symbols and without spaces")
					}
					else
						vscode.window.showInformationMessage("If you want set default path for test file, you can do it in settings!")

				})
			})
		}
		else
		{
			cp.exec(pathConfig , function(err){
				if(err)
				{
					console.log(err)
					vscode.window.showErrorMessage("Your path should be with ASCII symbols and without spaces")
				}
			})
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(connect)
	context.subscriptions.push(addTag)
	context.subscriptions.push(renameTag)
	context.subscriptions.push(deleteTag)
	context.subscriptions.push(visualize)
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
