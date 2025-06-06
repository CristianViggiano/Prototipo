/*global UnoServerLess _config AmazonCognitoIdentity AWSCognito*/

var UnoServerLess = window.UnoServerLess || {};

(function scopeWrapper($) {
    var signinUrl = 'signin.html';  /* VER ESTE HTML */

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    UnoServerLess.signOut = function signOut() {
        console.log("SignOut");
        userPool.getCurrentUser().signOut();
    };

    UnoServerLess.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        //console.log(cognitoUser.username);

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                    //console.log(cognitoUser.username);
                }
            });
            console.log(cognitoUser);
            console.log(cognitoUser.username);
            document.getElementById('user-name').innerText = `Hola, ${cognitoUser.username}`;
            if (document.getElementById('reg-btn'))
                document.getElementById('reg-btn').style.display = 'none';
            if (document.getElementById('sin-btn'))
                document.getElementById('sin-btn').style.display = 'none';
            if (document.getElementById('singOut2'))
                document.getElementById('singOut2').style.display = 'block';
        } else {
            document.getElementById('user-name').innerText = ``;
            if (document.getElementById('reg-btn'))
                document.getElementById('reg-btn').style.display = 'block';
            if (document.getElementById('sin-btn'))
                document.getElementById('sin-btn').style.display = 'block';
            if (document.getElementById('singOut2'))
                document.getElementById('singOut2').style.display = 'none';
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(toUsername(email), password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: toUsername(email),
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool
        });
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'ride.html';  /* VER ESTE HTML */
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';  /* VER ESTE HTML */
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }

    if (document.getElementById('signOut2')){
        console.log('existe el elemento')
        document.getElementById('signOut2').addEventListener('click', function(event) {
            event.preventDefault(); // Evita que el enlace navegue a otra página
                console.log('se intenta llamar al logOut')
                UnoServerLess.signOut();
                console.log('Usuario cerrado sesión');
            
        });
    }

    if (document.getElementById('signOut')){
        document.getElementById('signOut').addEventListener('click', function(event) {
            event.preventDefault(); // Evita que el enlace navegue a otra página

                UnoServerLess.signOut();
                console.log('Usuario cerrado sesión');
            
        });
    }

}(jQuery));
