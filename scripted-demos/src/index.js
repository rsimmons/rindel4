import * as runtime from 'rindel-runtime';
import programs from './programs';

const programListElem = document.getElementById('program-list');

let currentActivation;

const startProgram = (program) => {
  if (currentActivation) {
    currentActivation.destroy();
    currentActivation = null;
  }

  const closure = runtime.createRootUserClosure();
  program.run(closure.definition);
  currentActivation = closure.activate();
}

for (const prog of programs) {
  const anchorElem = document.createElement('a');
  anchorElem.textContent = prog.name;
  anchorElem.setAttribute('href', '#');
  (() => {
    anchorElem.addEventListener('click', (e) => {
      e.preventDefault();
      setTimeout(() => { // start program with delay so it doesn't get this click event
        startProgram(prog);
      }, 0);
    });
  })();

  const itemElem = document.createElement('li');
  itemElem.appendChild(anchorElem);

  programListElem.appendChild(itemElem);
}

startProgram(programs[0]);
