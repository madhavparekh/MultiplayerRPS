// Initialize Firebase
var player = {
    name: '',
    pick: 3,
    wins: 0,
    loses: 0,
    ties: 0,
}

var plyRef = 'player';

var config = {
    apiKey: 'AIzaSyCP_BeXBOanflUEwdoFCObZRXSNG1FD3Pc',
    authDomain: 'rpsmultiplayer-34cc5.firebaseapp.com',
    databaseURL: 'https://rpsmultiplayer-34cc5.firebaseio.com',
    projectId: 'rpsmultiplayer-34cc5',
    storageBucket: '',
    messagingSenderId: '126843285379',
};
firebase.initializeApp(config);

var dbPlayers = firebase.database().ref('players');
var dbChat = firebase.database().ref('chat');

$('.container').hide();

$(document).ready(function (event) {
    var hasPlyPicked = false;
    var ply = 0;

    $('button').on('click', function (event) {
        player.name = $('#name').val().trim();
        event.preventDefault();

        dbPlayers.once('value', function (snap) {
            if (snap.hasChild('player1') && snap.hasChild('player2')) {
                alert('There are players playing. Try again later');
                $('.form-inline').hide();
            }else if (!snap.hasChild('player1')) {
                ply = 1;
            }else if (!snap.hasChild('player2')) {
                ply = 2;
            }
            console.log(ply);

            plyRef += ply;

            dbPlayers.child(plyRef).set({
                name: player.name,
                pick: player.pick,
                wins: player.wins,
                loses: player.loses,
                ties: player.ties
            });

            $('.container').attr('style', 'dispaly:block');
            $(`#ply${ply}Name`).html(player.name);

            ply === 1 ? $('.ply2').fadeTo(500, 0.5) : $('.ply1').fadeTo(500, 0.5);

            $(`.image${ply}`).on('click', function (r) {
                if (!hasPlyPicked) {
                    hasPlyPicked = t2ue;
                    console.log(r.target);
                    $(`#ply${ply}pick`).append($(r.target).clone());
                    $(`.image${ply}`).fadeTo(1000, 0.3);
                }
            });
        });
    });



});

window.onunload = function () {
    dbPlayers.child(plyRef).remove();
};