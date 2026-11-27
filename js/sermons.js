
/* =========================================================
   JEEVA NADI MINISTRIES
   SERMONS PAGE — INTERACTIONS
   Version 1.0
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       1. MOBILE NAVIGATION
    ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("primaryNavigation");

    if (menuToggle && navigation) {

        const closeMenu = () => {
            navigation.classList.remove("open");
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        };

        menuToggle.addEventListener("click", () => {

            const isOpen = navigation.classList.toggle("open");

            menuToggle.classList.toggle("active", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );

        });

        navigation.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", event => {

            if (
                !navigation.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }

        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 850) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

    }


    /* =====================================================
       2. HEADER SCROLL EFFECT
    ===================================================== */

    const header = document.getElementById("mainHeader");

    const updateHeader = () => {
        if (header) {
            header.classList.toggle("scrolled", window.scrollY > 40);
        }
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });


    /* =====================================================
       3. SERMON SEARCH AND CATEGORY FILTERS
    ===================================================== */

    const searchInput = document.getElementById("sermonSearch");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const sermonCards = document.querySelectorAll(".sermon-card");
    const sermonCount = document.getElementById("sermonCount");
    const emptyState = document.getElementById("sermonEmpty");
    const resetButton = document.getElementById("resetSermons");

    let activeCategory = "all";

    const updateSermons = () => {

        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        let visibleCount = 0;

        sermonCards.forEach(card => {

            const category = card.dataset.category || "all";
            const cardText = card.textContent.toLowerCase();

            const matchesCategory =
                activeCategory === "all" ||
                category === activeCategory;

            const matchesSearch =
                searchTerm === "" ||
                cardText.includes(searchTerm);

            const shouldShow = matchesCategory && matchesSearch;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visibleCount++;
            }

        });

        if (sermonCount) {
            sermonCount.textContent = String(visibleCount).padStart(2, "0");
        }

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }

    };


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            activeCategory = button.dataset.category || "all";

            filterButtons.forEach(item => {
                const isActive = item === button;

                item.classList.toggle("active", isActive);
                item.setAttribute("aria-pressed", String(isActive));
            });

            updateSermons();

        });

    });


    if (searchInput) {
        searchInput.addEventListener("input", updateSermons);
    }


    if (resetButton) {

        resetButton.addEventListener("click", () => {

            activeCategory = "all";

            if (searchInput) {
                searchInput.value = "";
            }

            filterButtons.forEach(button => {

                const isActive = button.dataset.category === "all";

                button.classList.toggle("active", isActive);
                button.setAttribute("aria-pressed", String(isActive));

            });

            updateSermons();

        });

    }

    updateSermons();


    /* =====================================================
       4. SCROLL REVEAL ANIMATIONS
    ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

    } else {

        revealElements.forEach(element => {
            element.classList.add("visible");
        });

    }


    /* =====================================================
       5. SMOOTH SCROLL FOR INTERNAL LINKS
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches ? "auto" : "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       6. SERMON IMAGE ERROR HANDLING
    ===================================================== */

    document.querySelectorAll(".sermon-image img").forEach(image => {

        image.addEventListener("error", () => {

            image.style.opacity = "0.25";
            image.alt = "Sermon image currently unavailable";

        });

    });


    /* =====================================================
       7. PAGE INITIALIZATION
    ===================================================== */

    document.body.classList.add("page-loaded");

    console.log(
        "Jeeva Nadi Ministries | Sermons page initialized successfully."
    );

});
