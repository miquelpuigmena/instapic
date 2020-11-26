CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    session VARCHAR UNIQUE,
    created_at TIMESTAMP without time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users_test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    session VARCHAR UNIQUE,
    created_at TIMESTAMP without time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id int NOT NULL,
    description VARCHAR NOT NULL,
    img_path VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP without time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS posts_test (
    id SERIAL PRIMARY KEY,
    user_id int NOT NULL,
    description VARCHAR NOT NULL,
    img_path VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMP without time zone NOT NULL DEFAULT now()
);
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");