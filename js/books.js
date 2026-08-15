/* ============================================================
   JEEVA NADI BOOKS
   PREMIUM STORE ENGINE
   ------------------------------------------------------------
   FILE:
   js/books.js

   RESPONSIBILITIES
   ------------------------------------------------------------
   • Product filtering
   • Product searching
   • Product sorting
   • Product image galleries
   • Bible-cover variants
   • Bible-cover pricing
   • Promise-card variants
   • Cart integration
   • Cart counter
   • Toast notifications

   BIBLE COVER HIERARCHY
   ------------------------------------------------------------

       LANGUAGE
           ↓
       SIZE
           ↓
       DESIGN
           ↓
       PRICE

   IMPORTANT
   ------------------------------------------------------------
   DESIGN SELECTOR NEVER SHOWS PRICE.

============================================================ */

"use strict";

import "./cart.js";


/* ============================================================
   STORE CONFIGURATION
============================================================ */

const STORE = Object.freeze({

    selectors: Object.freeze({

        grid:
            "#store-product-grid, #product-grid",

        search:
            "#store-search, #book-search",

        searchButton:
            "#store-search-button, #search-button",

        categories:
            "[data-store-category], .jn-books-category-tab",

        sort:
            "#store-sort, #sort-products",

        result:
            "#store-result-count, #result-count",

        empty:
            "#store-empty, #empty-state",

        cartCount:
            "[data-store-cart-count], [data-cart-count], #cart-count",

        toast:
            "#store-toast, #storeToast"

    }),

    classes: Object.freeze({

        active:
            "is-active",

        added:
            "is-added",

        hidden:
            "store-product-hidden"

    })

});


/* ============================================================
   STORE STATE
============================================================ */

const state = {

    category: "all",

    search: "",

    sort: "featured",

    initialized: false

};


let toastTimer = null;


/* ============================================================
   BIBLE COVER DATABASE
   ------------------------------------------------------------
   SINGLE SOURCE OF TRUTH
============================================================ */

const BIBLE_COVERS = Object.freeze([

    /* ========================================================
       ENGLISH — REGULAR
    ======================================================== */

    Object.freeze({

        id:
            "english-light-blue",

        language:
            "English",

        size:
            "Regular",

        design:
            "Light Blue Fabric",

        name:
            "Light Blue Fabric English Bible",

        price:
            200,

        image:
            "images/bc 3 english blue color.jpeg",

        description:
            "Light blue fabric English Bible cover with a clean and elegant appearance."

    }),


    Object.freeze({

        id:
            "english-floral",

        language:
            "English",

        size:
            "Regular",

        design:
            "Floral Fabric",

        name:
            "Floral Fabric English Bible",

        price:
            100,

        image:
            "images/bc 8 english.jpeg",

        description:
            "Floral fabric English Bible cover with beautiful decorative patterns."

    }),


    Object.freeze({

        id:
            "english-abstract",

        language:
            "English",

        size:
            "Regular",

        design:
            "Abstract Patterned",

        name:
            "Abstract Patterned English Bible",

        price:
            200,

        image:
            "images/english bc 4 design .jpeg",

        description:
            "Artistic abstract patterned English Bible cover with a colorful contemporary design."

    }),


    Object.freeze({

        id:
            "english-embroidered",

        language:
            "English",

        size:
            "Regular",

        design:
            "Colorful Embroidered",

        name:
            "Colorful Embroidered English Bible",

        price:
            250,

        image:
            "images/english bc 7 design .jpeg",

        description:
            "Colorful embroidered English Bible cover featuring decorative fabric work."

    }),


    /* ========================================================
       TELUGU — REGULAR
    ======================================================== */

    Object.freeze({

        id:
            "telugu-dark-brown",

        language:
            "Telugu",

        size:
            "Regular",

        design:
            "Dark Brown Leather",

        name:
            "Dark Brown Leather Telugu Bible",

        price:
            150,

        image:
            "images/bc 2.jpeg",

        description:
            "Dark brown leather Bible cover designed for regular-size Telugu Bibles with a classic and durable finish."

    }),


    Object.freeze({

        id:
            "telugu-maroon",

        language:
            "Telugu",

        size:
            "Regular",

        design:
            "Maroon Patterned",

        name:
            "Maroon Patterned Telugu Bible",

        price:
            250,

        image:
            "images/bc 5 telugu design.jpeg",

        description:
            "Beautiful maroon patterned Telugu Bible cover with decorative fabric detailing."

    }),


    Object.freeze({

        id:
            "telugu-paisley",

        language:
            "Telugu",

        size:
            "Regular",

        design:
            "Paisley Patterned",

        name:
            "Paisley Patterned Telugu Bible",

        price:
            500,

        image:
            "images/bc 6 telugu.jpeg",

        description:
            "Decorative paisley-patterned Telugu Bible cover with a distinctive traditional design."

    }),


    Object.freeze({

        id:
            "telugu-black-pouch",

        language:
            "Telugu",

        size:
            "Regular",

        design:
            "Black Leather Pouch",

        name:
            "Black Leather Telugu Bible Pouch",

        price:
            150,

        image:
            "images/bc 10 telugu.jpeg",

        description:
            "Black leather-style Telugu Bible pouch designed to provide practical protection for your Bible."

    }),


    Object.freeze({

        id:
            "telugu-red-yellow",

        language:
            "Telugu",

        size:
            "Regular",

        design:
            "Red-Yellow Patterned",

        name:
            "Red-Yellow Patterned Telugu Bible",

        price:
            500,

        image:
            "images/telugu bc 9.jpeg",

        description:
            "Decorative red and yellow patterned Telugu Bible cover with a traditional fabric design."

    }),


    /* ========================================================
       TELUGU — SMALL
    ======================================================== */

    Object.freeze({

        id:
            "telugu-black-small",

        language:
            "Telugu",

        size:
            "Small",

        design:
            "Black Leather",

        name:
            "Black Leather Telugu Bible",

        price:
            100,

        image:
            "images/bc 1 small.jpeg",

        description:
            "Small black leather Telugu Bible cover with a simple and elegant finish."

    })

]);


