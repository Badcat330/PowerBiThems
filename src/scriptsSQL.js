const createTag = "if NOT EXISTS(SELECT id FROM tag_current WHERE name like @name)" +
    "INSERT INTO tag_current (id, name, date_creation, date_update)" +
    "VALUES (NEWID(), @name, getdate(), getdate())" +
    "else THROW 50000, 'The record already exist.', 1;"

const renameTag = "INSERT INTO tag_version (id, id_current, name, date_creation, date_update)" +
    "VALUES (NEWID(), @id, @oldName, @creationData, getdate())" +
    "UPDATE tag_current SET name = @newName, date_update = getdate()" +
    "WHERE id = @id"

const getTags = "SELECT id, name, date_creation FROM tag_current"

const deleteTag = "INSERT INTO tag_version (id, id_current, name, date_creation," +
    "date_update, date_delete)" +
    "VALUES (NEWID(), null, @name, @creationData, getdate(), getdate())" +
    "UPDATE tag_version SET id_current = null WHERE id_current = @id " +
    "DELETE FROM tag_current WHERE id = @id"

exports.createTag = createTag
exports.renameTag = renameTag
exports.getTags = getTags
exports.deleteTag = deleteTag

module.export = {
    createTag,
    renameTag,
    getTags,
    deleteTag
}