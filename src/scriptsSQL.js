const createTag = "if EXISTS(SELECT id FROM tag_current WHERE name like @name) "+
"THROW 50000, 'The record already exist.', 1; "+
"DECLARE @id UNIQUEIDENTIFIER "+
"SET @id = NEWID() "+
"INSERT INTO tag_current ( id, is_normative, is_process, userId, userName, name, date_creation, date_update) "+
"VALUES (@id,  @is_normative, @is_process, USER_ID(@user), @user, @name,GETDATE(), GETDATE()) "+
"INSERT INTO tag_version (id, id_tag_current, name, date_creation, date_update, userID, userName, is_normative, is_process) "+
"VALUES (NEWID(), @id, @name, GETDATE(), getdate(), USER_ID(@user), @user, @is_normative, @is_process) "

const renameTag = "DECLARE @id_last_version UNIQUEIDENTIFIER; "+
"SELECT @id_last_version = id FROM tag_version WHERE id_tag_current = @id AND date_update = (SELECT MAX(date_update) FROM tag_version WHERE id_tag_current = @id); " +
"DECLARE @new_id UNIQUEIDENTIFIER " +
"SET @new_id = NEWID() "+
"INSERT INTO tag_version (id, id_tag_current, name, date_creation, date_update, userID, userName, is_normative, is_process) "+
  "VALUES (@new_id, @id, @old_name, @date_creation, getdate(), USER_ID(@user), @user, @is_normativeOld, @is_processOld); " +
"INSERT INTO file_tag_version SELECT @new_id, id_file_version FROM file_tag_version WHERE id_tag_version = @id_last_version "+
"UPDATE tag_current SET name = @new_name, date_update = getdate(), userId = USER_ID(@user), userName= @user, is_normative = @is_normative, is_process = @is_process"
"WHERE id = @id;"

const getTags = "SELECT id, name, date_creation, is_normative, is_process FROM tag_current"

const deleteTag = "DECLARE @id_last_version UNIQUEIDENTIFIER; "+
"SELECT @id_last_version = id FROM tag_version WHERE id_tag_current = @id AND date_update = (SELECT MAX(date_update) FROM tag_version WHERE id_tag_current = @id); " +
"DECLARE @new_id UNIQUEIDENTIFIER " +
"SET @new_id = NEWID() "+
"INSERT INTO tag_version (id, id_tag_current, name, date_creation, date_update, userID, userName, is_normative, is_process, date_delete) "+
  "VALUES (@new_id, @id, @name, @date_creation, getdate(), USER_ID(@user), @user, @is_normative, @is_process, getdate()); " +
"INSERT INTO file_tag_version SELECT @new_id, id_file_version FROM file_tag_version WHERE id_tag_version = @id_last_version "+
"DELETE FROM tag_current WHERE id = @id"

const addTag = "INSERT INTO file_tag_current (id_file_current, id_tag_current) VALUES (@id_file, @id_tag) " +
"DECLARE @id_last_version_file UNIQUEIDENTIFIER; " +
"SELECT @id_last_version_file = id FROM file_version WHERE id_file_current = @id_file AND date_update = (SELECT MAX(date_update) FROM file_version WHERE id_file_current = @id_file); "+
"DECLARE @id_last_version_tag UNIQUEIDENTIFIER; "+
"SELECT @id_last_version_tag = id FROM tag_version WHERE id_tag_current = @id_tag AND date_update = (SELECT MAX(date_update) FROM tag_version WHERE id_tag_current = @id_tag); "+
"DECLARE @new_id_file UNIQUEIDENTIFIER "+
"SET @new_id_file = NEWID()  "+
"DECLARE @name NVARCHAR(MAX) "+
"DECLARE @data NVARCHAR(MAX) "+
"DECLARE @date_creation DATETIME " +
"SELECT @name = fv.name, @data = fv.data, @date_creation = fv.date_creation FROM file_version fv WHERE fv.id = @id_last_version_file " +
"INSERT INTO file_version (id, id_file_current, userID, userName, name, data, date_creation, date_update) "+
  "VALUES (@new_id_file, @id_file, USER_ID(@user), @user, @name, @data, @date_creation, GETDATE()); " +
