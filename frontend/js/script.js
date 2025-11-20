document.addEventListener("DOMContentLoaded", function() {

    /************** Process Steps Scroll Animation (One by One) **************/
    const processSteps = document.querySelectorAll('.process-step');
    if(processSteps.length > 0) {
        const processObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    // Animate steps one by one
                    processSteps.forEach((step, index) => {
                        if(!step.classList.contains('visible')){
                            setTimeout(() => {
                                step.classList.add('visible');
                            }, index * 300); // 300ms stagger
                        }
                    });
                    observer.disconnect(); // stop observing once started
                }
            });
        }, { threshold: 0.1 });

        processSteps.forEach(step => processObserver.observe(step));
    }

    /************** Feature Cards Scroll Animation + Counter **************/
    const featureCards = document.querySelectorAll('.feature-card');
    if(featureCards.length > 0) {
        const cardsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if(entry.isIntersecting){
                    featureCards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('visible');

                            // Count animation inside card
                            const counters = card.querySelectorAll('.count');
                            counters.forEach(counter => {
                                const target = +counter.getAttribute('data-target');
                                let current = 0;
                                const increment = target / 50;
                                const interval = setInterval(() => {
                                    current += increment;
                                    if(current >= target){
                                        counter.textContent = target;
                                        clearInterval(interval);
                                    } else {
                                        counter.textContent = Math.ceil(current);
                                    }
                                }, 30);
                            });

                        }, index * 200); // 200ms stagger for cards
                    });

                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        featureCards.forEach(card => cardsObserver.observe(card));
    }

});
