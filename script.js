document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("report-form");
  const reportsList = document.getElementById("reports-list");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.querySelector(".search-box input");
  const createReportSection = document.getElementById("create-report");
  const publishLinks = document.querySelectorAll('a[href="#create-report"]');
  const backToTopButton = document.getElementById("back-to-top");

  let reports = JSON.parse(localStorage.getItem("railreporters-full-reports")) || [];
  let openedReportIndex = null;
  let searchQuery = "";

  function installerStylePublication() {
    if (document.getElementById("publication-ux-style")) return;

    const style = document.createElement("style");
    style.id = "publication-ux-style";
    style.textContent = `
      .publication-help {
        background: linear-gradient(135deg, #fff7ed, #ffffff);
        border: 1px solid #fed7aa;
        border-radius: 18px;
        padding: 16px 18px;
        margin-bottom: 22px;
        color: #334155;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
      }

      .publication-help strong {
        display: block;
        color: #111827;
        margin-bottom: 8px;
        font-size: 16px;
      }

      .publication-help ul {
        margin: 8px 0 0 18px;
        padding: 0;
        line-height: 1.55;
      }

      .publication-help li {
        margin-bottom: 4px;
      }

      .cancel-report-button {
        width: 100%;
        margin-top: 12px;
        padding: 14px 18px;
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        background: #ffffff;
        color: #334155;
        font-size: 15px;
        font-weight: 800;
        cursor: pointer;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
      }

      .cancel-report-button:hover {
        background: #f8fafc;
      }

      .publish-button:disabled {
        opacity: 0.72;
        cursor: not-allowed;
      }
    `;

    document.head.appendChild(style);
  }

  function ameliorerFormulairePublication() {
    if (!form) return;

    installerStylePublication();

    if (!document.getElementById("publication-help")) {
      const help = document.createElement("div");
      help.id = "publication-help";
      help.className = "publication-help";
      help.innerHTML = `
        <strong>Conseil avant de publier</strong>
        <ul>
          <li>Les photos sont facultatives : vous pouvez publier un report simple.</li>
          <li>Les sections du voyage sont optionnelles : remplissez seulement ce qui est utile.</li>
          <li>Les champs obligatoires sont : titre, train, opérateur, départ, arrivée, date, conclusion et note.</li>
        </ul>
      `;

      form.prepend(help);
    }

    if (!document.getElementById("cancel-report-button")) {
      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.id = "cancel-report-button";
      cancelButton.className = "cancel-report-button";
      cancelButton.textContent = "Annuler / fermer le formulaire";

      const publishButton = form.querySelector(".publish-button");

      if (publishButton) {
        publishButton.insertAdjacentElement("afterend", cancelButton);
      } else {
        form.appendChild(cancelButton);
      }

      cancelButton.addEventListener("click", function () {
        form.reset();

        if (createReportSection) {
          createReportSection.classList.remove("visible");
        }

        const reportsSection = document.getElementById("reports");
        if (reportsSection) {
          reportsSection.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  }


  function afficherFormulairePublication() {
    if (createReportSection) {
      createReportSection.classList.add("visible");
      createReportSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  publishLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      afficherFormulairePublication();
    });
  });

  if (backToTopButton) {
    backToTopButton.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  ameliorerFormulairePublication();

  function afficherEtoiles(note) {
    let etoiles = "";
    for (let i = 0; i < Number(note); i++) {
      etoiles += "⭐";
    }
    return etoiles;
  }

  function formaterDate(dateString) {
    if (!dateString) return "";
    const morceaux = dateString.split("-");
    if (morceaux.length !== 3) return dateString;
    return `${morceaux[2]}/${morceaux[1]}/${morceaux[0]}`;
  }

  function sauvegarderReports() {
    try {
      localStorage.setItem("railreporters-full-reports", JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error("Erreur de sauvegarde :", error);
      alert(
        "La sauvegarde a échoué. Les photos sont peut-être encore trop lourdes pour ce navigateur. Essaie avec moins de photos ou des images plus légères."
      );
      return false;
    }
  }

  function compresserImage(file, maxWidth = 1400, maxHeight = 1400, quality = 0.78) {
    return new Promise(function (resolve) {
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

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };

        image.onerror = function () {
          resolve("");
        };

        image.src = event.target.result;
      };

      reader.onerror = function () {
        resolve("");
      };

      reader.readAsDataURL(file);
    });
  }

  function lireImage(inputId) {
    return new Promise(function (resolve) {
      const input = document.getElementById(inputId);
      const file = input.files[0];

      if (!file) {
        resolve("");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Le fichier sélectionné n'est pas une image.");
        resolve("");
        return;
      }

      compresserImage(file).then(function (imageCompressee) {
        resolve(imageCompressee);
      });
    });
  }

  function verifierAnciennesDonnees(report) {
    if (!report.comments) report.comments = [];
    if (!report.heureDepart) report.heureDepart = "";
    if (!report.heureArrivee) report.heureArrivee = "";
    return report;
  }

  function reportCorrespondRecherche(report) {
    const texteRecherche = [
      report.title,
      report.train,
      report.operator,
      report.depart,
      report.arrivee,
      report.classe,
      report.date
    ]
      .join(" ")
      .toLowerCase();

    return texteRecherche.includes(searchQuery.toLowerCase());
  }

  function creerSection(titre, texte, photo) {
    if (!texte && !photo) return "";

    return `
      <div class="report-section">
        <h4>${titre}</h4>
        ${photo ? `<img src="${photo}" class="section-photo" alt="${titre}">` : ""}
        ${texte ? `<p>${texte}</p>` : ""}
      </div>
    `;
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

          <path
            d="M28 46
               L38 26
               Q42 16 58 16
               L142 16
               Q160 16 176 26
               L207 43
               Q219 50 211 55
               Q205 59 188 59
               L42 59
               Q29 59 25 53
               Q23 49 28 46 Z"
            fill="url(#tgvBodyGradient)"
            stroke="#9aacbf"
            stroke-width="2"
          />

          <path
            d="M176 26
               L207 43
               Q219 50 211 55
               Q205 59 188 59
               L168 59
               Q176 44 176 26 Z"
            fill="url(#tgvBlueGradient)"
          />

          <rect x="50" y="35" width="118" height="6" rx="3" fill="#1d4ed8"/>
          <rect x="58" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>
          <rect x="84" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>
          <rect x="110" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>
          <rect x="136" y="23" width="20" height="9" rx="4" fill="#8ec5ff"/>

          <path
            d="M182 31
               Q192 32 202 41
               L184 41
               Q179 41 178 36
               Q177 32 182 31 Z"
            fill="#b7ddff"
          />

          <path
            d="M38 26
               Q44 16 58 16
               L66 16
               Q54 23 49 35
               L28 46 Z"
            fill="#f9fbff"
            opacity="0.9"
          />
        </svg>
      </div>
    `;
  }

  function creerCarteTrajet(depart, arrivee, heureDepart, heureArrivee) {
    return `
      <div class="route-card">
        <h4>Carte du trajet</h4>

        <div class="route-cities">
          <div class="city city-start">
            <span class="city-name">${depart}</span>
            <span class="city-role">Départ${heureDepart ? " · " + heureDepart : ""}</span>
          </div>

          <div class="city city-end">
            <span class="city-name">${arrivee}</span>
            <span class="city-role">Arrivée${heureArrivee ? " · " + heureArrivee : ""}</span>
          </div>
        </div>

        <div class="route-track">
          <div class="route-line"></div>
          ${creerTrainTGV()}
        </div>
      </div>
    `;
  }

  function creerCommentairesHTML(report, index) {
    const comments = report.comments || [];

    const commentsHTML = comments.length === 0
      ? `<p class="no-comments">Aucun commentaire pour le moment.</p>`
      : comments.map(function (comment) {
          return `
            <div class="comment">
              <p>${comment.text}</p>
              <span>${comment.date}</span>
            </div>
          `;
        }).join("");

    return `
      <div class="interaction-section">
        <h4>Commentaires</h4>

        <form class="comment-form" data-index="${index}">
          <textarea class="comment-input" placeholder="Écrire un commentaire..." rows="3" required></textarea>
          <button type="submit">Publier le commentaire</button>
        </form>

        <div class="comments-list">
          ${commentsHTML}
        </div>
      </div>
    `;
  }

  function afficherReports() {
    reportsList.innerHTML = "";
    reports = reports.map(verifierAnciennesDonnees);

    const reportsFiltres = reports
      .map(function (report, index) {
        return { report: report, index: index };
      })
      .filter(function (item) {
        if (!searchQuery.trim()) return true;
        return reportCorrespondRecherche(item.report);
      });

    if (reports.length === 0) {
      emptyState.style.display = "block";
      emptyState.textContent = "Aucun report pour le moment. Publiez le premier report RailReporters.";
      return;
    }

    if (reportsFiltres.length === 0) {
      emptyState.style.display = "block";
      emptyState.textContent = "Aucun report ne correspond à votre recherche.";
      return;
    }

    emptyState.style.display = "none";

    reportsFiltres.forEach(function (item) {
      const report = item.report;
      const index = item.index;

      const reportElement = document.createElement("article");
      reportElement.className = "report-card";
      reportElement.id = `report-card-${index}`;

      const coverHTML = report.coverPhoto
        ? `<img src="${report.coverPhoto}" class="summary-cover" alt="Photo d’accueil du report">`
        : `<div class="summary-cover summary-cover-placeholder">🚆</div>`;

      const horairesResume = `
        ${report.heureDepart ? `Départ : ${report.heureDepart}` : ""}
        ${report.heureDepart && report.heureArrivee ? " · " : ""}
        ${report.heureArrivee ? `Arrivée : ${report.heureArrivee}` : ""}
      `;

      const isOpen = openedReportIndex === index;

      reportElement.innerHTML = `
        <div class="report-summary">
          ${coverHTML}

          <div class="summary-info">
            <h3>${report.title}</h3>

            <p class="report-meta">
              <strong>${report.train}</strong> · ${report.operator}
              <br>
              ${report.depart} → ${report.arrivee}
              <br>
              Date : ${formaterDate(report.date)} ${report.classe ? `· Classe : ${report.classe}` : ""}
              ${horairesResume.trim() ? `<br>${horairesResume}` : ""}
            </p>

            <p class="rating">${afficherEtoiles(report.rating)}</p>

            <button class="open-report-button" data-index="${index}">
              ${isOpen ? "Fermer le report" : "Lire le report"}
            </button>
          </div>
        </div>

        <div class="report-details ${isOpen ? "" : "hidden"}" id="report-details-${index}">
          <div class="report-content">
            ${creerCarteTrajet(report.depart, report.arrivee, report.heureDepart, report.heureArrivee)}

            ${creerSection("Arrivée en gare", report.stationArrivalText, report.stationArrivalPhoto)}
            ${creerSection("Expérience en gare", report.stationExperienceText, report.stationExperiencePhoto)}
            ${creerSection("Embarquement", report.boardingText, report.boardingPhoto)}
            ${creerSection("À bord du train", report.onboardText, report.onboardPhoto)}
            ${creerSection("Services à bord", report.servicesText, report.servicesPhoto)}
            ${creerSection("Arrivée à destination", report.arrivalText, report.arrivalPhoto)}

            <div class="report-section">
              <h4>Conclusion</h4>
              <p>${report.conclusion}</p>
              <p class="rating">${afficherEtoiles(report.rating)}</p>
            </div>

            ${creerCommentairesHTML(report, index)}

            <div class="report-bottom-actions">
              <button class="close-report-bottom-button" data-index="${index}">
                Fermer le report
              </button>

              <button class="delete-button" data-index="${index}">
                Supprimer ce report
              </button>
            </div>
          </div>
        </div>
      `;

      reportsList.appendChild(reportElement);
    });

    const openButtons = document.querySelectorAll(".open-report-button");

    openButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const index = Number(button.getAttribute("data-index"));

        if (openedReportIndex === index) {
          openedReportIndex = null;
        } else {
          openedReportIndex = index;
        }

        afficherReports();

        if (openedReportIndex !== null) {
          const card = document.getElementById(`report-card-${openedReportIndex}`);
          if (card) {
            card.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });

    const closeBottomButtons = document.querySelectorAll(".close-report-bottom-button");

    closeBottomButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const index = Number(button.getAttribute("data-index"));
        openedReportIndex = null;
        afficherReports();

        const card = document.getElementById(`report-card-${index}`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    const commentForms = document.querySelectorAll(".comment-form");

    commentForms.forEach(function (commentForm) {
      commentForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const index = Number(commentForm.getAttribute("data-index"));
        const input = commentForm.querySelector(".comment-input");
        const text = input.value.trim();

        if (!text) return;

        reports[index] = verifierAnciennesDonnees(reports[index]);

        reports[index].comments.unshift({
          text: text,
          date: new Date().toLocaleDateString("fr-FR")
        });

        openedReportIndex = index;

        if (!sauvegarderReports()) {
          return;
        }

        afficherReports();

        const details = document.getElementById(`report-details-${index}`);
        if (details) {
          details.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      });
    });

    const deleteButtons = document.querySelectorAll(".delete-button");

    deleteButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const index = Number(button.getAttribute("data-index"));

        const confirmation = confirm(
          "Es-tu sûr de vouloir supprimer ce report ? Cette action est définitive."
        );

        if (!confirmation) return;

        reports.splice(index, 1);
        openedReportIndex = null;

        if (!sauvegarderReports()) {
          return;
        }

        afficherReports();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchQuery = searchInput.value.trim();
      openedReportIndex = null;
      afficherReports();
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const publishButton = form.querySelector(".publish-button");
    const originalButtonText = publishButton ? publishButton.textContent : "";

    if (publishButton) {
      publishButton.disabled = true;
      publishButton.textContent = "Publication en cours...";
    }

    try {
      const title = document.getElementById("title").value.trim();
      const train = document.getElementById("train").value.trim();
      const operator = document.getElementById("operator").value.trim();
      const depart = document.getElementById("depart").value.trim();
      const heureDepart = document.getElementById("heure-depart").value;
      const arrivee = document.getElementById("arrivee").value.trim();
      const heureArrivee = document.getElementById("heure-arrivee").value;
      const date = document.getElementById("date").value;
      const classe = document.getElementById("classe").value.trim();
      const conclusion = document.getElementById("conclusion").value.trim();
      const rating = document.getElementById("rating").value;

      const champsManquants = [];

      if (!title) champsManquants.push("Titre du report");
      if (!train) champsManquants.push("Train");
      if (!operator) champsManquants.push("Opérateur");
      if (!depart) champsManquants.push("Gare de départ");
      if (!arrivee) champsManquants.push("Gare d’arrivée");
      if (!date) champsManquants.push("Date du voyage");
      if (!conclusion) champsManquants.push("Conclusion");
      if (!rating) champsManquants.push("Note globale");

      if (champsManquants.length > 0) {
        alert("Merci de remplir les champs obligatoires suivants :\n- " + champsManquants.join("\n- "));
        return;
      }

      const newReport = {
        title: title,
        coverPhoto: await lireImage("cover-photo"),
        train: train,
        operator: operator,
        depart: depart,
        heureDepart: heureDepart,
        arrivee: arrivee,
        heureArrivee: heureArrivee,
        date: date,
        classe: classe,

        stationArrivalText: document.getElementById("station-arrival-text").value.trim(),
        stationArrivalPhoto: await lireImage("station-arrival-photo"),

        stationExperienceText: document.getElementById("station-experience-text").value.trim(),
        stationExperiencePhoto: await lireImage("station-experience-photo"),

        boardingText: document.getElementById("boarding-text").value.trim(),
        boardingPhoto: await lireImage("boarding-photo"),

        onboardText: document.getElementById("onboard-text").value.trim(),
        onboardPhoto: await lireImage("onboard-photo"),

        servicesText: document.getElementById("services-text").value.trim(),
        servicesPhoto: await lireImage("services-photo"),

        arrivalText: document.getElementById("arrival-text").value.trim(),
        arrivalPhoto: await lireImage("arrival-photo"),

        conclusion: conclusion,
        rating: rating,
        comments: []
      };

      reports.unshift(newReport);
      openedReportIndex = 0;

      if (!sauvegarderReports()) {
        reports.shift();
        openedReportIndex = null;
        return;
      }

      afficherReports();
      form.reset();

      if (createReportSection) {
        createReportSection.classList.remove("visible");
      }

      document.getElementById("reports").scrollIntoView({ behavior: "smooth" });
    } finally {
      if (publishButton) {
        publishButton.disabled = false;
        publishButton.textContent = originalButtonText || "Publier le report";
      }
    }
  });

  afficherReports();
});
