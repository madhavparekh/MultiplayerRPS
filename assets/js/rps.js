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
var oppPicked = false;
var ply = 0;
var gameResult = '';
$('.alert').hide();

$(document).ready(function (event) {
	$('button').on('click', function (event) {
		player.name = $('#name').val().trim();
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

			//on child added get name to display
			dbPlayers.child(`player${3 - ply}`).on('child_added', function (snap) {
					// console.log(snap.val());
					if (snap.key === 'name') $(`#ply${3 - ply}Name`).html(snap.val());
				},
				function (errorObject) {
					console.log('Errors handled: ' + errorObject.code);
				}
			);

			//check if other player picked?
			var ref = `player${3 - ply}/pick`;

			dbPlayers.child(`player${3 - ply}/pick`).on('value', function (snap) {
					console.log('line 59 ' + snap.val());
					if (snap.val() < 3 && snap.val() >= 0 && snap.val() != null) {
						console.log('line 61 ' + snap.val());
						oppPicked = true;
						if (hasPlyPicked) {
							console.log('hasPicked');
							console.log('checking winner from line 64');
							dbPlayers.child(plyRef).update(checkWinner(snap.val()));
						}
						displayOppPick();

					}
				},
				function (errorObject) {
					console.log('Errors handled: ' + errorObject.code);
				}
			);

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

					$(`#ply${ply}pick`).append(`Player ${ply}`, $(r.target).clone());
					$(`.ply${ply}`).removeClass('pulse');

					$(`.ply${3 - ply}`).addClass('pulse');
					$(`.ply${ply}`).fadeTo(1000, 0.3);

					var updatePick = {
						pick: $(r.target).attr('value')
					};
					player.pick = $(r.target).attr('value');

					dbPlayers.child(plyRef).update(updatePick);

					if (oppPicked) {
						dbPlayers.child(`player${3 - ply}/pick`).once('value', function (snap) {
							console.log('line 114 ' + snap.val());
							if (snap.val() != 3) {
								console.log('checking winner from line 116');
								dbPlayers.child(plyRef).update(checkWinner(snap.val()));
							}

						});

						displayOppPick();
					}

				}
			});
		});
	});


});


function displayOppPick() {
	if (hasPlyPicked && oppPicked) {

		dbPlayers.child(`player${3 - ply}/pick`).once('value', function (snap) {

			$(`#ply${3-ply}pick`).append(`Player ${3-ply}`, $(`#${snap.val()}`).clone());

			$('#alertmsg').html(gameResult);

			setTimeout(e => {
				$('.alert').show();
			}, 1000)
			setTimeout(e => {
				resetGame();
			}, 3000)
		}, function (errObj) {
			console.log(errObj.code);
		});
	}
}

function resetGame() {
	hasPlyPicked = false;
	oppPicked = false;
	$('#ply1pick').empty();
	$('#ply2pick').empty();
	$(`#ply${ply}Name`).html(player.name);
	$(`.ply${ply}`).addClass('pulse');
	$(`.ply${ply}`).fadeTo(500, 1.0);
	$(`.ply${3 - ply}`).removeClass('pulse');
	$('.alert').hide();

	var updatePick = {
		pick: 3
	};

	dbPlayers.child(plyRef).update(updatePick);


	ply === 1 ? $('.ply2').fadeTo(500, 0.5) : $('.ply1').fadeTo(500, 0.5);

}

function checkWinner(oppPick) {
	var obj = {};
	console.log(`Player: ${player.pick} - Opp: ${oppPick}`);
	oppPick = parseInt(oppPick);
	plyPick = parseInt(player.pick);

	if (plyPick === oppPick + 2) {
		obj = {
			loses: ++player.loses
		};
		gameResult = 'You Lose';
		console.log('from: OR - PS');
	} else if (plyPick + 2 === oppPick) {
		obj = {
			wins: ++player.wins
		};
		console.log('from: OS - PR');
		gameResult = 'You Win';
	} else if (plyPick === oppPick) {
		obj = {
			ties: ++player.ties
		};
		console.log('from: tie');
		gameResult = 'Game Tied';
	} else if (plyPick < oppPick) {
		obj = {
			loses: ++player.loses
		}
		console.log('from: O');
		gameResult = 'You Lose';
	} else if (plyPick > oppPick) {
		obj = {
			wins: ++player.wins
		};
		gameResult = 'You Win';
		console.log('from: P');
	}
	return obj;
}

window.onbeforeunload = function () {
	dbPlayers.child(plyRef).remove();
};