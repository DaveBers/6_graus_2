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
    const tree = {};

    movies.forEach(movie => {
      movie.cast.forEach(actor => {
        if (!tree[actor]) {
          tree[actor] = { actor, children: [] };
        }
        const actorNode = tree[actor];
        actorNode.children.push(movie);
      });
    });

    console.log(tree);
    return tree;
  } catch (error) {
    console.error('Erro ao construir a árvore de filmes:', error);
    return {};
  }
}

async function findShortestPath() {
  const actor1 = document.getElementById('actor1').value.trim();
  const actor2 = document.getElementById('actor2').value.trim();
  const maxDepth = null;

  if (actor1 === '' || actor2 === '') {
    alert('Por favor, insira o nome do ator de origem e do ator de destino.');
    return;
  }

  try {
    const tree = await buildGraph();

    const path = findPath(tree, actor1, actor2, maxDepth);
    let modalBodyContent = '';

    if (path.length > 0) {
      modalBodyContent = `<p>Caminho encontrado: ${path.join(' -> ')}</p>`;
    } else {
      modalBodyContent = '<p>Não foi encontrado um caminho entre os atores selecionados.</p>';
    }

    document.getElementById('result').innerHTML = modalBodyContent;
    document.getElementById('myModal').style.display = 'block';

    document.getElementById('actor1').value = '';
    document.getElementById('actor2').value = '';
  } catch (error) {
    console.error('Erro ao encontrar o caminho mínimo:', error);
  }
}

function findPath(tree, startActor, endActor, maxDepth) {
  const queue = [];
  const visited = new Set();
  const parent = {};

  queue.push(startActor);
  visited.add(startActor);

  while (queue.length > 0) {
    const currentActor = queue.shift();

    if (currentActor === endActor) {
      const path = [];
      let node = currentActor;
      while (node !== startActor) {
        path.unshift(node);
        node = parent[node];
      }
      path.unshift(startActor);
      return path;
    }

    const actorNode = tree[currentActor];
    if (actorNode && actorNode.children) {
      actorNode.children.forEach(movie => {
        movie.cast.forEach(actor => {
          if (!visited.has(actor)) {
            queue.push(actor);
            visited.add(actor);
            parent[actor] = currentActor;
          }
        });
      });
    }
  }

  return [];
}

function findPaths(tree, startActor, endActor, maxDepth) {
  const paths = [];
  let foundPaths = 0;

  function dfs(currentActor, path, depth, visited, moviesVisited) {
    if (depth > maxDepth || foundPaths >= 5) {
      return;
    }

    visited.add(currentActor);

    if (currentActor === endActor) {
      paths.push([...path, currentActor]);
      foundPaths++;
      return;
    }

    const actorNode = tree[currentActor];
    if (actorNode && actorNode.children) {
      actorNode.children.forEach(movie => {
        const actorsInMovie = movie.cast.filter(actor => path.includes(actor));
        if (actorsInMovie.length <= 2) {
          movie.cast.forEach(actor => {
            if (!visited.has(actor)) {
              dfs(actor, [...path, currentActor], depth + 1, new Set(visited), moviesVisited);
              visited.delete(actor);
            }
          });
        }
      });
    }
  }

  dfs(startActor, [], 0, new Set(), new Set());
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
    const tree = await buildGraph();
    let modalBodyContent = '';

    if (!tree[actor1] || !tree[actor2]) {
      modalBodyContent = '<p>Um ou ambos os atores não foram encontrados.</p>';
    } else {
      console.log(tree, actor1, actor2);
      const paths = findPaths(tree, actor1, actor2, 6);
      console.log(paths);

      if (paths.length > 0) {
        modalBodyContent = '<p>Caminhos encontrados:</p>';
        paths.forEach(path => {
          modalBodyContent += `<p>${path.join(' -> ')}</p>`;
        });
      } else {
        modalBodyContent = '<p>Não foi encontrado um caminho entre os atores selecionados com no máximo 6 atores.</p>';
      }
    }

    document.getElementById('result').innerHTML = modalBodyContent;
    document.getElementById('myModal').style.display = 'block';

    document.getElementById('actor1').value = '';
    document.getElementById('actor2').value = '';
  } catch (error) {
    console.error('Erro ao encontrar os caminhos:', error);
  }
}

function fecharModal() {
  document.getElementById('myModal').style.display = 'none';
}