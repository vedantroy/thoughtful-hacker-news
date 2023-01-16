INSERT INTO migration (name) VALUES ('0');
CREATE TABLE comment (
    id INTEGER PRIMARY KEY,
    post_id INTEGER,
    author_id TEXT,
    created_at TEXT,
    text TEXT
);

CREATE TABLE post (
    post_id INTEGER PRIMARY KEY,
    author_id TEXT,

    title TEXT,

    body TEXT,
    url TEXT,

    points INTEGER,
    age TEXT,
    rank INTEGER
);

CREATE TABLE author (
    author_id TEXT PRIMARY KEY,
    password_hash TEXT,
    password_salt TEXT
);

CREATE TABLE account_create_request (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    created_at INTEGER
);