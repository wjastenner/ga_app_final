SET SEARCH_PATH
TO ga_app;

DROP TABLE IF EXISTS faultImage
CASCADE;
DROP TABLE IF EXISTS fault_update
CASCADE;
DROP TABLE IF EXISTS fault
CASCADE;
DROP TABLE IF EXISTS journey
CASCADE;
DROP TABLE IF EXISTS carriage
CASCADE;
DROP TABLE IF EXISTS carriageClass
CASCADE;
DROP TABLE IF EXISTS staff
CASCADE;
DROP TABLE IF EXISTS station
CASCADE;
DROP FUNCTION IF EXISTS carriage_details
(integer);
DROP FUNCTION IF EXISTS carExists
(integer);

CREATE TABLE carriageClass
(
    carriageClass VARCHAR(2),
    carriageLetter CHAR,
    numberOfSeats SMALLINT,
    toilet BOOLEAN,
    plugSockets BOOLEAN,
    wifi BOOLEAN,
    displayPanel BOOLEAN,
    CONSTRAINT carriageClass_pk PRIMARY KEY (carriageClass)
);

CREATE TABLE carriage
(
    carriageNo INTEGER,
    carriageClass VARCHAR(2),
    CONSTRAINT carriage_pk PRIMARY KEY (carriageNo),
    CONSTRAINT carriage_fk FOREIGN KEY (carriageClass) REFERENCES carriageClass
);
-- carriage type: I = intercity, R = rural 
-- toilet and bike rack determine whether these options will be displayed as fault categories
-- carriage type determines what location options will be displayed if this is neccessary
-- numberOfSeats determines the number of buttons needed when selecting seat number if neccessary
-- carriage letter may be used to identify the carriage if they don't know the carriage number

CREATE TABLE staff
(
    staffID INTEGER,
    fName VARCHAR(20),
    sName VARCHAR(20),
    dob DATE,
    CONSTRAINT staff_pk PRIMARY KEY (staffID)
);
-- information to verify staff ID at login (add some dummy data for demo)
-- name and dob allows staff to login if they don't know their staff ID

CREATE TABLE fault
(
    faultNo INTEGER,
    carriageNo INTEGER,
    category VARCHAR(100),
    location VARCHAR(100),
    faultDesc VARCHAR(1000),
    staffID INTEGER,
    dateReported DATE DEFAULT CURRENT_DATE,
    timeReported TIME DEFAULT CURRENT_TIME,
    img TEXT,
    status CHAR DEFAULT 'R',
    notes VARCHAR(1000),
    CONSTRAINT fault_pk PRIMARY KEY (faultNo),
    CONSTRAINT fault_fk1 FOREIGN KEY (carriageNo) REFERENCES carriage,
    CONSTRAINT fault_pk2 FOREIGN KEY (staffID) REFERENCES staff
);
-- this is assuming carriage will always be obtained, but might need to add another table if we could only get the train 
-- (ie a list of carriages) if they only know where the train was and at what time (ie on a rural train where the carriages don't have letters)
-- fault status- R = not reported, I = in progress, F = fixed

CREATE TABLE fault_update
(
    faultNo INTEGER,
    staffID INTEGER,
    status CHAR,
    notes VARCHAR(1000),
    dateReported DATE DEFAULT CURRENT_DATE,
    timeReported TIME DEFAULT CURRENT_TIME,
    CONSTRAINT fault_update_pk PRIMARY KEY (faultNo),
    CONSTRAINT fault_update_fk1 FOREIGN KEY (faultNo) REFERENCES fault,
    CONSTRAINT fault_update_fk2 FOREIGN KEY (staffID) REFERENCES staff
);

CREATE TABLE faultImage
(
    faultNo INTEGER,
    faultImage VARCHAR(20),
    CONSTRAINT faultImage_pk PRIMARY KEY (faultImage),
    CONSTRAINT faultImage_fk FOREIGN KEY (faultNo) REFERENCES FAULT
);
-- seperate table as 1 fault may have more than 1 image
-- need to work out how we will store images

CREATE TABLE station
(
    stationCode VARCHAR(3),
    stationName VARCHAR(50),
    CONSTRAINT station_pk PRIMARY KEY (stationCode)
);
-- stations have unique 3 letter codes eg norwich = NRW

CREATE TABLE journey
(
    carriageNo INTEGER,
    journeyDate DATE,
    departureTime TIME,
    arrivalTime TIME,
    departureStation VARCHAR(3),
    arrivalStation VARCHAR(3),
    CONSTRAINT journey_pk PRIMARY KEY (carriageNo,journeyDate,departureTime),
    CONSTRAINT journey_fk1 FOREIGN KEY (departureStation) REFERENCES station,
    CONSTRAINT journey_fk2 FOREIGN KEY (arrivalStation) REFERENCES station,
    CONSTRAINT journey_fk3 FOREIGN KEY (carriageNo) REFERENCES carriage
);
-- information to identify a train if they don't know the carriage number

CREATE OR REPLACE FUNCTION check_ID
(IN INTEGER) RETURNS BOOLEAN AS $$
DECLARE id INTEGER = $1;
BEGIN
    IF id IN (SELECT staffID
    FROM staff) 
	THEN
    RETURN TRUE;
END
IF;
	IF id NOT IN (SELECT staffID
FROM staff) 
--THEN RAISE EXCEPTION 'staff id not found';
	THEN
RETURN FALSE;
END
IF;
 END;
 $$
LANGUAGE PLPGSQL;


CREATE OR REPLACE FUNCTION car_exists
(IN INTEGER)
RETURNS BOOLEAN AS $$
DECLARE id
INTEGER
= $1;
BEGIN
    IF id IN (SELECT carriageno
    FROM carriage) 
THEN
    RETURN TRUE;
END
IF;
IF id NOT IN (SELECT carriageno
FROM carriage) 
THEN
RETURN FALSE;
END
IF;
 END;$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION carriage_details
(IN INTEGER)
RETURNS table
(car_exists BOOLEAN, carriageclass VARCHAR
(2), carriage_no INTEGER, seats SMALLINT, toilet BOOLEAN, sockets BOOLEAN, wifi BOOLEAN, displayPanel BOOLEAN) AS $$
BEGIN
    IF $1 IN (SELECT carriageno
    FROM carriage)
THEN
    RETURN QUERY
    SELECT *
    FROM car_exists($1) NATURAL JOIN
        (SELECT carriage.carriageclass, carriage.carriageno, carriageclass.numberofseats, carriageclass.toilet, carriageclass.plugsockets, carriageclass.wifi, carriageclass.displayPanel
        FROM carriage, carriageclass
        WHERE carriage.carriageclass = carriageclass.carriageclass AND carriage.carriageno = $1) AS info 
;
END
IF;
If $1 NOT IN (SELECT carriageno
FROM carriage)
THEN RAISE EXCEPTION 'carriage number not found';
END
IF;
 END;$$
LANGUAGE PLPGSQL;

CREATE OR REPLACE FUNCTION insert_fault
(INTEGER, 
VARCHAR
(100), 
VARCHAR
(100), 
VARCHAR
(1000), 
INTEGER,
TEXT)
RETURNS VOID AS
  'INSERT INTO fault(faultNo, carriageNo, category, location, faultDesc, staffID, img)
	VALUES ((SELECT COALESCE(MAX(faultNo),0) FROM fault) + 1, $1, $2, $3, $4, $5, $6);'
LANGUAGE SQL;