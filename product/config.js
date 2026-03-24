/**
 * Product Configuration
 * 
 * Loaded BEFORE engine scripts. Defines product-specific values that
 * the engine needs during initialization (before DOMContentLoaded).
 * 
 * This file should contain ONLY data assignments — no DOM manipulation,
 * no event listeners, no function calls that depend on the engine.
 */

window.productConfig = {
    title: "FORMBREW PRODUCT CONFIGURATOR",
    pageTitle: "Formbrew Product Configurator",
    logo: "./assets/logo.png",
    logoDark: "./assets/logo-dark.png",
    favicon: "./assets/favicon.png",
    help: {
        primaryUrl: "./help/help.html",
        fallbackUrl: "./help/help.html"
    },
    changelog: {
        primaryUrl: "./changelog/changelog.html",
        fallbackUrl: "./changelog/changelog.html"
    }
};