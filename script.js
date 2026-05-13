const API_KEY = '83531ede-e9b7-4967-a82f-6633c95a36fb';

const playerInput = document.getElementById('playerInput');
const searchBtn   = document.getElementById('searchBtn');
const errorMsg    = document.getElementById('error-msg');
const loading     = document.getElementById('loading');
const results     = document.getElementById('results');

// Animate header on load
anime({
  targets: '.logo, .title, .subtitle',
  translateY: [-30, 0],
  opacity: [0, 1],
  duration: 900,
  easing: 'easeOutExpo',
  delay: anime.stagger(120)
});
anime({
  targets: '.search-bar',
  translateY: [20, 0],
  opacity: [0, 1],
  duration: 800,
  easing: 'easeOutExpo',
  delay: 400
});
anime({
  targets: '.line',
  scaleY: [0, 1],
  duration: 1200,
  easing: 'easeOutExpo',
  delay: anime.stagger(200)
});
anime({
  targets: '.circle-bg',
  scale: [0, 1],
  opacity: [0, 1],
  duration: 1400,
  easing: 'easeOutExpo'
});

searchBtn.addEventListener('click', searchPlayer);
playerInput.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') searchPlayer();
});

async function getStats(playerId) {
  // Try seasons from newest to oldest until we find data
  var seasons = [2024, 2023, 2022, 2021];
  for (var i = 0; i < seasons.length; i++) {
    try {
      var res = await fetch(
        'https://api.balldontlie.io/v1/season_averages?season=' + seasons[i] + '&player_ids[]=' + playerId,
        { headers: { 'Authorization': API_KEY } }
      );
      var data = await res.json();
      if (data.data && data.data.length > 0) {
        return { stats: data.data[0], season: seasons[i] };
      }
    } catch(e) {}
  }
  return null;
}

async function searchPlayer() {
  var query = playerInput.value.trim();
  if (!query) return;

  errorMsg.classList.add('hidden');
  results.innerHTML = '';
  loading.classList.remove('hidden');

  try {
    var playerRes = await fetch(
      'https://api.balldontlie.io/v1/players?search=' + encodeURIComponent(query) + '&per_page=5',
      { headers: { 'Authorization': API_KEY } }
    );
    var playerData = await playerRes.json();
    if (!playerRes.ok) throw new Error('API error');
    if (!playerData.data || playerData.data.length === 0) throw new Error('No players found');

    var players = playerData.data;
    var statsPromises = players.map(function(p) { return getStats(p.id); });
    var statsResults = await Promise.all(statsPromises);

    loading.classList.add('hidden');
    displayPlayers(players, statsResults);

  } catch(err) {
    console.error(err);
    loading.classList.add('hidden');
    showError();
  }
}

function displayPlayers(players, statsResults) {
  if (players.length === 0) { showError(); return; }

  players.forEach(function(player, i) {
    var card = createCard(player, statsResults[i]);
    results.appendChild(card);
  });

  anime({
    targets: '.player-card',
    translateY: [40, 0],
    opacity: [0, 1],
    duration: 700,
    easing: 'easeOutExpo',
    delay: anime.stagger(100)
  });

  document.querySelectorAll('.stat-value[data-target]').forEach(function(el) {
    var target = parseFloat(el.dataset.target);
    var obj = { val: 0 };
    anime({
      targets: obj,
      val: target,
      duration: 1200,
      easing: 'easeOutExpo',
      delay: 300,
      update: function() { el.textContent = obj.val.toFixed(1); }
    });
  });

  setTimeout(renderCharts, 600);
}

