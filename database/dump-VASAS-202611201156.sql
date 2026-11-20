--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2026-11-20 11:56:55

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 4974 (class 1262 OID 21049)
-- Name: VASAS; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "VASAS" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Spanish_Argentina.1252';


ALTER DATABASE "VASAS" OWNER TO postgres;

\connect "VASAS"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 240 (class 1259 OID 21527)
-- Name: actividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividad (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying(50) NOT NULL,
    cancion_id integer,
    coleccion_id integer,
    detalles jsonb,
    fecha timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.actividad OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 21526)
-- Name: actividad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.actividad ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.actividad_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 223 (class 1259 OID 21352)
-- Name: albumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albumes (
    id integer NOT NULL,
    external_id character varying(255) NOT NULL,
    titulo character varying(200) NOT NULL,
    foto character varying(500),
    fecha_lanzamiento date
);


ALTER TABLE public.albumes OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 21351)
-- Name: albumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.albumes ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.albumes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 21342)
-- Name: artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artistas (
    id integer NOT NULL,
    external_id character varying(255) NOT NULL,
    nombre character varying(150) NOT NULL,
    foto character varying(500)
);


ALTER TABLE public.artistas OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 21341)
-- Name: artistas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.artistas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.artistas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 229 (class 1259 OID 21409)
-- Name: biblioteca; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biblioteca (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    estado character varying(20) DEFAULT 'quiero_escuchar'::character varying NOT NULL,
    es_favorita boolean DEFAULT false NOT NULL,
    fecha_agregado timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT biblioteca_estado_check CHECK (((estado)::text = ANY ((ARRAY['quiero_escuchar'::character varying, 'escuchando'::character varying, 'escuchado'::character varying])::text[])))
);


ALTER TABLE public.biblioteca OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 21408)
-- Name: biblioteca_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.biblioteca ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.biblioteca_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 21378)
-- Name: cancion_artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_artistas (
    cancion_id integer NOT NULL,
    artista_id integer NOT NULL
);


ALTER TABLE public.cancion_artistas OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 21393)
-- Name: cancion_generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_generos (
    cancion_id integer NOT NULL,
    genero_id integer NOT NULL
);


ALTER TABLE public.cancion_generos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 21362)
-- Name: canciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canciones (
    id integer NOT NULL,
    external_id character varying(255) NOT NULL,
    titulo character varying(200) NOT NULL,
    album_id integer,
    duracion integer DEFAULT 0 NOT NULL,
    foto character varying(500),
    descripcion text,
    preview_url character varying(500),
    fecha_lanzamiento date,
    CONSTRAINT canciones_duracion_check CHECK ((duracion >= 0))
);


ALTER TABLE public.canciones OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 21361)
-- Name: canciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.canciones ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.canciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 21432)
-- Name: colecciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colecciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(500),
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.colecciones OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 21446)
-- Name: colecciones_canciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colecciones_canciones (
    coleccion_id integer NOT NULL,
    cancion_id integer NOT NULL,
    fecha_agregado timestamp without time zone DEFAULT now() NOT NULL,
    posicion integer
);


ALTER TABLE public.colecciones_canciones OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 21431)
-- Name: colecciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.colecciones ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.colecciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 21334)
-- Name: generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generos (
    id integer NOT NULL,
    nombre character varying(80) NOT NULL
);


ALTER TABLE public.generos OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 21333)
-- Name: generos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.generos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.generos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 217 (class 1259 OID 21320)
-- Name: perfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfiles (
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    foto character varying(500),
    bio text,
    preferencias jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE public.perfiles OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 21463)
-- Name: puntuaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puntuaciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    valor integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT puntuaciones_valor_check CHECK (((valor >= 1) AND (valor <= 5)))
);


ALTER TABLE public.puntuaciones OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 21462)
-- Name: puntuaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.puntuaciones ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.puntuaciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 238 (class 1259 OID 21507)
-- Name: reproducciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reproducciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT now() NOT NULL,
    segundos_escuchados integer DEFAULT 0 NOT NULL,
    completada boolean DEFAULT false NOT NULL,
    fuente character varying(50),
    CONSTRAINT reproducciones_segundos_escuchados_check CHECK ((segundos_escuchados >= 0))
);


ALTER TABLE public.reproducciones OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 21506)
-- Name: reproducciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.reproducciones ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.reproducciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 236 (class 1259 OID 21484)
-- Name: reseñas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reseñas" (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    texto text NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT "reseñas_texto_check" CHECK ((length(TRIM(BOTH FROM texto)) > 0))
);


