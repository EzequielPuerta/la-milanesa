<script lang="ts">
    import katex from 'katex';
    import { onMount } from 'svelte';
    import ChamberDiagram from './components/ChamberDiagram.svelte';
    import InteractiveChamberDiagram from './components/InteractiveChamberDiagram.svelte';
    import { candidatesMetadata, seatsToBeVacated, seatsAlreadyOccupied } from './data/parties-metadata';
    import { isasiBurdmanMetadata } from './data/encuesta-isasi-burdman';
    import { proyeccionMetadata } from './data/encuesta-proyeccion';
    import { circuitosMetadata } from './data/encuesta-circuitos';
    import { cbConsultoraMetadata } from './data/encuesta-cb-consultora';
    import { federicoGonzalezMetadata } from './data/encuesta-federico-gonzalez';
    import { giacobbeMetadata } from './data/encuesta-giacobbe';
    import { equipoMideMetadata } from './data/encuesta-equipo-mide';
    import { opinaiaMetadata } from './data/encuesta-opinaia';
    import { dcConsultoresMetadata } from './data/encuesta-dc-consultores';
    import type { PartyResult } from "./types";
    import {
        NEUTRAL_PARTY_NAME,
        NEUTRAL_COLOR,
        COLORED_DOTS_LIMIT,
    } from './constants';

    const grouped: Record<string, PartyResult> = {};
    for (const entry of [...seatsToBeVacated, ...seatsAlreadyOccupied]) {
        if (grouped[entry.party]) {
            grouped[entry.party].seats += entry.seats;
        } else {
            grouped[entry.party] = { ...entry };
        }
    }
    const firstView: PartyResult[] = Object.values(grouped);

    const prevElection: PartyResult[] = [
        ...seatsToBeVacated.map(entry => ({
            original_party: entry.original_party,
            party: entry.party,
            alias: entry.alias,
            seats: entry.seats,
            position: entry.position,
            color: entry.color
        })),
        ...seatsAlreadyOccupied.map(entry => ({
            original_party: entry.original_party,
            party: entry.party,
            alias: entry.alias,
            seats: entry.seats,
            position: entry.position,
            color: entry.color
        }))
    ];

    const onlyAlreadyOccupied: PartyResult[] = [
        {
            party: NEUTRAL_PARTY_NAME,
            alias: NEUTRAL_PARTY_NAME,
            seats: COLORED_DOTS_LIMIT,
            position: NEUTRAL_PARTY_NAME,
            color: NEUTRAL_COLOR,
        },
        ...seatsAlreadyOccupied.map(entry => ({
            original_party: entry.original_party,
            party: entry.party,
            alias: entry.alias,
            seats: entry.seats,
            position: entry.position,
            color: entry.color
        }))
    ];

    const quotients = `\\frac{100}{1}, \\frac{100}{2}, \\frac{100}{3}, \\frac{100}{4}, \\frac{100}{5}, \\ldots, \\frac{100}{29}, \\frac{100}{30}`;
    let rendered = "";

    onMount(() => {
      rendered = katex.renderToString(quotients, {
        throwOnError: false
      });
    });
</script>

<p class="px-10 pt-16 pb-4">
    Si bien hace ya cerca de 12 años que vivo en la Ciudad Autónoma de Buenos Aires, nunca me había hecho el Documento Nacional de Identidad (DNI) con alguna de las tantas direcciones que me permitieron habitar "la Capital". Eso cambió en algún momento de 2024: finalmente hice el trámite y obtuve un DNI con domicilio porteño, sin imaginar todas las consecuencias impensadas que eso iba a traer. 
</p>
<p class="px-10 py-4">
    Una de ellas fue el fin de la tradicional visita a la casa familiar en días de elecciones, allá en La Matanza, el <em>Far West</em>. Ya perdí la cuenta de cuántas veces fui a votar a la escuela 41. Lo que sí recuerdo es que nunca esperé más de 15 minutos. Por esos lados también fiscalicé para el <em>FITu</em>, y hasta fui presidente de mesa. Pero eso ya fue. Este <strong>domingo 18 de mayo del 2025</strong> me toca votar en Boedo, con Boleta Única Electrónica (BUE) y todo —ambas cosas por primera vez.
