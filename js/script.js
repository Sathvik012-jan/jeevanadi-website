/* =====================================================
   JEEVA NADI MINISTRIES
   MAIN JAVASCRIPT
   -----------------------------------------------------
   1. Sermon Search
   2. Registration & Payment
   3. Firebase Registration
   4. Jeeva Nadi Books Store Popup
   5. Countdown Timer
   6. Mobile Navigation
   7. Smooth Scroll
   8. Fade-in Animation
   9. Back to Top
   10. Memory Verse Language Selector
   11. Global UI Improvements
===================================================== */


document.addEventListener("DOMContentLoaded", function () {


    /* =================================================
       1. SERMON SEARCH
    ================================================= */

    const searchBox =
        document.getElementById("sermonSearch");

    const sermonCards =
        document.querySelectorAll(".sermon-card");


    if (searchBox && sermonCards.length) {

        searchBox.addEventListener(
            "input",
            function () {

                const searchValue =
                    searchBox.value
                        .toLowerCase()
                        .trim();


                sermonCards.forEach(
                    function (card) {

                        const title =
                            card.querySelector("h3")
                                ?.textContent
                                .toLowerCase() || "";


                        const speaker =
                            card.querySelector(".speaker")
                                ?.textContent
                                .toLowerCase() || "";


                        const description =
                            card.querySelector("p")
                                ?.textContent
                                .toLowerCase() || "";


                        const matches =
                            title.includes(searchValue) ||
                            speaker.includes(searchValue) ||
                            description.includes(searchValue);


                        card.style.display =
                            matches ? "" : "none";

                    }
                );

            }
        );

    }


    /* =================================================
       2. REGISTRATION & PAYMENT
    ================================================= */

    const payButton =
        document.getElementById("payButton");

    const paymentBox =
        document.getElementById("paymentBox");

    const continueToVerification =
        document.getElementById(
            "continueToVerification"
        );

    const paymentVerification =
        document.getElementById(
            "paymentVerification"
        );

    const continueButton =
        document.getElementById("continueButton");

    const cohortSelect =
        document.getElementById("cohortSelect");

    const registrationFeeDisplay =
        document.getElementById("registrationFee");

    const amountPayableDisplay =
        document.getElementById("amountPayable");


    let registrationData = {};


    /* =================================================
       2A. COHORT / REGISTRATION FEE
    ================================================= */

    function updateRegistrationFee() {

        if (
            !cohortSelect ||
            !registrationFeeDisplay ||
            !amountPayableDisplay
        ) {

            return;

        }


        const fee =
            Number(cohortSelect.value) || 0;


        registrationFeeDisplay.textContent =
            "₹" + fee;


        amountPayableDisplay.textContent =
            "₹" + fee;

    }


    if (cohortSelect) {

        cohortSelect.addEventListener(
            "change",
            updateRegistrationFee
        );


        updateRegistrationFee();

    }


    /* =================================================
       2B. GET REGISTRATION DATA
    ================================================= */

    function getRegistrationData() {

        const fullName =
            document.getElementById("fullName")
                ?.value
                .trim() || "";


        const age =
            document.getElementById("age")
                ?.value
                .trim() || "";


        const phone =
            document.getElementById("phone")
                ?.value
                .trim() || "";


        const email =
            document.getElementById("email")
                ?.value
                .trim() || "";


        const location =
            document.getElementById("location")
                ?.value
                .trim() || "";


        const church =
            document.getElementById("church")
                ?.value
                .trim() || "";


        const studentClass =
            document.getElementById("cohortSelect")
                ?.value
                .trim() || "";


        const fee =
            Number(studentClass) || 0;


        return {

            fullName,
            age,
            phone,
            email,
            location,
            church,
            studentClass,
            fee

        };

    }


    /* =================================================
       2C. VALIDATE REGISTRATION
    ================================================= */

    function validateRegistration(data) {

        if (!data.fullName) {

            alert(
                "Please enter Full Name."
            );

            return false;

        }


        if (!data.age) {

            alert(
                "Please enter Age."
            );

            return false;

        }


        if (!data.phone) {

            alert(
                "Please enter Phone Number."
            );

            return false;

        }


        if (!/^[0-9]{10}$/.test(data.phone)) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return false;

        }


        if (!data.email) {

            alert(
                "Please enter Email Address."
            );

            return false;

        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(data.email)
        ) {

            alert(
                "Please enter a valid email address."
            );

            return false;

        }


        if (!data.location) {

            alert(
                "Please enter Location."
            );

            return false;

        }


        if (!data.church) {

            alert(
                "Please enter Church Name."
            );

            return false;

        }


        if (!data.studentClass) {

            alert(
                "Please select a Group."
            );

            return false;

        }


        if (data.fee <= 0) {

            alert(
                "Please select a valid registration group."
            );

            return false;

        }


        return true;

    }


    /* =================================================
       2D. OPEN PAYMENT SECTION
    ================================================= */

    if (payButton) {

        payButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                registrationData =
                    getRegistrationData();


                if (
                    !validateRegistration(
                        registrationData
                    )
                ) {

                    return;

                }


                /* -------------------------------------
                   SAVE REGISTRATION LOCALLY
                ------------------------------------- */

                localStorage.setItem(
                    "registrationData",
                    JSON.stringify(
                        registrationData
                    )
                );


                /* -------------------------------------
                   UPDATE PAYMENT AMOUNT
                ------------------------------------- */

                if (amountPayableDisplay) {

                    amountPayableDisplay.textContent =
                        "₹" +
                        registrationData.fee;

                }


                /* -------------------------------------
                   SHOW PAYMENT BOX
                ------------------------------------- */

                if (paymentBox) {

                    paymentBox.style.display =
                        "block";


                    requestAnimationFrame(
                        function () {

                            paymentBox.scrollIntoView({

                                behavior: "smooth",

                                block: "center"

                            });

                        }
                    );

                }

            }
        );

    }


    /* =================================================
       2E. OPEN UTR VERIFICATION
    ================================================= */

    if (continueToVerification) {

        continueToVerification.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const savedData =
                    localStorage.getItem(
                        "registrationData"
                    );


                if (!savedData) {

                    alert(
                        "Please complete the registration form first."
                    );

                    return;

                }


                if (paymentVerification) {

                    paymentVerification.style.display =
                        "block";


                    requestAnimationFrame(
                        function () {

                            paymentVerification.scrollIntoView({

                                behavior: "smooth",

                                block: "center"

                            });

                        }
                    );

                }

            }
        );

    }


    /* =================================================
       2F. FINAL PAYMENT CONFIRMATION
    ================================================= */

    if (continueButton) {

        continueButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                /* -------------------------------------
                   PREVENT DOUBLE SUBMISSION
                ------------------------------------- */

                if (
                    continueButton.dataset.submitting ===
                    "true"
                ) {

                    return;

                }


                const savedData =
                    localStorage.getItem(
                        "registrationData"
                    );


                if (!savedData) {

                    alert(
                        "Please complete registration first."
                    );

                    return;

                }


                let data;


                try {

                    data =
                        JSON.parse(savedData);

                } catch (error) {

                    console.error(
                        "Invalid registration data:",
                        error
                    );


                    alert(
                        "Registration data is invalid. Please register again."
                    );

                    return;

                }


                const utr =
                    document.getElementById("utr")
                        ?.value
                        .trim() || "";


                const confirmPayment =
                    document.getElementById(
                        "confirmPayment"
                    )?.checked || false;


                /* -------------------------------------
                   VALIDATE UTR
                ------------------------------------- */

                if (!/^[0-9]{12}$/.test(utr)) {

                    alert(
                        "Please enter a valid 12-digit UTR Number."
                    );

                    return;

                }


                /* -------------------------------------
                   CONFIRM PAYMENT
                ------------------------------------- */

                if (!confirmPayment) {

                    alert(
                        "Please confirm that the payment has been completed."
                    );

                    return;

                }


                /* -------------------------------------
                   CHECK FIREBASE
                ------------------------------------- */

                if (
                    typeof db === "undefined" ||
                    !db
                ) {

                    console.error(
                        "Firebase database object 'db' is unavailable."
                    );


                    alert(
                        "Registration system is currently unavailable. Please try again later."
                    );

                    return;

                }


                /* -------------------------------------
                   DISABLE SUBMIT BUTTON
                ------------------------------------- */

                continueButton.dataset.submitting =
                    "true";


                continueButton.disabled =
                    true;


                const originalButtonText =
                    continueButton.textContent;


                continueButton.textContent =
                    "Submitting...";


                /* -------------------------------------
                   SAVE TO FIRESTORE
                ------------------------------------- */

                try {

                    await db
                        .collection("participants")
                        .add({

                            Name:
                                data.fullName,

                            Age:
                                data.age,

                            Phone:
                                data.phone,

                            Email:
                                data.email,

                            Location:
                                data.location,

                            Church:
                                data.church,

                            Group:
                                data.studentClass,

                            Fee:
                                data.fee,

                            UTR:
                                utr,

                            PaymentStatus:
                                "Completed",

                            RegisteredAt:
                                firebase
                                    ?.firestore
                                    ?.FieldValue
                                    ?.serverTimestamp
                                    ? firebase
                                        .firestore
                                        .FieldValue
                                        .serverTimestamp()
                                    : new Date()

                        });


                    console.log(
                        "Registration saved successfully."
                    );


                    /* ---------------------------------
                       CLEAR LOCAL DATA
                    --------------------------------- */

                    localStorage.removeItem(
                        "registrationData"
                    );


                    /* ---------------------------------
                       SUCCESS MESSAGE
                    --------------------------------- */

                    alert(
                        "🎉 Registration Completed Successfully!\n\n" +
                        "Thank you for registering for the Bible Quiz."
                    );


                    window.location.href =
                        "registration-success.html";


                } catch (error) {

                    console.error(
                        "Firestore Error:",
                        error
                    );


                    alert(
                        "Registration failed.\n" +
                        "Please check your details and try again."
                    );


                    continueButton.disabled =
                        false;


                    continueButton.dataset.submitting =
                        "false";


                    continueButton.textContent =
                        originalButtonText;

                }

            }
        );

    }

