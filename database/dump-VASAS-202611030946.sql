--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2026-11-03 09:46:00

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
-- TOC entry 4943 (class 1262 OID 16398)
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
-- TOC entry 215 (class 1259 OID 16399)
-- Name: actividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividad (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying,
    cancion_id integer,
    coleccion_id integer,
    detalles jsonb,
    fecha timestamp without time zone
);


ALTER TABLE public.actividad OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16404)
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
-- TOC entry 217 (class 1259 OID 16405)
-- Name: albumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albumes (
    id integer NOT NULL,
    titulo character varying NOT NULL,
    foto character varying,
    fecha_lanzamiento date,
    external_id integer NOT NULL
);


ALTER TABLE public.albumes OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16410)
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
-- TOC entry 219 (class 1259 OID 16411)
-- Name: artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artistas (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    foto character varying,
    external_id integer NOT NULL
);


ALTER TABLE public.artistas OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16416)
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
-- TOC entry 221 (class 1259 OID 16417)
-- Name: biblioteca; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biblioteca (
    id integer NOT NULL,
    estado character varying NOT NULL,
    es_favorita boolean NOT NULL,
    fecha_agregado date,
    fecha_actualizacion date,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    CONSTRAINT check_biblioteca_estado CHECK (((estado)::text = ANY (ARRAY[('quiero_escuchar'::character varying)::text, ('escuchando'::character varying)::text, ('escuchado'::character varying)::text])))
);


ALTER TABLE public.biblioteca OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16423)
-- Name: cancion_artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_artistas (
    cancion_id integer NOT NULL,
    artista_id integer NOT NULL,
    id integer NOT NULL
);


ALTER TABLE public.cancion_artistas OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16426)
-- Name: cancion_artistas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cancion_artistas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cancion_artistas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16427)
-- Name: cancion_generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_generos (
    cancion_id integer NOT NULL,
    genero_id integer NOT NULL
);


ALTER TABLE public.cancion_generos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16430)
-- Name: canciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canciones (
    id integer NOT NULL,
    titulo character varying NOT NULL,
    album_id integer,
    duracion integer NOT NULL,
    foto character varying,
    fecha_lanzamiento date,
    external_id integer NOT NULL
);


ALTER TABLE public.canciones OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16435)
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
-- TOC entry 227 (class 1259 OID 16436)
-- Name: colecciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colecciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion character varying,
    fecha_creacion date,
    fecha_actualizacion date
);


ALTER TABLE public.colecciones OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16441)
-- Name: colecciones_canciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.colecciones_canciones (
    coleccion_id integer NOT NULL,
    cancion_id integer NOT NULL,
    fecha_agregado date,
    posicion integer
);


ALTER TABLE public.colecciones_canciones OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16444)
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
-- TOC entry 230 (class 1259 OID 16445)
-- Name: generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generos (
    id integer NOT NULL,
    nombre character varying NOT NULL
);


ALTER TABLE public.generos OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16450)
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
-- TOC entry 232 (class 1259 OID 16451)
-- Name: perfiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfiles (
    usuario_id integer NOT NULL,
    nombre character varying NOT NULL,
    foto character varying,
    bio text,
    preferencias json
);


ALTER TABLE public.perfiles OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16456)
-- Name: puntuaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puntuaciones (
    id integer NOT NULL,
    valor integer NOT NULL,
    fecha_creacion date,
    fecha_actualizacion date,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    CONSTRAINT chk_puntuaciones_valor CHECK (((valor >= 1) AND (valor <= 5)))
);


ALTER TABLE public.puntuaciones OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16460)
-- Name: reproducciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reproducciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    fecha_inicio timestamp without time zone,
    segundos_escuchados integer NOT NULL,
    completada boolean NOT NULL,
    fuente character varying
);


ALTER TABLE public.reproducciones OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16465)
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
-- TOC entry 236 (class 1259 OID 16466)
-- Name: reseñas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reseñas" (
    id integer NOT NULL,
    texto character varying NOT NULL,
    fecha_creacion date,
    fecha_actualizacion date,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL
);


