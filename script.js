document.addEventListener("DOMContentLoaded", function () {
  /* =====================================================
     RAILREPORTERS — V2 BETA LOCALE SUPABASE
     Version V2 beta : Auth + reports Supabase + espace admin + signalement report/commentaire.
     Ne pas publier sans test complet.
     ===================================================== */

  const SUPABASE_URL = "https://mtusriymwtqkkmhdknbc.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_7C49ss0gnxllKnsgNxQ8tg_6C3Iu1Bu";

  const form = document.getElementById("report-form");
  const reportsList = document.getElementById("reports-list");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.querySelector(".search-box input");
  const createReportSection = document.getElementById("create-report");
  const publishLinks = document.querySelectorAll('a[href="#create-report"]');
  const backToTopButton = document.getElementById("back-to-top");
  const topbarInner = document.querySelector(".topbar-inner");

  let supabaseClient = null;
  let currentUser = null;
  let currentProfile = null;
  let reports = [];
  let hiddenReports = [];
  let hiddenComments = [];
  let adminUsers = [];
  let moderationReports = [];
  let openedReportId = null;
  let searchQuery = "";
  let adminHiddenReportsSection = null;
  let adminHiddenReportsList = null;
  let adminHiddenReportsEmpty = null;
  let adminDashboardSection = null;
  let adminDashboardSummary = null;
  let adminDashboardGrid = null;
  let adminHiddenCommentsSection = null;
  let adminHiddenCommentsList = null;
  let adminHiddenCommentsEmpty = null;
  let adminUsersSection = null;
  let adminUsersList = null;
  let adminUsersEmpty = null;
  let adminModerationReportsSection = null;
  let adminModerationReportsList = null;
  let adminModerationReportsEmpty = null;

  if (!window.supabase) {
    console.error("Supabase n'est pas chargé.");
    if (emptyState) {
      emptyState.style.display = "block";
      emptyState.textContent = "Erreur : Supabase n'est pas chargé. Vérifiez la connexion Internet.";
    }
    return;
  }

  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function afficherEtoiles(note) {
    let etoiles = "";
    for (let i = 0; i < Number(note || 0); i++) {
      etoiles += "⭐";
    }
    return etoiles;
  }

  function formaterDate(dateString) {
    if (!dateString) return "";
    const morceaux = String(dateString).split("-");
    if (morceaux.length !== 3) return dateString;
    return `${morceaux[2]}/${morceaux[1]}/${morceaux[0]}`;
  }

  function getRoleLabel(role) {
    if (role === "admin") return "Admin RailReporters";
    if (role === "moderator") return "Modérateur";
    return "Membre";
  }

  function getAuthorLabel(profile) {
    if (!profile) return "Auteur inconnu";
    const name = profile.username || "Utilisateur";
    const role = profile.role ? getRoleLabel(profile.role) : "Membre";
    return `${name} · ${role}`;
  }

  function cleanSegment(value) {
    return String(value || "railreporters")
      .trim()
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "railreporters";
  }

  function cleanFileBase(value) {
    const name = String(value || "photo").toLowerCase();
    const withoutExt = name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
    return cleanSegment(withoutExt) || "photo";
  }

  function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
  }

  function getInputFile(id) {
    const element = document.getElementById(id);
    if (!element || !element.files || element.files.length === 0) return null;
    return element.files[0];
  }

  function setPublicationStatus(text, type = "") {
    let status = document.getElementById("real-form-supabase-status");
    if (!status || !form) return;

    status.textContent = text;
    status.className = "real-form-supabase-status";
    if (type === "ok") status.classList.add("ok");
    if (type === "error") status.classList.add("error");
  }

  function isCurrentUserBanned() {
    return Boolean(currentProfile && currentProfile.is_banned === true);
  }

  function getFriendlySupabaseError(error, context = "general") {
    const rawMessage = (error && error.message) ? String(error.message) : String(error || "Erreur inconnue");
    const lower = rawMessage.toLowerCase();
    const code = error && error.code ? String(error.code) : "";
    const status = error && error.status ? String(error.status) : "";

    const isRlsError =
      lower.includes("row-level security") ||
      lower.includes("row level security") ||
      lower.includes("violates row") ||
      code === "42501" ||
      status === "403";

    if (isRlsError) {
      if (isCurrentUserBanned()) {
        return "Votre compte est actuellement bloqué. Vous ne pouvez pas publier, commenter ou envoyer de photo. Contactez l’administrateur RailReporters si vous pensez qu’il s’agit d’une erreur.";
      }

      if (context === "publish") {
        return "La publication n’est pas autorisée avec ce compte. Vérifiez que vous êtes bien connecté, puis réessayez.";
      }

      if (context === "comment") {
        return "Le commentaire n’a pas pu être publié. Cette action n’est pas autorisée avec ce compte.";
      }

      if (context === "signal") {
        return "Le signalement n’a pas pu être envoyé. Vérifiez que vous êtes connecté et que votre compte est autorisé à signaler un contenu.";
      }

      if (context === "upload") {
        return "L’envoi de la photo n’a pas été autorisé. Vérifiez que vous êtes connecté et que votre compte est autorisé à publier.";
      }

      if (context === "admin-hide-report") {
        return "Impossible de masquer ce report. Cette action est réservée à l’administrateur RailReporters.";
      }

      if (context === "admin-hide-comment") {
        return "Impossible de masquer ce commentaire. Cette action est réservée à l’administrateur RailReporters.";
      }

      if (context === "admin-restore-report") {
        return "Impossible de restaurer ce report. Cette action est réservée à l’administrateur RailReporters.";
      }

      if (context === "admin-restore-comment") {
        return "Impossible de restaurer ce commentaire. Cette action est réservée à l’administrateur RailReporters.";
      }

      if (context === "admin-users") {
        return "Impossible de modifier cet utilisateur. Cette action est réservée à l’administrateur RailReporters.";
      }

      if (context === "admin-moderation-reports") {
        return "Impossible de modifier ce signalement. Cette action est réservée à l’administrateur RailReporters.";
      }

      return "Cette action n’est pas autorisée avec votre compte.";
    }

    if (lower.includes("invalid login credentials")) {
      return "Email ou mot de passe incorrect.";
    }

    if (lower.includes("email not confirmed")) {
      return "Votre email n’est pas encore confirmé. Vérifiez votre boîte mail avant de vous connecter.";
    }

    if (lower.includes("already registered") || lower.includes("user already registered")) {
      return "Un compte existe déjà avec cet email. Essayez de vous connecter.";
    }

    if (lower.includes("network") || lower.includes("failed to fetch")) {
      return "Erreur réseau. Vérifiez votre connexion Internet puis réessayez.";
    }

    return rawMessage;
  }

  function installerStylesV2() {
    if (document.getElementById("railreporters-v2-beta-styles")) return;

    const style = document.createElement("style");
    style.id = "railreporters-v2-beta-styles";
    style.textContent = `
      .login-button.auth-visible {
        display: inline-flex !important;
        align-items: center;
        justify-content: center;
        border: none;
        border-radius: 999px;
        padding: 11px 16px;
        font-weight: 900;
        color: #ffffff;
        background: linear-gradient(135deg, #ff5a5f, #2563eb);
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(255, 90, 95, 0.22);
        white-space: nowrap;
      }

      .auth-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid rgba(226, 232, 240, 0.95);
        color: #111827;
        font-size: 14px;
        font-weight: 800;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        white-space: nowrap;
      }

      .auth-status-badge.admin {
        background: linear-gradient(135deg, #fff7ed, #ffffff);
        border-color: rgba(255, 90, 95, 0.26);
        color: #9f1239;
      }

      .auth-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(15, 23, 42, 0.52);
        backdrop-filter: blur(6px);
      }

      .auth-modal-backdrop.visible {
        display: flex;
      }

      .auth-modal {
        width: min(520px, 100%);
        background: #ffffff;
        border-radius: 26px;
        padding: 24px;
        border: 1px solid #e5e7eb;
        box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
      }

      .auth-modal h2 {
        margin: 0 0 8px;
        color: #111827;
        font-size: 28px;
        letter-spacing: -0.6px;
      }

      .auth-modal p {
        margin: 0 0 18px;
        color: #64748b;
        line-height: 1.55;
      }

      .auth-modal label {
        display: block;
        margin: 14px 0 6px;
        font-weight: 900;
        color: #111827;
        font-size: 14px;
      }

      .auth-modal input {
        width: 100%;
        box-sizing: border-box;
        padding: 13px 14px;
        border-radius: 14px;
        border: 1px solid #cbd5e1;
        font-size: 15px;
        background: #ffffff;
      }

      .auth-modal input:focus {
        outline: none;
        border-color: #ff5a5f;
        box-shadow: 0 0 0 4px rgba(255, 90, 95, 0.13);
      }

      .auth-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 18px;
      }

      .auth-actions button {
        padding: 12px 16px;
        border: none;
        border-radius: 999px;
        cursor: pointer;
        font-weight: 900;
      }

      .auth-actions button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .auth-primary {
        color: white;
        background: linear-gradient(135deg, #ff5a5f, #2563eb);
        box-shadow: 0 14px 28px rgba(255, 90, 95, 0.22);
      }

      .auth-secondary {
        color: white;
        background: #111827;
      }

      .auth-light {
        color: #111827;
        background: #f1f5f9;
      }

      .auth-message {
        margin-top: 16px;
        padding: 13px 14px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #334155;
        line-height: 1.5;
        white-space: pre-wrap;
      }

      .auth-message.ok {
        background: #ecfdf5;
        border-color: #bbf7d0;
        color: #166534;
      }

      .auth-message.error {
        background: #fef2f2;
        border-color: #fecaca;
        color: #991b1b;
      }

      .real-form-supabase-status {
        margin: 18px 0 0;
        padding: 15px 16px;
        border-radius: 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #334155;
        white-space: pre-wrap;
        line-height: 1.55;
      }

      .real-form-supabase-status.ok {
        background: #ecfdf5;
        border-color: #bbf7d0;
        color: #166534;
      }

      .real-form-supabase-status.error {
        background: #fef2f2;
        border-color: #fecaca;
        color: #991b1b;
      }

      .author-line {
        margin: 0 0 10px;
        color: inherit;
        opacity: 0.92;
        font-weight: 800;
      }

      .summary-info .author-line {
        color: #e5e7eb !important;
      }

      .comment-author {
        display: block;
        margin-bottom: 8px;
        color: #111827;
        font-weight: 900;
      }

      @media (max-width: 900px) {
        .auth-status-badge {
          justify-self: start;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getTopbarContainer() {
    return topbarInner || document.querySelector(".topbar") || document.querySelector("header") || document.body;
  }

  function createLoginButtonIfNeeded() {
    let loginButton = document.querySelector(".login-button");
    if (!loginButton) {
      loginButton = document.createElement("button");
      loginButton.className = "login-button auth-visible";
      loginButton.type = "button";
      loginButton.textContent = "Se connecter";
      getTopbarContainer().appendChild(loginButton);
    } else {
      loginButton.classList.add("auth-visible");
      loginButton.type = "button";
      loginButton.textContent = "Se connecter";
    }
    return loginButton;
  }

  function createAuthUI() {
    const loginButton = createLoginButtonIfNeeded();

    if (!document.getElementById("auth-status-badge")) {
      const badge = document.createElement("div");
      badge.id = "auth-status-badge";
      badge.className = "auth-status-badge";
      badge.textContent = "Non connecté";
      getTopbarContainer().appendChild(badge);
    }

    if (!document.getElementById("auth-modal-backdrop")) {
      const modal = document.createElement("div");
      modal.id = "auth-modal-backdrop";
      modal.className = "auth-modal-backdrop";
      modal.innerHTML = `
        <div class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <h2 id="auth-title">Connexion RailReporters</h2>
          <p>
            Connectez-vous pour publier un report, ajouter des commentaires et préparer la future version communautaire.
          </p>

          <label for="auth-email">Email</label>
          <input id="auth-email" type="email" placeholder="Votre email" autocomplete="email" />

          <label for="auth-password">Mot de passe</label>
          <input id="auth-password" type="password" placeholder="Mot de passe" autocomplete="current-password" />

          <div class="auth-actions">
            <button id="auth-login" class="auth-primary" type="button">Se connecter</button>
            <button id="auth-signup" class="auth-light" type="button">Créer un compte</button>
            <button id="auth-logout" class="auth-secondary" type="button">Se déconnecter</button>
            <button id="auth-close" class="auth-light" type="button">Fermer</button>
          </div>

          <div id="auth-message" class="auth-message">En attente de connexion...</div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    loginButton.addEventListener("click", openAuthModal);
  }

  function getAuthElements() {
    return {
      badge: document.getElementById("auth-status-badge"),
      modal: document.getElementById("auth-modal-backdrop"),
      email: document.getElementById("auth-email"),
      password: document.getElementById("auth-password"),
      login: document.getElementById("auth-login"),
      signup: document.getElementById("auth-signup"),
      logout: document.getElementById("auth-logout"),
      close: document.getElementById("auth-close"),
      message: document.getElementById("auth-message")
    };
  }

  function setAuthMessage(text, type = "") {
    const { message } = getAuthElements();
    if (!message) return;
    message.textContent = text;
    message.className = "auth-message";
    if (type === "ok") message.classList.add("ok");
    if (type === "error") message.classList.add("error");
  }

  function openAuthModal() {
    const { modal } = getAuthElements();
    if (modal) modal.classList.add("visible");
  }

  function closeAuthModal() {
    const { modal } = getAuthElements();
    if (modal) modal.classList.remove("visible");
  }

  function updateAuthDisplay() {
    const loginButton = document.querySelector(".login-button");
    const { badge } = getAuthElements();
    if (!loginButton || !badge) return;

    if (!currentUser) {
      badge.className = "auth-status-badge";
      badge.textContent = "Non connecté";
      loginButton.textContent = "Se connecter";
      hiddenReports = [];
      hiddenComments = [];
      adminUsers = [];
      moderationReports = [];
      if (adminHiddenReportsSection) {
        adminHiddenReportsSection.style.display = "none";
      }
      if (adminHiddenCommentsSection) {
        adminHiddenCommentsSection.style.display = "none";
      }
      if (adminUsersSection) {
        adminUsersSection.style.display = "none";
      }
      if (adminModerationReportsSection) {
        adminModerationReportsSection.style.display = "none";
      }
      if (adminDashboardSection) {
        adminDashboardSection.style.display = "none";
      }
      return;
    }

    const label = currentProfile?.username || currentUser.email || "Utilisateur";
    const role = currentProfile?.role ? ` · ${currentProfile.role}` : "";
    badge.textContent = `Connecté : ${label}${role}`;
    badge.className = "auth-status-badge";
    if (currentProfile?.role === "admin") badge.classList.add("admin");
    loginButton.textContent = "Mon compte";
  }

  async function loadProfile(user) {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("username, role, is_banned, avatar_url")
      .eq("id", user.id)
      .single();
    if (error) throw error;
    return data;
  }

  async function refreshSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error || !data.session) {
      currentUser = null;
      currentProfile = null;
      updateAuthDisplay();
      return;
    }
    currentUser = data.session.user;
    currentProfile = await loadProfile(currentUser);
    updateAuthDisplay();
  }

  async function handleLogin() {
    const { email, password, login } = getAuthElements();
    const userEmail = email.value.trim();
    const userPassword = password.value;

    if (!userEmail || !userPassword) {
      setAuthMessage("Merci de saisir un email et un mot de passe.", "error");
      return;
    }

    login.disabled = true;
    setAuthMessage("Connexion en cours...");

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
      });

      if (error) {
        setAuthMessage("Erreur de connexion :\n" + getFriendlySupabaseError(error, "auth"), "error");
        return;
      }

      currentUser = data.user;
      currentProfile = await loadProfile(currentUser);
      updateAuthDisplay();
      setAuthMessage(
        "Connexion réussie ✅\n\n" +
        "Email : " + currentUser.email + "\n" +
        "Username : " + currentProfile.username + "\n" +
        "Rôle : " + currentProfile.role + "\n" +
        "Banni : " + currentProfile.is_banned,
        "ok"
      );
      chargerReportsSupabase();
    } catch (error) {
      setAuthMessage("Erreur technique :\n" + getFriendlySupabaseError(error, "auth"), "error");
    } finally {
      login.disabled = false;
    }
  }

  async function handleSignup() {
    const { email, password, signup } = getAuthElements();
    const userEmail = email.value.trim();
    const userPassword = password.value;

    if (!userEmail || !userPassword) {
      setAuthMessage("Merci de saisir un email et un mot de passe pour créer un compte.", "error");
      return;
    }

    signup.disabled = true;
    setAuthMessage("Création du compte en cours...");

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email: userEmail,
        password: userPassword,
        options: {
          data: {
            username: userEmail.split("@")[0]
          }
        }
      });

      if (error) {
        setAuthMessage("Erreur création compte :\n" + getFriendlySupabaseError(error, "auth"), "error");
        return;
      }

      if (data.session && data.user) {
        currentUser = data.user;
        currentProfile = await loadProfile(currentUser);
        updateAuthDisplay();
        setAuthMessage("Compte créé et connecté ✅", "ok");
        chargerReportsSupabase();
      } else {
        setAuthMessage("Compte créé. Vérifiez votre email si une confirmation est demandée.", "ok");
      }
    } catch (error) {
      setAuthMessage("Erreur technique :\n" + getFriendlySupabaseError(error, "auth"), "error");
    } finally {
      signup.disabled = false;
    }
  }

  async function handleLogout() {
    await supabaseClient.auth.signOut();
    currentUser = null;
    currentProfile = null;
    updateAuthDisplay();
    setAuthMessage("Déconnexion effectuée.", "ok");
  }

  function initializeAuth() {
    const { modal, login, signup, logout, close } = getAuthElements();
    login.addEventListener("click", handleLogin);
    signup.addEventListener("click", handleSignup);
    logout.addEventListener("click", handleLogout);
    close.addEventListener("click", closeAuthModal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeAuthModal();
    });
    supabaseClient.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        currentUser = null;
        currentProfile = null;
        updateAuthDisplay();
      }
    });
  }

  function showPublicationForm() {
    if (createReportSection) {
      createReportSection.classList.add("visible");
      createReportSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  function protectPublishLinks() {
    publishLinks.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        if (!currentUser) {
          openAuthModal();
          setAuthMessage("Connectez-vous pour publier un report.", "error");
          return;
        }
        showPublicationForm();
      });
    });
  }

  function getSectionDefinitions() {
    return [
      { section_type: "station_arrival", title: "Arrivée en gare", contentId: "station-arrival-text", photoInputId: "station-arrival-photo", position: 1 },
      { section_type: "station_experience", title: "Expérience en gare", contentId: "station-experience-text", photoInputId: "station-experience-photo", position: 2 },
      { section_type: "boarding", title: "Embarquement", contentId: "boarding-text", photoInputId: "boarding-photo", position: 3 },
      { section_type: "onboard", title: "À bord du train", contentId: "onboard-text", photoInputId: "onboard-photo", position: 4 },
      { section_type: "services", title: "Services à bord", contentId: "services-text", photoInputId: "services-photo", position: 5 },
      { section_type: "arrival", title: "Arrivée à destination", contentId: "arrival-text", photoInputId: "arrival-photo", position: 6 }
    ];
  }

  function compressImageToBlob(file, maxWidth = 1600, maxHeight = 1600, quality = 0.82) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const image = new Image();
        image.onload = function () {
          let width = image.width;
          let height = image.height;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, width, height);
          canvas.toBlob(function (blob) {
            if (!blob) {
              reject(new Error("Compression image impossible."));
              return;
            }
            resolve(blob);
          }, "image/jpeg", quality);
        };
        image.onerror = function () {
          reject(new Error("Image illisible."));
        };
        image.src = event.target.result;
      };
      reader.onerror = function () {
        reject(new Error("Lecture image impossible."));
      };
      reader.readAsDataURL(file);
    });
  }

  async function uploadPhotoSupabase({ file, userId, reportId, sectionType, originalName }) {
    const blob = await compressImageToBlob(file);
    const fileName = `${cleanSegment(sectionType)}-${Date.now()}-${cleanFileBase(originalName)}.jpg`;
    const path = `${userId}/${reportId}/${fileName}`;
    const { data, error } = await supabaseClient.storage
      .from("report-photos")
      .upload(path, blob, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/jpeg"
      });
    if (error) throw new Error(getFriendlySupabaseError(error, "upload"));
    const { data: publicData } = supabaseClient.storage
      .from("report-photos")
      .getPublicUrl(data.path);
    return { path: data.path, publicUrl: publicData.publicUrl };
  }

  function installerMessagePublicationSupabase() {
    if (!form || document.getElementById("real-form-supabase-status")) return;
    const publishButton = form.querySelector(".publish-button");
    const status = document.createElement("div");
    status.id = "real-form-supabase-status";
    status.className = "real-form-supabase-status";
    status.textContent = "V2 beta : ce formulaire publie dans Supabase.";
    if (publishButton) publishButton.insertAdjacentElement("afterend", status);
  }

  async function publierVraiFormulaireDansSupabase(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    if (!currentUser) {
      openAuthModal();
      setAuthMessage("Connectez-vous pour publier un report.", "error");
      return;
    }

    if (isCurrentUserBanned()) {
      setPublicationStatus("Votre compte est actuellement bloqué. Vous ne pouvez pas publier de report. Contactez l’administrateur RailReporters si vous pensez qu’il s’agit d’une erreur.", "error");
      return;
    }

    const publishButton = form.querySelector(".publish-button");
    const originalText = publishButton ? publishButton.textContent : "Publier le report";

    const title = getInputValue("title");
    const train = getInputValue("train");
    const operator = getInputValue("operator");
    const departureStation = getInputValue("depart");
    const departureTime = getInputValue("heure-depart") || null;
    const arrivalStation = getInputValue("arrivee");
    const arrivalTime = getInputValue("heure-arrivee") || null;
    const travelDate = getInputValue("date");
    const travelClass = getInputValue("classe");
    const conclusion = getInputValue("conclusion");
    const rating = Number(getInputValue("rating"));

    const missing = [];
    if (!title) missing.push("Titre du report");
    if (!train) missing.push("Train");
    if (!operator) missing.push("Opérateur");
    if (!departureStation) missing.push("Gare de départ");
    if (!arrivalStation) missing.push("Gare d’arrivée");
    if (!travelDate) missing.push("Date du voyage");
    if (!conclusion) missing.push("Conclusion");
    if (!rating) missing.push("Note globale");

    if (missing.length > 0) {
      setPublicationStatus("Champs obligatoires manquants :\n- " + missing.join("\n- "), "error");
      return;
    }

    if (publishButton) {
      publishButton.disabled = true;
      publishButton.textContent = "Publication Supabase en cours...";
    }

    try {
      setPublicationStatus("1/6 — Création du report en brouillon...");
      const { data: reportData, error: reportError } = await supabaseClient
        .from("reports")
        .insert({
          user_id: currentUser.id,
          title,
          train,
          operator,
          departure_station: departureStation,
          departure_time: departureTime,
          arrival_station: arrivalStation,
          arrival_time: arrivalTime,
          travel_date: travelDate,
          travel_class: travelClass || null,
          rating,
          conclusion,
          status: "draft"
        })
        .select("id")
        .single();

      if (reportError) throw reportError;
      const reportId = reportData.id;

      setPublicationStatus("2/6 — Création des sections...");
      const sectionDefinitions = getSectionDefinitions();
      const sectionsToInsert = sectionDefinitions
        .filter(function (section) {
          return getInputValue(section.contentId) || getInputFile(section.photoInputId);
        })
        .map(function (section) {
          return {
            report_id: reportId,
            section_type: section.section_type,
            title: section.title,
            content: getInputValue(section.contentId) || "",
            position: section.position
          };
        });

      let createdSections = [];
      if (sectionsToInsert.length > 0) {
        const { data: sectionsData, error: sectionsError } = await supabaseClient
          .from("report_sections")
          .insert(sectionsToInsert)
          .select("id, section_type, title, position");
        if (sectionsError) throw sectionsError;
        createdSections = sectionsData || [];
      }

      const sectionIdByType = {};
      createdSections.forEach(function (section) {
        sectionIdByType[section.section_type] = section.id;
      });

      const photoRows = [];
      const coverPhoto = getInputFile("cover-photo");

      if (coverPhoto) {
        setPublicationStatus("3/6 — Upload de la photo d’accueil...");
        const uploadedCover = await uploadPhotoSupabase({
          file: coverPhoto,
          userId: currentUser.id,
          reportId,
          sectionType: "cover",
          originalName: coverPhoto.name
        });
        await supabaseClient.from("reports").update({ cover_photo_url: uploadedCover.publicUrl }).eq("id", reportId);
        photoRows.push({
          report_id: reportId,
          section_id: null,
          user_id: currentUser.id,
          photo_url: uploadedCover.publicUrl,
          caption: "Photo d’accueil du report",
          position: 0
        });
      }

      for (const section of sectionDefinitions) {
        const file = getInputFile(section.photoInputId);
        const sectionId = sectionIdByType[section.section_type];
        if (!file || !sectionId) continue;

        setPublicationStatus("4/6 — Upload photo : " + section.title + "...");
        const uploaded = await uploadPhotoSupabase({
          file,
          userId: currentUser.id,
          reportId,
          sectionType: section.section_type,
          originalName: file.name
        });
        photoRows.push({
          report_id: reportId,
          section_id: sectionId,
          user_id: currentUser.id,
          photo_url: uploaded.publicUrl,
          caption: section.title,
          position: section.position
        });
      }

      if (photoRows.length > 0) {
        setPublicationStatus("5/6 — Enregistrement des photos...");
        const { error: photoError } = await supabaseClient.from("report_photos").insert(photoRows);
        if (photoError) throw photoError;
      }

      setPublicationStatus("6/6 — Publication du report...");
      const { error: publishError } = await supabaseClient
        .from("reports")
        .update({ status: "published" })
        .eq("id", reportId);
      if (publishError) throw publishError;

      form.reset();
      if (createReportSection) createReportSection.classList.remove("visible");

      await chargerReportsSupabase();
      const reportsSection = document.getElementById("reports");
      if (reportsSection) reportsSection.scrollIntoView({ behavior: "smooth" });

      setPublicationStatus(
        "Report publié dans Supabase ✅\n\n" +
        "Report ID : " + reportId + "\n" +
        "Sections créées : " + createdSections.length + "\n" +
        "Photos enregistrées : " + photoRows.length + "\n" +
        "Statut : published",
        "ok"
      );
    } catch (error) {
      setPublicationStatus("Erreur pendant la publication :\n" + getFriendlySupabaseError(error, "publish") + "\n\nLe report peut être resté en brouillon si une étape a échoué.", "error");
    } finally {
      if (publishButton) {
        publishButton.disabled = false;
        publishButton.textContent = originalText;
      }
    }
  }

  async function chargerReportsSupabase(preserveOpenedId = true) {
    if (!reportsList || !emptyState) return;

    emptyState.style.display = "block";
    emptyState.textContent = "Chargement des reports Supabase...";
    reportsList.innerHTML = "";

    try {
      const { data: reportsData, error: reportsError } = await supabaseClient
        .from("reports")
        .select(`
          id,
          user_id,
          title,
          train,
          operator,
          departure_station,
          departure_time,
          arrival_station,
          arrival_time,
          travel_date,
          travel_class,
          cover_photo_url,
          rating,
          conclusion,
          status,
          created_at,
          profiles (
            username,
            role,
            avatar_url
          )
        `)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(50);

      if (reportsError) throw reportsError;

      const reportIds = (reportsData || []).map(function (report) { return report.id; });

      let sections = [];
      let photos = [];
      let comments = [];

      if (reportIds.length > 0) {
        const sectionsRes = await supabaseClient
          .from("report_sections")
          .select("id, report_id, section_type, title, content, position")
          .in("report_id", reportIds)
          .order("position", { ascending: true });
        if (sectionsRes.error) throw sectionsRes.error;
        sections = sectionsRes.data || [];

        const photosRes = await supabaseClient
          .from("report_photos")
          .select("id, report_id, section_id, photo_url, caption, position")
          .in("report_id", reportIds)
          .order("position", { ascending: true });
        if (photosRes.error) throw photosRes.error;
        photos = photosRes.data || [];

        const commentsRes = await supabaseClient
          .from("comments")
          .select(`
            id,
            report_id,
            user_id,
            content,
            created_at,
            status,
            profiles (
              username,
              role,
              avatar_url
            )
          `)
          .in("report_id", reportIds)
          .eq("status", "published")
          .order("created_at", { ascending: true });
        if (commentsRes.error) throw commentsRes.error;
        comments = commentsRes.data || [];
      }

      reports = (reportsData || []).map(function (report) {
        return {
          ...report,
          sections: sections.filter(function (section) { return section.report_id === report.id; }),
          photos: photos.filter(function (photo) { return photo.report_id === report.id; }),
          comments: comments.filter(function (comment) { return comment.report_id === report.id; })
        };
      });

      if (!preserveOpenedId) openedReportId = null;
      afficherReportsSupabase();
      chargerReportsMasquesAdmin().catch(function (hiddenError) {
        console.warn("Erreur chargement reports masqués admin", hiddenError);
      });
      chargerCommentairesMasquesAdmin().catch(function (hiddenCommentError) {
        console.warn("Erreur chargement commentaires masqués admin", hiddenCommentError);
      });
      chargerUtilisateursAdmin().catch(function (usersError) {
        console.warn("Erreur chargement utilisateurs admin", usersError);
      });
      chargerSignalementsAdmin().catch(function (moderationError) {
        console.warn("Erreur chargement signalements admin", moderationError);
      });
    } catch (error) {
      emptyState.style.display = "block";
      emptyState.textContent = "Erreur Supabase : " + getFriendlySupabaseError(error, "read");
    }
  }

  function reportMatchesSearch(report) {
    if (!searchQuery.trim()) return true;
    const haystack = [
      report.title,
      report.train,
      report.operator,
      report.departure_station,
      report.arrival_station,
      report.travel_class,
      report.travel_date,
      report.profiles?.username
    ].join(" ").toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  }

  function getCoverHtml(report) {
    const cover = report.cover_photo_url || (report.photos || []).find(function (photo) { return !photo.section_id; })?.photo_url || (report.photos || [])[0]?.photo_url;
    if (cover) {
      return `<img src="${escapeHtml(cover)}" class="summary-cover" alt="Photo d’accueil du report">`;
    }
    return `<div class="summary-cover summary-cover-placeholder">🚆</div>`;
  }

  function creerTrainTGV() {
    return `
      <div class="route-train">
        <svg class="tgv-icon" viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="tgvBodyGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="55%" stop-color="#edf3fb"/>
              <stop offset="100%" stop-color="#d6e2f0"/>
            </linearGradient>
            <linearGradient id="tgvBlueGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#1d4ed8"/>
              <stop offset="100%" stop-color="#0f3c68"/>
            </linearGradient>
          </defs>
          <ellipse cx="120" cy="69" rx="84" ry="5" fill="rgba(15, 23, 42, 0.18)" />
          <circle cx="68" cy="58" r="6" fill="#1f2937"/>
          <circle cx="158" cy="58" r="6" fill="#1f2937"/>
          <rect x="44" y="48" width="128" height="8" rx="4" fill="#27364c"/>
          <path d="M28 46 L38 26 Q42 16 58 16 L142 16 Q160 16 176 26 L207 43 Q219 50 211 55 Q205 59 188 59 L42 59 Q29 59 25 53 Q23 49 28 46 Z" fill="url(#tgvBodyGradient)" stroke="#9aacbf" stroke-width="2" />
          <path d="M176 26 L207 43 Q219 50 211 55 Q205 59 188 59 L168 59 Q176 44 176 26 Z" fill="url(#tgvBlueGradient)" />
          <rect x="50" y="35" width="118" height="6" rx="3" fill="#1d4ed8"/>
          <rect x="58" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>
          <rect x="84" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>
          <rect x="110" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>
          <rect x="136" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>
          <path d="M182 31 Q192 32 202 41 L184 41 Q179 41 178 36 Q177 32 182 31 Z" fill="#b7ddff" />
          <path d="M38 26 Q44 16 58 16 L66 16 Q54 23 49 35 L28 46 Z" fill="#f9fbff" opacity="0.9" />
        </svg>
      </div>`;
  }

  function creerCarteTrajet(report) {
    return `
      <div class="route-card">
        <h4>Carte du trajet</h4>
        <div class="route-cities">
          <div class="city city-start">
            <span class="city-name">${escapeHtml(report.departure_station)}</span>
            <span class="city-role">Départ${report.departure_time ? " · " + escapeHtml(report.departure_time.slice(0, 5)) : ""}</span>
          </div>
          <div class="city city-end">
            <span class="city-name">${escapeHtml(report.arrival_station)}</span>
            <span class="city-role">Arrivée${report.arrival_time ? " · " + escapeHtml(report.arrival_time.slice(0, 5)) : ""}</span>
          </div>
        </div>
        <div class="route-track">
          <div class="route-line"></div>
          ${creerTrainTGV()}
        </div>
      </div>`;
  }

  function creerSectionsHtml(report) {
    if (!report.sections || report.sections.length === 0) {
      return "";
    }

    return report.sections.map(function (section) {
      const sectionPhotos = (report.photos || []).filter(function (photo) { return photo.section_id === section.id; });
      const photosHtml = sectionPhotos.map(function (photo) {
        return `<img src="${escapeHtml(photo.photo_url)}" class="section-photo" alt="${escapeHtml(photo.caption || section.title)}">`;
      }).join("");

      return `
        <div class="report-section">
          <h4>${escapeHtml(section.title)}</h4>
          ${photosHtml}
          ${section.content ? `<p>${escapeHtml(section.content)}</p>` : ""}
        </div>`;
    }).join("");
  }

  function creerSignalementReportHtml(report) {
    if (!currentUser) {
      return `
        <div class="report-section report-signal-section">
          <h4>Signaler ce report</h4>
          <p>Vous devez être connecté pour signaler un contenu à l’équipe RailReporters.</p>
          <button type="button" class="signal-login-button" data-report-id="${escapeHtml(report.id)}">
            Se connecter pour signaler
          </button>
        </div>`;
    }

    if (isCurrentUserBanned()) {
      return `
        <div class="report-section report-signal-section">
          <h4>Signaler ce report</h4>
          <p>Votre compte est actuellement bloqué. Vous ne pouvez pas envoyer de signalement.</p>
        </div>`;
    }

    return `
      <div class="report-section report-signal-section">
        <h4>Signaler ce report</h4>
        <p>Utilisez ce formulaire uniquement pour signaler un contenu problématique. Le report ne sera pas supprimé automatiquement : l’administrateur vérifiera le signalement.</p>
        <form class="report-signal-form" data-report-id="${escapeHtml(report.id)}" data-report-title="${escapeHtml(report.title)}">
          <label>Raison du signalement</label>
          <select class="signal-reason" required>
            <option value="">Choisir une raison</option>
            <option value="spam">Spam</option>
            <option value="insulte">Insulte ou manque de respect</option>
            <option value="contenu_hors_sujet">Contenu hors sujet</option>
            <option value="contenu_inadapte">Contenu inadapté</option>
            <option value="autre">Autre raison</option>
          </select>
          <label>Détails optionnels</label>
          <textarea class="signal-details" rows="3" placeholder="Ajoutez une précision si nécessaire..."></textarea>
          <button type="submit">Envoyer le signalement</button>
          <p class="signal-status" aria-live="polite"></p>
        </form>
      </div>`;
  }


  function creerSignalementCommentaireHtml(report, comment) {
    if (!currentUser) {
      return `
        <div class="comment-signal-block">
          <button type="button" class="signal-login-button comment-signal-login-button" data-comment-id="${escapeHtml(comment.id)}">
            Se connecter pour signaler ce commentaire
          </button>
        </div>`;
    }

    if (isCurrentUserBanned()) {
      return `
        <div class="comment-signal-block">
          <p class="comment-signal-message">Votre compte est actuellement bloqué. Vous ne pouvez pas envoyer de signalement.</p>
        </div>`;
    }

    return `
      <details class="comment-signal-details">
        <summary>Signaler ce commentaire</summary>
        <form class="comment-signal-form" data-comment-id="${escapeHtml(comment.id)}" data-report-id="${escapeHtml(report.id)}" data-comment-author="${escapeHtml(getAuthorLabel(comment.profiles))}">
          <label>Raison du signalement</label>
          <select class="signal-reason" required>
            <option value="">Choisir une raison</option>
            <option value="spam">Spam</option>
            <option value="insulte">Insulte ou manque de respect</option>
            <option value="contenu_hors_sujet">Contenu hors sujet</option>
            <option value="contenu_inadapte">Contenu inadapté</option>
            <option value="autre">Autre raison</option>
          </select>
          <label>Détails optionnels</label>
          <textarea class="signal-details" rows="3" placeholder="Ajoutez une précision si nécessaire..."></textarea>
          <button type="submit">Envoyer le signalement</button>
          <p class="signal-status" aria-live="polite"></p>
        </form>
      </details>`;
  }

  function creerCommentairesHtml(report) {
    const comments = report.comments || [];
    const listHtml = comments.length === 0
      ? `<p class="no-comments">Aucun commentaire pour le moment.</p>`
      : comments.map(function (comment) {
          const adminButton = canCurrentUserManageComments()
            ? `<div class="admin-comment-actions">
                <button
                  class="admin-hide-comment-button"
                  data-comment-id="${escapeHtml(comment.id)}"
                  data-report-id="${escapeHtml(report.id)}"
                  data-comment-author="${escapeHtml(getAuthorLabel(comment.profiles))}"
                >
                  Masquer ce commentaire
                </button>
              </div>`
            : "";
          const signalHtml = creerSignalementCommentaireHtml(report, comment);

          return `
            <div class="comment">
              <span class="comment-author">${escapeHtml(getAuthorLabel(comment.profiles))}</span>
              <p>${escapeHtml(comment.content)}</p>
              <span>${comment.created_at ? escapeHtml(formaterDate(comment.created_at.slice(0, 10))) : ""}</span>
              ${adminButton}
              ${signalHtml}
            </div>`;
        }).join("");

    return `
      <div class="interaction-section">
        <h4>Commentaires</h4>
        <form class="comment-form" data-report-id="${escapeHtml(report.id)}">
          <textarea class="comment-input" placeholder="Écrire un commentaire..." rows="3" required></textarea>
          <button type="submit">Publier le commentaire</button>
        </form>
        <div class="comments-list">
          ${listHtml}
        </div>
      </div>`;
  }

  function canCurrentUserManageReports() {
    const role = currentProfile && currentProfile.role;
    return Boolean(currentUser && !isCurrentUserBanned() && (role === "admin" || role === "moderator"));
  }

  function canCurrentUserManageComments() {
    const role = currentProfile && currentProfile.role;
    return Boolean(currentUser && !isCurrentUserBanned() && (role === "admin" || role === "moderator"));
  }

  function canCurrentUserManageUsers() {
    const role = currentProfile && currentProfile.role;
    return Boolean(currentUser && !isCurrentUserBanned() && role === "admin");
  }

  function canCurrentUserManageModerationReports() {
    const role = currentProfile && currentProfile.role;
    return Boolean(currentUser && !isCurrentUserBanned() && (role === "admin" || role === "moderator"));
  }


  function ensureAdminDashboardSection() {
    if (adminDashboardSection) return adminDashboardSection;

    const reportsSection = document.getElementById("reports");
    if (!reportsSection || !reportsSection.parentNode) return null;

    adminDashboardSection = document.createElement("section");
    adminDashboardSection.id = "admin-dashboard-section";
    adminDashboardSection.className = "content-section admin-dashboard-section";
    adminDashboardSection.style.display = "none";
    adminDashboardSection.innerHTML = `
      <div class="admin-dashboard-hero">
        <div>
          <span class="admin-dashboard-kicker">Administration</span>
          <h2>Espace admin RailReporters</h2>
          <p>Centralise les contenus masqués et les actions de modération déjà validées.</p>
        </div>
        <div id="admin-dashboard-summary" class="admin-dashboard-summary">
          <div class="admin-dashboard-stat">
            <strong>0</strong>
            <span>reports masqués</span>
          </div>
          <div class="admin-dashboard-stat">
            <strong>0</strong>
            <span>commentaires masqués</span>
          </div>
          <div class="admin-dashboard-stat">
            <strong>0</strong>
            <span>utilisateurs</span>
          </div>
          <div class="admin-dashboard-stat">
            <strong>0</strong>
            <span>signalements</span>
          </div>
        </div>
      </div>
      <div class="admin-dashboard-note">
        Les actions de modération restent protégées côté Supabase par RLS. Les contenus sont masqués, pas supprimés définitivement.
      </div>
      <div id="admin-dashboard-grid" class="admin-dashboard-grid"></div>
    `;

    reportsSection.parentNode.insertBefore(adminDashboardSection, reportsSection.nextSibling);

    adminDashboardSummary = adminDashboardSection.querySelector("#admin-dashboard-summary");
    adminDashboardGrid = adminDashboardSection.querySelector("#admin-dashboard-grid");

    return adminDashboardSection;
  }

  function updateAdminDashboardSummary() {
    if (!adminDashboardSummary) return;

    const pendingModerationReports = moderationReports.filter(function (item) {
      return item.status === "pending";
    }).length;

    adminDashboardSummary.innerHTML = `
      <div class="admin-dashboard-stat">
        <strong>${hiddenReports.length}</strong>
        <span>${hiddenReports.length > 1 ? "reports masqués" : "report masqué"}</span>
      </div>
      <div class="admin-dashboard-stat">
        <strong>${hiddenComments.length}</strong>
        <span>${hiddenComments.length > 1 ? "commentaires masqués" : "commentaire masqué"}</span>
      </div>
      <div class="admin-dashboard-stat">
        <strong>${adminUsers.length}</strong>
        <span>${adminUsers.length > 1 ? "utilisateurs" : "utilisateur"}</span>
      </div>
      <div class="admin-dashboard-stat">
        <strong>${pendingModerationReports}</strong>
        <span>${pendingModerationReports > 1 ? "signalements en attente" : "signalement en attente"}</span>
      </div>
    `;
  }

  function updateAdminDashboardVisibility() {
    const section = ensureAdminDashboardSection();
    if (!section) return;

    const isAdminLike = canCurrentUserManageReports() || canCurrentUserManageComments() || canCurrentUserManageUsers() || canCurrentUserManageModerationReports();
    section.style.display = isAdminLike ? "block" : "none";

    if (!isAdminLike) {
      if (adminHiddenReportsSection) adminHiddenReportsSection.style.display = "none";
      if (adminHiddenCommentsSection) adminHiddenCommentsSection.style.display = "none";
      if (adminUsersSection) adminUsersSection.style.display = "none";
      if (adminModerationReportsSection) adminModerationReportsSection.style.display = "none";
    }

    updateAdminDashboardSummary();
  }

  function creerAdminReportActionsHtml(report) {
    if (!canCurrentUserManageReports()) return "";

    return `
      <div class="report-section admin-report-actions">
        <h4>Modération admin</h4>
        <p>Ce report est actuellement visible publiquement.</p>
        <button class="admin-hide-report-button" data-report-id="${escapeHtml(report.id)}" data-report-title="${escapeHtml(report.title)}">
          Masquer ce report
        </button>
        <p class="admin-help-text">Le report passera en statut hidden et ne sera plus visible publiquement. Les photos et commentaires restent conservés.</p>
      </div>`;
  }

  
  function ensureAdminHiddenReportsSection() {
    if (adminHiddenReportsSection) return adminHiddenReportsSection;

    const dashboard = ensureAdminDashboardSection();
    if (!dashboard || !adminDashboardGrid) return null;

    adminHiddenReportsSection = document.createElement("section");
    adminHiddenReportsSection.id = "admin-hidden-reports-section";
    adminHiddenReportsSection.className = "admin-dashboard-panel admin-hidden-reports-section";
    adminHiddenReportsSection.style.display = "none";
    adminHiddenReportsSection.innerHTML = `
      <div class="admin-panel-header">
        <div>
          <span class="admin-panel-kicker">Reports</span>
          <h3>Reports masqués</h3>
        </div>
        <p>Restaurer un report passé en hidden.</p>
      </div>
      <p id="admin-hidden-reports-empty" class="empty-state">Aucun report masqué pour le moment.</p>
      <div id="admin-hidden-reports-list" class="admin-hidden-reports-list"></div>
    `;

    adminDashboardGrid.appendChild(adminHiddenReportsSection);

    adminHiddenReportsList = adminHiddenReportsSection.querySelector("#admin-hidden-reports-list");
    adminHiddenReportsEmpty = adminHiddenReportsSection.querySelector("#admin-hidden-reports-empty");

    return adminHiddenReportsSection;
  }

  function creerAdminHiddenReportCardHtml(report) {
    return `
      <article class="admin-hidden-report-card">
        <div>
          <span class="admin-hidden-report-status">hidden</span>
          <h3>${escapeHtml(report.title)}</h3>
          <p class="author-line">Par ${escapeHtml(getAuthorLabel(report.profiles))}</p>
          <p>
            <strong>${escapeHtml(report.train || "Train non renseigné")}</strong>${report.operator ? " · " + escapeHtml(report.operator) : ""}
            <br>
            ${escapeHtml(report.departure_station || "Départ non renseigné")} → ${escapeHtml(report.arrival_station || "Arrivée non renseignée")}
            <br>
            ${report.travel_date ? "Date : " + escapeHtml(formaterDate(report.travel_date)) : "Date non renseignée"}
          </p>
        </div>
        <button
          class="admin-restore-report-button"
          data-report-id="${escapeHtml(report.id)}"
          data-report-title="${escapeHtml(report.title)}"
        >
          Restaurer ce report
        </button>
      </article>`;
  }

  function afficherReportsMasquesAdmin() {
    const section = ensureAdminHiddenReportsSection();
    if (!section || !adminHiddenReportsList || !adminHiddenReportsEmpty) return;

    if (!canCurrentUserManageReports()) {
      section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    updateAdminDashboardVisibility();
    section.style.display = "block";
    adminHiddenReportsList.innerHTML = "";

    if (hiddenReports.length === 0) {
      adminHiddenReportsEmpty.style.display = "block";
      adminHiddenReportsEmpty.textContent = "Aucun report masqué pour le moment.";
      return;
    }

    adminHiddenReportsEmpty.style.display = "none";
    adminHiddenReportsList.innerHTML = hiddenReports.map(creerAdminHiddenReportCardHtml).join("");

    adminHiddenReportsList.querySelectorAll(".admin-restore-report-button").forEach(function (button) {
      button.addEventListener("click", async function () {
        const reportId = button.getAttribute("data-report-id");
        const reportTitle = button.getAttribute("data-report-title") || "ce report";

        if (!canCurrentUserManageReports()) {
          alert("Cette action est réservée à l’administrateur RailReporters.");
          return;
        }

        const confirmed = window.confirm(
          "Voulez-vous restaurer ce report ?\n\n" +
          reportTitle + "\n\n" +
          "Il redeviendra visible publiquement."
        );

        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Restauration...";

        try {
          const { error } = await supabaseClient
            .from("reports")
            .update({ status: "published" })
            .eq("id", reportId);

          if (error) throw error;

          openedReportId = reportId;
          await chargerReportsSupabase(false);
          await chargerReportsMasquesAdmin();
          alert("Report restauré avec succès.");
        } catch (error) {
          alert(getFriendlySupabaseError(error, "admin-restore-report"));
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });
  }

  async function chargerReportsMasquesAdmin() {
    const section = ensureAdminHiddenReportsSection();

    if (!canCurrentUserManageReports()) {
      hiddenReports = [];
      if (section) section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    if (section) {
      section.style.display = "block";
      if (adminHiddenReportsEmpty) {
        adminHiddenReportsEmpty.style.display = "block";
        adminHiddenReportsEmpty.textContent = "Chargement des reports masqués...";
      }
      if (adminHiddenReportsList) adminHiddenReportsList.innerHTML = "";
    }

    const { data, error } = await supabaseClient
      .from("reports")
      .select(`
        id,
        title,
        train,
        operator,
        departure_station,
        arrival_station,
        travel_date,
        status,
        created_at,
        profiles (
          username,
          role,
          avatar_url
        )
      `)
      .eq("status", "hidden")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      if (adminHiddenReportsEmpty) {
        adminHiddenReportsEmpty.style.display = "block";
        adminHiddenReportsEmpty.textContent = "Erreur chargement reports masqués : " + getFriendlySupabaseError(error, "read");
      }
      return;
    }

    hiddenReports = data || [];
    updateAdminDashboardSummary();
    afficherReportsMasquesAdmin();
  }


  
  function ensureAdminHiddenCommentsSection() {
    if (adminHiddenCommentsSection) return adminHiddenCommentsSection;

    const dashboard = ensureAdminDashboardSection();
    if (!dashboard || !adminDashboardGrid) return null;

    adminHiddenCommentsSection = document.createElement("section");
    adminHiddenCommentsSection.id = "admin-hidden-comments-section";
    adminHiddenCommentsSection.className = "admin-dashboard-panel admin-hidden-comments-section";
    adminHiddenCommentsSection.style.display = "none";
    adminHiddenCommentsSection.innerHTML = `
      <div class="admin-panel-header">
        <div>
          <span class="admin-panel-kicker">Commentaires</span>
          <h3>Commentaires masqués</h3>
        </div>
        <p>Restaurer un commentaire passé en hidden.</p>
      </div>
      <p id="admin-hidden-comments-empty" class="empty-state">Aucun commentaire masqué pour le moment.</p>
      <div id="admin-hidden-comments-list" class="admin-hidden-comments-list"></div>
    `;

    adminDashboardGrid.appendChild(adminHiddenCommentsSection);

    adminHiddenCommentsList = adminHiddenCommentsSection.querySelector("#admin-hidden-comments-list");
    adminHiddenCommentsEmpty = adminHiddenCommentsSection.querySelector("#admin-hidden-comments-empty");

    return adminHiddenCommentsSection;
  }

  function creerAdminHiddenCommentCardHtml(comment) {
    const report = comment.reports || {};
    const author = comment.profiles || {};
    const extrait = String(comment.content || "").length > 260
      ? String(comment.content || "").slice(0, 260) + "..."
      : String(comment.content || "");

    return `
      <article class="admin-hidden-comment-card">
        <div>
          <span class="admin-hidden-comment-status">hidden</span>
          <h3>Commentaire masqué</h3>
          <p class="author-line">Par ${escapeHtml(getAuthorLabel(author))}</p>
          <p class="admin-hidden-comment-content">“${escapeHtml(extrait)}”</p>
          <p>
            <strong>Report :</strong> ${escapeHtml(report.title || "Report non renseigné")}
            <br>
            ${report.departure_station || report.arrival_station
              ? `${escapeHtml(report.departure_station || "Départ non renseigné")} → ${escapeHtml(report.arrival_station || "Arrivée non renseignée")}`
              : "Trajet non renseigné"}
            <br>
            ${comment.created_at ? "Commentaire du : " + escapeHtml(formaterDate(comment.created_at.slice(0, 10))) : "Date non renseignée"}
          </p>
        </div>
        <button
          class="admin-restore-comment-button"
          data-comment-id="${escapeHtml(comment.id)}"
          data-report-id="${escapeHtml(comment.report_id)}"
          data-comment-author="${escapeHtml(getAuthorLabel(author))}"
        >
          Restaurer ce commentaire
        </button>
      </article>`;
  }

  function afficherCommentairesMasquesAdmin() {
    const section = ensureAdminHiddenCommentsSection();
    if (!section || !adminHiddenCommentsList || !adminHiddenCommentsEmpty) return;

    if (!canCurrentUserManageComments()) {
      section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    updateAdminDashboardVisibility();
    section.style.display = "block";
    adminHiddenCommentsList.innerHTML = "";

    if (hiddenComments.length === 0) {
      adminHiddenCommentsEmpty.style.display = "block";
      adminHiddenCommentsEmpty.textContent = "Aucun commentaire masqué pour le moment.";
      return;
    }

    adminHiddenCommentsEmpty.style.display = "none";
    adminHiddenCommentsList.innerHTML = hiddenComments.map(creerAdminHiddenCommentCardHtml).join("");

    adminHiddenCommentsList.querySelectorAll(".admin-restore-comment-button").forEach(function (button) {
      button.addEventListener("click", async function () {
        const commentId = button.getAttribute("data-comment-id");
        const reportId = button.getAttribute("data-report-id");
        const commentAuthor = button.getAttribute("data-comment-author") || "ce commentaire";

        if (!canCurrentUserManageComments()) {
          alert("Cette action est réservée à l’administrateur RailReporters.");
          return;
        }

        const confirmed = window.confirm(
          "Voulez-vous restaurer ce commentaire ?\n\n" +
          "Auteur : " + commentAuthor + "\n\n" +
          "Il redeviendra visible publiquement sous le report."
        );

        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Restauration...";

        try {
          const { error } = await supabaseClient
            .from("comments")
            .update({ status: "published" })
            .eq("id", commentId);

          if (error) throw error;

          openedReportId = reportId;
          await chargerReportsSupabase(true);
          await chargerCommentairesMasquesAdmin();
          alert("Commentaire restauré avec succès.");
        } catch (error) {
          alert(getFriendlySupabaseError(error, "admin-restore-comment"));
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });
  }

  async function chargerCommentairesMasquesAdmin() {
    const section = ensureAdminHiddenCommentsSection();

    if (!canCurrentUserManageComments()) {
      hiddenComments = [];
      if (section) section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    if (section) {
      section.style.display = "block";
      if (adminHiddenCommentsEmpty) {
        adminHiddenCommentsEmpty.style.display = "block";
        adminHiddenCommentsEmpty.textContent = "Chargement des commentaires masqués...";
      }
      if (adminHiddenCommentsList) adminHiddenCommentsList.innerHTML = "";
    }

    const { data, error } = await supabaseClient
      .from("comments")
      .select(`
        id,
        report_id,
        user_id,
        content,
        created_at,
        status,
        profiles (
          username,
          role,
          avatar_url
        ),
        reports (
          id,
          title,
          train,
          operator,
          departure_station,
          arrival_station,
          travel_date,
          status
        )
      `)
      .eq("status", "hidden")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      if (adminHiddenCommentsEmpty) {
        adminHiddenCommentsEmpty.style.display = "block";
        adminHiddenCommentsEmpty.textContent = "Erreur chargement commentaires masqués : " + getFriendlySupabaseError(error, "read");
      }
      return;
    }

    hiddenComments = data || [];
    updateAdminDashboardSummary();
    afficherCommentairesMasquesAdmin();
  }




  function getModerationContentTypeLabel(type) {
    if (type === "report") return "Report";
    if (type === "comment") return "Commentaire";
    if (type === "photo") return "Photo";
    if (type === "profile") return "Profil";
    return type || "Contenu";
  }

  function getModerationStatusLabel(status) {
    if (status === "pending") return "En attente";
    if (status === "reviewed") return "Examiné";
    if (status === "rejected") return "Rejeté";
    if (status === "action_taken") return "Action effectuée";
    return status || "Statut inconnu";
  }

  function getModerationReasonLabel(reason) {
    const labels = {
      spam: "Spam",
      insult: "Insulte ou manque de respect",
      harassment: "Harcèlement",
      discrimination: "Discrimination",
      inappropriate: "Contenu inadapté",
      off_topic: "Contenu hors sujet",
      personal_info: "Information personnelle",
      other: "Autre raison"
    };
    return labels[reason] || reason || "Raison non renseignée";
  }

  function getModerationReporterLabel(item) {
    if (item.reporter_profile) {
      return getAuthorLabel(item.reporter_profile);
    }
    if (item.reported_by) {
      return "Utilisateur " + String(item.reported_by).slice(0, 8) + "...";
    }
    return "Utilisateur inconnu";
  }

  function getModerationTargetLabel(item) {
    if (item.content_type === "report") {
      if (item.target_report) {
        return item.target_report.title || "Report sans titre";
      }
      return "Report " + String(item.content_id || "").slice(0, 8) + "...";
    }

    if (item.content_type === "comment") {
      if (item.target_comment) {
        const excerpt = (item.target_comment.content || "Commentaire").slice(0, 90);
        const reportTitle = item.target_report ? " — " + item.target_report.title : "";
        return excerpt + reportTitle;
      }
      return "Commentaire " + String(item.content_id || "").slice(0, 8) + "...";
    }

    return String(item.content_id || "Contenu non identifié");
  }

  function ensureAdminModerationReportsSection() {
    if (adminModerationReportsSection) return adminModerationReportsSection;

    const dashboard = ensureAdminDashboardSection();
    if (!dashboard || !adminDashboardGrid) return null;

    adminModerationReportsSection = document.createElement("section");
    adminModerationReportsSection.id = "admin-moderation-reports-section";
    adminModerationReportsSection.className = "admin-dashboard-panel admin-moderation-reports-section";
    adminModerationReportsSection.style.display = "none";
    adminModerationReportsSection.innerHTML = `
      <div class="admin-panel-header">
        <div>
          <span class="admin-panel-kicker">Signalements</span>
          <h3>Signalements</h3>
        </div>
        <p>Consulter les signalements et changer leur statut.</p>
      </div>
      <p id="admin-moderation-reports-empty" class="empty-state">Aucun signalement pour le moment.</p>
      <div id="admin-moderation-reports-list" class="admin-moderation-reports-list"></div>
    `;

    adminDashboardGrid.appendChild(adminModerationReportsSection);

    adminModerationReportsList = adminModerationReportsSection.querySelector("#admin-moderation-reports-list");
    adminModerationReportsEmpty = adminModerationReportsSection.querySelector("#admin-moderation-reports-empty");

    return adminModerationReportsSection;
  }

  function creerAdminModerationReportCardHtml(item) {
    const createdAt = item.created_at ? formaterDate(String(item.created_at).slice(0, 10)) : "Date inconnue";
    const details = item.details ? `<p class="admin-moderation-details">${escapeHtml(item.details)}</p>` : `<p class="admin-moderation-details muted">Aucun détail complémentaire.</p>`;
    const status = item.status || "pending";

    return `
      <article class="admin-moderation-report-card status-${escapeHtml(status)}">
        <div class="admin-moderation-report-main">
          <div class="admin-moderation-report-titleline">
            <span class="admin-moderation-type">${escapeHtml(getModerationContentTypeLabel(item.content_type))}</span>
            <span class="admin-moderation-status status-${escapeHtml(status)}">${escapeHtml(getModerationStatusLabel(status))}</span>
          </div>
          <h3>${escapeHtml(getModerationReasonLabel(item.reason))}</h3>
          <p>
            <strong>Contenu :</strong> ${escapeHtml(getModerationTargetLabel(item))}
            <br>
            <strong>Signalé par :</strong> ${escapeHtml(getModerationReporterLabel(item))}
            <br>
            <strong>Date :</strong> ${escapeHtml(createdAt)}
          </p>
          ${details}
        </div>
        <div class="admin-moderation-actions">
          <button class="admin-moderation-status-button" data-report-id="${escapeHtml(item.id)}" data-status="reviewed">Marquer comme examiné</button>
          <button class="admin-moderation-status-button secondary" data-report-id="${escapeHtml(item.id)}" data-status="rejected">Rejeter</button>
          <button class="admin-moderation-status-button success" data-report-id="${escapeHtml(item.id)}" data-status="action_taken">Action effectuée</button>
        </div>
      </article>`;
  }

  function afficherSignalementsAdmin() {
    const section = ensureAdminModerationReportsSection();
    if (!section || !adminModerationReportsList || !adminModerationReportsEmpty) return;

    if (!canCurrentUserManageModerationReports()) {
      moderationReports = [];
      section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    updateAdminDashboardVisibility();
    section.style.display = "block";
    adminModerationReportsList.innerHTML = "";

    if (moderationReports.length === 0) {
      adminModerationReportsEmpty.style.display = "block";
      adminModerationReportsEmpty.textContent = "Aucun signalement pour le moment.";
      return;
    }

    adminModerationReportsEmpty.style.display = "none";
    adminModerationReportsList.innerHTML = moderationReports.map(creerAdminModerationReportCardHtml).join("");

    adminModerationReportsList.querySelectorAll(".admin-moderation-status-button").forEach(function (button) {
      button.addEventListener("click", async function () {
        const moderationReportId = button.getAttribute("data-report-id");
        const nextStatus = button.getAttribute("data-status");
        const label = getModerationStatusLabel(nextStatus);

        if (!canCurrentUserManageModerationReports()) {
          alert("Cette action est réservée à l’administrateur RailReporters.");
          return;
        }

        const confirmed = window.confirm("Voulez-vous passer ce signalement en statut : " + label + " ?");
        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Mise à jour...";

        try {
          const { error } = await supabaseClient
            .from("moderation_reports")
            .update({
              status: nextStatus,
              reviewed_at: new Date().toISOString()
            })
            .eq("id", moderationReportId);

          if (error) throw error;

          await chargerSignalementsAdmin();
          alert("Signalement mis à jour avec succès.");
        } catch (error) {
          alert(getFriendlySupabaseError(error, "admin-moderation-reports"));
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });
  }

  async function chargerSignalementsAdmin() {
    const section = ensureAdminModerationReportsSection();

    if (!canCurrentUserManageModerationReports()) {
      moderationReports = [];
      if (section) section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    if (section) {
      section.style.display = "block";
      if (adminModerationReportsEmpty) {
        adminModerationReportsEmpty.style.display = "block";
        adminModerationReportsEmpty.textContent = "Chargement des signalements...";
      }
      if (adminModerationReportsList) adminModerationReportsList.innerHTML = "";
    }

    const { data, error } = await supabaseClient
      .from("moderation_reports")
      .select("id, reported_by, content_type, content_id, reason, details, status, admin_note, created_at, reviewed_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      if (adminModerationReportsEmpty) {
        adminModerationReportsEmpty.style.display = "block";
        adminModerationReportsEmpty.textContent = "Erreur chargement signalements : " + getFriendlySupabaseError(error, "read");
      }
      return;
    }

    const rawReports = data || [];
    const reporterIds = Array.from(new Set(rawReports.map(function (item) { return item.reported_by; }).filter(Boolean)));
    const reportTargetIds = Array.from(new Set(rawReports.filter(function (item) { return item.content_type === "report"; }).map(function (item) { return item.content_id; }).filter(Boolean)));
    const commentTargetIds = Array.from(new Set(rawReports.filter(function (item) { return item.content_type === "comment"; }).map(function (item) { return item.content_id; }).filter(Boolean)));

    let reporterProfiles = [];
    let targetReports = [];
    let targetComments = [];
    let reportsForComments = [];

    if (reporterIds.length > 0) {
      const profileRes = await supabaseClient
        .from("profiles")
        .select("id, username, role, avatar_url")
        .in("id", reporterIds);
      if (!profileRes.error) reporterProfiles = profileRes.data || [];
    }

    if (reportTargetIds.length > 0) {
      const reportRes = await supabaseClient
        .from("reports")
        .select("id, title, train, operator, departure_station, arrival_station, status")
        .in("id", reportTargetIds);
      if (!reportRes.error) targetReports = reportRes.data || [];
    }

    if (commentTargetIds.length > 0) {
      const commentRes = await supabaseClient
        .from("comments")
        .select("id, report_id, content, status")
        .in("id", commentTargetIds);
      if (!commentRes.error) targetComments = commentRes.data || [];

      const reportIdsFromComments = Array.from(new Set((targetComments || []).map(function (comment) { return comment.report_id; }).filter(Boolean)));
      if (reportIdsFromComments.length > 0) {
        const reportForCommentRes = await supabaseClient
          .from("reports")
          .select("id, title, train, operator, departure_station, arrival_station, status")
          .in("id", reportIdsFromComments);
        if (!reportForCommentRes.error) reportsForComments = reportForCommentRes.data || [];
      }
    }

    moderationReports = rawReports.map(function (item) {
      const reporterProfile = reporterProfiles.find(function (profile) { return profile.id === item.reported_by; }) || null;
      const targetReport = targetReports.find(function (report) { return report.id === item.content_id; }) || null;
      const targetComment = targetComments.find(function (comment) { return comment.id === item.content_id; }) || null;
      const commentReport = targetComment ? reportsForComments.find(function (report) { return report.id === targetComment.report_id; }) : null;

      return {
        ...item,
        reporter_profile: reporterProfile,
        target_report: targetReport || commentReport || null,
        target_comment: targetComment || null
      };
    });

    updateAdminDashboardSummary();
    afficherSignalementsAdmin();
  }


  function ensureAdminUsersSection() {
    if (adminUsersSection) return adminUsersSection;

    const dashboard = ensureAdminDashboardSection();
    if (!dashboard || !adminDashboardGrid) return null;

    adminUsersSection = document.createElement("section");
    adminUsersSection.id = "admin-users-section";
    adminUsersSection.className = "admin-dashboard-panel admin-users-section";
    adminUsersSection.style.display = "none";
    adminUsersSection.innerHTML = `
      <div class="admin-panel-header">
        <div>
          <span class="admin-panel-kicker">Utilisateurs</span>
          <h3>Utilisateurs</h3>
        </div>
        <p>Voir les profils et bannir ou débannir un compte membre.</p>
      </div>
      <p id="admin-users-empty" class="empty-state">Aucun utilisateur à afficher pour le moment.</p>
      <div id="admin-users-list" class="admin-users-list"></div>
    `;

    adminDashboardGrid.appendChild(adminUsersSection);

    adminUsersList = adminUsersSection.querySelector("#admin-users-list");
    adminUsersEmpty = adminUsersSection.querySelector("#admin-users-empty");

    return adminUsersSection;
  }

  function getUserStatusLabel(profile) {
    return profile && profile.is_banned ? "Banni" : "Actif";
  }

  function creerAdminUserCardHtml(profile) {
    const username = profile.username || "Utilisateur";
    const role = profile.role || "member";
    const isBanned = profile.is_banned === true;
    const isCurrentAdmin = currentUser && profile.id === currentUser.id;
    const isAdminRole = role === "admin";
    const createdAt = profile.created_at ? formaterDate(String(profile.created_at).slice(0, 10)) : "Date inconnue";

    let actionHtml = "";

    if (isCurrentAdmin) {
      actionHtml = `<p class="admin-user-protected">Compte admin connecté — aucune action rapide.</p>`;
    } else if (isAdminRole) {
      actionHtml = `<p class="admin-user-protected">Compte admin protégé.</p>`;
    } else if (isBanned) {
      actionHtml = `
        <button
          class="admin-user-action-button admin-unban-user-button"
          data-user-id="${escapeHtml(profile.id)}"
          data-username="${escapeHtml(username)}"
        >
          Débannir
        </button>`;
    } else {
      actionHtml = `
        <button
          class="admin-user-action-button admin-ban-user-button"
          data-user-id="${escapeHtml(profile.id)}"
          data-username="${escapeHtml(username)}"
        >
          Bannir
        </button>`;
    }

    return `
      <article class="admin-user-card ${isBanned ? "banned" : "active"}">
        <div>
          <span class="admin-user-status ${isBanned ? "banned" : "active"}">${escapeHtml(getUserStatusLabel(profile))}</span>
          <h3>${escapeHtml(username)}</h3>
          <p>
            <strong>Rôle :</strong> ${escapeHtml(getRoleLabel(role))}
            <br>
            <strong>Créé le :</strong> ${escapeHtml(createdAt)}
          </p>
        </div>
        <div class="admin-user-actions">
          ${actionHtml}
        </div>
      </article>`;
  }

  function afficherUtilisateursAdmin() {
    const section = ensureAdminUsersSection();
    if (!section || !adminUsersList || !adminUsersEmpty) return;

    if (!canCurrentUserManageUsers()) {
      adminUsers = [];
      moderationReports = [];
      section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    updateAdminDashboardVisibility();
    section.style.display = "block";
    adminUsersList.innerHTML = "";

    if (adminUsers.length === 0) {
      adminUsersEmpty.style.display = "block";
      adminUsersEmpty.textContent = "Aucun utilisateur à afficher pour le moment.";
      return;
    }

    adminUsersEmpty.style.display = "none";
    adminUsersList.innerHTML = adminUsers.map(creerAdminUserCardHtml).join("");

    adminUsersList.querySelectorAll(".admin-ban-user-button").forEach(function (button) {
      button.addEventListener("click", async function () {
        const userId = button.getAttribute("data-user-id");
        const username = button.getAttribute("data-username") || "cet utilisateur";

        if (!canCurrentUserManageUsers()) {
          alert("Cette action est réservée à l’administrateur RailReporters.");
          return;
        }

        const confirmed = window.confirm(
          "Voulez-vous vraiment bannir cet utilisateur ?\n\n" +
          username + "\n\n" +
          "Il ne pourra plus publier, commenter ou envoyer de photo."
        );

        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Bannissement...";

        try {
          const { error } = await supabaseClient
            .from("profiles")
            .update({ is_banned: true })
            .eq("id", userId);

          if (error) throw error;

          await chargerUtilisateursAdmin();
          alert("Utilisateur banni avec succès.");
        } catch (error) {
          alert(getFriendlySupabaseError(error, "admin-users"));
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });

    adminUsersList.querySelectorAll(".admin-unban-user-button").forEach(function (button) {
      button.addEventListener("click", async function () {
        const userId = button.getAttribute("data-user-id");
        const username = button.getAttribute("data-username") || "cet utilisateur";

        if (!canCurrentUserManageUsers()) {
          alert("Cette action est réservée à l’administrateur RailReporters.");
          return;
        }

        const confirmed = window.confirm(
          "Voulez-vous vraiment débannir cet utilisateur ?\n\n" +
          username + "\n\n" +
          "Il pourra à nouveau publier, commenter et envoyer des photos."
        );

        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Débannissement...";

        try {
          const { error } = await supabaseClient
            .from("profiles")
            .update({ is_banned: false })
            .eq("id", userId);

          if (error) throw error;

          await chargerUtilisateursAdmin();
          alert("Utilisateur débanni avec succès.");
        } catch (error) {
          alert(getFriendlySupabaseError(error, "admin-users"));
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });
  }

  async function chargerUtilisateursAdmin() {
    const section = ensureAdminUsersSection();

    if (!canCurrentUserManageUsers()) {
      adminUsers = [];
      moderationReports = [];
      if (section) section.style.display = "none";
      updateAdminDashboardVisibility();
      return;
    }

    if (section) {
      section.style.display = "block";
      if (adminUsersEmpty) {
        adminUsersEmpty.style.display = "block";
        adminUsersEmpty.textContent = "Chargement des utilisateurs...";
      }
      if (adminUsersList) adminUsersList.innerHTML = "";
    }

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, username, role, is_banned, created_at, updated_at")
      .order("username", { ascending: true });

    if (error) {
      if (adminUsersEmpty) {
        adminUsersEmpty.style.display = "block";
        adminUsersEmpty.textContent = "Erreur chargement utilisateurs : " + getFriendlySupabaseError(error, "read");
      }
      return;
    }

    adminUsers = data || [];
    updateAdminDashboardSummary();
    afficherUtilisateursAdmin();
  }


  function afficherReportsSupabase() {
    reportsList.innerHTML = "";

    const filtered = reports.filter(reportMatchesSearch);

    if (reports.length === 0) {
      emptyState.style.display = "block";
      emptyState.textContent = "Aucun report Supabase publié pour le moment.";
      return;
    }

    if (filtered.length === 0) {
      emptyState.style.display = "block";
      emptyState.textContent = "Aucun report ne correspond à votre recherche.";
      return;
    }

    emptyState.style.display = "none";

    filtered.forEach(function (report) {
      const isOpen = openedReportId === report.id;
      const horairesResume = `
        ${report.departure_time ? `Départ : ${report.departure_time.slice(0, 5)}` : ""}
        ${report.departure_time && report.arrival_time ? " · " : ""}
        ${report.arrival_time ? `Arrivée : ${report.arrival_time.slice(0, 5)}` : ""}
      `;

      const article = document.createElement("article");
      article.className = "report-card";
      article.id = `report-card-${report.id}`;
      article.innerHTML = `
        <div class="report-summary">
          ${getCoverHtml(report)}
          <div class="summary-info">
            <h3>${escapeHtml(report.title)}</h3>
            <p class="author-line">Par ${escapeHtml(getAuthorLabel(report.profiles))}</p>
            <p class="report-meta">
              <strong>${escapeHtml(report.train)}</strong> · ${escapeHtml(report.operator)}
              <br>
              ${escapeHtml(report.departure_station)} → ${escapeHtml(report.arrival_station)}
              <br>
              Date : ${escapeHtml(formaterDate(report.travel_date))} ${report.travel_class ? `· Classe : ${escapeHtml(report.travel_class)}` : ""}
              ${horairesResume.trim() ? `<br>${escapeHtml(horairesResume.trim())}` : ""}
            </p>
            <p class="rating">${afficherEtoiles(report.rating)}</p>
            <button class="open-report-button" data-report-id="${escapeHtml(report.id)}">
              ${isOpen ? "Fermer le report" : "Lire le report"}
            </button>
          </div>
        </div>

        <div class="report-details ${isOpen ? "" : "hidden"}" id="report-details-${escapeHtml(report.id)}">
          <div class="report-content">
            <div class="report-section">
              <h4>Auteur du report</h4>
              <p>${escapeHtml(getAuthorLabel(report.profiles))}</p>
            </div>
            ${creerCarteTrajet(report)}
            ${creerSectionsHtml(report)}
            <div class="report-section">
              <h4>Conclusion</h4>
              <p>${escapeHtml(report.conclusion)}</p>
              <p class="rating">${afficherEtoiles(report.rating)}</p>
            </div>
            ${creerSignalementReportHtml(report)}
            ${creerCommentairesHtml(report)}
            ${creerAdminReportActionsHtml(report)}
            <div class="report-bottom-actions">
              <button class="close-report-bottom-button" data-report-id="${escapeHtml(report.id)}">Fermer le report</button>
            </div>
          </div>
        </div>`;
      reportsList.appendChild(article);
    });

    document.querySelectorAll(".open-report-button").forEach(function (button) {
      button.addEventListener("click", function () {
        const reportId = button.getAttribute("data-report-id");
        openedReportId = openedReportId === reportId ? null : reportId;
        afficherReportsSupabase();
        if (openedReportId) {
          const card = document.getElementById(`report-card-${openedReportId}`);
          if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    document.querySelectorAll(".close-report-bottom-button").forEach(function (button) {
      button.addEventListener("click", function () {
        const reportId = button.getAttribute("data-report-id");
        openedReportId = null;
        afficherReportsSupabase();
        const card = document.getElementById(`report-card-${reportId}`);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    document.querySelectorAll(".admin-hide-report-button").forEach(function (button) {
      button.addEventListener("click", async function () {
        const reportId = button.getAttribute("data-report-id");
        const reportTitle = button.getAttribute("data-report-title") || "ce report";

        if (!canCurrentUserManageReports()) {
          alert("Cette action est réservée à l’administrateur RailReporters.");
          return;
        }

        const confirmed = window.confirm(
          "Voulez-vous vraiment masquer ce report ?\n\n" +
          reportTitle + "\n\n" +
          "Il ne sera plus visible publiquement, mais restera conservé dans Supabase."
        );

        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Masquage...";

        try {
          const { error } = await supabaseClient
            .from("reports")
            .update({ status: "hidden" })
            .eq("id", reportId);

          if (error) throw error;

          openedReportId = null;
          await chargerReportsSupabase(false);
          await chargerReportsMasquesAdmin();
          alert("Report masqué avec succès.");
        } catch (error) {
          alert(getFriendlySupabaseError(error, "admin-hide-report"));
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });

    document.querySelectorAll(".admin-hide-comment-button").forEach(function (button) {
      button.addEventListener("click", async function () {
        const commentId = button.getAttribute("data-comment-id");
        const reportId = button.getAttribute("data-report-id");
        const commentAuthor = button.getAttribute("data-comment-author") || "ce commentaire";

        if (!canCurrentUserManageComments()) {
          alert("Cette action est réservée à l’administrateur RailReporters.");
          return;
        }

        const confirmed = window.confirm(
          "Voulez-vous vraiment masquer ce commentaire ?\n\n" +
          "Auteur : " + commentAuthor + "\n\n" +
          "Il ne sera plus visible publiquement, mais restera conservé dans Supabase."
        );

        if (!confirmed) return;

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Masquage...";

        try {
          const { error } = await supabaseClient
            .from("comments")
            .update({ status: "hidden" })
            .eq("id", commentId);

          if (error) throw error;

          openedReportId = reportId;
          await chargerReportsSupabase(true);
          await chargerCommentairesMasquesAdmin();
          alert("Commentaire masqué avec succès.");
        } catch (error) {
          alert(getFriendlySupabaseError(error, "admin-hide-comment"));
          button.disabled = false;
          button.textContent = originalText;
        }
      });
    });

    document.querySelectorAll(".signal-login-button").forEach(function (button) {
      button.addEventListener("click", function () {
        openAuthModal();
        setAuthMessage("Connectez-vous pour signaler un contenu.", "error");
      });
    });

    document.querySelectorAll(".report-signal-form").forEach(function (signalForm) {
      signalForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!currentUser) {
          openAuthModal();
          setAuthMessage("Connectez-vous pour signaler un contenu.", "error");
          return;
        }

        if (isCurrentUserBanned()) {
          alert("Votre compte est actuellement bloqué. Vous ne pouvez pas envoyer de signalement.");
          return;
        }

        const reportId = signalForm.getAttribute("data-report-id");
        const reportTitle = signalForm.getAttribute("data-report-title") || "ce report";
        const reasonInput = signalForm.querySelector(".signal-reason");
        const detailsInput = signalForm.querySelector(".signal-details");
        const status = signalForm.querySelector(".signal-status");
        const button = signalForm.querySelector("button[type='submit']");
        const reason = reasonInput.value;
        const details = detailsInput.value.trim();

        if (!reason) {
          if (status) {
            status.textContent = "Choisissez une raison de signalement.";
            status.className = "signal-status error";
          }
          return;
        }

        button.disabled = true;
        button.textContent = "Envoi...";
        if (status) {
          status.textContent = "Envoi du signalement...";
          status.className = "signal-status";
        }

        try {
          const { error } = await supabaseClient.from("moderation_reports").insert({
            reported_by: currentUser.id,
            content_type: "report",
            content_id: reportId,
            reason,
            details: details || "",
            status: "pending"
          });

          if (error) throw error;

          reasonInput.value = "";
          detailsInput.value = "";
          if (status) {
            status.textContent = "Merci, votre signalement a été envoyé à l’équipe RailReporters.";
            status.className = "signal-status ok";
          }
        } catch (error) {
          if (status) {
            status.textContent = getFriendlySupabaseError(error, "signal");
            status.className = "signal-status error";
          } else {
            alert(getFriendlySupabaseError(error, "signal"));
          }
        } finally {
          button.disabled = false;
          button.textContent = "Envoyer le signalement";
        }
      });
    });


    document.querySelectorAll(".comment-signal-form").forEach(function (signalForm) {
      signalForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!currentUser) {
          openAuthModal();
          setAuthMessage("Connectez-vous pour signaler un contenu.", "error");
          return;
        }

        if (isCurrentUserBanned()) {
          alert("Votre compte est actuellement bloqué. Vous ne pouvez pas envoyer de signalement.");
          return;
        }

        const commentId = signalForm.getAttribute("data-comment-id");
        const reasonInput = signalForm.querySelector(".signal-reason");
        const detailsInput = signalForm.querySelector(".signal-details");
        const status = signalForm.querySelector(".signal-status");
        const button = signalForm.querySelector("button[type='submit']");
        const reason = reasonInput ? reasonInput.value : "";
        const details = detailsInput ? detailsInput.value.trim() : "";

        if (!commentId) {
          if (status) {
            status.textContent = "Impossible d’identifier le commentaire à signaler.";
            status.className = "signal-status error";
          }
          return;
        }

        if (!reason) {
          if (status) {
            status.textContent = "Choisissez une raison de signalement.";
            status.className = "signal-status error";
          }
          return;
        }

        button.disabled = true;
        button.textContent = "Envoi...";
        if (status) {
          status.textContent = "Envoi du signalement...";
          status.className = "signal-status";
        }

        try {
          const { error } = await supabaseClient.from("moderation_reports").insert({
            reported_by: currentUser.id,
            content_type: "comment",
            content_id: commentId,
            reason,
            details: details || "",
            status: "pending"
          });

          if (error) throw error;

          if (reasonInput) reasonInput.value = "";
          if (detailsInput) detailsInput.value = "";
          if (status) {
            status.textContent = "Merci, votre signalement a été envoyé à l’équipe RailReporters.";
            status.className = "signal-status ok";
          }
        } catch (error) {
          if (status) {
            status.textContent = getFriendlySupabaseError(error, "signal");
            status.className = "signal-status error";
          } else {
            alert(getFriendlySupabaseError(error, "signal"));
          }
        } finally {
          button.disabled = false;
          button.textContent = "Envoyer le signalement";
        }
      });
    });

    document.querySelectorAll(".comment-form").forEach(function (commentForm) {
      commentForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!currentUser) {
          openAuthModal();
          setAuthMessage("Connectez-vous pour commenter.", "error");
          return;
        }

        if (isCurrentUserBanned()) {
          alert("Votre compte est actuellement bloqué. Vous ne pouvez pas publier de commentaire.");
          return;
        }

        const reportId = commentForm.getAttribute("data-report-id");
        const input = commentForm.querySelector(".comment-input");
        const content = input.value.trim();
        if (!content) return;

        const button = commentForm.querySelector("button");
        button.disabled = true;
        button.textContent = "Publication...";

        try {
          const { error } = await supabaseClient.from("comments").insert({
            report_id: reportId,
            user_id: currentUser.id,
            content,
            status: "published"
          });
          if (error) throw error;
          input.value = "";
          openedReportId = reportId;
          await chargerReportsSupabase(true);
        } catch (error) {
          alert(getFriendlySupabaseError(error, "comment"));
        } finally {
          button.disabled = false;
          button.textContent = "Publier le commentaire";
        }
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = searchInput.value.trim();
      openedReportId = null;
      afficherReportsSupabase();
    });
  }

  if (backToTopButton) {
    backToTopButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (form) {
    installerMessagePublicationSupabase();
    form.addEventListener("submit", publierVraiFormulaireDansSupabase, true);
  }

  installerStylesV2();
  createAuthUI();
  initializeAuth();
  protectPublishLinks();

  refreshSession()
    .then(function () {
      return chargerReportsSupabase(false);
    })
    .catch(function (error) {
      if (emptyState) {
        emptyState.style.display = "block";
        emptyState.textContent = "Erreur initialisation Supabase : " + getFriendlySupabaseError(error, "read");
      }
    });
});
