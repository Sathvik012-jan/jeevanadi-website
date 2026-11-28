
/* ============================================================
   JEEVA NADI MINISTRIES
   ABOUT PAGE JAVASCRIPT
   ------------------------------------------------------------
   VERSION 2.0 
   Features:
   01. Header scroll effect
   02. Smooth anchor navigation
   03. Accessible scroll reveal
   04. Pastor image interaction
   05. Staggered section animations
   06. Active navigation detection
   07. Image loading error handling
   08. Video playback management
   09. Video lazy loading
   10. Reduced motion accessibility
   11. Performance-conscious event handling

   No external libraries required.
============================================================ */


"use strict";


/* ============================================================
   01. INITIALIZATION
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const body = document.body;

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* ========================================================
       02. HEADER SCROLL EFFECT
    ======================================================== */

    const header = document.getElementById("mainHeader");

    if (header) {

        const updateHeader = () => {

            header.classList.toggle(
                "scrolled",
                window.scrollY > 50
            );

        };

        updateHeader();

        window.addEventListener(
            "scroll",
            updateHeader,
            { passive: true }
        );

    }


    /* ========================================================
       03. SMOOTH INTERNAL NAVIGATION
    ======================================================== */

    const scrollLinks = document.querySelectorAll(
        'a[href^="#"]'
    );

    scrollLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (
                !targetId ||
                targetId === "#" ||
                !targetId.startsWith("#")
            ) {
                return;
            }

            let target;

            try {
                target = document.querySelector(targetId);
            } catch {
                return;
            }

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: prefersReducedMotion
                    ? "auto"
                    : "smooth",

                block: "start"
            });

        });

    });


    /* ========================================================
       04. SCROLL REVEAL ANIMATIONS

       Elements become visible when they enter the viewport.

       If IntersectionObserver is unavailable, the elements
       remain visible instead of being hidden permanently.
    ======================================================== */

    const revealSelectors = [
        ".section-heading",
        ".about-container",
        ".gallery-card",
        ".ministry-card",
        ".senior-pastor-container",
        ".pastor-heading",
        ".ministry-item",
        ".pastor-mission",
        ".video-card"
    ];

    const revealElements = document.querySelectorAll(
        revealSelectors.join(", ")
    );


    if (
        !prefersReducedMotion &&
        "IntersectionObserver" in window
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


        revealElements.forEach(element => {

            element.classList.add("reveal");

            revealObserver.observe(element);

        });

    } else {

        revealElements.forEach(element => {

            element.classList.add("visible");

        });

    }


    /* ========================================================
       05. PASTOR IMAGE INTERACTION

       A single interaction system avoids conflicts between
       scroll-based transforms and hover-based transforms.
    ======================================================== */

    const pastorFrame = document.querySelector(
        ".pastor-image-frame"
    );

    if (pastorFrame) {

        if (!prefersReducedMotion) {

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

    }


    /* ========================================================
       06. STAGGERED CARD ANIMATIONS

       Small visual delays create a smooth sequence when
       cards appear on the screen.
    ======================================================== */

    const staggerGroups = [
        {
            selector: ".ministry-item",
            delay: 75
        },
        {
            selector: ".gallery-card",
            delay: 65
        },
        {
            selector: ".ministry-card",
            delay: 85
        },
        {
            selector: ".video-card",
            delay: 90
        }
    ];


    if (!prefersReducedMotion) {

        staggerGroups.forEach(group => {

            const elements = document.querySelectorAll(
                group.selector
            );

            elements.forEach((element, index) => {

                element.style.setProperty(
                    "--stagger-delay",
                    `${index * group.delay}ms`
                );

            });

        });

    }


    /* ========================================================
       07. ACTIVE NAVIGATION

       Main website navigation:
       Books    -> books.html
       Ministry -> index.html
       About    -> about.html
       Pastors  -> pastors.html
       Sermons  -> sermons.html
       Events   -> events.html
       Contact  -> contact.html
    ======================================================== */

    const currentPage = (
        window.location.pathname
            .split("/")
            .filter(Boolean)
            .pop() || "index.html"
    ).toLowerCase();


    const navLinks = document.querySelectorAll(
        ".main-header nav a"
    );


    navLinks.forEach(link => {

        const href = link.getAttribute("href");

        if (!href || href.startsWith("#")) {
            return;
        }

        let linkPage;

        try {

            linkPage = new URL(
                href,
                window.location.href
            ).pathname
                .split("/")
                .filter(Boolean)
                .pop();

        } catch {
            return;
        }

        linkPage = (linkPage || "index.html").toLowerCase();

        const isCurrentPage = linkPage === currentPage;

        link.classList.toggle(
            "active",
            isCurrentPage
        );

        if (isCurrentPage) {

            link.setAttribute(
                "aria-current",
                "page"
            );

        } else {

            link.removeAttribute("aria-current");

        }

    });


    /* ========================================================
       08. IMAGE ERROR HANDLING

       Adds an error class to images that fail to load.
       Does not replace images with invented paths.
    ======================================================== */

    const images = document.querySelectorAll("img");

    images.forEach(image => {

        image.addEventListener("error", () => {

            image.classList.add("image-error");

            console.warn(
                "Image could not be loaded:",
                image.getAttribute("src")
            );

        });

        image.addEventListener("load", () => {

            image.classList.remove("image-error");

        });

    });


    /* ========================================================
       09. VIDEO MANAGEMENT

       Features:
       - Only one video plays at a time.
       - Pauses other videos when a new video starts.
       - Supports portrait and landscape videos.
       - Preserves native video controls.
       - Does not automatically play videos.
       - Does not force videos to restart.
    ======================================================== */

    const videos = document.querySelectorAll(
        ".video-wrapper video"
    );


    videos.forEach(video => {

        /* Ensure browser-native controls are available. */

        if (!video.hasAttribute("controls")) {

            video.setAttribute("controls", "");

        }

        /* Inline playback on supported mobile browsers. */

        video.setAttribute(
            "playsinline",
            ""
        );

        /*
           Avoid automatic playback.

           Videos should play only when the visitor
           deliberately presses the play button.
        */

        video.autoplay = false;


        /* Pause every other video when this one starts. */

        video.addEventListener("play", () => {

            videos.forEach(otherVideo => {

                if (
                    otherVideo !== video &&
                    !otherVideo.paused
                ) {

                    otherVideo.pause();

                }

            });

        });


        /* Log media errors without breaking the page. */

        video.addEventListener("error", () => {

            console.warn(
                "Video could not be loaded:",
                video.currentSrc ||
                video.querySelector("source")?.src ||
                "Unknown video source"
            );

            video.classList.add("video-error");

        });


        video.addEventListener("loadedmetadata", () => {

            video.classList.remove("video-error");

        });

    });


    /* ========================================================
       10. VIDEO VISIBILITY OPTIMIZATION

       Videos are not automatically played.

       If the visitor scrolls away from a playing video,
       it is paused to avoid unnecessary background playback.
    ======================================================== */

    if (
        "IntersectionObserver" in window &&
        !prefersReducedMotion
    ) {

        const videoObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        !entry.isIntersecting &&
                        entry.target instanceof HTMLVideoElement
                    ) {

                        if (!entry.target.paused) {

                            entry.target.pause();

                        }

                    }

                });

            },
            {
                threshold: 0.05
            }
        );


        videos.forEach(video => {

            videoObserver.observe(video);

        });

    }


    /* ========================================================
       11. OPTIONAL VIDEO SOURCE LAZY LOADING

       For this feature, HTML video sources should use:

       <video controls playsinline preload="none">
           <source
               data-src="images/example.mp4"
               type="video/mp4"
           >
       </video>

       The source is loaded when the video approaches
       the visible screen area.

       Existing src attributes are left unchanged.
    ======================================================== */

    const lazyVideoSources = document.querySelectorAll(
        ".video-wrapper video source[data-src]"
    );


    if (
        lazyVideoSources.length &&
        "IntersectionObserver" in window
    ) {

        const lazyVideoObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        const video = entry.target;

                        const source = video.querySelector(
                            "source[data-src]"
                        );

                        if (source) {

                            source.src = source.dataset.src;

                            source.removeAttribute("data-src");

                            video.load();

                        }

                        observer.unobserve(video);

                    }

                });

            },
            {
                rootMargin: "250px 0px"
            }
        );


        lazyVideoSources.forEach(source => {

            const video = source.closest("video");

            if (video) {

                lazyVideoObserver.observe(video);

            }

        });

    }


    /* ========================================================
       12. REDUCED MOTION ACCESSIBILITY
    ======================================================== */

    if (prefersReducedMotion) {

        document.documentElement.style.scrollBehavior =
            "auto";

        document.querySelectorAll(
            ".reveal, .visible"
        ).forEach(element => {

            element.classList.add("visible");

        });

    }


    /* ========================================================
       13. PAGE READY
    ======================================================== */

    body.classList.add("page-loaded");

    console.info(
        "Jeeva Nadi Ministries | About Page | Version 2.0"
    );

});