ALTER TABLE public."reseñas" OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 21483)
-- Name: reseñas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."reseñas" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."reseñas_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 216 (class 1259 OID 21309)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_registro timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 21308)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.usuarios ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 4968 (class 0 OID 21527)
-- Dependencies: 240
-- Data for Name: actividad; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (1, 1, 'biblioteca_agregada', 1, NULL, '{"estado": "quiero_escuchar", "es_favorita": false}', '2026-11-20 11:52:09.933244');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (2, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:17.877103');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (3, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:19.274804');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (4, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:19.674941');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (5, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:19.938504');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (6, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:20.16247');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (7, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:20.370634');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (8, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:20.563285');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (9, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:20.753939');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (10, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:21.010792');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (11, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:21.233937');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (12, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:21.491372');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (13, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:21.738509');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (14, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:21.937802');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (15, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:22.130907');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (16, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:52:33.522454');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (17, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:52:35.058617');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (18, 1, 'resena_creada', 1, NULL, NULL, '2026-11-20 11:52:43.093134');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (19, 1, 'favorita_agregada', 1, NULL, NULL, '2026-11-20 11:53:01.821689');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (20, 1, 'favorita_quitada', 1, NULL, NULL, '2026-11-20 11:53:05.811623');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (21, 1, 'biblioteca_actualizada', 1, NULL, '{"estado": "escuchando", "es_favorita": false}', '2026-11-20 11:53:23.507053');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (22, 1, 'biblioteca_actualizada', 1, NULL, '{"estado": "escuchado", "es_favorita": false}', '2026-11-20 11:53:27.307661');
INSERT INTO public.actividad OVERRIDING SYSTEM VALUE VALUES (23, 1, 'coleccion_creada', NULL, 1, '{"nombre": "valuelter"}', '2026-11-20 11:53:56.470425');


--
-- TOC entry 4951 (class 0 OID 21352)
-- Dependencies: 223
-- Data for Name: albumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.albumes OVERRIDING SYSTEM VALUE VALUES (1, 'lastfm:album:harry styles:harry’s house', 'Harry’s House', 'https://lastfm-img.freetls.fastly.net/i/u/300x300/32061f0904363502f73b77be7bb74eaf.png', NULL);


--
-- TOC entry 4949 (class 0 OID 21342)
-- Dependencies: 221
-- Data for Name: artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.artistas OVERRIDING SYSTEM VALUE VALUES (1, '7eb1ce54-a355-41f9-8d68-e018b096d427', 'Harry Styles', NULL);


--
-- TOC entry 4957 (class 0 OID 21409)
-- Dependencies: 229
-- Data for Name: biblioteca; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.biblioteca OVERRIDING SYSTEM VALUE VALUES (1, 1, 1, 'escuchado', false, '2026-11-20 11:52:09.932511', '2026-11-20 11:53:27.306601');


--
-- TOC entry 4954 (class 0 OID 21378)
-- Dependencies: 226
-- Data for Name: cancion_artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cancion_artistas VALUES (1, 1);


--
-- TOC entry 4955 (class 0 OID 21393)
-- Dependencies: 227
-- Data for Name: cancion_generos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.cancion_generos VALUES (1, 1);
INSERT INTO public.cancion_generos VALUES (1, 2);
INSERT INTO public.cancion_generos VALUES (1, 3);
INSERT INTO public.cancion_generos VALUES (1, 4);
INSERT INTO public.cancion_generos VALUES (1, 5);