/* =================================================
   3. JEEVA NADI BOOKS STORE POPUP
================================================= */

const booksPopup =
    document.getElementById("booksPopup");

const closeBooksPopup =
    document.getElementById("closeBooksPopup");

const booksLaterBtn =
    document.getElementById("booksLaterBtn");

const exploreBooksBtn =
    document.getElementById("exploreBooksBtn");


/* -------------------------------------------------
   OPEN BOOKS POPUP
------------------------------------------------- */

function openBooksPopup() {

    if (!booksPopup) {
        console.warn("Books popup element not found.");
        return;
    }

    /* ---------------------------------------------
       Remove hidden state FIRST
    --------------------------------------------- */

    booksPopup.hidden = false;
    booksPopup.removeAttribute("hidden");

    /* ---------------------------------------------
       Prevent background scrolling
    --------------------------------------------- */

    document.body.classList.add(
        "books-popup-open"
    );

    /* ---------------------------------------------
       Wait for browser to render the visible state
       before starting animation
    --------------------------------------------- */

    requestAnimationFrame(function () {

        requestAnimationFrame(function () {

            booksPopup.classList.add(
                "books-popup-visible"
            );

        });

    });

}


/* -------------------------------------------------
   CLOSE BOOKS POPUP
------------------------------------------------- */

