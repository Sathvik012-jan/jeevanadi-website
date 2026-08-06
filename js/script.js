/* =====================================================
   JEEVA NADI MINISTRIES
   MAIN JAVASCRIPT FILE
   -----------------------------------
   1. Sermon Search
   2. Registration & Payment
   3. Firebase Registration
   4. Quiz Popup
   5. Countdown Timer
   6. Mobile Navigation
===================================================== */


/* =====================================================
   SERMON SEARCH
===================================================== */

const searchBox = document.getElementById("sermonSearch");
const sermonCards = document.querySelectorAll(".sermon-card");

if (searchBox) {

    searchBox.addEventListener("keyup", function () {

        const searchValue = searchBox.value.toLowerCase();

        sermonCards.forEach(card => {

            const title =
                card.querySelector("h3")?.textContent.toLowerCase() || "";

            const speaker =
                card.querySelector(".speaker")?.textContent.toLowerCase() || "";

            if (
                title.includes(searchValue) ||
                speaker.includes(searchValue)
            ) {
                card.style.display = "block";
            }
            else {
                card.style.display = "none";
            }

        });

    });

}


/* =====================================================
   REGISTRATION & PAYMENT
===================================================== */

const payButton = document.getElementById("payButton");
const paymentBox = document.getElementById("paymentBox");
const continueToVerification = document.getElementById("continueToVerification");
const paymentVerification = document.getElementById("paymentVerification");
const continueButton = document.getElementById("continueButton");

const cohortSelect = document.getElementById("cohortSelect");
const registrationFeeDisplay = document.getElementById("registrationFee");
const amountPayableDisplay = document.getElementById("amountPayable");
const verifyAmount = document.getElementById("amountPayable");

let registrationData = {};


/* =====================================================
   COHORT / FEE DISPLAY
===================================================== */

if (cohortSelect) {

    cohortSelect.addEventListener("change", function () {

        const fee = this.value;

        if (fee !== "") {

            registrationFeeDisplay.textContent = "₹" + fee;
            amountPayableDisplay.textContent = "₹" + fee;

        }

        else {

            registrationFeeDisplay.textContent = "₹0";
            amountPayableDisplay.textContent = "₹0";

        }

    });

}


/* =====================================================
   OPEN PAYMENT SECTION
===================================================== */

if (payButton) {

    payButton.addEventListener("click", function () {

        console.log("Pay Button Clicked");

        const phone =
            document.getElementById("phone")?.value.trim() || "";

        registrationData = {

            fullName:
                document.getElementById("fullName")?.value.trim() || "",

            age:
                document.getElementById("age")?.value.trim() || "",

            phone: phone,

            email:
                document.getElementById("email")?.value.trim() || "",

            location:
                document.getElementById("location")?.value.trim() || "",

            church:
                document.getElementById("church")?.value.trim() || "",

            studentClass:
                document.getElementById("cohortSelect")?.value.trim() || "",

            fee:
                Number(
                    document.getElementById("cohortSelect")?.value || 0
                )

        };

        console.log("Registration Data:", registrationData);


        /* -----------------------------
           VALIDATION
        ------------------------------ */

        if (registrationData.fullName === "") {

            alert("Please enter Full Name");
            return;

        }

        if (registrationData.age === "") {

            alert("Please enter Age");
            return;

        }

        if (phone === "") {

            alert("Please enter Phone Number");
            return;

        }

        if (!/^[0-9]{10}$/.test(phone)) {

            alert("Please enter a valid 10-digit mobile number.");
            return;

        }

        if (registrationData.location === "") {

            alert("Please enter Location");
            return;

        }

        if (registrationData.church === "") {

            alert("Please enter Church Name");
            return;

        }

        if (registrationData.studentClass === "") {

            alert("Please select a Group");
            return;

        }


        /* -----------------------------
           SAVE TO LOCAL STORAGE
        ------------------------------ */

        localStorage.setItem(
            "registrationData",
            JSON.stringify(registrationData)
        );

        console.log(
            "Saved Registration:",
            localStorage.getItem("registrationData")
        );


        /* -----------------------------
           SHOW PAYMENT QR
        ------------------------------ */

        if (paymentBox) {

            paymentBox.style.display = "block";

            paymentBox.scrollIntoView({
                behavior: "smooth"
            });

        }

        if (verifyAmount) {

            verifyAmount.textContent =
                "₹" + registrationData.fee;

        }

    });

}


/* =====================================================
   PAYMENT VERIFICATION
===================================================== */

