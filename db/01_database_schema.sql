CREATE TABLE powiaty (
    id SERIAL PRIMARY KEY,
    powiat VARCHAR(255)
);

CREATE TABLE atrakcje(
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(255),
    powiat INT references powiaty(id),
    typ VARCHAR(20),
    opis TEXT,
    lokalizacjaX VARCHAR(30),
    lokalizacjaY VARCHAR(30),
    ocena REAL
);

CREATE TABLE zdjecia(
    id SERIAL PRIMARY KEY,
    atrakcja INT references atrakcje(id),
    zdjecia TEXT
);