function closeBooksStorePopup() {

    if (!booksPopup) {
        return;
    }

    /* ---------------------------------------------
       Remove visible state
    --------------------------------------------- */

    booksPopup.classList.remove(
        "books-popup-visible"
    );

    /* ---------------------------------------------
       Restore page scrolling
    --------------------------------------------- */

    document.body.classList.remove(
        "books-popup-open"
    );

    /* ---------------------------------------------
       Wait for closing animation
    --------------------------------------------- */

    setTimeout(function () {

        /*
           Only hide if popup is still closed.
           Prevents a race condition if the popup
           is opened again during the animation.
        */

        if (
            !booksPopup.classList.contains(
                "books-popup-visible"
            )
        ) {

            booksPopup.hidden = true;

            booksPopup.setAttribute(
                "hidden",
                ""
            );

        }

    }, 350);

}


/* -------------------------------------------------
   CLOSE BUTTON
------------------------------------------------- */

if (closeBooksPopup) {

    closeBooksPopup.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            closeBooksStorePopup();

        }
    );

}


/* -------------------------------------------------
   MAYBE LATER BUTTON
------------------------------------------------- */

if (booksLaterBtn) {

    booksLaterBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            /*
               Remember that the visitor dismissed
               the popup during this browser session.
            */

            sessionStorage.setItem(
                "jeevaNadiBooksPopupDismissed",
                "true"
            );

            closeBooksStorePopup();

        }
    );

}


