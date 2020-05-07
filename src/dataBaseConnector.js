const { Connection, Request } = require("tedious");
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

module.exports.createConnection = createConnection;

module.exports = {
    createConnection
}
