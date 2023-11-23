// Header related
const headerMenus = document.querySelectorAll('.header-menu');
const alertBox = document.querySelector('#alert-box');
const alertBoxToggle = document.querySelector('#alert-box-toggle');
const dropdownMenu = document.querySelector('#menu-dropdown');
const dropdownMenuToggle = document.querySelector('#menu-dropdown-toggle');

// Select plan modal related
const selectPlanModal = document.querySelector('#select-plan-section');
const closeSelectPlanModalBtns = document.querySelectorAll('#select-plan-section .close-select-plan-section-btn');

// Setup guide related
const mainSetupGuide = document.querySelector('#setup-guide-section #setup-guide-main');
const mainSetupGuideOpener = document.querySelector('#setup-guide-opener');

// Setup steps related
const setupSteps = document.querySelectorAll('.setup-step');
const setupStepsCompleted = document.querySelector('#setup-progress #progress-text #steps-completed');
const setupProgressIndicator = document.querySelector('#setup-progress #progress-bar #progress-indicator');
const setupStepCheckboxes = document.querySelectorAll('.setup-step .check-marker .check input[type="checkbox"]');



/**
 * Sets the aria-expanded accessibility attribute on an element.
 * @param {Element} el - The element to set the aria-expanded attribute on.
 * @param {boolean} value - The value to set the aria-expanded attribute to.
 */
const setAriaExpanded = (el, value) => {
    if (typeof value !== 'boolean') throw new Error('Value must be a boolean');
    el.ariaExpanded = value;
}


/**
 * Sets the aria-checked accessibility attribute on an element.
 * @param {Element} el  - The element to set the aria-checked attribute on.
 * @param {boolean} value  - The value to set the aria-checked attribute to.
 */
const setAriaChecked = (el, value) => {
    if (typeof value !== 'boolean') throw new Error('Value must be a boolean');
    el.ariaChecked = value;
}


/**
 * Sets the aria-expanded accessibility attribute on an element based on whether it has the `show-flex` class.
 * @param {Element} el - The element to set the aria-expanded attribute on.
 */
const setAriaExpandedByShowFlex = (el) => {
    if (el.classList.contains('show-flex')) {
        setAriaExpanded(el, true);
    }else{
        setAriaExpanded(el, false);
    }
}


document.body.onclick = (e) => {
    // Close header menus on outside click
    if (!alertBox.contains(e.target) && !alertBoxToggle.contains(e.target) && alertBox.classList.contains('show-flex')) {
        alertBox.classList.remove('show-flex');
        setAriaExpandedByShowFlex(alertBoxToggle);
    };

    if (!dropdownMenu.contains(e.target) && !dropdownMenuToggle.contains(e.target) && dropdownMenu.classList.contains('show-flex')) {
        dropdownMenu.classList.remove('show-flex');
        setAriaExpandedByShowFlex(dropdownMenuToggle);
    };
}


// Open/close notification/alert box on click or enter key press
alertBoxToggle.onclick = () => {
    alertBox.classList.toggle('show-flex');
    setAriaExpandedByShowFlex(alertBox);
}

alertBoxToggle.onkeydown = (e) => {
    if (e.key === 'Enter') {
        // `alertBoxToggle.click()` is used instead of `alertBox.classList.toggle('show-flex')` so that
        // if `click` event is disabled then keyboard `enter` will also be disabled
        alertBoxToggle.click();
    };
}


// Open/close dropdown menu on click or enter key press
dropdownMenuToggle.onclick = () => {
    dropdownMenu.classList.toggle('show-flex');
    setAriaExpandedByShowFlex(dropdownMenu);
}

dropdownMenuToggle.onkeydown = (e) => {
    if (e.key === 'Enter') {
        dropdownMenuToggle.click();
    };
}


// Open/close select plan modal on click or enter key press
closeSelectPlanModalBtns.forEach(btn => {
    btn.onclick = () => {
        selectPlanModal.classList.add('hide-select-plan-section');
    };
});

closeSelectPlanModalBtns.forEach(btn => {
    btn.onkeydown = (e) => {
        if (e.key === 'Enter') {
            btn.click();
        };
    };
});



// Expand/collapse setup guide on click
mainSetupGuideOpener.onclick = () => {
    mainSetupGuide.classList.toggle('show-flex');
    setAriaExpandedByShowFlex(mainSetupGuide);

    // Reset setup steps to initial state if setup guide is closed (Based on design prototype)
    if (!mainSetupGuide.classList.contains('show-flex')) {
        setupSteps.forEach((setupStep, index) => {
            // Close all setup steps but leave the first one open
            if (index !== 0){
                setupStep.classList.add('close-setup-step');
                setAriaExpanded(setupStep, false);
            }else{
                setupStep.classList.remove('close-setup-step');
                setAriaExpanded(setupStep, true);
            };
        });
    }
}


// Expand/collapse setup steps on click or enter key press
setupSteps.forEach(setupStep => {
    let setupStepCheckbox = setupStep.querySelector('.check-marker .check input[type="checkbox"]');

    const onOpen = () => {
        setAriaExpanded(setupStep, true);

        setupSteps.forEach(el => {
            // Close all setup steps except the one that was opened
            if (el !== setupStep && !el.classList.contains('close-setup-step')) {
                el.classList.add('close-setup-step');
                setAriaExpanded(el, false);
            };
        });
    };

    setupStep.onclick = (e) => {
        // Open setup step that was clicked

        // Prevent setup step from opening if its checkbox was clicked and unchecked
        if (setupStepCheckbox.contains(e.target) && !setupStepCheckbox.checked) {
            return;
        }
        setupStep.classList.remove('close-setup-step');
        onOpen();
    };

    setupStep.onkeydown = (e) => {
        if (e.key === 'Enter') {
            // Open setup step that received the enter key press

            // Prevent setup step from opening if its checkbox was clicked and unchecked
            if (setupStepCheckbox.contains(e.target) && !setupStepCheckbox.checked) {
                return;
            }
            setupStep.classList.remove('close-setup-step');
            onOpen();
        };
    };
    
});


// Check/uncheck setup step checkboxes on click or enter key press
setupStepCheckboxes.forEach(checkbox => {
    const onCheck = () => {
        setAriaChecked(checkbox, true);

        setupSteps.forEach(setupStep => {
            // Open setup step that contains the checked checkbox and close all others
            if (setupStep.contains(checkbox)) {
                setupStep.classList.remove("close-setup-step");
            }
            // All other setup steps are closed automatically by the `onOpen()` function
            // because the checkbox is inside the setup step, which will also receive the click event
        });
    };

    const onUncheck = () => {
        setAriaChecked(checkbox, false);
    };

    checkbox.onclick = () => {
        if (checkbox.checked) {
            onCheck();
        }else{
            onUncheck();
        };

        // Update progress indicator and steps completed
        let checkedCount = document.querySelectorAll('.setup-step .check-marker .check input:checked').length;
        setupStepsCompleted.innerHTML = `${checkedCount}`;
        let progress = (checkedCount / setupStepCheckboxes.length) * 100;
        setupProgressIndicator.style.width = `${progress}%`;
    };

    checkbox.onkeydown = (e) => {
        if (e.key === 'Enter') {
            checkbox.click();
        };
    };
})