/* ============================================================
   DOM HELPERS
============================================================ */

function $(selector, root = document) {

    return root.querySelector(selector);

}


function $$(selector, root = document) {

    return Array.from(
        root.querySelectorAll(selector)
    );

}


/* ============================================================
   VALUE HELPERS
============================================================ */

function clean(value) {

    return String(value ?? "").trim();

}


function normalize(value) {

    return clean(value).toLowerCase();

}


function getNumber(value, fallback = 0) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


/* ============================================================
   PRODUCT GRID
============================================================ */

function getProductGrid() {

    return $(
        STORE.selectors.grid
    );

}


/* ============================================================
   PRODUCT CARDS
   ------------------------------------------------------------
   IMPORTANT:
   ALWAYS USE .jn-books-product-card FIRST.

   Do NOT depend on data-product-card because
   not every product currently has that attribute.
============================================================ */

function getProductCards() {

    const grid =
        getProductGrid();

    if (!grid) {
        return [];
    }


    const cards =
        $$(
            ".jn-books-product-card",
            grid
        );


    return cards;

}


/* ============================================================
   ORIGINAL PRODUCT ORDER
============================================================ */

function storeOriginalProductOrder() {

    const cards =
        getProductCards();


    cards.forEach(
        (card, index) => {

            if (
                !card.dataset.originalOrder
            ) {

                card.dataset.originalOrder =
                    String(index);

            }

        }
    );

}


/* ============================================================
   CARD DATA
============================================================ */

function getCardPrice(card) {

    return getNumber(
        card?.dataset?.price,
        0
    );

}


function getCardName(card) {

    if (!card) {
        return "";
    }


    return clean(

        card.dataset.name ||

        $(
            ".jn-books-product-title",
            card
        )?.textContent ||

        ""

    );

}


/* ============================================================
   SORTING
============================================================ */

function applySorting() {

    const grid =
        getProductGrid();


    if (!grid) {
        return;
    }


    const cards =
        getProductCards();


    if (!cards.length) {
        return;
    }


    storeOriginalProductOrder();


    const sorted =
        [...cards];


    switch (state.sort) {

        case "low":

            sorted.sort(
                (a, b) =>
                    getCardPrice(a) -
                    getCardPrice(b)
            );

            break;


        case "high":

            sorted.sort(
                (a, b) =>
                    getCardPrice(b) -
                    getCardPrice(a)
            );

            break;


        case "name":

            sorted.sort(
                (a, b) =>
                    getCardName(a).localeCompare(
                        getCardName(b),
                        undefined,
                        {
                            sensitivity: "base"
                        }
                    )
            );

            break;


        case "featured":

        default:

            sorted.sort(
                (a, b) =>
                    getNumber(
                        a.dataset.originalOrder
                    ) -
                    getNumber(
                        b.dataset.originalOrder
                    )
            );

            break;

    }


    sorted.forEach(
        card => {

            grid.appendChild(card);

        }
    );

}