ALTER TABLE public."reseñas" OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16471)
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
-- TOC entry 238 (class 1259 OID 16472)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    password character varying NOT NULL,
    activo boolean NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 16477)
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
-- TOC entry 4913 (class 0 OID 16399)
-- Dependencies: 215
-- Data for Name: actividad; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4915 (class 0 OID 16405)
-- Dependencies: 217
-- Data for Name: albumes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4917 (class 0 OID 16411)
-- Dependencies: 219
-- Data for Name: artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4919 (class 0 OID 16417)
-- Dependencies: 221
-- Data for Name: biblioteca; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4920 (class 0 OID 16423)
-- Dependencies: 222
-- Data for Name: cancion_artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4922 (class 0 OID 16427)
-- Dependencies: 224
-- Data for Name: cancion_generos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4923 (class 0 OID 16430)
-- Dependencies: 225
-- Data for Name: canciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4925 (class 0 OID 16436)
-- Dependencies: 227
-- Data for Name: colecciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4926 (class 0 OID 16441)
-- Dependencies: 228
-- Data for Name: colecciones_canciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4928 (class 0 OID 16445)
-- Dependencies: 230
-- Data for Name: generos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4930 (class 0 OID 16451)
-- Dependencies: 232
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4931 (class 0 OID 16456)
-- Dependencies: 233
-- Data for Name: puntuaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4932 (class 0 OID 16460)
-- Dependencies: 234
-- Data for Name: reproducciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4934 (class 0 OID 16466)
-- Dependencies: 236
-- Data for Name: reseñas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4936 (class 0 OID 16472)
-- Dependencies: 238
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 216
-- Name: actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actividad_id_seq', 1, false);


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 218
-- Name: albumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.albumes_id_seq', 1, false);


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 220
-- Name: artistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artistas_id_seq', 1, false);


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 223
-- Name: cancion_artistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cancion_artistas_id_seq', 1, false);


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 226
-- Name: canciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canciones_id_seq', 1, false);


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 229
-- Name: colecciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colecciones_id_seq', 1, false);


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 231
-- Name: generos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.generos_id_seq', 1, false);


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 235
-- Name: reproducciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reproducciones_id_seq', 1, false);


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 237
-- Name: reseñas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reseñas_id_seq"', 1, false);


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 239
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- TOC entry 4702 (class 2606 OID 16479)
-- Name: actividad actividad_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_pk PRIMARY KEY (id);


--
-- TOC entry 4704 (class 2606 OID 16481)
-- Name: albumes albumes_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albumes
    ADD CONSTRAINT albumes_pk PRIMARY KEY (id);


--
-- TOC entry 4706 (class 2606 OID 16483)
-- Name: albumes albumes_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albumes
    ADD CONSTRAINT albumes_unique UNIQUE (external_id);


--
-- TOC entry 4708 (class 2606 OID 16485)
-- Name: artistas artistas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artistas
    ADD CONSTRAINT artistas_pk PRIMARY KEY (id);


--
-- TOC entry 4710 (class 2606 OID 16487)
-- Name: artistas artistas_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artistas
    ADD CONSTRAINT artistas_unique UNIQUE (external_id);


--
-- TOC entry 4712 (class 2606 OID 16489)
-- Name: biblioteca biblioteca_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_pk PRIMARY KEY (id);


--
-- TOC entry 4714 (class 2606 OID 16491)
-- Name: biblioteca biblioteca_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_unique UNIQUE (usuario_id);


--
-- TOC entry 4716 (class 2606 OID 16493)
-- Name: biblioteca biblioteca_unique_1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_unique_1 UNIQUE (cancion_id);


--
-- TOC entry 4718 (class 2606 OID 16495)
-- Name: cancion_artistas cancion_artistas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_pk PRIMARY KEY (id);


--
-- TOC entry 4721 (class 2606 OID 16497)
-- Name: canciones canciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_pk PRIMARY KEY (id);


--
-- TOC entry 4723 (class 2606 OID 16499)
-- Name: canciones canciones_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_unique UNIQUE (external_id);


--
-- TOC entry 4725 (class 2606 OID 16501)
-- Name: colecciones colecciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_pk PRIMARY KEY (id);


--
-- TOC entry 4727 (class 2606 OID 16503)
-- Name: generos generos_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generos
    ADD CONSTRAINT generos_pk PRIMARY KEY (id);


