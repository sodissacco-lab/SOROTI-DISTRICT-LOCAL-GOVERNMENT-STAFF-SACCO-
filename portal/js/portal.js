// ============================================================
// SODIS-SACCO Member Portal — shared behaviour
// Every portal page includes this after config.js. It:
//   1. Confirms the visitor is logged in (redirects to login.html
//      if not)
//   2. Loads their `members` row
//   3. Wires the sidebar toggle + logout button
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

// Runs on every portal page. Returns the member's row, or redirects
// to login.html if there's no valid session / member record.
async function requirePortalAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
    return null;
  }

  const { data: member, error } = await supabaseClient
    .from('members')
    .select('*')
    .eq('auth_user_id', session.user.id)
    .single();

  if (error || !member) {
    console.warn('No member record linked to this login', error);
    document.body.innerHTML =
      '<div style="max-width:520px;margin:80px auto;padding:0 20px;font-family:sans-serif;">' +
      '<h2>Account not fully set up</h2>' +
      '<p>Your login works, but no membership record is linked to it yet. Please contact the SODIS-SACCO office to complete your account setup.</p>' +
      '<p><a href="../index.html">Return to the SODIS-SACCO website</a></p>' +
      '</div>';
    throw new Error('No member record');
  }

  // Fill in name/membership number wherever the page has placeholders
  document.querySelectorAll('[data-member-name]').forEach(el => el.textContent = member.full_name);
  document.querySelectorAll('[data-member-number]').forEach(el => el.textContent = member.membership_number);

  return member;
}

function wirePortalChrome() {
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

  // Mark active sidebar link
  const path = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.portal-sidebar a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', wirePortalChrome);
