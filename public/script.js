
console.log('JuraShow carregado!');

window.dinosaurDescriptions = {
    "velociraptor": {
        description: "Découvrez l'attraction du Vélociraptor ! Un prédateur intelligent et agile du Crétacé, mesurant 2 mètres de long. Vivez une expérience immersive avec ces chasseurs redoutables aux griffes acérées.",
        image: "/assets/velociraptor.png"
    },
    "tyrannosaurus": {
        description: "L'attraction du Tyrannosaure Rex vous attend ! Le roi des dinosaures, long de 12 mètres et pesant 7 tonnes. Ressentez la puissance de ce prédateur apex avec ses mâchoires terrifiantes.",
        image: "/assets/tyrannosaurus.png"
    },
    "pterosaurus": {
        description: "Envolez-vous avec l'attraction du Ptérosaure ! Ces reptiles volants du Mésozoïque dominaient les cieux avec leurs ailes membraneuses. Une expérience aérienne spectaculaire.",
        image: "/assets/pterosaurus.png"
    },
    "therizinosaurus": {
        description: "Explorez l'attraction du Thérizinosaure ! Ce géant herbivore aux griffes impressionnantes de 1 mètre était l'un des plus grands dinosaures bipèdes. Une rencontre fascinante.",
        image: "/assets/therizinosaurus.png"
    },
    "triceratops": {
        description: "Rencontrez l'attraction du Tricératops ! Ce majestueux herbivore à trois cornes et sa collerette osseuse distinctive. Découvrez la vie de ces géants paisibles du Crétacé.",
        image: "/assets/triceratops.png"
    },
    "plesiossauros": {
        description: "Plongez dans l'attraction du Plésiosaure ! Ces reptiles marins aux longs cous glissaient gracieusement dans les océans préhistoriques. Une aventure aquatique extraordinaire.",
        image: "/assets/plesiossauros.png"
    }
};


function setupPrintButton() {
    const printButton = document.querySelector('button[onclick="window.print()"]');
    if (printButton) {
        printButton.removeAttribute('onclick');
        printButton.addEventListener('click', () => {
            window.print();
        });
    }
}

function setupActionButtons() {
    const buttons = document.querySelectorAll('.actions a, .actions button');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.3)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = 'none';
        });
    });
}


function initHomePage() {
    console.log('Iniciando página inicial...');
    const dinosaurItems = document.querySelectorAll('.dinosaur-item');
    const dinosaurImage = document.getElementById('dinosaurImage');
    const dinosaurDescription = document.getElementById('dinosaurDescription');
    const placeholderText = document.getElementById('placeholderText');

    dinosaurItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const dinosaur = item.getAttribute('data-dinosaur');
            const dinoData = window.dinosaurDescriptions[dinosaur];
            if (dinoData) {
                dinosaurImage.src = dinoData.image;
                dinosaurImage.classList.add('show');
                dinosaurDescription.textContent = dinoData.description;
                dinosaurDescription.classList.add('show');
                placeholderText.classList.add('hidden');
            }
        });

        item.addEventListener('mouseleave', () => {
            dinosaurImage.classList.remove('show');
            dinosaurImage.src = '';
            dinosaurDescription.classList.remove('show');
            dinosaurDescription.textContent = '';
            placeholderText.classList.remove('hidden');
        });
    });
}


function initTicketsPage() {
    console.log('Iniciando página de ingressos...');
    const filterSelect = document.getElementById('dinosaurFilter');
    const ticketCards = document.querySelectorAll('.ticket-card');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const selectedDino = e.target.value;
            ticketCards.forEach(card => {
                const cardDino = card.getAttribute('data-dinosaur');
                if (selectedDino === '' || cardDino === selectedDino) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}


function initReservationPage() {
    console.log('Iniciando página de reserva...');
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            const email = form.querySelector('input[name="buyer_email"]').value;
            if (!email.includes('@')) {
                e.preventDefault();
                alert('Email inválido!');
            }
        });
    }
}


function initGeneralEffects() {
}


function isValidEmail(email) {
    return email.indexOf('@') > 0 && email.indexOf('.') > 0;
}


function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-10px); } }
        .loading { opacity: 0.6; pointer-events: none; position: relative; }
        .loading::after { content: ''; position: absolute; top: 50%; left: 50%; width: 20px; height: 20px; margin: -10px 0 0 -10px; border: 2px solid #f3f3f3; border-top: 2px solid #654321; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .notification { box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); }
    `;
    document.head.appendChild(style);
}


document.addEventListener('DOMContentLoaded', () => {
    console.log('🦕 JuraShow - Sistema carregado!');
    
    addDynamicStyles();
    
    if (document.querySelector('.dinosaur-list')) {
        initHomePage();
        console.log('🏠 Página inicial inicializada');
    }
    
    if (document.querySelector('.tickets-grid')) {
        initTicketsPage();
        console.log('🎫 Página de ingressos inicializada');
    }
    
    if (document.getElementById('reservationForm')) {
        initReservationPage();
        console.log('📝 Página de reserva inicializada');
    }
    
    if (document.querySelector('.success-container')) {
        console.log('✅ Página de sucesso detectada');
        setupPrintButton();
        setupActionButtons();
    }
    
    initGeneralEffects();
    console.log('✨ Inicialização completa!');
});