--
-- TOC entry 4729 (class 2606 OID 16505)
-- Name: perfiles perfiles_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_pk PRIMARY KEY (usuario_id);


--
-- TOC entry 4731 (class 2606 OID 16507)
-- Name: puntuaciones puntuaciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_pk PRIMARY KEY (id);


--
-- TOC entry 4733 (class 2606 OID 16509)
-- Name: puntuaciones puntuaciones_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_unique UNIQUE (usuario_id);


--
-- TOC entry 4735 (class 2606 OID 16511)
-- Name: puntuaciones puntuaciones_unique_1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_unique_1 UNIQUE (cancion_id);


--
-- TOC entry 4737 (class 2606 OID 16513)
-- Name: reproducciones reproducciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_pk PRIMARY KEY (id);


--
-- TOC entry 4739 (class 2606 OID 16515)
-- Name: reseñas reseñas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_pk" PRIMARY KEY (id);


--
-- TOC entry 4741 (class 2606 OID 16517)
-- Name: reseñas reseñas_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_unique" UNIQUE (usuario_id);


--
-- TOC entry 4743 (class 2606 OID 16519)
-- Name: reseñas reseñas_unique_1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_unique_1" UNIQUE (cancion_id);


--
-- TOC entry 4745 (class 2606 OID 16521)
-- Name: usuarios usuarios_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pk PRIMARY KEY (id);


--
-- TOC entry 4747 (class 2606 OID 16523)
-- Name: usuarios usuarios_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_unique UNIQUE (username);


--
-- TOC entry 4749 (class 2606 OID 16525)
-- Name: usuarios usuarios_unique_1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_unique_1 UNIQUE (email);


--
-- TOC entry 4719 (class 1259 OID 16627)
-- Name: idx_cancion_generos_genero; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cancion_generos_genero ON public.cancion_generos USING btree (genero_id);


--
-- TOC entry 4750 (class 2606 OID 16526)
-- Name: actividad actividad_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4751 (class 2606 OID 16531)
-- Name: actividad actividad_colecciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_colecciones_fk FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4752 (class 2606 OID 16536)
-- Name: actividad actividad_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4753 (class 2606 OID 16541)
-- Name: biblioteca biblioteca_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4754 (class 2606 OID 16546)
-- Name: biblioteca biblioteca_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4755 (class 2606 OID 16551)
-- Name: cancion_artistas cancion_artistas_artistas_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_artistas_fk FOREIGN KEY (artista_id) REFERENCES public.artistas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4756 (class 2606 OID 16556)
-- Name: cancion_artistas cancion_artistas_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4757 (class 2606 OID 16561)
-- Name: cancion_generos cancion_generos_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4758 (class 2606 OID 16566)
-- Name: cancion_generos cancion_generos_generos_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_generos_fk FOREIGN KEY (genero_id) REFERENCES public.generos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4759 (class 2606 OID 16571)
-- Name: canciones canciones_albumes_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_albumes_fk FOREIGN KEY (album_id) REFERENCES public.albumes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4761 (class 2606 OID 16576)
-- Name: colecciones_canciones colecciones_canciones_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones_canciones
    ADD CONSTRAINT colecciones_canciones_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4762 (class 2606 OID 16581)
-- Name: colecciones_canciones colecciones_canciones_colecciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones_canciones
    ADD CONSTRAINT colecciones_canciones_colecciones_fk FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4760 (class 2606 OID 16586)
-- Name: colecciones colecciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4763 (class 2606 OID 16591)
-- Name: perfiles perfiles_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4764 (class 2606 OID 16596)
-- Name: puntuaciones puntuaciones_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4765 (class 2606 OID 16601)
-- Name: puntuaciones puntuaciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4766 (class 2606 OID 16606)
-- Name: reproducciones reproducciones_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4767 (class 2606 OID 16611)
-- Name: reproducciones reproducciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4768 (class 2606 OID 16616)
-- Name: reseñas reseñas_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_canciones_fk" FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4769 (class 2606 OID 16621)
-- Name: reseñas reseñas_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_usuarios_fk" FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-11-03 09:46:00

--
-- PostgreSQL database dump complete
--

