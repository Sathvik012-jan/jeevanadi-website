
/* ============================================================
   JEEVA NADI MINISTRIES
   MAIN JAVASCRIPT
   VERSION 2.0

   RESPONSIVE | ACCESSIBLE | MODULAR

   FEATURES
   01. Sermon Search
   02. Registration & Payment
   03. Firebase Registration
   04. Countdown Timer
   05. Mobile Navigation
   06. Smooth Scroll
   07. Fade-in Animation
   08. Back to Top
   09. Memory Verse Language Selector
   10. Mobile-Friendly Behaviour

   NOTE:
   Books Store popup functionality has been removed.
   The Books page remains accessible through navigation.
============================================================ */


document.addEventListener("DOMContentLoaded", function () {


    /* ========================================================
       02. REGISTRATION & PAYMENT
    ======================================================== */

    const payButton =
        document.getElementById("payButton");

    const paymentBox =
        document.getElementById("paymentBox");

    const continueToVerification =
        document.getElementById("continueToVerification");

    const paymentVerification =
        document.getElementById("paymentVerification");

    const continueButton =
        document.getElementById("continueButton");

    const cohortSelect =
        document.getElementById("cohortSelect");

    const registrationFeeDisplay =
        document.getElementById("registrationFee");

    const amountPayableDisplay =
        document.getElementById("amountPayable");


    let registrationData = {};



    /* ========================================================
       02A. UPDATE REGISTRATION FEE
    ======================================================== */

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



    /* ========================================================
       02B. GET REGISTRATION DATA
    ======================================================== */

    function getRegistrationData() {

        const fullName =
            document.getElementById("fullName")
                ?.value.trim() || "";


        const age =
            document.getElementById("age")
                ?.value.trim() || "";


        const phone =
            document.getElementById("phone")
                ?.value.trim() || "";


        const email =
            document.getElementById("email")
                ?.value.trim() || "";


        const location =
            document.getElementById("location")
                ?.value.trim() || "";


        const church =
            document.getElementById("church")
                ?.value.trim() || "";


        const studentClass =
            document.getElementById("cohortSelect")
                ?.value.trim() || "";


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



    /* ========================================================
       02C. VALIDATE REGISTRATION
    ======================================================== */

    function validateRegistration(data) {

        if (!data.fullName) {

            alert("Please enter Full Name.");

            return false;

        }


        if (!data.age) {

            alert("Please enter Age.");

            return false;

        }


        if (!data.phone) {

            alert("Please enter Phone Number.");

            return false;

        }


        if (!/^[0-9]{10}$/.test(data.phone)) {

            alert(
                "Please enter a valid 10-digit mobile number."
            );

            return false;

        }


        if (!data.email) {

            alert("Please enter Email Address.");

            return false;

        }


        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {

            alert("Please enter a valid email address.");

            return false;

        }


        if (!data.location) {

            alert("Please enter Location.");

            return false;

        }


        if (!data.church) {

            alert("Please enter Church Name.");

            return false;

        }


        if (!data.studentClass) {

            alert("Please select a Group.");

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



    /* ========================================================
       02D. SCROLL TO SECTION
    ======================================================== */

    function scrollToSection(element) {

        if (!element) {
            return;
        }


        requestAnimationFrame(function () {

            element.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        });

    }



    /* ========================================================
       02E. OPEN PAYMENT SECTION
    ======================================================== */

    if (payButton) {

        payButton.addEventListener("click", function (event) {

            event.preventDefault();


            registrationData =
                getRegistrationData();


            if (!validateRegistration(registrationData)) {

                return;

            }


            try {

                localStorage.setItem(
                    "registrationData",
                    JSON.stringify(registrationData)
                );

            } catch (error) {

                console.error(
                    "Unable to save registration locally:",
                    error
                );

                alert(
                    "Unable to continue. Please check your browser settings."
                );

                return;

            }


            if (amountPayableDisplay) {

                amountPayableDisplay.textContent =
                    "₹" + registrationData.fee;

            }


            if (paymentBox) {

                paymentBox.style.display = "block";

                scrollToSection(paymentBox);

            }

        });

    }



    /* ========================================================
       02F. OPEN UTR VERIFICATION
    ======================================================== */

    if (continueToVerification) {

        continueToVerification.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                let savedData;


                try {

                    savedData =
                        localStorage.getItem("registrationData");

                } catch (error) {

                    console.error(
                        "Unable to access registration data:",
                        error
                    );

                }


                if (!savedData) {

                    alert(
                        "Please complete the registration form first."
                    );

                    return;

                }


                if (paymentVerification) {

                    paymentVerification.style.display = "block";

                    scrollToSection(paymentVerification);

                }

            }
        );

    }



    /* ========================================================
       02G. FINAL PAYMENT CONFIRMATION
    ======================================================== */

    if (continueButton) {

        continueButton.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                if (
                    continueButton.dataset.submitting === "true"
                ) {
                    return;
                }


                let savedData;


                try {

                    savedData =
                        localStorage.getItem("registrationData");

                } catch (error) {

                    console.error(
                        "Unable to read registration data:",
                        error
                    );

                }


                if (!savedData) {

                    alert(
                        "Please complete registration first."
                    );

                    return;

                }


                let data;


                try {

                    data = JSON.parse(savedData);

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
                        ?.value.trim() || "";


                const confirmPayment =
                    document.getElementById("confirmPayment")
                        ?.checked || false;



                /* --------------------------------------------
                   VALIDATE UTR
                -------------------------------------------- */

                if (!/^[0-9]{12}$/.test(utr)) {

                    alert(
                        "Please enter a valid 12-digit UTR Number."
                    );

                    return;

                }



                /* --------------------------------------------
                   CONFIRM PAYMENT
                -------------------------------------------- */

                if (!confirmPayment) {

                    alert(
                        "Please confirm that the payment has been completed."
                    );

                    return;

                }



                /* --------------------------------------------
                   CHECK FIREBASE DATABASE
                -------------------------------------------- */

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



                /* --------------------------------------------
                   PREVENT DOUBLE SUBMISSION
                -------------------------------------------- */

                continueButton.dataset.submitting = "true";

                continueButton.disabled = true;


                const originalButtonText =
                    continueButton.textContent;


                continueButton.textContent =
                    "Submitting...";



                /* --------------------------------------------
                   FIREBASE TIMESTAMP
                -------------------------------------------- */

                let registeredAt = new Date();


                if (
                    typeof firebase !== "undefined" &&
                    firebase.firestore &&
                    firebase.firestore.FieldValue
                ) {

                    registeredAt =
                        firebase.firestore.FieldValue.serverTimestamp();

                }



                /* --------------------------------------------
                   SAVE REGISTRATION TO FIRESTORE
                -------------------------------------------- */

                try {

                    await db
                        .collection("participants")
                        .add({

                            Name: data.fullName,

                            Age: data.age,

                            Phone: data.phone,

                            Email: data.email,

                            Location: data.location,

                            Church: data.church,

                            Group: data.studentClass,

                            Fee: data.fee,

                            UTR: utr,

                            PaymentStatus: "Completed",

                            RegisteredAt: registeredAt

                        });



                    /* ----------------------------------------
                       CLEAR LOCAL REGISTRATION DATA
                    ---------------------------------------- */

                    localStorage.removeItem(
                        "registrationData"
                    );



                    /* ----------------------------------------
                       SUCCESS MESSAGE
                    ---------------------------------------- */

                    alert(
                        "🎉 Registration Completed Successfully!\n\n" +
                        "Thank you for registering for the Bible Quiz."
                    );


                    window.location.href =
                        "registration-success.html";


                } catch (error) {

                    console.error(
                        "Firestore Registration Error:",
                        error
                    );


                    alert(
                        "Registration failed.\n" +
                        "Please check your details and try again."
                    );


                    continueButton.disabled = false;

                    continueButton.dataset.submitting = "false";

                    continueButton.textContent =
                        originalButtonText;

                }

            }
        );

    }



    /* ========================================================
       03. COUNTDOWN TIMER
    ======================================================== */

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
           BIBLE QUIZ 2026

           Original event date:
           15 August 2026
           09:00 AM IST

           Update this date when scheduling
           a new event.
        */

        const eventDate =
            new Date(
                "2026-08-15T09:00:00+05:30"
            ).getTime();


        function updateCountdown() {

            const now = Date.now();

            const distance = eventDate - now;


            if (distance <= 0) {

                daysElement.textContent = "00";

                hoursElement.textContent = "00";

                minutesElement.textContent = "00";

                secondsElement.textContent = "00";

                return false;

            }


            const days =
                Math.floor(
                    distance / (1000 * 60 * 60 * 24)
                );


            const hours =
                Math.floor(
                    (
                        distance % (1000 * 60 * 60 * 24)
                    ) / (1000 * 60 * 60)
                );


            const minutes =
                Math.floor(
                    (
                        distance % (1000 * 60 * 60)
                    ) / (1000 * 60)
                );


            const seconds =
                Math.floor(
                    (
                        distance % (1000 * 60)
                    ) / 1000
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
            setInterval(function () {

                if (!updateCountdown()) {

                    clearInterval(countdownTimer);

                }

            }, 1000);

    }




/* ========================================================
   04. MOBILE NAVIGATION — INTEGRATED FIX
======================================================== */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("primaryNavigation");
const navList = navMenu
    ? navMenu.querySelector("ul")
    : null;

function closeMobileMenu() {
    if (!menuToggle || !navList) return;

    navList.classList.remove("show");
    menuToggle.classList.remove("active");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");

    document.body.classList.remove("menu-open");
}

function openMobileMenu() {
    if (!menuToggle || !navList) return;

    navList.classList.add("show");
    menuToggle.classList.add("active");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");

    document.body.classList.add("menu-open");
}

if (menuToggle && navMenu && navList) {

    menuToggle.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (navList.classList.contains("show")) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    navList.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("click", function (event) {
        if (
            navList.classList.contains("show") &&
            !navMenu.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            closeMobileMenu();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 850) {
            closeMobileMenu();
        }
    });

    console.log("Jeeva Nadi: Mobile navigation initialized.");

} else {
    console.warn("Jeeva Nadi: Mobile navigation elements not found.");
}

/* ========================================================
       05. SMOOTH SCROLL
    ======================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(
        function (anchor) {

            anchor.addEventListener("click", function (event) {

                const href =
                    this.getAttribute("href");


                if (!href || href === "#") {
                    return;
                }


                let target;


                try {

                    target = document.querySelector(href);

                } catch (error) {

                    return;

                }


                if (!target) {
                    return;
                }


                event.preventDefault();


                if (typeof closeMobileMenu === "function") {

                    closeMobileMenu();

                }


                const header =
                    document.querySelector("header");


                const headerHeight =
                    header ? header.offsetHeight : 0;


                const targetPosition =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    headerHeight -
                    15;


                window.scrollTo({

                    top: Math.max(0, targetPosition),

                    behavior: "smooth"

                });

            });

        }
    );



    /* ========================================================
       06. FADE-IN ANIMATION
    ======================================================== */

    const fadeElements =
        document.querySelectorAll(".fade-in");


    if (fadeElements.length) {

        if ("IntersectionObserver" in window) {

            const fadeObserver =
                new IntersectionObserver(
                    function (entries, observer) {

                        entries.forEach(function (entry) {

                            if (entry.isIntersecting) {

                                entry.target.classList.add("visible");

                                observer.unobserve(entry.target);

                            }

                        });

                    },
                    {

                        threshold: 0.12,

                        rootMargin: "0px 0px -40px 0px"

                    }
                );


            fadeElements.forEach(function (element) {

                fadeObserver.observe(element);

            });

        } else {

            fadeElements.forEach(function (element) {

                element.classList.add("visible");

            });

        }

    }



    /* ========================================================
       07. BACK TO TOP
    ======================================================== */

    const backToTop =
        document.getElementById("backToTop");


    if (backToTop) {

        function updateBackToTop() {

            if (window.scrollY > 400) {

                backToTop.classList.add("show");

            } else {

                backToTop.classList.remove("show");

            }

        }


        window.addEventListener(
            "scroll",
            updateBackToTop,
            { passive: true }
        );


        updateBackToTop();


        backToTop.addEventListener("click", function (event) {

            event.preventDefault();


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        });

    }



    /* ========================================================
       08. MEMORY VERSE LANGUAGE SELECTOR
    ======================================================== */

    const languageButton =
        document.querySelector(".verse-language-btn");


    const languageSelector =
        document.querySelector(".language-selector");


    const languageSearch =
        document.getElementById("languageSearch");


    const languageList =
        document.getElementById("languageList");


    const verseText =
        document.getElementById("memoryVerseText");


    const verseReference =
        document.getElementById("memoryVerseReference");



    if (
        languageButton &&
        languageSelector &&
        languageList &&
        verseText &&
        verseReference
    ) {


        /* --------------------------------------------
           MEMORY VERSES
        -------------------------------------------- */

        const verses = {

            English: {
                text: "Trust in the Lord with all your heart and lean not on your own understanding.",
                reference: "— Proverbs 3:5"
            },

            Telugu: {
                text: "నీ పూర్ణహృదయముతో యెహోవాను నమ్ముకొనుము, నీ స్వబుద్ధిని ఆధారము చేసికొనకుము.",
                reference: "— సామెతలు 3:5"
            },

            Hindi: {
                text: "तू अपने सम्पूर्ण मन से यहोवा पर भरोसा रखना, और अपनी समझ का सहारा न लेना।",
                reference: "— नीतिवचन 3:5"
            },

            Tamil: {
                text: "உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிரு; உன் சுயபுத்தியின்மேல் சாயாதே.",
                reference: "— நீதிமொழிகள் 3:5"
            },

            Kannada: {
                text: "ನಿನ್ನ ಪೂರ್ಣ ಹೃದಯದಿಂದ ಕರ್ತನನ್ನು ನಂಬಿಕೊ; ನಿನ್ನ ಸ್ವಂತ ವಿವೇಕದ ಮೇಲೆ ಆಧಾರಪಡಬೇಡ.",
                reference: "— ಜ್ಞಾನೋಕ್ತಿಗಳು 3:5"
            },

            Malayalam: {
                text: "പൂർണ്ണഹൃദയത്തോടെ യഹോവയിൽ ആശ്രയിക്ക; സ്വന്തം വിവേകത്തിൽ ആശ്രയിക്കരുത്.",
                reference: "— സദൃശവാക്യങ്ങൾ 3:5"
            },

            Bengali: {
                text: "তোমার সমস্ত হৃদয় দিয়ে সদাপ্রভুর উপর নির্ভর কর এবং নিজের বুদ্ধির উপর নির্ভর করো না।",
                reference: "— হিতোপদেশ 3:5"
            },

            Marathi: {
                text: "तू आपल्या संपूर्ण अंतःकरणाने परमेश्वरावर भाव ठेव आणि स्वतःच्या बुद्धीवर अवलंबून राहू नकोस.",
                reference: "— नीतिसूत्रे 3:5"
            },

            Gujarati: {
                text: "તારા પૂરા હૃદયથી યહોવા પર ભરોસો રાખ અને પોતાની સમજ પર આધાર ન રાખ.",
                reference: "— નીતિવચનો 3:5"
            },

            Punjabi: {
                text: "ਆਪਣੇ ਪੂਰੇ ਦਿਲ ਨਾਲ ਯਹੋਵਾਹ ਉੱਤੇ ਭਰੋਸਾ ਰੱਖ ਅਤੇ ਆਪਣੀ ਸਮਝ ਉੱਤੇ ਨਿਰਭਰ ਨਾ ਹੋ।",
                reference: "— ਕਹਾਉਤਾਂ 3:5"
            },

            Spanish: {
                text: "Confía en el Señor con todo tu corazón y no te apoyes en tu propia prudencia.",
                reference: "— Proverbios 3:5"
            },

            French: {
                text: "Confie-toi en l'Éternel de tout ton cœur et ne t'appuie pas sur ta propre intelligence.",
                reference: "— Proverbes 3:5"
            },

            German: {
                text: "Vertraue auf den HERRN von ganzem Herzen und verlass dich nicht auf deinen Verstand.",
                reference: "— Sprüche 3:5"
            },

            Italian: {
                text: "Confida nel Signore con tutto il tuo cuore e non appoggiarti sul tuo discernimento.",
                reference: "— Proverbi 3:5"
            },

            Portuguese: {
                text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.",
                reference: "— Provérbios 3:5"
            },

            Dutch: {
                text: "Vertrouw op de HEER met heel je hart en steun niet op je eigen inzicht.",
                reference: "— Spreuken 3:5"
            },

            Greek: {
                text: "Ἔλπιζε ἐπὶ Κύριον ἐξ ὅλης τῆς καρδίας σου, καὶ μὴ ἐπαίρου ἐπὶ τῇ σῇ φρονήσει.",
                reference: "— Παροιμίαι 3:5"
            },

            Russian: {
                text: "Надейся на Господа всем сердцем твоим и не полагайся на разум твой.",
                reference: "— Притчи 3:5"
            },

            Ukrainian: {
                text: "Надійся на Господа всім своїм серцем і не покладайся на власний розум.",
                reference: "— Приповісті 3:5"
            },

            Polish: {
                text: "Zaufaj Panu z całego swego serca i nie polegaj na własnym rozumie.",
                reference: "— Przysłów 3:5"
            },

            Romanian: {
                text: "Încrede-te în Domnul din toată inima ta și nu te bizui pe înțelepciunea ta.",
                reference: "— Proverbele 3:5"
            },

            Chinese: {
                text: "你要专心仰赖耶和华，不可倚靠自己的聪明。",
                reference: "— 箴言 3:5"
            },

            Japanese: {
                text: "心をつくして主に信頼し、自分の悟りにたよってはならない。",
                reference: "— 箴言 3:5"
            },

            Korean: {
                text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라.",
                reference: "— 잠언 3:5"
            },

            Arabic: {
                text: "تَوَكَّلْ عَلَى الرَّبِّ بِكُلِّ قَلْبِكَ، وَعَلَى فَهْمِكَ لَا تَعْتَمِدْ.",
                reference: "— أمثال 3:5"
            },

            Hebrew: {
                text: "בְּטַח אֶל־יְהוָה בְּכָל־לִבֶּךָ וְאֶל־בִּינָתְךָ אַל־תִּשָּׁעֵן.",
                reference: "— משלי 3:5"
            },

            Turkish: {
                text: "Bütün yüreğinle RAB'be güven ve kendi anlayışına dayanma.",
                reference: "— Süleyman'ın Özdeyişleri 3:5"
            }

        };



        /* --------------------------------------------
           OPEN LANGUAGE SELECTOR
        -------------------------------------------- */

        function openLanguageSelector() {

            languageSelector.classList.add("active");


            languageButton.setAttribute(
                "aria-expanded",
                "true"
            );


            if (languageSearch) {

                setTimeout(function () {

                    languageSearch.focus();

                }, 100);

            }

        }



        /* --------------------------------------------
           CLOSE LANGUAGE SELECTOR
        -------------------------------------------- */

        function closeLanguageSelector() {

            languageSelector.classList.remove("active");


            languageButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }



        languageButton.setAttribute(
            "aria-expanded",
            "false"
        );



        /* --------------------------------------------
           LANGUAGE BUTTON
        -------------------------------------------- */

        languageButton.addEventListener("click", function (event) {

            event.preventDefault();

            event.stopPropagation();


            const isOpen =
                languageSelector.classList.contains("active");


            if (isOpen) {

                closeLanguageSelector();

            } else {

                openLanguageSelector();

            }

        });



        /* --------------------------------------------
           LANGUAGE SEARCH
        -------------------------------------------- */

        if (languageSearch) {

            languageSearch.addEventListener("input", function () {

                const searchValue =
                    languageSearch.value.toLowerCase().trim();


                const languageButtons =
                    languageList.querySelectorAll("button");


                languageButtons.forEach(function (button) {

                    const language =
                        button.textContent.toLowerCase();


                    button.style.display =
                        language.includes(searchValue) ? "" : "none";

                });

            });

        }



        /* --------------------------------------------
           LANGUAGE SELECTION
        -------------------------------------------- */

        languageList.addEventListener("click", function (event) {

            const button =
                event.target.closest("button");


            if (!button) {
                return;
            }


            const language =
                button.dataset.lang;


            if (!language || !verses[language]) {
                return;
            }


            languageList
                .querySelectorAll("button")
                .forEach(function (btn) {

                    btn.classList.remove("active");

                });


            button.classList.add("active");


            verseText.textContent =
                "“" + verses[language].text + "”";


            verseReference.textContent =
                verses[language].reference;


            closeLanguageSelector();


            if (languageSearch) {

                languageSearch.value = "";


                languageList
                    .querySelectorAll("button")
                    .forEach(function (btn) {

                        btn.style.display = "";

                    });

            }

        });



        /* --------------------------------------------
           CLICK OUTSIDE
        -------------------------------------------- */

        document.addEventListener("click", function (event) {

            if (
                !languageSelector.contains(event.target) &&
                !languageButton.contains(event.target)
            ) {

                closeLanguageSelector();

            }

        });



        /* --------------------------------------------
           ESCAPE KEY
        -------------------------------------------- */

        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape") {

                closeLanguageSelector();

            }

        });

    }



    /* ========================================================
       09. MOBILE-FRIENDLY BEHAVIOUR
    ======================================================== */

    /*
       Prevent accidental horizontal overflow.
       This does not replace responsive CSS.
    */

    document.documentElement.style.overflowX = "hidden";



    /* ========================================================
       10. INITIAL UI STATE
    ======================================================== */

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



    /* ========================================================
       SCRIPT READY
    ======================================================== */

    console.log(
        "Jeeva Nadi Ministries | Main JavaScript loaded successfully."
    );

});
