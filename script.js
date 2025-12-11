// Global variabel for å holde all fagdata
let allFagData = [];
// Variabel for å holde styr på hvilket hovedfag som er valgt
let valgtHovedfagId = null; 


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

        initialiserNavigasjon();
    } catch (feil) {
        console.error("Feil ved lasting av fagdata:", feil);
        alert("Klarte ikke å laste fagdata. Sjekk data.json filen.");
    }
}

// Kaller funksjonen for å starte alt
hentDataOgInitialiser();


// ======================================================
// 2. NAVIGASJONSKONTROLL (NY LOGIKK)
// ======================================================

function initialiserNavigasjon() {
    const hovedFagVelger = document.getElementById('hovedfag-velger');
    const bobleNav = document.getElementById('boble-navigasjon');
    const emneVisning = document.getElementById('emnevisning-container');
    const hovedfagKnapper = document.querySelectorAll('.hovedfag-knapp');
    
    // Funksjon for å vise Nivå 1: Hovedfagvelger
    window.visHovedfagVelger = function() {
        hovedFagVelger.style.display = 'block';
        bobleNav.style.display = 'none';
        emneVisning.style.display = 'none';
    }

    // Funksjon for å vise Nivå 2: Boble-navigasjon
    window.visBobleNavigasjon = function() {
        hovedFagVelger.style.display = 'none';
        bobleNav.style.display = 'block';
        emneVisning.style.display = 'none';
        // Henter bobler basert på sist valgt hovedfag
        byggBobleNavigasjon(valgtHovedfagId);
    }

    // Starter med Hovedfagvelgeren
    visHovedfagVelger(); 

    // Setter opp event-lyttere for Hovedfag-knappene
    hovedfagKnapper.forEach(knapp => {
        knapp.addEventListener('click', (event) => {
            const hovedfagId = event.currentTarget.getAttribute('data-hovedfag-id');
            valgtHovedfagId = hovedfagId; // Lagrer valget

            // Hvis Naturfag, fortsett til boblene. Ellers, vis melding
            if (hovedfagId === 'naturfag') {
                document.getElementById('boble-tittel').textContent = 'Fagområder i Naturfag';
                visBobleNavigasjon();
            } else {
                alert(`Innhold for ${hovedfagId} er ikke klart ennå.`);
            }
        });
    });

    // Lyttere for fagområde-boblene (må settes opp dynamisk etter bygging)
    // Se byggBobleNavigasjon for lytteren.
}


// ======================================================
// 3. GENERER BOBLE-INNHOLD (NIVÅ 2)
// ======================================================

function byggBobleNavigasjon(hovedfagId) {
    const bobleContainer = document.querySelector('#boble-navigasjon .boble-container');
    bobleContainer.innerHTML = ''; // Tømmer boblene før vi bygger nye

    // Vi henter kun subfagene som er definert i "fagdata"
    const subFag = allFagData; 
    
    // Genererer HTML for hver sub-fag-boble (Fysikk, Kjemi, Biologi)
    subFag.forEach(fag => {
        const bobleDiv = document.createElement('a');
        bobleDiv.href = '#';
        bobleDiv.className = `boble boble-${fag.id}`;
        bobleDiv.setAttribute('data-fag-id', fag.id);
        bobleDiv.textContent = fag.navn;
        
        // Legger til stil for farge og størrelse basert på CSS
        // (CSS-klassene boble-fysikk, -kjemi, -biologi håndterer utseendet)

        bobleContainer.appendChild(bobleDiv);
    });

    // Setter opp lyttere for de nye boblene
    document.querySelectorAll('#boble-navigasjon .boble').forEach(boble => {
        boble.addEventListener('click', (event) => {
            event.preventDefault();
            const fagId = event.currentTarget.getAttribute('data-fag-id');
            
            // Finner det første emnet i det valgte faget og viser det
            const fag = allFagData.find(f => f.id === fagId);
            if (fag && fag.emner.length > 0) {
                 const emne = fag.emner[0]; // Velger første emne
                 visEmnevisning(fagId, emne.id);
            } else {
                alert(`Innhold for ${fag.navn} er ikke klart ennå.`);
            }
        });
    });
}

// Funksjon for å vise Nivå 4: Emnevisning (Kopiert fra forrige steg)
function visEmnevisning(fagId, emneId) {
    document.getElementById('hovedfag-velger').style.display = 'none';
    document.getElementById('boble-navigasjon').style.display = 'none';
    document.getElementById('emnevisning-container').style.display = 'block';

    const fag = allFagData.find(f => f.id === fagId);
    const emne = fag.emner.find(e => e.id === emneId);

    if (emne) {
        byggEmnevisning(emne);
    } else {
        console.error(`Emne ${emneId} ikke funnet.`);
    }
}


// ======================================================
// 4. GENERER INNHOLD OG OBSERVER LOGIKK (Som Før)
// ======================================================

function byggEmnevisning(emneData) {
    const mainContainer = document.getElementById('emne-innhold');
    mainContainer.innerHTML = ''; 
    
    document.querySelector('#emnevisning-container header h2').textContent = emneData.tittel;

    const notatSidebar = document.createElement('aside');
    notatSidebar.className = 'sidebar sidebar-venstre';
    notatSidebar.innerHTML = '<h3>📝 Mine Notater</h3>';

    const innholdsFeed = document.createElement('div');
    innholdsFeed.className = 'hovedinnhold-feed';

    const kommentarSidebar = document.createElement('aside');
    kommentarSidebar.className = 'sidebar sidebar-hoyre';
    kommentarSidebar.innerHTML = '<h3>💬 Diskusjon & Definisjoner</h3>';

    emneData.kort.forEach((kort, index) => {
        const isFirst = index === 0;

        let innholdHTML = '';
        if (kort.type === 'lysbilde' || kort.type === 'bilde') {
            innholdHTML = `<img src="${kort.innhold_src}" alt="${kort.tittel}" class="lysbildefremvisning">`;
        } else if (kort.type === 'video') {
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

        notatSidebar.innerHTML += `
            <div class="notat-innhold" data-target-id="${kort.kort_id}" style="display: ${isFirst ? 'block' : 'none'};">
                <p>${kort.notat}</p>
            </div>
        `;

        kommentarSidebar.innerHTML += `
            <div class="kommentar-innhold" data-target-id="${kort.kort_id}" style="display: ${isFirst ? 'block' : 'none'};">
                <p>${kort.kommentar}</p>
            </div>
        `;
    });

    mainContainer.appendChild(notatSidebar);
    mainContainer.appendChild(innholdsFeed);
    mainContainer.appendChild(kommentarSidebar);

    initialiserIntersectionObserver();
}

function initialiserIntersectionObserver() {
    const innholdsKort = document.querySelectorAll('.innholds-kort');
    
    if (innholdsKort.length === 0) return;

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
