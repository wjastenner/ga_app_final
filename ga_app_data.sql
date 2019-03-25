INSERT INTO carriageClass(carriageClass, carriageLetter, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('I1','B', 56, true, true, true, true);
INSERT INTO carriageClass(carriageClass, carriageLetter, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('I2','C', 56, true, true, true, true);
INSERT INTO carriageClass(carriageClass, carriageLetter, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('I3','D', 58, true, true, true, true);
INSERT INTO carriageClass(carriageClass, carriageLetter, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('I4','E', 42, true, true, true, true);
INSERT INTO carriageClass(carriageClass, carriageLetter, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('I5','F', 46, true, true, true, true);
-- intercity trains

INSERT INTO carriageClass(carriageClass, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('R1', 0, true, true, true, true);
INSERT INTO carriageClass(carriageClass, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('R2', 0, false, false, false, true);
INSERT INTO carriageClass(carriageClass, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('R3', 0, false, false, false, true);
INSERT INTO carriageClass(carriageClass, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('R4', 0, true, false, false, true);
INSERT INTO carriageClass(carriageClass, numberOfSeats, toilet, plugSockets, wifi, displayPanel)
    VALUES ('R5', 0, true, false, false, true);
-- rural trains

INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (12345, 'I1');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (74837, 'I4');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (93028, 'I1');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (93027, 'I5');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (28397, 'I5');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (94038, 'R2');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (73829, 'R1');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (13420, 'R2');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (95048, 'R4');
INSERT INTO carriage(carriageNo,carriageClass) 
	VALUES (37287, 'R3');
-- carriages

INSERT INTO staff(staffID, fName, sName, dob)
	VALUES (123456,'Debbie', 'Davison', '1967-09-21');
INSERT INTO staff(staffID, fName, sName, dob)
	VALUES (372847,'Ann', 'Hinchcliffe', '1983-04-02');
INSERT INTO staff(staffID, fName, sName, dob)
	VALUES (273948,'Carol', 'Pearson', '1974-12-06');
INSERT INTO staff(staffID, fName, sName, dob)
	VALUES (230288,'Darren', 'Lee', '1988-01-28');
INSERT INTO staff(staffID, fName, sName, dob)
	VALUES (647392,'Emma', 'Seager', '1990-03-08');
INSERT INTO staff(staffID, fName, sName, dob)
	VALUES (102938,'Craig', 'Naylor', '1994-05-16');
-- staff

INSERT INTO fault(faultNo, carriageNo, category, location, faultDesc, staffID)
	VALUES ((SELECT COALESCE(MAX(faultNo),0) FROM fault) + 1, 94038, 'seat', 'Rear', 'cushion not attached to seat', 273948);
INSERT INTO fault(faultNo, carriageNo, category, location, faultDesc, staffID)
	VALUES ((SELECT COALESCE(MAX(faultNo),0) FROM fault) + 1, 74837, 'window', 'seat 34', 'window doesnt open', 372847);
INSERT INTO fault(faultNo, carriageNo, category, location, faultDesc, staffID)
	VALUES ((SELECT COALESCE(MAX(faultNo),0) FROM fault) + 1, 28397, 'toilet', 'toilet', 'fault with toilet door', 230288);
INSERT INTO fault(faultNo, carriageNo, category, location, faultDesc, staffID)
	VALUES ((SELECT COALESCE(MAX(faultNo),0) FROM fault) + 1, 37287, 'table', 'Front', 'broken table', 123456);
INSERT INTO fault(faultNo, carriageNo, category, faultDesc, staffID)
	VALUES ((SELECT COALESCE(MAX(faultNo),0) FROM fault) + 1, 12345, 'wifi', 'wifi wont connect', 647392);
-- some faults

-- INSERT INTO station(stationCode, stationName)
-- 	VALUES ('NRW','Norwich');
-- INSERT INTO station(stationCode, stationName)
-- 	VALUES ('SHM','Sheringham');
-- INSERT INTO station(stationCode, stationName)
-- 	VALUES ('LST','London Liverpool Street');
-- INSERT INTO station(stationCode, stationName)
-- 	VALUES ('CBG','Cambridge');
-- INSERT INTO station(stationCode, stationName)
-- 	VALUES ('GYM','Great Yarmouth');
-- -- stations

-- INSERT INTO journey(carriageNo, journeyDate, departureTime, arrivalTime, departureStation, arrivalStation)
-- 	VALUES (28397,'2019-03-07','8:30','10:30','NRW','LST');
-- INSERT INTO journey(carriageNo, journeyDate, departureTime, arrivalTime, departureStation, arrivalStation)
-- 	VALUES (73829,'2019-03-07','7:10','8:10','SHM','NRW');
-- INSERT INTO journey(carriageNo, journeyDate, departureTime, arrivalTime, departureStation, arrivalStation)
-- 	VALUES (12345,'2019-03-07','14:00','15:00','NRW','CBG');
