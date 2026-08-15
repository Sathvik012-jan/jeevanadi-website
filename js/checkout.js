// =========================================================
// JEEVA NADI BOOKS
// CHECKOUT.JS
// =========================================================
// COMPLETE CHECKOUT SYSTEM
//
// FLOW
// ---------------------------------------------------------
// 1. Firebase authentication
// 2. Customer details
// 3. Delivery details
// 4. Cart verification
// 5. UPI payment
// 6. UTR / Transaction ID
// 7. Optional payment screenshot validation
// 8. Firestore order creation
// 9. Cart clearing
// 10. Success popup
//
// IMPORTANT
// ---------------------------------------------------------
// Firebase Storage is NOT required.
// Payment screenshot is validated locally only.
//
// Customer UPI ID is OPTIONAL.
// UTR / Transaction ID is REQUIRED.
//
// =========================================================

"use strict";


// =========================================================
// FIREBASE
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
//
// We support all previously used names.
//
// If your books/cart JS uses one of these,
// checkout will automatically find it.
//
// =========================================================

const CART_KEYS = [

    "JeevaNadiCart",

    "jeevaNadiCart",

    "jeeva-nadi-cart",

    "booksCart",

    "cart",

    "JEEVA_NADI_CART",

    "jeeva_nadi_cart",

    "jeevanadi-cart",

    "jeevanadiCart",

    "jnCart",

    "jn-cart"

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

const screenshotInput =
    $("#payment-screenshot");

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
// OPTIONAL CUSTOMER UPI FIELD
// =========================================================

const upiIdInput =
    $("#payment-upi-id") ||
    $("#checkout-upi-id");


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
// PRICE NORMALIZATION
// =========================================================

function normalizePrice(value) {

    if (
        typeof value === "string"
    ) {

        value =
            value
                .replace(/[₹,\s]/g, "")
                .trim();

    }

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {

        return 0;

    }

    return Math.max(
        0,
        number
    );

}


// =========================================================
// QUANTITY NORMALIZATION
// =========================================================

function normalizeQuantity(value) {

    const number =
        parseInt(
            value,
            10
        );

    if (
        !Number.isFinite(number) ||
        number < 1
    ) {

        return 1;

    }

    return Math.max(
        1,
        number
    );

}


// =========================================================
// IMAGE
// =========================================================

function getProductImage(item) {

    return String(

        item?.image ||

        item?.imageUrl ||

        item?.imageURL ||

        item?.cover ||

        item?.coverImage ||

        item?.thumbnail ||

        item?.thumbnailUrl ||

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


    // -----------------------------------------------------
    // PRICE
    // -----------------------------------------------------

    const price =
        normalizePrice(

            item.price ??
            item.salePrice ??
            item.sellingPrice ??
            item.amount ??
            item.cost ??
            0

        );


    // -----------------------------------------------------
    // QUANTITY
    // -----------------------------------------------------

    const quantity =
        normalizeQuantity(

            item.quantity ??
            item.qty ??
            item.count ??
            1

        );


    // -----------------------------------------------------
    // ID
    // -----------------------------------------------------

    const id =
        String(

            item.id ??
            item.productId ??
            item.productID ??
            item.key ??
            item.sku ??
            `cart-item-${index}`

        );


    // -----------------------------------------------------
    // NAME
    // -----------------------------------------------------

    const name =
        String(

            item.name ??
            item.title ??
            item.productName ??
            item.product ??
            "Book"

        );


    // -----------------------------------------------------
    // VARIANT
    // -----------------------------------------------------

    const variant =
        String(

            item.variant ??
            item.edition ??
            item.format ??
            ""

        );


    // -----------------------------------------------------
    // IMAGE
    // -----------------------------------------------------

    const image =
        getProductImage(item);


    // -----------------------------------------------------
    // LINE TOTAL
    // -----------------------------------------------------

    const lineTotal =
        price * quantity;


    return {

        ...item,

        id,

        key:
            String(
                item.key ??
                id
            ),

        name,

        product:
            String(
                item.product ??
                name
            ),

        variant,

        image,

        price,

        quantity,

        lineTotal

    };

}


// =========================================================
// CHECK WHETHER OBJECT LOOKS LIKE A PRODUCT
// =========================================================

function looksLikeProduct(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return false;

    }


    const hasName =
        Boolean(

            item.name ||
            item.title ||
            item.product ||
            item.productName

        );


    const hasPrice =
        (

            item.price !== undefined ||

            item.salePrice !== undefined ||

            item.amount !== undefined ||

            item.sellingPrice !== undefined

        );


    return (
        hasName &&
        hasPrice
    );

}


// =========================================================
// EXTRACT CART ARRAY
// =========================================================

function extractCartArray(parsed) {

    if (
        Array.isArray(parsed)
    ) {

        return parsed;

    }


    if (
        parsed &&
        typeof parsed === "object"
    ) {

        const possibleArrays = [

            parsed.items,

            parsed.cart,

            parsed.products,

            parsed.productsList,

            parsed.data

        ];


        for (
            const array of possibleArrays
        ) {

            if (
                Array.isArray(array)
            ) {

                return array;

            }

        }

    }


    return [];

}


// =========================================================
// READ SPECIFIC STORAGE
// =========================================================

function readStorageCart(
    storage,
    storageName
) {

    if (!storage) {
        return [];
    }


    // -----------------------------------------------------
    // FIRST: KNOWN CART KEYS
    // -----------------------------------------------------

    for (
        const key of CART_KEYS
    ) {

        try {

            const raw =
                storage.getItem(key);

            if (!raw) {
                continue;
            }


            const parsed =
                JSON.parse(raw);


            const items =
                extractCartArray(parsed);


            if (
                items.length
            ) {

                console.log(
                    `[Checkout] Cart found in ${storageName}:`,
                    key,
                    items
                );

                return items;

            }

        }

        catch (error) {

            console.warn(
                `[Checkout] Could not read ${storageName} key:`,
                key,
                error
            );

        }

    }


    // -----------------------------------------------------
    // SECOND: AUTOMATIC CART DISCOVERY
    // -----------------------------------------------------
    //
    // This protects checkout if the cart key is different.
    //
    // We inspect stored JSON and look for an array
    // containing product-like objects.
    //
    // -----------------------------------------------------

    try {

        for (
            let index = 0;
            index < storage.length;
            index++
        ) {

            const key =
                storage.key(index);


            if (!key) {
                continue;
            }


            // Ignore obvious unrelated values.

            const lowerKey =
                key.toLowerCase();


            if (
                lowerKey.includes("firebase") ||
                lowerKey.includes("auth") ||
                lowerKey.includes("user") ||
                lowerKey.includes("settings") ||
                lowerKey.includes("theme") ||
                lowerKey.includes("language")
            ) {

                continue;

            }


            const raw =
                storage.getItem(key);


            if (!raw) {
                continue;
            }


            let parsed;

            try {

                parsed =
                    JSON.parse(raw);

            }

            catch {

                continue;

            }


            const items =
                extractCartArray(parsed);


            if (
                !items.length
            ) {

                continue;

            }


            const productItems =
                items.filter(
                    looksLikeProduct
                );


            if (
                productItems.length > 0
            ) {

                console.log(
                    `[Checkout] Automatically discovered cart in ${storageName}:`,
                    key,
                    productItems
                );

                return productItems;

            }

        }

    }

    catch (error) {

        console.warn(
            `[Checkout] Automatic ${storageName} scan failed:`,
            error
        );

    }


    return [];

}


// =========================================================
// READ CART ENGINE
// =========================================================

function readCartEngine() {

    const engines = [

        window.JeevaNadiCart,

        window.JeevaNadiCartEngine,

        window.JeevaNadiCartManager,

        window.CartManager,

        window.cartManager

    ];


    for (
        const cart of engines
    ) {

        if (!cart) {
            continue;
        }


        try {

            // -------------------------------------------------
            // getItems()
            // -------------------------------------------------

            if (
                typeof cart.getItems ===
                "function"
            ) {

                const items =
                    cart.getItems();


                if (
                    Array.isArray(items) &&
                    items.length
                ) {

                    console.log(
                        "[Checkout] Cart engine found through getItems():",
                        items
                    );

                    return items;

                }

            }


            // -------------------------------------------------
            // getCart()
            // -------------------------------------------------

            if (
                typeof cart.getCart ===
                "function"
            ) {

                const result =
                    cart.getCart();


                const items =
                    extractCartArray(
                        result
                    );


                if (
                    items.length
                ) {

                    console.log(
                        "[Checkout] Cart engine found through getCart():",
                        items
                    );

                    return items;

                }

            }


            // -------------------------------------------------
            // items
            // -------------------------------------------------

            if (
                Array.isArray(
                    cart.items
                ) &&
                cart.items.length
            ) {

                console.log(
                    "[Checkout] Cart engine found through .items:",
                    cart.items
                );

                return cart.items;

            }

        }

        catch (error) {

            console.warn(
                "[Checkout] Cart engine error:",
                error
            );

        }

    }


    return [];

}


// =========================================================
// READ COMPLETE CART
// =========================================================

function readCart() {

    // -------------------------------------------------------
    // 1. CART ENGINE
    // -------------------------------------------------------

    const engineCart =
        readCartEngine();


    if (
        engineCart.length
    ) {

        return engineCart;

    }


    // -------------------------------------------------------
    // 2. LOCAL STORAGE
    // -------------------------------------------------------

    const localCart =
        readStorageCart(
            window.localStorage,
            "localStorage"
        );


    if (
        localCart.length
    ) {

        return localCart;

    }


    // -------------------------------------------------------
    // 3. SESSION STORAGE
    // -------------------------------------------------------

    const sessionCart =
        readStorageCart(
            window.sessionStorage,
            "sessionStorage"
        );


    if (
        sessionCart.length
    ) {

        return sessionCart;

    }


    console.warn(
        "[Checkout] NO CART FOUND."
    );


    return [];

}


// =========================================================
// LOAD CART
// =========================================================

function loadCart() {

    console.log(
        "=========================================="
    );

    console.log(
        "[Checkout] Loading cart..."
    );


    const rawCart =
        readCart();


    state.cart =
        rawCart
            .map(
                normalizeCartItem
            )
            .filter(Boolean);


    // -------------------------------------------------------
    // CALCULATE SUBTOTAL
    // -------------------------------------------------------

    state.subtotal =
        state.cart.reduce(

            (
                total,
                item
            ) => {

                return (
                    total +
                    (
                        Number(item.price) || 0
                    ) *
                    (
                        Number(item.quantity) || 1
                    )
                );

            },

            0

        );


    // -------------------------------------------------------
    // DELIVERY
    // -------------------------------------------------------

    state.delivery = 0;


    // -------------------------------------------------------
    // TOTAL
    // -------------------------------------------------------

    state.total =
        state.subtotal +
        state.delivery;


    console.log(
        "[Checkout] Normalized cart:",
        state.cart
    );

    console.log(
        "[Checkout] Subtotal:",
        state.subtotal
    );

    console.log(
        "[Checkout] Total:",
        state.total
    );


    renderCart();

    updateSummary();

    updatePlaceOrderButton();


    console.log(
        "=========================================="
    );

}


// =========================================================
// RENDER CART
// =========================================================

function renderCart() {

    if (!paymentItems) {
        return;
    }


    // -------------------------------------------------------
    // EMPTY CART
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // CART ITEMS
    // -------------------------------------------------------

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
                                            ${escapeHTML(
                                                item.variant
                                            )}
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


    // -------------------------------------------------------
    // TOTAL QUANTITY
    // -------------------------------------------------------

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

        console.warn(
            text
        );

        return;

    }


    message.hidden =
        false;


    message.textContent =
        String(
            text || ""
        );


    message.scrollIntoView({

        behavior: "smooth",

        block: "nearest"

    });

}


