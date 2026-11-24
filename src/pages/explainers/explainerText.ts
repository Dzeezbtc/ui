/**
 * The words on the three explainer pages (How it works, FAQ, Play responsibly).
 * Long copy lives here rather than in the i18n tables: English and Spanish are
 * written, other languages show English until they are translated
 * (see utils/explainerCopy).
 */

export interface ExplainerCard {
    title: string;
    body: string;
}

export interface FaqItem {
    q: string;
    a: string;
}

export interface ExplainerText {
    how: {
        kicker: string;
        title: string;
        sub: string;
        steps: ExplainerCard[];
        keepTitle: string;
        keep: string[];
        cta: string;
        ctaSub: string;
        faqLink: string;
    };
    faq: {
        kicker: string;
        title: string;
        sub: string;
        items: FaqItem[];
        sideTitle: string;
        sideBody: string;
    };
    care: {
        kicker: string;
        title: string;
        sub: string;
        habits: ExplainerCard[];
        signsTitle: string;
        signs: string[];
        helpTitle: string;
        helpSub: string;
        /** Region line for each help service, in HELP_SERVICES order. */
        regions: string[];
        visit: string;
    };
}

/** Free help services shown on Play responsibly (names are not translated). */
export const HELP_SERVICES = [
    { name: "Gambling Therapy", url: "https://www.gamblingtherapy.org/" },
    { name: "Gamblers Anonymous", url: "https://www.gamblersanonymous.org/" },
    { name: "GamCare", url: "https://www.gamcare.org.uk/" },
    { name: "Gambling Help Online", url: "https://www.gamblinghelponline.org.au/" }
] as const;

const en: ExplainerText = {
    how: {
        kicker: "New here?",
        title: "How Block52 works",
        sub: "Real poker on an open network. Four steps from here to your first hand.",
        steps: [
            { title: "Sign in", body: "Use the wallet built into Block52, or your Circle account if you belong to one. Open tables need no forms and no ID." },
            { title: "Add funds", body: "Deposit USDC from your own Web3 wallet. It lands in your Block52 balance, ready for a buy-in. One chip dollar is one real dollar." },
            { title: "Take a seat", body: "Choose Hold'em or Omaha, then a cash game, a Sit & Go or a tournament. Every stake level always has a table ready for you." },
            { title: "Check any hand", body: "Every shuffle, card and pot is written to the Block52 chain. Replay any hand in the Explorer, or see the whole deck on Fairness." }
        ],
        keepTitle: "Your chips stay yours",
        keep: [
            "With the built-in wallet your balance sits at your own Block52 address, and only you hold its key.",
            "Leave a cash table when you like: your stack goes straight back to your balance.",
            "Withdraw your USDC to Ethereum at any time.",
            "A small network fee comes out of each pot, the same rule at every table."
        ],
        cta: "Take your seat",
        ctaSub: "Every level has a table waiting.",
        faqLink: "Read the FAQ"
    },
    faq: {
        kicker: "Help",
        title: "Questions, answered",
        sub: "The short version of everything players ask us most.",
        items: [
            {
                q: "What is Block52?",
                a: "A poker room that runs on its own open blockchain. Dealing, betting and payouts are all recorded on chain, so no one, us included, can quietly change a hand."
            },
            { q: "Do I need to show ID?", a: "Not for open tables. A Circle may ask its own members for details, and if it does, it says so in its house rules before you join." },
            { q: "How do I add money?", a: "Open My wallet, connect a Web3 wallet and deposit USDC. Chips are USDC, so $1 in chips is $1." },
            { q: "How do I cash out?", a: "Open My wallet and choose Withdraw. Your USDC goes back to the Ethereum wallet you connect." },
            {
                q: "Who holds my money?",
                a: "With the built-in wallet, you do. Your key stays in your browser, and your recovery phrase is the only way to restore it. Write the words down and never share them: Block52 will never ask for them. In a Circle-run account the Circle keeps the key for you, and you sign in with a username and password."
            },
            {
                q: "How do I know the deal is fair?",
                a: "Each hand's shuffle seed and every card dealt are stored on chain. You can replay any hand in the Explorer, and the Fairness page counts every card ever dealt against what a fair deck should give."
            },
            { q: "Which games can I play?", a: "Texas Hold'em and Omaha, as cash games, Sit & Gos and tournaments, at 9-max, 6-max and heads-up tables." },
            { q: "Is there a fee?", a: "Yes, a small network fee is taken from each pot. It pays for the network that deals and records every game." },
            { q: "What is a Circle?", a: "A private club inside Block52, with its own tables, members and house rules. You join one with an invite or from the Circle's own page." },
            { q: "Can I play on my phone?", a: "Yes. Block52 runs in your phone's browser, so there's nothing to install." }
        ],
        sideTitle: "New to Block52?",
        sideBody: "Four quick steps take you from signing in to your first hand."
    },
    care: {
        kicker: "Player care",
        title: "Play responsibly",
        sub: "Poker is meant to be fun. A few habits keep it that way.",
        habits: [
            { title: "18+ only", body: "You must be 18 or over, and old enough to play under the law where you live." },
            { title: "Set a limit first", body: "Decide what you can afford to lose before you sit down, and deposit only that." },
            { title: "Take breaks", body: "Use Sit Out Next Hand to step away. Long sessions lead to tired decisions." },
            { title: "Don't chase losses", body: "Losing hands are part of poker. Trying to win money back fast usually loses more." },
            { title: "Keep it separate", body: "Never play with money meant for rent, bills or anyone else." },
            { title: "Know your numbers", body: "My hands and your wallet activity show every hand, buy-in and cash-out you've made." }
        ],
        signsTitle: "When it stops being fun",
        signs: [
            "You play for longer, or for more, than you planned.",
            "You hide how much you play from people close to you.",
            "You borrow, or use money meant for something else.",
            "You feel low or on edge when you're not playing."
        ],
        helpTitle: "Free, confidential help",
        helpSub: "If any of that sounds familiar, talk to someone. These services are free and private.",
        regions: ["Worldwide · chat in many languages", "Meetings worldwide", "United Kingdom", "Australia"],
        visit: "Visit site"
    }
};

