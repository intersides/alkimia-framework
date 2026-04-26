import addThemeToggle from '../../../../lib/playground/themeToggle.js';
import IconService from '../../../services/IconService/IconService.js';
import Input from '../Input.js';

const container = document.getElementById('widgets');
const output = document.getElementById('output');

const iconService = IconService({ skin: 'default' });

function isEmailFormat(value) {
    return value.indexOf('@') !== -1 && value.indexOf('.') !== -1;
}

const emailInput = Input({
    label: 'Email',
    type: Input.Type.EMAIL,
    placeholder: 'you@example.com',
    validators: [
        {
            on: 'focusout',
            validate: function(value) {

                this.clearIssues();

                if (value.length === 0) {
                    this.markInvalid();
                    this.showIssue({
                        type: Input.IssueType.ERROR,
                        message: 'Email is required'
                    });
                    return;
                }

                if (!isEmailFormat(value)) {
                    this.markInvalid();
                    this.showIssue({
                        type: Input.IssueType.ERROR,
                        message: 'Invalid email format'
                    });
                    return;
                }

                this.markValid();
            }
        },
        {
            on: 'keyup',
            validate: function(value) {

                this.clearIssues();

                if (value.length > 0 && isEmailFormat(value)) {
                    this.markValid();
                    this.showIssue({
                        type: Input.IssueType.FEEDBACK,
                        message: 'Looks good'
                    });
                }
            }
        }
    ]
});
emailInput.appendTo(container);

const passwordInput = Input({
    label: 'Password',
    type: Input.Type.PASSWORD,
    placeholder: 'Enter password',
    iconService: iconService,
    passwordIcons: { visible: iconService.getIcon("eye-opened"), hidden: iconService.getIcon("eye-closed") },
    validators: [
        {
            on: 'keyup',
            validate: function(value) {

                this.clearIssues();

                if (value.length === 0) {
                    return;
                }

                if (value.length < 6) {
                    this.markInvalid();
                    this.showIssue({
                        type: Input.IssueType.WARNING,
                        message: 'Too short — minimum 6 characters'
                    });
                    return;
                }

                this.markValid();
                this.showIssue({
                    type: Input.IssueType.FEEDBACK,
                    message: 'Strong enough'
                });
            }
        }
    ]
});
passwordInput.appendTo(container);

emailInput.onValidityChange(function(valid) {
    output.textContent = 'email valid: ' + valid + '\n';
});

passwordInput.onValidityChange(function(valid) {
    output.textContent += 'password valid: ' + valid + '\n';
});
addThemeToggle();
