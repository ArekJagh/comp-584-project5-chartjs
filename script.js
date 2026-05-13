const API_KEY = '037de380-d611-4a3d-884d-c0d549fd59dd';
const BASE    = 'https://api.balldontlie.io/v1';

const playerInput = document.getElementById('playerInput');
const searchBtn   = document.getElementById('searchBtn');
const errorMsg    = document.getElementById('error-msg');
const loading     = document.getElementById('loading');
const results     = document.getElementById('results');

// ── Intro animations ──
anime({ targets: '.logo, .title, .subtitle', translateY: [-30, 0], opacity: [0, 1], duration: 900, easing: 'easeOutExpo', delay: anime.stagger(120) });
anime({ targets: '.search-bar',              translateY: [20, 0],  opacity: [0, 1], duration: 800, easing: 'easeOutExpo', delay: 400 });
anime({ targets: '.line',   scaleY: [0, 1], duration: 1200, easing: 'easeOutExpo', delay: anime.stagger(200) });
anime({ targets: '.circle-bg', scale: [0, 1], opacity: [0, 1], duration: 1400, easing: 'easeOutExpo' });

searchBtn.addEventListener('click', searchPlayer);
playerInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') searchPlayer(); });

async function searchPlayer() {
  var query = playerInput.value.trim();
  if (!query) return;

  errorMsg.classList.add('hidden');
  results.innerHTML = '';
  loading.classList.remove('hidden');

  try {
    // 1. Search players
    var pRes = await fetch(BASE + '/players?search=' + encodeURIComponent(query) + '&per_page=5', {
      headers: { 'Authorization': API_KEY }
    });
    var pData = await pRes.json();

    if (!pRes.ok || !pData.data || pData.data.length === 0) throw new Error('No players found');

    // 2. For each player fetch their recent game stats (season 2023 = 2023-24)
    var players = pData.data;
    var statsPromises = players.map(function(p) {
      return fetch(BASE + '/stats?player_ids[]=' + p.id + '&seasons[]=2023&per_page=8', {
        headers: { 'Authorization': API_KEY }
      }).then(function(r) { return r.json(); }).catch(function() { return { data: [] }; });
    });

    var statsResults = await Promise.all(statsPromises);
    loading.classList.add('hidden');
    renderAll(players, statsResults);

  } catch(err) {
    console.error(err);
    loading.classList.add('hidden');
    showError();
  }
}

function renderAll(players, statsResults) {
  players.forEach(function(player, i) {
    var games = (statsResults[i] && statsResults[i].data) ? statsResults[i].data.filter(function(g) { return g.pts !== null; }) : [];
    var card = buildCard(player, games);
    results.appendChild(card);
  });

  anime({ targets: '.player-card', translateY: [40, 0], opacity: [0, 1], duration: 700, easing: 'easeOutExpo', delay: anime.stagger(100) });

  // Animate stat counters
  document.querySelectorAll('.stat-value[data-target]').forEach(function(el) {
    var target = parseFloat(el.dataset.target);
    var obj = { val: 0 };
    anime({ targets: obj, val: target, duration: 1200, easing: 'easeOutExpo', delay: 400,
      update: function() { el.textContent = obj.val.toFixed(1); }
    });
  });

  // Render all charts
  setTimeout(function() {
    players.forEach(function(player, i) {
      var games = (statsResults[i] && statsResults[i].data) ? statsResults[i].data.filter(function(g) { return g.pts !== null; }) : [];
      if (games.length > 0) renderChart(player.id, games);
    });
  }, 600);
}

function buildCard(player, games) {
  var card = document.createElement('div');
  card.className = 'player-card';

  var teamName = (player.team && player.team.full_name) ? player.team.full_name : 'N/A';
  var pos    = player.position || 'N/A';
  var height = player.height   || 'N/A';
  var weight = player.weight   ? player.weight + ' lbs' : 'N/A';

  var statsHTML = '';
  var chartHTML = '';

  if (games.length > 0) {
    var avg = function(key) { return (games.reduce(function(s,g){ return s+(g[key]||0); },0)/games.length).toFixed(1); };
    var pts = avg('pts'), reb = avg('reb'), ast = avg('ast'), stl = avg('stl'), blk = avg('blk');

    statsHTML =
      '<div class="season-label">Avg over last ' + games.length + ' games &nbsp;|&nbsp; 2023-24 Season</div>' +
      '<div class="stats-grid">' +
        '<div class="stat-box"><div class="stat-value" data-target="'+pts+'">0.0</div><div class="stat-label">PTS</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+reb+'">0.0</div><div class="stat-label">REB</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+ast+'">0.0</div><div class="stat-label">AST</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+stl+'">0.0</div><div class="stat-label">STL</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+blk+'">0.0</div><div class="stat-label">BLK</div></div>' +
        '<div class="stat-box"><div class="stat-value">'+games.length+'</div><div class="stat-label">GAMES</div></div>' +
      '</div>';

    chartHTML =
      '<div class="chart-container">' +
        '<div class="chart-title">Points · Rebounds · Assists per game</div>' +
        '<canvas id="chart-' + player.id + '"></canvas>' +
      '</div>';
  } else {
    statsHTML = '<p class="no-stats">No game stats found for 2023-24.</p>';
  }

  card.innerHTML =
    '<div class="player-name">' + player.first_name + ' ' + player.last_name + '</div>' +
    '<div class="player-team">' + teamName + '</div>' +
    statsHTML + chartHTML +
    '<div class="player-meta">' +
      '<span><strong>' + pos    + '</strong>Position</span>' +
      '<span><strong>' + height + '</strong>Height</span>' +
      '<span><strong>' + weight + '</strong>Weight</span>' +
    '</div>';

  return card;
}

function renderChart(playerId, games) {
  var canvas = document.getElementById('chart-' + playerId);
  if (!canvas) return;

  var labels = games.map(function(g, i) { return 'G' + (i + 1); });
  var pts    = games.map(function(g) { return g.pts || 0; });
  var reb    = games.map(function(g) { return g.reb || 0; });
  var ast    = games.map(function(g) { return g.ast || 0; });

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Points',   data: pts, backgroundColor: 'rgba(201,168,76,0.8)',  borderColor: 'rgba(201,168,76,1)',  borderWidth: 1, borderRadius: 4 },
        { label: 'Rebounds', data: reb, backgroundColor: 'rgba(79,195,247,0.8)',  borderColor: 'rgba(79,195,247,1)',  borderWidth: 1, borderRadius: 4 },
        { label: 'Assists',  data: ast, backgroundColor: 'rgba(240,98,146,0.8)',  borderColor: 'rgba(240,98,146,1)',  borderWidth: 1, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: true, labels: { color: '#90a4ae', font: { family: 'Barlow', size: 11 } } }
      },
      scales: {
        x: { ticks: { color: '#90a4ae', font: { family: 'Barlow', size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#90a4ae', font: { family: 'Barlow', size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
      }
    }
  });
}

function showError() {
  errorMsg.classList.remove('hidden');
  anime({ targets: '#error-msg', translateX: [-10,10,-8,8,-4,4,0], duration: 500, easing: 'easeInOutSine' });
}
