// Initialize Firebase
var player = {
	name: '',
	pick: 3,
	wins: 0,
	loses: 0,
	ties: 0,
};

const rpsMapping = ['rock', 'paper', 'scissors'];

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
var hasPlyPicked = false;
var ply = 0;


$(document).ready(function (event) {
	$('button').on('click', function (event) {
		player.name = $('#name')
			.val()
			.trim();
		event.preventDefault();

		dbPlayers.once('value', function (snap) {
			if (snap.hasChild('player1') && snap.hasChild('player2')) {
				alert('There are players playing. Try again later');
				$('.form-inline').hide();
			} else if (!snap.hasChild('player1')) {
				ply = 1;
			} else if (!snap.hasChild('player2')) {
				ply = 2;
			}
			console.log(ply);

			//on child added get name to display
			dbPlayers
				.child(`player${3 - ply}`)
				.on('child_added', function (snap) {
					console.log(snap.val());
					if (snap.key === 'name')
						$(`#ply${3 - ply}Name`).html(snap.val());

				}, function (errorObject) {
					console.log("Errors handled: " + errorObject.code);
				});

			dbPlayers
				.child(`player${3 - ply}`)
				.on('child_changed', function (snap) {
					console.log(snap.val());

				}, function (errorObject) {
					console.log("Errors handled: " + errorObject.code);
				});

			plyRef += ply;

			dbPlayers.child(plyRef).set({
				name: player.name,
				pick: player.pick,
				wins: player.wins,
				loses: player.loses,
				ties: player.ties,
			});

			$('.container').attr('style', 'dispaly:block');
			$(`#ply${ply}Name`).html(player.name);
			$(`.ply${ply}`).addClass('pulse');

			ply === 1 ? $('.ply2').fadeTo(500, 0.5) : $('.ply1').fadeTo(500, 0.5);

			$(`.image${ply}`).on('click', function (r) {
				if (!hasPlyPicked) {
					hasPlyPicked = true;
					console.log(r.target);
					$(`#ply${ply}pick`).append($(r.target).clone());
					$(`.ply${ply}`).removeClass('pulse');

					$(`.ply${3 - ply}`).addClass('pulse');
					$(`.ply${ply}`).fadeTo(1000, 0.3);

					var updatePick = { pick: $(r.target).attr('value') };
					// console.log(pick);

					dbPlayers.child(plyRef).update(updatePick);
				}
				else {

				}
			});
		});
	});
});

window.onbeforeunload = function () {
	dbPlayers.child(plyRef).remove();
};
