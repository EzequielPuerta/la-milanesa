<script lang="ts">
  import LinesPlot from './components/LinesPlot.svelte';
  import VotesBoxPlot from './components/VotesBoxPlot.svelte';
  import VotesTreemapPlot from './components/VotesTreemapPlot.svelte';
  import StackedBarPlot from './components/StackedBarPlot.svelte';
  import GroupedBarPlot from './components/GroupedBarPlot.svelte';
  import MapPlot from './components/MapPlot.svelte';
  import ScatterPlot from './components/ScatterPlot.svelte';
  import votosBahiaBlancaUrl from './data/votos-bahia-blanca.csv?url';
  import porcentajesGanadoresPorICVBucketUrl from './data/porcentajes-ganadores-por-icv-bucket.csv?url'
  import totalVotosTop3PorICVBucketUrl from './data/total-votos-top-3-por-icv-bucket.csv?url'
  import dataEscuelasUrl from './data/data-escuelas.csv?url'
  import poligonosICVUrl from './data/poligonos_icv.json?url';
  import eleccionesPreviasUrl from './data/elecciones-previas.csv?url'
</script>

<div
    class="hero min-h-screen"
    style={`background-image: url('/images/heros/antiperonismo-y-bahia-blanca.jpg')`}
>
    <div class="hero-overlay"></div>
    <div class="hero-overlay"></div>
    <div class="hero-overlay"></div>
    <div class="hero-content text-neutral-content text-center">
        <div class="max-w-md lg:max-w-3xl">
            <h1 class="mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-base-content">
              Bahía Blanca y el antiperonismo
            </h1>

            <p class="mb-5 font-bold px-4 py-2 text-base-content rounded-lg inline-block">
                Una radiografía de las últimas elecciones de medio término con foco en el municipio bonaerense.
            </p>
            <p><strong>{new Date(2025, 8, 11).toLocaleDateString('es-AR')} - CABA, Argentina</strong></p>
            <div class="pt-6">
                {#each ["Política", "Elecciones", "SIG"] as tag}
                    <span class="badge badge-primary mx-3">{tag}</span>
                {/each}
            </div>
        </div>
    </div>
</div>

<div class="max-w-screen-xl mx-auto text-justify">
    <p class="px-10 pt-16 pb-4">
        <em>Disclaimer:</em> Si bien votar en determinada escuela no implica vivir dentro del mismo radio censal o próximo al mismo, en el presente artículo haremos la suposición que al menos para la gran mayoría de los casos es efectivamente así.
    </p>

    <p class="px-10 py-4">
        En los últimos días, después de las elecciones legislativas en la provincia de Buenos Aires, Bahía Blanca quedó en el centro de la conversación. No tanto por la magnitud de sus votos dentro del padrón provincial (a pesar de ser el partido mas importante de la Sexta Sección Electoral de PBA), sino porque fue uno de los pocos municipios donde ganó <em style="color: #68508b">La Libertad Avanza</em> y perdió el oficialismo provincial, <em style="color: #00b4f0">Fuerza Patria</em>, la alianza peronista encabezada por Kicillof. En redes sociales, sobre todo en Twitter, no tardaron en aparecer los comentarios: que los bahienses “se merecen” lo que les pase, que “son todos antiperonistas”, que no es lógico que voten a Milei cuando han sufrido en carne propia dos tormentas devastadoras en los últimos años, con víctimas fatales, barrios inundados, incontables pérdidas materiales y el Presidente no quiera brindarles una respuesta a la altura de la situación ni por cambio climático ni por la falta de obras públicas. Ese contraste, entre la experiencia reciente del desastre y el apoyo a un gobierno que niega o minimiza esos problemas, fue el terreno ideal para que germinen las preguntas: ¿es el bahiense promedio tan antiperonista como se ha instalado?, ¿realmente todo Bahía Blanca vota igual?
    </p>
    <p class="px-10 py-4 pb-16">
        Para empezar a responderlas, un buen punto de partida podría ser mirar el recorrido electoral reciente. Armemos una línea de tiempo con las elecciones mas recientes. Lo que se observa es que la preferencia por Milei no apareció de golpe: ya venía consolidándose desde hace tiempo. Y si sumamos que desde 2015 hasta 2023 la ciudad tuvo un intendente del prácticamente extinto <em style="color: #facc15">PRO</em>, la profundización hacia la derecha se entiende mejor.
    </p>

    <LinesPlot
        csvUrl={eleccionesPreviasUrl}
        title={'Evolución de elecciones previas'}
    />

    <div class="px-10 pt-16">
        <strong>Fuentes:</strong>
        <ul>
            <li>
                <a href="https://www.juntaelectoral.gba.gov.ar/mapa-estadisticas-historicas.php" target="_blank" class="link link-accent">Junta Electoral de la Provincia de Buenos Aires</a>
            </li>
            <li>
                Notas periodísticas de época.
            </li>
        </ul>
    </div>
    <p class="px-10 py-16">
        Pasemos ahora a una foto mas reciente, más precisamente del pasado 7 de septiembre. Si miramos el siguiente gráfico observaremos los porcentajes de los 15 partidos que compitieron en las elecciones legislativas provinciales dentro del Municipio de Bahía Blanca, y lo primero que salta a la vista es que <em style="color: #68508b">La Libertad Avanza</em> sacó el 46,41% y <em style="color: #00b4f0">Fuerza Patria</em> el 30,52%. Una diferencia muy amplia, similar en magnitud a la que se vió a nivel provincial, pero esta vez a favor del oficialismo nacional. El resto de las fuerzas quedaron muy lejos, todas por debajo del 10%. Así, a vuelo de pájaro, la narrativa de “Bahía es mileísta” parece sostenerse... pero todavía falta escarbar un poco más.
    </p>

    <VotesTreemapPlot
        csvUrl={votosBahiaBlancaUrl}
        title={'Porcentaje de votos por partido'}
    />

    <p class="px-10 py-16">
        Con los votos desagregados por mesa (y luego de un poco de <em>web scrapping</em> del <a href="https://resultados.eleccionesbonaerenses.gba.gob.ar/territorios/1/8/40" target="_blank" class="link link-accent">sitio oficial de resultados electorales bonaerenses</a>, descargado el 09/09/2025 a las 22:40 con un 99.05% del total escrutado) se abre otra capa interesante para analizar. Al graficar un <em>boxplot</em> con los porcentajes de cada partido en cada mesa, se nota enseguida que el resultado (si bien contundente sin lugar a dudas) no tuvo nada de homogéneo. <em style="color: #68508b">La Libertad Avanza</em> llegó a superar el 60% en algunas mesas, pero también estuvo por debajo del 30% en varias e incluso tuvo alguna sin un solo voto. <em style="color: #00b4f0">Fuerza Patria</em>, en cambio, nunca bajó del 15% y en una mesa superó el 60%. Esto nos dice que, detrás del promedio municipal (acorde al resultado final a nivel Bahía Blanca), hay realidades muy distintas: barrios donde Milei arrasó y barrios donde apenas cosechó apoyo ó directamente donde le soltaron la mano.
    </p>

    <VotesBoxPlot
        csvUrl={votosBahiaBlancaUrl}
        title={'Distribución de porcentajes de votos por mesa'}
    />

    <p class="px-10 pt-16 pb-8">
        Una hipótesis inmediata podría ser que el voto no está distribuido al azar y de manera equiprobable, sino que el mismo se relaciona de alguna manera con las condiciones socioeconómicas de cada zona. Para ponerlo en números, usaremos el <a href="https://icv.conicet.gov.ar" target="_blank" class="link link-accent">Índice de Calidad de Vida (ICV)</a> que elaboró el <strong>CONICET</strong>, circa 2010. En sus propias palabras, publicadas en la web:
    </p>
    <blockquote cite="https://icv.conicet.gov.ar" class="px-10 pb-16">
        «Es un mapa que permite conocer cuál es el índice de calidad de vida (ICV) en cualquier punto del país -esto es, para cada uno de los 52.408 radios censales en los que se divide la Argentina- utilizando una escala numérica que va del cero al diez.»
    </blockquote>

    <div class="w-full max-w-screen-xl mx-auto">
        <img 
            src="/images/articles/antiperonismo-y-bahia-blanca/icv-conicet.png" 
            alt="ICV Conicet"
            class="w-full h-auto object-contain shadow-md"
        />
    </div>

    <p class="px-10 pt-16 pb-8">
        Utilizando el <a href="https://www.argentina.gob.ar/educacion/evaluacion-e-informacion-educativa/padron-oficial-de-establecimientos-educativos" target="_blank" class="link link-accent">Padrón Oficial de Establecimientos Educativos</a>, un poco de <em>Google Maps</em> y paciencia, obtuvimos la ubicación de cada recinto. Luego cruzamos la ubicación de las escuelas que participaron de la elección provincial con los valores de ICV de los barrios a los cuales pertenecen y las agrupamos en cuatro franjas: desde los barrios más vulnerables (ICV 4-5) hasta los más acomodados (ICV 8-9). Cabe mencionar que en el municipio, el ICV de todos los radios censales se ubicó entre 4 y 9.
    </p>

    <p class="px-10 pb-16">
        Al mirar el siguiente gráfico de barras apiladas con los partidos ganadores en cada grupo, el patrón es notorio: mientras más alto el ICV del barrio donde se encuentra la escuela, más chances tiene <em style="color: #68508b">La Libertad Avanza</em> de ganar en ese establecimiento. De hecho, en los barrios de mayor calidad de vida, Milei ganó en absolutamente todas las escuelas.
    </p>

    <StackedBarPlot
        csvUrl={porcentajesGanadoresPorICVBucketUrl}
        title={'Porcentaje de escuelas ganadas por partido, agrupadas por intervalo ICV'}
    />

    <p class="px-10 py-16">
        Para reforzar, podemos también mirar la cantidad de votos en términos absolutos. En éste gráfico de barras agrupadas, con los cinco partidos más competitivos (son los únicos partidos que pudieron acceder al podio en al menos una escuela bahiense), se ve cómo a medida que el ICV aumenta, los votos nominales de <em style="color: #68508b">La Libertad Avanza</em> crecen de manera marcada, mientras que <em style="color: #00b4f0">Fuerza Patria</em> pierde competitividad. No solo es una cuestión de porcentajes, también de volumen.
    </p>

    <GroupedBarPlot
        csvUrl={totalVotosTop3PorICVBucketUrl}
        title="Votos de partidos más competitivos, según intervalo de ICV"
    />

    <p class="px-10 pt-16 pb-8">
        El mapa termina de contar la historia. Los radios censales se muestran coloreados según el ICV: rojo para valores bajos, verde para altos. Por encima de ellos, los puntos de las escuelas: el color muestra qué partido ganó allí, el tamaño cuántos votos sumó, y el borde indica la diferencia contra el segundo. Mientras más cerca del blanco, mas ajustada la victoria. Y en las antípodas, una victoria holgada se representa con bordes de un color similar al del centro del punto.
    </p>

    <p class="px-10 pb-16">
        Lo que se observa es que en el centro, donde el ICV es más alto, predominan los puntos violetas de Milei, grandes y con bordes firmes: victorias claras y con mucho caudal de votos. En la periferia aparecen tímidamente los puntos celestes del peronismo, en barrios con menor ICV, con mucho menos volumen y victorias más estrechas. Cualquier rastro de homogeneidad que podía haber persistido hasta ahora, desaparece.
    </p>

    <MapPlot
        csvUrl={dataEscuelasUrl}
        geojsonUrl={poligonosICVUrl}
        title="Índice de Calidad de Vida (ICV 2010) y Escuelas de Bahía Blanca involucradas en los comicios provinciales de 2025"
    />

    <p class="px-10 py-16">
        Para cerrar, el <em>scatter</em> que se presenta a continuación muestra el porcentaje de votos de las dos principales fuerzas en cada escuela en función del <strong>ICV 2010</strong>. Cada punto representa una escuela, y las líneas discontinuas son las regresiones lineales que indican la tendencia de los votos según la composición socioeconómica de la zona. Se vuelve a observar, ahora con mayor claridad, que <em style="color: #68508b">La Libertad Avanza</em> tiende a obtener mayores porcentajes en barrios con ICV más alto, mientras que <em style="color: #00b4f0">Fuerza Patria</em> logra mejores resultados en barrios con ICV más bajo.
    </p>

    <ScatterPlot
        csvUrl={dataEscuelasUrl}
        title="Votos vs. ICV 2010"
    />

    <p class="px-10 pt-16 pb-4">
        Lo que aparece en Bahía Blanca es, en definitiva, un caso donde prima notablemente un fuerte vínculo entre la afinidad ideológica, el territorio y las condiciones de vida de quienes los habitan. Nos permite ver esa topología de manera muy clara: el centro del municipio, acomodado con Milei; periferia vulnerable, con el peronismo. Algo que siguiendo con la heterogeneidad, no ha ocurrido en todos los partidos de la Provincia. Por un lado, municipios históricamente peronistas <a href="https://www.lanacion.com.ar/politica/resultados-en-la-matanza-quien-gano-en-el-partido-de-la-tercera-seccion-en-las-elecciones-2025-nid07092025/" target="_blank" class="link link-accent">no han incrementado de forma considerable su caudal de votos</a>. Por ejemplo, La Matanza tuvo -1.2% de diferencia contra las presidenciales del 2023 y por su parte, Lomas de Zamora creció solo 5.2% frente a los mismos comicios. Sin embargo, otras jurisdicciones de nivel socioeconómico medio como pueden ser Avellaneda o Pilar, incrementaron por encima del 10% el caudal de votos obtenidos por <em style="color: #00b4f0">Fuerza Patria</em> en comparación a las mismas votaciones del 2023.
    </p>
    
    <p class="px-10 py-4">
        Este contraste también dialoga con otro fenómeno de redes, pero desde la vereda contraria. Así como hubo usuarios que criticaron a los ciudadanos de Bahía Blanca por apoyar a Milei (pese a la desidia y abandono que sufrieron por parte del Gobierno Nacional frente a los temporales trágicos y la falta de obras), del lado libertario también abundaron los insultos hacia quienes votaron a <em style="color: #00b4f0">Fuerza Patria</em>: "pobres", "negros", "parásitos", "enfermos" que según su imaginario disfrutan de vivir entre calles de tierra, sin servicios e inseguros. Una imagen brutal y clasista que busca reducir un voto diverso a una simple caricatura de mal gusto. El problema con estos discursos es que si miramos el mapa electoral provincial, el voto peronista como mencionamos, también es heterogéneo: conviven votantes de barrios vulnerables con otros sectores de clase media consolidada; bastiones peronistas con municipios diversos de todo el ancho y largo de la Provincia. Pero la discusión pública ya no premia la complejidad y la profundidad en el análisis; sabemos que funciona mejor lo fácil, lo conciso, lo pasional y lo violento.
    </p>
    
    <p class="px-10 py-4">
        La paradoja se completa con otro detalle: mientras se acusa al votante peronista/kirchnerista/progresista de "querer" vivir en la precariedad, es justamente el gobierno de Milei el cual rechaza la obra pública como política de Estado. El cruce entre insultos y realidades sesgadas o ficticias deja al descubierto que la gran mayoría de las veces, la discusión política no se trata de qué se vota, por qué y para qué, sino de cómo se etiqueta al otro y que relato se construye alrededor de éste.
    </p>
    
    <p class="px-10 py-4 pb-16">
        Queda abierto, entonces, el interrogante hacia adelante: ¿qué ocurrirá en las próximas elecciones de medio término nacionales, previstas para el <strong>26 de octubre</strong>? ¿Se sostendrá la tendencia en Bahía Blanca?. El municipio sufrió el <a href="https://www.eldia.com/nota/2025-9-9-10-5-0-bahia-blanca-registro-un-record-de-ausentismo-en-las-elecciones-legislativas-2025-politica-y-economia" target="_blank" class="link link-accent">mayor ausentismo desde el 1983, alcanzando apenas el 60.45% de participación</a> (el récord anterior había sido registrado en el 2003 con el 70.22%). ¿Participarán los ausentes en las próximas elecciones nacionales? Y si lo hacen, ¿para qué lado se volcarán?. Precisamente, gran parte del ausentismo se explica con la baja participación observada en las escuelas de la periferia. De participar, ¿seguirán la tendencia que marcaron los territorios? Entre tanto ruido, sea como sea y para noticia de nadie, lo que muestran los datos es que el voto sigue teniendo muchísimo que ver con dónde se vive en comparación con lo que se discute en Twitter.
    </p>
</div>