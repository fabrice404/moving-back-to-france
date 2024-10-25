DROP TABLE IF EXISTS shortlist;

CREATE TABLE shortlist (
  ville_id INT,
  criterion_id INT,
  value VARCHAR(255),
  PRIMARY KEY (ville_id, criterion_id)
);

DROP TABLE IF EXISTS shortlist_criteria;

CREATE TABLE shortlist_criteria (
  id SERIAL PRIMARY KEY,
  criterion VARCHAR(128),
  type VARCHAR(16),
  sort INT
);

DROP TABLE IF EXISTS shortlist_ville;

CREATE TABLE shortlist_ville (
	id SERIAL PRIMARY KEY,
	code_insee VARCHAR(5)
);

INSERT INTO shortlist_ville (code_insee) VALUES 
('18033'),
('19031'),
('24037'),
('24322'),
('31555'),
('35238'),
('45234'),
('47001'),
('64445'),
('69123'),
('74010'),
('82121');
