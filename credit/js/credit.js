// ============================================================
// SODIS-SACCO Credit Committee Portal — shared behaviour
// This portal is deliberately NOT shared with admin_users — only
// credit_committee_users can log in here, keeping loan decisions
// under a genuinely separate body from general staff.
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

// Runs on every credit committee page. Confirms the visitor is
// logged in AND listed in credit_committee_users.
async function requireCreditAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  const { data: creditRow } = await supabaseClient
    .from('credit_committee_users')
    .select('*')
    .eq('email', session.user.email)
    .maybeSingle();

  if (creditRow) {
    document.querySelectorAll('[data-credit-name]').forEach(el => el.textContent = creditRow.full_name || creditRow.email);
    return creditRow;
  }

  document.body.innerHTML =
    '<div style="max-width:520px;margin:80px auto;padding:0 20px;font-family:sans-serif;">' +
    '<h2>Not authorized</h2>' +
    '<p>Your login works, but this account is not set up for Credit Committee Portal access. ' +
    'Ask an administrator to add your email to the credit_committee_users table.</p>' +
    '<p><a href="../index.html">Return to the SODIS-SACCO website</a></p>' +
    '</div>';
  throw new Error('Not a credit committee user');
}

function wireCreditChrome() {
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

document.addEventListener('DOMContentLoaded', wireCreditChrome);