</p>

<div class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 px-4 md:px-10 py-4">
    <div class="order-1 md:order-1 md:w-1/2 text-justify">
        <p class="pb-4">
            Supongamos que te levantaste de un coma profundo, no viste las noticias y no tenés muy claro lo que se juega en estos comicios. Hagamos un repaso de la situación: la elección de este domingo es, básicamente, para renovar la mitad de la Legislatura porteña: 30 de las 60 bancas. Hay un total de 17 listas compitiendo, un número que puede parecer elevado y en efecto, lo es.
        </p>
        <p class="py-4">
            Dado que en febrero la propia Legislatura suspendió las Primarias Abiertas, Simultáneas y Obligatorias (PASO) en la Ciudad, la fragmentación partidaria se disparó. Antes, con las PASO, los partidos debían superar el 1,5% de los votos para acceder a las elecciones generales. Eso llevaba a formar alianzas y frentes variados, reduciendo así la proliferación de listas.
        </p>
    </div>

    <figure class="order-2 md:order-2 w-full flex justify-center relative">
        <img
            src="/images/articles/simulador-legislativas-caba-2025/listas.jpg"
            alt="Las 17 listas que competirán en las elecciones legislativas de CABA en 2025"
            class="max-w-xs sm:max-w-md md:max-w-full h-auto rounded-2xl"
        />
        <div class="absolute bottom-2 right-10 md:right-2 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded">
            Las 17 listas y sus principales candidatos
        </div>
    </figure>
</div>

<p class="px-10 pt-4">
    En fin, quizás no debería ser una elección tan relevante, pero el contexto actual la transforma en una bisagra clave para entender cómo se van a reacomodar las fuerzas políticas de cara al 2027. Y por todo esto, no pude evitar el impulso —ni la curiosidad— de ponerme a mirar los datos disponibles. Entonces, las preguntas que me hago (y que intentaré responder a grandes rasgos) son: ¿podemos tener una idea de cuáles son los escenarios posibles? ¿Cuáles podrían ser los resultados? ¿Cuántas bancas podría obtener cada lista? ¿Y cómo quedaría conformada la Legislatura, bloque por bloque, al final del día?
</p>

<h3 class="px-10 py-10">Composición de la Legislatura de CABA antes de las elecciones del 18 de mayo 2025</h3>

<p class="px-10 pb-4 ">
    Recordemos: hay 60 bancas en total, más la banca de la Presidencia del parlamento, a cargo de <strong>Clara Muzzio</strong> del <strong style="color: #facc15">PRO</strong> (quién solo tiene poder de voto en caso de empate). 30 de éstas bancas están ocupadas por legisladores cuyo mandato finaliza este año. Precisamente, las próximas elecciones son para elegir a quienes los reemplazaran. Los 30 legisladores restantes tienen mandato hasta el 2027. Si te preguntas como se distribuyen las bancas del parlamento porteño entre los bloques y partidos, momentos antes de las elecciones, estás de suerte:
</p>

<div class="w-full">
    <ChamberDiagram partyResults={firstView} affirmativeVotes={0} availableVoters={0} thresholdDhondt={0} showCounters={false} />
</div>

<p class="px-10 py-4">
    Como se aprecia, el oficialismo (el <strong style="color: #facc15">PRO</strong> y el partido de Graciela Ocaña, <strong style="color: #2c8f6d">Confianza Pública</strong>, de las pocos partidos de la ya extinta coalición <strong style="color: #facc15">Juntos por el Cambio</strong> que mantiene su afinidad con el PRO) no posee la mayoría.
</p>

