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
            //console.log(cognitoUser);
            //console.log(cognitoUser.username);
            document.getElementById('user-name').innerText = `Hola, ${cognitoUser.username}`;
            if (document.getElementById('reg-btn'))
                document.getElementById('reg-btn').style.display = 'none';
            if (document.getElementById('sin-btn'))
                document.getElementById('sin-btn').style.display = 'none';
            if (document.getElementById('signOut2'))
                document.getElementById('signOut2').style.display = 'block';
            if (document.getElementById('new-btn'))
                document.getElementById('new-btn').style.display = 'block';
        } else {
            document.getElementById('user-name').innerText = ``;
            if (document.getElementById('reg-btn'))
                document.getElementById('reg-btn').style.display = 'block';
            if (document.getElementById('sin-btn'))
                document.getElementById('sin-btn').style.display = 'block';
            if (document.getElementById('signOut2'))
                document.getElementById('signOut2').style.display = 'none';
            if (document.getElementById('new-btn'))
                document.getElementById('new-btn').style.display = 'none';
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
                window.location.href = 'oportunidades.html';  /* VER ESTE HTML */
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
        document.getElementById('signOut2').addEventListener('click', function(event) {
            event.preventDefault(); // Evita que el enlace navegue a otra página
            UnoServerLess.signOut();
            console.log('Usuario cerrado sesión');
            location.reload();
            
        });
    }


    var authToken;
    UnoServerLess.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
           // window.location.href = "signin.html";
        }
        
    }).catch(function handleTokenError(error) {
        alert(error);
       // window.location.href = "signin.html";
    });


    document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario por defecto
    var cognitoUser = userPool.getCurrentUser();
    
    
    // Capturar los datos del formulario
    const name = document.getElementById('nameInputProject').value;
    const location = document.getElementById('provinciaInputProject').value;
    const title = document.getElementById('titleInputProject').value;
    const category = document.getElementById('categoryInputProject').value;
    const hours = document.getElementById('durationInputProject').value;
    const description = document.getElementById('descriptionInputProject').value;


    // Crear el objeto JSON con el formato especificado
    const data = {
        User: cognitoUser.username,
        Url: "https://petepua.com/wp-content/uploads/2022/12/Refugio-Patitas-de-San-Vicente-logo.-heroes-sin-capa.--150x150.jpg",
        ProName: name,
        Ubi: location,
        Title: title,
        HxS: parseInt(hours),
        Type: category,
        Desc: description
    };
   
    // Enviar los datos al API Gateway de Amazon
    fetch('https://6eqz1f0191.execute-api.sa-east-1.amazonaws.com/dev/Voluntario', {
        method: 'POST',
        headers: {
            Authorization: authToken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });

});





}(jQuery));