if (continueToVerification) {

    continueToVerification.addEventListener("click", function () {

        console.log("Proceeding to UTR Verification");

        if (paymentVerification) {

            paymentVerification.style.display = "block";

            paymentVerification.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}


/* =====================================================
   FINAL PAYMENT CONFIRMATION
===================================================== */

if (continueButton) {

    continueButton.addEventListener("click", function () {

        console.log("Confirm Button Clicked");

        const savedData =
            localStorage.getItem("registrationData");

        if (!savedData) {

            alert("Please complete registration first.");
            return;

        }

        const data = JSON.parse(savedData);

        const gmail =
            document.getElementById("email")?.value.trim() || "";

        const utr =
            document.getElementById("utr")?.value.trim() || "";

        const confirmPayment =
            document.getElementById("confirmPayment")?.checked || false;


        /* -----------------------------
           VALIDATION
        ------------------------------ */

        if (!/^[0-9]{12}$/.test(utr)) {

            alert("Please enter a valid 12-digit UTR Number.");
            return;

        }

        if (!confirmPayment) {

            alert("Please confirm that the payment has been completed.");
            return;

        }


        /* -----------------------------
           SAVE TO FIRESTORE
        ------------------------------ */

        db.collection("participants")

            .add({

                Name: data.fullName,
                Age: data.age,
                Phone: data.phone,
                Email: gmail,
                Location: data.location,
                Church: data.church,
                Group: data.studentClass,
                Fee: data.fee,
                UTR: utr,
                PaymentStatus: "Completed"

            })

            .then(function () {

                console.log("Registration Saved Successfully");

                alert(
                    "🎉 Registration Completed Successfully!\n\nThank you for registering for the Bible Quiz."
                );

                localStorage.removeItem("registrationData");

                window.location.href =
                    "registration-success.html";

            })

            .catch(function (error) {

                console.error("Firestore Error:", error);

                alert(
                    "Registration Failed.\nPlease try again."
                );

            });

    });

}


/* =====================================================
   BIBLE QUIZ POPUP
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const popup =
        document.getElementById("quizPopup");

    const closeBtn =
        document.getElementById("closeQuiz");


    if (popup) {

        setTimeout(function () {

            popup.classList.add("show");

        }, 2000);

    }


    if (closeBtn) {

        closeBtn.addEventListener("click", function () {

            popup.classList.remove("show");

        });

    }

});



/* =====================================================
   COUNTDOWN TIMER
===================================================== */

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

if (
    daysElement &&
    hoursElement &&
    minutesElement &&
    secondsElement
) {

    const eventDate =
        new Date("August 15, 2026 09:00:00").getTime();

    const timer = setInterval(function () {

        const now = new Date().getTime();

        const distance = eventDate - now;

        if (distance <= 0) {

            clearInterval(timer);

            daysElement.textContent = "00";
            hoursElement.textContent = "00";
            minutesElement.textContent = "00";
            secondsElement.textContent = "00";

            return;

        }

        const days =
            Math.floor(distance / (1000 * 60 * 60 * 24));

        const hours =
            Math.floor(
                (distance % (1000 * 60 * 60 * 24)) /
                (1000 * 60 * 60)
            );

        const minutes =
            Math.floor(
                (distance % (1000 * 60 * 60)) /
                (1000 * 60)
            );

        const seconds =
            Math.floor(
                (distance % (1000 * 60)) / 1000
            );

        daysElement.textContent = days;
        hoursElement.textContent = hours;
        minutesElement.textContent = minutes;
        secondsElement.textContent = seconds;

    }, 1000);

}


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuToggle =
    document.querySelector(".menu-toggle");

const navMenu =
    document.querySelector("header nav ul");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", function () {

        navMenu.classList.toggle("show");

    });

}


/* =====================================================
   SMOOTH SCROLL
===================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target =
            document.querySelector(this.getAttribute("href"));

        if (target) {

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


/* =====================================================
   FADE-IN ANIMATION
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const fadeElements =
        document.querySelectorAll(".fade-in");

    fadeElements.forEach(function (element, index) {

        setTimeout(function () {

            element.classList.add("visible");

        }, index * 150);

    });

});


/* =====================================================
   BACK TO TOP BUTTON (OPTIONAL)
===================================================== */

const backToTop =
    document.getElementById("backToTop");

if (backToTop) {

    window.addEventListener("scroll", function () {

        if (window.scrollY > 300) {

            backToTop.classList.add("show");

        }

        else {

            backToTop.classList.remove("show");

        }

    });

    backToTop.addEventListener("click", function () {

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    });

}


/* =====================================================
   END OF SCRIPT
===================================================== */

console.log("Jeeva Nadi Ministries Script Loaded Successfully.");
