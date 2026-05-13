const API_KEY = '53efc203-fc3a-48bd-a0cd-3811439ecbd0';
const BASE    = 'https://api.balldontlie.io/v1';

const playerInput = document.getElementById('playerInput');
const searchBtn   = document.getElementById('searchBtn');
const errorMsg    = document.getElementById('error-msg');
const loading     = document.getElementById('loading');
const results     = document.getElementById('results');

anime({ targets: '.logo, .title, .subtitle', translateY:[-30,0], opacity:[0,1], duration:900, easing:'easeOutExpo', delay:anime.stagger(120) });
anime({ targets: '.search-bar', translateY:[20,0], opacity:[0,1], duration:800, easing:'easeOutExpo', delay:400 });
anime({ targets: '.line', scaleY:[0,1], duration:1200, easing:'easeOutExpo', delay:anime.stagger(200) });
anime({ targets: '.circle-bg', scale:[0,1], opacity:[0,1], duration:1400, easing:'easeOutExpo' });

searchBtn.addEventListener('click', searchPlayer);
playerInput.addEventListener('keydown', function(e) { if (e.key==='Enter') searchPlayer(); });

async function searchPlayer() {
  var query = playerInput.value.trim();
  if (!query) return;
  errorMsg.classList.add('hidden');
  results.innerHTML = '';
  loading.classList.remove('hidden');

  try {
    // Step 1: Search players live from API
    var pRes = await fetch(BASE + '/players?search=' + encodeURIComponent(query) + '&per_page=5', {
      headers: { 'Authorization': API_KEY }
    });
    var pData = await pRes.json();
    if (!pRes.ok || !pData.data || pData.data.length === 0) throw new Error('Not found');

    var players = pData.data;

    // Step 2: Fetch live season averages for each player (GOAT tier)
    var statsPromises = players.map(function(p) {
      return fetch(BASE + '/season_averages/general?season=2024&season_type=regular&type=base&player_ids[]=' + p.id, {
        headers: { 'Authorization': API_KEY }
      }).then(function(r) { return r.json(); }).catch(function() { return { data: [] }; });
    });

    var statsResults = await Promise.all(statsPromises);
    console.log('Stats:', JSON.stringify(statsResults[0]));

    loading.classList.add('hidden');
    renderPlayers(players, statsResults);

  } catch(err) {
    console.error(err);
    loading.classList.add('hidden');
    showError();
  }
}

function renderPlayers(players, statsResults) {
  players.forEach(function(player, i) {
    var raw   = statsResults[i] && statsResults[i].data && statsResults[i].data[0] ? statsResults[i].data[0] : null;
    var stats = raw ? (raw.stats || raw) : null;
    results.appendChild(buildCard(player, stats));
  });

  anime({ targets:'.player-card', translateY:[40,0], opacity:[0,1], duration:700, easing:'easeOutExpo', delay:anime.stagger(100) });

  document.querySelectorAll('.stat-value[data-target]').forEach(function(el) {
    var target = parseFloat(el.dataset.target);
    var obj = { val:0 };
    anime({ targets:obj, val:target, duration:1200, easing:'easeOutExpo', delay:400,
      update: function() { el.textContent = obj.val.toFixed(1); }
    });
  });

  setTimeout(function() {
    players.forEach(function(player, i) {
      var raw   = statsResults[i] && statsResults[i].data && statsResults[i].data[0] ? statsResults[i].data[0] : null;
      var stats = raw ? (raw.stats || raw) : null;
      if (stats) renderChart(player.id, stats);
    });
  }, 600);
}

function buildCard(player, stats) {
  var card = document.createElement('div');
  card.className = 'player-card';
  var teamName = (player.team && player.team.full_name) ? player.team.full_name : 'N/A';
  var pos    = player.position || 'N/A';
  var height = player.height   || 'N/A';
  var weight = player.weight   ? player.weight + ' lbs' : 'N/A';

  var statsHTML = '', chartHTML = '';

  if (stats) {
    var pts = parseFloat(stats.pts  || 0).toFixed(1);
    var reb = parseFloat(stats.reb  || 0).toFixed(1);
    var ast = parseFloat(stats.ast  || 0).toFixed(1);
    var stl = parseFloat(stats.stl  || 0).toFixed(1);
    var blk = parseFloat(stats.blk  || 0).toFixed(1);
    var fg  = parseFloat((stats.fg_pct || 0) * 100).toFixed(1);

    statsHTML =
      '<div class="season-label">2024-25 NBA Season — Live Data</div>' +
      '<div class="stats-grid">' +
        '<div class="stat-box"><div class="stat-value" data-target="'+pts+'">0.0</div><div class="stat-label">PTS</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+reb+'">0.0</div><div class="stat-label">REB</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+ast+'">0.0</div><div class="stat-label">AST</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+stl+'">0.0</div><div class="stat-label">STL</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+blk+'">0.0</div><div class="stat-label">BLK</div></div>' +
        '<div class="stat-box"><div class="stat-value" data-target="'+fg+'">0.0</div><div class="stat-label">FG%</div></div>' +
      '</div>';
    chartHTML = '<div class="chart-container"><div class="chart-title">Season Averages — 2024-25</div><canvas id="chart-'+player.id+'"></canvas></div>';
  } else {
    statsHTML = '<p class="no-stats">No stats available for this season.</p>';
  }

  card.innerHTML =
    '<div class="player-name">'+player.first_name+' '+player.last_name+'</div>' +
    '<div class="player-team">'+teamName+'</div>' +
    statsHTML + chartHTML +
    '<div class="player-meta">' +
      '<span><strong>'+pos+'</strong>Position</span>' +
      '<span><strong>'+height+'</strong>Height</span>' +
      '<span><strong>'+weight+'</strong>Weight</span>' +
    '</div>';
  return card;
}

function renderChart(playerId, stats) {
  var canvas = document.getElementById('chart-'+playerId);
  if (!canvas) return;
  var pts = parseFloat(stats.pts || 0);
  var reb = parseFloat(stats.reb || 0);
  var ast = parseFloat(stats.ast || 0);
  var stl = parseFloat(stats.stl || 0);
  var blk = parseFloat(stats.blk || 0);
  var fg  = parseFloat((stats.fg_pct || 0) * 100);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['PTS','REB','AST','STL','BLK','FG%'],
      datasets: [{
        data: [pts, reb, ast, stl, blk, fg],
        backgroundColor: ['rgba(201,168,76,0.8)','rgba(79,195,247,0.8)','rgba(240,98,146,0.8)','rgba(129,199,132,0.8)','rgba(255,167,38,0.8)','rgba(149,117,205,0.8)'],
        borderColor:     ['rgba(201,168,76,1)','rgba(79,195,247,1)','rgba(240,98,146,1)','rgba(129,199,132,1)','rgba(255,167,38,1)','rgba(149,117,205,1)'],
        borderWidth: 1, borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      animation: { duration:1200, easing:'easeOutQuart' },
      plugins: { legend: { display:false } },
      scales: {
        x: { ticks:{ color:'#90a4ae', font:{ family:'Barlow', size:11 } }, grid:{ color:'rgba(255,255,255,0.05)' } },
        y: { ticks:{ color:'#90a4ae', font:{ family:'Barlow', size:11 } }, grid:{ color:'rgba(255,255,255,0.05)' }, beginAtZero:true }
      }
    }
  });
}

function showError() {
  errorMsg.classList.remove('hidden');
  anime({ targets:'#error-msg', translateX:[-10,10,-8,8,-4,4,0], duration:500, easing:'easeInOutSine' });
}
