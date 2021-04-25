-- <------------------------------------------> 

-- Date: 08/09/2020

-- Create table similarplatforms

-- sql
create table similarplatform (plat_id int auto_increment primary key, plat_name varchar(225) not null unique)

-- Reason: Need to add table for similarplatform list so it can be dynamic and not static in frontend.

-- <------------------------------------------> 

-- Date: 07/09/2020

-- Alter table User Profile

-- sql
ALTER TABLE user_profile ADD city_id int;
ALTER TABLE user_profile ADD foreign key(city_id) references cities(id);

-- Reason: As we have country,state,city names not their ID's so by adding city id as foreign key here we will be able to get other state and country ID keeping table simplified here.

-- <------------------------------------------> 

-- Date: 18/09/2020

-- Alter table similarplatform

-- sql
ALTER TABLE similarplatform Change plat_id id int;

-- Insert data in table
insert into similarplatform (plat_name) values ('linkedin'), ('dribbble'), ('fiverr'), ('upwork');

-- Reason: Primary key sould always be named id if no other index is present.

-- <------------------------------------------> 

-- Date: 18/09/2020

-- Alter table User Platform List

-- sql
 ALTER TABLE user_platform_list ADD platform_id int;
 ALTER TABLE user_platform_list ADD foreign key(platform_id) references similarplatform(id);

-- Reason: Add platform id with foreign key constraint to table user_platform_list with reference of table similarplatform(plat_id) so that we can use it later in JOINs.

-- <------------------------------------------> 

-- Date: 01/10/2020

-- Alter table Job Service

-- sql
alter table job_service ADD FOREIGN KEY (serviceid) REFERENCES servicelist(id);

-- Reason: No reference for serviceid was present, added it so no wrong value will get inserted to table

-- <------------------------------------------> 

-- Date: 01/10/2020

-- Alter table Notification

-- sql
alter table notification add textmessage varchar(225) not null;

-- Reason: Added textmessage column(having plain text, not html) as it can be used later in frontend(react)

-- <------------------------------------------> 

-- Date: 06/10/2020

-- create table pending_upload

-- sql
create table pending_upload (id int primary key auto_increment, filename varchar(225) not null, url varchar(225) not null,
timestamp varchar(225) not null,is_used int default 0);

-- Reason: Added pending upload to store the url's for file's which are uploaded and then fetch 
-- and return them to frontend as job attachment's url

-- <------------------------------------------> 

-- Date: 19/10/2020

-- alter table chat_messages

-- sql
alter table chat_messages add external_id int default 0;

-- Reason: Added external_id to chat_messages table to use it as reference of custom_offer id or
-- user_project_inquiry id

-- <------------------------------------------> 