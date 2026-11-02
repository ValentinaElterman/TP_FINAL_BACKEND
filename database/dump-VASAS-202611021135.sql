--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

-- Started on 2026-11-02 11:35:09

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
-- TOC entry 4914 (class 1262 OID 16398)
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
-- TOC entry 238 (class 1259 OID 16587)
-- Name: actividad; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.actividad (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    tipo character varying,
    cancion_id integer NOT NULL,
    coleccion_id integer NOT NULL,
    detalles jsonb,
    fecha date
);


ALTER TABLE public.actividad OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16586)
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
-- TOC entry 215 (class 1259 OID 16399)
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
-- TOC entry 216 (class 1259 OID 16404)
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
-- TOC entry 217 (class 1259 OID 16405)
-- Name: artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.artistas (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    foto character varying
);


ALTER TABLE public.artistas OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16410)
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
-- TOC entry 219 (class 1259 OID 16411)
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
-- TOC entry 220 (class 1259 OID 16416)
-- Name: cancion_artistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_artistas (
    id integer NOT NULL,
    cancion_id integer NOT NULL,
    artista_id integer NOT NULL
);


ALTER TABLE public.cancion_artistas OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16419)
-- Name: cancion_generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cancion_generos (
    cancion_id integer NOT NULL,
    genero_id integer NOT NULL
);


ALTER TABLE public.cancion_generos OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16422)
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
-- TOC entry 223 (class 1259 OID 16427)
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
-- TOC entry 233 (class 1259 OID 16533)
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
-- TOC entry 234 (class 1259 OID 16545)
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
-- TOC entry 232 (class 1259 OID 16532)
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
-- TOC entry 224 (class 1259 OID 16428)
-- Name: generos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.generos (
    id integer NOT NULL,
    nombre character varying NOT NULL
);


ALTER TABLE public.generos OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16433)
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
-- TOC entry 226 (class 1259 OID 16434)
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
-- TOC entry 227 (class 1259 OID 16439)
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
-- TOC entry 236 (class 1259 OID 16569)
-- Name: reproducciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reproducciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    fecha_inicio date,
    segundos_escuchados integer NOT NULL,
    completada boolean NOT NULL,
    fuente character varying
);


ALTER TABLE public.reproducciones OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16568)
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
-- TOC entry 231 (class 1259 OID 16515)
-- Name: reseñas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."reseñas" (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    cancion_id integer NOT NULL,
    texto character varying NOT NULL,
    fecha_creacion date,
    fecha_actualizacion date
);


ALTER TABLE public."reseñas" OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 16514)
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
-- TOC entry 228 (class 1259 OID 16442)
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
-- TOC entry 229 (class 1259 OID 16447)
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
-- TOC entry 4908 (class 0 OID 16587)
-- Dependencies: 238
-- Data for Name: actividad; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4885 (class 0 OID 16399)
-- Dependencies: 215
-- Data for Name: albumes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4887 (class 0 OID 16405)
-- Dependencies: 217
-- Data for Name: artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4889 (class 0 OID 16411)
-- Dependencies: 219
-- Data for Name: biblioteca; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4890 (class 0 OID 16416)
-- Dependencies: 220
-- Data for Name: cancion_artistas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4891 (class 0 OID 16419)
-- Dependencies: 221
-- Data for Name: cancion_generos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4892 (class 0 OID 16422)
-- Dependencies: 222
-- Data for Name: canciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4903 (class 0 OID 16533)
-- Dependencies: 233
-- Data for Name: colecciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4904 (class 0 OID 16545)
-- Dependencies: 234
-- Data for Name: colecciones_canciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4894 (class 0 OID 16428)
-- Dependencies: 224
-- Data for Name: generos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4896 (class 0 OID 16434)
-- Dependencies: 226
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4897 (class 0 OID 16439)
-- Dependencies: 227
-- Data for Name: puntuaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4906 (class 0 OID 16569)
-- Dependencies: 236
-- Data for Name: reproducciones; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4901 (class 0 OID 16515)
-- Dependencies: 231
-- Data for Name: reseñas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4898 (class 0 OID 16442)
-- Dependencies: 228
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 237
-- Name: actividad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.actividad_id_seq', 1, false);


--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 216
-- Name: albumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.albumes_id_seq', 1, false);


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 218
-- Name: artistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.artistas_id_seq', 1, false);


--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 223
-- Name: canciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.canciones_id_seq', 1, false);


--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 232
-- Name: colecciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.colecciones_id_seq', 1, false);


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 225
-- Name: generos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.generos_id_seq', 1, false);


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 235
-- Name: reproducciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reproducciones_id_seq', 1, false);


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 230
-- Name: reseñas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."reseñas_id_seq"', 1, false);


