// =========================================================
// JEEVA NADI BOOKS
// CHECKOUT.JS
// FIREBASE MODULAR SDK
// =========================================================
//
// PAYMENT FLOW
// ---------------------------------------------------------
// 1. Customer signs in
// 2. Customer enters customer details
// 3. Customer enters delivery address
// 4. Customer pays using the displayed UPI QR
// 5. Customer enters UTR / Transaction ID
// 6. Customer may upload payment screenshot
// 7. Customer accepts confirmation
// 8. Firestore order is created
//
// IMPORTANT
// ---------------------------------------------------------
// Firebase Storage is currently disabled.
// Therefore payment screenshot is validated locally only.
//
// Customer UPI ID is NOT required by this checkout.
// UTR / Transaction ID IS required.
//
// =========================================================

"use strict";


// =========================================================
// FIREBASE IMPORTS
// =========================================================

import {
    auth,
    onAuthStateChanged,
    createOrder as createFirebaseOrder
} from "./firebase-config.js";


// =========================================================
// DOM HELPERS
// =========================================================

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    Array.from(
        document.querySelectorAll(selector)
    );


// =========================================================
// CHECKOUT STATE
// =========================================================

const state = {

    currentStep: 1,

    user: null,

    authReady: false,

    cart: [],

    subtotal: 0,

    delivery: 0,

    total: 0,

    submitting: false,

    paymentProtection: false

};


// =========================================================
// CART STORAGE KEYS
// =========================================================

const CART_KEYS = [

    "JeevaNadiCart",

    "jeevaNadiCart",

    "jeeva-nadi-cart",

    "booksCart",

    "cart"

];


// =========================================================
// DOM ELEMENTS
// =========================================================

const form =
    $("#checkout-form");

const message =
    $("#checkout-message");

const authTitle =
    $("#checkout-auth-title");

const authDescription =
    $("#checkout-auth-description");

const authIcon =
    $("#checkout-auth-icon");

const loginButton =
    $("#checkout-login-button");

const paymentItems =
    $("#checkout-payment-items");

const paymentItemCount =
    $("#payment-item-count");

const summaryItems =
    $("#checkout-summary-items");

const subtotalElement =
    $("#checkout-subtotal");

const deliveryElement =
    $("#checkout-delivery");

const totalElement =
    $("#checkout-total");

const paymentAmount =
    $("#checkout-payment-amount");

const qrImage =
    $("#checkout-upi-qr");

const qrContainer =
    $("#checkout-qr-container");

const qrError =
    $("#checkout-qr-error");

const placeOrderButton =
    $("#place-order");

const termsCheckbox =
    $("#checkout-terms");

const utrInput =
    $("#payment-utr");


// ---------------------------------------------------------
// OPTIONAL CUSTOMER UPI FIELD
// ---------------------------------------------------------
//
// The field may exist in HTML, but it is NOT required.
//
// Supported IDs:
// #payment-upi-id
// #checkout-upi-id
//
// ---------------------------------------------------------

const upiIdInput =
    $("#payment-upi-id") ||
    $("#checkout-upi-id");


// =========================================================
// SCREENSHOT
// =========================================================

const screenshotInput =
    $("#payment-screenshot");


// =========================================================
// OTHER ELEMENTS
// =========================================================

const loader =
    $("#checkout-loader");

const toast =
    $("#checkout-toast");

const successBackdrop =
    $("#checkout-success-backdrop");

const successModal =
    $("#checkout-success-modal");

const successOrderId =
    $("#checkout-order-id");

const successButton =
    $("#checkout-success-button");


// =========================================================
// CURRENCY
// =========================================================

