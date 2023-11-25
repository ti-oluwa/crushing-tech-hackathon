// Header related
const headerMenus = document.querySelectorAll('.header-menu');
const searchForm = document.querySelector('#search-bar');
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


// ********** HELPER FUNCTIONS ********** //

/**
 * Sets the aria-expanded accessibility attribute on an element.
 * @param {Element} el - The element to set the aria-expanded attribute on.
 * @param {boolean} value - The value to set the aria-expanded attribute to.
 */
function setAriaExpanded(el, value){
    if (typeof value !== 'boolean') throw new Error('Value must be a boolean');
    el.ariaExpanded = value;
}


/**
 * Sets the aria-checked accessibility attribute on an element.
 * @param {Element} el  - The element to set the aria-checked attribute on.
 * @param {boolean} value  - The value to set the aria-checked attribute to.
 */
function setAriaChecked(el, value){
    if (typeof value !== 'boolean') throw new Error('Value must be a boolean');
    el.ariaChecked = value;
}


/**
 * Sets the aria-expanded accessibility attribute on an element based on whether it has the `show-flex` class.
 * @param {Element} el - The element to set the aria-expanded attribute on.
 */
function setAriaExpandedByShowFlex(el){
    if (el.classList.contains('show-flex')) {
        setAriaExpanded(el, true);
    }else{
        setAriaExpanded(el, false);
    };
}


/**
 * Update setup progress indicator and text.
 * @returns {void}
 */
function updateProgress(){
    let checkedCount = document.querySelectorAll('.setup-step .check-marker .check input:checked').length;
    setupStepsCompleted.innerHTML = `${checkedCount}`;
    let progress = (checkedCount / setupStepCheckboxes.length) * 100;
    setupProgressIndicator.style.width = `${progress}%`;
}


// Set helper properties/functions on setup steps
setupSteps.forEach((setupStep) => {
    setupStep.isExpanded = () => {return !setupStep.classList.contains('close-setup-step')};

    // Expands setup step and collapses all other setup steps that are open
    setupStep.expand = function() { 
        this.classList.remove('close-setup-step');
        setAriaExpanded(this, true);
        setupSteps.forEach(step => {
            if (step !== this && step.isExpanded()) {
                step.collapse();
            };
        }); 
    };

    // Collapse setup step
    setupStep.collapse = function() { 
        this.classList.add('close-setup-step');
        setAriaExpanded(this, false);
    };
});


// Set helper properties/functions on setup step checkboxes
setupStepCheckboxes.forEach((checkbox) => {
    // Set the index of each checkbox
    checkbox.index = Array.from(setupStepCheckboxes).indexOf(checkbox);

    // Gets the next unchecked checkbox from this checkbox, if any
    checkbox.nextUncheckedCheckbox = function() {
        // NOTE: "`this` checkbox" as used in context here, refers to the checkbox that this
        // method is called on.

        let nextUncheckedCheckbox = null;
        let allChecked = Array.from(setupStepCheckboxes).every(checkbox => checkbox.checked);

        // IF, all checkboxes are already checked, there is no next unchecked checkbox. Just return. 
        if (allChecked) {
            return nextUncheckedCheckbox;
        };

        // ELSE, continue with the rest of the function

        // To get the next unchecked checkbox, We have to consider two approaches;
        // 1. We can assume that the next unchecked checkbox is after `this` checkbox. Therefore, we start the loop 
        //    from the index of next checkbox after `this` checkbox and check all checkboxes that come after it
        //    until we find the next unchecked checkbox or reach the end of the NodeList.
        // 
        // 2. If the loop reaches the end of the NodeList and the next unchecked checkbox has not been found yet,
        //    we can again assume that the next unchecked checkbox is before `this` checkbox, given that `this` checkbox 
        //    is not the first checkbox in the Nodelist. Therefore, we start the loop from the beginning of the NodeList again
        //    and check all checkboxes that come before `this` checkbox until we find the next unchecked checkbox 
        //    or very unlikely, reach the index of `this` checkbox again.

        // Before proceeding with to the loop, we define a function that checks if the next unchecked checkbox has been found.
        // This function will take in a checkbox index, and return true if the following conditions are met:
        // 1. The given checkbox index is greater than the index of `this` checkbox, 
        // 2. The checkbox with the given index is unchecked. 
        // Otherwise, it will return false.

        let isNextUncheckedCheckbox = (checkboxIndex) => {
            return (checkboxIndex > this.index) && !setupStepCheckboxes[checkboxIndex].checked;
        };

        // Taking the first approach
        for(let currentCheckboxIndex = this.index + 1; currentCheckboxIndex < setupStepCheckboxes.length; currentCheckboxIndex++) {
            if (isNextUncheckedCheckbox(currentCheckboxIndex)) {
                nextUncheckedCheckbox = setupStepCheckboxes[currentCheckboxIndex];
                break;
            };

            // If we have still not found the next unchecked and we have reached the end 
            // Nodelist. We go with the second approach. 
            if (this.index != 0 && currentCheckboxIndex == (setupStepCheckboxes.length - 1)) {

                // Redefined the function that checks if the next unchecked checkbox has been found.
                // The new adaptation of the function will take in a checkbox index, and return true if the following conditions are met:
                // 1. The given checkbox index is less than the index of `this` checkbox,
                // 2. The checkbox with the given index is unchecked.
                // Otherwise, it will return false.

                isNextUncheckedCheckbox = (checkboxIndex) => {
                    return (checkboxIndex < this.index) && !setupStepCheckboxes[checkboxIndex].checked;
                }

                // Now start the loop from the beginning of the NodeList and stop at the index of `this` checkbox.
                // To do this, set the loop counter to -1. 
                // Why? 
                // Well, after each loop, the loop counter is incremented by 1.
                // Therefore, if the loop counter is set to -1, it will be incremented to 0 after this loop so that 
                // the loop can start from the beginning(first checkbox) of the NodeList again.
                // If the loop counter was to be set to 0, it will be incremented to 1 after this loop.
                // and the loop will start from the second checkbox in the NodeList instead of the first one, after the reset.
                currentCheckboxIndex = -1;
            }
        };
        return nextUncheckedCheckbox;
    }

    checkbox.wasChecked = function() {
        setAriaChecked(this, true);

        let nextUncheckedCheckbox = this.nextUncheckedCheckbox();
        if (nextUncheckedCheckbox) {
            // Get the step that contains the next unchecked checkbox
            let nextUncheckedCheckboxSetupStep = setupSteps[nextUncheckedCheckbox.index];
            // Click on next uncompleted setup step to open it
            nextUncheckedCheckboxSetupStep.click();
        };
    };

    checkbox.wasUnchecked = function() {
        setAriaChecked(this, false);
    };
});


