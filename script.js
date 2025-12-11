// Global variabel for å holde all fagdata
let allFagData = [];

// ======================================================
// 1. DATAHENTING OG INITIALISERING
// ======================================================

async function hentDataOgInitialiser() {
    try {
        const respons = await fetch('data.json');
        if (!respons.ok) {
            throw new Error(`Klarte ikke å hente data. Status: ${respons.status}`);
        }
        const data = await respons.json();
        allFagData = data.fagdata;
        console.log("Data lastet og klar for navigasjon.");

        // Fortsett med å initialisere navigasjonslogikken etter at data er hentet
        initialiserNavigasjon();
    } catch (feil) {
        console.error("Feil ved lasting av fagdata:", feil);
        alert("Klarte ikke å laste fagdata. Sjekk data.json filen og nettverksforbindelsen.");
    }
}

// Kaller funksjonen for å starte alt
hentDataOgInitialiser();


// ======================================================
// 2. NAVIGASJON OG VISNINGSKONTROLL (Nå dynamisk)
// ======================================================

function initialiserNavigasjon() {
    const bobleNav = document.getElementById('boble-navigasjon');
    const emneVisning = document.getElementById('emnevisning-container');
    const bobleLenker = document.querySelectorAll('.boble');

    // Funksjon for å vise emnevisning basert på valg
    function visEmnevisning(fagId) {
        const fag = allFagData.find(f => f.id === fagId);
        
        if (fag && fag.emner.length > 0) {
            // Vi velger det FØRSTE emnet i faget for å starte visningen
            const emne = fag.emner[0]; 

            bobleNav.style.display = 'none';
            emneVisning.style.display = 'block';

            // Bygger innholdet basert på den hentede dataen
            byggEmnevisning(emne);
        } else {
            alert(`Fag ${fagId} ble funnet, men inneholder ingen emner.`);
            console.error(`Fag ${fagId} er tomt.`);
        }
    }

    // Setter opp event-lyttere for boblene
    bobleLenker.forEach(boble => {
        boble.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Lese ID-en fra det nye data-attributtet
            const fagId = event.currentTarget.getAttribute('data-fag-id'); 
            visEmnevisning(fagId);
        });
    });

    // Funksjon for å vise bobler og skjule emnevisning (brukes av "Tilbake"-knappen)
    window.visBobleNavigasjon = function() {
        bobleNav.style.display = 'block';
        emneVisning.style.display = 'none';
    };

    // Starter med å vise boblene
    visBobleNavigasjon();
}


// ======================================================
// 3. GENERER INNHOLD FRA DATA
// ======================================================

function byggEmnevisning(emneData) {
    const mainContainer = document.getElementById('emne-innhold');
    mainContainer.innerHTML = ''; // Tømmer alt gammelt innhold
    
    // Oppdaterer tittel i header
    document.querySelector('#emnevisning-container header h2').textContent = emneData.tittel;

    // Oppretting av kolonne-elementene (strukturert for å matche CSS Grid)
    const notatSidebar = document.createElement('aside');
    notatSidebar.className = 'sidebar sidebar-venstre';
    notatSidebar.innerHTML = '<h3>📝 Mine Notater</h3>';

    const innholdsFeed = document.createElement('div');
    innholdsFeed.className = 'hovedinnhold-feed';

    const kommentarSidebar = document.createElement('aside');
    kommentarSidebar.className = 'sidebar sidebar-hoyre';
    kommentarSidebar.innerHTML = '<h3>💬 Diskusjon & Definisjoner</h3>';

    // Loop gjennom hvert kort i emnet
    emneData.kort.forEach((kort, index) => {
        const isFirst = index === 0;

        /* Bygg Hovedinnholdskort (Midten) */
        let innholdHTML = '';
        if (kort.type === 'lysbilde' || kort.type === 'bilde') {
            innholdHTML = `<img src="${kort.innhold_src}" alt="${kort.tittel}" class="lysbildefremvisning">`;
        } else if (kort.type === 'video') {
            // For videoer bruker vi iframe med kilden fra JSON
            innholdHTML = `<iframe width="100%" height="315" src="${kort.innhold_src}" title="${kort.tittel}" frameborder="0" allowfullscreen></iframe>`;
        }
        
        innholdsFeed.innerHTML += `
            <div class="innholds-kort" id="${kort.kort_id}">
                <h4>${kort.tittel}</h4>
                ${innholdHTML}
                <p>${kort.tekst}</p>
                <div style="height: 300px;"></div>
            </div>
        `;

        /* Bygg Notat-element (Venstre Sidebar) */
        notatSidebar.innerHTML += `
            <div class="notat-innhold" data-target-id="${kort.kort_id}" style="display: ${isFirst ? 'block' : 'none'};">
                <p>${kort.notat}</p>
            </div>
        `;

        /* Bygg Kommentar-element (Høyre Sidebar) */
        kommentarSidebar.innerHTML += `
            <div class="kommentar-innhold" data-target-id="${kort.kort_id}" style="display: ${isFirst ? 'block' : 'none'};">
                <p>${kort.kommentar}</p>
            </div>
        `;
    });

    // Legg til de tre kolonnene i hovedcontaineren
    mainContainer.appendChild(notatSidebar);
    mainContainer.appendChild(innholdsFeed);
    mainContainer.appendChild(kommentarSidebar);

    // Initialiser Intersection Observer etter at kortene er bygget
    initialiserIntersectionObserver();
}

// ======================================================
// 4. INTERSECTION OBSERVER LOGIKK
// ======================================================

function initialiserIntersectionObserver() {
    // Denne funksjonen må kalles ETTER at innholds-kortene er bygget i DOM-en
    const innholdsKort = document.querySelectorAll('.innholds-kort');
    
    if (innholdsKort.length === 0) return; // Avslutt hvis det ikke er kort

    const observerOptions = {
        root: null, 
        rootMargin: '0px', 
        threshold: 0.5 
    };
    
    function synkroniserSidebars(targetId) {
        
        const sidebars = [
            { class: 'sidebar-venstre', contentClass: 'notat-innhold' },
            { class: 'sidebar-hoyre', contentClass: 'kommentar-innhold' }
        ];

        sidebars.forEach(sidebar => {
            const innholdselementer = document.querySelectorAll(`.${sidebar.contentClass}`);

            innholdselementer.forEach(element => {
                const elementTarget = element.getAttribute('data-target-id');
                
                if (elementTarget === targetId) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            });
        });
    }

    function observerCallback(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const synligKortId = entry.target.id; 
                synkroniserSidebars(synligKortId);
            }
        });
    }

    const innholdsObserver = new IntersectionObserver(observerCallback, observerOptions);

    innholdsKort.forEach(kort => {
        innholdsObserver.observe(kort);
    });
}
