<script lang="ts">
  import Article from '$components/Article.svelte';
  import HighlightedParagraph from '$components/HighlightedParagraph.svelte';
  import SurveyGate from './components/SurveyGate.svelte';
  import ParliamentaryBlocsAndPartiesTable from './components/ParliamentaryBlocsAndPartiesTable.svelte';
  import TimelineGraph from './components/TimelineGraph.svelte';
  import PartyPercentageLinesPlot from './components/PartyPercentageLinesPlot.svelte';
  import LegislatorPercentageLinesPlot from './components/LegislatorPercentageLinesPlot.svelte';
</script>

<SurveyGate />
<Article slug="hacerle-el-juego-a-la-derecha">
    <HighlightedParagraph title="Disclaimer:" color="warning">
        <div tabindex="0" class="collapse collapse-arrow bg-base-100 border-base-300 border">
            <div class="collapse-title font-semibold bg-primary text-primary-content">Metodología</div>
            <div class="collapse-content text-sm mt-4">
                El objetivo del ejercicio anterior era introducir de manera "simple e intuitiva" la idea de <em>similitud</em> entre dos legisladores. Dado un intervalo de tiempo, se obtienen todas las votaciones realizadas durante el mismo. Digamos que son 20, como en nuestro ejemplo. Luego nos centramos en un legislador (en el ejemplo eras vos) y por cada una de las votaciones seleccionadas, comparamos el voto del legislador en cuestión (el tuyo) frente al de los restantes, de manera ordenada y reproducible (por ejemplo, por orden alfabético).
                <br/><br/>
                Entonces por cada votación tendremos una lista de 0 (ceros) y 1 (unos), donde un 0 en la posición iésima representa que el legislador iésimo votó de manera distinta. Por el contrario, un 1 significa que votaron igual. Dicha lista tendrá 257 elementos como mínimo, ya que hay 257 legisladores en la Cámara de Diputados de la Nación, pero pueden haber renuncias y fallecimientos durante el intervalo, provocando que asuman nuevos legisladores.
                <br/><br/>
                Si esto lo repetimos para cada votación, tendremos una serie de listas, todas del mismo largo, ordenadas de igual forma y compuestas solo por ceros y unos. Si sumamos todas las listas (en nuestro ejemplo serían 20 listas), posición a posición, tendremos la cantidad de votos similares entre nuestro legislador estrella y los demás, en el intervalo de tiempo definido.
                <br/><br/>
                ¿Y si repitieramos el proceso, esta vez centrandonos en cada uno de los legisladores restantes? Entonces obtendríamos 257 listas de 257 posiciones, una por cada legislador. Si las juntamos podríamos armar lo que se conoce como matriz cuadrada. Una matriz por cada votación, por lo tanto serían 20 matrices. Si las sumamos posición a posición, tendremos una manera para rápidamente conocer la cantidad de votos similares entre dos legisladores cualesquiera. Finalmente, si dividimos cada posición de ésta última matriz por la cantidad total de votaciones consideradas (es decir 20 en nuestro caso), tendremos la <em>razón de similitud</em> entre cualquier par de legisladores.
            </div>
        </div>
        
    </HighlightedParagraph>
    
    <p class="px-10 py-4">
        Varios meses atrás Javier Milei empezó a calificar de <em>"héroes"</em> a aquellos diputados que apoyaron las medidas oficialistas de turno, por lo general, blindando los vetos cometidos por el Ejecutivo contra múltiples leyes de diversa índole. Éstos legisladores (un poco más de 80 individuos) provenían de diferentes bloques, no todos eran libertarios de pura cepa; pero aún así no dudaron en actuar a favor del gobierno.
    </p>
    <p class="px-10 py-4">
        Es esperable que no hayan sido las únicas veces que votaron en conjunto, por lo que si calculamos la <em>similitud</em> (utilizando como fuente la web de <a class="text-primary" href="https://votaciones.hcdn.gob.ar" target="_blank">Diputados</a>) entre cada uno de estos <em>héroes con peluca</em> y alguna contraparte dentro del bloque de <em style="color: #68508b">La Libertad Avanza</em>, probablemente sea muy elevada. Pero en ésta situación no nos interesa particularmente compararlos contra un libertario específico, sino contra todo el bloque de <em style="color: #68508b">La Libertad Avanza</em> en sí. Es por eso que tenemos que obtener primero la tendencia mayoritaria del bloque oficialista.
    </p>
    <p class="px-10 py-4">
        Acá se nos presenta un inconveniente. Si observan la fuente mencionada, los votos de los diputados informan el bloque parlamentario al cual pertenecen, pero los mismos no tienen una relación clara con el partido mediante el cuál lograron entrar al Congreso. Hay muchos bloques que mencionan el nombre del partido político de origen del legislador, pero en realidad ingresaron mediante una alianza o coalición. Hay nombres que representan a bloques creados luego de divisiones de las bancadas legislativas, y a su vez, otros nombres que representan a agrupamientos de bloques parlamentarios previos... en fín, los bloques parlamentarios son una foto del clima político de la Cámara Baja, pero representan poco o nada de aquella lista por la cual accedieron a sus bancas.
    </p>

    <p class="px-10 pt-4 pb-16">
        Por lo tanto esa es la clave, obtener el nombre del partido con el cuál se presentaron a las elecciones y mediante el cuál ganaron su lugar en el Congreso. Esta información la podemos obtener de la web de la <a class="text-primary" href="https://www.electoral.gob.ar/nuevo/index.php" target="_blank">Cámara Nacional Electoral</a>. Allí conoceremos a todos los candidatos y podremos saber en que lista electoral figuraron.
    </p>

    <ParliamentaryBlocsAndPartiesTable />

    <p class="px-10 pt-16 pb-4">
        Ya conociendo el partido político mediante el cúal accedió a su banca cada legislador, podemos calcular cual es el voto mayoritario por cada partido y para cada votación, en particular el del oficialismo. Sabiendo esto, podemos comparar la similitud de cualquier legislador frente a la mayoría de cualquier partido. Y a su vez, esto nos permite poder calcular la similitud entre partidos, utilizando la mayoría de cada uno.
    </p>

    <p class="px-10 pt-4 pb-16">
        En el siguiente gráfico se ve la evolución de la similitud de cada mayoría partidaria vs. la mayoría oficialista. En principio se visualizan los partidos más relevantes pero se pueden revelar otros partidos haciendo <em>click</em> en la leyenda correspondiente. Algunos puntos interesantes del gráfico son como <strong style="color: #facc15">Juntos Por El Cambio</strong> paulatinamente se diferencia más del oficialismo, a su vez como el oficialismo sufre una sangría cada vez mayor y pierde legisladores propios que conforman otros bloques parlamentarios y terminan votando en contra del voto mayoritario de <em style="color: #68508b">La Libertad Avanza</em>. También como <strong style="color: #48b8ea">Unión Por La Patria</strong> presenta una similitud mayor al principio de la serie, con un máximo de similitud promediando el año 2024, para terminar en niveles bajos, mucho mas parecidos a los del <strong style="color: #fa1c1f">Frente de Izquierda</strong>. Dicho pico se corresponde con el blindaje de los primeros vetos de Milei en la Cámara.
    </p>

    <PartyPercentageLinesPlot
        title='Porcentaje de similitud con el voto oficialista mayoritario (por partido)'
        metric='colaboracionismo'
    />

    <p class="px-10 py-16">
        Otra métrica interesante podría ser que tan <em>"satisfechos"</em> se quedan con el resultado de las votaciones, donde consideramos que un porcentaje alto de satisfacción representa bastante semejanza del voto propio para con el resultado de cada votación. Es interesante como las curvas del <strong style="color: #fa1c1f">Frente de Izquierda</strong> y de <strong style="color: #48b8ea">Unión Por La Patria</strong> son tan similares. Evidentemente efectuaron muchas votaciones en el mismo sentido. Lo mismo ocurre con <em style="color: #68508b">La Libertad Avanza</em> y <strong style="color: #facc15">Juntos Por El Cambio</strong>, aunque las variaciones del partido oficialista son considerablemente más bruscas.
    </p>

    <PartyPercentageLinesPlot
        title='Porcentaje de satisfacción con el resultado de la votación (por partido)'
        metric='satisfaccion'
    />

    <p class="px-10 py-16">
        Dado que hablamos de las divisiones de los bloques parlamentarios y como eso explica la diferencia en los votos dentro de un mismo partido, sería interesante graficar el nivel de homogeneidad del voto partidario. Es notorio el nivel de homogeneidad del <strong style="color: #fa1c1f">Frente de Izquierda</strong>. Los demás partidos observamos que fluctúan, incluído <em style="color: #68508b">La Libertad Avanza</em> que como mencionamos, al finalizar la serie, baja considerable sus niveles de similitud intrabloque.
    </p>

    <PartyPercentageLinesPlot
        title='Porcentaje de homogeneidad entre los votos del mismo partido'
        metric='homogeneidad'
    />

    <p class="px-10 py-16">
        Otra cosa interesante sería analizar los niveles de ausentismo por partido, ya que en los escenarios previos cambia bastante utilizar una estrategia u otra, por lo tanto es bueno tener noción de este dato.
    </p>

    <PartyPercentageLinesPlot
        title='Porcentaje de ausentismo por partido'
        metric='ausentismo'
        enableModeSelection={false}
        selectedMode='ausencias'
    />

    <p class="px-10 py-16">
        Si ahora desagregamos las series y observamos la similitud individual de cada legislador frente al voto mayoritario del oficialismo, resulta evidente lo que mencionamos. Legisladores libertarios como Zago, Arrieta y Pagano comienza a votar muy diferente a lo que vota la mayoría de su partido original, en particular desde enero o febrero del 2025.
    </p>

    <LegislatorPercentageLinesPlot
        title='Porcentaje de similitud con el voto oficialista mayoritario (La Libertad Avanza)'
        metric='colaboracionismo'
        selectedLegislators={[
            "Lilia Adela Bolukalo Lemoine",
            "José Luis Espert",
            "Lourdes Micaela Arrieta",
            "Alberto “Bertie” Tiburcio Benegas Lynch",
            "Carolina Rosana Piparo",
            "Marcela Marina Pagano",
            "Maria Lorena Villaverde",
            "Oscar Roberto Zago",
        ]}
    />

    <p class="px-10 py-16">
        Para el caso de <strong style="color: #facc15">Juntos Por El Cambio</strong> observamos un comportamiento muy desigual entre algunos de sus diputados. Esto se vislumbraba en el gráfico de homogeneidad, donde la ya extinta coalición macrista mostró niveles mucho mas bajos que los del oficialismo. Como nota color, se agregó la serie de similitud de Florencio Randazzo, peronista no kirchnerista que votó la Ley Bases y tuvo al principio de esta era una etapa colaboracionista con el gobierno que se aprecia claramente en el gráfico. No caben dudas que a todos ellos les queda bien lo de "hacerle el juego..."
    </p>

    <LegislatorPercentageLinesPlot
        title='Porcentaje de similitud con el voto oficialista mayoritario (Juntos por el Cambio + Hacemos por Nuestro País)'
        metric='colaboracionismo'
        selectedLegislators={[
            "Martin Alberto Tetaz",
            "Facundo Manes",
            "Margarita Rosa Stolbizer",
            "Miguel Angel Pichetto",
            "Nicolás María Massot",
            "Cristian Adrian Ritondo",
            "Diego Cesar Santilli",
            "Fernando Adolfo Iglesias",
            "Maria Eugenia Vidal",
            "Silvia Gabriela Lospennato",
            "Rodrigo De Loredo",
            "Florencio Randazzo",
        ]}
    />

    <p class="px-10 py-16">
        En <strong style="color: #48b8ea">Unión Por La Patria</strong> los legisladores no se escapan de lo mismo. Hay mucha variabilidad entre los votos de algunos legisladores, muchos de ellos en sintonía con el gobierno. Es lo que se observa en el siguiente gráfico. Se muestran los diputados peronistas de provincias tales como Salta, Tucumán, Misiones, etc, quienes han sido denominados como <em>héroes</em> y efectivamente entendemos el motivo. Claramente hay muchos otros legisladores que votan distinto al oficialismo (y muy parecido al voto del <strong style="color: #fa1c1f">Frente de Izquierda</strong>), pero no deja de ser un porcentaje considerable de legisladores los que han otorgado apoyo al gobierno nacional, aún proveniendo de listas peronistas.
    </p>

    <LegislatorPercentageLinesPlot
        title='Porcentaje de similitud con el voto oficialista mayoritario (Unión por la Patria)'
        metric='colaboracionismo'
        selectedLegislators={[
            "Pamela Calletti",
            "Pablo Ismael Outes",
            "Yolanda Graciela Vega",
            "\"Colo\" Vancsik Daniel A.",
            "Arrua Pedro Alberto",
            "Carlos Alberto Fernandez",
            "Ruiz Yamila Lisette",
            "Agustin Fernandez",
            "Elia Mansilla",
            "Gladys Medina",
            "Walberto E. Allende",
            "Guillermo Snopek",
        ]}
    />

    <p class="px-10 py-16">
        Finalmente, los legisladores del <strong style="color: #fa1c1f">Frente de Izquierda</strong> muestran un nivel de similitud muy bajo para con el voto oficialista mayoritario. Claramente, al menos en cuanto a la actividad parlamentaria, son de los que están mas alejados del oficialismo de derecha.
    </p>

    <LegislatorPercentageLinesPlot
        title='Porcentaje de similitud con el voto oficialista mayoritario (Frente de Izquierda y de Trabajadores-Unidad)'
        metric='colaboracionismo'
        selectedLegislators={[
            "Nicolas Del Caño",
            "Christian Carlos Hernan Castillo",
            "Alejandro Ariel Vilca",
            "Vanina Natalia Biasi",
            "Vilma Ripoll",
            "Mercedes De Mendieta",
            "Juan Carlos Giordano",
            "Monica Leticia Schlotthauer",
            "Romina Del Pla",
            "Myriam Teresa Bregman",
        ]}
    />

    <HighlightedParagraph title="Bonus Track:" color="success">
        En el siguiente diagrama vemos de manera bien gráfica la similitud entre legisladores. Las líneas (ó aristas) que conectan a los legisladores (ó nodos) representan el nivel de similitud. A mayor similitud, mas cortos los vínculos y viceversa. Por lo tanto los legisladores que votan muy similar forman agrupamientos llamados <em>clústers</em>, dado que sus líneas son muy cortas. Es interesante ver como los distintos legisladores se van reorganizando en cuanto a sus similitudes conforme pasa el tiempo. Para poder observar las relaciones en otros intervalos de tiempo simplemente seleccione la fecha deseada.
    </HighlightedParagraph>

    <TimelineGraph />
 </Article>