/* ============================================================
   SEARCH
============================================================ */

function setupSearch() {

    const input =
        $(STORE.selectors.search);


    const button =
        $(STORE.selectors.searchButton);


    if (!input) {
        return;
    }


    function performSearch() {

        state.search =
            normalize(
                input.value
            );


        refreshProducts();

    }


    input.addEventListener(
        "input",
        performSearch
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Enter"
            ) {

                return;

            }


            event.preventDefault();

            performSearch();

        }
    );


    button?.addEventListener(
        "click",
        performSearch
    );

}


/* ============================================================
   CATEGORY FILTER
============================================================ */

function setupCategories() {

    const buttons =
        $$(STORE.selectors.categories);


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    state.category =
                        normalize(
                            button.dataset.storeCategory ||
                            button.dataset.category ||
                            "all"
                        ) || "all";


                    buttons.forEach(
                        item => {

                            const active =
                                item === button;


                            item.classList.toggle(
                                STORE.classes.active,
                                active
                            );


                            item.classList.toggle(
                                "active",
                                active
                            );


                            item.setAttribute(
                                "aria-selected",
                                String(active)
                            );

                        }
                    );


                    refreshProducts();

                }
            );

        }
    );

}


/* ============================================================
   SORT SELECT
============================================================ */

function setupSorting() {

    const select =
        $(STORE.selectors.sort);


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        () => {

            state.sort =
                select.value ||
                "featured";


            applySorting();

            refreshProducts();

        }
    );

}


/* ============================================================
   REFRESH PRODUCTS
============================================================ */

function refreshProducts() {

    const cards =
        getProductCards();


    let visible =
        0;


    cards.forEach(
        card => {

            const category =
                normalize(
                    card.dataset.category
                );


            const name =
                normalize(
                    card.dataset.name
                );


            const searchable =
                normalize(

                    [
                        card.dataset.search,

                        card.dataset.name,

                        card.textContent

                    ]
                        .filter(Boolean)
                        .join(" ")

                );


            const categoryMatch =
                state.category === "all" ||
                category === state.category;


            const searchMatch =
                !state.search ||
                name.includes(state.search) ||
                searchable.includes(
                    state.search
                );


            const shouldShow =
                categoryMatch &&
                searchMatch;


            card.hidden =
                !shouldShow;


            card.classList.toggle(
                STORE.classes.hidden,
                !shouldShow
            );


            if (shouldShow) {
                visible++;
            }

        }
    );


    updateResultText(
        visible,
        cards.length
    );


    updateEmptyState(
        visible
    );

}


/* ============================================================
   RESULT TEXT
============================================================ */

function updateResultText(
    visible,
    total
) {

    const result =
        $(STORE.selectors.result);


    if (!result) {
        return;
    }


    if (state.search) {

        result.textContent =
            `${visible} ${
                visible === 1
                    ? "product"
                    : "products"
            } found for "${state.search}"`;

        return;

    }


    if (
        state.category ===
        "all"
    ) {

        result.textContent =
            `Showing all ${total} products`;

        return;

    }


    result.textContent =
        `Showing ${visible} ${
            visible === 1
                ? "product"
                : "products"
        }`;

}


/* ============================================================
   EMPTY STATE
============================================================ */

function updateEmptyState(
    visible
) {

    const empty =
        $(STORE.selectors.empty);


    if (!empty) {
        return;
    }


    empty.hidden =
        visible !== 0;

}


/* ============================================================
   IMAGE FALLBACK
============================================================ */

function setImageSource(
    image,
    sources
) {

    if (!image) {
        return;
    }


    const list =
        Array.isArray(sources)
            ? sources
                .map(clean)
                .filter(Boolean)
            : [];


    if (!list.length) {
        return;
    }


    let index =
        0;


    function loadNext() {

        if (
            index >=
            list.length
        ) {

            return;

        }


        image.src =
            list[index];

    }


    image.onerror = () => {

        index++;

        loadNext();

    };


    loadNext();

}


/* ============================================================
   PRODUCT IMAGE GALLERY
   ------------------------------------------------------------
   Works for:

   • Songs Book
   • Telugu Bible
   • Any future product gallery

============================================================ */