/* -------------------------------------------------
   EXPLORE BOOKS BUTTON
------------------------------------------------- */

if (exploreBooksBtn) {

    exploreBooksBtn.addEventListener(
        "click",
        function () {

            /*
               Remember that the visitor has already
               interacted with the popup.
            */

            sessionStorage.setItem(
                "jeevaNadiBooksPopupDismissed",
                "true"
            );

        }
    );

}


/* -------------------------------------------------
   CLICK OUTSIDE POPUP
------------------------------------------------- */

if (booksPopup) {

    booksPopup.addEventListener(
        "click",
        function (event) {

            /*
               Only close when the dark overlay itself
               is clicked, not the popup content.
            */

            if (
                event.target === booksPopup
            ) {

                closeBooksStorePopup();

            }

        }
    );

}


/* -------------------------------------------------
   ESCAPE KEY
------------------------------------------------- */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            booksPopup &&
            !booksPopup.hidden
        ) {

            closeBooksStorePopup();

        }

    }
);


/* -------------------------------------------------
   AUTOMATICALLY SHOW BOOKS POPUP
------------------------------------------------- */

const booksPopupDismissed =
    sessionStorage.getItem(
        "jeevaNadiBooksPopupDismissed"
    );


/*
   Popup appears after 4 seconds.

   It will not appear again during the same
   browser session after the visitor chooses
   "Maybe Later" or "Explore Books".
*/

