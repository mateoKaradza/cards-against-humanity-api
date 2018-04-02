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

-- Deck
INSERT INTO
  deck (name)
  VALUES ('Primary Deck');

-- Cards
INSERT INTO
  card ("text", deck_id)
  VALUES ('First', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Second', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Third', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Fourth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Fifth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Sixth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Seventh', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Eighth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Ninth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Tenth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Eleventh', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Twelveth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Thirteenth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Fourteenth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Fifteenth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Sixteenth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Seventeeth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Eighteenth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Nineteenth', 1);

INSERT INTO
  card ("text", deck_id)
  VALUES ('Twentieth', 1);

-- Black cards
INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('First black', 1, 1);

INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('Second black', 1, 1);

INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('Third black', 1, 1);

INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('Fourth black', 1, 1);

INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('Fifth black', 1, 1);

INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('Sixth black', 1, 1);

INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('Seventh black', 1, 1);

INSERT INTO
  card ("text", "type", deck_id)
  VALUES ('Eighth black', 1, 1);
