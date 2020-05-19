# PowerBI Styling and Branding (BIS)

This is extension for managing Power BI styles.

## Features

- Possibility to connect DB for storing styles
- Add tags to files
- Versioning files and it's tags
- Option for opening Power BI test dashboard from extension
- Option for redirecting to web resources for developing Power BI styles

## Requirements

- Visual Studio Code version 1.44.0 or hiegher
- Power BI Desktop version February 2020 or hiegher
- Microsoft SQL Server version 2016 or hiegher

Also you will need to creat db. You can do it with script, witch you can find in git repository.

## Extension Settings

This extension contributes the following settings:

* `power-bi-thems-extension.Host`: host for db connection
* `power-bi-thems-extension.UserName`: user name for db connection
* `power-bi-thems-extension.Name`: name of db for connection
* `power-bi-thems-extension.NormativeTestPath`: path to normative test dashboard
* `power-bi-thems-extension.CustomTestPath`: path to custom test dashboard

## Release Notes

### 0.0.5

Initial release of BIS


