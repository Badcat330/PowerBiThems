const { Connection, Request, TYPES } = require("tedious");
const vscode = require('vscode');
const scriptsSQL = require('./ScriptsSQL')

let connection = null

const createConnection = function (userNameGiven, userPasswordGiven) {

    const host = vscode.workspace.getConfiguration('power-bi-thems-extension').get("Host")
    const dbName = vscode.workspace.getConfiguration('power-bi-thems-extension').get("Name")

    connection = new Connection({
        authentication: {
            options: {
                userName: userNameGiven,
                password: userPasswordGiven
            },
            type: "default"
        },
        server: host,
        options: {
            database: dbName,
            encrypt: false,
            rowCollectionOnRequestCompletion: true
        }
    })

    connection.on("connect", err => {
        if (err) {
            console.log(err);
            vscode.window.showErrorMessage(err.message);
        } else {
            vscode.window.showInformationMessage("Successful connection")
        }
    });
}

const createTag = async function () {
    let name = await vscode.window.showInputBox({
        placeHolder: "Add tag name",
        ignoreFocusOut: true
    })

    let user = vscode.workspace.getConfiguration('power-bi-thems-extension').get("UserName")
    let isNormative = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Is it normative tag?",
    })
    let isProcess = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Is it process tag?",
    })

    var request = new Request(scriptsSQL.createTag,
        function (err) {
            if (err) {
                console.log(err)
                vscode.window.showErrorMessage(err.message)
            }
            else {
                vscode.window.showInformationMessage("Tag added successfully!")
            }
        });
    request.addParameter("name", TYPES.NVarChar, name)
    request.addParameter("user", TYPES.NVarChar, user)
    request.addParameter("is_normative", TYPES.Bit, isNormative == "Yes" ? 1 : 0)
    request.addParameter("is_process", TYPES.Bit, isProcess == "Yes" ? 1 : 0)
    connection.execSql(request);
}

const changeTag = async function () {

    var getTagsRequest = new Request(scriptsSQL.getTags,
        async function (err, rowCount, rows) {
            if (err) {
                console.log(err);
                vscode.window.showErrorMessage("Something wrong with your database connection!")
                return
            }

            var tags = [];

            for (var i = 0; i < rowCount; i++) {
                tags.push(String(rows[i][1].value))
            }

            let choosenTag = vscode.window.showQuickPick(tags,
                {
                    placeHolder: "Choose tag"
                })

            var changeNameRequest = new Request(scriptsSQL.renameTag,
                (err) => {
                    if (err) {
                        vscode.window.showErrorMessage("Something wrong with your database connection!")
                        console.log(err);
                    }
                    else {
                        vscode.window.showInformationMessage("Tag was renamed")
                    }
                });

            Promise.resolve(choosenTag).then(async function (value) {

                var input = vscode.window.showInputBox({
                    placeHolder: "Input new name",
                    ignoreFocusOut: true
                })

                Promise.resolve(input).then(async function (newName) {
                    var index = tags.findIndex(item => item == value)
                    let user = vscode.workspace.getConfiguration('power-bi-thems-extension').get("UserName")
                    changeNameRequest.addParameter("old_name", TYPES.NVarChar, value)
                    changeNameRequest.addParameter("id", TYPES.UniqueIdentifier, rows[index][0].value)
                    changeNameRequest.addParameter("new_name", TYPES.NVarChar, newName)
                    changeNameRequest.addParameter("date_creation", TYPES.DateTime, rows[index][2].value)
                    changeNameRequest.addParameter("user", TYPES.NVarChar, user)

                    let isNormative = await vscode.window.showQuickPick(["Yes", "No"], {
                        placeHolder: "Is it normative tag?",
                    })

                    let isProcess = await vscode.window.showQuickPick(["Yes", "No"], {
                        placeHolder: "Is it process tag?",
                    })

                    changeNameRequest.addParameter("is_normative", TYPES.Bit, isNormative == "Yes" ? 1 : 0)
                    changeNameRequest.addParameter("is_process", TYPES.Bit, isProcess == "Yes" ? 1 : 0)
                    changeNameRequest.addParameter("is_normativeOld", TYPES.Bit, rows[index][3].value)
                    changeNameRequest.addParameter("is_processOld", TYPES.Bit, rows[index][4].value)
                   
                    connection.execSql(changeNameRequest);
                })
            })

        });

    connection.execSql(getTagsRequest);
}

const deleteTag = function () {
    var getTagsRequest = new Request(scriptsSQL.getTags,
        (err, rowCount, rows) => {
            if (err) {
                console.log(err);
                vscode.window.showErrorMessage("Something wrong with your database connection!")
                return
            }

            var tags = [];

            for (var i = 0; i < rowCount; i++) {
                tags.push(String(rows[i][1].value))
            }

            let choosenTag = vscode.window.showQuickPick(tags,
                {
                    placeHolder: "Choose tag"
                })

            var deleteTagRequest = new Request(scriptsSQL.deleteTag,
                (err) => {
                    if (err) {
                        vscode.window.showErrorMessage("Something wrong with your database connection!")
                        console.log(err);
                    }
                    else {
                        vscode.window.showInformationMessage("Tag was deleted")
                    }
                });

            Promise.resolve(choosenTag).then(function (value) {

                var input = vscode.window.showQuickPick(["Yes", "No"], {
                    placeHolder: "Are you shure?",
                    ignoreFocusOut: true
                })

                Promise.resolve(input).then(function (answer) {
                    if (answer == "Yes") {
                        var index = tags.findIndex(item => item == value)
                        let user = vscode.workspace.getConfiguration('power-bi-thems-extension').get("UserName")
                        deleteTagRequest.addParameter("name", TYPES.NVarChar, value)
                        deleteTagRequest.addParameter("id", TYPES.UniqueIdentifier, rows[index][0].value)
                        deleteTagRequest.addParameter("date_creation", TYPES.DateTime, rows[index][2].value)
                        deleteTagRequest.addParameter("is_normative", TYPES.Bit, rows[index][3].value)
                        deleteTagRequest.addParameter("is_process", TYPES.Bit, rows[index][4].value)
                        deleteTagRequest.addParameter("user", TYPES.NVarChar, user)
                        connection.execSql(deleteTagRequest);
                    }
                    else {
                        vscode.window.showInformationMessage("Operation canceled.")
                    }
                })
            })

        });

    connection.execSql(getTagsRequest);
}

module.exports.createConnection = createConnection;
module.exports.createTag = createTag;
module.exports.changeTag = changeTag
module.exports.deleteTag = deleteTag

module.exports = {
    createConnection,
    createTag,
    changeTag,
    deleteTag
}
