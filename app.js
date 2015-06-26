var koa		= require('koa'),
	monk	= require('monk'),
	wrap	= require('co-monk'),
	db		= monk('localhost/mapsit-production'),
	users	= wrap(db.get('users2')),
	app		= koa();

// logger
app.use(function *(next){
	var start = new Date();
	yield next;
	var ms = new Date() - start;
	console.log('%s %s - %s', this.method, this.url, ms);
});

function* findDupes() {
	var queue, user, x, y, completed, partials, key;
	
	queue = yield users.find({username: ''});

	for (x = 0; x < queue.length; x++) {
		user = {};
		
		partials = yield users.find({phone: queue[x].phone});

		for (y = 0; y < partials.length; y++) {
			for (key in partials[y]) {
				if (partials[y].key.length > 0) {
					user.key = partials[y].key;
				}
			}
			yield users.remove(partials[y]);
		}
		yield users.remove(queue[x]);

		yield users.insert(user);
		completed = queue[x].phone;
	}

	console.log(completed);
}

app.listen(3000);
yield findDupes();
