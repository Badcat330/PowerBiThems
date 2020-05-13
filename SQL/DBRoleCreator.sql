CREATE ROLE designer;
GRANT SELECT ON file_current TO designer;
GRANT SELECT ON file_version TO designer;
GRANT SELECT ON tag_current TO designer;
GRANT SELECT ON tag_version TO designer;
GRANT DELETE ON file_current TO designer;
GRANT UPDATE ON file_current TO designer;