function setupProductGalleries() {

    const cards =
        getProductCards();


    cards.forEach(
        card => {

            const image =
                $(
                    ".jn-books-product-image",
                    card
                );


            if (!image) {
                return;
            }


            const raw =
                image.dataset.images ||
                image.dataset.galleryImages;


            if (!raw) {

                hideGalleryControls(
                    card
                );

                return;

            }


            let images;


            try {

                images =
                    JSON.parse(raw);

            }

            catch (error) {

                console.error(
                    "Jeeva Nadi Books: Invalid gallery JSON.",
                    error,
                    card
                );


                hideGalleryControls(
                    card
                );

                return;

            }


            if (
                !Array.isArray(images) ||
                images.length <= 1
            ) {

                hideGalleryControls(
                    card
                );

                return;

            }


            const previous =
                $(
                    ".jn-books-gallery-button.left",
                    card
                );


            const next =
                $(
                    ".jn-books-gallery-button.right",
                    card
                );


            const dots =
                $(
                    ".jn-books-image-dots",
                    card
                );


            let index =
                getNumber(
                    image.dataset.index,
                    0
                );


            if (
                index < 0 ||
                index >= images.length
            ) {

                index = 0;

            }


            function render() {

                const source =
                    clean(
                        images[index]
                    );


                if (!source) {
                    return;
                }


                image.dataset.index =
                    String(index);


                image.src =
                    source;


                renderDots(
                    dots,
                    images.length,
                    index
                );

            }


            function move(
                direction
            ) {

                index =
                    (
                        index +
                        direction +
                        images.length
                    ) %
                    images.length;


                render();

            }


            previous?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    move(-1);

                }
            );


            next?.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    move(1);

                }
            );


            render();

        }
    );

}


/* ============================================================
   HIDE GALLERY CONTROLS
============================================================ */

function hideGalleryControls(
    card
) {

    $$(
        ".jn-books-gallery-button, " +
        ".jn-books-image-dots",
        card
    )
    .forEach(
        element => {

            element.hidden =
                true;

        }
    );

}


/* ============================================================
   GALLERY DOTS
============================================================ */

function renderDots(
    container,
    total,
    active
) {

    if (!container) {
        return;
    }


    container.replaceChildren();


    for (
        let index = 0;
        index < total;
        index++
    ) {

        const dot =
            document.createElement(
                "span"
            );


        dot.className =
            "store-gallery-dot";


        dot.classList.toggle(
            "active",
            index === active
        );


        container.appendChild(
            dot
        );

    }

}


/* ============================================================
   BIBLE COVER DATABASE HELPERS
============================================================ */

function getCoversByLanguage(
    language
) {

    const target =
        normalize(language);


    return BIBLE_COVERS.filter(
        cover =>
            normalize(
                cover.language
            ) === target
    );

}


function getCoversByLanguageAndSize(
    language,
    size
) {

    const targetLanguage =
        normalize(language);


    const targetSize =
        normalize(size);


    return BIBLE_COVERS.filter(
        cover =>
            normalize(
                cover.language
            ) === targetLanguage &&

            normalize(
                cover.size
            ) === targetSize
    );

}


function getAvailableSizes(
    language
) {

    return [
        ...new Set(
            getCoversByLanguage(
                language
            ).map(
                cover =>
                    cover.size
            )
        )
    ];

}


/* ============================================================
   REBUILD SIZE SELECTOR
============================================================ */

function rebuildSizeSelector(
    select,
    language,
    preferredSize = ""
) {

    if (!select) {
        return "";
    }


    const sizes =
        getAvailableSizes(
            language
        );


    select.replaceChildren();


    sizes.forEach(
        size => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                size;


            option.textContent =
                size;


            select.appendChild(
                option
            );

        }
    );


    if (!sizes.length) {

        select.value =
            "";

        return "";

    }


    let selected =
        sizes.find(
            size =>
                normalize(size) ===
                normalize(preferredSize)
        );


    if (!selected) {

        selected =
            sizes.find(
                size =>
                    normalize(size) ===
                    "regular"
            );

    }


    if (!selected) {

        selected =
            sizes[0];

    }


    select.value =
        selected;


    return selected;

}


/* ============================================================
   REBUILD DESIGN SELECTOR
   ------------------------------------------------------------
   PRICE IS NEVER SHOWN IN OPTION TEXT.
============================================================ */

function rebuildCoverDesignSelector(
    select,
    language,
    size,
    preferredCoverId = ""
) {

    if (!select) {
        return [];
    }


    const covers =
        getCoversByLanguageAndSize(
            language,
            size
        );


    select.replaceChildren();


    covers.forEach(
        cover => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                cover.id;


            /*
             * IMPORTANT:
             * DESIGN ONLY.
             *
             * NO PRICE.
             */

            option.textContent =
                cover.design;


            option.dataset.coverId =
                cover.id;


            option.dataset.price =
                String(
                    cover.price
                );


            select.appendChild(
                option
            );

        }
    );


    if (!covers.length) {

        select.value =
            "";

        return [];

    }


    const preferred =
        covers.find(
            cover =>
                cover.id ===
                preferredCoverId
        );


    select.value =
        preferred
            ? preferred.id
            : covers[0].id;


    return covers;

}


