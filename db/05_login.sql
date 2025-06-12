BEGIN;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    imie TEXT,
    nazwisko TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
);

END;