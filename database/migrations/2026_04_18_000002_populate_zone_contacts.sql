-- ============================================================================
-- ZONE CONTACT DATA MIGRATION
-- Populates zones table with addresses and phone numbers from the official
-- Heartfelt International Ministries zonal PDF.
-- ============================================================================
-- Run this AFTER adding the `address` and `phone` columns to the zones table.
-- ============================================================================

START TRANSACTION;

-- Region 01
UPDATE zones SET address = '2nd Floor, Munyarari Building, Glenview 3 Shops, Harare', phone = '0780292352' WHERE code = 'R0101';
UPDATE zones SET address = 'HIM Church Stand, Stapleford', phone = '0777971325, 0715616565' WHERE code = 'R0102';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0103';

-- Region 02
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0201';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0202';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0203';

-- Region 03
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0301';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0302';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0303';

-- Region 04
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0401';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0402';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0403';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0404';

-- Region 05
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0501';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0502';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0503';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0504';
UPDATE zones SET address = 'Room 28, Support Unit Primary School, Chikurubi S/Unit Camp', phone = '0773638981' WHERE code = 'R0505';

-- Region 06
UPDATE zones SET address = 'Corner Bubye and Musasa (Blue Roof), Mufakose', phone = '0773287296, 0778793098' WHERE code = 'R0601';
UPDATE zones SET address = 'Opposite Flamingo flats, stand number 30, Shonhiwa street, Norton City', phone = '0783965411' WHERE code = 'R0602';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0603';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0604';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0605';

-- Region 07
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0701';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0702';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0703';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0704';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0705';

-- Region 08
UPDATE zones SET address = '2nd Floor, Munyarari Building, Glenview 3 Shops, Harare', phone = '0780292352' WHERE code = 'R0801';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0802';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R0803';
UPDATE zones SET address = 'Wollovale Road Opposite Munenzva Bus Company, Harare Highfield', phone = '0773736650' WHERE code = 'R0804';

-- Region 10
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1001';
UPDATE zones SET address = 'Chisangano Rimuka Hall, Rimuka, Kadoma', phone = '0772424593' WHERE code = 'R1002';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1003';
UPDATE zones SET address = '5533 Mhondoro Ngezi Turf (3 bedrooms)', phone = '+263784003241' WHERE code = 'R1004';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1005';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1006';

-- Region 11
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1101';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1102';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1103';

-- Region 12
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1201';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1202';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1203';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1204';

-- Region 13
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1301';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1302';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1303';

-- Region 14
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1401';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1402';
UPDATE zones SET address = 'Chinhoyi Hall Rank Area', phone = '0776888319, 0782817044' WHERE code = 'R1403';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1404';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1405';

-- Region 15 (Diaspora)
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1501';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1502';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1503';

-- Region 16
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1601';
UPDATE zones SET address = 'Runyararo West, Light industry, Simon Mazorodze, Masvingo', phone = NULL WHERE code = 'R1602';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1603';

-- Region 17
UPDATE zones SET address = '107 Commissioner Street, Kempton Park', phone = '+27838777418' WHERE code = 'R1701';
UPDATE zones SET address = '180 Prairie Street, Rosettenville, Johannesburg (upstairs)', phone = '+27659852110' WHERE code = 'R1702';
UPDATE zones SET address = '555 Francis Baard Street, Arcadia, Pretoria 0002', phone = '0613431021/0631671146' WHERE code = 'R1703';
UPDATE zones SET address = 'Revelas Towers Second Floor, 17 Queen Street, Germiston', phone = '+27832387002' WHERE code = 'R1704';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1705';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1706';

-- Region 18
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1801';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1802';

-- Region 19
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1901';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R1902';

-- Region 20
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2001';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2002';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2003';

-- Region 21
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2101';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2102';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2103';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2104';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2105';

-- Region 22
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2201';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2202';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2203';
UPDATE zones SET address = 'To be assigned', phone = NULL WHERE code = 'R2204';

-- Region 23
UPDATE zones SET address = 'Heartfelt Church Stand, Murove Village, Domboshava', phone = '0718249572, 0785706706' WHERE code = 'R2301';
UPDATE zones SET address = 'Heartfelt Church Stand, Murove Village, Domboshava', phone = '0718249572, 0785706706' WHERE code = 'R2302';

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY (run after migration to confirm all zones populated)
-- ============================================================================
-- SELECT code, name, address, phone
-- FROM zones
-- ORDER BY code
-- LIMIT 20;