if (
    booksPopup &&
    !booksPopupDismissed
) {

    setTimeout(
        function () {

            openBooksPopup();

        },
        4000
    );

}
    /* =================================================
       4. COUNTDOWN TIMER
    ================================================= */

    const daysElement =
        document.getElementById("days");

    const hoursElement =
        document.getElementById("hours");

    const minutesElement =
        document.getElementById("minutes");

    const secondsElement =
        document.getElementById("seconds");


    if (
        daysElement &&
        hoursElement &&
        minutesElement &&
        secondsElement
    ) {

        /*
           Bible Quiz 2026
           August 15, 2026
           09:00 AM
           India Standard Time
        */

        const eventDate =
            new Date(
                "2026-08-15T09:00:00+05:30"
            ).getTime();


        function updateCountdown() {

            const now =
                Date.now();


            const distance =
                eventDate - now;


            if (distance <= 0) {

                daysElement.textContent =
                    "00";

                hoursElement.textContent =
                    "00";

                minutesElement.textContent =
                    "00";

                secondsElement.textContent =
                    "00";


                return false;

            }


            const days =
                Math.floor(
                    distance /
                    (1000 * 60 * 60 * 24)
                );


            const hours =
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60 * 24)
                    ) /
                    (1000 * 60 * 60)
                );


            const minutes =
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60)
                    ) /
                    (1000 * 60)
                );


            const seconds =
                Math.floor(
                    (
                        distance %
                        (1000 * 60)
                    ) /
                    1000
                );


            daysElement.textContent =
                String(days).padStart(2, "0");


            hoursElement.textContent =
                String(hours).padStart(2, "0");


            minutesElement.textContent =
                String(minutes).padStart(2, "0");


            secondsElement.textContent =
                String(seconds).padStart(2, "0");


            return true;

        }


        updateCountdown();


        const countdownTimer =
            setInterval(
                function () {

                    if (
                        !updateCountdown()
                    ) {

                        clearInterval(
                            countdownTimer
                        );

                    }

                },
                1000
            );

    }


    /* =================================================
       5. MOBILE NAVIGATION
    ================================================= */

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );


    const navMenu =
        document.querySelector(
            "header nav ul"
        );


    function closeMobileMenu() {

        if (!navMenu) {

            return;

        }


        navMenu.classList.remove(
            "show"
        );


        if (menuToggle) {

            menuToggle.classList.remove(
                "active"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

        }


        document.body.classList.remove(
            "menu-open"
        );

    }


    function openMobileMenu() {

        if (!navMenu) {

            return;

        }


        navMenu.classList.add(
            "show"
        );


        if (menuToggle) {

            menuToggle.classList.add(
                "active"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );


            menuToggle.setAttribute(
                "aria-label",
                "Close navigation menu"
            );

        }


        document.body.classList.add(
            "menu-open"
        );

    }


    if (
        menuToggle &&
        navMenu
    ) {

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );


        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );


        menuToggle.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                const isOpen =
                    navMenu.classList.contains(
                        "show"
                    );


                if (isOpen) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();

                }

            }
        );


        /* ---------------------------------------------
           CLOSE AFTER NAVIGATION
        --------------------------------------------- */

        navMenu
            .querySelectorAll("a")
            .forEach(
                function (link) {

                    link.addEventListener(
                        "click",
                        function () {

                            closeMobileMenu();

                        }
                    );

                }
            );


        /* ---------------------------------------------
           CLICK OUTSIDE
        --------------------------------------------- */

        document.addEventListener(
            "click",
            function (event) {

                const clickedInsideMenu =
                    navMenu.contains(
                        event.target
                    );


                const clickedToggle =
                    menuToggle.contains(
                        event.target
                    );


                if (
                    !clickedInsideMenu &&
                    !clickedToggle
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* ---------------------------------------------
           ESCAPE
        --------------------------------------------- */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeMobileMenu();

                }

            }
        );


        /* ---------------------------------------------
           DESKTOP RESET
        --------------------------------------------- */

        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 768
                ) {

                    closeMobileMenu();

                }

            }
        );

    }


    /* =================================================
       6. SMOOTH SCROLL
    ================================================= */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            function (anchor) {

                anchor.addEventListener(
                    "click",
                    function (event) {

                        const href =
                            this.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            href === "#"
                        ) {

                            return;

                        }


                        let target;


                        try {

                            target =
                                document.querySelector(
                                    href
                                );

                        } catch (error) {

                            return;

                        }


                        if (!target) {

                            return;

                        }


                        event.preventDefault();


                        closeMobileMenu();


                        const header =
                            document.querySelector(
                                "header"
                            );


                        const headerHeight =
                            header
                                ? header.offsetHeight
                                : 0;


                        const targetPosition =
                            target
                                .getBoundingClientRect()
                                .top +
                            window.scrollY -
                            headerHeight -
                            15;


                        window.scrollTo({

                            top:
                                Math.max(
                                    0,
                                    targetPosition
                                ),

                            behavior:
                                "smooth"

                        });

                    }
                );

            }
        );


    /* =================================================
       7. FADE-IN ANIMATION
    ================================================= */

    const fadeElements =
        document.querySelectorAll(
            ".fade-in"
        );


    if (fadeElements.length) {

        if (
            "IntersectionObserver" in window
        ) {

            const fadeObserver =
                new IntersectionObserver(
                    function (
                        entries,
                        observer
                    ) {

                        entries.forEach(
                            function (entry) {

                                if (
                                    entry.isIntersecting
                                ) {

                                    entry.target
                                        .classList
                                        .add(
                                            "visible"
                                        );


                                    observer.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );

                    },
                    {

                        threshold: 0.12,

                        rootMargin:
                            "0px 0px -40px 0px"

                    }
                );


            fadeElements.forEach(
                function (element) {

                    fadeObserver.observe(
                        element
                    );

                }
            );

        } else {

            fadeElements.forEach(
                function (element) {

                    element.classList.add(
                        "visible"
                    );

                }
            );

        }

    }


    /* =================================================
       8. BACK TO TOP
    ================================================= */

    const backToTop =
        document.getElementById(
            "backToTop"
        );


    if (backToTop) {

        function updateBackToTop() {

            if (
                window.scrollY > 400
            ) {

                backToTop.classList.add(
                    "show"
                );

            } else {

                backToTop.classList.remove(
                    "show"
                );

            }

        }


        window.addEventListener(
            "scroll",
            updateBackToTop,
            {
                passive: true
            }
        );


        updateBackToTop();


        backToTop.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =================================================
       9. MEMORY VERSE
          LANGUAGE SELECTOR
    ================================================= */

    const languageButton =
        document.querySelector(
            ".verse-language-btn"
        );


    const languageSelector =
        document.querySelector(
            ".language-selector"
        );


    const languageSearch =
        document.getElementById(
            "languageSearch"
        );


    const languageList =
        document.getElementById(
            "languageList"
        );


    const verseText =
        document.getElementById(
            "memoryVerseText"
        );


    const verseReference =
        document.getElementById(
            "memoryVerseReference"
        );


    if (
        languageButton &&
        languageSelector &&
        languageList &&
        verseText &&
        verseReference
    ) {

        const verses = {

            English: {

                text:
                    "Trust in the Lord with all your heart and lean not on your own understanding.",

                reference:
                    "— Proverbs 3:5"

            },


            Telugu: {

                text:
                    "నీ పూర్ణహృదయముతో యెహోవాను నమ్ముకొనుము, నీ స్వబుద్ధిని ఆధారము చేసికొనకుము.",

                reference:
                    "— సామెతలు 3:5"

            },


            Hindi: {

                text:
                    "तू अपने सम्पूर्ण मन से यहोवा पर भरोसा रखना, और अपनी समझ का सहारा न लेना।",

                reference:
                    "— नीतिवचन 3:5"

            },


            Tamil: {

                text:
                    "உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிரு; உன் சுயபுத்தியின்மேல் சாயாதே.",

                reference:
                    "— நீதிமொழிகள் 3:5"

            },


            Kannada: {

                text:
                    "ನಿನ್ನ ಪೂರ್ಣ ಹೃದಯದಿಂದ ಕರ್ತನನ್ನು ನಂಬಿಕೊ; ನಿನ್ನ ಸ್ವಂತ ವಿವೇಕದ ಮೇಲೆ ಆಧಾರಪಡಬೇಡ.",

                reference:
                    "— ಜ್ಞಾನೋಕ್ತಿಗಳು 3:5"

            },


            Malayalam: {

                text:
                    "പൂർണ്ണഹൃദയത്തോടെ യഹോവയിൽ ആശ്രയിക്ക; സ്വന്തം വിവേകത്തിൽ ആശ്രയിക്കരുത്.",

                reference:
                    "— സദൃശവാക്യങ്ങൾ 3:5"

            },


            Bengali: {

                text:
                    "তোমার সমস্ত হৃদয় দিয়ে সদাপ্রভুর উপর নির্ভর কর এবং নিজের বুদ্ধির উপর নির্ভর করো না।",

                reference:
                    "— হিতোপদেশ 3:5"

            },


            Marathi: {

                text:
                    "तू आपल्या संपूर्ण अंतःकरणाने परमेश्वरावर भाव ठेव आणि स्वतःच्या बुद्धीवर अवलंबून राहू नकोस.",

                reference:
                    "— नीतिसूत्रे 3:5"

            },


            Gujarati: {

                text:
                    "તારા પૂરા હૃદયથી યહોવા પર ભરોસો રાખ અને પોતાની સમજ પર આધાર ન રાખ.",

                reference:
                    "— નીતિવચનો 3:5"

            },


            Punjabi: {

                text:
                    "ਆਪਣੇ ਪੂਰੇ ਦਿਲ ਨਾਲ ਯਹੋਵਾਹ ਉੱਤੇ ਭਰੋਸਾ ਰੱਖ ਅਤੇ ਆਪਣੀ ਸਮਝ ਉੱਤੇ ਨਿਰਭਰ ਨਾ ਹੋ।",

                reference:
                    "— ਕਹਾਉਤਾਂ 3:5"

            },


            Spanish: {

                text:
                    "Confía en el Señor con todo tu corazón y no te apoyes en tu propia prudencia.",

                reference:
                    "— Proverbios 3:5"

            },


            French: {

                text:
                    "Confie-toi en l'Éternel de tout ton cœur et ne t'appuie pas sur ta propre intelligence.",

                reference:
                    "— Proverbes 3:5"

            },


            German: {

                text:
                    "Vertraue auf den HERRN von ganzem Herzen und verlass dich nicht auf deinen Verstand.",

                reference:
                    "— Sprüche 3:5"

            },


            Italian: {

                text:
                    "Confida nel Signore con tutto il tuo cuore e non appoggiarti sul tuo discernimento.",

                reference:
                    "— Proverbi 3:5"

            },


            Portuguese: {

                text:
                    "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.",

                reference:
                    "— Provérbios 3:5"

            },


            Dutch: {

                text:
                    "Vertrouw op de HEER met heel je hart en steun niet op je eigen inzicht.",

                reference:
                    "— Spreuken 3:5"

            },


            Greek: {

                text:
                    "Ἔλπιζε ἐπὶ Κύριον ἐξ ὅλης τῆς καρδίας σου, καὶ μὴ ἐπαίρου ἐπὶ τῇ σῇ φρονήσει.",

                reference:
                    "— Παροιμίαι 3:5"

            },


            Russian: {

                text:
                    "Надейся на Господа всем сердцем твоим и не полагайся на разум твой.",

                reference:
                    "— Притчи 3:5"

            },


            Ukrainian: {

                text:
                    "Надійся на Господа всім своїм серцем і не покладайся на власний розум.",

                reference:
                    "— Приповісті 3:5"

            },


            Polish: {

                text:
                    "Zaufaj Panu z całego swego serca i nie polegaj na własnym rozumie.",

                reference:
                    "— Przysłów 3:5"

            },


            Romanian: {

                text:
                    "Încrede-te în Domnul din toată inima ta și nu te bizui pe înțelepciunea ta.",

                reference:
                    "— Proverbele 3:5"

            },


            Chinese: {

                text:
                    "你要专心仰赖耶和华，不可倚靠自己的聪明。",

                reference:
                    "— 箴言 3:5"

            },


            Japanese: {

                text:
                    "心をつくして主に信頼し、自分の悟りにたよってはならない。",

                reference:
                    "— 箴言 3:5"

            },


            Korean: {

                text:
                    "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라.",

                reference:
                    "— 잠언 3:5"

            },


            Arabic: {

                text:
                    "تَوَكَّلْ عَلَى الرَّبِّ بِكُلِّ قَلْبِكَ، وَعَلَى فَهْمِكَ لَا تَعْتَمِدْ.",

                reference:
                    "— أمثال 3:5"

            },


            Hebrew: {

                text:
                    "בְּטַח אֶל־יְהוָה בְּכָל־לִבֶּךָ וְאֶל־בִּינָתְךָ אַל־תִּשָּׁעֵן.",

                reference:
                    "— משלי 3:5"

            },


            Turkish: {

                text:
                    "Bütün yüreğinle RAB'be güven ve kendi anlayışına dayanma.",

                reference:
                    "— Süleyman'ın Özdeyişleri 3:5"

            }

        };


        /* ---------------------------------------------
           OPEN LANGUAGE SELECTOR
        --------------------------------------------- */

        function openLanguageSelector() {

            languageSelector.classList.add(
                "active"
            );


            languageButton.setAttribute(
                "aria-expanded",
                "true"
            );


            if (languageSearch) {

                setTimeout(
                    function () {

                        languageSearch.focus();

                    },
                    100
                );

            }

        }


        /* ---------------------------------------------
           CLOSE LANGUAGE SELECTOR
        --------------------------------------------- */

        function closeLanguageSelector() {

            languageSelector.classList.remove(
                "active"
            );


            languageButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }


        languageButton.setAttribute(
            "aria-expanded",
            "false"
        );


        /* ---------------------------------------------
           LANGUAGE BUTTON
        --------------------------------------------- */

        languageButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                const isOpen =
                    languageSelector.classList.contains(
                        "active"
                    );


                if (isOpen) {

                    closeLanguageSelector();

                } else {

                    openLanguageSelector();

                }

            }
        );


        /* ---------------------------------------------
           LANGUAGE SEARCH
        --------------------------------------------- */

        if (languageSearch) {

            languageSearch.addEventListener(
                "input",
                function () {

                    const searchValue =
                        languageSearch.value
                            .toLowerCase()
                            .trim();


                    const languages =
                        languageList
                            .querySelectorAll(
                                "button"
                            );


                    languages.forEach(
                        function (button) {

                            const language =
                                button.textContent
                                    .toLowerCase();


                            button.style.display =
                                language.includes(
                                    searchValue
                                )
                                    ? ""
                                    : "none";

                        }
                    );

                }
            );

        }


        /* ---------------------------------------------
           LANGUAGE SELECTION
        --------------------------------------------- */

        languageList.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {

                    return;

                }


                const language =
                    button.dataset.lang;


                if (
                    !language ||
                    !verses[language]
                ) {

                    return;

                }


                languageList
                    .querySelectorAll(
                        "button"
                    )
                    .forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                button.classList.add(
                    "active"
                );


                verseText.textContent =
                    "“" +
                    verses[language].text +
                    "”";


                verseReference.textContent =
                    verses[language].reference;


                closeLanguageSelector();

            }
        );


        /* ---------------------------------------------
           CLICK OUTSIDE
        --------------------------------------------- */

        document.addEventListener(
            "click",
            function (event) {

                if (
                    !languageSelector.contains(
                        event.target
                    )
                ) {

                    closeLanguageSelector();

                }

            }
        );


        /* ---------------------------------------------
           ESCAPE KEY
        --------------------------------------------- */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeLanguageSelector();

                }

            }
        );

    }


    /* =================================================
       10. MOBILE-FRIENDLY TOUCH BEHAVIOR
    ================================================= */

    /*
       Prevent accidental horizontal overflow.
    */

    document.documentElement.style
        .overflowX = "hidden";


    /* =================================================
       11. INITIAL UI STATE
    ================================================= */

    if (paymentBox) {

        paymentBox.setAttribute(
            "aria-live",
            "polite"
        );

    }


    if (paymentVerification) {

        paymentVerification.setAttribute(
            "aria-live",
            "polite"
        );

    }


    /* =================================================
       SCRIPT READY
    ================================================= */

    console.log(
        "Jeeva Nadi Ministries — JavaScript loaded successfully."
    );

});
