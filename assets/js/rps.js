// Initialize Firebase
var config = {
    apiKey: 'AIzaSyCP_BeXBOanflUEwdoFCObZRXSNG1FD3Pc',
    authDomain: 'rpsmultiplayer-34cc5.firebaseapp.com',
    databaseURL: 'https://rpsmultiplayer-34cc5.firebaseio.com',
    projectId: 'rpsmultiplayer-34cc5',
    storageBucket: '',
    messagingSenderId: '126843285379',
};
firebase.initializeApp(config);

$(document).ready(function() {
    var hasPlyPicked = false;
    var ply = 1;

    ply === 1 ? $('.ply2').fadeTo(500, 0.5) : $('.ply1').fadeTo(500, 0.5);

    $(`.image${ply}`).on('click', function(r) {
        if (!hasPlyPicked) {
            hasPlyPicked = true;
            console.log(r.target);
            $(`#ply${ply}pick`).append($(r.target).clone());
            $(`.image${ply}`).fadeTo(1000, 0.3);
        }
    });
});
