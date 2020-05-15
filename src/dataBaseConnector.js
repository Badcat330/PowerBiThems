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
                vscode.window.showErrorMessage(err.message)
                return
            }

            var tags = [];

            for (var i = 0; i < rowCount; i++) {
                tags.push(String(rows[i][1].value))
            }

            if(tags.length == 0)
            {
                vscode.showInformationMessage("No tags exist yet")
                return
            }

            let choosenTag = vscode.window.showQuickPick(tags,
                {
                    placeHolder: "Choose tag"
                })

            var changeNameRequest = new Request(scriptsSQL.renameTag,
                (err) => {
                    if (err) {
                        vscode.window.showErrorMessage(err.message)
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
                vscode.window.showErrorMessage(err.message)
                return
            }

            var tags = [];

            for (var i = 0; i < rowCount; i++) {
                tags.push(String(rows[i][1].value))
            }

            if(tags.length == 0)
            {
                vscode.showInformationMessage("No tags exist yet")
                return
            }

            let choosenTag = vscode.window.showQuickPick(tags,
                {
                    placeHolder: "Choose tag"
                })

            var deleteTagRequest = new Request(scriptsSQL.deleteTag,
                (err) => {
                    if (err) {
                        vscode.window.showErrorMessage(err.message)
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

let metadata = JSON.parse('{"*": {"Id": "","Tags": []}}')

const saveFile = async function (editor) {
    const text = editor.document.getText()
    var style = JSON.parse(text)
    if (!style.hasOwnProperty("visualStyles") || !style.visualStyles.hasOwnProperty("[18FA64C3-45E0-488A-ADB7-A4D37842CB93]")) {
        var createfileRequest = new Request(scriptsSQL.createFile,
            (err, rowCount, rows) => {
                if (err) {
                    console.log(err);
                    vscode.window.showErrorMessage("Something wrong with your database connection!")
                    return
                }
                metadata['*'].Id = rows[0][0].value
                console.log(metadata)
                vscode.commands.executeCommand("power-bi-thems-extension.changeMetadata")
                vscode.window.showInformationMessage("File was  to db")
            })
        let user = vscode.workspace.getConfiguration('power-bi-thems-extension').get("UserName")
        createfileRequest.addParameter("user", TYPES.NVarChar, user)
        createfileRequest.addParameter("data", TYPES.NVarChar, text)
        createfileRequest.addParameter("name", TYPES.NVarChar, editor.document.fileName.replace(/^.*[\\\/]/, ''))
        connection.execSql(createfileRequest);
    }
    else {
        var savefileRequest = new Request(scriptsSQL.saveFile,
            (err) => {
                if (err) {
                    console.log(err);
                    vscode.window.showErrorMessage(err.message)
                    return
                }
                vscode.window.showInformationMessage("File was saved")
            })
        let user = vscode.workspace.getConfiguration('power-bi-thems-extension').get("UserName")
        savefileRequest.addParameter("user", TYPES.NVarChar, user)
        savefileRequest.addParameter("new_data", TYPES.NVarChar, text)
        savefileRequest.addParameter("new_name", TYPES.NVarChar, editor.document.fileName.replace(/^.*[\\\/]/, ''))
        savefileRequest.addParameter("id", TYPES.UniqueIdentifier, style.visualStyles["[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"]["*"].Id)
        connection.execSql(savefileRequest);
    }

}

const addTag = async function (editor) {
    const text = editor.document.getText()
    let style = JSON.parse(text)
    if (!style.hasOwnProperty("visualStyles") || !style.visualStyles.hasOwnProperty("[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"))
        vscode.window.showErrorMessage("Save file in data base first!")
    else {
        let addTagRequest = new Request(scriptsSQL.addTag,
            async function (err) {
                if (err) {
                    console.log(err);
                    vscode.window.showErrorMessage(err.message)
                    return
                }
                vscode.window.showInformationMessage("Tag added")
            })

        let user = vscode.workspace.getConfiguration('power-bi-thems-extension').get("UserName")
        addTagRequest.addParameter("user", TYPES.NVarChar, user)



        let getTagsRequest = new Request(scriptsSQL.getTags,
            async function (err, rowCount, rows) {
                if (err) {
                    console.log(err);
                    vscode.window.showErrorMessage(err.message)
                    return
                }
                var tags = [];
                metadata['*'].Tags = []
                var addedTag = style.visualStyles["[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"]["*"].Tags

                for (var i = 0; i < rowCount; i++) {
                    if (!addedTag.includes(rows[i][1].value))
                        tags.push(String(rows[i][1].value))
                    else
                        metadata['*'].Tags.push(String(rows[i][1].value))
                }

                if(tags.length == 0)
                {
                    vscode.showInformationMessage("No tags exist yet")
                    return
                }

                let choosenTag = await vscode.window.showQuickPick(tags, {
                    placeHolder: "Choose tag"
                })

                var index = tags.findIndex(item => item == choosenTag)
                addTagRequest.addParameter("id_tag", TYPES.UniqueIdentifier, rows[index][0].value)
                var fileID = style.visualStyles["[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"]["*"].Id
                addTagRequest.addParameter("id_file", TYPES.UniqueIdentifier, fileID)

                connection.execSql(addTagRequest)

                metadata['*'].Id = fileID
                metadata['*'].Tags.push(choosenTag)
                vscode.commands.executeCommand("power-bi-thems-extension.changeMetadata")
            })

        connection.execSql(getTagsRequest)
    }
}

const removeTag = async function (editor) {
    const text = editor.document.getText()
    let style = JSON.parse(text)

    if (!style.hasOwnProperty("visualStyles") || !style.visualStyles.hasOwnProperty("[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"))
        vscode.window.showErrorMessage("Save file in data base first!")
    else {
        let removeTagRequest = new Request(scriptsSQL.removeTag,
            async function (err) {
                if (err) {
                    console.log(err);
                    vscode.window.showErrorMessage(err.message)
                    return
                }

                vscode.window.showInformationMessage("Tag was removed")
            }
        )

        var addedTags = style.visualStyles["[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"]["*"].Tags

        if(addedTags.length == 0)
        {
            vscode.showInformationMessage("No tags exist yet")
            return
        }


        let choosenTag = await vscode.window.showQuickPick(addedTags, {
            placeHolder: "Choose tag"
        })

        var isShure = await vscode.window.showQuickPick(["Yes", "No"], {
            placeHolder: "Are you shure?",
            ignoreFocusOut: true
        })

        if (isShure == 'Yes') {
            let getTagsRequest = new Request(scriptsSQL.getTags,
                async function (err, rowCount, rows) {
                    if (err) {
                        console.log(err);
                        vscode.window.showErrorMessage(err.message)
                        return
                    }

                    var tags = [];

                    for (var i = 0; i < rowCount; i++) {
                        tags.push(String(rows[i][1].value))
                    }

                    var index = tags.findIndex(item => item == choosenTag)
                    var fileID = style.visualStyles["[18FA64C3-45E0-488A-ADB7-A4D37842CB93]"]["*"].Id

                    removeTagRequest.addParameter("id_tag", TYPES.UniqueIdentifier, rows[index][0].value)
                    removeTagRequest.addParameter("id_file", TYPES.UniqueIdentifier, fileID)

                    connection.execSql(removeTagRequest)

                    metadata['*'].Id = fileID
                    metadata['*'].Tags = addedTags
                    index = addedTags.findIndex(item => item == choosenTag)
                    metadata['*'].Tags.splice(index, 1);
                    vscode.commands.executeCommand("power-bi-thems-extension.changeMetadata")
                })

            connection.execSql(getTagsRequest)
        }
    }
}

module.exports.createConnection = createConnection;
module.exports.createTag = createTag;
module.exports.changeTag = changeTag
module.exports.deleteTag = deleteTag
module.exports.saveFile = saveFile
module.exports.metadata = metadata
module.exports.addTag = addTag
module.exports.removeTag = removeTag

module.exports = {
    createConnection,
    createTag,
    changeTag,
    deleteTag,
    saveFile,
    metadata,
    addTag,
    removeTag
}
