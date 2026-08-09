/* =====================================================
   JEEVA NADI MINISTRIES
   MAIN WEBSITE JAVASCRIPT
===================================================== */


/* =====================================================
   SERMON SEARCH FUNCTION
===================================================== */

const searchBox =
    document.getElementById("sermonSearch");

const sermonCards =
    document.querySelectorAll(".sermon-card");


if (searchBox) {

    searchBox.addEventListener("keyup", function () {

        const searchValue =
            searchBox.value.toLowerCase().trim();


        sermonCards.forEach(card => {

            const title =
                card.querySelector("h3")
                    ?.textContent
                    .toLowerCase() || "";


            const speaker =
                card.querySelector(".speaker")
                    ?.textContent
                    .toLowerCase() || "";


            if (
                title.includes(searchValue) ||
                speaker.includes(searchValue)
            ) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

}


/* =====================================================
   PAYMENT & REGISTRATION SYSTEM
===================================================== */


/* -------------------------------
   ELEMENTS
-------------------------------- */

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

const verifyAmount =
    document.getElementById("amountPayable");


/* -------------------------------
   REGISTRATION STORAGE
-------------------------------- */

let registrationData = {};


/* =====================================================
   COHORT FEE DISPLAY
===================================================== */

const cohortSelect =
    document.getElementById("cohortSelect");

const registrationFeeDisplay =
    document.getElementById("registrationFee");

const amountPayableDisplay =
    document.getElementById("amountPayable");


if (
    cohortSelect &&
    registrationFeeDisplay &&
    amountPayableDisplay
) {

    cohortSelect.addEventListener(
        "change",
        function () {

            const fee =
                this.value;


            if (fee !== "") {

                registrationFeeDisplay.textContent =
                    "₹" + fee;

                amountPayableDisplay.textContent =
                    "₹" + fee;

            } else {

                registrationFeeDisplay.textContent =
                    "₹0";

                amountPayableDisplay.textContent =
                    "₹0";

            }

        }
    );

}


/* =====================================================
   OPEN PAYMENT SECTION
===================================================== */

if (payButton) {

    payButton.addEventListener(
        "click",
        function () {

            console.log(
                "Pay Button Clicked"
            );


            const phone =
                document
                    .getElementById("phone")
                    ?.value
                    .trim() || "";


            /* -------------------------------
               COLLECT REGISTRATION DATA
            -------------------------------- */

            registrationData = {

                fullName:
                    document
                        .getElementById("fullName")
                        ?.value
                        .trim() || "",

                age:
                    document
                        .getElementById("age")
                        ?.value
                        .trim() || "",

                phone:
                    phone,

                email:
                    document
                        .getElementById("email")
                        ?.value
                        .trim() || "",

                location:
                    document
                        .getElementById("location")
                        ?.value
                        .trim() || "",

                church:
                    document
                        .getElementById("church")
                        ?.value
                        .trim() || "",

                studentClass:
                    document
                        .getElementById("cohortSelect")
                        ?.value
                        .trim() || "",

                fee:
                    Number(
                        document
                            .getElementById("cohortSelect")
                            ?.value || 0
                    )

            };


            console.log(
                "Registration Data:",
                registrationData
            );


            /* -------------------------------
               VALIDATION
            -------------------------------- */

            if (
                registrationData.fullName === ""
            ) {

                alert(
                    "Please enter Full Name"
                );

                return;

            }


            if (
                registrationData.age === ""
            ) {

                alert(
                    "Please enter Age"
                );

                return;

            }


            if (phone === "") {

                alert(
                    "Please enter Phone Number"
                );

                return;

            }


            if (
                !/^[0-9]{10}$/.test(phone)
            ) {

                alert(
                    "Enter valid 10 digit mobile number"
                );

                return;

            }


            if (
                registrationData.location === ""
            ) {

                alert(
                    "Please enter Location"
                );

                return;

            }


            if (
                registrationData.church === ""
            ) {

                alert(
                    "Please enter Church Name"
                );

                return;

            }


            if (
                registrationData.studentClass === ""
            ) {

                alert(
                    "Please select Cohort"
                );

                return;

            }


            /* -------------------------------
               SAVE DATA
            -------------------------------- */

            localStorage.setItem(
                "registrationData",
                JSON.stringify(registrationData)
            );


            console.log(
                "Saved Data:",
                localStorage.getItem(
                    "registrationData"
                )
            );


            /* -------------------------------
               SHOW PAYMENT BOX
            -------------------------------- */

            if (paymentBox) {

                paymentBox.style.display =
                    "block";

                paymentBox.scrollIntoView({
                    behavior: "smooth"
                });

            }


            /* -------------------------------
               SHOW PAYMENT AMOUNT
            -------------------------------- */

            if (verifyAmount) {

                verifyAmount.textContent =
                    "₹" + registrationData.fee;

            }

        }
    );

}


/* =====================================================
   OPEN UTR VERIFICATION
===================================================== */

if (continueToVerification) {

    continueToVerification.addEventListener(
        "click",
        function () {

            console.log(
                "Payment Completed Button Clicked"
            );


            if (paymentVerification) {

                paymentVerification.style.display =
                    "block";

                paymentVerification.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


/* =====================================================
   FINAL PAYMENT CONFIRMATION
===================================================== */

if (continueButton) {

    continueButton.addEventListener(
        "click",
        function () {

            console.log(
                "Confirm Button Clicked"
            );


            const savedData =
                localStorage.getItem(
                    "registrationData"
                );


            console.log(
                "Saved Registration:",
                savedData
            );


            if (!savedData) {

                alert(
                    "Please complete registration details first."
                );

                return;

            }


            const data =
                JSON.parse(savedData);


            const gmail =
                document
                    .getElementById("email")
                    ?.value
                    .trim() || "";


            const utr =
                document
                    .getElementById("utr")
                    ?.value
                    .trim() || "";


            const confirm =
                document
                    .getElementById("confirmPayment")
                    ?.checked || false;


            /* -------------------------------
               UTR VALIDATION
            -------------------------------- */

            if (
                !/^[0-9]{12}$/.test(utr)
            ) {

                alert(
                    "Please enter valid 12 digit UTR Number"
                );

                return;

            }


            /* -------------------------------
               PAYMENT CONFIRMATION
            -------------------------------- */

            if (!confirm) {

                alert(
                    "Please confirm payment"
                );

                return;

            }


            /* -------------------------------
               FIREBASE SAVE
            -------------------------------- */

            db.collection("participants")
                .add({

                    Name:
                        data.fullName,

                    Age:
                        data.age,

                    Phone:
                        data.phone,

                    Email:
                        gmail,

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
                        "Completed"

                })


                .then(function () {

                    console.log(
                        "Registration Saved Successfully"
                    );


                    alert(
                        "Registration Completed Successfully!"
                    );


                    localStorage.removeItem(
                        "registrationData"
                    );


                    window.location.href =
                        "registration-success.html";

                })


                .catch(function (error) {

                    console.error(
                        "Firestore Error:",
                        error
                    );


                    alert(
                        "Registration Failed"
                    );

                });

        }
    );

}


/* =====================================================
   QUIZ POPUP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const popup =
            document.getElementById(
                "quizPopup"
            );

        const closeBtn =
            document.getElementById(
                "closeQuiz"
            );


        /* -------------------------------
           OPEN POPUP
        -------------------------------- */

        if (popup) {

            setTimeout(function () {

                popup.classList.add(
                    "show"
                );

            }, 2000);

        }


        /* -------------------------------
           CLOSE POPUP
        -------------------------------- */

        if (closeBtn) {

            closeBtn.addEventListener(
                "click",
                function () {

                    popup.classList.remove(
                        "show"
                    );

                }
            );

        }

    }
);


/* =====================================================
   COUNTDOWN TIMER
===================================================== */

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

    const eventDate =
        new Date(
            "August 15, 2026 09:00:00"
        ).getTime();


    const timer =
        setInterval(function () {

            const now =
                new Date().getTime();


            const distance =
                eventDate - now;


            /* -------------------------------
               EVENT FINISHED
            -------------------------------- */

            if (distance < 0) {

                clearInterval(timer);


                daysElement.innerHTML =
                    "00";

                hoursElement.innerHTML =
                    "00";

                minutesElement.innerHTML =
                    "00";

                secondsElement.innerHTML =
                    "00";


                return;

            }


            /* -------------------------------
               DAYS
            -------------------------------- */

            daysElement.innerHTML =
                Math.floor(
                    distance /
                    (1000 * 60 * 60 * 24)
                );


            /* -------------------------------
               HOURS
            -------------------------------- */

            hoursElement.innerHTML =
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60 * 24)
                    ) /
                    (1000 * 60 * 60)
                );


            /* -------------------------------
               MINUTES
            -------------------------------- */

            minutesElement.innerHTML =
                Math.floor(
                    (
                        distance %
                        (1000 * 60 * 60)
                    ) /
                    (1000 * 60)
                );


            /* -------------------------------
               SECONDS
            -------------------------------- */

            secondsElement.innerHTML =
                Math.floor(
                    (
                        distance %
                        (1000 * 60)
                    ) /
                    1000
                );

        }, 1000);

}


/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle =
    document.querySelector(
        ".menu-toggle"
    );

const navMenu =
    document.querySelector(
        "header nav ul"
    );


if (menuToggle && navMenu) {

    menuToggle.addEventListener(
        "click",
        function () {

            navMenu.classList.toggle(
                "show"
            );


            /* Update accessibility state */

            const isOpen =
                navMenu.classList.contains(
                    "show"
                );


            menuToggle.setAttribute(
                "aria-expanded",
                isOpen
            );

        }
    );

}


/* =====================================================
   MEMORY VERSE — LANGUAGE SELECTOR
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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


        /* =================================================
           CHECK ELEMENTS
        ================================================= */

        if (
            !languageButton ||
            !languageSelector ||
            !languageList ||
            !verseText ||
            !verseReference
        ) {

            return;

        }


        /* =================================================
           SAVE ORIGINAL ENGLISH VERSE FROM HTML

           IMPORTANT:
           English is controlled by HTML.

           Therefore, when you change:

           memoryVerseText
           memoryVerseReference

           in HTML, you do NOT need to
           change JavaScript.
        ================================================= */

        const originalVerseText =
            verseText.textContent.trim();


        const originalVerseReference =
            verseReference.textContent.trim();


        /* =================================================
           OPEN / CLOSE LANGUAGE SELECTOR
        ================================================= */

        languageButton.addEventListener(
            "click",
            () => {

                languageSelector.classList.toggle(
                    "active"
                );


                const isOpen =
                    languageSelector.classList.contains(
                        "active"
                    );


                languageButton.setAttribute(
                    "aria-expanded",
                    isOpen
                );


                if (
                    isOpen &&
                    languageSearch
                ) {

                    languageSearch.focus();

                }

            }
        );


        /* =================================================
           LANGUAGE SEARCH
        ================================================= */

        if (languageSearch) {

            languageSearch.addEventListener(
                "input",
                () => {

                    const searchValue =
                        languageSearch.value
                            .toLowerCase()
                            .trim();


                    const languages =
                        languageList.querySelectorAll(
                            "button"
                        );


                    languages.forEach(
                        button => {

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


        /* =================================================
           LANGUAGE TRANSLATIONS

           Current verse:
           PROVERBS 3:5
        ================================================= */

      
const verses = {

    English: {
        text: "Trust in the Lord with all your heart and lean not on your own understanding.",
        reference: "— Proverbs 3:5"
    },

    Telugu: {
        text: "నీ పూర్ణహృదయముతో యెహోవాను నమ్ముకొనుము; నీ స్వబుద్ధిని ఆధారము చేసికొనకుము.",
        reference: "— సామెతలు 3:5"
    },

    Hindi: {
        text: "तू अपनी समझ का सहारा न लेना, वरन् सम्पूर्ण मन से यहोवा पर भरोसा रखना।",
        reference: "— नीतिवचन 3:5"
    },

    Tamil: {
        text: "உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிருந்து, உன் சுயபுத்தியின் மேல் சாயாதே.",
        reference: "— நீதிமொழிகள் 3:5"
    },

    Kannada: {
        text: "ನಿನ್ನ ಪೂರ್ಣ ಹೃದಯದಿಂದ ಯೆಹೋವನಲ್ಲಿ ಭರವಸವಿಡು; ನಿನ್ನ ಸ್ವಂತ ಬುದ್ಧಿಯ ಮೇಲೆ ಆಧಾರಪಡಬೇಡ.",
        reference: "— ಜ್ಞಾನೋಕ್ತಿಗಳು 3:5"
    },

    Malayalam: {
        text: "പൂർണ്ണഹൃദയത്തോടെ യഹോവയിൽ ആശ്രയിക്ക; സ്വന്തബുദ്ധിയിൽ ഊന്നരുത്.",
        reference: "— സദൃശവാക്യങ്ങൾ 3:5"
    },

    Bengali: {
        text: "তোমার সমস্ত হৃদয় দিয়ে সদাপ্রভুর উপর নির্ভর কর এবং নিজের বুদ্ধির উপর নির্ভর করো না।",
        reference: "— হিতোপদেশ 3:5"
    },

    Marathi: {
        text: "तू आपल्या संपूर्ण मनाने परमेश्वरावर विश्वास ठेव आणि स्वतःच्या बुद्धीवर अवलंबून राहू नकोस.",
        reference: "— नीतिसूत्रे 3:5"
    },

    Gujarati: {
        text: "તારા સંપૂર્ણ હૃદયથી યહોવા પર ભરોસો રાખ અને પોતાની સમજ પર આધાર રાખશો નહિ.",
        reference: "— નીતિવચનો 3:5"
    },

    Punjabi: {
        text: "ਆਪਣੇ ਸਾਰੇ ਦਿਲ ਨਾਲ ਯਹੋਵਾਹ ਉੱਤੇ ਭਰੋਸਾ ਰੱਖ ਅਤੇ ਆਪਣੀ ਸਮਝ ਉੱਤੇ ਆਸਰਾ ਨਾ ਰੱਖ।",
        reference: "— ਕਹਾਉਤਾਂ 3:5"
    },

    Spanish: {
        text: "Confía en el Señor con todo tu corazón y no te apoyes en tu propia prudencia.",
        reference: "— Proverbios 3:5"
    },

    French: {
        text: "Confie-toi en l'Éternel de tout ton cœur et ne t'appuie pas sur ta sagesse.",
        reference: "— Proverbes 3:5"
    },

    German: {
        text: "Vertraue auf den HERRN von ganzem Herzen und verlass dich nicht auf deinen Verstand.",
        reference: "— Sprüche 3:5"
    },

    Italian: {
        text: "Confida nel Signore con tutto il cuore e non ti appoggiare sul tuo discernimento.",
        reference: "— Proverbi 3:5"
    },

    Portuguese: {
        text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.",
        reference: "— Provérbios 3:5"
    },

    Dutch: {
        text: "Vertrouw op de HEER met heel je hart en steun niet op eigen inzicht.",
        reference: "— Spreuken 3:5"
    },

    Greek: {
        text: "Έλπιζε στον Κύριο με όλη σου την καρδιά και μη στηρίζεσαι στη δική σου σύνεση.",
        reference: "— Παροιμίες 3:5"
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
        text: "Zaufaj Panu z całego swojego serca i nie polegaj na własnym rozumie.",
        reference: "— Przysłów 3:5"
    },

    Romanian: {
        text: "Încrede-te în Domnul din toată inima ta și nu te bizui pe înțelepciunea ta.",
        reference: "— Proverbe 3:5"
    },

    Chinese: {
        text: "你要专心仰赖耶和华，不可倚靠自己的聪明。",
        reference: "— 箴言 3:5"
    },

    Japanese: {
        text: "心を尽くして主に信頼し、自分の悟りに頼ってはならない。",
        reference: "— 箴言 3:5"
    },

    Korean: {
        text: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라.",
        reference: "— 잠언 3:5"
    },

    Arabic: {
        text: "تَوَكَّلْ عَلَى الرَّبِّ بِكُلِّ قَلْبِكَ وَلاَ تَعْتَمِدْ عَلَى فَهْمِكَ.",
        reference: "— أمثال 3:5"
    },

    Hebrew: {
        text: "בְּטַח אֶל־יְהוָה בְּכָל־לִבֶּךָ וְאֶל־בִּינָתְךָ אַל־תִּשָּׁעֵן.",
        reference: "— משלי 3:5"
    },

    Turkish: {
        text: "Bütün yüreğinle RAB'be güven ve kendi aklına dayanma.",
        reference: "— Süleyman'ın Özdeyişleri 3:5"
    }

};


        /* =================================================
           LANGUAGE SELECTION
        ================================================= */

        languageList.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "button"
                    );


                if (!button) {
                    return;
                }


                const language =
                    button.dataset.lang;


                if (!language) {
                    return;
                }


                /* -------------------------------
                   REMOVE PREVIOUS SELECTION
                -------------------------------- */

                languageList
                    .querySelectorAll("button")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                /* -------------------------------
                   HIGHLIGHT SELECTED LANGUAGE
                -------------------------------- */

                button.classList.add(
                    "active"
                );


                /* =================================================
                   ENGLISH

                   Restore exactly what HTML contains.
                ================================================= */

                if (language === "English") {

                    verseText.textContent =
                        originalVerseText;


                    verseReference.textContent =
                        originalVerseReference;

                }


                /* =================================================
                   OTHER LANGUAGES
                ================================================= */

                else if (verses[language]) {

                    verseText.textContent =
                        `“${verses[language].text}”`;


                    verseReference.textContent =
                        verses[language].reference;

                }


                /* -------------------------------
                   CLOSE LANGUAGE PANEL
                -------------------------------- */

                languageSelector.classList.remove(
                    "active"
                );


                languageButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    }
);
