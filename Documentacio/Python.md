#
# API Shodan en Python


Aplicació d'escriptori amb interfície gràfica (Tkinter) per fer **reconeixement passiu** amb [Shodan](https://www.shodan.io). No s'envia cap paquet a l'objectiu: tota la informació prové de les bases de dades de Shodan.

---

## Índex

1. [Funcionalitats](#funcionalitats)
2. [Requisits i instal·lació](#requisits-i-instal·lació)
3. [Ús](#ús)
4. [Configuració](#configuració)
5. [Arquitectura del codi](#arquitectura-del-codi)
6. [Flux de dades](#flux-de-dades)
7. [Gestió d'errors](#gestió-derrors)
8. [Seguretat](#seguretat)
9. [Limitacions conegudes](#limitacions-conegudes)
10. [Possibles millores](#possibles-millores)

---

## Funcionalitats

| # | Funció | Descripció |
|---|--------|------------|
| 1 | **Consulta d'Host** | Donada una IP pública, mostra hostnames, ports oberts, software (CPE) i vulnerabilitats (CVE) conegudes. |
| 2 | **Identificació de serveis** | Mostra servei, protocol, versió i *banner* de cada port (banner grabbing a partir de dades ja indexades per Shodan). |
| 3 | **Cerca de serveis** | Cerca inversa d'un producte o servei (p. ex. `proftpd`, `nginx`) i llista IP, port i organització dels resultats. |

Per a consultar el host introduim la ip.

<img width="584" height="150" alt="image" src="https://github.com/user-attachments/assets/30408f56-ced4-42ef-9706-7feda34c3648" />

Aqui surtira la informacio

<img width="1150" height="446" alt="image" src="https://github.com/user-attachments/assets/6b6bc0cf-a2bf-449b-88e6-e781e7d702d4" />

Aqui els port i serveis

<img width="1207" height="151" alt="image" src="https://github.com/user-attachments/assets/c2250da5-de98-49c4-b85f-15bdee1dc180" />

Tambe a la seguent pestaña hi ha  el cercador de serveis com demanama al encunciat esta el filtre de 10 o 5 respostes

<img width="987" height="731" alt="image" src="https://github.com/user-attachments/assets/9665d631-e554-47ec-9540-b6a6126c278a" />

## Requisits i instal·lació

- Python 3.8 o superior
- Tkinter (inclòs amb Python a Windows/macOS; a Linux: `sudo apt install python3-tk`)
- Llibreries:

```bash
pip install shodan pillow
```

> `pillow` és **opcional**: millora el redimensionat del logo. Sense ella s'usa `tk.PhotoImage` amb `subsample`.

---

## Ús

```bash
python shodan_gui.py
```

### Pestanya «Consulta d'Host»

1. Introdueix una adreça IP **pública** (no privada ni reservada).
2. Prem **Consultar** (o `Enter`).
3. Es mostren: IP, hostnames, ports oberts, software (CPE), vulnerabilitats i font de les dades.
4. Selecciona una fila de la taula per veure el **banner** del port al quadre inferior.

### Pestanya «Cerca de serveis»

1. Escriu un servei/producte (per defecte `proftpd`).
2. Tria el nombre de resultats (**5** o **10**).
3. Prem **Cercar**.
4. Fes **doble clic** sobre una fila per enviar la IP a la pestanya d'Host i consultar-la.

---

## Configuració

| Element | Valor | Descripció |
|---------|-------|------------|
| `COMPANY` | `"MFS s.l."` | Nom mostrat a títol, capçalera i peu. |
| `LOGO_PATH` | `logo.png` (mateixa carpeta que el script) | Logo opcional. |
| `SHODAN_API_KEY` | Variable d'entorn | Clau API per defecte. |
| `DEFAULT_API_KEY` | Constant al codi | Valor per defecte si no existeix la variable d'entorn (**vegeu [Seguretat](#seguretat)**). |

Ordre de preferència de la clau: camp «API Key» de la interfície → `SHODAN_API_KEY` → `DEFAULT_API_KEY`.

### Paleta de colors

`BG`, `PANEL`, `PANEL_2`, `FG`, `MUTED`, `ACCENT`, `ACCENT_H`, `OK`, `ERR` defineixen el tema; `FONT`, `FONT_B`, `FONT_T` i `MONO` defineixen les tipografies.

---

## Arquitectura del codi

Una única classe, `ShodanApp(tk.Tk)`, que conté tota la lògica.

### Constructor

| Atribut | Tipus | Ús |
|---------|-------|----|
| `api_key` | `tk.StringVar` | Clau API editable des de la capçalera. |
| `status` | `tk.StringVar` | Text de la barra d'estat. |
| `host_banners` | `dict` | Relaciona l'`iid` de cada fila del `Treeview` amb el seu banner. |

El constructor crida, per ordre: `_setup_style`, `_build_header`, `_build_tabs`, `_build_statusbar`.

### Mètodes d'interfície

| Mètode | Responsabilitat |
|--------|-----------------|
| `_setup_style()` | Configura tots els estils `ttk` (Entry, Combobox, Button, Notebook, Treeview, Scrollbar…). |
| `_build_header()` | Barra d'accent, logo/badge, títols i camp de clau API. |
| `_load_logo(size)` | Carrega `logo.png` amb Pillow o `PhotoImage`; retorna `None` si falla. |
| `_build_tabs()` | Crea el `Notebook` amb les dues pestanyes. |
| `_build_host_tab()` | Formulari de consulta, targeta de resum, taula de ports i quadre de banner. |
| `_kv(parent, row, key)` | Crea una parella etiqueta/valor a la targeta de resum. |
| `_build_search_tab()` | Formulari de cerca, taula de resultats i comptador total. |
| `_build_statusbar()` / `set_status()` | Barra d'estat amb color segons l'estat (`MUTED`, `ACCENT`, `OK`, `ERR`). |

### Mètodes de lògica

| Mètode | Responsabilitat |
|--------|-----------------|
| `_get_api()` | Retorna un client `shodan.Shodan` o avisa si falta la clau. *(Actualment no s'utilitza.)* |
| `_run_async(fn, on_ok, on_err, button)` | Executa `fn` en un fil *daemon*, desactiva el botó durant l'execució i torna al fil principal amb `self.after(0, …)`. |
| `_friendly_error(e)` | Tradueix errors de l'API a missatges comprensibles. |
| `lookup_host()` | Valida la IP (`ipaddress`, `is_global`) i llança `_fetch_host` en segon pla. |
| `_fetch_host(ip)` | Intenta l'API de Shodan amb clau; si falla, usa InternetDB. |
| `_internetdb(ip)` | Consulta `https://internetdb.shodan.io/<ip>` i normalitza la resposta al format de l'API. |
| `_cpe_name(cpe)` | Converteix un CPE en un nom llegible (`vendor producte versió`). |
| `_host_ok(host)` | Omple resum, taula de ports i banners. |
| `_host_err(e)` | Mostra l'error a la barra d'estat i en un diàleg. |
| `_show_banner()` / `_set_banner()` | Mostra el banner del port seleccionat al `Text` (només lectura). |
| `search_service()` | Valida l'entrada i executa la cerca en segon pla (vegeu flux més avall). |
| `_search_ok(res, limit)` | Omple la taula de resultats i el total. |
| `_search_err(e)` | Gestió d'errors de la cerca. |
| `_send_ip_to_host()` | Passa la IP seleccionada a la pestanya d'Host i la consulta. |

---

## Flux de dades

### Consulta d'host

```text
IP introduïda
   │
   ▼
Validació (ipaddress + is_global)
   │
   ▼
Hi ha clau API? ──sí──► shodan.Shodan(key).host(ip) ──OK──► resultat complet (amb banners)
   │                          │
   no                         └─ APIError "No information available" ► es propaga l'error
   │                          └─ altre APIError ► fallback
   ▼
InternetDB (gratuït): ports, hostnames, CPEs, vulns  (sense banners)
```

Quan la font és InternetDB no hi ha banners: el servei es dedueix pel número de port amb `socket.getservbyport` i s'indica «deduït pel port».

### Cerca de serveis (`search_service`)

1. **API de pagament:** `api.search(q, limit=limit)`.
   - Si falla, intenta `api.count(q)` només per obtenir el total.
2. **Extracció web (fallback):** descarrega `https://www.shodan.io/search?query=<q>` i extreu IP, ports i organitzacions amb expressions regulars.
3. Si hi ha total però cap resultat, retorna només el total.
4. Si no hi ha res, llança `shodan.APIError("No s'han trobat resultats.")`.

---

## Gestió d'errors

`_friendly_error` reconeix:

| Missatge de l'API | Text mostrat |
|-------------------|--------------|
| `No information available` | Shodan no té informació d'aquesta IP. |
| `Invalid API key` | Clau API invàlida. |
| `Requires membership` / `403` | Aquesta funció requereix un pla de pagament. |
| Altres | `Error: <missatge>` |

Les validacions d'entrada (IP no vàlida, IP no pública, cerca buida, clau buida) es mostren amb `messagebox`.

---

## Seguretat

> ⚠️ **La clau API de Shodan està escrita directament al codi** (`DEFAULT_API_KEY`).

Riscos i recomanacions:

- Qualsevol persona amb accés al fitxer (còpia, repositori Git, captura, adjunt) pot **usar i esgotar els crèdits** de la clau.
- Es recomana **revocar/regenerar la clau** al panell de Shodan si el fitxer s'ha compartit o pujat a algun lloc.
- Eliminar la constant i llegir la clau només des de l'entorn:

```python
self.api_key = tk.StringVar(value=os.environ.get("SHODAN_API_KEY", ""))
```

- Afegir fitxers amb secrets (`.env`, etc.) al `.gitignore`.
- El camp de la interfície oculta la clau amb `show="•"`, però això només és visual.

**Ús responsable:** encara que el reconeixement és passiu, la informació obtinguda s'ha d'usar només amb finalitats legítimes (auditories autoritzades, inventari d'actius propis, recerca).

---

## Limitacions conegudes

- **Extracció web fràgil:** les expressions regulars depenen del HTML actual de shodan.io; poden deixar de funcionar o assignar el port a una IP equivocada (s'associen per índex). Shodan sol exigir inici de sessió per a cerques, de manera que és habitual que aquest camí no retorni dades.
- El *scraping* de shodan.io pot anar en contra dels seus termes d'ús; es recomana usar l'API oficial amb un pla adequat.
- El pla gratuït (InternetDB) **no ofereix banners** ni versions detallades.
- Només es controlen els errors `shodan.APIError` al *fallback* d'host; errors de xarxa (timeouts, DNS) es mostren com a error genèric.
- Només IPv4 té suport garantit a les expressions regulars de la cerca.
- Límit de resultats fixat a 5 o 10.
- `_get_api()` no s'utilitza actualment.

---

## Possibles millores

- Eliminar la clau del codi i afegir una opció per desar-la de manera segura (p. ex. `keyring`).
- Substituir el *scraping* per l'API oficial i mostrar un avís clar si cal pla de pagament.
- Exportar resultats a CSV/JSON.
- Afegir cerca per filtres de Shodan (`port:`, `country:`, `org:`).
- Paginació i límit de resultats configurable.
- Mostrar els CVE amb enllaços (`webbrowser` ja està importat però no s'usa).
- Suport complet per a IPv6.
- Separar la lògica de xarxa de la interfície per poder-la provar amb tests.
- Eliminar imports no utilitzats (`webbrowser`).

---

## Estructura de fitxers

```text
.
├── shodan_gui.py   # Aplicació
└── logo.png        # (opcional) Logo de l'empresa
```





