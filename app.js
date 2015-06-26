'use strict'

var koa		= require('koa'),
	monk	= require('monk'),
	wrap	= require('co-monk'),
	db		= monk('localhost/mapsit-production'),
	users	= wrap(db.get('users2')),
	app		= koa();

function* cleanDB() {
	var queue, user, x, y, completed, partials, key;

	console.log('Finding Dupes...');
	queue = yield users.find({});

	for (x = 0; x < queue.length; x++) {
		if ((queue[x].username !== undefined) && (queue[x].username !== '')) {
			continue;
		}
		user = {};
		partials = yield users.find({phone: queue[x].phone});

		console.log(queue[x].phone);

		for (y = 0; y < partials.length; y++) {
			for (key in partials[y]) {
				if (partials[y][key] === null) {
					continue;
				}

				if (partials[y][key].length > 0) {
					user.key = partials[y].key;
				}
			}
			yield users.remove(partials[y]);
		}

		yield users.remove(queue[x]);

		yield users.insert(user);
		completed = queue[x].phone;
	}

	console.log('Completed: ', completed.length);
}

app.use(function *(){
  	yield cleanDB();
});

app.listen(8123);
