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
            encrypt: true
        }
    })

    connection.on("connect", err => {
        if (err) {
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
                vscode.window.showInformationMessage(err.message)
            }
            else {
                vscode.window.showInformationMessage("Tag added successfully!")
            }
        });
    request.addParameter("name", TYPES.Text, name)
    connection.execSql(request);
}

module.exports.createConnection = createConnection;
module.exports.addTag = addTag;

module.exports = {
    createConnection,
    addTag
}