<p class="px-10 py-4">
    Por el contrario, la misma está en manos de la oposición: en primer lugar, la también desaparecida alianza <strong style="color: #48b8ea">Unión por la Patria</strong> (representada en estos comicios en parte por Leandro Santoro y <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong>) y en menor medida, el <strong style="color: #fa1c1f">Frente de Izquierda</strong>.
</p>

<p class="px-10 py-4">
    En conjunto tienen mas bancas que los oficialistas, pero a pesar de esto, el oficialismo ha podido solucionar este inconveniente tendiendo alianzas con los radicales de <strong style="color: #d53175">Evolución</strong> y los libertarios Marra (<strong style="color: #708aff">Unión del Centro Democrático</strong>) y Casielles (<strong style="color: #604080">Transformación</strong>), ambos ex LLA. Otra recurrente aliada es Barreto del <strong style="color: #f97316">Partido Socialista</strong>, agrupación que en CABA (por influencia de Roy Cortina), hace años mantiene vinculos con la UCR, el PRO y la CC-ARI. También suelen acompañar al oficialismo Yamil Santoro de <strong style="color: #6e2c81">Republicanos Unidos</strong> (el partido de Ricardo López Murphy) y Donati (quien conformó el monobloque <strong style="color: #003366">Compromiso Liberal Republicano</strong> pero que también accedió a su banca mediante <strong style="color: #6e2c81">Republicanos Unidos</strong>). Todos estos espacios han sabido conformar <strong style="color: #facc15">Juntos por el Cambio</strong> pero en distintos momentos fueron abriendose de la coalición.
</p>

<p class="px-10 pt-4">
    Por otro lado, algunos legisladores que aún permanencen en <strong style="color: #68508b">La Libertad Avanza</strong> también han sabido tejer acuerdos con el oficialismo porteño, pero en general mantienen el alejamiento, reflejo de los roces entre <strong style="color: #68508b">Milei</strong> y los hermanos <strong style="color: #facc15">Macri</strong> a nivel nacional. Finalmente, las dos bancas del <strong style="color: #005e6c">Movimiento de Integración y Desarrollo</strong> suelen tener un comportamiento mas errático y aunque en el 2019 también formaron parte de <strong style="color: #facc15">Juntos por el Cambio</strong>, en el 2023 apoyaron la campaña de <strong style="color: #68508b">Milei</strong> y actualmente no tienen demasiada cercanía con el oficialismo de la Ciudad.
</p>

<p class="px-10 pt-4">
    Resumiendo, el oficialismo del <strong style="color: #facc15">PRO</strong> tiene estríctamente <strong>12</strong> bancas, pero con sus alianzas dentro y fuera de lo que fue el espacio de <strong style="color: #facc15">Juntos por el Cambio</strong> pueden llegar a sumar <strong>28</strong> (sin contar algún apoyo mínimo que suelen obtener de <strong style="color: #68508b">La Libertad Avanza</strong>). La oposición acumula <strong>21</strong> bancas, dandole un margen de ventaja de <strong>7</strong> votos. Gracias a esta ventaja han podido aprobar distintas iniciativas, como la mencionada suspensión de las PASO.
</p>

<h3 class="px-10 py-10">Las bancas que se ponen en juego</h3>

<p class="px-10 pb-4">
    Recordemos que son 30 las bancas a las que se les está por vencer su mandato (de un total de 60). Si las reorganizamos un poco y dejamos a la izquierda todas aquellas que se tienen que renovar, obtenemos:
</p>


<div class="w-full">
    <ChamberDiagram partyResults={prevElection} affirmativeVotes={0} availableVoters={0} thresholdDhondt={0} showCounters={false} />
</div>
    
<p class="px-10 pb-4">
    Y ahora, quitémoslas:
</p>

<div class="w-full">
    <ChamberDiagram partyResults={onlyAlreadyOccupied} affirmativeVotes={0} availableVoters={0} thresholdDhondt={0} showCounters={false} />
