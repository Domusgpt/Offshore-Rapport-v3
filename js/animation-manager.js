/**
 * Offshore Rapport v3 - Animation Manager
 * Handles triggering CSS animations, especially scroll-based ones.
 */

const OffshoreRapportAnimations = (() => {

    const scrollAnimationObserverOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const scrollAnimationCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: Unobserve after animation triggers once
                // observer.unobserve(entry.target);
            } else {
                // Optional: Remove class if element scrolls out of view
                // entry.target.classList.remove('is-visible');
            }
        });
    };

    const scrollObserver = new IntersectionObserver(scrollAnimationCallback, scrollAnimationObserverOptions);

    function initializeScrollAnimations(parentElement = document) {
        const elementsToAnimate = parentElement.querySelectorAll('.animate-on-scroll, .animate-stagger');

        if (elementsToAnimate.length === 0 && parentElement !== document) {
             // If a specific parent was provided and nothing found, check the parent itself
             if (parentElement.matches('.animate-on-scroll, .animate-stagger')) {
                 elementsToAnimate = [parentElement];
             }
         }

        console.log(`Initializing scroll animations for ${elementsToAnimate.length} elements within`, parentElement);

        elementsToAnimate.forEach(el => {
             // Ensure the element isn't already being observed if re-initializing
             // Note: IntersectionObserver automatically handles this, but explicit unobserve/observe might be needed in complex scenarios.
            scrollObserver.observe(el);
        });
    }

    // Add functions for other types of animations if needed
    // function triggerPageTransitionIn() { ... }
    // function triggerPageTransitionOut() { ... }


    // Public API
    return {
        initializeScrollAnimations
        // triggerPageTransitionIn,
        // triggerPageTransitionOut
    };

})();