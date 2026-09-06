// ============================================================
// SODIS-SACCO — shared site behaviour
// ============================================================

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      panel.classList.toggle('open');
      const isOpen = panel.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Mark active nav link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a, .mobile-panel a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  loadSiteStats();
});

// Formats a number as UGX currency, abbreviated for large figures
function formatUGX(amount) {
  if (amount === null || amount === undefined) return '—';
  const n = Number(amount);
  if (n >= 1000000000) return 'UGX ' + (n / 1000000000).toFixed(2) + 'B';
  if (n >= 1000000) return 'UGX ' + (n / 1000000).toFixed(1) + 'M';
  return 'UGX ' + n.toLocaleString();
}

function formatNumber(n) {
  if (n === null || n === undefined) return '—';
  return Number(n).toLocaleString();
}

// Pulls the single site_stats row and fills any element with a
// data-stat="members|savings|loan_portfolio|active_loans" attribute.
async function loadSiteStats() {
  const targets = document.querySelectorAll('[data-stat]');
  if (!targets.length) return;
  if (!window.supabaseClient) return;

  try {
    const { data, error } = await supabaseClient
      .from('site_stats')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) return; // leave placeholder dashes in place

    targets.forEach(el => {
      const key = el.getAttribute('data-stat');
      if (key === 'members' || key === 'active_loans') {
        el.textContent = formatNumber(data[key]);
      } else {
        el.textContent = formatUGX(data[key]);
      }
    });
  } catch (e) {
    // Fail silently on the public site — stats simply show placeholders
    console.warn('Could not load live stats', e);
  }
}