</div>

<p class="px-10 pt-4">
    La oposición conserva solo <strong>11</strong> bancas, pero el oficialismo y sus aliados se le acercan, bajando hasta el piso de <strong>15</strong> bancas. Ahora la diferencia es de solo <strong>4</strong> votos.
</p>

<p class="px-10 pt-4">
    <em>Disclaimer:</em> Obviamente nada de todo esto impide que cualquiera de los legisladores haga algo totalmente contrario a lo analizado en las líneas previas. Y por lo tanto, esta diferencia se vuelva un poco irrelevante... Pero me parece una buena métrica para entender la gobernabilidad del <strong style="color: #facc15">PRO</strong> en la Ciudad, su bastión desde hace aproximadamente 18 años.
</p>

<p class="px-10 pt-4">
    <em>Nota:</em> Para las secciones siguientes (y para la vida) te puede resultar útil saber que:
</p>
<ul class="px-15 pt-4">
    <li>• La Legislatura de la Ciudad Autónoma de Buenos Aires es un órgano unicameral.</li>
    <li>• Se compone de 60 legisladores.</li>
    <li>• Los cargos electos comienzan a desempeñar sus funciones a partir del 10 de diciembre del año de la elección.</li>
    <li>• Los cargos se ejercen durante un período de cuatro años consecutivos.</li>
    <li>• En cada elección se renueva la mitad de la cámara, es decir 30 bancas. En los siguientes comicios se renueva la otra mitad.</li>
    <li>• La distribución de las bancas se realiza según el sistema <a href="https://es.wikipedia.org/wiki/Sistema_D%27Hondt" target="_blank" class="link link-accent">D'Hondt</a>.</li>
        <ul class="px-5">
            <li>• Se calcula el 3% del total de los votos válidos (incluidos los votos en blanco, no así los nulos). Este es el umbral que deben superar las listas para poder acceder al reparto de bancas.</li>
            <li>• Para cada lista que haya superado el umbral, se divide el total de sus propios votos válidos por todos los números del 1 al 30, que es el total de bancas disponibles. Por ejemplo si una lista obtuvo 100 votos, tendremos:</li>
            <div class="katex text-center flex justify-center py-3">{@html rendered}</div>
            <li>• Luego, si 10 de las 17 listas superan el umbral, obtendremos 10 × 30 = 300 <em>cocientes</em>, cada uno representando la posibilidad de una lista de obtener una de las bancas.</li>
            <li>• Seleccionamos los 30 cocientes mas grandes, que nos determinaran cuantas bancas obtiene cada lista. Por ejemplo, si 5 de los cocientes seleccionados provienen de la lista A, entonces la lista A tendrá 5 bancas.</li>
        </ul>
</ul>

<h3 class="px-10 py-10">¿Qué dicen las encuestas?</h3>

<p class="px-10 pb-4">
    En estas semanas se publicaron múltiples encuestas que intentaron dar luz a un escenario de mucha incertidumbre. No hay unanimidad sobre quién podría llegar a ser el ganador de la contienda, aunque todas concuerdan que el <strong style="color: #facc15">PRO</strong> (el oficialismo porteño) podría ser uno de los grandes derrotados, quedando relegado a un tercer lugar en la mayoría de ellas y bajando considerablemente su ventaja númerica frente a la oposición.
</p>

<p class="px-10 py-4">
    Traemos 9 de ellas, sin ningún orden en especial:
</p>
<ul class="px-15">
    <li><a href="#isasi-burdman" class="link link-accent">1) Isasi-Burdman</a></li>
    <li><a href="#proyeccion" class="link link-accent">2) Proyección</a></li>
    <li><a href="#circuitos" class="link link-accent">3) Circuitos</a></li>
    <li><a href="#cb-consultora" class="link link-accent">4) CB Consultora</a></li>
    <li><a href="#federico-gonzalez" class="link link-accent">5) Federico González y Asociados</a></li>
    <li><a href="#giacobbe" class="link link-accent">6) Giacobbe</a></li>
    <li><a href="#equipo-mide" class="link link-accent">7) Equipo Mide</a></li>
    <li><a href="#opinaia" class="link link-accent">8) Opinaia</a></li>
    <li><a href="#dc-consultores" class="link link-accent">9) DC Consultores</a></li>
