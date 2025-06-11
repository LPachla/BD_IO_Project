BEGIN;

CREATE TABLE users(
    id INT PRIMARY KEY,
    imie TEXT,
    nazwisko TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
);

END;