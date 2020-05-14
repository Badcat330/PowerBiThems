CREATE TABLE themes.dbo.tag_current (
  id UNIQUEIDENTIFIER NOT NULL
 ,is_normative BIT NULL
 ,user_id INT NULL
 ,user_name NVARCHAR(MAX) NULL
 ,is_process BIT NULL
 ,name NVARCHAR(MAX) NOT NULL
 ,date_creation DATETIME NOT NULL
 ,date_update DATETIME NOT NULL
 ,CONSTRAINT tag_current_pk PRIMARY KEY NONCLUSTERED (id)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE themes.dbo.tag_version (
  id UNIQUEIDENTIFIER NOT NULL
 ,id_tag_current UNIQUEIDENTIFIER NULL
 ,user_id INT NULL
 ,user_name NVARCHAR(MAX) NULL
 ,is_normative BIT NULL
 ,is_process BIT NULL
 ,name NVARCHAR(MAX) NOT NULL
 ,date_creation DATETIME NOT NULL
 ,date_update DATETIME NOT NULL
 ,date_delete DATETIME NULL
 ,CONSTRAINT tag_version_pk PRIMARY KEY NONCLUSTERED (id)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE themes.dbo.tag_version
ADD CONSTRAINT FK_tag_version_id_tag_current FOREIGN KEY (id_tag_current) REFERENCES dbo.tag_current (id) ON DELETE SET NULL
GO

CREATE TABLE themes.dbo.file_current (
  id UNIQUEIDENTIFIER NOT NULL
 ,user_id INT NULL
 ,user_name NVARCHAR(MAX) NULL
 ,name NVARCHAR(MAX) NOT NULL
 ,data NVARCHAR(MAX) NOT NULL
 ,date_creation DATETIME NOT NULL
 ,date_update DATETIME NOT NULL
 ,CONSTRAINT file_current_pk PRIMARY KEY NONCLUSTERED (id)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

CREATE TABLE themes.dbo.file_version (
  id UNIQUEIDENTIFIER NOT NULL
 ,id_file_current UNIQUEIDENTIFIER NULL
 ,user_id INT NULL
 ,user_name NVARCHAR(MAX) NULL
 ,name NVARCHAR(MAX) NOT NULL
 ,data NVARCHAR(MAX) NOT NULL
 ,date_creation DATETIME NOT NULL
 ,date_update DATETIME NOT NULL
 ,date_delete DATETIME NULL
 ,CONSTRAINT file_version_pk PRIMARY KEY NONCLUSTERED (id)
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO

ALTER TABLE themes.dbo.file_version
ADD CONSTRAINT FK_file_version_id_file_current FOREIGN KEY (id_file_current) REFERENCES dbo.file_current (id) ON DELETE SET NULL
GO

CREATE TABLE themes.dbo.file_tag_current (
  id_file_cuurent UNIQUEIDENTIFIER NULL
 ,id_tag_current UNIQUEIDENTIFIER NULL
) ON [PRIMARY]
GO

ALTER TABLE themes.dbo.file_tag_current
ADD CONSTRAINT FK_file_tag_id_file FOREIGN KEY (id_file_cuurent) REFERENCES dbo.file_current (id) ON DELETE CASCADE
GO

ALTER TABLE themes.dbo.file_tag_current
ADD CONSTRAINT FK_file_tag_id_tag FOREIGN KEY (id_tag_current) REFERENCES dbo.tag_current (id) ON DELETE CASCADE
GO

CREATE TABLE themes.dbo.file_tag_version (
  id_tag_version UNIQUEIDENTIFIER NULL
 ,id_file_version UNIQUEIDENTIFIER NULL
) ON [PRIMARY]
GO

ALTER TABLE themes.dbo.file_tag_version
ADD CONSTRAINT FK_file_tag_version_id_file_current FOREIGN KEY (id_file_version) REFERENCES dbo.file_version (id) ON DELETE CASCADE
GO

ALTER TABLE themes.dbo.file_tag_version
ADD CONSTRAINT FK_file_tag_version_id_tag_version FOREIGN KEY (id_tag_version) REFERENCES dbo.tag_version (id) ON DELETE CASCADE
GO