--
-- TOC entry 4953 (class 0 OID 21362)
-- Dependencies: 225
-- Data for Name: canciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.canciones OVERRIDING SYSTEM VALUE VALUES (1, '90a93bad-3249-4fe4-b0c8-9729745e86de', 'Matilda', 1, 245, 'https://lastfm-img.freetls.fastly.net/i/u/300x300/32061f0904363502f73b77be7bb74eaf.png', '“Matilda” is the seventh track off "Harry’s House", the third studio album by Harry Styles.

In the song, Harry somberly sings to somebody whose family did not treat her well. He takes inspiration from the Roald Dahl book Matilda and/or its movie adaptation of the same name, about a girl with telekinesis who was mistreated by her principal and parents. Though Roald Dahl’s character Matilda is gendered as female, Styles purposefully does not assign a label to the person he sings to. .', NULL, NULL);


--
-- TOC entry 4959 (class 0 OID 21432)
-- Dependencies: 231
-- Data for Name: colecciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.colecciones OVERRIDING SYSTEM VALUE VALUES (1, 1, 'valuelter', 'aura', '2026-11-20 11:53:56.4682', '2026-11-20 11:53:56.4682');


--
-- TOC entry 4960 (class 0 OID 21446)
-- Dependencies: 232
-- Data for Name: colecciones_canciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4947 (class 0 OID 21334)
-- Dependencies: 219
-- Data for Name: generos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (1, 'sad');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (2, 'pop rock');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (3, 'folk');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (4, 'pop');
INSERT INTO public.generos OVERRIDING SYSTEM VALUE VALUES (5, 'ballad');


--
-- TOC entry 4945 (class 0 OID 21320)
-- Dependencies: 217
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.perfiles VALUES (1, 'valuelter', NULL, NULL, '{}');


--
-- TOC entry 4962 (class 0 OID 21463)
-- Dependencies: 234
-- Data for Name: puntuaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4966 (class 0 OID 21507)
-- Dependencies: 238
-- Data for Name: reproducciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4964 (class 0 OID 21484)
-- Dependencies: 236
-- Data for Name: reseñas; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."reseñas" OVERRIDING SYSTEM VALUE VALUES (1, 1, 1, 'wow amazing', '2026-11-20 11:52:43.091453', '2026-11-20 11:52:43.091453');


--
-- TOC entry 4944 (class 0 OID 21309)
-- Dependencies: 216
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usuarios OVERRIDING SYSTEM VALUE VALUES (1, 'valuelter', 'valu@gmail.com', '$2b$10$zW/m8LZUoUT2Z..5sNgiXuEe9W09EEjGkFfjW6T8tFvMjmKc7mDiW', true, '2026-11-20 11:52:01.05754');


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 239
-- Name: actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actividad_id_seq', 23, true);


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 222
-- Name: albumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.albumes_id_seq', 1, true);


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 220
-- Name: artistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artistas_id_seq', 1, true);


--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 228
-- Name: biblioteca_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.biblioteca_id_seq', 1, true);


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 224
-- Name: canciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canciones_id_seq', 1, true);


--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 230
-- Name: colecciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colecciones_id_seq', 1, true);


--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 218
-- Name: generos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.generos_id_seq', 5, true);


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 233
-- Name: puntuaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.puntuaciones_id_seq', 1, false);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 237
-- Name: reproducciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reproducciones_id_seq', 1, false);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 235
-- Name: reseñas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reseñas_id_seq"', 1, true);


--
-- TOC entry 4985 (class 0 OID 0)
-- Dependencies: 215
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, true);


--
-- TOC entry 4778 (class 2606 OID 21534)
-- Name: actividad actividad_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_pkey PRIMARY KEY (id);


--
-- TOC entry 4741 (class 2606 OID 21360)
-- Name: albumes albumes_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albumes
    ADD CONSTRAINT albumes_external_id_key UNIQUE (external_id);


--
-- TOC entry 4743 (class 2606 OID 21358)
-- Name: albumes albumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albumes
    ADD CONSTRAINT albumes_pkey PRIMARY KEY (id);


--
-- TOC entry 4737 (class 2606 OID 21350)
-- Name: artistas artistas_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artistas
    ADD CONSTRAINT artistas_external_id_key UNIQUE (external_id);


--
-- TOC entry 4739 (class 2606 OID 21348)
-- Name: artistas artistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artistas
    ADD CONSTRAINT artistas_pkey PRIMARY KEY (id);


--
-- TOC entry 4755 (class 2606 OID 21418)
-- Name: biblioteca biblioteca_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_pkey PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 21420)
-- Name: biblioteca biblioteca_usuario_id_cancion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_usuario_id_cancion_id_key UNIQUE (usuario_id, cancion_id);


--
-- TOC entry 4749 (class 2606 OID 21382)
-- Name: cancion_artistas cancion_artistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_pkey PRIMARY KEY (cancion_id, artista_id);


--
-- TOC entry 4752 (class 2606 OID 21397)
-- Name: cancion_generos cancion_generos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_pkey PRIMARY KEY (cancion_id, genero_id);


--
-- TOC entry 4745 (class 2606 OID 21372)
-- Name: canciones canciones_external_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_external_id_key UNIQUE (external_id);


--
-- TOC entry 4747 (class 2606 OID 21370)
-- Name: canciones canciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4764 (class 2606 OID 21451)
-- Name: colecciones_canciones colecciones_canciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones_canciones
    ADD CONSTRAINT colecciones_canciones_pkey PRIMARY KEY (coleccion_id, cancion_id);


--
-- TOC entry 4761 (class 2606 OID 21440)
-- Name: colecciones colecciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2606 OID 21340)
-- Name: generos generos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generos
    ADD CONSTRAINT generos_nombre_key UNIQUE (nombre);


--
-- TOC entry 4735 (class 2606 OID 21338)
-- Name: generos generos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generos
    ADD CONSTRAINT generos_pkey PRIMARY KEY (id);


--
-- TOC entry 4731 (class 2606 OID 21327)
-- Name: perfiles perfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 4766 (class 2606 OID 21470)
-- Name: puntuaciones puntuaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4768 (class 2606 OID 21472)
-- Name: puntuaciones puntuaciones_usuario_id_cancion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_usuario_id_cancion_id_key UNIQUE (usuario_id, cancion_id);