function createCard(player, statsResult) {
  var card = document.createElement('div');
  card.className = 'player-card';

  var teamName = (player.team && player.team.full_name) ? player.team.full_name : 'N/A';
  var pos    = player.position || 'N/A';
  var height = player.height || 'N/A';
  var weight = player.weight ? player.weight + ' lbs' : 'N/A';

  var statsHTML = '';
  var chartHTML = '';

  if (statsResult && statsResult.stats) {
    var s = statsResult.stats;
    var pts   = s.pts   || 0;
    var reb   = s.reb   || 0;
    var ast   = s.ast   || 0;
    var stl   = s.stl   || 0;
    var blk   = s.blk   || 0;
    var fgPct = parseFloat(((s.fg_pct || 0) * 100).toFixed(1));
    var season = statsResult.season;

    statsHTML =
      '<div class="season-label">' + season + '-' + (season+1) + ' Season</div>' +
      '<div class="stats-grid">' +
        '<div class="stat-box"><div class="stat-value" data-target="' + pts + '">0.0</div><div class="stat-label">PPG</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="' + reb + '">0.0</div><div class="stat-label">RPG</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="' + ast + '">0.0</div><div class="stat-label">APG</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="' + stl + '">0.0</div><div class="stat-label">STL</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="' + blk + '">0.0</div><div class="stat-label">BLK</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="' + fgPct + '">0.0</div><div class="stat-label">FG%</div></div>' +
      '</div>';

    var chartId = 'chart-' + player.id;
    chartHTML = '<div class="chart-container"><canvas id="' + chartId + '"></canvas></div>';

    card.dataset.chartId = chartId;
    card.dataset.pts   = pts;
    card.dataset.reb   = reb;
    card.dataset.ast   = ast;
    card.dataset.stl   = stl;
    card.dataset.blk   = blk;
    card.dataset.fgPct = fgPct;

  } else {
    statsHTML = '<p class="no-stats">No stats available.</p>';
  }

  card.innerHTML =
    '<div class="player-name">' + player.first_name + ' ' + player.last_name + '</div>' +
    '<div class="player-team">' + teamName + '</div>' +
    statsHTML +
    chartHTML +
    '<div class="player-meta">' +
      '<span><strong>' + pos + '</strong>Position</span>' +
      '<span><strong>' + height + '</strong>Height</span>' +
      '<span><strong>' + weight + '</strong>Weight</span>' +
    '</div>';

  return card;
}

function renderCharts() {
  document.querySelectorAll('.player-card[data-chart-id]').forEach(function(card) {
    var chartId = card.dataset.chartId;
    var canvas = document.getElementById(chartId);
    if (!canvas) return;

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['PPG', 'RPG', 'APG', 'STL', 'BLK', 'FG%'],
        datasets: [{
          label: 'Season Averages',
          data: [
            parseFloat(card.dataset.pts),
            parseFloat(card.dataset.reb),
            parseFloat(card.dataset.ast),
            parseFloat(card.dataset.stl),
            parseFloat(card.dataset.blk),
            parseFloat(card.dataset.fgPct)
          ],
          backgroundColor: [
            'rgba(201,168,76,0.8)',
            'rgba(79,195,247,0.8)',
            'rgba(240,98,146,0.8)',
            'rgba(129,199,132,0.8)',
            'rgba(255,167,38,0.8)',
            'rgba(149,117,205,0.8)'
          ],
          borderColor: [
            'rgba(201,168,76,1)',
            'rgba(79,195,247,1)',
            'rgba(240,98,146,1)',
            'rgba(129,199,132,1)',
            'rgba(255,167,38,1)',
            'rgba(149,117,205,1)'
          ],
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: '#90a4ae', font: { family: 'Barlow', size: 11 } },
            grid: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            ticks: { color: '#90a4ae', font: { family: 'Barlow', size: 11 } },
            grid: { color: 'rgba(255,255,255,0.05)' },
            beginAtZero: true
          }
        }
      }
    });
  });
}

function showError() {
  errorMsg.classList.remove('hidden');
  anime({
    targets: '#error-msg',
    translateX: [-10, 10, -8, 8, -4, 4, 0],
    duration: 500,
    easing: 'easeInOutSine'
  });
}
