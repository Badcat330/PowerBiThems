CREATE LOGIN designer_test
WITH PASSWORD = 'SuperSecret!';

CREATE USER designer_test
FOR LOGIN designer_test
WITH DEFAULT_SCHEMA = dbo;

ALTER ROLE designer ADD MEMBER designer_test;

CREATE LOGIN presenter_test
WITH PASSWORD = 'SuperSecret!';

CREATE USER presenter_test
FOR LOGIN presenter_test
WITH DEFAULT_SCHEMA = dbo;

ALTER ROLE db_datareader ADD MEMBER presenter_test;
ALTER ROLE db_datawriter ADD MEMBER presenter_test;