// ********** END HELPER FUNCTIONS ********** //



document.body.onclick = (e) => {
    // Close header menus on outside click
    if (!alertBox.contains(e.target) && !alertBoxToggle.contains(e.target) && alertBox.classList.contains('show-flex')) {
        alertBox.classList.remove('show-flex');
        setAriaExpandedByShowFlex(alertBox);
    };

    if (!dropdownMenu.contains(e.target) && !dropdownMenuToggle.contains(e.target) && dropdownMenu.classList.contains('show-flex')) {
        dropdownMenu.classList.remove('show-flex');
        setAriaExpandedByShowFlex(dropdownMenu);
    };
}


// Prevent search form from submitting
searchForm.onsubmit = (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
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
    mainSetupGuide.classList.toggle('hide');
    setAriaExpandedByShowFlex(mainSetupGuide);

    // Reset setup steps to initial state if setup guide is closed (Based on design prototype)
    if (!mainSetupGuide.classList.contains('show-flex')) {
        setupSteps.forEach((setupStep, index) => {
            // Close all setup steps but leave the first one open
            if (index !== 0){
                setupStep.collapse();
            }else{
                setupStep.expand();
            };
        });
    }
}


// Expand/collapse setup steps on click or enter key press
setupSteps.forEach((setupStep) => {
    let setupStepCheckbox = setupStep.querySelector('.check-marker .check input[type="checkbox"]');

    setupStep.onclick = (e) => {
        // Expand setup step that was clicked anywhere except its checkbox, 
        // if it is not already expanded
        if (!setupStepCheckbox.contains(e.target) && !setupStep.isExpanded()){
            setupStep.expand();
        };
    };

    setupStep.onkeydown = (e) => {
        if (e.key === 'Enter') {
            // Open setup step that received Enter key anywhere except its checkbox
            if (!setupStepCheckbox.contains(e.target) && !setupStep.isExpanded()){
                setupStep.collapse();
            };
        };
    };
    
});


// Check/uncheck setup step checkboxes on click or enter key press
setupStepCheckboxes.forEach((checkbox) => {
    checkbox.onclick = () => {
        if (checkbox.checked) {
            checkbox.wasChecked();
        }else{
            checkbox.wasUnchecked();
        };
    };

    checkbox.onkeydown = (e) => {
        if (e.key === 'Enter') {
            checkbox.click();
        };
    };

    checkbox.onchange = () => {
        updateProgress();
    };
})
