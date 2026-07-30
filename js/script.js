// ===============================
// CONTROLE DE ABERTURA
// ===============================

let conteudoAberto = false;


// ===============================
// TESTE SEU CONHECIMENTO
// ===============================


let perguntaAtual = 0;

let pontosQuiz = 0;

let respondeu = false;



const perguntasQuiz = [


{
pergunta:

"Qual é o principal objetivo do NAPNE?",

alternativas:[

"Promover inclusão, acessibilidade e participação dos estudantes",

"Substituir o trabalho dos professores",

"Atender somente estudantes com deficiência física",

"Realizar apenas eventos"

],

resposta:0,

explicacao:

"O NAPNE promove ações voltadas ao acesso, permanência, participação e aprendizagem dos estudantes."
},



{

pergunta:

"É necessário ter laudo médico para procurar o NAPNE?",

alternativas:[

"Sim, sempre é obrigatório",

"Não, o estudante pode buscar acolhimento conforme suas necessidades",

"Somente professores podem solicitar",

"Apenas estudantes com deficiência podem procurar"

],

resposta:1,

explicacao:

"O laudo pode auxiliar em algumas situações, mas não é obrigatório para ser acolhido pelo NAPNE."
},



{

pergunta:

"O NAPNE pode auxiliar em:",

alternativas:[

"Acompanhamento pedagógico e estratégias de acessibilidade",

"Apenas eventos",

"Somente problemas administrativos",

"Somente atividades esportivas"

],

resposta:0,

explicacao:

"O núcleo realiza acolhimento, orientação, acompanhamento e construção de estratégias inclusivas."
},



{

pergunta:

"O que significa inclusão?",

alternativas:[

"Garantir participação e aprendizagem para todos",

"Diminuir as exigências acadêmicas",

"Separar estudantes por diagnóstico",

"Oferecer apoio somente para alguns"

],

resposta:0,

explicacao:

"Inclusão significa criar condições para que todos possam participar e aprender."
},



{

pergunta:

"O Desenho Universal para Aprendizagem busca:",

alternativas:[

"Criar diferentes formas de ensinar e aprender",

"Eliminar conteúdos",

"Separar estudantes",

"Substituir professores"

],

resposta:0,

explicacao:

"O DUA considera diferentes formas de apresentar conteúdos, participar e demonstrar conhecimentos."
}


];




// ===============================
// ABRIR QUIZ
// ===============================


function abrirQuiz(){


if(conteudoAberto){


document.getElementById("conteudo").style.display="none";

conteudoAberto=false;

return;


}


perguntaAtual=0;

pontosQuiz=0;


document.getElementById("conteudo").style.display="block";


document.getElementById("titulo").innerHTML=
"🧠 Teste seu conhecimento";


mostrarPergunta();


conteudoAberto=true;


}





function mostrarPergunta(){


respondeu=false;


let pergunta=perguntasQuiz[perguntaAtual];


document.getElementById("feedback").innerHTML="";


document.getElementById("botao-proxima").style.display="none";



document.getElementById("conteudo-dinamico").innerHTML=`


<div class="quiz-card">


<h4>
Pergunta ${perguntaAtual+1} de ${perguntasQuiz.length}
</h4>


<h3>
${pergunta.pergunta}
</h3>


<div class="opcoes">


${pergunta.alternativas.map((a,index)=>`


<button onclick="responderQuiz(${index})">

${a}

</button>


`).join("")}


</div>


<p>

Pontuação:
${pontosQuiz}/${perguntasQuiz.length}

</p>


</div>


`;



}



function responderQuiz(resposta){


if(respondeu){

return;

}


respondeu=true;



if(resposta===perguntasQuiz[perguntaAtual].resposta){


pontosQuiz++;


document.getElementById("feedback").innerHTML=`

<div class="correto">

✅ Resposta correta!

<br><br>

${perguntasQuiz[perguntaAtual].explicacao}

</div>

`;



}else{


document.getElementById("feedback").innerHTML=`

<div class="incorreto">

❌ Resposta incorreta.

<br><br>

${perguntasQuiz[perguntaAtual].explicacao}

</div>

`;

}



document.querySelectorAll(".opcoes button").forEach(botao=>{

botao.disabled=true;

});



document.getElementById("botao-proxima").style.display="block";


}
// ===============================
// VOCÊ SABIA?
// ===============================