function formatCurrency(value) {

    const amount =
        Number(value) || 0;

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(amount);

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =========================================================
// NORMALIZE PRICE
// =========================================================

function normalizePrice(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? Math.max(0, number)
        : 0;

}


// =========================================================
// NORMALIZE QUANTITY
// =========================================================

function normalizeQuantity(value) {

    const number =
        parseInt(value, 10);

    return Number.isFinite(number)
        ? Math.max(1, number)
        : 1;

}


// =========================================================
// GET PRODUCT IMAGE
// =========================================================

function getProductImage(item) {

    return String(

        item?.image ||

        item?.imageUrl ||

        item?.cover ||

        item?.coverImage ||

        item?.thumbnail ||

        ""

    );

}


// =========================================================
// NORMALIZE CART ITEM
// =========================================================

function normalizeCartItem(
    item,
    index
) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return null;

    }

    const price =
        normalizePrice(

            item.price ??
            item.salePrice ??
            item.amount ??
            0

        );

    const quantity =
        normalizeQuantity(

            item.quantity ??
            item.qty ??
            1

        );

    const id =
        String(

            item.id ??
            item.key ??
            item.productId ??
            `cart-item-${index}`

        );

    const name =
        String(

            item.name ??
            item.title ??
            item.product ??
            "Book"

        );

    return {

        ...item,

        id,

        key:
            item.key ?? id,

        name,

        product:
            item.product ??
            name,

        variant:
            item.variant ??
            "",

        image:
            getProductImage(item),

        price,

        quantity,

        lineTotal:
            price * quantity

    };

}


// =========================================================
// READ LOCAL STORAGE CART
// =========================================================

function readLocalStorageCart() {

    for (
        const key of CART_KEYS
    ) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                continue;
            }

            const parsed =
                JSON.parse(raw);

            if (
                Array.isArray(parsed)
            ) {

                return parsed;

            }

            if (
                parsed &&
                Array.isArray(parsed.items)
            ) {

                return parsed.items;

            }

        }

        catch (error) {

            console.warn(
                "Unable to read cart:",
                key,
                error
            );

        }

    }

    return [];

}


// =========================================================
// READ CART ENGINE
// =========================================================

function readCartEngine() {

    try {

        const cart =
            window.JeevaNadiCart;

        if (!cart) {
            return [];
        }

        if (
            typeof cart.getItems ===
            "function"
        ) {

            const items =
                cart.getItems();

            if (
                Array.isArray(items)
            ) {

                return items;

            }

        }

        if (
            Array.isArray(cart.items)
        ) {

            return cart.items;

        }

    }

    catch (error) {

        console.warn(
            "Unable to read cart engine:",
            error
        );

    }

    return [];

}


// =========================================================
// LOAD CART
// =========================================================

function loadCart() {

    let rawCart =
        readCartEngine();

    if (
        !rawCart.length
    ) {

        rawCart =
            readLocalStorageCart();

    }

    state.cart =
        rawCart
            .map(
                normalizeCartItem
            )
            .filter(Boolean);

    state.subtotal =
        state.cart.reduce(

            (
                total,
                item
            ) => {

                return (
                    total +
                    item.lineTotal
                );

            },

            0

        );

    state.delivery = 0;

    state.total =
        state.subtotal +
        state.delivery;

    renderCart();

    updateSummary();

    updatePlaceOrderButton();

}


// =========================================================
// RENDER CART
// =========================================================

function renderCart() {

    if (!paymentItems) {
        return;
    }

    if (
        state.cart.length === 0
    ) {

        paymentItems.innerHTML = `

            <div class="items-empty">

                <strong>
                    Your cart is empty.
                </strong>

                <p>
                    Please add a book before checkout.
                </p>

                <a
                    href="./books.html"
                    class="button secondary"
                >
                    Browse Books
                </a>

            </div>

        `;

        if (paymentItemCount) {

            paymentItemCount.textContent =
                "0 items";

        }

        return;

    }


    paymentItems.innerHTML =

        state.cart
            .map(
                (item) => {

                    const name =
                        escapeHTML(
                            item.name
                        );

                    const image =
                        escapeHTML(
                            item.image
                        );

                    return `

                        <article
                            class="payment-item"
                            data-cart-id="${escapeHTML(item.id)}"
                        >

                            <div
                                class="payment-item-visual"
                            >

                                ${
                                    image

                                    ? `

                                        <img
                                            src="${image}"
                                            alt="${name}"
                                            class="payment-item-image"
                                            loading="eager"
                                        >

                                    `

                                    : `

                                        <div
                                            class="
                                                payment-item-image
                                                payment-item-image-unavailable
                                            "
                                        >
                                            Book
                                        </div>

                                    `
                                }

                            </div>

                            <div
                                class="payment-item-info"
                            >

                                <strong>
                                    ${name}
                                </strong>

                                ${
                                    item.variant
                                    ? `
                                        <span>
                                            ${escapeHTML(item.variant)}
                                        </span>
                                      `
                                    : ""
                                }

                                <span>
                                    Quantity:
                                    ${item.quantity}
                                </span>

                            </div>

                            <div
                                class="payment-item-price"
                            >

                                ${formatCurrency(
                                    item.lineTotal
                                )}

                            </div>

                        </article>

                    `;

                }
            )
            .join("");


    const quantity =
        state.cart.reduce(

            (
                total,
                item
            ) => {

                return (
                    total +
                    item.quantity
                );

            },

            0

        );


    if (paymentItemCount) {

        paymentItemCount.textContent =

            `${quantity} ${
                quantity === 1
                    ? "item"
                    : "items"
            }`;

    }

}


