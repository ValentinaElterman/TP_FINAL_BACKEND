--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2026-10-27 12:04:46

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
-- TOC entry 4863 (class 1262 OID 16398)
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
-- TOC entry 223 (class 1259 OID 16436)
-- Name: albumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.albumes (
    id integer NOT NULL,
    titulo character varying NOT NULL,
    foto character varying,
    fecha_lanzamiento date
);


ALTER TABLE public.albumes OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16435)
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
-- TOC entry 219 (class 1259 OID 16420)
-- Name: artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artistas (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    foto character varying
);


ALTER TABLE public.artistas OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16419)
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
-- TOC entry 228 (class 1259 OID 16490)
-- Name: biblioteca; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biblioteca (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    estado character varying NOT NULL,
    es_favorita boolean NOT NULL,
    fecha_agregado date,
    fecha_actualizacion date
);


ALTER TABLE public.biblioteca OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16464)
-- Name: cancion_artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_artistas (
    id integer NOT NULL,
    cancion_id integer NOT NULL,
    artista_id integer NOT NULL
);


ALTER TABLE public.cancion_artistas OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16477)
-- Name: cancion_generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_generos (
    cancion_id integer NOT NULL,
    genero_id integer NOT NULL
);


ALTER TABLE public.cancion_generos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16452)
-- Name: canciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.canciones (
    id integer NOT NULL,
    titulo character varying NOT NULL,
    album_id integer,
    duracion integer NOT NULL,
    foto character varying,
    fecha_lanzamiento date
);


ALTER TABLE public.canciones OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16451)
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
-- TOC entry 221 (class 1259 OID 16428)
-- Name: generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generos (
    id integer NOT NULL,
    nombre character varying NOT NULL
);


ALTER TABLE public.generos OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16427)
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
-- TOC entry 217 (class 1259 OID 16407)
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
-- TOC entry 229 (class 1259 OID 16507)
-- Name: puntuaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puntuaciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    valor integer NOT NULL,
    fecha_creacion date,
    fecha_actualizacion date
);


ALTER TABLE public.puntuaciones OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16400)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    activo boolean NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16399)
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
-- TOC entry 4851 (class 0 OID 16436)
-- Dependencies: 223
-- Data for Name: albumes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4847 (class 0 OID 16420)
-- Dependencies: 219
-- Data for Name: artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4856 (class 0 OID 16490)
-- Dependencies: 228
-- Data for Name: biblioteca; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4854 (class 0 OID 16464)
-- Dependencies: 226
-- Data for Name: cancion_artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4855 (class 0 OID 16477)
-- Dependencies: 227
-- Data for Name: cancion_generos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4853 (class 0 OID 16452)
-- Dependencies: 225
-- Data for Name: canciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4849 (class 0 OID 16428)
-- Dependencies: 221
-- Data for Name: generos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4845 (class 0 OID 16407)
-- Dependencies: 217
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4857 (class 0 OID 16507)
-- Dependencies: 229
-- Data for Name: puntuaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4844 (class 0 OID 16400)
-- Dependencies: 216
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 222
-- Name: albumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.albumes_id_seq', 1, false);


--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 218
-- Name: artistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artistas_id_seq', 1, false);


--
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 224
-- Name: canciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canciones_id_seq', 1, false);


--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 220
-- Name: generos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.generos_id_seq', 1, false);


--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 215
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- TOC entry 4683 (class 2606 OID 16442)
-- Name: albumes albumes_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albumes
    ADD CONSTRAINT albumes_pk PRIMARY KEY (id);


--
-- TOC entry 4679 (class 2606 OID 16426)
-- Name: artistas artistas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artistas
    ADD CONSTRAINT artistas_pk PRIMARY KEY (id);


--
-- TOC entry 4687 (class 2606 OID 16496)
-- Name: biblioteca biblioteca_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_pk PRIMARY KEY (id);


--
-- TOC entry 4685 (class 2606 OID 16458)
-- Name: canciones canciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_pk PRIMARY KEY (id);


--
-- TOC entry 4681 (class 2606 OID 16434)
-- Name: generos generos_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generos
    ADD CONSTRAINT generos_pk PRIMARY KEY (id);


--
-- TOC entry 4677 (class 2606 OID 16413)
-- Name: perfiles perfiles_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_pk PRIMARY KEY (usuario_id);


--
-- TOC entry 4689 (class 2606 OID 16511)
-- Name: puntuaciones puntuaciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_pk PRIMARY KEY (id);


--
-- TOC entry 4675 (class 2606 OID 16406)
-- Name: usuarios usuarios_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pk PRIMARY KEY (id);


--
-- TOC entry 4696 (class 2606 OID 16502)
-- Name: biblioteca biblioteca_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id);


--
-- TOC entry 4697 (class 2606 OID 16497)
-- Name: biblioteca biblioteca_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4692 (class 2606 OID 16472)
-- Name: cancion_artistas cancion_artistas_artistas_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_artistas_fk FOREIGN KEY (artista_id) REFERENCES public.artistas(id);


--
-- TOC entry 4693 (class 2606 OID 16467)
-- Name: cancion_artistas cancion_artistas_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id);


--
-- TOC entry 4694 (class 2606 OID 16485)
-- Name: cancion_generos cancion_generos_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4695 (class 2606 OID 16480)
-- Name: cancion_generos cancion_generos_generos_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_generos_fk FOREIGN KEY (genero_id) REFERENCES public.generos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4691 (class 2606 OID 16459)
-- Name: canciones canciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_usuarios_fk FOREIGN KEY (album_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4690 (class 2606 OID 16414)
-- Name: perfiles perfiles_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4698 (class 2606 OID 16517)
-- Name: puntuaciones puntuaciones_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id);


--
-- TOC entry 4699 (class 2606 OID 16512)
-- Name: puntuaciones puntuaciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


-- Completed on 2026-10-27 12:04:46

--
-- PostgreSQL database dump complete
--

