-- Assume the user's ID is 123 (replace with the actual user ID)
DECLARE @UserId INT;
SET @UserId = 123;

-- Delete from related tables
DELETE FROM "Credential" WHERE "userId" = @UserId;
DELETE FROM "Stats" WHERE "userId" = @UserId;
-- Add more DELETE statements for other related tables

-- Delete the user from the main user table
DELETE FROM "User" WHERE "id" = @UserId;