function abrirCuriosidades(){



if(conteudoAberto){


document.getElementById("conteudo").style.display="none";


conteudoAberto=false;


return;


}




document.getElementById("conteudo").style.display="block";



document.getElementById("titulo").innerHTML=

"💡 Você sabia?";




document.getElementById("conteudo-dinamico").innerHTML=`



<div class="curiosidade-card">


<h3>

🧩 Você não precisa ter laudo para procurar o NAPNE

</h3>


<p>

O estudante pode buscar acolhimento e orientação conforme suas necessidades educacionais.
O laudo pode auxiliar em algumas situações, mas não é obrigatório.

</p>


</div>





<div class="curiosidade-card">


<h3>

🤝 O NAPNE é para todos

</h3>


<p>

O núcleo não atende somente estudantes com deficiência.
Também acompanha diferentes necessidades educacionais específicas.

</p>


</div>






<div class="curiosidade-card">


<h3>

♿ Acessibilidade vai além do espaço físico

</h3>


<p>

A acessibilidade envolve estratégias pedagógicas,
tecnologias assistivas, comunicação acessível e diferentes formas de aprender.

</p>


</div>






<div class="curiosidade-card">


<h3>

🌱 Igualdade e equidade são diferentes

</h3>


<p>

A igualdade oferece os mesmos direitos.
A equidade considera as necessidades de cada pessoa
para garantir oportunidades.

</p>


</div>






<div class="curiosidade-card">


<h3>

📚 Inclusão é responsabilidade de todos

</h3>


<p>

Estudantes, professores, famílias e servidores participam
da construção de um ambiente mais inclusivo.

</p>


</div>



`;



conteudoAberto=true;


}









// ===============================
// MITOS E VERDADES
// ===============================



let mitoAtual=0;

let pontosMitos=0;



const perguntasMitos=[



{

frase:

"Só estudantes com laudo podem procurar o NAPNE.",


resposta:

"Mito",


explicacao:

"O laudo não é obrigatório para buscar acolhimento e orientação."

},




{

frase:

"O NAPNE atende apenas estudantes com deficiência.",


resposta:

"Mito",


explicacao:

"O núcleo acompanha diferentes necessidades educacionais específicas."

},




{

frase:

"Inclusão significa diminuir o nível de exigência dos estudantes.",


resposta:

"Mito",


explicacao:

"A inclusão garante acessibilidade e oportunidades de aprendizagem."

},




{

frase:

"A tecnologia assistiva pode auxiliar estudantes com diferentes necessidades.",


resposta:

"Verdade",


explicacao:

"Recursos assistivos podem favorecer autonomia, comunicação e aprendizagem."

},




{

frase:

"A inclusão é responsabilidade de toda comunidade acadêmica.",


resposta:

"Verdade",


explicacao:

"Todos participam da construção de um ambiente inclusivo."

}



];








function abrirMitos(){



if(conteudoAberto){


document.getElementById("conteudo").style.display="none";


conteudoAberto=false;


return;


}



mitoAtual=0;

pontosMitos=0;



document.getElementById("conteudo").style.display="block";



document.getElementById("titulo").innerHTML=

"❓ Mitos e Verdades";



mostrarMito();



conteudoAberto=true;


}






function mostrarMito(){



let mito=perguntasMitos[mitoAtual];



document.getElementById("conteudo-dinamico").innerHTML=`



<div class="mito-card">


<h3>

${mito.frase}

</h3>



<button onclick="responderMito('Mito')">

Mito

</button>



<button onclick="responderMito('Verdade')">

Verdade

</button>




<p>

Pontuação:
${pontosMitos}/${perguntasMitos.length}

</p>


</div>



`;



}
// ===============================
// RESPONDER MITOS E VERDADES
// ===============================


function responderMito(resposta){



let mito=perguntasMitos[mitoAtual];




if(resposta===mito.resposta){


pontosMitos++;


document.getElementById("feedback").innerHTML=`


<div class="correto">


✅ Correto!


<br><br>


${mito.explicacao}


</div>


`;



}else{



document.getElementById("feedback").innerHTML=`


<div class="incorreto">


❌ Incorreto!


<br><br>


${mito.explicacao}


</div>


`;



}



document.getElementById("botao-proxima").style.display="block";




document.getElementById("botao-proxima").onclick=function(){



mitoAtual++;




if(mitoAtual < perguntasMitos.length){



mostrarMito();



}else{



document.getElementById("conteudo-dinamico").innerHTML=`



<div class="resultado">


<h2>

🎉 Resultado final

</h2>



<p>

Você acertou ${pontosMitos}
de ${perguntasMitos.length}!

</p>


</div>



`;



document.getElementById("feedback").innerHTML="";


document.getElementById("botao-proxima").style.display="none";



}



};



}








// ===============================
// PRÓXIMA PERGUNTA DO QUIZ
// ===============================



document.getElementById("botao-proxima").onclick=function(){


if(perguntaAtual < perguntasQuiz.length-1){



perguntaAtual++;



mostrarPergunta();



}else{



document.getElementById("conteudo-dinamico").innerHTML=`



<div class="resultado">


<h2>

🎉 Resultado final

</h2>



<p>

Você acertou ${pontosQuiz}
de ${perguntasQuiz.length} perguntas!

</p>



</div>



`;



document.getElementById("feedback").innerHTML="";


document.getElementById("botao-proxima").style.display="none";



}



};