const es: ExplainerText = {
    how: {
        kicker: "¿Eres nuevo?",
        title: "Cómo funciona Block52",
        sub: "Póquer de verdad en una red abierta. Cuatro pasos te separan de tu primera mano.",
        steps: [
            { title: "Inicia sesión", body: "Usa la billetera integrada de Block52, o tu cuenta de Círculo si perteneces a uno. Las mesas abiertas no piden formularios ni documentos." },
            { title: "Añade fondos", body: "Deposita USDC desde tu propia billetera Web3. Llega a tu saldo de Block52, listo para entrar a una mesa. Un dólar en fichas es un dólar real." },
            { title: "Siéntate", body: "Elige Hold'em u Omaha, y luego una mesa cash, un Sit & Go o un torneo. Cada nivel de ciegas siempre tiene una mesa lista para ti." },
            { title: "Revisa cualquier mano", body: "Cada barajado, carta y bote queda escrito en la cadena de Block52. Repite cualquier mano en el Explorador o mira la baraja completa en Equidad." }
        ],
        keepTitle: "Tus fichas siguen siendo tuyas",
        keep: [
            "Con la billetera integrada, tu saldo está en tu propia dirección de Block52 y solo tú tienes la llave.",
            "Sal de una mesa cash cuando quieras: tus fichas vuelven directo a tu saldo.",
            "Retira tus USDC a Ethereum en cualquier momento.",
            "De cada bote sale una pequeña tarifa de red, con la misma regla en todas las mesas."
        ],
        cta: "Toma tu asiento",
        ctaSub: "Cada nivel tiene una mesa esperándote.",
        faqLink: "Lee las preguntas frecuentes"
    },
    faq: {
        kicker: "Ayuda",
        title: "Preguntas y respuestas",
        sub: "Lo esencial de lo que más nos preguntan los jugadores.",
        items: [
            {
                q: "¿Qué es Block52?",
                a: "Una sala de póquer que funciona en su propia blockchain abierta. El reparto, las apuestas y los pagos quedan registrados en la cadena, así que nadie, ni siquiera nosotros, puede cambiar una mano a escondidas."
            },
            { q: "¿Tengo que mostrar un documento?", a: "No en las mesas abiertas. Un Círculo puede pedir datos a sus miembros y, si lo hace, lo indica en sus reglas antes de que te unas." },
            { q: "¿Cómo añado dinero?", a: "Abre Mi billetera, conecta una billetera Web3 y deposita USDC. Las fichas son USDC: $1 en fichas es $1." },
            { q: "¿Cómo retiro?", a: "Abre Mi billetera y elige Retirar. Tus USDC vuelven a la billetera de Ethereum que conectes." },
            {
                q: "¿Quién guarda mi dinero?",
                a: "Con la billetera integrada, tú. Tu llave se queda en tu navegador y tu frase de recuperación es la única forma de restaurarla. Escribe las palabras y no las compartas nunca: Block52 jamás te las pedirá. En una cuenta gestionada por un Círculo, el Círculo guarda la llave por ti y entras con usuario y contraseña."
            },
            {
                q: "¿Cómo sé que el reparto es justo?",
                a: "La semilla de barajado de cada mano y todas las cartas repartidas quedan guardadas en la cadena. Puedes repetir cualquier mano en el Explorador, y la página de Equidad compara todas las cartas repartidas con lo que daría una baraja justa."
            },
            { q: "¿A qué juegos puedo jugar?", a: "Texas Hold'em y Omaha, en mesas cash, Sit & Go y torneos, con mesas de 9, de 6 y mano a mano." },
            { q: "¿Hay alguna tarifa?", a: "Sí, de cada bote se toma una pequeña tarifa de red. Paga la red que reparte y registra cada partida." },
            { q: "¿Qué es un Círculo?", a: "Un club privado dentro de Block52, con sus propias mesas, miembros y reglas. Te unes con una invitación o desde la página del Círculo." },
            { q: "¿Puedo jugar en el móvil?", a: "Sí. Block52 funciona en el navegador de tu teléfono, no hay nada que instalar." }
        ],
        sideTitle: "¿Nuevo en Block52?",
        sideBody: "Cuatro pasos rápidos te llevan de iniciar sesión a tu primera mano."
    },
    care: {
        kicker: "Cuidado del jugador",
        title: "Juega con responsabilidad",
        sub: "El póquer es para divertirse. Algunos hábitos ayudan a que siga así.",
        habits: [
            { title: "Solo mayores de 18", body: "Debes tener 18 años o más, y la edad legal para jugar donde vives." },
            { title: "Pon un límite antes", body: "Decide cuánto puedes permitirte perder antes de sentarte y deposita solo eso." },
            { title: "Toma descansos", body: "Usa «Ausentarme la próxima mano» para alejarte. Las sesiones largas llevan a decisiones cansadas." },
            { title: "No persigas pérdidas", body: "Perder manos es parte del póquer. Intentar recuperar rápido suele hacerte perder más." },
            { title: "Mantenlo aparte", body: "Nunca juegues con dinero del alquiler, las cuentas o de otra persona." },
            { title: "Conoce tus números", body: "Mis manos y la actividad de tu billetera muestran cada mano, entrada y retiro que hiciste." }
        ],
        signsTitle: "Cuando deja de ser divertido",
        signs: [
            "Juegas más tiempo, o más dinero, de lo que planeabas.",
            "Ocultas cuánto juegas a las personas cercanas.",
            "Pides prestado o usas dinero destinado a otra cosa.",
            "Te sientes decaído o inquieto cuando no estás jugando."
        ],
        helpTitle: "Ayuda gratuita y confidencial",
        helpSub: "Si algo de esto te suena, habla con alguien. Estos servicios son gratuitos y privados.",
        regions: ["Todo el mundo · chat en muchos idiomas", "Reuniones en todo el mundo", "Reino Unido", "Australia"],
        visit: "Visitar sitio"
    }
};

/** Written translations of the explainer pages, by language code. */
export const EXPLAINER_TEXT: Record<string, ExplainerText> = { en, es };