</ul>

<h4 id="isasi-burdman" class="px-10 py-10">1) Isasi-Burdman</h4>

<p class="px-10 pb-4">
    La encuesta realizada por esta consultora nos da ganador a <strong style="color: #68508b">Manuel Adorni con 22%</strong> por <strong style="color: #68508b">La Libertad Avanza</strong>, seguido por <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong>. Podemos observar que se mantiene la ventaja del oficialismo del <strong style="color: #facc15">PRO</strong> con un ajustado margen de 3 votos a favor.
</p>

<p class="px-10 pb-4">
    Vale la pena mencionar que como para los candidatos por debajo del 2% la consultora no brindó información, hubo que tomar algunas suposiciones. Esto pasará para varias encuestas. Aquellos candidatos o listas de los que no hay historial reciente en elecciones anteriores para la Legislatura porteña, se les asignará porcentajes más bajos que el menor porcentaje informado. De los que sí hay datos previos, como del Nuevo Más y el Frente Patriota Federal, se tomará esos valores si es que cumplen con ser inferiores al menor porcentaje informado por la encuesta. Por ejemplo, en el presente caso, cada uno debe quedar por debajo del 2% obtenido por Lucille Levy, la candidata de menor porcentaje que es informada por la consultora.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://isasiburdman.com" target="_blank" class="link link-accent">
        Isasi / Burdman
    </a>
</p>

<figure class="order-2 md:order-2 w-full flex justify-center relative">
    <a href="https://isasiburdman.com" target="_blank">
    <img
        src="/images/articles/simulador-legislativas-caba-2025/isasi-burdman.png"
        alt="Las 17 listas que competirán en las elecciones legislativas de CABA en 2025"
        class="max-w-xs sm:max-w-md md:max-w-xl h-auto rounded-2xl"
    />
    </a>
    <div class="absolute bottom-2 right-13 md:right-90 bg-black bg-opacity-90 text-white text-xs px-2 py-1 rounded">
        Consultora Isasi / Burdman
    </div>
</figure>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={isasiBurdmanMetadata} />
</div>

<h4 id="proyeccion" class="px-10 py-10">2) Proyección</h4>

<p class="px-10 pb-4">
    En este caso, el ganador es  <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong> con un <strong style="color: #00b8ff">23.1%</strong>, y en segundo lugar queda <strong style="color: #68508b">Manuel Adorni</strong> con <strong style="color: #68508b">19.5%</strong> por <strong style="color: #68508b">La Libertad Avanza</strong>. El <strong style="color: #facc15">PRO</strong> volvería a salir tercero en esta encuesta, y además, perdería su ventaja aún sumando las bancas aliadas.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://www.tiempoar.com.ar/ta_article/encuesta-portena-santoro-lidera-adorni-y-lospennato-pelean-el-segundo-puesto/amp/" target="_blank" class="link link-accent">
        Tiempo Argentino
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={proyeccionMetadata} />
</div>

<h4 id="circuitos" class="px-10 py-10">3) Circuitos</h4>

<p class="px-10 pb-4">
    Según esta encuesta el ganador sería <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong> con un <strong style="color: #00b8ff">24.1%</strong>. Y esta vez en segundo lugar estaría <strong style="color: #facc15">Silvia Lospennato</strong> con <strong style="color: #facc15">19.7%</strong> por <strong style="color: #facc15">Buenos Aires Primero (PRO)</strong>. Al salir segundo esta vez, el <strong style="color: #facc15">oficialismo</strong> obtendría 7 bancas (una mas de las 6 que puso en juego) y mantendría una buena ventaja con un diferencial a su favor de 6 bancas (una menos de la que tiene actualmente).
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://circuitosconsultora.wordpress.com" target="_blank" class="link link-accent">
        Circuitos Consultora
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={circuitosMetadata} />
</div>

