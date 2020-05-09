const { Connection, Request, TYPES } = require("tedious");
const vscode = require('vscode');

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
            encrypt: true,
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

const addTag = function (name) {
    var request = new Request("if NOT EXISTS(SELECT id FROM tag_current WHERE name like @name)" +
        "INSERT INTO tag_current (id, name, date_creation, date_update)" +
        "VALUES (NEWID(), @name, getdate(), getdate())" +
        "else THROW 50000, 'The record already exist.', 1;",
        function (err) {
            if (err) {
                console.log(err)
                vscode.window.showErrorMessage(err.message)
            }
            else {
                vscode.window.showInformationMessage("Tag added successfully!")
            }
        });
    request.addParameter("name", TYPES.Text, name)
    connection.execSql(request);
}

const renameTag = function () {

    var getTagsRequest = new Request("SELECT id, name, date_creation FROM tag_current",
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

            var changeNameRequest = new Request("INSERT INTO tag_version (id, id_current, name, date_creation, date_update)" +
                "VALUES (NEWID(), @id, @oldName, @creationData, getdate())" +
                "UPDATE tag_current SET name = @newName, date_update = getdate()" +
                "WHERE id = @id",
                (err) => {
                    if (err) {
                        vscode.window.showErrorMessage("Something wrong with your database connection!")
                        console.log(err);
                    }
                    else {
                        vscode.window.showInformationMessage("Tag was renamed")
                    }
                });

            Promise.resolve(choosenTag).then(function (value) {

                var input = vscode.window.showInputBox({
                    placeHolder: "Input new name",
                    ignoreFocusOut: true
                })

                Promise.resolve(input).then(function (newName) {
                    var index = tags.findIndex(item => item == value)
                    changeNameRequest.addParameter("oldName", TYPES.Text, value)
                    changeNameRequest.addParameter("id", TYPES.UniqueIdentifier, rows[index][0].value)
                    changeNameRequest.addParameter("newName", TYPES.Text, newName)
                    changeNameRequest.addParameter("creationData", TYPES.DateTime, rows[index][2].value)
                    connection.execSql(changeNameRequest);
                })
            })

        });

    connection.execSql(getTagsRequest);
}

const deleteTag = function () {
    var getTagsRequest = new Request("SELECT id, name, date_creation FROM tag_current",
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

            var deleteTagRequest = new Request("INSERT INTO tag_version (id, id_current, name, date_creation," +
                "date_update, date_delete)" +
                "VALUES (NEWID(), null, @name, @creationData, getdate(), getdate())" +
                "UPDATE tag_version SET id_current = null WHERE id_current = @id " +
                "DELETE FROM tag_current WHERE id = @id",
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
                        deleteTagRequest.addParameter("name", TYPES.Text, value)
                        deleteTagRequest.addParameter("id", TYPES.UniqueIdentifier, rows[index][0].value)
                        deleteTagRequest.addParameter("creationData", TYPES.DateTime, rows[index][2].value)
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
module.exports.addTag = addTag;
module.exports.renameTag = renameTag
module.exports.deleteTag = deleteTag

module.exports = {
    createConnection,
    addTag,
    renameTag,
    deleteTag
}
