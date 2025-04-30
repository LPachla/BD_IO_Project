CREATE TABLE powiaty (
    id SERIAL PRIMARY KEY,
    powiat VARCHAR(255)
);

CREATE TABLE atrakcje(
    id SERIAL PRIMARY KEY,
    nazwa VARCHAR(255),
    powiat INT references powiaty(id),
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

INSERT INTO powiaty(powiat) VALUES 
('bieszczadzki'),
('brzozowski'),
('dębicki'),
('jarosławski'),
('jasielski'),
('kolbuszowski'),
('krośnieński'),
('leski'),
('leżajski'),
('lubaczowski'),
('łańcucki'),
('mielecki'),
('niżański'),
('przemyski'),
('przeworski'),
('ropczycko-sędziszowski'),
('rzeszowski'),
('sanocki'),
('stalowowolski'),
('strzyżowski'),
('tarnobrzeski');