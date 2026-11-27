
/* =========================================================
   JEEVA NADI MINISTRIES
   CONTACT PAGE — INTERACTIONS
   Version 1.0
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       01. MOBILE NAVIGATION
    ===================================================== */

    const menuToggle = document.getElementById("menuToggle");
    const navigation = document.getElementById("primaryNavigation");

    if (menuToggle && navigation) {

        const closeMenu = () => {

            navigation.classList.remove("open");
            menuToggle.classList.remove("active");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

        };


        menuToggle.addEventListener("click", () => {

            const isOpen = navigation.classList.toggle("open");

            menuToggle.classList.toggle("active", isOpen);

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
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


        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeMenu();
            }

        });


        window.addEventListener("resize", () => {

            if (window.innerWidth > 850) {
                closeMenu();
            }

        });

    }


    /* =====================================================
       02. STICKY HEADER EFFECT
    ===================================================== */

    const header = document.getElementById("mainHeader");

    const updateHeader = () => {

        if (!header) return;

        header.classList.toggle(
            "scrolled",
            window.scrollY > 40
        );

    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });


    /* =====================================================
       03. SCROLL REVEAL ANIMATIONS
    ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    if (
        "IntersectionObserver" in window &&
        !prefersReducedMotion
    ) {

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


        revealElements.forEach((element, index) => {

            element.style.transitionDelay =
                `${Math.min(index % 4, 3) * 75}ms`;

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("visible");

        });

    }


    /* =====================================================
       04. SMOOTH INTERNAL NAVIGATION
    ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       05. EXTERNAL LINKS — SAFETY
    ===================================================== */

    document.querySelectorAll('a[target="_blank"]').forEach(link => {

        link.setAttribute("rel", "noopener noreferrer");

    });


    /* =====================================================
       06. MAP FRAME FALLBACK
    ===================================================== */

    const mapFrame = document.querySelector(".map-frame iframe");

    if (mapFrame) {

        mapFrame.addEventListener("error", () => {

            const mapContainer = mapFrame.closest(".map-frame");

            if (mapContainer) {
                mapContainer.classList.add("map-unavailable");
            }

        });

    }


    /* =====================================================
       07. PAGE INITIALIZATION
    ===================================================== */

    document.body.classList.add("page-loaded");

    console.log(
        "Jeeva Nadi Ministries | Contact page initialized successfully."
    );

});

