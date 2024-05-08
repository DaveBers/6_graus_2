async function fetchMoviesData() {
  try {
    const response = await fetch('latest_movies.json');
    const movies = await response.json();
    return movies;
  } catch (error) {
    console.error('Erro ao carregar dados dos filmes:', error);
    return [];
  }
}

async function buildGraph() {
  try {
    const movies = await fetchMoviesData();
    const trees = [];

    movies.forEach(movie => {
      const root = { title: movie.title, actor: movie.cast[0], left: null, right: null };

      movie.cast.slice(1).forEach(actor => {
        insertActor(root, actor);
      });

      trees.push(root);
    });

    console.log('Árvores geradas:', trees); // Mostra no console a arvore

    return trees;
  } catch (error) {
    console.error('Erro ao construir as árvores:', error);
    return [];
  }
}


function insertActor(node, actor) {
  if (!node.left) {
    node.left = { actor, left: null, right: null };
  } else if (!node.right) {
    node.right = { actor, left: null, right: null };
  } else {
    if (Math.random() < 0.5) {
      insertActor(node.left, actor);
    } else {
      insertActor(node.right, actor);
    }
  }
}

async function findShortestPath() {
  const actor1 = document.getElementById('actor1').value.trim();
  const actor2 = document.getElementById('actor2').value.trim();

  if (actor1 === '' || actor2 === '') {
    alert('Por favor, insira o nome do ator de origem e do ator de destino.');
    return;
  }

  try {
    const trees = await buildGraph();
    let modalBodyContent = '';
    
    let sameTree = false;
    let treeIndex = -1;
    
    trees.forEach((root, index) => {
      if (findActor(root, actor1) && findActor(root, actor2)) {
        sameTree = true;
        treeIndex = index;
      }
    });

    if (!sameTree) {
      modalBodyContent = '<p>Os atores não estão no mesmo filme.</p>';
    } else {
      const paths = bfs(trees[treeIndex], actor1, actor2);
      
      if (paths.length > 0) {
        modalBodyContent = '<p>Caminhos encontrados:</p>';
        paths.forEach(path => {
          modalBodyContent += `<p>${path.join(' -> ')}</p>`;
        });
      } else {
        modalBodyContent = '<p>Não foi encontrado um caminho entre os atores selecionados.</p>';
      }
    }

    document.getElementById('result').innerHTML = modalBodyContent;
    document.getElementById('myModal').style.display = 'block';
  } catch (error) {
    console.error('Erro ao encontrar o caminho mínimo:', error);
  }
}

function findActor(node, actor) {
  if (!node) return false;
  if (node.actor === actor) return true;
  return findActor(node.left, actor) || findActor(node.right, actor);
}

function bfs(root, startActor, endActor) {
  const queue = [[root, [startActor], new Set([startActor])]]; 
  const paths = [];

  while (queue.length > 0) {
    const [node, path, visited] = queue.shift();

    if (node.actor === endActor) {
      paths.push(path.slice());
      continue; // Olha outros caminhos
    }

    console.log('path: ', path);
    console.log('paths: ', paths);

    // Verifica/adiciona o nó na fila
    if (node.left && !visited.has(node.left.actor)) {
      const newPath = [...path, node.left.actor];
      const newVisited = new Set(visited); // Cria copia do conjunto de nos visitador(esquerda)
      newVisited.add(node.left.actor);
      queue.push([node.left, newPath, newVisited]);
    }

    console.log('paths left: ', paths);

    if (node.right && !visited.has(node.right.actor)) {
      const newPath = [...path, node.right.actor];
      const newVisited = new Set(visited); // Cria copia dos nos visitados(direita)
      newVisited.add(node.right.actor);
      queue.push([node.right, newPath, newVisited]);
    }

    console.log('path right: ', path);
  }

  console.log(paths);

  return paths;
}

async function findSixDegreesOfSeparation() {
  const actor1 = document.getElementById('actor1').value.trim();
  const actor2 = document.getElementById('actor2').value.trim();

  if (actor1 === '' || actor2 === '') {
    alert('Por favor, insira o nome do ator de origem e do ator de destino.');
    return;
  }

  try {
    const trees = await buildGraph();
    let modalBodyContent = '';

    let sameTree = false;
    let treeIndex = -1;
    
    trees.forEach((root, index) => {
      if (findActor(root, actor1) && findActor(root, actor2)) {
        sameTree = true;
        treeIndex = index;
      }
    });

    if (!sameTree) {
      modalBodyContent = '<p>Os atores não estão no mesmo filme.</p>';
    } else {
      const paths = bfs(trees[treeIndex], actor1, actor2);
      
      if (paths.length > 0) {
        modalBodyContent = '<p>Caminhos encontrados:</p>';
        paths.slice(0, 6).forEach(path => { // limita 6 caminhos
          modalBodyContent += `<p>${path.join(' -> ')}</p>`;
        });
      } else {
        modalBodyContent = '<p>Não foi encontrado um caminho entre os atores selecionados.</p>';
      }
    }

    document.getElementById('result').innerHTML = modalBodyContent;
    document.getElementById('myModal').style.display = 'block';
  } catch (error) {
    console.error('Erro ao encontrar o caminho mínimo:', error);
  }
}

function fecharModal() {
  document.getElementById('myModal').style.display = 'none';
}