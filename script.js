// ======================================================
// 1. VISNINGSKONTROLL (Navigasjon mellom Bobler og Emnevisning)
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Finner hovedseksjonene på siden
    const bobleNav = document.getElementById('boble-navigasjon');
    const emneVisning = document.getElementById('emnevisning-container');
    const bobleLenker = document.querySelectorAll('.boble');

    // Funksjon for å skjule bobler og vise emnevisning
    function visEmnevisning(emneId) {
        bobleNav.style.display = 'none';
        emneVisning.style.display = 'block';
        
        // Kaller synkroniseringsfunksjonen for å sikre at riktig innhold vises fra start
        synkroniserSidebars('kort-1'); 
    }

    // Setter opp event-lyttere for boblene
    bobleLenker.forEach(boble => {
        boble.addEventListener('click', (event) => {
            // Hindrer standard lenkenavigasjon for å styre visningen med JS
            event.preventDefault(); 
            
            // Vi later som alle bobler leder til Biologi-emnet for testing
            const emneId = event.currentTarget.getAttribute('href').replace('#emnevisning-', '');
            visEmnevisning(emneId);
        });
    });

    // Funksjon for å vise bobler og skjule emnevisning (brukes av "Tilbake"-knappen)
    window.visBobleNavigasjon = function() {
        bobleNav.style.display = 'block';
        emneVisning.style.display = 'none';
    };

    // Starter med å vise boblene
    visBobleNavigasjon();
});


// ======================================================
// 2. SIDEBAR SYNKRONISERING (Hovedlogikken)
// ======================================================

// Hjelpefunksjon for å vise/skjule innhold i sidebarene
function oppdaterSidebarInnhold(targetId, sidebarClass) {
    // Finner alle innholdselementer i den spesifikke sidebaren
    const innholdselementer = document.querySelectorAll(`.${sidebarClass} > div`);

    innholdselementer.forEach(element => {
        // Henter ID-en elementet er knyttet til (data-target-id)
        const elementTarget = element.getAttribute('data-target-id');
        
        if (elementTarget === targetId) {
            // Viser innholdet som matcher det synlige kortet
            element.style.display = 'block';
        } else {
            // Skjuler alt annet innhold
            element.style.display = 'none';
        }
    });
}

// Funksjon som synkroniserer begge sidebarene
function synkroniserSidebars(targetId) {
    oppdaterSidebarInnhold(targetId, 'sidebar-venstre'); // Oppdaterer Mine Notater
    oppdaterSidebarInnhold(targetId, 'sidebar-hoyre');   // Oppdaterer Kommentarer/Diskusjon
}

// ======================================================
// 3. INTERSECTION OBSERVER OPPSETT
// ======================================================

const innholdsKort = document.querySelectorAll('.innholds-kort');

// Observer-alternativer
const observerOptions = {
    // Root: Elementet som brukes som viewport (null betyr nettleservinduet)
    root: null, 
    // Margin (buffer) rundt root
    rootMargin: '0px', 
    // Terskel: Hvor stor del av elementet må være synlig for å trigge
    // 0.5 betyr 50% av kortet må være synlig
    threshold: 0.5 
};

// Funksjonen som kalles når et kort krysser terskelen
function observerCallback(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 'isIntersecting' er sann når elementet er synlig (over terskelen)
            
            // Henter ID-en til kortet som nå er synlig
            const synligKortId = entry.target.id; 
            
            // Synkroniserer sidebarene med det synlige kortets ID
            synkroniserSidebars(synligKortId);

            // Valgfri: Logg til konsollen for feilsøking
            // console.log(`Synkroniserer med: ${synligKortId}`);
        }
    });
}

// Opprett Intersection Observer
const innholdsObserver = new IntersectionObserver(observerCallback, observerOptions);

// Start observeringen på hvert innholdskort
innholdsKort.forEach(kort => {
    innholdsObserver.observe(kort);
});