--
-- TOC entry 4776 (class 2606 OID 21515)
-- Name: reproducciones reproducciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_pkey PRIMARY KEY (id);


--
-- TOC entry 4770 (class 2606 OID 21493)
-- Name: reseñas reseñas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_pkey" PRIMARY KEY (id);


--
-- TOC entry 4772 (class 2606 OID 21495)
-- Name: reseñas reseñas_usuario_id_cancion_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_usuario_id_cancion_id_key" UNIQUE (usuario_id, cancion_id);


--
-- TOC entry 4725 (class 2606 OID 21319)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4727 (class 2606 OID 21315)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4729 (class 2606 OID 21317)
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- TOC entry 4779 (class 1259 OID 21555)
-- Name: idx_actividad_usuario_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_actividad_usuario_fecha ON public.actividad USING btree (usuario_id, fecha DESC);


--
-- TOC entry 4758 (class 1259 OID 21551)
-- Name: idx_biblioteca_favoritas; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_biblioteca_favoritas ON public.biblioteca USING btree (usuario_id) WHERE es_favorita;


--
-- TOC entry 4759 (class 1259 OID 21550)
-- Name: idx_biblioteca_usuario_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_biblioteca_usuario_estado ON public.biblioteca USING btree (usuario_id, estado);


--
-- TOC entry 4750 (class 1259 OID 21556)
-- Name: idx_cancion_artistas_artista; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cancion_artistas_artista ON public.cancion_artistas USING btree (artista_id);


--
-- TOC entry 4753 (class 1259 OID 21557)
-- Name: idx_cancion_generos_genero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cancion_generos_genero ON public.cancion_generos USING btree (genero_id);


--
-- TOC entry 4762 (class 1259 OID 21552)
-- Name: idx_colecciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_colecciones_usuario ON public.colecciones USING btree (usuario_id);


--
-- TOC entry 4773 (class 1259 OID 21554)
-- Name: idx_reproducciones_cancion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reproducciones_cancion ON public.reproducciones USING btree (cancion_id);


--
-- TOC entry 4774 (class 1259 OID 21553)
-- Name: idx_reproducciones_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reproducciones_usuario ON public.reproducciones USING btree (usuario_id, fecha_inicio);


--
-- TOC entry 4797 (class 2606 OID 21540)
-- Name: actividad actividad_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_cancion_id_fkey FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4798 (class 2606 OID 21545)
-- Name: actividad actividad_coleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4799 (class 2606 OID 21535)
-- Name: actividad actividad_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4786 (class 2606 OID 21426)
-- Name: biblioteca biblioteca_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_cancion_id_fkey FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4787 (class 2606 OID 21421)
-- Name: biblioteca biblioteca_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4782 (class 2606 OID 21388)
-- Name: cancion_artistas cancion_artistas_artista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_artista_id_fkey FOREIGN KEY (artista_id) REFERENCES public.artistas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4783 (class 2606 OID 21383)
-- Name: cancion_artistas cancion_artistas_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_cancion_id_fkey FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4784 (class 2606 OID 21398)
-- Name: cancion_generos cancion_generos_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_cancion_id_fkey FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4785 (class 2606 OID 21403)
-- Name: cancion_generos cancion_generos_genero_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_genero_id_fkey FOREIGN KEY (genero_id) REFERENCES public.generos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4781 (class 2606 OID 21373)
-- Name: canciones canciones_album_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albumes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4789 (class 2606 OID 21457)
-- Name: colecciones_canciones colecciones_canciones_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones_canciones
    ADD CONSTRAINT colecciones_canciones_cancion_id_fkey FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4790 (class 2606 OID 21452)
-- Name: colecciones_canciones colecciones_canciones_coleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones_canciones
    ADD CONSTRAINT colecciones_canciones_coleccion_id_fkey FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4788 (class 2606 OID 21441)
-- Name: colecciones colecciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4780 (class 2606 OID 21328)
-- Name: perfiles perfiles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4791 (class 2606 OID 21478)
-- Name: puntuaciones puntuaciones_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_cancion_id_fkey FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4792 (class 2606 OID 21473)
-- Name: puntuaciones puntuaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4795 (class 2606 OID 21521)
-- Name: reproducciones reproducciones_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_cancion_id_fkey FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4796 (class 2606 OID 21516)
-- Name: reproducciones reproducciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4793 (class 2606 OID 21501)
-- Name: reseñas reseñas_cancion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_cancion_id_fkey" FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4794 (class 2606 OID 21496)
-- Name: reseñas reseñas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_usuario_id_fkey" FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-11-20 11:56:55

--
-- PostgreSQL database dump complete
--