/* ============================================================
   COVER TITLE
============================================================ */

function updateCoverTitle(
    card,
    selected
) {

    if (!selected) {
        return;
    }


    const title =
        $(
            "#selected-cover-name, " +
            "[data-cover-title], " +
            ".jn-books-cover-title",
            card
        );


    if (title) {

        title.textContent =
            selected.name;

    }

}


/* ============================================================
   COVER DESCRIPTION
============================================================ */

function updateCoverDescription(
    element,
    selected
) {

    if (
        !element ||
        !selected
    ) {

        return;

    }


    element.textContent =
        selected.description;

}


/* ============================================================
   COVER META
============================================================ */

function updateCoverMeta(
    card,
    selected
) {

    if (!selected) {
        return;
    }


    const language =
        $(
            "#selected-cover-language",
            card
        );


    const size =
        $(
            "#selected-cover-size",
            card
        );


    const design =
        $(
            "#selected-cover-design",
            card
        );


    if (language) {

        language.textContent =
            selected.language;

    }


    if (size) {

        size.textContent =
            selected.size;

    }


    if (design) {

        design.textContent =
            selected.design;

    }

}


/* ============================================================
   COVER PRICE
============================================================ */

function updateCoverPrice(
    element,
    selected
) {

    if (
        !element ||
        !selected
    ) {

        return;

    }


    element.innerHTML =
        "";


    const amount =
        document.createElement(
            "strong"
        );


    amount.className =
        "cover-price-amount";


    amount.textContent =
        `₹${selected.price}`;


    element.appendChild(
        amount
    );


    const suffix =
        document.createElement(
            "small"
        );


    suffix.className =
        "cover-price-size";


    suffix.textContent =
        ` / ${selected.size} cover`;


    element.appendChild(
        suffix
    );

}


/* ============================================================
   BIBLE COVER SYSTEM
============================================================ */

