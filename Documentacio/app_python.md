# MFS Recon & OSINT Suite 

Aplicació d'escriptori amb interfície gràfica (Tkinter) que combina dos mòduls de recopilació d'informació:

1. **Shodan Recon**: reconeixement passiu amb [Shodan](https://www.shodan.io) (no s'envia cap paquet a l'objectiu).
2. **Cerca OSINT amb The Harvester**: execució de [theHarvester](https://github.com/laramies/theHarvester) via `subprocess`, amb la sortida mostrada en temps real.

---

## Índex

1. [Funcionalitats](#funcionalitats)
2. [Requisits i instal·lació](#requisits-i-instal·lació)
3. [Ús](#ús)
4. [Arquitectura del codi](#arquitectura-del-codi)
5. [Flux de dades](#flux-de-dades)
6. [Gestió d'errors](#gestió-derrors)
7. [Estroctura de fixers](#structura-de-fitxers)

---


## Funcionalitats

### Mòdul Shodan

| # | Funció | Descripció |
|---|--------|------------|
| 1 | **Consulta d'Host** | Donada una IP pública, mostra hostnames, ports oberts, software (CPE) i vulnerabilitats (CVE) conegudes. |
| 2 | **Identificació de serveis** | Servei, protocol, versió i *banner* de cada port (a partir de dades ja indexades per Shodan). |
| 3 | **Cerca de serveis** | Cerca inversa d'un producte o servei (p. ex. `proftpd`, `nginx`) amb llistat d'IP, port i organització. Doble clic sobre una fila per consultar la IP. |



### Mòdul The Harvester (OSINT)

| Funció | Descripció |
|--------|------------|
| Execució de theHarvester | Llança `theHarvester -d <domini> -b <font> -l 500` des de la interfície. |
| Sortida en temps real | La sortida estàndard i d'error es llegeixen línia a línia i s'afegeixen al quadre de text. |
| Desar resultats | Opció per afegir `-f <nom>` i generar fitxers de sortida. |
| Localització de l'executable | Busca `theHarvester` al mateix directori que l'intèrpret Python (venv) i, si no hi és, el cerca al `PATH`. |




---

## Requisits i instal·lació

- Python 3.8 o superior
- Tkinter (inclòs amb Python a Windows/macOS; a Linux: `sudo apt install python3-tk`)
- Llibreries Python:

```bash
pip install shodan pillow
```

- **theHarvester** (necessari només per al segon mòdul), instal·lat al mateix entorn virtual:

```bash
pip install git+https://github.com/laramies/theHarvester.git
```

> `pillow` és **opcional**: millora el redimensionat del logo. Sense ella s'usa `tk.PhotoImage` amb `subsample`.
>
> Algunes fonts de theHarvester (p. ex. `google`, `linkedin`) poden requerir claus API o configuració pròpia de l'eina. Consulta la seva documentació.

---

## Ús

```bash
python shodan_gui.py
```

### Mòdul Shodan → «Consulta d'Host»

1. Introdueix una adreça IP **pública** (no privada ni reservada), Prem **Consultar** (o `Enter`).
   
<img width="979" height="278" alt="image" src="https://github.com/user-attachments/assets/a8257ba2-3009-4dc4-81a1-4526391ac7b7" />

2.Es mostren: IP, hostnames, ports oberts, software (CPE), vulnerabilitats i font de les dades.

<img width="1150" height="446" alt="image" src="https://github.com/user-attachments/assets/6b6bc0cf-a2bf-449b-88e6-e781e7d702d4" />

3. Aqui els port i serveis

<img width="1207" height="151" alt="image" src="https://github.com/user-attachments/assets/c2250da5-de98-49c4-b85f-15bdee1dc180" />


### Mòdul Shodan → «Cerca de serveis»

1. Escriu un servei/producte (per defecte `proftpd`).
2. Tria el nombre de resultats (**5** o **10**).
3. Prem **Cercar**.
4. Fes **doble clic** sobre una fila: l'aplicació canvia a la subpestanya d'Host i consulta aquella IP.

<img width="934" height="455" alt="image" src="https://github.com/user-attachments/assets/523d0d1f-fb3b-4ab1-a600-78eb273232fb" />

### Pestanya «Cerca OSINT amb The Harvester»

1. Escriu el **domini objectiu** (`-d`). El valor per defecte és `iesebre.com`: **canvia'l pel domini que tinguis autorització per analitzar**.

<img width="449" height="72" alt="image" src="https://github.com/user-attachments/assets/af116933-34a0-41be-a300-f19cc722efbf" />

3. Tria la **font de dades** (`-b`): `duckduckgo` (per defecte), `bing`, `crtsh`, `google`, `linkedin` o `all`.

<img width="214" height="198" alt="Captura de pantalla de 2026-11-12 21-36-07" src="https://github.com/user-attachments/assets/3da32b91-fc8b-4c7b-a8d2-5b07df43da9e" />

4. (Opcional) Marca **«Guardar resultats en fitxer (-f)»** i indica el nom del fitxer (per defecte `resultats_osint`).
   
<img width="271" height="69" alt="Captura de pantalla de 2026-11-12 21-36-33" src="https://github.com/user-attachments/assets/d69d8323-1745-47d7-ab9f-2a96ea72889b" />

6. Prem **Executar The Harvester**.
   
<img width="245" height="74" alt="image" src="https://github.com/user-attachments/assets/fd8f8b03-d6a4-43a3-988d-c777841391ee" />

8. Segueix la sortida al quadre inferior. Pot trigar entre 15 i 40 segons, segons la font.
   
<img width="1003" height="769" alt="Captura de pantalla de 2026-11-12 21-27-16" src="https://github.com/user-attachments/assets/894f8517-7d1c-4c29-aba7-fcae5083a73e" />


---



### Paleta de colors

`BG`, `PANEL`, `PANEL_2`, `FG`, `MUTED`, `ACCENT`, `ACCENT_H`, `OK`, `ERR` defineixen el tema; `FONT`, `FONT_B`, `FONT_T` i `MONO` defineixen les tipografies.

---

## Arquitectura del codi

Una única classe, `MainApp(tk.Tk)`, que conté tota la lògica.

### Constructor

| Atribut | Tipus | Ús |
|---------|-------|----|
| `api_key` | `tk.StringVar` | Clau API de Shodan editable des de la capçalera. |
| `status` | `tk.StringVar` | Text de la barra d'estat. |
| `host_banners` | `dict` | Relaciona l'`iid` de cada fila del `Treeview` d'hosts amb el seu banner. |

El constructor crida, per ordre: `_setup_style`, `_build_header`, `_build_main_tabs`, `_build_statusbar`.

### Estructura de la interfície

```text
MainApp
├── Capçalera (logo, títols, camp Shodan API Key)
├── Notebook principal
│   ├── «Mòdul Shodan Recon»
│   │   └── Notebook secundari (shodan_nb)
│   │       ├── «Consulta d'Host»   (tab_host)
│   │       └── «Cerca de serveis»  (tab_search)
│   └── «Cerca OSINT amb The Harvester» (tab_harvester)
└── Barra d'estat
```

### Mètodes d'interfície

| Mètode | Responsabilitat |
|--------|-----------------|
| `_setup_style()` | Configura tots els estils `ttk`. |
| `_build_header()` | Barra d'accent, logo/badge, títols i camp de clau API. |
| `_load_logo(size)` | Carrega `logo.png` amb Pillow o `PhotoImage`; retorna `None` si falla. |
| `_build_main_tabs()` | Crea el `Notebook` principal amb els dos mòduls. |
| `_build_shodan_subtabs(parent)` | Crea el `Notebook` secundari del mòdul Shodan. |
| `_build_host_tab()` | Formulari de consulta, targeta de resum, taula de ports i quadre de banner. |
| `_kv(parent, row, key)` | Parella etiqueta/valor de la targeta de resum. |
| `_build_search_tab()` | Formulari de cerca, taula de resultats i comptador total. |
| `_build_harvester_tab(f)` | Formulari de theHarvester (domini, font, fitxer) i quadre de sortida. |
| `_toggle_file_entry()` | Habilita/deshabilita el camp del nom de fitxer segons la casella `-f`. |
| `_build_statusbar()` / `set_status()` | Barra d'estat amb color segons l'estat (`MUTED`, `ACCENT`, `OK`, `ERR`). |

### Mètodes de lògica: Shodan

| Mètode | Responsabilitat |
|--------|-----------------|
| `_get_api()` | Retorna un client `shodan.Shodan` o avisa si falta la clau. *(No s'utilitza actualment.)* |
| `_run_async(fn, on_ok, on_err, button)` | Executa `fn` en un fil *daemon*, desactiva el botó i torna al fil principal amb `self.after(0, …)`. |
| `_friendly_error(e)` | Tradueix errors de l'API a missatges comprensibles. |
| `lookup_host()` | Valida la IP (`ipaddress`, `is_global`) i llança `_fetch_host` en segon pla. |
| `_fetch_host(ip)` | Intenta l'API de Shodan amb clau; si falla, usa InternetDB. |
| `_internetdb(ip)` | Consulta `https://internetdb.shodan.io/<ip>` i normalitza la resposta. |
| `_cpe_name(cpe)` | Converteix un CPE en un nom llegible. |
| `_host_ok(host)` / `_host_err(e)` | Mostren el resultat o l'error de la consulta d'host. |
| `_show_banner()` / `_set_banner()` | Mostren el banner del port seleccionat (`Text` en només lectura). |
| `search_service()` | Valida l'entrada i executa la cerca en segon pla. |
| `_search_ok(res, limit)` / `_search_err(e)` | Mostren resultats o error de la cerca. |
| `_send_ip_to_host(event)` | Valida que el clic sigui en una cel·la, copia la IP, canvia de subpestanya i consulta. |

### Mètodes de lògica: The Harvester

| Mètode | Responsabilitat |
|--------|-----------------|
| `run_harvester()` | Valida l'entrada, construeix la comanda, prepara l'entorn i llança el fil de treball. |
| `worker()` *(funció interna)* | Executa `subprocess.Popen` i envia cada línia al fil principal. |
| `_append_harvest_output(text)` | Afegeix text al quadre de sortida i fa *scroll* fins al final. |

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
   no                         ├─ APIError "No information available" ► es propaga l'error
   │                          └─ altre APIError ► fallback
   ▼
InternetDB (gratuït): ports, hostnames, CPEs, vulns  (sense banners)
```

Quan la font és InternetDB no hi ha banners: el servei es dedueix pel número de port amb `socket.getservbyport` i s'indica «deduït pel port».

### Cerca de serveis

1. **API de pagament:** `api.search(q, limit=limit)`. Si falla, intenta `api.count(q)` només per obtenir el total.
2. **Extracció web (fallback):** descarrega `https://www.shodan.io/search?query=<q>` i extreu IP, ports i organitzacions amb expressions regulars.
3. Si hi ha total però cap resultat, retorna només el total.
4. Si no hi ha res, llança `shodan.APIError("No s'han trobat resultats.")`.

### Execució de theHarvester

```text
Clic a «Executar The Harvester»
   │
   ▼
Validació: domini no buit (i nom de fitxer si -f està marcat)
   │
   ▼
Localitza l'executable:
   <directori de sys.executable>/theHarvester  si existeix
   si no → «theHarvester» (PATH)
   │
   ▼
Comanda: [exe, "-d", domini, "-b", font, "-l", "500"] (+ ["-f", fitxer])
   │
   ▼
Fil de treball:
   Popen(stdout=PIPE, stderr=STDOUT, text=True, bufsize=1)
   PYTHONUNBUFFERED=1 i PATH ampliat amb el directori de l'intèrpret
   │
   ▼
Per cada línia → self.after(0, _append_harvest_output, línia)
   │
   ▼
Codi de retorn 0 → «✔ Execució finalitzada»   |   ≠ 0 → «Finalitzat amb codi N»
```

El botó es desactiva durant l'execució i es reactiva en el bloc `finally`.

---

## Gestió d'errors

### Shodan

`_friendly_error` reconeix:

| Missatge de l'API | Text mostrat |
|-------------------|--------------|
| `No information available` | Shodan no té informació d'aquesta IP. |
| `Invalid API key` | Clau API invàlida. |
| `Requires membership` / `403` | Aquesta funció requereix un pla de pagament. |
| Altres | `Error: <missatge>` |

Les validacions d'entrada (IP no vàlida, IP no pública, cerca buida, clau buida) es mostren amb `messagebox`.

### The Harvester

| Situació | Comportament |
|----------|--------------|
| Domini buit | Avís amb `messagebox`. |
| `-f` marcat i nom de fitxer buit | Avís amb `messagebox`. |
| `FileNotFoundError` (no instal·lat) | Es mostra al quadre de sortida un missatge amb la comanda `pip install git+https://github.com/laramies/theHarvester.git` i l'estat passa a «theHarvester no trobat». |
| Codi de retorn ≠ 0 | Estat en vermell: «Finalitzat amb codi N». |
| Altra excepció | Es mostra al quadre de sortida i a la barra d'estat. |

---

## Estructura de fitxers

```text
.
├── shodan_gui.py   # Aplicació
└── logo.png        # (opcional) Logo de l'empresa
```
