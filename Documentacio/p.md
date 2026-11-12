Aquí tens la documentació completa del codi en format **Markdown (`.md`)**, llesta per copiar i guardar com a `README.md` o documentació tècnica del projecte:

```markdown
# MFS Recon & Pentesting Tool — Documentació Tècnica

Aplicació d'escriptori desenvolupada en **Python** i **Tkinter** per a tasques de reconeixement passiu (*Information Gathering*) i OSINT, creada per a **MFS s.l.**

Integra en una única interfície gràfica amb tema fosc dues funcionalitats principals:
1. **Mòdul Shodan Recon:** Consulta d'informació d'adreces IP públiques (ports, serveis, CPE, vulnerabilitats i banners) i cerca de serveis exposats a Internet amb mecanismes de *fallback* gratuïts.
2. **Mòdul OSINT (The Harvester):** Execució en temps real de l'eina `theHarvester` mitjançant subProcessos per a la recol·lecció de subdominis, correus electrònics i actius associats a un domini.

---

## 📋 Requisits i Instal·lació

### Dependències de Python
Per executar l'aplicació cal instal·lar les llibreries següents:

```bash
pip install shodan pillow

```

* **`shodan`**: Client oficial per interactuar amb l'API de Shodan.
* **`pillow`** *(opcional)*: Permet carregar i escalar amb alta qualitat el logotip corporatiu (`logo.png`). Si no està instal·lada, el programa fa servir el suport natiu de `tk.PhotoImage` o una insígnia de text per defecte.

### Dependència Externa (Mòdul OSINT)

Per utilitzar la pestanya **The Harvester**, cal tenir instal·lat el paquet al mateix entorn virtual (`venv`) o al sistema:

```bash
pip install git+[https://github.com/laramies/theHarvester.git](https://github.com/laramies/theHarvester.git)

```

---

## ⚙️ Configuració i Constants Globals

Al principi de l'script es defineixen les constants de configuració, rutes i paleta de colors:

| Constant | Descripció | Valor per defecte |
| --- | --- | --- |
| `COMPANY` | Nom de l'organització mostrat a la capçalera i peu de pàgina. | `"MFS s.l."` |
| `LOGO_PATH` | Ruta al fitxer d'imatge del logotip al mateix directori que l'script. | `logo.png` |
| `DEFAULT_API_KEY` | Clau API de Shodan per defecte (es pot sobreescriure amb la variable d'entorn `SHODAN_API_KEY` o des de la UI). | `"ATPLXozQQ..."` |
| `BG`, `PANEL`, `PANEL_2` | Paleta de colors fosc inspirada en Tailwind Slate (`#0f172a`, `#1e293b`, `#273449`). | Hexadecimals |
| `ACCENT`, `OK`, `ERR` | Colors d'estat per a botons, missatges d'èxit i alertes d'error. | `#38bdf8`, `#4ade80`, `#f87171` |

---

## 🏗️ Arquitectura del Codi

L'aplicació s'estructura al voltant d'una única classe principal `MainApp(tk.Tk)` que gestiona tant la interfície gràfica com l'execució asíncrona de consultes de xarxa.

### 1. Inicialització i Disseny Visual

* **`__init__()`**: Configura la finestra principal (`1000x720`, mínim `860x600`), inicialitza les variables reactives de Tkinter (`api_key`, `status`) i crida els constructors de la interfície.
* **`_setup_style()`**: Personalitza el tema `clam` de `ttk` per aplicar estils coherents a pestanyes (`TNotebook`), taules (`Treeview`), desplegables (`TCombobox`), camps de text (`TEntry`) i botons d'acció (`Accent.TButton`).
* **`_build_header()` & `_load_logo(size)**`: Construeix la barra superior amb el logotip corporatiu, el títol de la suite i un camp emmascarat (`show="•"`) per introduir o modificar la clau API de Shodan en calent.
* **`_build_statusbar()` & `set_status(msg, color)**`: Barra inferior que informa l'usuari en temps real de l'estat de les peticions i errors.

---

### 2. Mòdul Shodan Recon (`_build_shodan_subtabs`)

Aquest mòdul es divideix en dues subpestanyes:

#### A. Consulta d'Host (`_build_host_tab` / `lookup_host`)

Permet analitzar una adreça IPv4/IPv6 pública:

1. **Validació**: Mitjançant el mòdul `ipaddress`, verifica que el format sigui correcte i que l'adreça sigui global (`addr.is_global`), rebutjant IPs privades o locals.
2. **Estratègia d'obtenció de dades (`_fetch_host`)**:
* **Pla amb API Key**: Consulta `shodan.Shodan(key).host(ip)` per obtenir detall complet (banners, versions, mòduls).
* **Fallback gratuït (`_internetdb`)**: Si no hi ha clau API o aquesta no té permisos suficients, consulta l'endpoint públic `https://internetdb.shodan.io/{ip}`. Si el port no té banner disponible, dedueix el servei amb `socket.getservbyport()`.


3. **Visualització (`_host_ok` & `_show_banner`)**:
* Mostra una fitxa resum amb *Hostnames*, *Ports oberts*, *Software* (formatat des de CPEs amb `_cpe_name()`), *Vulnerabilitats (CVEs)* i *Font de dades*.
* Llista cada port en un `Treeview`. En seleccionar una fila, carrega el *banner* complet al quadre de text inferior.



#### B. Cerca de Serveis (`_build_search_tab` / `search_service`)

Permet cercar dispositius exposats per paraula clau (ex. `nginx`, `proftpd`, `webcam`) amb un límit configurable (`5` o `10` resultats):

1. **Estratègia híbrida (`do_search`)**:
* Intenta primer la cerca oficial a través de `api.search(q, limit=limit)`.
* Si l'API retorna error de membresia (pla gratuït), obté el recompte total amb `api.count(q)` i realitza un **web scraping** controlat sobre `https://www.shodan.io/search?query=...` mitjançant expressions regulars (`re.findall`) per extreure IPs, ports i organitzacions.


2. **Cerca Inversa amb Doble Clic (`_send_ip_to_host`)**:
* En fer doble clic (`<Double-1>`) sobre qualsevol resultat de la taula, l'aplicació captura la IP seleccionada, la copia automàticament al formulari de **Consulta d'Host**, canvia de pestanya i llança l'anàlisi detallada de forma immediata.



---

### 3. Mòdul OSINT — The Harvester (`_build_harvester_tab` / `run_harvester`)

Permet llançar auditories OSINT sobre un domini objectiu sense sortir de la interfície:

* **Paràmetres configurables**:
* **Domini (`-d`)**: Domini objectiu (per defecte `iesebre.cat`).
* **Font de dades (`-b`)**: Selecció entre `duckduckgo`, `bing`, `crtsh`, `google`, `linkedin` o `all`.
* **Exportació (`-f`)**: Casella de verificació que habilita el camp del nom de fitxer (`_toggle_file_entry`) per desar els resultats en disc.


* **Execució i lectura en temps real**:
* Localitza automàticament el binari `theHarvester` dins la carpeta `bin/` o `Scripts/` de l'intèrpret Python actiu (`Path(sys.executable).parent`), o el busca al `PATH` del sistema.
* Executa la comanda via `subprocess.Popen` amb `PYTHONUNBUFFERED=1` dins d'un fil secundari (`threading.Thread`).
* Llegeix la sortida estàndard línia a línia (`iter(proc.stdout.readline, "")`) i l'injecta de manera segura al fil principal de Tkinter mitjançant `self.after(0, self._append_harvest_output, line)`.



---

## 🔄 Gestió de Concurrència i Errors

Per evitar que la interfície gràfica es congeli (*Not Responding*) durant les peticions HTTP o l'execució de subProcessos:

* **Fils en segon pla (`daemon=True`)**: Totes les tasques bloquejants s'executen mitjançant `_run_async()` o fils dedicats.
* **Seguretat de fils a Tkinter**: Cap fil secundari modifica directament widgets de la UI; totes les actualitzacions visuals es programen al bucle principal amb `self.after(0, ...)`.
* **Bloqueig de botons**: Els botons d'acció es deshabiliten (`state(["disabled"])`) mentre hi ha una consulta en curs per evitar peticions duplicades.
* **Gestió d'excepcions (`_friendly_error`)**: Tradueix errors tècnics de l'API de Shodan (clau invàlida, IP sense registres, restriccions de pla de pagament o binari no instal·lat) a missatges clars per a l'usuari.

---

## 🚀 Ús Ràpid

```bash
python nom_del_fitxer.py

```

> **Nota de seguretat:** Es recomana no deixar claus API reals escrites al codi font (`DEFAULT_API_KEY`) en repositoris públics. Configura la variable d'entorn `SHODAN_API_KEY` al sistema abans d'executar l'eina.

```

```