function setupBibleCovers() {

    const card =
        $(
            ".jn-books-bible-covers-card"
        );


    if (!card) {

        console.warn(
            "Jeeva Nadi Books: Bible cover card not found."
        );

        return;

    }


    const language =
        $(
            "#cover-language",
            card
        );


    const size =
        $(
            "#cover-size",
            card
        );


    const design =
        $(
            "#cover-design",
            card
        );


    const image =
        $(
            "#selected-cover-image",
            card
        );


    const description =
        $(
            "#cover-design-description",
            card
        );


    const price =
        $(
            "#cover-selected-price",
            card
        );


    const previous =
        $(
            "#cover-gallery-prev",
            card
        );


    const next =
        $(
            "#cover-gallery-next",
            card
        );


    const dots =
        $(
            "#cover-image-dots",
            card
        );


    const addButton =
        $(
            "#add-cover-to-cart",
            card
        );


    if (
        !language ||
        !size ||
        !design ||
        !image ||
        !price ||
        !addButton
    ) {

        console.error(
            "Jeeva Nadi Books: Bible cover HTML is incomplete."
        );

        return;

    }


    let covers = [];

    let currentIndex = 0;


    /* ========================================================
       SELECTED COVER
    ======================================================== */

    function getSelectedCover() {

        return (
            covers.find(
                cover =>
                    cover.id ===
                    design.value
            ) ||
            null
        );

    }


    /* ========================================================
       UPDATE CART BUTTON
    ======================================================== */

    function updateCoverCartData(
        selected
    ) {

        if (!selected) {
            return;
        }


        addButton.dataset.product =
            "Bible Cover";


        addButton.dataset.title =
            selected.name;


        addButton.dataset.price =
            String(
                selected.price
            );


        addButton.dataset.variant =
            [
                selected.language,
                selected.size,
                selected.design
            ].join(
                " — "
            );


        addButton.dataset.category =
            "covers";


        addButton.dataset.image =
            selected.image;


        addButton.dataset.coverName =
            selected.name;


        addButton.dataset.coverLanguage =
            selected.language;


        addButton.dataset.coverDesign =
            selected.design;


        addButton.dataset.coverSize =
            selected.size;


        addButton.dataset.coverId =
            selected.id;

    }


    /* ========================================================
       RENDER COVER
    ======================================================== */

    function renderSelectedCover() {

        const selected =
            getSelectedCover();


        if (!selected) {
            return;
        }


        currentIndex =
            covers.findIndex(
                cover =>
                    cover.id ===
                    selected.id
            );


        if (currentIndex < 0) {

            currentIndex = 0;

        }


        setImageSource(
            image,
            [selected.image]
        );


        image.alt =
            `${selected.name} — ` +
            `${selected.size} ${selected.language} Bible cover`;


        updateCoverTitle(
            card,
            selected
        );


        updateCoverDescription(
            description,
            selected
        );


        updateCoverMeta(
            card,
            selected
        );


        updateCoverPrice(
            price,
            selected
        );


        updateCoverCartData(
            selected
        );


        renderDots(
            dots,
            covers.length,
            currentIndex
        );

    }


    /* ========================================================
       LANGUAGE → SIZE → DESIGN
    ======================================================== */

    function rebuildCoverSystem(
        preferredSize = "Regular",
        preferredCoverId = ""
    ) {

        const selectedLanguage =
            clean(
                language.value
            );


        if (!selectedLanguage) {

            covers = [];

            size.replaceChildren();

            design.replaceChildren();

            return;

        }


        const selectedSize =
            rebuildSizeSelector(
                size,
                selectedLanguage,
                preferredSize
            );


        covers =
            rebuildCoverDesignSelector(
                design,
                selectedLanguage,
                selectedSize,
                preferredCoverId
            );


        currentIndex = 0;


        renderSelectedCover();

    }


    /* ========================================================
       LANGUAGE CHANGE
    ======================================================== */

    language.addEventListener(
        "change",
        () => {

            rebuildCoverSystem(
                "Regular"
            );

        }
    );


    /* ========================================================
       SIZE CHANGE
    ======================================================== */

    size.addEventListener(
        "change",
        () => {

            covers =
                rebuildCoverDesignSelector(
                    design,
                    language.value,
                    size.value
                );


            currentIndex = 0;


            renderSelectedCover();

        }
    );


    /* ========================================================
       DESIGN CHANGE
    ======================================================== */

    design.addEventListener(
        "change",
        () => {

            renderSelectedCover();

        }
    );


    /* ========================================================
       PREVIOUS COVER
    ======================================================== */

    previous?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (!covers.length) {
                return;
            }


            currentIndex =
                (
                    currentIndex -
                    1 +
                    covers.length
                ) %
                covers.length;


            design.value =
                covers[
                    currentIndex
                ].id;


            renderSelectedCover();

        }
    );


    /* ========================================================
       NEXT COVER
    ======================================================== */

    next?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();


            if (!covers.length) {
                return;
            }


            currentIndex =
                (
                    currentIndex +
                    1
                ) %
                covers.length;


            design.value =
                covers[
                    currentIndex
                ].id;


            renderSelectedCover();

        }
    );


    /* ========================================================
       DEFAULT
       ENGLISH → REGULAR → LIGHT BLUE FABRIC
    ======================================================== */

    language.value =
        "English";


    rebuildCoverSystem(
        "Regular",
        "english-light-blue"
    );

}


/* ============================================================
   PROMISE CARDS
============================================================ */

function setupPromiseCards() {

    const cards =
        $$(
            '.jn-books-product-card[data-category="promises"]'
        );


    cards.forEach(
        card => {

            const select =
                $(
                    "[data-promise-quantity]",
                    card
                );


            const price =
                $(
                    "[data-promise-price]",
                    card
                );


            const button =
                $(
                    "[data-add-product], .jn-books-add-cart",
                    card
                );


            if (
                !select ||
                !button
            ) {

                return;

            }


            function updatePromiseProduct() {

                const option =
                    select.options[
                        select.selectedIndex
                    ];


                if (!option) {
                    return;
                }


                const quantity =
                    getNumber(
                        option.value,
                        1
                    );


                const selectedPrice =
                    getNumber(
                        option.dataset.price,
                        0
                    );


                button.dataset.product =
                    "Promise Cards";


                button.dataset.price =
                    String(
                        selectedPrice
                    );


                button.dataset.variant =
                    `${quantity} Cards`;


                button.dataset.category =
                    "promises";


                if (
                    !button.dataset.image
                ) {

                    const img =
                        $("img", card);


                    if (img) {

                        button.dataset.image =
                            img.currentSrc ||
                            img.src ||
                            "";

                    }

                }


                if (price) {

                    price.textContent =
                        `₹${selectedPrice}`;

                }

            }


            select.addEventListener(
                "change",
                updatePromiseProduct
            );


            updatePromiseProduct();

        }
    );

}