// =========================================================
// UPDATE SUMMARY
// =========================================================

function updateSummary() {

    const quantity =
        state.cart.reduce(

            (
                total,
                item
            ) => {

                return (
                    total +
                    item.quantity
                );

            },

            0

        );


    if (summaryItems) {

        summaryItems.textContent =
            String(quantity);

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            formatCurrency(
                state.subtotal
            );

    }


    if (deliveryElement) {

        deliveryElement.textContent =
            state.delivery === 0
                ? "FREE"
                : formatCurrency(
                    state.delivery
                );

    }


    if (totalElement) {

        totalElement.textContent =
            formatCurrency(
                state.total
            );

    }


    if (paymentAmount) {

        paymentAmount.textContent =
            formatCurrency(
                state.total
            );

    }

}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(text) {

    if (!message) {
        return;
    }

    message.hidden = false;

    message.textContent =
        String(text || "");

    message.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


function hideMessage() {

    if (!message) {
        return;
    }

    message.hidden = true;

    message.textContent = "";

}


// =========================================================
// TOAST
// =========================================================

function showToast(text) {

    if (!toast) {

        console.log(text);

        return;

    }

    toast.textContent =
        String(text || "");

    toast.classList.add("show");

    clearTimeout(
        toast.__timer
    );

    toast.__timer =
        setTimeout(

            () => {

                toast.classList.remove(
                    "show"
                );

            },

            3500

        );

}


// =========================================================
// LOADER
// =========================================================

function setLoading(loading) {

    if (!loader) {
        return;
    }

    loader.hidden =
        !loading;

}


// =========================================================
// STEP VALIDATION
// =========================================================

function validateStep(step) {

    hideMessage();


    // =====================================================
    // STEP 1
    // =====================================================

    if (step === 1) {

        const name =
            $("#checkout-name");

        const phone =
            $("#checkout-phone");

        const email =
            $("#checkout-email");

        const nameValue =
            name?.value.trim() || "";

        const phoneValue =
            phone?.value.trim() || "";

        const emailValue =
            email?.value.trim() || "";


        if (
            nameValue.length < 2
        ) {

            showMessage(
                "Please enter your full name."
            );

            name?.focus();

            return false;

        }


        if (
            !/^\d{10}$/.test(
                phoneValue
            )
        ) {

            showMessage(
                "Please enter a valid 10-digit mobile number."
            );

            phone?.focus();

            return false;

        }


        if (
            emailValue &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(emailValue)
        ) {

            showMessage(
                "Please enter a valid email address."
            );

            email?.focus();

            return false;

        }


        return true;

    }


    // =====================================================
    // STEP 2
    // =====================================================

    if (step === 2) {

        const address =
            $("#checkout-address");

        const city =
            $("#checkout-city");

        const stateInput =
            $("#checkout-state");

        const pincode =
            $("#checkout-pincode");


        if (
            !address?.value.trim()
        ) {

            showMessage(
                "Please enter your delivery address."
            );

            address?.focus();

            return false;

        }


        if (
            !city?.value.trim()
        ) {

            showMessage(
                "Please enter your city."
            );

            city?.focus();

            return false;

        }


        if (
            !stateInput?.value.trim()
        ) {

            showMessage(
                "Please enter your state."
            );

            stateInput?.focus();

            return false;

        }


        if (
            !/^\d{6}$/.test(
                pincode?.value.trim() || ""
            )
        ) {

            showMessage(
                "Please enter a valid 6-digit PIN code."
            );

            pincode?.focus();

            return false;

        }


        return true;

    }


    // =====================================================
    // STEP 3 PAYMENT
    // =====================================================

    if (step === 3) {

        if (
            state.cart.length === 0
        ) {

            showMessage(
                "Your cart is empty."
            );

            return false;

        }


        const utr =
            utrInput?.value.trim() || "";


        // -------------------------------------------------
        // UTR IS REQUIRED
        // -------------------------------------------------

        if (!utr) {

            showMessage(
                "Please enter your UPI Transaction ID / UTR."
            );

            utrInput?.focus();

            return false;

        }


        if (
            utr.length < 4
        ) {

            showMessage(
                "Please enter a valid UPI Transaction ID / UTR."
            );

            utrInput?.focus();

            return false;

        }


        // -------------------------------------------------
        // TERMS
        // -------------------------------------------------

        if (
            termsCheckbox &&
            !termsCheckbox.checked
        ) {

            showMessage(
                "Please accept the terms and conditions."
            );

            termsCheckbox.focus();

            return false;

        }


        return true;

    }


    return false;

}


// =========================================================
// STEP NAVIGATION
// =========================================================

function setStep(step) {

    const target =
        Number(step);


    if (
        ![1, 2, 3].includes(target)
    ) {

        return;

    }


    if (
        target >
        state.currentStep + 1
    ) {

        return;

    }


    if (
        target < state.currentStep &&
        state.currentStep === 3 &&
        state.paymentProtection
    ) {

        const leave =
            window.confirm(
                "You are on the payment step. Do you want to go back?"
            );


        if (!leave) {
            return;
        }


        state.paymentProtection =
            false;

    }


    state.currentStep =
        target;


    $$(".checkout-step-panel")
        .forEach(

            (panel) => {

                const panelStep =
                    Number(
                        panel.dataset.stepPanel
                    );

                const active =
                    panelStep === target;

                panel.hidden =
                    !active;

                panel.classList.toggle(
                    "active",
                    active
                );

            }

        );


    $$(".progress-step")
        .forEach(

            (button) => {

                const buttonStep =
                    Number(
                        button.dataset.step
                    );

                button.classList.toggle(
                    "active",
                    buttonStep === target
                );

                button.classList.toggle(
                    "completed",
                    buttonStep < target
                );

                button.disabled =
                    buttonStep > target;

            }

        );


    if (
        target === 3
    ) {

        loadCart();

        state.paymentProtection =
            true;

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// =========================================================
// INITIAL STEP
// =========================================================

function setInitialStep() {

    state.currentStep = 1;


    $$(".checkout-step-panel")
        .forEach(

            (panel) => {

                panel.hidden =
                    Number(
                        panel.dataset.stepPanel
                    ) !== 1;

            }

        );


    $$(".progress-step")
        .forEach(

            (button) => {

                button.disabled =
                    Number(
                        button.dataset.step
                    ) !== 1;

                button.classList.toggle(
                    "active",
                    Number(
                        button.dataset.step
                    ) === 1
                );

                button.classList.remove(
                    "completed"
                );

            }

        );

}


// =========================================================
// STEP BUTTONS
// =========================================================

function setupStepButtons() {

    $$("[data-next-step]")
        .forEach(

            (button) => {

                button.addEventListener(

                    "click",

                    () => {

                        const nextStep =
                            Number(
                                button.dataset.nextStep
                            );


                        if (
                            !validateStep(
                                state.currentStep
                            )
                        ) {

                            return;

                        }


                        setStep(
                            nextStep
                        );

                    }

                );

            }

        );


    $$("[data-prev-step]")
        .forEach(

            (button) => {

                button.addEventListener(

                    "click",

                    () => {

                        setStep(

                            Number(
                                button.dataset.prevStep
                            )

                        );

                    }

                );

            }

        );


    $$(".progress-step")
        .forEach(

            (button) => {

                button.addEventListener(

                    "click",

                    () => {

                        if (
                            button.disabled
                        ) {

                            return;

                        }


                        const target =
                            Number(
                                button.dataset.step
                            );


                        if (
                            target <=
                            state.currentStep
                        ) {

                            setStep(
                                target
                            );

                        }

                    }

                );

            }

        );

}


// =========================================================
// AUTHENTICATION
// =========================================================

function startAuthentication() {

    if (
        !auth ||
        typeof onAuthStateChanged !==
        "function"
    ) {

        console.error(
            "Firebase authentication unavailable."
        );

        showMessage(
            "Authentication could not be initialized."
        );

        return;

    }


    onAuthStateChanged(

        auth,

        (user) => {

            state.user =
                user || null;

            state.authReady =
                true;


            if (!user) {

                if (authIcon) {

                    authIcon.textContent =
                        "!";

                }


                if (authTitle) {

                    authTitle.textContent =
                        "Sign in required";

                }


                if (authDescription) {

                    authDescription.textContent =
                        "Please sign in before placing your order.";

                }


                if (loginButton) {

                    loginButton.hidden =
                        false;

                }

            }

            else {

                if (authIcon) {

                    authIcon.textContent =
                        "✓";

                }


                if (authTitle) {

                    authTitle.textContent =
                        "Account verified";

                }


                if (authDescription) {

                    authDescription.textContent =

                        user.email ||

                        user.phoneNumber ||

                        "Signed in successfully.";

                }


                if (loginButton) {

                    loginButton.hidden =
                        true;

                }


                const email =
                    $("#checkout-email");


                if (
                    email &&
                    !email.value &&
                    user.email
                ) {

                    email.value =
                        user.email;

                }

            }


            updatePlaceOrderButton();

        }

    );

}


// =========================================================
// LOGIN BUTTON
// =========================================================

function setupLoginButton() {

    if (!loginButton) {
        return;
    }


    loginButton.addEventListener(

        "click",

        () => {

            window.location.href =
                "./account.html";

        }

    );

}


// =========================================================
// PAYMENT INPUT VALIDATION
// =========================================================

function setupPaymentValidation() {

    utrInput?.addEventListener(

        "input",

        () => {

            updatePlaceOrderButton();

        }

    );


    // Optional UPI field.
    // It does NOT control whether the order
    // button becomes enabled.

    upiIdInput?.addEventListener(

        "input",

        () => {

            updatePlaceOrderButton();

        }

    );


    termsCheckbox?.addEventListener(

        "change",

        () => {

            updatePlaceOrderButton();

        }

    );

}


// =========================================================
// PAYMENT SCREENSHOT
// =========================================================

function setupScreenshotInput() {

    if (!screenshotInput) {
        return;
    }


    screenshotInput.addEventListener(

        "change",

        () => {

            const file =
                screenshotInput.files?.[0];


            if (!file) {
                return;
            }


            const allowedTypes = [

                "image/jpeg",

                "image/png",

                "image/webp"

            ];


            const maxSize =
                5 * 1024 * 1024;


            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                showMessage(
                    "Please select a JPG, PNG or WEBP image."
                );

                screenshotInput.value =
                    "";

                return;

            }


            if (
                file.size > maxSize
            ) {

                showMessage(
                    "Payment screenshot must be 5 MB or smaller."
                );

                screenshotInput.value =
                    "";

                return;

            }


            showToast(
                "Payment screenshot selected."
            );

        }

    );

}


// =========================================================
// PLACE ORDER BUTTON STATE
// =========================================================

function updatePlaceOrderButton() {

    if (!placeOrderButton) {
        return;
    }


    const utr =
        utrInput?.value.trim() || "";


    const termsOK =
        termsCheckbox
            ? termsCheckbox.checked
            : true;


    const canPlaceOrder =

        state.authReady &&

        Boolean(state.user) &&

        state.cart.length > 0 &&

        utr.length >= 4 &&

        termsOK &&

        !state.submitting;


    placeOrderButton.disabled =
        !canPlaceOrder;

}


// =========================================================
// CUSTOMER DATA
// =========================================================

function getCustomerData() {

    return {

        name:
            $("#checkout-name")
                ?.value
                .trim() || "",

        phone:
            $("#checkout-phone")
                ?.value
                .trim() || "",

        email:
            $("#checkout-email")
                ?.value
                .trim() || ""

    };

}


// =========================================================
// DELIVERY DATA
// =========================================================

function getDeliveryData() {

    return {

        address:
            $("#checkout-address")
                ?.value
                .trim() || "",

        city:
            $("#checkout-city")
                ?.value
                .trim() || "",

        state:
            $("#checkout-state")
                ?.value
                .trim() || "",

        pincode:
            $("#checkout-pincode")
                ?.value
                .trim() || "",

        notes:
            $("#checkout-notes")
                ?.value
                .trim() || "",

        latitude:
            $("#checkout-latitude")
                ?.value || "",

        longitude:
            $("#checkout-longitude")
                ?.value || ""

    };

}


// =========================================================
// CREATE FIREBASE ORDER
// =========================================================

async function createOrder() {

    if (!state.user) {

        const error =
            new Error(
                "You must be signed in to place an order."
            );

        error.code =
            "AUTH_REQUIRED";

        throw error;

    }


    if (
        state.cart.length === 0
    ) {

        const error =
            new Error(
                "Your cart is empty."
            );

        error.code =
            "ORDER_ITEMS_REQUIRED";

        throw error;

    }


    const customer =
        getCustomerData();


    const delivery =
        getDeliveryData();


    const utr =
        utrInput?.value.trim() || "";


    // =====================================================
    // UTR REQUIRED
    // =====================================================

    if (!utr) {

        const error =
            new Error(
                "UPI transaction ID / UTR is required."
            );

        error.code =
            "UTR_REQUIRED";

        throw error;

    }


    // =====================================================
    // OPTIONAL CUSTOMER UPI ID
    // =====================================================
    //
    // If the field exists, send it.
    // If it doesn't exist, send an empty string.
    //
    // IMPORTANT:
    // firebase-config.js must NOT reject an empty
    // customer UPI ID if you don't want this field.
    //
    // =====================================================

    const upiId =
        upiIdInput?.value.trim() || "";


    // =====================================================
    // NORMALIZE ORDER ITEMS
    // =====================================================

    const orderItems =

        state.cart.map(

            (item) => {

                const quantity =
                    Math.max(

                        1,

                        Math.floor(

                            Number(
                                item.quantity
                            ) || 1

                        )

                    );


                const price =
                    Number(
                        item.price
                    ) || 0;


                return {

                    id:
                        String(
                            item.id || ""
                        ),

                    key:
                        String(
                            item.key ||
                            item.id ||
                            ""
                        ),

                    name:
                        String(
                            item.name ||
                            item.product ||
                            "Book"
                        ),

                    product:
                        String(
                            item.product ||
                            item.name ||
                            "Book"
                        ),

                    image:
                        String(
                            item.image ||
                            ""
                        ),

                    variant:
                        String(
                            item.variant ||
                            ""
                        ),

                    price,

                    quantity,

                    lineTotal:
                        price * quantity

                };

            }

        );


    // =====================================================
    // FIREBASE ORDER
    // =====================================================

    const result =
        await createFirebaseOrder({

            customer: {

                name:
                    customer.name,

                phone:
                    customer.phone,

                email:
                    customer.email

            },


            shippingAddress: {

                address:
                    delivery.address,

                city:
                    delivery.city,

                state:
                    delivery.state,

                pincode:
                    delivery.pincode

            },


            items:
                orderItems,


            pricing: {

                subtotal:
                    state.subtotal,

                delivery:
                    state.delivery,

                packaging:
                    0,

                total:
                    state.total

            },


            payment: {

                method:
                    "UPI",

                utr:
                    utr,

                // Optional.
                // Firebase must allow this to be empty.
                upiId:
                    upiId

            },


            notes:
                delivery.notes,


            location: {

                latitude:
                    delivery.latitude,

                longitude:
                    delivery.longitude

            }

        });


    if (
        !result ||
        !result.id
    ) {

        throw new Error(
            "Firebase did not return an order ID."
        );

    }


    return result.id;

}


// =========================================================
// HANDLE PLACE ORDER
// =========================================================

async function handlePlaceOrder(event) {

    event.preventDefault();


    if (
        state.submitting
    ) {

        return;

    }


    if (
        !state.authReady
    ) {

        showMessage(
            "Please wait while your account is being verified."
        );

        return;

    }


    if (
        !state.user
    ) {

        showMessage(
            "Please sign in before placing your order."
        );

        return;

    }


    loadCart();


    if (
        !validateStep(3)
    ) {

        return;

    }


    state.submitting =
        true;


    state.paymentProtection =
        false;


    updatePlaceOrderButton();

    hideMessage();

    setLoading(true);


    try {

        console.log(
            "Jeeva Nadi: creating order..."
        );


        const orderId =
            await createOrder();


        console.log(
            "Jeeva Nadi: order created:",
            orderId
        );


        clearCart();


        showSuccess(
            orderId
        );

    }


    catch (error) {

        console.error(
            "Jeeva Nadi: checkout order error:",
            error
        );


        state.paymentProtection =
            true;


        showMessage(
            getFriendlyFirebaseError(
                error
            )
        );

    }


    finally {

        state.submitting =
            false;


        setLoading(false);


        updatePlaceOrderButton();

    }

}


// =========================================================
// CLEAR CART
// =========================================================

function clearCart() {

    try {

        const cart =
            window.JeevaNadiCart;


        if (
            cart &&
            typeof cart.clear ===
            "function"
        ) {

            cart.clear();

        }

    }

    catch (error) {

        console.warn(
            "Unable to clear cart:",
            error
        );

    }


    for (
        const key of CART_KEYS
    ) {

        try {

            localStorage.removeItem(
                key
            );

        }

        catch (error) {

            console.warn(
                "Unable to clear cart key:",
                key,
                error
            );

        }

    }


    window.dispatchEvent(
        new CustomEvent(
            "cartUpdated"
        )
    );


    window.dispatchEvent(
        new CustomEvent(
            "jeevaNadiCartUpdated"
        )
    );

}


// =========================================================
// SUCCESS
// =========================================================

function showSuccess(orderId) {

    state.paymentProtection =
        false;


    if (successOrderId) {

        successOrderId.textContent =
            orderId;

    }


    if (successBackdrop) {

        successBackdrop.hidden =
            false;

        successBackdrop.classList.add(
            "show"
        );

    }


    if (successModal) {

        successModal.hidden =
            false;

        successModal.classList.add(
            "show"
        );

    }


    document.body.classList.add(
        "checkout-success-open"
    );

}


// =========================================================
// SUCCESS BUTTON
// =========================================================

function setupSuccessButton() {

    if (!successButton) {
        return;
    }


    successButton.addEventListener(

        "click",

        () => {

            window.location.href =
                "./books.html";

        }

    );

}


// =========================================================
// QR CODE
// =========================================================

function setupQR() {

    if (!qrImage) {
        return;
    }


    qrImage.addEventListener(

        "load",

        () => {

            if (qrError) {

                qrError.hidden =
                    true;

            }


            if (qrContainer) {

                qrContainer.classList.remove(
                    "qr-load-error"
                );

            }

        }

    );


    qrImage.addEventListener(

        "error",

        () => {

            if (qrError) {

                qrError.hidden =
                    false;

            }


            if (qrContainer) {

                qrContainer.classList.add(
                    "qr-load-error"
                );

            }

        }

    );

}


// =========================================================
// LOCATION
// =========================================================

function setupLocation() {

    const button =
        $("#checkout-get-location");

    const status =
        $("#checkout-location-status");

    const latitude =
        $("#checkout-latitude");

    const longitude =
        $("#checkout-longitude");


    if (!button) {
        return;
    }


    button.addEventListener(

        "click",

        () => {

            if (
                !navigator.geolocation
            ) {

                if (status) {

                    status.textContent =
                        "Location is not supported by this browser.";

                }

                return;

            }


            if (status) {

                status.textContent =
                    "Getting your location...";

            }


            button.disabled =
                true;


            navigator.geolocation.getCurrentPosition(

                (position) => {

                    if (latitude) {

                        latitude.value =
                            String(
                                position.coords.latitude
                            );

                    }


                    if (longitude) {

                        longitude.value =
                            String(
                                position.coords.longitude
                            );

                    }


                    if (status) {

                        status.textContent =
                            "Location captured successfully.";

                    }


                    button.disabled =
                        false;

                },


                (error) => {

                    console.warn(
                        "Location error:",
                        error
                    );


                    if (status) {

                        status.textContent =
                            "Unable to get location. You can continue without it.";

                    }


                    button.disabled =
                        false;

                },


                {

                    enableHighAccuracy:
                        true,

                    timeout:
                        10000,

                    maximumAge:
                        0

                }

            );

        }

    );

}


// =========================================================
// FORM
// =========================================================

function setupForm() {

    if (!form) {
        return;
    }


    form.addEventListener(

        "submit",

        handlePlaceOrder

    );

}


// =========================================================
// INPUT FORMATTING
// =========================================================

function setupInputFormatting() {

    const phone =
        $("#checkout-phone");


    phone?.addEventListener(

        "input",

        () => {

            phone.value =

                phone.value
                    .replace(/\D/g, "")
                    .slice(0, 10);

        }

    );


    const pincode =
        $("#checkout-pincode");


    pincode?.addEventListener(

        "input",

        () => {

            pincode.value =

                pincode.value
                    .replace(/\D/g, "")
                    .slice(0, 6);

        }

    );


    utrInput?.addEventListener(

        "input",

        () => {

            utrInput.value =
                utrInput.value
                    .trim()
                    .replace(/\s+/g, "");

        }

    );

}


// =========================================================
// CART EVENTS
// =========================================================

function setupCartListeners() {

    window.addEventListener(

        "cartUpdated",

        loadCart

    );


    window.addEventListener(

        "jeevaNadiCartUpdated",

        loadCart

    );


    window.addEventListener(

        "jeevaNadiCartReady",

        loadCart

    );

}


// =========================================================
// FIREBASE CHECK
// =========================================================

function checkFirebase() {

    console.log(
        "Jeeva Nadi Firebase:"
    );


    console.log(
        "Auth:",
        Boolean(auth)
    );


    console.log(
        "onAuthStateChanged:",
        typeof onAuthStateChanged
    );


    console.log(
        "createOrder:",
        typeof createFirebaseOrder
    );


    console.log(
        "Customer UPI field:",
        Boolean(upiIdInput)
    );


    console.log(
        "UTR field:",
        Boolean(utrInput)
    );


    if (
        typeof createFirebaseOrder !==
        "function"
    ) {

        console.error(
            "createOrder is not exported by firebase-config.js."
        );

    }

}


// =========================================================
// FIREBASE ERROR MESSAGE
// =========================================================

function getFriendlyFirebaseError(error) {

    console.error(
        "Jeeva Nadi Firebase error:",
        error
    );


    const code =
        error?.code || "";


    const text =
        String(
            error?.message || ""
        );


    if (
        code === "UTR_REQUIRED" ||
        text.includes(
            "UPI transaction ID"
        ) ||
        text.includes(
            "UPI Transaction ID"
        )
    ) {

        return (
            "Please enter your UPI Transaction ID / UTR."
        );

    }


    if (
        code === "AUTH_REQUIRED"
    ) {

        return (
            "Please sign in before placing your order."
        );

    }


    if (
        code === "ORDER_ITEMS_REQUIRED"
    ) {

        return (
            "Your cart is empty."
        );

    }


    if (
        code.includes(
            "permission-denied"
        ) ||
        text.includes(
            "Missing or insufficient permissions"
        )
    ) {

        return (
            "Firebase rejected the order because of Firestore permissions."
        );

    }


    if (
        code.includes(
            "unauthenticated"
        )
    ) {

        return (
            "Your login session has expired. Please sign in again."
        );

    }


    if (
        code.includes(
            "network"
        )
    ) {

        return (
            "A network error occurred. Please check your internet connection."
        );

    }


    if (
        text.includes(
            "Customer UPI ID is required"
        )
    ) {

        return (
            "Your Firebase configuration is still requiring a Customer UPI ID. Remove that requirement from firebase-config.js, because this checkout uses UTR as the payment reference."
        );

    }


    return (
        "Something went wrong while placing your order. Please try again."
    );

}


// =========================================================
// INITIALIZE
// =========================================================

function initializeCheckout() {

    console.log(
        "Jeeva Nadi Books Checkout initialized."
    );


    checkFirebase();


    setInitialStep();


    setupStepButtons();


    setupLoginButton();


    setupPaymentValidation();


    setupScreenshotInput();


    setupQR();


    setupLocation();


    setupSuccessButton();


    setupForm();


    setupInputFormatting();


    setupCartListeners();


    startAuthentication();


    loadCart();

}


// =========================================================
// START
// =========================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(

        "DOMContentLoaded",

        initializeCheckout,

        {
            once: true
        }

    );

}

else {

    initializeCheckout();

}