function hideMessage() {

    if (!message) {
        return;
    }


    message.hidden =
        true;


    message.textContent =
        "";

}


// =========================================================
// TOAST
// =========================================================

function showToast(text) {

    if (!toast) {

        console.log(
            text
        );

        return;

    }


    toast.textContent =
        String(
            text || ""
        );


    toast.classList.add(
        "show"
    );


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
// VALIDATE STEP
// =========================================================

function validateStep(step) {

    hideMessage();


    // =====================================================
    // STEP 1
    // =====================================================

    if (
        step === 1
    ) {

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

    if (
        step === 2
    ) {

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
    // STEP 3
    // =====================================================

    if (
        step === 3
    ) {

        // Always reload immediately before payment validation.

        loadCart();


        if (
            state.cart.length === 0
        ) {

            showMessage(
                "Your cart is empty. Please add a book before checkout."
            );

            return false;

        }


        if (
            state.total <= 0
        ) {

            showMessage(
                "The order amount is ₹0.00. Please return to the Books page and add a valid product to your cart."
            );

            return false;

        }


        const utr =
            utrInput?.value.trim() || "";


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
        ![1, 2, 3].includes(
            target
        )
    ) {

        return;

    }


    if (
        target >
        state.currentStep + 1
    ) {

        return;

    }


    // -------------------------------------------------------
    // PAYMENT BACK PROTECTION
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // PANELS
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // PROGRESS
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // PAYMENT STEP
    // -------------------------------------------------------

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

    state.currentStep =
        1;


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

                const step =
                    Number(
                        button.dataset.step
                    );


                button.disabled =
                    step !== 1;


                button.classList.toggle(
                    "active",
                    step === 1
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

    // -------------------------------------------------------
    // NEXT
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // PREVIOUS
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // PROGRESS
    // -------------------------------------------------------

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
            "[Checkout] Firebase authentication unavailable."
        );


        state.authReady =
            true;


        showMessage(
            "Authentication could not be initialized."
        );


        updatePlaceOrderButton();


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

        },

        (error) => {

            console.error(
                "[Checkout] Auth state error:",
                error
            );


            state.authReady =
                true;


            state.user =
                null;


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
// PAYMENT VALIDATION
// =========================================================

function setupPaymentValidation() {

    utrInput?.addEventListener(

        "input",

        () => {

            updatePlaceOrderButton();

        }

    );


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
// SCREENSHOT VALIDATION
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
// PLACE ORDER BUTTON
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

        Boolean(
            state.user
        ) &&

        state.cart.length > 0 &&

        state.total > 0 &&

        utr.length >= 4 &&

        termsOK &&

        !state.submitting;


    placeOrderButton.disabled =
        !canPlaceOrder;


    // -------------------------------------------------------
    // OPTIONAL DEBUG
    // -------------------------------------------------------

    console.log(
        "[Checkout] Place order:",
        {
            authReady:
                state.authReady,

            signedIn:
                Boolean(state.user),

            cartItems:
                state.cart.length,

            total:
                state.total,

            utrLength:
                utr.length,

            termsOK,

            submitting:
                state.submitting,

            enabled:
                canPlaceOrder
        }
    );

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

    // -------------------------------------------------------
    // AUTH
    // -------------------------------------------------------

    if (!state.user) {

        const error =
            new Error(
                "You must be signed in to place an order."
            );


        error.code =
            "AUTH_REQUIRED";


        throw error;

    }


    // -------------------------------------------------------
    // CART
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // TOTAL
    // -------------------------------------------------------

    if (
        state.total <= 0
    ) {

        const error =
            new Error(
                "Order total must be greater than zero."
            );


        error.code =
            "INVALID_ORDER_TOTAL";


        throw error;

    }


    const customer =
        getCustomerData();


    const delivery =
        getDeliveryData();


    const utr =
        utrInput?.value.trim() || "";


    // -------------------------------------------------------
    // UTR
    // -------------------------------------------------------

    if (!utr) {

        const error =
            new Error(
                "UPI transaction ID / UTR is required."
            );


        error.code =
            "UTR_REQUIRED";


        throw error;

    }


    // -------------------------------------------------------
    // OPTIONAL CUSTOMER UPI ID
    // -------------------------------------------------------

    const upiId =
        upiIdInput?.value.trim() || "";


    // -------------------------------------------------------
    // ORDER ITEMS
    // -------------------------------------------------------

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
                    normalizePrice(
                        item.price
                    );


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


    // -------------------------------------------------------
    // VERIFY SERVER PAYLOAD TOTAL
    // -------------------------------------------------------

    const calculatedSubtotal =
        orderItems.reduce(

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


    if (
        calculatedSubtotal <= 0
    ) {

        const error =
            new Error(
                "The cart contains no valid priced products."
            );


        error.code =
            "INVALID_ORDER_TOTAL";


        throw error;

    }


    // -------------------------------------------------------
    // FIREBASE
    // -------------------------------------------------------

    console.log(
        "[Checkout] Sending order to Firebase..."
    );


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
                    calculatedSubtotal,

                delivery:
                    state.delivery,

                packaging:
                    0,

                total:
                    calculatedSubtotal +
                    state.delivery

            },


            payment: {

                method:
                    "UPI",

                utr:
                    utr,

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


    // -------------------------------------------------------
    // AUTH READY
    // -------------------------------------------------------

    if (
        !state.authReady
    ) {

        showMessage(
            "Please wait while your account is being verified."
        );


        return;

    }


    // -------------------------------------------------------
    // USER
    // -------------------------------------------------------

    if (
        !state.user
    ) {

        showMessage(
            "Please sign in before placing your order."
        );


        return;

    }


    // -------------------------------------------------------
    // RELOAD CART
    // -------------------------------------------------------

    loadCart();


    // -------------------------------------------------------
    // VALIDATE CUSTOMER
    // -------------------------------------------------------

    if (
        !validateStep(1)
    ) {

        setStep(1);

        return;

    }


    // -------------------------------------------------------
    // VALIDATE DELIVERY
    // -------------------------------------------------------

    if (
        !validateStep(2)
    ) {

        setStep(2);

        return;

    }


    // -------------------------------------------------------
    // VALIDATE PAYMENT
    // -------------------------------------------------------

    if (
        !validateStep(3)
    ) {

        return;

    }


    // -------------------------------------------------------
    // START SUBMISSION
    // -------------------------------------------------------

    state.submitting =
        true;


    state.paymentProtection =
        false;


    updatePlaceOrderButton();

    hideMessage();

    setLoading(true);


    try {

        console.log(
            "=========================================="
        );


        console.log(
            "[Checkout] Creating Firebase order..."
        );


        const orderId =
            await createOrder();


        console.log(
            "[Checkout] Firebase order created:",
            orderId
        );


        // ---------------------------------------------------
        // ONLY CLEAR CART AFTER SUCCESS
        // ---------------------------------------------------

        clearCart();


        // ---------------------------------------------------
        // SUCCESS
        // ---------------------------------------------------

        showSuccess(
            orderId
        );

    }

    catch (error) {

        console.error(
            "[Checkout] Order creation failed:",
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

    console.log(
        "[Checkout] Clearing cart..."
    );


    // -------------------------------------------------------
    // CART ENGINE
    // -------------------------------------------------------

    const engines = [

        window.JeevaNadiCart,

        window.JeevaNadiCartEngine,

        window.JeevaNadiCartManager,

        window.CartManager,

        window.cartManager

    ];


    for (
        const cart of engines
    ) {

        if (!cart) {
            continue;
        }


        try {

            if (
                typeof cart.clear ===
                "function"
            ) {

                cart.clear();

            }

        }

        catch (error) {

            console.warn(
                "[Checkout] Cart engine clear failed:",
                error
            );

        }

    }


    // -------------------------------------------------------
    // LOCAL STORAGE
    // -------------------------------------------------------

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
                "[Checkout] Could not remove localStorage key:",
                key,
                error
            );

        }

    }


    // -------------------------------------------------------
    // SESSION STORAGE
    // -------------------------------------------------------

    for (
        const key of CART_KEYS
    ) {

        try {

            sessionStorage.removeItem(
                key
            );

        }

        catch (error) {

            console.warn(
                "[Checkout] Could not remove sessionStorage key:",
                key,
                error
            );

        }

    }


    // -------------------------------------------------------
    // RESET STATE
    // -------------------------------------------------------

    state.cart = [];

    state.subtotal = 0;

    state.delivery = 0;

    state.total = 0;


    // -------------------------------------------------------
    // EVENTS
    // -------------------------------------------------------

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


    window.dispatchEvent(
        new CustomEvent(
            "jeevaNadiCartReady"
        )
    );


    console.log(
        "[Checkout] Cart cleared successfully."
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
            String(orderId);

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


    console.log(
        "[Checkout] SUCCESS:",
        orderId
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

            console.error(
                "[Checkout] UPI QR failed to load."
            );


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
                        "[Checkout] Location error:",
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

    // -------------------------------------------------------
    // PHONE
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // PINCODE
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // UTR
    // -------------------------------------------------------

    utrInput?.addEventListener(

        "input",

        () => {

            utrInput.value =

                utrInput.value
                    .replace(/\s+/g, "")
                    .slice(0, 100);


            updatePlaceOrderButton();

        }

    );

}


// =========================================================
// CART EVENTS
// =========================================================

function setupCartListeners() {

    window.addEventListener(

        "cartUpdated",

        () => {

            console.log(
                "[Checkout] cartUpdated event received."
            );


            loadCart();

        }

    );


    window.addEventListener(

        "jeevaNadiCartUpdated",

        () => {

            console.log(
                "[Checkout] jeevaNadiCartUpdated event received."
            );


            loadCart();

        }

    );


    window.addEventListener(

        "jeevaNadiCartReady",

        () => {

            console.log(
                "[Checkout] jeevaNadiCartReady event received."
            );


            loadCart();

        }

    );

}


// =========================================================
// FIREBASE CHECK
// =========================================================

function checkFirebase() {

    console.log(
        "=========================================="
    );


    console.log(
        "JEEVA NADI CHECKOUT FIREBASE CHECK"
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
        "UTR field:",
        Boolean(utrInput)
    );


    console.log(
        "Customer UPI field:",
        Boolean(upiIdInput)
    );


    console.log(
        "=========================================="
    );


    if (
        typeof createFirebaseOrder !==
        "function"
    ) {

        console.error(
            "[Checkout] createOrder is NOT exported by firebase-config.js."
        );

    }

}


// =========================================================
// FIREBASE ERROR MESSAGE
// =========================================================

function getFriendlyFirebaseError(error) {

    console.error(
        "[Checkout] Firebase error:",
        error
    );


    const code =
        String(
            error?.code || ""
        );


    const text =
        String(
            error?.message || ""
        );


    // -------------------------------------------------------
    // AUTH
    // -------------------------------------------------------

    if (
        code === "AUTH_REQUIRED"
    ) {

        return (
            "Please sign in before placing your order."
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


    // -------------------------------------------------------
    // CART
    // -------------------------------------------------------

    if (
        code === "ORDER_ITEMS_REQUIRED"
    ) {

        return (
            "Your cart is empty."
        );

    }


    if (
        code === "INVALID_ORDER_TOTAL"
    ) {

        return (
            "The order amount is invalid. Please return to the Books page and add the book again."
        );

    }


    // -------------------------------------------------------
    // UTR
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // FIRESTORE PERMISSION
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // CUSTOMER UPI
    // -------------------------------------------------------

    if (
        text.includes(
            "Customer UPI ID is required"
        )
    ) {

        return (
            "Firebase is still requiring a Customer UPI ID. Your checkout uses UTR, so remove that requirement from firebase-config.js."
        );

    }


    // -------------------------------------------------------
    // NETWORK
    // -------------------------------------------------------

    if (
        code.includes(
            "network"
        ) ||
        text.toLowerCase().includes(
            "network"
        )
    ) {

        return (
            "A network error occurred. Please check your internet connection and try again."
        );

    }


    // -------------------------------------------------------
    // FIREBASE UNAVAILABLE
    // -------------------------------------------------------

    if (
        code.includes(
            "failed-precondition"
        )
    ) {

        return (
            "Firebase could not complete the order because the database configuration is incomplete."
        );

    }


    // -------------------------------------------------------
    // DEFAULT
    // -------------------------------------------------------

    return (
        "Something went wrong while placing your order. Please check the browser console and try again."
    );

}


// =========================================================
// INITIALIZE
// =========================================================

function initializeCheckout() {

    console.log(
        "=========================================="
    );


    console.log(
        "JEEVA NADI BOOKS CHECKOUT INITIALIZED"
    );


    console.log(
        "=========================================="
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
    document.readyState ===
    "loading"
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
