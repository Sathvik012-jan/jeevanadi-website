/* =========================================================
   JEEVA NADI MINISTRIES
   SERMONS PAGE — PAGE-SPECIFIC INTERACTIONS
   Shared navigation, sticky header and smooth scrolling are
   handled by js/script.js. Do not duplicate them here.
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* 1. SERMON SEARCH AND TOPIC FILTERS */
    const searchInput = document.getElementById("sermonSearch");
    const filterButtons = [...document.querySelectorAll(".filter-btn")];
    const sermonCards = [...document.querySelectorAll(".sermon-card")];
    const sermonCount = document.getElementById("sermonCount");
    const emptyState = document.getElementById("sermonEmpty");
    const resetButton = document.getElementById("resetSermons");

    let activeCategory = "all";

    const updateSermons = () => {
        const term = (searchInput?.value || "").trim().toLocaleLowerCase();
        let visibleCount = 0;

        sermonCards.forEach(card => {
            const category = (card.dataset.category || "all").toLocaleLowerCase();
            const searchableText = card.textContent.toLocaleLowerCase();

            const categoryMatch =
                activeCategory === "all" || category === activeCategory;
            const searchMatch = !term || searchableText.includes(term);
            const visible = categoryMatch && searchMatch;

            card.hidden = !visible;
            if (visible) visibleCount += 1;
        });

        if (sermonCount) {
            sermonCount.textContent = String(visibleCount).padStart(2, "0");
        }

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    };

    const setActiveCategory = category => {
        activeCategory = category || "all";

        filterButtons.forEach(button => {
            const active =
                (button.dataset.category || "all") === activeCategory;

            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        updateSermons();
    };

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            setActiveCategory(button.dataset.category || "all");
        });
    });

    searchInput?.addEventListener("input", updateSermons);

    resetButton?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        setActiveCategory("all");
        searchInput?.focus();
    });

    // Initialize from the button marked active in the HTML, if present.
    const initiallyActive = filterButtons.find(button =>
        button.classList.contains("active")
    );
    setActiveCategory(initiallyActive?.dataset.category || "all");

    /* 2. SCROLL-REVEAL ANIMATIONS */
    const revealItems = document.querySelectorAll(".reveal");
    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if ("IntersectionObserver" in window && !reduceMotion) {
        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("visible");
                currentObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -30px 0px"
        });

        revealItems.forEach((element, index) => {
            element.style.transitionDelay = `${(index % 4) * 60}ms`;
            observer.observe(element);
        });
    } else {
        revealItems.forEach(element => element.classList.add("visible"));
    }

    /* 3. SERMON THUMBNAIL FALLBACK */
    document.querySelectorAll(".sermon-image img").forEach(image => {
        image.addEventListener("error", () => {
            image.classList.add("image-unavailable");
            image.alt = "Sermon thumbnail unavailable";
        }, { once: true });
    });

    console.info("Jeeva Nadi Ministries: Sermons interactions ready.");
});
