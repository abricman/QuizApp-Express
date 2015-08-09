(function () {
    'use strict';
    // Validation
    $(document).ready(function () {
        $("#loginForm").validate({
            rules: {
                loginUsername: {
                    required: true
                },
                loginPassword: "required"
            },
            messages: {
                loginUsername: {
                    required: "Provide a username"
                },
                loginPassword: "Provide a password"
            }
        });

        $("#regForm").validate({
            rules: {
                regEmail: {
                    required: true,
                    email: true
                },
                regUsername: {
                    required: true,
                    minlength: 3,
                    maxlength: 15
                },
                regPassword: {
                    required: true,
                    minlength: 8,
                    maxlength: 25
                },
                confirmRegPassword: {
                    required: true,
                    equalTo: "#regPassword"
                }
            },
            messages: {
                regEmail: {
                    required: "Provide an email",
                    email: "Provide a valid email"
                },
                regUsername: {
                    required: "Provide a name",
                    minLength: jQuery.validator.format("Minimum length is {0}"),
                    maxLength: jQuery.validator.format("Maximum length is {0}")
                },
                regPassword: {
                    required: "Provide a password",
                    minlength: jQuery.validator.format("Password must be at least {0} characters"),
                    maxlength: jQuery.validator.format("Password must be at most {0} characters")
                },
                confirmRegPassword: {
                    required: "Confirm your password",
                    equalTo: "Passwords do not match"
                }
            }
        });
    });
})();