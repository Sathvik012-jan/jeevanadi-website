/* =========================================================
   JEEVA NADI MINISTRIES
   ABOUT PAGE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HEADER SCROLL EFFECT
    ===================================================== */

    const header = document.getElementById("mainHeader");

    if (header) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }

        });

    }


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    const scrollLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    scrollLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            const targetId = this.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (target) {

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       SCROLL REVEAL ANIMATION
    ===================================================== */

    const revealElements = document.querySelectorAll(
        ".section-heading, " +
        ".about-container, " +
        ".gallery-card, " +
        ".ministry-card, " +
        ".pastor-container, " +
        ".video-card, " +
        ".senior-pastor-container, " +
        ".pastor-heading, " +
        ".ministry-item, " +
        ".pastor-mission"
    );


    revealElements.forEach(element => {

        element.classList.add("reveal");

    });


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
            threshold: 0.12
        }
    );


    revealElements.forEach(element => {

        revealObserver.observe(element);

    });


    /* =====================================================
       SENIOR PASTOR IMAGE PARALLAX
    ===================================================== */

    const pastorImage = document.querySelector(
        ".pastor-image-frame"
    );

    if (pastorImage) {

        window.addEventListener("scroll", () => {

            const rect =
                pastorImage.getBoundingClientRect();

            const windowHeight = window.innerHeight;

            if (
                rect.top < windowHeight &&
                rect.bottom > 0
            ) {

                const movement =
                    (windowHeight / 2 - rect.top) * 0.015;

                pastorImage.style.transform =
                    `rotate(-1deg) translateY(${movement}px)`;

            }

        });

    }


    /* =====================================================
       SENIOR PASTOR IMAGE HOVER
    ===================================================== */

    const pastorFrame = document.querySelector(
        ".pastor-image-frame"
    );

    if (pastorFrame) {

        pastorFrame.addEventListener(
            "mouseenter",
            () => {

                pastorFrame.classList.add("image-hover");

            }
        );

        pastorFrame.addEventListener(
            "mouseleave",
            () => {

                pastorFrame.classList.remove("image-hover");

            }
        );

    }


    /* =====================================================
       MINISTRY HIGHLIGHT STAGGER
    ===================================================== */

    const ministryItems = document.querySelectorAll(
        ".ministry-item"
    );

    ministryItems.forEach((item, index) => {

        item.style.transitionDelay =
            `${index * 0.1}s`;

    });


    /* =====================================================
       GALLERY STAGGER
    ===================================================== */

    const galleryCards = document.querySelectorAll(
        ".gallery-card"
    );

    galleryCards.forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 0.08}s`;

    });


    /* =====================================================
       MINISTRY CARDS STAGGER
    ===================================================== */

    const ministryCards = document.querySelectorAll(
        ".ministry-card"
    );

    ministryCards.forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 0.1}s`;

    });


    /* =====================================================
       VIDEO CARDS STAGGER
    ===================================================== */

    const videoCards = document.querySelectorAll(
        ".video-card"
    );

    videoCards.forEach((card, index) => {

        card.style.transitionDelay =
            `${index * 0.1}s`;

    });


    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const navLinks =
        document.querySelectorAll("nav a");

    navLinks.forEach(link => {

        const linkPage =
            link.getAttribute("href")
                ?.split("/")
                .pop()
                .toLowerCase();

        if (linkPage === currentPage) {

            link.classList.add("active");

        }

    });


    /* =====================================================
       IMAGE ERROR HANDLING
       ===================================================== */

    const images =
        document.querySelectorAll("img");

    images.forEach(image => {

        image.addEventListener("error", () => {

            image.classList.add("image-error");

        });

    });


    /* =====================================================
       REDUCED MOTION ACCESSIBILITY
       ===================================================== */

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    if (prefersReducedMotion) {

        document.documentElement.style.scrollBehavior =
            "auto";

    }


    console.log(
        "Jeeva Nadi Ministries — About Page Loaded"
    );

});