--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 229
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- TOC entry 4721 (class 2606 OID 16593)
-- Name: actividad actividad_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_pk PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 16449)
-- Name: albumes albumes_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.albumes
    ADD CONSTRAINT albumes_pk PRIMARY KEY (id);


--
-- TOC entry 4701 (class 2606 OID 16451)
-- Name: artistas artistas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.artistas
    ADD CONSTRAINT artistas_pk PRIMARY KEY (id);


--
-- TOC entry 4703 (class 2606 OID 16453)
-- Name: biblioteca biblioteca_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_pk PRIMARY KEY (id);


--
-- TOC entry 4705 (class 2606 OID 16455)
-- Name: canciones canciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_pk PRIMARY KEY (id);


--
-- TOC entry 4717 (class 2606 OID 16539)
-- Name: colecciones colecciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_pk PRIMARY KEY (id);


--
-- TOC entry 4707 (class 2606 OID 16457)
-- Name: generos generos_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.generos
    ADD CONSTRAINT generos_pk PRIMARY KEY (id);


--
-- TOC entry 4709 (class 2606 OID 16459)
-- Name: perfiles perfiles_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_pk PRIMARY KEY (usuario_id);


--
-- TOC entry 4711 (class 2606 OID 16461)
-- Name: puntuaciones puntuaciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_pk PRIMARY KEY (id);


--
-- TOC entry 4719 (class 2606 OID 16575)
-- Name: reproducciones reproducciones_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_pk PRIMARY KEY (id);


--
-- TOC entry 4715 (class 2606 OID 16521)
-- Name: reseñas reseñas_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_pk" PRIMARY KEY (id);


--
-- TOC entry 4713 (class 2606 OID 16463)
-- Name: usuarios usuarios_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pk PRIMARY KEY (id);


--
-- TOC entry 4739 (class 2606 OID 16690)
-- Name: actividad actividad_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4740 (class 2606 OID 16695)
-- Name: actividad actividad_colecciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_colecciones_fk FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4741 (class 2606 OID 16685)
-- Name: actividad actividad_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.actividad
    ADD CONSTRAINT actividad_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4722 (class 2606 OID 16464)
-- Name: biblioteca biblioteca_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id);


--
-- TOC entry 4723 (class 2606 OID 16469)
-- Name: biblioteca biblioteca_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biblioteca
    ADD CONSTRAINT biblioteca_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


--
-- TOC entry 4724 (class 2606 OID 16610)
-- Name: cancion_artistas cancion_artistas_artistas_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_artistas_fk FOREIGN KEY (artista_id) REFERENCES public.artistas(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4725 (class 2606 OID 16615)
-- Name: cancion_artistas cancion_artistas_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_artistas
    ADD CONSTRAINT cancion_artistas_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4726 (class 2606 OID 16620)
-- Name: cancion_generos cancion_generos_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4727 (class 2606 OID 16625)
-- Name: cancion_generos cancion_generos_generos_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cancion_generos
    ADD CONSTRAINT cancion_generos_generos_fk FOREIGN KEY (genero_id) REFERENCES public.generos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4728 (class 2606 OID 16630)
-- Name: canciones canciones_albumes_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.canciones
    ADD CONSTRAINT canciones_albumes_fk FOREIGN KEY (album_id) REFERENCES public.albumes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4735 (class 2606 OID 16670)
-- Name: colecciones_canciones colecciones_canciones_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones_canciones
    ADD CONSTRAINT colecciones_canciones_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4736 (class 2606 OID 16665)
-- Name: colecciones_canciones colecciones_canciones_colecciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones_canciones
    ADD CONSTRAINT colecciones_canciones_colecciones_fk FOREIGN KEY (coleccion_id) REFERENCES public.colecciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4734 (class 2606 OID 16660)
-- Name: colecciones colecciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.colecciones
    ADD CONSTRAINT colecciones_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4729 (class 2606 OID 16635)
-- Name: perfiles perfiles_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4730 (class 2606 OID 16640)
-- Name: puntuaciones puntuaciones_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4731 (class 2606 OID 16645)
-- Name: puntuaciones puntuaciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntuaciones
    ADD CONSTRAINT puntuaciones_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4737 (class 2606 OID 16680)
-- Name: reproducciones reproducciones_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_canciones_fk FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4738 (class 2606 OID 16675)
-- Name: reproducciones reproducciones_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reproducciones
    ADD CONSTRAINT reproducciones_usuarios_fk FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4732 (class 2606 OID 16655)
-- Name: reseñas reseñas_canciones_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_canciones_fk" FOREIGN KEY (cancion_id) REFERENCES public.canciones(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4733 (class 2606 OID 16650)
-- Name: reseñas reseñas_usuarios_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."reseñas"
    ADD CONSTRAINT "reseñas_usuarios_fk" FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2026-11-02 11:35:09

--
-- PostgreSQL database dump complete
--

