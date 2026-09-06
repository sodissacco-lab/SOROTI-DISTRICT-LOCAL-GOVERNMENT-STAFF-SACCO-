// ============================================================
// SODIS-SACCO Management Portal — shared behaviour
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

// Runs on every admin page. Confirms the visitor is logged in AND
// listed in admin_users. Redirects / blocks otherwise.
async function requireAdminAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  const { data: adminRow, error } = await supabaseClient
    .from('admin_users')
    .select('*')
    .eq('email', session.user.email)
    .maybeSingle();

  if (error || !adminRow) {
    document.body.innerHTML =
      '<div style="max-width:520px;margin:80px auto;padding:0 20px;font-family:sans-serif;">' +
      '<h2>Not authorized</h2>' +
      '<p>Your login works, but this account is not set up for Management Portal access. ' +
      'Ask an existing administrator to add your email to the admin_users table.</p>' +
      '<p><a href="../index.html">Return to the SODIS-SACCO website</a></p>' +
      '</div>';
    throw new Error('Not an admin');
  }

  document.querySelectorAll('[data-admin-name]').forEach(el => el.textContent = adminRow.full_name || adminRow.email);

  return adminRow;
}

function wireAdminChrome() {
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

document.addEventListener('DOMContentLoaded', wireAdminChrome);

// Register the service worker (one level up, since admin/ pages
// are nested) so the site can be installed as an app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../sw.js').catch(() => {});
  });
}