/* ============================================================
   CART BUTTONS
============================================================ */

function setupCartButtons() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-add-product], " +
                    "[data-add-cover], " +
                    ".jn-books-add-cart"
                );


            if (!button) {
                return;
            }


            event.preventDefault();


            if (button.disabled) {
                return;
            }


            addToCart(
                button
            );

        }
    );

}


/* ============================================================
   ADD TO CART
============================================================ */

function addToCart(
    button
) {

    const cart =
        window.JeevaNadiCart;


    if (!cart) {

        notify(
            "Cart is still loading. Please wait."
        );

        return;

    }


    if (
        typeof cart.isAuthenticationReady ===
        "function"
    ) {

        if (
            !cart.isAuthenticationReady()
        ) {

            notify(
                "Please wait while your account is loading."
            );

            return;

        }

    }


    if (
        typeof cart.isAuthenticated ===
        "function"
    ) {

        if (
            !cart.isAuthenticated()
        ) {

            notify(
                "Please sign in before adding products."
            );


            window.dispatchEvent(
                new CustomEvent(
                    "jeevaNadiCartAuthRequired",
                    {
                        detail: {
                            reason:
                                "signed-out"
                        }
                    }
                )
            );


            return;

        }

    }


    const product =
        clean(
            button.dataset.product ||
            button.dataset.title
        );


    const variant =
        clean(
            button.dataset.variant
        );


    const category =
        clean(
            button.dataset.category ||
            "books"
        );


    const image =
        clean(
            button.dataset.image
        );


    const price =
        getNumber(
            button.dataset.price,
            0
        );


    if (!product) {

        notify(
            "Product information is missing."
        );

        return;

    }


    if (price <= 0) {

        notify(
            "This product is currently unavailable."
        );

        return;

    }


    const key =
        variant
            ? `${product}::${variant}`
            : `${product}::default`;


    const itemName =
        category === "covers" &&
        button.dataset.coverName
            ? button.dataset.coverName
            : product;


    const item = {

        key,

        id:
            key,

        product,

        title:
            itemName,

        name:
            itemName,

        variant,

        price,

        quantity:
            1,

        image,

        category,

        language:
            button.dataset.coverLanguage ||
            "",

        design:
            button.dataset.coverDesign ||
            "",

        size:
            button.dataset.coverSize ||
            "",

        coverId:
            button.dataset.coverId ||
            ""

    };


    try {

        if (
            typeof cart.add !==
            "function"
        ) {

            throw new Error(
                "cart.add() is unavailable."
            );

        }


        const success =
            Boolean(
                cart.add(item)
            );


        if (!success) {
            return;
        }


        notify(
            `${itemName} added to cart.`
        );


        animateButton(
            button
        );


        refreshCartCount();

    }

    catch (error) {

        console.error(
            "Jeeva Nadi Books: Cart error",
            error
        );


        notify(
            "Unable to add this product to your cart."
        );

    }

}


/* ============================================================
   CART EVENTS
============================================================ */

function setupCartEvents() {

    window.addEventListener(
        "jeevaNadiCartUpdated",
        refreshCartCount
    );


    window.addEventListener(
        "jeevaNadiCartReady",
        refreshCartCount
    );


    window.addEventListener(
        "jeevaNadiAuthChanged",
        refreshCartCount
    );


    window.addEventListener(
        "jeevaNadiCartAuthRequired",
        event => {

            const reason =
                event.detail?.reason;


            if (
                reason ===
                "authentication-loading"
            ) {

                notify(
                    "Please wait while your account is loading."
                );

                return;

            }


            notify(
                "Please sign in to use the shopping cart."
            );

        }
    );

}


/* ============================================================
   CART COUNT
============================================================ */

function refreshCartCount() {

    const counters =
        $$(STORE.selectors.cartCount);


    if (!counters.length) {
        return;
    }


    const cart =
        window.JeevaNadiCart;


    if (!cart) {
        return;
    }


    let count = 0;


    try {

        if (
            typeof cart.count ===
            "function"
        ) {

            count =
                getNumber(
                    cart.count(),
                    0
                );

        }

    }

    catch (error) {

        console.warn(
            "Jeeva Nadi Books: Unable to read cart count.",
            error
        );

        return;

    }


    counters.forEach(
        element => {

            element.textContent =
                String(count);


            element.classList.toggle(
                "has-items",
                count > 0
            );


            element.setAttribute(
                "aria-label",
                `${count} item${
                    count === 1
                        ? ""
                        : "s"
                } in cart`
            );

        }
    );

}


