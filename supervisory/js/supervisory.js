// ============================================================
// SODIS-SACCO Supervisory Board Portal — shared behaviour
// ============================================================

function formatUGX(amount) {
  if (amount === null || amount === undefined) return '—';
  const n = Number(amount);
  return 'UGX ' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// Runs on every supervisory page. Confirms the visitor is logged
// in AND listed in supervisory_users (or admin_users, since staff
// sometimes need to add a management response).
async function requireSupervisoryAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  const { data: supRow } = await supabaseClient
    .from('supervisory_users')
    .select('*')
    .eq('email', session.user.email)
    .maybeSingle();

  if (supRow) {
    document.querySelectorAll('[data-supervisory-name]').forEach(el => el.textContent = supRow.full_name || supRow.email);
    return { ...supRow, isSupervisory: true };
  }

  const { data: adminRow } = await supabaseClient
    .from('admin_users')
    .select('*')
    .eq('email', session.user.email)
    .maybeSingle();

  if (adminRow) {
    document.querySelectorAll('[data-supervisory-name]').forEach(el => el.textContent = (adminRow.full_name || adminRow.email) + ' (staff)');
    return { ...adminRow, isSupervisory: false };
  }

  document.body.innerHTML =
    '<div style="max-width:520px;margin:80px auto;padding:0 20px;font-family:sans-serif;">' +
    '<h2>Not authorized</h2>' +
    '<p>Your login works, but this account is not set up for Supervisory Board Portal access. ' +
    'Ask an administrator to add your email to the supervisory_users table.</p>' +
    '<p><a href="../index.html">Return to the SODIS-SACCO website</a></p>' +
    '</div>';
  throw new Error('Not a supervisory user');
}

function wireSupervisoryChrome() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.portal-sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    });
  });

  const path = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.portal-sidebar a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', wireSupervisoryChrome);