<h4 id="cb-consultora" class="px-10 py-10">4) CB Consultora</h4>

<p class="px-10 pb-4">
    Según esta encuesta el ganador sería <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong> con un <strong style="color: #00b8ff">28%</strong>. En segundo lugar vuelve a quedar <strong style="color: #68508b">Manuel Adorni</strong> con <strong style="color: #68508b">23.5%</strong> por <strong style="color: #68508b">La Libertad Avanza</strong>. El <strong style="color: #facc15">PRO</strong> alcanzaría apenas una ventaja de 2 bancas más a su favor, en comparación con la oposición.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://www.letrap.com.ar/politica/encuesta-leandro-santoro-sigue-primero-y-manuel-adorni-y-lospennato-pelean-palo-palo-el-segundo-lugar-n5415909" target="_blank" class="link link-accent">
        Letra P
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={cbConsultoraMetadata} />
</div>

<h4 id="federico-gonzalez" class="px-10 py-10">5) Federico González y Asociados</h4>

<p class="px-10 pb-4">
    En esta particular encuesta, el ganador volvería a ser <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong> con un <strong style="color: #00b8ff">31.1%</strong>. En segundo lugar estaría <strong style="color: #facc15">Silvia Lospennato</strong> con <strong style="color: #facc15">23.2%</strong> por <strong style="color: #facc15">Buenos Aires Primero (PRO)</strong>. A pesar de hacer una buena elección dado el contexto, el <strong style="color: #facc15">PRO</strong> finalizaría con una ventaja mínima, solo una banca por encima de la oposición.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://www.eldestapeweb.com/politica/elecciones-caba/la-ultima-encuesta-de-las-elecciones-en-caba-que-preocupa-al-gobierno--2025515223050" target="_blank" class="link link-accent">
        El Destape
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={federicoGonzalezMetadata} />
</div>

<h4 id="giacobbe" class="px-10 py-10">6) Giacobbe</h4>

<p class="px-10 pb-4">
    En esta encuesta el ganador volvería a ser <strong style="color: #68508b">Manuel Adorni</strong> con <strong style="color: #68508b">31.8%</strong> por <strong style="color: #68508b">La Libertad Avanza</strong>. Por su parte, <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong> le pisa los talones con un <strong style="color: #00b8ff">30.7%</strong>. Es uno de los peores escenarios para el <strong style="color: #facc15">Buenos Aires Primero (PRO)</strong>, que quedaría en desventaja frente a la oposición, con 2 bancas menos.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://la5pata.com/2025/05/15/giacobbe-y-asociados-informe-caba-mayo-2025-con-imagenes/" target="_blank" class="link link-accent">
        La Quinta Pata
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={giacobbeMetadata} />
</div>

<h4 id="equipo-mide" class="px-10 py-10">7) Equipo Mide</h4>

<p class="px-10 pb-4">
    En esta encuesta habría un empate entre <strong style="color: #68508b">Manuel Adorni</strong> con <strong style="color: #68508b">19%</strong> por <strong style="color: #68508b">La Libertad Avanza</strong> y <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong>. <strong style="color: #facc15">Buenos Aires Primero (PRO)</strong> recuperaría algo de ventaja, con 2 bancas por encima de la oposición.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://www.clarin.com/politica/dias-eleccion-ciudad-nueva-encuesta-sorprende-da-empate-25-25_0_FqzwqlUO1m.html?srsltid=AfmBOorwvJQ1KdG66sVoVqp0enN23oC9GG_fxHVMixCZ6VdmZMUdtot1" target="_blank" class="link link-accent">
        Clarín
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={equipoMideMetadata} />
</div>

