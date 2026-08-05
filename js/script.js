/* =====================================================
   JEEVA NADI MINISTRIES
   SERMON PAGE JAVASCRIPT
===================================================== */

// ===============================
// SERMON SEARCH FUNCTION
// ===============================

const searchBox = document.getElementById("sermonSearch");
const sermonCards = document.querySelectorAll(".sermon-card");


if (searchBox) {

    searchBox.addEventListener("keyup", function () {


        const searchValue =
        searchBox.value.toLowerCase();


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
// =======================
// PAYMENT & REGISTRATION SYSTEM
// =======================


// =======================
// BUTTONS / ELEMENTS
// =======================

const payButton = document.getElementById("payButton");

const paymentBox = document.getElementById("paymentBox");

const continueToVerification = document.getElementById("continueToVerification");

const paymentVerification = document.getElementById("paymentVerification");

const continueButton = document.getElementById("continueButton");

const registrationFeeDisplay = document.getElementById("registrationFee");

const amountPayableDisplay = document.getElementById("amountPayable");

const cohortSelect = document.getElementById("cohortSelect");


// =======================
// REGISTRATION DATA STORAGE
// =======================

let registrationData = {};

// =======================
// COHORT FEE DISPLAY
// =======================
// =======================
// COHORT FEE DISPLAY
// =======================

if (cohortSelect) {

    cohortSelect.addEventListener("change", function () {

        const selectedOption = this.options[this.selectedIndex];

        const fee = selectedOption.dataset.fee;


        if (fee) {

            registrationFeeDisplay.textContent = "₹" + fee;

            if (amountPayableDisplay) {
                amountPayableDisplay.textContent = "₹" + fee;
            }

            localStorage.setItem("quizFee", fee);

        }

        else {

            registrationFeeDisplay.textContent = "₹0";

            if (amountPayableDisplay) {
                amountPayableDisplay.textContent = "₹0";
            }

            localStorage.removeItem("quizFee");

        }

    });

}
// =======================
// OPEN PAYMENT SECTION
// =======================


if(payButton){


payButton.addEventListener("click",function(){


console.log("Pay Button Clicked");



const phone =
document.getElementById("phone")?.value.trim() || "";



registrationData = {


fullName:
document.getElementById("fullName")?.value.trim() || "",


age:
document.getElementById("age")?.value.trim() || "",


phone:phone,


email:
document.getElementById("email")?.value.trim() || "",


location:
document.getElementById("location")?.value.trim() || "",


church:
document.getElementById("church")?.value.trim() || "",


studentClass:
document.getElementById("cohortSelect")?.value.trim() || "",



    fee: Number(
        localStorage.getItem("quizFee") || 0
    )

};


console.log(
    "Registration Data:",
    registrationData
);




// Validation


if(registrationData.fullName===""){

alert("Please enter Full Name");
return;

}



if(registrationData.age===""){

alert("Please enter Age");
return;

}



if(phone===""){

alert("Please enter Phone Number");
return;

}



if(!/^[0-9]{10}$/.test(phone)){


alert("Enter valid 10 digit mobile number");

return;

}



if(registrationData.location===""){

alert("Please enter Location");

return;

}



if(registrationData.church===""){

alert("Please enter Church Name");

return;

}



if(registrationData.studentClass===""){


alert("Please select Cohort");

return;

}






// SAVE DATA


localStorage.setItem(

"registrationData",

JSON.stringify(registrationData)

);



console.log(

"Saved Data:",

localStorage.getItem("registrationData")

);






// Show QR Payment Box


if(paymentBox){


paymentBox.style.display="block";


paymentBox.scrollIntoView({

behavior:"smooth"

});


}



if(verifyAmount){


verifyAmount.textContent =
"₹"+registrationData.fee;


}



});


}







// =======================
// OPEN UTR VERIFICATION
// =======================


if(continueToVerification){


continueToVerification.addEventListener("click",function(){



console.log(
"Payment Completed Button Clicked"
);



if(paymentVerification){


paymentVerification.style.display="block";


paymentVerification.scrollIntoView({

behavior:"smooth"

});


}



});


}








// =======================
// FINAL PAYMENT CONFIRM
// =======================


if(continueButton){


continueButton.addEventListener("click",function(){



console.log(
"Confirm Button Clicked"
);



const savedData =
localStorage.getItem("registrationData");



console.log(
"Saved Registration:",
savedData
);





if(!savedData){


alert(
"Please complete registration details first."
);


return;


}





let data =
JSON.parse(savedData);






const gmail =
document.getElementById("email")?.value.trim() || "";



const utr =
document.getElementById("utr")?.value.trim() || "";



const confirm =
document.getElementById("confirmPayment")?.checked || false;





if(!/^[0-9]{12}$/.test(utr)){


alert(
"Please enter valid 12 digit UTR Number"
);


return;


}





if(!confirm){


alert(
"Please confirm payment"
);


return;


}







// FIREBASE SAVE


db.collection("participants")
.add({


Name:data.fullName,

Age:data.age,

Phone:data.phone,

Email:gmail,

Location:data.location,

Church:data.church,

Group:data.studentClass,

Fee:data.fee,

UTR:utr,

PaymentStatus:"Completed"


})



.then(function(){


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



.catch(function(error){


console.error(
"Firestore Error:",
error
);


alert(
"Registration Failed"
);


});




});


}





// ==========================================
// QUIZ POPUP
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const popup = document.getElementById("quizPopup");
    const closeBtn = document.getElementById("closeQuiz");

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

}); // <-- DOMContentLoaded ends here


// ================= COUNTDOWN =================

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

if (daysElement && hoursElement && minutesElement && secondsElement) {

    const eventDate = new Date("August 15, 2026 09:00:00").getTime();

    const timer = setInterval(function () {

        const now = new Date().getTime();
        const distance = eventDate - now;

        if (distance < 0) {

            clearInterval(timer);

            daysElement.innerHTML = "00";
            hoursElement.innerHTML = "00";
            minutesElement.innerHTML = "00";
            secondsElement.innerHTML = "00";

            return;
        }

        daysElement.innerHTML = Math.floor(distance / (1000 * 60 * 60 * 24));

        hoursElement.innerHTML = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        minutesElement.innerHTML = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
        );

        secondsElement.innerHTML = Math.floor(
            (distance % (1000 * 60)) / 1000
        );

    }, 1000);
}


// ================= MOBILE MENU =================

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector("header nav ul");

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("show");
    });

}
