(function () {
  "use strict";

  const data = window.SITE_DATA;
  if (!data) return;

  const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const setHref = (selector, href) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.setAttribute("href", href);
    });
  };

  const confirmedPercent = Math.min(
    100,
    Math.max(0, (data.confirmedRaised / data.goal) * 100),
  );

  setText("[data-goal]", currency.format(data.goal));
  setText("[data-confirmed]", currency.format(data.confirmedRaised));
  setText("[data-pending]", currency.format(data.pendingMatch));
  setText(
    "[data-potential]",
    currency.format(data.confirmedRaised + data.pendingMatch),
  );
  setText("[data-campaign-note]", data.campaignNote);
  setText("[data-venmo-username]", `@${data.venmoUsername}`);

  setHref("[data-venmo-link]", data.venmoUrl);
  setHref("[data-official-link]", data.officialFundraisingUrl);
  setHref("[data-foundation-link]", data.foundationUrl);

  document.querySelectorAll("[data-progress-bar]").forEach((bar) => {
    bar.style.width = `${confirmedPercent}%`;
  });
  document.querySelectorAll("[data-progress]").forEach((progress) => {
    progress.setAttribute("aria-valuenow", String(data.confirmedRaised));
    progress.setAttribute("aria-valuemax", String(data.goal));
    progress.setAttribute(
      "aria-label",
      `${currency.format(data.confirmedRaised)} confirmed raised toward ${currency.format(data.goal)}`,
    );
  });

  const wall = document.querySelector("[data-supporter-wall]");
  if (wall) {
    wall.replaceChildren();
    data.supporters.forEach((supporter) => {
      const item = document.createElement("article");
      item.className = "supporter";

      const initials = document.createElement("span");
      initials.className = "supporter__initials";
      initials.setAttribute("aria-hidden", "true");
      initials.textContent =
        supporter.name === "Anonymous"
          ? "♥"
          : supporter.name
              .split(/\s+/)
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

      const identity = document.createElement("div");
      identity.className = "supporter__identity";
      const name = document.createElement("h3");
      name.textContent = supporter.name;
      const contribution = document.createElement("p");
      contribution.textContent = `${currency.format(supporter.contribution)} confirmed contribution`;
      identity.append(name, contribution);
      if (supporter.note) {
        const note = document.createElement("p");
        note.className = "supporter__note";
        note.textContent = supporter.note;
        identity.append(note);
      }

      const status = document.createElement("div");
      status.className = "supporter__match";
      if (supporter.matchAmount && supporter.matchStatus) {
        const badge = document.createElement("span");
        badge.className = `match-badge match-badge--${supporter.matchStatus}`;
        const employer = supporter.employer ? `${supporter.employer} ` : "";
        badge.textContent = `+${currency.format(supporter.matchAmount)} ${employer}match ${supporter.matchStatus}`;
        status.append(badge);
      } else {
        status.textContent = "No employer match listed";
      }

      item.append(initials, identity, status);
      wall.append(item);
    });
  }

  document.querySelectorAll("[data-form-link]").forEach((link) => {
    if (data.contributionFormUrl) {
      link.setAttribute("href", data.contributionFormUrl);
      link.removeAttribute("aria-disabled");
      link.classList.remove("button--placeholder");
    } else {
      link.setAttribute("href", "#form-placeholder");
      link.setAttribute("aria-disabled", "true");
      link.classList.add("button--placeholder");
      link.addEventListener("click", (event) => event.preventDefault());
    }
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) return;

    const destination = new URL(href, window.location.href);
    if (destination.origin !== window.location.origin) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });

  const launchCallout = document.querySelector("[data-launch-callout]");
  if (launchCallout) launchCallout.hidden = !data.showLaunchCallout;

  const menuButton = document.querySelector("[data-menu-button]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    const menuLabel = menuButton.querySelector(".sr-only");
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobileNav.hidden = expanded;
      if (menuLabel) menuLabel.textContent = expanded ? "Open navigation" : "Close navigation";
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
        if (menuLabel) menuLabel.textContent = "Open navigation";
      });
    });
  }
})();
