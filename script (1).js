// No API key needed - uses free public NBA data

const playerInput = document.getElementById('playerInput');
const searchBtn   = document.getElementById('searchBtn');
const errorMsg    = document.getElementById('error-msg');
const loading     = document.getElementById('loading');
const results     = document.getElementById('results');

// Hardcoded current NBA player stats (2023-24 season)
const NBA_PLAYERS = [
  { name: 'LeBron James',      team: 'Los Angeles Lakers',    pos: 'F',  ht: '6-9',  wt: '250 lbs', pts: 25.7, reb: 7.3, ast: 8.3, stl: 1.3, blk: 0.5, fg: 54.0 },
  { name: 'Stephen Curry',     team: 'Golden State Warriors', pos: 'G',  ht: '6-2',  wt: '185 lbs', pts: 26.4, reb: 4.5, ast: 5.1, stl: 0.9, blk: 0.4, fg: 45.0 },
  { name: 'Kevin Durant',      team: 'Phoenix Suns',          pos: 'F',  ht: '6-10', wt: '240 lbs', pts: 27.1, reb: 6.6, ast: 5.0, stl: 0.9, blk: 1.2, fg: 52.7 },
  { name: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks',   pos: 'F',  ht: '6-11', wt: '242 lbs', pts: 30.4, reb: 11.5,ast: 6.5, stl: 1.2, blk: 1.1, fg: 61.1 },
  { name: 'Nikola Jokic',      team: 'Denver Nuggets',        pos: 'C',  ht: '6-11', wt: '284 lbs', pts: 26.4, reb: 12.4,ast: 9.0, stl: 1.4, blk: 0.9, fg: 58.3 },
  { name: 'Luka Doncic',       team: 'Dallas Mavericks',      pos: 'G',  ht: '6-7',  wt: '230 lbs', pts: 33.9, reb: 9.2, ast: 9.8, stl: 1.4, blk: 0.5, fg: 48.7 },
  { name: 'Joel Embiid',       team: 'Philadelphia 76ers',    pos: 'C',  ht: '7-0',  wt: '280 lbs', pts: 34.7, reb: 11.0,ast: 5.6, stl: 1.2, blk: 1.7, fg: 52.8 },
  { name: 'Jayson Tatum',      team: 'Boston Celtics',        pos: 'F',  ht: '6-8',  wt: '210 lbs', pts: 26.9, reb: 8.1, ast: 4.9, stl: 1.0, blk: 0.6, fg: 47.1 },
  { name: 'Damian Lillard',    team: 'Milwaukee Bucks',       pos: 'G',  ht: '6-2',  wt: '195 lbs', pts: 24.3, reb: 4.4, ast: 7.0, stl: 0.9, blk: 0.3, fg: 43.5 },
  { name: 'Anthony Edwards',   team: 'Minnesota Timberwolves',pos: 'G',  ht: '6-4',  wt: '225 lbs', pts: 25.9, reb: 5.4, ast: 5.1, stl: 1.3, blk: 0.5, fg: 46.1 },
  { name: 'Shai Gilgeous-Alexander', team: 'Oklahoma City Thunder', pos: 'G', ht: '6-6', wt: '195 lbs', pts: 30.1, reb: 5.5, ast: 6.2, stl: 2.0, blk: 1.0, fg: 53.5 },
  { name: 'Devin Booker',      team: 'Phoenix Suns',          pos: 'G',  ht: '6-5',  wt: '206 lbs', pts: 27.1, reb: 4.5, ast: 6.9, stl: 1.1, blk: 0.3, fg: 49.3 },
  { name: 'Jimmy Butler',      team: 'Miami Heat',            pos: 'F',  ht: '6-7',  wt: '230 lbs', pts: 20.8, reb: 5.3, ast: 5.0, stl: 1.3, blk: 0.3, fg: 50.6 },
  { name: 'Kawhi Leonard',     team: 'LA Clippers',           pos: 'F',  ht: '6-7',  wt: '225 lbs', pts: 23.7, reb: 6.1, ast: 3.6, stl: 1.6, blk: 0.9, fg: 52.5 },
  { name: 'Trae Young',        team: 'Atlanta Hawks',         pos: 'G',  ht: '6-1',  wt: '164 lbs', pts: 25.7, reb: 3.3, ast: 10.8,stl: 1.1, blk: 0.1, fg: 42.9 },
  { name: 'Zion Williamson',   team: 'New Orleans Pelicans',  pos: 'F',  ht: '6-6',  wt: '284 lbs', pts: 22.9, reb: 5.8, ast: 5.0, stl: 1.1, blk: 0.6, fg: 57.8 },
  { name: 'Ja Morant',         team: 'Memphis Grizzlies',     pos: 'G',  ht: '6-2',  wt: '174 lbs', pts: 25.1, reb: 5.6, ast: 8.1, stl: 1.0, blk: 0.3, fg: 47.1 },
  { name: 'Tyrese Haliburton', team: 'Indiana Pacers',        pos: 'G',  ht: '6-5',  wt: '185 lbs', pts: 20.1, reb: 3.9, ast: 10.9,stl: 1.3, blk: 0.3, fg: 47.4 },
  { name: 'Jaylen Brown',      team: 'Boston Celtics',        pos: 'G',  ht: '6-6',  wt: '223 lbs', pts: 23.0, reb: 5.5, ast: 3.6, stl: 1.1, blk: 0.4, fg: 49.9 },
  { name: 'Anthony Davis',     team: 'Los Angeles Lakers',    pos: 'C',  ht: '6-10', wt: '253 lbs', pts: 24.7, reb: 12.6,ast: 3.5, stl: 1.2, blk: 2.3, fg: 55.8 },
  { name: 'Donovan Mitchell',  team: 'Cleveland Cavaliers',   pos: 'G',  ht: '6-1',  wt: '215 lbs', pts: 26.6, reb: 5.1, ast: 6.1, stl: 1.7, blk: 0.3, fg: 48.3 },
  { name: 'Bam Adebayo',       team: 'Miami Heat',            pos: 'C',  ht: '6-9',  wt: '255 lbs', pts: 19.3, reb: 10.4,ast: 3.9, stl: 1.1, blk: 0.8, fg: 56.5 },
  { name: 'Karl-Anthony Towns',team: 'New York Knicks',       pos: 'C',  ht: '7-0',  wt: '270 lbs', pts: 21.8, reb: 8.3, ast: 3.0, stl: 0.9, blk: 0.7, fg: 50.5 },
  { name: 'Paolo Banchero',    team: 'Orlando Magic',         pos: 'F',  ht: '6-10', wt: '250 lbs', pts: 22.6, reb: 6.9, ast: 5.4, stl: 0.9, blk: 0.8, fg: 46.0 },
  { name: 'Victor Wembanyama', team: 'San Antonio Spurs',     pos: 'C',  ht: '7-4',  wt: '210 lbs', pts: 21.4, reb: 10.6,ast: 3.9, stl: 1.2, blk: 3.6, fg: 46.5 },
  { name: 'Cade Cunningham',   team: 'Detroit Pistons',       pos: 'G',  ht: '6-6',  wt: '220 lbs', pts: 22.7, reb: 4.4, ast: 7.9, stl: 1.1, blk: 0.5, fg: 44.6 },
  { name: 'Seth Curry',        team: 'Golden State Warriors', pos: 'G',  ht: '6-1',  wt: '185 lbs', pts: 8.4,  reb: 1.9, ast: 1.5, stl: 0.5, blk: 0.1, fg: 44.2 },
];

// Animate on load
anime({ targets: '.logo, .title, .subtitle', translateY: [-30,0], opacity: [0,1], duration: 900, easing: 'easeOutExpo', delay: anime.stagger(120) });
anime({ targets: '.search-bar', translateY: [20,0], opacity: [0,1], duration: 800, easing: 'easeOutExpo', delay: 400 });
anime({ targets: '.line', scaleY: [0,1], duration: 1200, easing: 'easeOutExpo', delay: anime.stagger(200) });
anime({ targets: '.circle-bg', scale: [0,1], opacity: [0,1], duration: 1400, easing: 'easeOutExpo' });

searchBtn.addEventListener('click', searchPlayer);
playerInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') searchPlayer(); });

function searchPlayer() {
  var query = playerInput.value.trim().toLowerCase();
  if (!query) return;

  errorMsg.classList.add('hidden');
  results.innerHTML = '';

  var found = NBA_PLAYERS.filter(function(p) {
    return p.name.toLowerCase().includes(query);
  });

  if (found.length === 0) {
    showError();
    return;
  }

  found.forEach(function(player) {
    var card = createCard(player);
    results.appendChild(card);
  });

  anime({ targets: '.player-card', translateY: [40,0], opacity: [0,1], duration: 700, easing: 'easeOutExpo', delay: anime.stagger(100) });

  document.querySelectorAll('.stat-value[data-target]').forEach(function(el) {
    var target = parseFloat(el.dataset.target);
    var obj = { val: 0 };
    anime({ targets: obj, val: target, duration: 1200, easing: 'easeOutExpo', delay: 300,
      update: function() { el.textContent = obj.val.toFixed(1); }
    });
  });

  setTimeout(renderCharts, 600);
}

function createCard(p) {
  var card = document.createElement('div');
  card.className = 'player-card';

  var chartId = 'chart-' + p.name.replace(/\s+/g, '-').toLowerCase();

  var statsHTML =
    '<div class="season-label">2023-24 Season</div>' +
    '<div class="stats-grid">' +
      '<div class="stat-box"><div class="stat-value" data-target="' + p.pts + '">0.0</div><div class="stat-label">PPG</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + p.reb + '">0.0</div><div class="stat-label">RPG</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + p.ast + '">0.0</div><div class="stat-label">APG</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + p.stl + '">0.0</div><div class="stat-label">STL</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + p.blk + '">0.0</div><div class="stat-label">BLK</div></div>' +
      '<div class="stat-box"><div class="stat-value" data-target="' + p.fg + '">0.0</div><div class="stat-label">FG%</div></div>' +
    '</div>';

  card.innerHTML =
    '<div class="player-name">' + p.name + '</div>' +
    '<div class="player-team">' + p.team + '</div>' +
    statsHTML +
    '<div class="chart-container"><canvas id="' + chartId + '"></canvas></div>' +
    '<div class="player-meta">' +
      '<span><strong>' + p.pos + '</strong>Position</span>' +
      '<span><strong>' + p.ht + '</strong>Height</span>' +
      '<span><strong>' + p.wt + '</strong>Weight</span>' +
    '</div>';

  card.dataset.chartId = chartId;
  card.dataset.pts = p.pts;
  card.dataset.reb = p.reb;
  card.dataset.ast = p.ast;
  card.dataset.stl = p.stl;
  card.dataset.blk = p.blk;
  card.dataset.fgPct = p.fg;

  return card;
}

function renderCharts() {
  document.querySelectorAll('.player-card[data-chart-id]').forEach(function(card) {
    var canvas = document.getElementById(card.dataset.chartId);
    if (!canvas) return;
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['PPG', 'RPG', 'APG', 'STL', 'BLK', 'FG%'],
        datasets: [{
          data: [parseFloat(card.dataset.pts), parseFloat(card.dataset.reb), parseFloat(card.dataset.ast), parseFloat(card.dataset.stl), parseFloat(card.dataset.blk), parseFloat(card.dataset.fgPct)],
          backgroundColor: ['rgba(201,168,76,0.8)','rgba(79,195,247,0.8)','rgba(240,98,146,0.8)','rgba(129,199,132,0.8)','rgba(255,167,38,0.8)','rgba(149,117,205,0.8)'],
          borderColor:      ['rgba(201,168,76,1)','rgba(79,195,247,1)','rgba(240,98,146,1)','rgba(129,199,132,1)','rgba(255,167,38,1)','rgba(149,117,205,1)'],
          borderWidth: 1, borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 1200, easing: 'easeOutQuart' },
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#90a4ae', font: { family: 'Barlow', size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#90a4ae', font: { family: 'Barlow', size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
        }
      }
    });
  });
}

function showError() {
  errorMsg.classList.remove('hidden');
  anime({ targets: '#error-msg', translateX: [-10,10,-8,8,-4,4,0], duration: 500, easing: 'easeInOutSine' });
}
