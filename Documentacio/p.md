# MFS Recon & OSINT Suite (`shodan_gui.py`)

Aplicació d'escriptori amb interfície gràfica (Tkinter) que combina dos mòduls de recopilació d'informació:

1. **Shodan Recon**: reconeixement passiu amb [Shodan](https://www.shodan.io) (no s'envia cap paquet a l'objectiu).
2. **Cerca OSINT amb The Harvester**: execució de [theHarvester](https://github.com/laramies/theHarvester) via `subprocess`, amb la sortida mostrada en temps real.

---

## Índex

1. [Novetats respecte a la versió anterior](#novetats-respecte-a-la-versió-anterior)
2. [Funcionalitats](#funcionalitats)
3. [Requisits i instal·lació](#requisits-i-instal·lació)
4. [Ús](#ús)
5. [Configuració](#configuració)
6. [Arquitectura del codi](#arquitectura-del-codi)
7. [Flux de dades](#flux-de-dades)
8. [Gestió d'errors](#gestió-derrors)
9. [Seguretat i ús responsable](#seguretat-i-ús-responsable)
10. [Limitacions conegudes](#limitacions-conegudes)
11. [Possibles millores](#possibles-millores)

---

## Novetats respecte a la versió anterior

| Canvi | Detall |
|-------|--------|
| Classe principal | `ShodanApp` passa a anomenar-se **`MainApp`**. |
| Títol de la finestra | `MFS s.l. · Recon & OSINT Suite` (mida inicial `1000x720`). |
| Estructura de pestanyes | Ara hi ha **dues pestanyes principals**: «Mòdul Shodan Recon» i «Cerca OSINT amb The Harvester». Les pestanyes d'Host i de Cerca de serveis són **subpestanyes** del mòdul Shodan (`self.shodan_nb`). |
| Nou mòdul | Integració de **theHarvester** (`_build_harvester_tab`, `run_harvester`, `_append_harvest_output`, `_toggle_file_entry`). |
| Capçalera | Subtítol: `Audit Suite · Shodan & OSINT Information Gathering`; etiqueta del camp: «Shodan API Key». |
| Doble clic a la cerca | `_send_ip_to_host` ara comprova que el clic sigui sobre una **cel·la** (no a la capçalera) i canvia de subpestanya amb `self.shodan_nb.select(self.tab_host)`. |
| Imports | S'afegeixen `subprocess` i `sys`; s'elimina `webbrowser`. |
| Compactació de la UI | Taula d'hosts amb `height=7` i quadre de banner amb `height=4` per fer lloc a les subpestanyes. |

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

### Característiques generals

- Tema fosc personalitzat amb `ttk` (tema `clam`).
- Logo opcional (`logo.png`) a la capçalera i com a icona de la finestra.
- Operacions de xarxa i processos en fils (*threads*) perquè la interfície no es bloquegi.
- *Fallback* gratuït a **InternetDB** si no hi ha clau API o aquesta no pot respondre.

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

1. Introdueix una adreça IP **pública** (no privada ni reservada).
2. Prem **Consultar** (o `Enter`).
3. Es mostren: IP, hostnames, ports oberts, software (CPE), vulnerabilitats i font de les dades.
4. Selecciona una fila de la taula per veure el **banner** del port.

### Mòdul Shodan → «Cerca de serveis»

1. Escriu un servei/producte (per defecte `proftpd`).
2. Tria el nombre de resultats (**5** o **10**).
3. Prem **Cercar**.
4. Fes **doble clic** sobre una fila: l'aplicació canvia a la subpestanya d'Host i consulta aquella IP.

### Pestanya «Cerca OSINT amb The Harvester»

1. Escriu el **domini objectiu** (`-d`). El valor per defecte és `iesebre.cat`: **canvia'l pel domini que tinguis autorització per analitzar**.
2. Tria la **font de dades** (`-b`): `duckduckgo` (per defecte), `bing`, `crtsh`, `google`, `linkedin` o `all`.
3. (Opcional) Marca **«Guardar resultats en fitxer (-f)»** i indica el nom del fitxer (per defecte `resultats_osint`).
4. Prem **Executar The Harvester**.
5. Segueix la sortida al quadre inferior. Pot trigar entre 15 i 40 segons, segons la font.

La comanda que s'executa es mostra a la primera línia de la sortida, per exemple:

```text
[*] Executant: theHarvester -d exemple.cat -b duckduckgo -l 500
```

---

## Configuració

| Element | Valor | Descripció |
|---------|-------|------------|
| `COMPANY` | `"MFS s.l."` | Nom mostrat a títol, capçalera i peu. |
| `LOGO_PATH` | `logo.png` (mateixa carpeta que el script) | Logo opcional. |
| `SHODAN_API_KEY` | Variable d'entorn | Clau API de Shodan per defecte. |
| `DEFAULT_API_KEY` | Constant al codi | Valor per defecte si no existeix la variable d'entorn (**vegeu [Seguretat](#seguretat-i-ús-responsable)**). |
| Límit de theHarvester | `-l 500` | Valor fix al codi. |

Ordre de preferència de la clau de Shodan: camp «Shodan API Key» de la interfície → `SHODAN_API_KEY` → `DEFAULT_API_KEY`.

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

## Seguretat i ús responsable

> ⚠️ **La clau API de Shodan continua escrita directament al codi** (`DEFAULT_API_KEY`).

Riscos i recomanacions:

- Qualsevol persona amb accés al fitxer (còpia, repositori Git, captura, adjunt) pot **usar i esgotar els crèdits** de la clau.
- Es recomana **revocar/regenerar la clau** al panell de Shodan si el fitxer s'ha compartit o pujat a algun lloc.
- Eliminar la constant i llegir la clau només des de l'entorn:

```python
self.api_key = tk.StringVar(value=os.environ.get("SHODAN_API_KEY", ""))
```

- Afegir fitxers amb secrets (`.env`, etc.) al `.gitignore`.
- El camp de la interfície oculta la clau amb `show="•"`, però això només és visual.

**Ús responsable:**

- theHarvester i Shodan recullen informació pública, però cal usar-los només sobre **dominis i adreces propis o amb autorització explícita** (auditories contractades, inventari d'actius propis, recerca legítima).
- El domini per defecte del camp de theHarvester és un valor d'exemple: canvia'l abans d'executar res.
- La comanda s'executa amb una llista d'arguments (`Popen` sense `shell=True`), de manera que el text introduït al camp de domini no s'interpreta com a ordres de l'intèrpret.

---

## Limitacions conegudes

**Shodan**

- **Extracció web fràgil:** les expressions regulars depenen del HTML actual de shodan.io; poden deixar de funcionar o assignar el port a una IP equivocada (s'associen per índex). Shodan sol exigir inici de sessió per a cerques, així que és habitual que aquest camí no retorni dades.
- El *scraping* de shodan.io pot anar en contra dels seus termes d'ús; es recomana l'API oficial amb un pla adequat.
- El pla gratuït (InternetDB) **no ofereix banners** ni versions detallades.
- Al *fallback* d'host només es controlen errors `shodan.APIError`; els errors de xarxa es mostren com a error genèric.
- Límit de resultats fixat a 5 o 10.

**The Harvester**

- **Separador del `PATH`:** el codi usa `:` (`f"{Path(sys.executable).parent}:{...}"`), correcte a Linux/macOS però no a Windows, on caldria `;` (o `os.pathsep`). A Windows, a més, l'executable dins del venv sol ser `theHarvester.exe` dins de `Scripts`, que el codi no detecta tal qual.
- No hi ha botó per **cancel·lar** l'execució ni *timeout*.
- El límit `-l 500` està fixat al codi.
- La sortida pot incloure codis de color ANSI que el quadre de text no interpreta.
- El nom de fitxer (`-f`) no es valida ni es mostra on es desa; el directori de sortida depèn del directori de treball i de la versió de theHarvester.
- La font `all` pot ser lenta i generar moltes consultes.

**General**

- `_get_api()` no s'utilitza.
- Les tipografies `Segoe UI` i `Consolas` són de Windows; en altres sistemes Tk en farà una substitució.

---

## Possibles millores

- Eliminar la clau del codi i usar `keyring` o només variables d'entorn.
- Substituir el *scraping* de Shodan per l'API oficial, amb un avís clar si cal pla de pagament.
- Usar `os.pathsep` i detectar `theHarvester.exe` per fer el mòdul compatible amb Windows.
- Afegir botó **Aturar** (`proc.terminate()`) i *timeout* configurable.
- Fer configurable el límit `-l` i mostrar la ruta del fitxer generat per `-f`.
- Eliminar els codis ANSI de la sortida o interpretar-los amb etiquetes de `Text`.
- Botó per **exportar** els resultats de Shodan (CSV/JSON) i per copiar la sortida d'OSINT.
- Opció per enviar els hosts/IP trobats per theHarvester al mòdul Shodan.
- Separar la lògica de xarxa/processos de la interfície per poder-la provar amb tests.

---

## Estructura de fitxers

```text
.
├── shodan_gui.py   # Aplicació
└── logo.png        # (opcional) Logo de l'empresa
```