<h4 id="opinaia" class="px-10 py-10">8) Opinaia</h4>

<p class="px-10 pb-4">
    Esta encuesta da por victorioso a <strong style="color: #68508b">Manuel Adorni</strong> con <strong style="color: #68508b">24%</strong> por <strong style="color: #68508b">La Libertad Avanza</strong>. <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong> esta vez queda en segundo lugar con <strong style="color: #00b8ff">21%</strong>. El <strong style="color: #facc15">oficialismo</strong> vuelve a obtener solo 2 bancas de ventaja.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://www.perfil.com/noticias/politica/elecciones-en-caba-cuales-son-las-encuestadoras-que-dan-ganador-a-manuel-adoni.phtml" target="_blank" class="link link-accent">
        Perfil
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={opinaiaMetadata} />
</div>

<h4 id="dc-consultores" class="px-10 py-10">9) DC Consultores</h4>

<p class="px-10 pb-4">
    En esta encuesta <strong style="color: #68508b">Manuel Adorni</strong> de <strong style="color: #68508b">La Libertad Avanza</strong> queda primero con <strong style="color: #68508b">29.3%</strong>. <strong style="color: #00b8ff">Leandro Santoro</strong> de <strong style="color: #00b8ff">Es Ahora Buenos Aires</strong> vuelve a quedar segundo con <strong style="color: #00b8ff">24.1%</strong>. El <strong style="color: #facc15">PRO</strong> saca una ventaja de 4 bancas a su favor.
</p>

<p class="px-10 pb-4">
    Fuente: 
    <a href="https://www.perfil.com/noticias/politica/elecciones-en-caba-cuales-son-las-encuestadoras-que-dan-ganador-a-manuel-adoni.phtml" target="_blank" class="link link-accent">
        Perfil
    </a>
</p>

<div class="w-full">
    <InteractiveChamberDiagram candidatesMetadata={dcConsultoresMetadata} />
</div>

<h3 class="px-10 py-10">¡Simulá tus propios escenarios!</h3>

<p class="px-10 pb-4">
    Ahora te proponemos experimentar un poco con el simulador. Podes asignar porcentajes a los distintos candidatos, no te preocupes, las barras deslizantes se actualizarán de acuerdo a lo que vayas ingresando para que los números cierren, al igual que los totalizadores del diagrama. El sistema D'Hondt se irá aplicando en vivo de acuerdo a tus modificaciones. En todo momento podrás visualizar cuál es el <em>umbral</em> a superar por los candidatos para poder pelear por una banca. Aquellos que no obtengan bancas o no superen el umbral, quedarán oscurecidos. Los que las obtengan, lo indicarán debajo de su barra correspondiente, en la esquina inferior derecha de la misma.
</p>

<p class="px-10 pb-4">
    Si estas visitando la web desde un celular, vas a encontrar todas las "barritas" disponibles deslizando para el costado, incluidas las que te permitirán agregar voto en blanco (afecta al umbral) o voto nulo (no afecta al umbral). A su vez, a la izquierda de los nombres de cada candidato podrás ver el ranking actualizandose, al igual que aparecerá el <em>emoji</em> 🎉 para indicar rápidamente quién es el ganador hasta el momento. También se irán calculando los bloques finales, cada uno con su respectiva cantidad de bancas. Finalmente, podrás observar como se actualiza la ventaja de la cantidad de bancas oficialistas y aliadas vs. opositoras.
</p>

<div class="w-full">
    <InteractiveChamberDiagram {candidatesMetadata} />
</div>

<p class="px-10 py-4">
    Muchas gracias por haber llegado hasta acá... no te olvides de lo más importante. Sea a quién sea, pero si sos de CABA, el domingo andá a ejercer tu derecho y votá.
</p>

<div class="py-10">
    <div class="skeleton h-100 w-full"></div>
    <p class="py-4 flex justify-end w-full">... Esperando los resultados finales</p>
</div>