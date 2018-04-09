-- superadmin@example.com/superadmin
INSERT INTO
  "user" (email, username, password)
  VALUES ('superadmin@example.com', 'superadmin', '$2a$12$71wzyR81R9wDBSchxS9t/.fMjrsIarJwdHnNZE4dVsPqMudRhfIHa');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 20);

-- admin@example.com/admin
INSERT INTO
  "user" (email, username, password)
  VALUES ('admin@example.com', 'admin', '$2a$12$z2WWkJZP/bcSrGljKRszRuHnfXEBX9KKzbz/RdFIK5g.XY8tLS4s2');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 10);

-- user1@example.com/user1
INSERT INTO
  "user" (email, username, password)
  VALUES ('user1@example.com', 'user1', '$2a$08$UCLZSIyqpBGxOItMM5mSdOptI5BvfxMMp1bql93N6IQdMR5riRgWm');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 0);

-- user2@example.com/user2
INSERT INTO
  "user" (email, username, password)
  VALUES ('user2@example.com', 'user2', '$2a$08$xpRrAnWKV1W7kTXtUErzGOiFv7Mpvi59x30SCnM1rrQph1a05cuBC');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 0);

-- user3@example.com/user3
INSERT INTO
  "user" (email, username, password)
  VALUES ('user3@example.com', 'user3', '$2a$08$fsjARzE2Mb.5pL2K4P97TufUyjazZvJ0HI3V0gF1GCjRx0WdhMlaW');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 0);

-- user4@example.com/user2
INSERT INTO
  "user" (email, username, password)
  VALUES ('user4@example.com', 'user4', '$2a$08$xpRrAnWKV1W7kTXtUErzGOiFv7Mpvi59x30SCnM1rrQph1a05cuBC');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 0);

-- user5@example.com/user2
INSERT INTO
  "user" (email, username, password)
  VALUES ('user5@example.com', 'user5', '$2a$08$xpRrAnWKV1W7kTXtUErzGOiFv7Mpvi59x30SCnM1rrQph1a05cuBC');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 0);

-- user6@example.com/user2
INSERT INTO
  "user" (email, username, password)
  VALUES ('user6@example.com', 'user6', '$2a$08$xpRrAnWKV1W7kTXtUErzGOiFv7Mpvi59x30SCnM1rrQph1a05cuBC');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 0);

-- user7@example.com/user2
INSERT INTO
  "user" (email, username, password)
  VALUES ('user7@example.com', 'user7', '$2a$08$xpRrAnWKV1W7kTXtUErzGOiFv7Mpvi59x30SCnM1rrQph1a05cuBC');
INSERT INTO
  user_role (user_id, role)
  VALUES (currval('user_id_seq'), 0);

-- Deck
INSERT INTO
  deck (name)
  VALUES ('Primary Deck');

-- Cards
DO
$do$
BEGIN
  FOR counter IN 1..100 LOOP
    INSERT INTO
        card ("text", deck_id)
        VALUES ('Card ' || counter::text, 1);
  END LOOP;
END
$do$;

-- Black cards
DO
$do1$
BEGIN
  FOR counter IN 1..50 LOOP
    INSERT INTO
        card ("text", "type", deck_id)
        VALUES ('Black Card ' || counter::text, 1, 1);
  END LOOP;
END
$do1$;