"INSERT INTO file_tag_version SELECT ftv.id_tag_version, @new_id_file FROM file_tag_version ftv WHERE ftv.id_file_version = @id_last_version_file "+
"INSERT INTO file_tag_version (id_tag_version, id_file_version) VALUES (@id_last_version_tag, @id_last_version_file)"

const removeTag = "DELETE FROM file_tag_current WHERE id_file_current = @id_file AND id_tag_current = @id_tag"

const createFile = "DECLARE @new_id_file UNIQUEIDENTIFIER "+
"SET @new_id_file = NEWID() " +
"INSERT file_current (id, userId, userName, name, data, date_creation, date_update) "+
  "VALUES (@new_id_file, USER_ID(@user), @user, @name, @data, GETDATE(), GETDATE()) "+
"INSERT file_version (id, id_file_current, userID, userName, name, data, date_creation, date_update) "+
  "VALUES (NEWID(), @new_id_file, USER_ID(@user), @user, @name, @data, GETDATE(),GETDATE()) " +
"SELECT @new_id_file, GETDATE(), @name"

const saveFile = "DECLARE @new_id UNIQUEIDENTIFIER " +
"SET @new_id = NEWID() " +
"DECLARE @data NVARCHAR(MAX) "+
"DECLARE @name NVARCHAR(MAX) " +
"DECLARE @data_creation DATETIME " +
"SELECT @data = data, @name = name, @data_creation = date_creation FROM file_current WHERE id = @id " +
"INSERT INTO file_version (id, id_file_current, userID, userName, name, data, date_creation, date_update) "+
  "VALUES (@new_id, @id, USER_ID(@user), @user, @name, @data, @data_creation, GETDATE()) "+
"DECLARE @id_last_version UNIQUEIDENTIFIER; "+
"SELECT @id_last_version = id FROM file_version WHERE id_file_current = @id AND date_update = (SELECT MAX(date_update) FROM file_version WHERE id_file_current = @id); "+
"INSERT INTO file_tag_version SELECT id_tag_version, @new_id FROM file_tag_version WHERE id_file_version = @id_last_version "+
"UPDATE file_current SET name = @new_name, data = @new_data, userId = USER_ID(@user), userName= @user, date_update = getdate() WHERE id = @id;"

const deleFile = "DECLARE @new_id UNIQUEIDENTIFIER " +
"SET @new_id = NEWID() " +
"INSERT INTO file_version (id, id_file_current, userID, userName, name, data, date_creation, date_update, date_delete) "+
  "VALUES (@new_id, @id, USER_ID(@user), @user, @name, @data, @data_creation, GETDATE(), GETDATE()) "+
"DECLARE @id_last_version UNIQUEIDENTIFIER; "+
"SELECT @id_last_version = id FROM file_version WHERE id_file_current = @id AND date_update = (SELECT MAX(date_update) FROM file_version WHERE id_file_current = @id); "+
"INSERT INTO file_tag_version SELECT id_tag_version, @new_id FROM file_tag_version WHERE id_file_version = @id_last_version "+
"DELETE FROM file_current WHERE id = @id"

const getFile = "SELECT id, name, data, userName, date_update FROM file_current"

exports.createTag = createTag
exports.renameTag = renameTag
exports.getTags = getTags
exports.deleteTag = deleteTag
exports.addTag = addTag
exports.removeTag = removeTag
exports.saveFile = saveFile
exports.createFile = createFile
exports.deleFile = deleFile
exports.getFile = getFile

module.export = {
    createTag,
    renameTag,
    getTags,
    deleteTag,
    addTag,
    removeTag,
    saveFile,
    createFile,
    deleFile,
    getFile
}