/* ============================================================
   BUTTON ANIMATION
============================================================ */

function animateButton(
    button
) {

    if (!button) {
        return;
    }


    button.disabled =
        true;


    button.classList.add(
        STORE.classes.added
    );


    button.textContent =
        "✓ Added to Cart";


    window.setTimeout(
        () => {

            button.disabled =
                false;


            button.classList.remove(
                STORE.classes.added
            );


            button.innerHTML =
                "<span>+</span> Add to Cart";

        },
        1400
    );

}


/* ============================================================
   TOAST
============================================================ */

function notify(
    message
) {

    const toast =
        $(STORE.selectors.toast);


    if (!toast) {

        console.info(
            "Jeeva Nadi Books:",
            message
        );

        return;

    }


    toast.textContent =
        message;


    toast.classList.add(
        STORE.classes.active,
        "show"
    );


    if (toastTimer) {

        clearTimeout(
            toastTimer
        );

    }


    toastTimer =
        window.setTimeout(
            () => {

                toast.classList.remove(
                    STORE.classes.active,
                    "show"
                );

            },
            3200
        );

}


/* ============================================================
   RESTORE STATE
============================================================ */

function restoreState() {

    state.category =
        "all";


    state.search =
        "";


    state.sort =
        "featured";


    const search =
        $(STORE.selectors.search);


    if (search) {

        search.value =
            "";

    }


    const categories =
        $$(STORE.selectors.categories);


    categories.forEach(
        button => {

            const category =
                normalize(
                    button.dataset.storeCategory ||
                    button.dataset.category ||
                    "all"
                );


            const active =
                category ===
                "all";


            button.classList.toggle(
                STORE.classes.active,
                active
            );


            button.classList.toggle(
                "active",
                active
            );


            button.setAttribute(
                "aria-selected",
                String(active)
            );

        }
    );


    const sort =
        $(STORE.selectors.sort);


    if (sort) {

        sort.value =
            "featured";

    }

}


/* ============================================================
   IMAGE ERROR MONITOR
============================================================ */

function setupImageErrorMonitoring() {

    document.addEventListener(
        "error",
        event => {

            const image =
                event.target;


            if (
                !(image instanceof
                  HTMLImageElement)
            ) {

                return;

            }


            const source =
                clean(
                    image.getAttribute(
                        "src"
                    )
                );


            if (!source) {
                return;
            }


            if (
                source.startsWith(
                    "data:"
                ) ||
                source.startsWith(
                    "blob:"
                )
            ) {

                return;

            }


            if (
                image.dataset.errorLogged ===
                "true"
            ) {

                return;

            }


            image.dataset.errorLogged =
                "true";


            console.warn(
                "Jeeva Nadi Books: Image could not be loaded:",
                source
            );

        },
        true
    );

}


/* ============================================================
   BOOT
============================================================ */

function bootBooksStore() {

    if (
        state.initialized
    ) {

        return;

    }


    const grid =
        getProductGrid();


    if (!grid) {

        console.error(
            "Jeeva Nadi Books: Product grid not found."
        );

        return;

    }


    state.initialized =
        true;


    /*
     * Capture the ORIGINAL HTML order
     * before sorting.
     */

    storeOriginalProductOrder();


    setupSearch();

    setupCategories();

    setupSorting();

    setupProductGalleries();

    setupBibleCovers();

    setupPromiseCards();

    setupCartButtons();

    setupCartEvents();

    setupImageErrorMonitoring();

    restoreState();

    applySorting();

    refreshProducts();

    refreshCartCount();


    console.log(
        "Jeeva Nadi Books: Store initialized successfully."
    );

}


/* ============================================================
   PUBLIC API
============================================================ */

window.JeevaNadiBooksStore = {

    refreshProducts,

    refreshCartCount,

    applySorting,

    notify,


    getState() {

        return {
            ...state
        };

    },


    getProducts() {

        return getProductCards();

    },


    getBibleCovers() {

        return BIBLE_COVERS.map(
            cover => ({
                ...cover
            })
        );

    },


    getCoversByLanguage(
        language
    ) {

        return getCoversByLanguage(
            language
        );

    },


    getCoversByLanguageAndSize(
        language,
        size
    ) {

        return getCoversByLanguageAndSize(
            language,
            size
        );

    }

};


/* ============================================================
   START
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        bootBooksStore,
        {
            once: true
        }
    );

}

else {

    bootBooksStore();

}
